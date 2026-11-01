import { cache } from "react";
import { getDb } from "./mongodb";
import { profile as fallback } from "./profile-data";

// Site content: the database copy when available, otherwise the built-in defaults.
export const getProfile = cache(async () => {
  try {
    const db = await getDb();
    if (db) {
      const doc = await db.collection("profile").findOne({ _id: "main" });
      if (doc) {
        const { _id, ...fields } = doc;
        return { ...fallback, ...fields };
      }
    }
  } catch (err) {
    console.error("[profile] falling back to built-in content:", err.message);
  }
  return fallback;
});
