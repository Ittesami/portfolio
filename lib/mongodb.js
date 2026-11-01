import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI ?? "";

// Treat an empty value or the .env.example placeholder as "not connected yet".
export function isDbConfigured() {
  return uri.length > 0 && !uri.includes("<");
}

// Returns the database handle, or null while MongoDB isn't configured.
// The client promise is cached on globalThis so dev hot reloads and
// serverless warm starts reuse one connection pool.
export async function getDb() {
  if (!isDbConfigured()) return null;
  if (!globalThis._mongoClientPromise) {
    globalThis._mongoClientPromise = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 })
      .connect()
      .catch((err) => {
        globalThis._mongoClientPromise = undefined;
        throw err;
      });
  }
  // The driver's serverSelectionTimeoutMS doesn't cover DNS lookups, which can hang
  // for 30s+ on some networks, so cap the wait here and let callers fall back.
  const client = await withTimeout(globalThis._mongoClientPromise, 8000);
  return client.db(process.env.MONGODB_DB || "portfolio");
}

// For admin features that can't work without the database.
export async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("Database isn't configured.");
  return db;
}

function withTimeout(promise, ms) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`MongoDB connection timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}
