import fs from "node:fs/promises";
import path from "node:path";
import { cache } from "react";
import { GridFSBucket } from "mongodb";
import { getDb } from "./mongodb";
import manifest from "./photos-manifest.json";

// Photos come from two places:
//   1. Files in public/photos (committed with the code).
//        avatar.jpg / me.jpg  -> profile picture, not shown in the gallery
//        01-nepal-trek.jpg    -> default title "Nepal trek" (leading numbers set order)
//   2. Uploads from the admin panel, stored in MongoDB GridFS (bucket "photoFiles")
//      and served from /api/photo-file/<id>.
//
// The `photos` collection holds details for both, keyed by file name (folder photos)
// or "u_<id>" (uploads): { title, date: "YYYY-MM-DD", description, hidden, avatar }.
// All details are optional. Order: dated photos newest first, then undated uploads
// newest first, then folder photos by file name.

export const PHOTO_DIR = path.join(process.cwd(), "public", "photos");
export const PHOTO_BUCKET = "photoFiles";
const IMAGE = /\.(jpe?g|png|webp|avif|gif)$/i;
const CAMERA_NAME = /^(img|dsc|dscn|dcim|pxl|photo|image|whatsapp|screenshot)[\s_-]?\d/i;

export function photoBucket(db) {
  return new GridFSBucket(db, { bucketName: PHOTO_BUCKET });
}

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

const isAvatarFile = (file) => /^(avatar|me)$/i.test(file.replace(IMAGE, ""));

async function getPhotoDocs() {
  try {
    const db = await getDb();
    if (!db) return [];
    return await db.collection("photos").find({}).toArray();
  } catch (err) {
    console.error("[photos] details unavailable:", err.message);
    return [];
  }
}

export function formatPhotoDate(date) {
  if (!date) return "";
  const d = new Date(`${date}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}

function build({ id, kind, file = "", src, defaultTitle, doc = {}, avatarFile = false }) {
  const title = (doc.title ?? "").trim() || defaultTitle;
  return {
    id,
    kind,
    file,
    src,
    title,
    date: doc.date ?? "",
    description: (doc.description ?? "").trim(),
    hidden: Boolean(doc.hidden),
    avatar: Boolean(doc.avatar),
    avatarFile,
    alt: title || "Photo by Ittehad Rahman",
    caption: title,
    createdAt: doc.createdAt ? new Date(doc.createdAt).getTime() : 0,
  };
}

function order(a, b) {
  if (a.date || b.date) {
    if (!a.date) return 1;
    if (!b.date) return -1;
    if (a.date !== b.date) return b.date.localeCompare(a.date);
  }
  if (a.createdAt !== b.createdAt) return b.createdAt - a.createdAt;
  return a.file.localeCompare(b.file, undefined, { numeric: true, sensitivity: "base" });
}

// Every photo, including hidden ones. Used by the admin panel.
export const getAllPhotos = cache(async () => {
  const [files, docs] = await Promise.all([listPhotoFiles(), getPhotoDocs()]);
  const byId = new Map(docs.map((d) => [d._id, d]));
  const items = files.map((file) =>
    build({
      id: file,
      kind: "folder",
      file,
      src: `/photos/${encodeURIComponent(file)}`,
      defaultTitle: titleFromName(file),
      doc: byId.get(file),
      avatarFile: isAvatarFile(file),
    }),
  );
  for (const doc of docs) {
    if (doc.kind === "upload") {
      items.push(build({ id: doc._id, kind: "upload", src: `/api/photo-file/${doc._id}`, defaultTitle: "", doc }));
    }
  }
  return items.sort(order);
});

// What visitors see: visible photos plus the profile picture.
export const getPhotos = cache(async () => {
  const all = await getAllPhotos();
  const avatar = (all.find((p) => p.avatar) ?? all.find((p) => p.avatarFile))?.src ?? "";
  const photos = all
    .filter((p) => !p.hidden && !p.avatarFile)
    .map(({ id, src, title, date, description, alt, caption }) => ({ id, src, title, date, description, alt, caption }));
  return { avatar, photos };
});
