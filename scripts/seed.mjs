// Sets up the `portfolio` database with every collection the API uses:
//   profile  - site content (one document, _id "main"), read by GET /api/profile and the page
//   messages - contact form submissions, written by POST /api/contact
//   photos   - optional title/date/description per photo file, written at /admin/photos
// Usage: put the real password in .env.local, then `npm run seed`. Safe to re-run.
import { MongoClient } from "mongodb";
import { profile } from "../lib/profile-data.js";

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
  for (const name of ["profile", "messages", "photos"]) {
    if (!existing.has(name)) await db.createCollection(name);
  }

  await db.collection("profile").replaceOne({ _id: "main" }, profile, { upsert: true });
  await db.collection("messages").createIndex({ createdAt: -1 });

  const names = (await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name).sort();
  console.log(`Database "${db.databaseName}" ready. Collections: ${names.join(", ")}`);
} finally {
  await client.close();
}
