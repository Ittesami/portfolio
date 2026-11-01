// Prayer tracking.
//   settings  collection, _id "prayer": { city, country, latitude, longitude, timezone, method, school }
//   prayers   collection, _id "YYYY-MM-DD": { fajr, dhuhr, asr, maghrib, isha }
// Each prayer's status is "ontime", "late", "missed", or absent (not logged).
// On Fridays the dhuhr slot is shown as Jumu'ah.
// Times come from the Aladhan API (aladhan.com) by coordinates, cached for a day per date and
// location. The city is turned into coordinates once, when settings are saved.

export const PRAYERS = ["fajr", "dhuhr", "asr", "maghrib", "isha"];
export const STATUSES = ["ontime", "late", "missed"];

export const METHODS = [
  { id: 15, name: "Moonsighting Committee Worldwide" },
  { id: 3, name: "Muslim World League" },
  { id: 2, name: "ISNA (North America)" },
  { id: 1, name: "University of Islamic Sciences, Karachi" },
  { id: 4, name: "Umm Al-Qura, Makkah" },
  { id: 5, name: "Egyptian General Authority of Survey" },
  { id: 16, name: "Dubai" },
];

export const DEFAULT_SETTINGS = {
  city: "Bristol",
  country: "United Kingdom",
  latitude: 51.45523,
  longitude: -2.59665,
  timezone: "Europe/London",
  method: 15,
  school: 1,
};

// Finds a city's coordinates with Open-Meteo's free geocoder. Returns null when
// nothing matches, so typos are caught instead of silently giving wrong times.
export async function geocodeCity(city, country) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=10&language=en&format=json`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error("Couldn't reach the location service. Try again.");
  const results = (await res.json()).results ?? [];
  const want = country.trim().toLowerCase();
  const match =
    results.find((r) => r.country?.toLowerCase() === want || r.country_code?.toLowerCase() === want) ??
    (want ? null : results[0]);
  if (!match) return null;
  return {
    city: match.name,
    country: match.country,
    latitude: match.latitude,
    longitude: match.longitude,
    timezone: match.timezone,
  };
}

export async function getPrayerSettings(db) {
  const doc = await db.collection("settings").findOne({ _id: "prayer" });
  const { _id, ...rest } = doc ?? {};
  return { ...DEFAULT_SETTINGS, ...rest };
}

export function isFriday(date) {
  return new Date(`${date}T12:00:00Z`).getUTCDay() === 5;
}

export function addDays(date, n) {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export async function fetchTimings(date, s) {
  const [y, m, d] = date.split("-");
  const url =
    `https://api.aladhan.com/v1/timings/${d}-${m}-${y}` +
    `?latitude=${s.latitude}&longitude=${s.longitude}&timezonestring=${encodeURIComponent(s.timezone)}` +
    `&method=${s.method}&school=${s.school}`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`Prayer times service returned ${res.status}`);
  const json = await res.json();
  if (json.code !== 200) throw new Error("Couldn't find prayer times for that location.");
  const t = json.data.timings;
  const clean = (v) => String(v).slice(0, 5); // drop any " (BST)" suffix
  const h = json.data.date.hijri;
  return {
    times: {
      fajr: clean(t.Fajr),
      sunrise: clean(t.Sunrise),
      dhuhr: clean(t.Dhuhr),
      asr: clean(t.Asr),
      maghrib: clean(t.Maghrib),
      isha: clean(t.Isha),
    },
    timezone: json.data.meta.timezone,
    hijri: `${h.day} ${h.month.en} ${h.year} AH`,
  };
}

export function cleanLog(doc) {
  const out = {};
  for (const p of PRAYERS) if (STATUSES.includes(doc?.[p])) out[p] = doc[p];
  return out;
}
