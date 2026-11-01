import { cache } from "react";
import { getDb } from "./mongodb";
import { getAllPhotos, getAlbumPhotos } from "./photos";
import { countryName, isCountryCode } from "./world";
import { slugify } from "./exercise-library";

// Travel albums. Collection `albums`:
//   { _id: slug, title, countryCode, place, startDate, endDate, description, coverPhotoId, createdAt }
// Photos join an album through their `albumId` (see lib/photos.js).
// The travel map shows profile.travel.visited plus every album's country.

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export function parseAlbum(body, partial = false) {
  const data = {};
  const has = (k) => !partial || k in body;
  if (has("title")) {
    data.title = String(body.title ?? "").trim();
    if (!data.title || data.title.length > 100) return { error: "Give the trip a title (up to 100 characters)." };
  }
  if (has("countryCode")) {
    data.countryCode = String(body.countryCode ?? "");
    if (!isCountryCode(data.countryCode)) return { error: "Pick a country." };
  }
  if (has("place")) {
    data.place = String(body.place ?? "").trim();
    if (data.place.length > 100) return { error: "Keep the place under 100 characters." };
  }
  for (const k of ["startDate", "endDate"]) {
    if (has(k)) {
      data[k] = String(body[k] ?? "").trim();
      if (data[k] && !DATE.test(data[k])) return { error: "Dates must be YYYY-MM-DD." };
    }
  }
  if (data.startDate && data.endDate && data.endDate < data.startDate)
    return { error: "The trip can't end before it starts." };
  if (has("description")) {
    data.description = String(body.description ?? "").trim();
    if (data.description.length > 5000) return { error: "Keep the description under 5000 characters." };
  }
  if ("coverPhotoId" in body) data.coverPhotoId = body.coverPhotoId ? String(body.coverPhotoId) : null;
  return { data };
}

export async function uniqueAlbumSlug(db, title) {
  const base = slugify(title) || "trip";
  let slug = base;
  for (let i = 2; await db.collection("albums").findOne({ _id: slug }); i++) slug = `${base}-${i}`;
  return slug;
}

export function formatTripDates(start, end) {
  const fmt = (d, opts) => new Date(`${d}T00:00:00Z`).toLocaleDateString("en-GB", { ...opts, timeZone: "UTC" });
  if (!start) return "";
  if (!end || end === start) return fmt(start, { day: "numeric", month: "long", year: "numeric" });
  const sameYear = start.slice(0, 4) === end.slice(0, 4);
  const sameMonth = sameYear && start.slice(5, 7) === end.slice(5, 7);
  if (sameMonth) return `${fmt(start, { day: "numeric" })}–${fmt(end, { day: "numeric", month: "long", year: "numeric" })}`;
  if (sameYear) return `${fmt(start, { day: "numeric", month: "short" })} – ${fmt(end, { day: "numeric", month: "short", year: "numeric" })}`;
  return `${fmt(start, { day: "numeric", month: "short", year: "numeric" })} – ${fmt(end, { day: "numeric", month: "short", year: "numeric" })}`;
}

async function albumDocs() {
  try {
    const db = await getDb();
    if (!db) return [];
    return await db.collection("albums").find({}).toArray();
  } catch (err) {
    console.error("[travel] albums unavailable:", err.message);
    return [];
  }
}

function toAlbum(doc, photos) {
  const visible = photos.filter((p) => p.albumId === doc._id && !p.hidden);
  const cover = visible.find((p) => p.id === doc.coverPhotoId) ?? visible[0] ?? null;
  return {
    slug: doc._id,
    title: doc.title,
    countryCode: doc.countryCode,
    country: countryName(doc.countryCode),
    place: doc.place ?? "",
    startDate: doc.startDate ?? "",
    endDate: doc.endDate ?? "",
    dates: formatTripDates(doc.startDate, doc.endDate),
    description: doc.description ?? "",
    coverPhotoId: doc.coverPhotoId ?? null,
    cover: cover ? { src: cover.src, alt: cover.alt } : null,
    photoCount: visible.length,
  };
}

// All albums, newest trip first (undated ones last).
export const getAlbums = cache(async () => {
  const [docs, photos] = await Promise.all([albumDocs(), getAllPhotos()]);
  return docs
    .map((d) => toAlbum(d, photos))
    .sort((a, b) => (b.startDate || "0").localeCompare(a.startDate || "0") || a.title.localeCompare(b.title));
});

export async function getAlbum(slug) {
  const album = (await getAlbums()).find((a) => a.slug === slug);
  if (!album) return null;
  return { ...album, photos: await getAlbumPhotos(slug) };
}

// Country codes for the map: listed in the profile, plus album countries.
export function visitedCountries(profile, albums) {
  const codes = new Set(profile.travel?.visited ?? []);
  for (const a of albums) if (a.countryCode) codes.add(a.countryCode);
  if (profile.travel?.home) codes.delete(profile.travel.home);
  return [...codes];
}
