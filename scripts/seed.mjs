// Sets up the `portfolio` database with every collection the API uses:
//   profile  - site content (one document, _id "main"), read by GET /api/profile and the page
//   messages - contact form submissions, written by POST /api/contact
//   photos   - photo details (title/date/description/hidden/avatar) and uploads (files in GridFS photoFiles)
//   todos    - admin to-do list
//   prayers  - daily prayer log, _id "YYYY-MM-DD"
//   settings - admin settings: _id "prayer" (prayer location/method), _id "fitness" (fitness profile)
//   exercises, workouts, bodyweights, fitnessPlans - fitness tracker (built-in exercises added if missing)
// Usage: put the real password in .env.local, then `npm run seed`. Safe to re-run.
import { MongoClient } from "mongodb";
import { profile } from "../lib/profile-data.js";
import { EXERCISES } from "../lib/exercise-library.js";

const uri = process.env.MONGODB_URI;
if (!uri || uri.includes("<")) {
  console.error("Set MONGODB_URI in .env.local first (replace <db_password> with the real password).");
  process.exit(1);
}

const client = new MongoClient(uri);
try {
  await client.connect();
  const db = client.db(process.env.MONGODB_DB || "portfolio");

  const existing = new Set((await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name));
  for (const name of ["profile", "messages", "photos", "todos", "prayers", "settings", "exercises", "workouts", "bodyweights", "fitnessPlans"]) {
    if (!existing.has(name)) await db.createCollection(name);
  }

  await db.collection("profile").replaceOne({ _id: "main" }, profile, { upsert: true });
  await db.collection("messages").createIndex({ createdAt: -1 });
  await db.collection("todos").createIndex({ done: 1, dueDate: 1 });
  await db.collection("workouts").createIndex({ date: -1 });
  // ensureExerciseLibrary: adds built-in exercises that are missing, never overwrites yours
  await db.collection("exercises").bulkWrite(
    EXERCISES.map((e) => ({
      updateOne: { filter: { _id: e._id }, update: { $setOnInsert: { ...e, createdAt: new Date() } }, upsert: true },
    })),
  );

  const names = (await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name).sort();
  console.log(`Database "${db.databaseName}" ready. Collections: ${names.join(", ")}`);
} finally {
  await client.close();
}
