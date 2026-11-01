import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { getDb } from "./mongodb";
import manifest from "./photos-manifest.json";

// Photos live in public/photos. Drop images in and they appear on the site:
//   avatar.jpg (or me.jpg)        -> profile picture, not shown in the gallery
//   01-nepal-trek.jpg             -> gallery photo, default title "Nepal trek"
//   IMG_2041.jpg                  -> gallery photo with no default title
// Leading numbers set the order and are dropped from the title.
//
// Title, date and description are optional and come from the MongoDB `photos`
// collection ({ _id: "<file name>", title, date: "YYYY-MM-DD", description }),
// edited at /admin/photos or through PUT /api/photos.

export const PHOTO_DIR = path.join(process.cwd(), "public", "photos");
const IMAGE = /\.(jpe?g|png|webp|avif|gif)$/i;
const CAMERA_NAME = /^(img|dsc|dscn|dcim|pxl|photo|image|whatsapp|screenshot)[\s_-]?\d/i;

export async function readPhotoDir() {
  const entries = await fs.readdir(PHOTO_DIR, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && IMAGE.test(e.name))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
}

// Reads the folder live (dev, build, any Node host). Where the folder isn't
// available at runtime (Vercel functions), falls back to the list recorded at
// build time by scripts/photos-manifest.mjs.
export async function listPhotoFiles() {
  try {
    return await readPhotoDir();
  } catch {
    return manifest.files ?? [];
  }
}

function titleFromName(file) {
  const base = file.replace(IMAGE, "");
  const label = base
    .replace(/^\d+[\s._-]*/, "")
    .replace(/[_-]+/g, " ")
    .trim();
  return !label || CAMERA_NAME.test(base) ? "" : label[0].toUpperCase() + label.slice(1);
}

const isAvatar = (file) => /^(avatar|me)$/i.test(file.replace(IMAGE, ""));

async function getPhotoMeta() {
  try {
    const db = await getDb();
    if (!db) return new Map();
    const docs = await db.collection("photos").find({}).toArray();
    return new Map(docs.map((d) => [d._id, d]));
  } catch (err) {
    console.error("[photos] metadata unavailable:", err.message);
    return new Map();
  }
}

export function formatPhotoDate(date) {
  if (!date) return "";
  const d = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

export const getPhotos = cache(async () => {
  const [files, meta] = await Promise.all([listPhotoFiles(), getPhotoMeta()]);
  let avatar = "";
  const photos = [];
  for (const file of files) {
    const src = `/photos/${encodeURIComponent(file)}`;
    if (isAvatar(file)) {
      avatar = src;
      continue;
    }
    const m = meta.get(file) ?? {};
    const title = (m.title ?? "").trim() || titleFromName(file);
    photos.push({
      file,
      src,
      title,
      date: m.date ?? "",
      description: (m.description ?? "").trim(),
      alt: title || "Photo by Ittehad Rahman",
      // Short label used on the home page tiles.
      caption: title,
    });
  }
  return { avatar, photos };
});
