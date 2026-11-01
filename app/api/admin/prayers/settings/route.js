import { NextResponse } from "next/server";
import { requireDb } from "@/lib/mongodb";
import { isAdmin, unauthorised } from "@/lib/auth";
import { METHODS, geocodeCity } from "@/lib/prayers";

// PUT /api/admin/prayers/settings  { city, country, method, school }
// Looks the city up to get its coordinates and time zone before saving.
export async function PUT(request) {
  if (!isAdmin(request)) return unauthorised();
  const body = await request.json().catch(() => ({}));
  const city = String(body.city ?? "").trim();
  const country = String(body.country ?? "").trim();
  const method = Number(body.method);
  const school = Number(body.school) === 1 ? 1 : 0;

  if (!city || !country || city.length > 80 || country.length > 80)
    return NextResponse.json({ error: "Enter a city and country." }, { status: 400 });
  if (!METHODS.some((m) => m.id === method))
    return NextResponse.json({ error: "Pick a calculation method." }, { status: 400 });

  let place;
  try {
    place = await geocodeCity(city, country);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
  if (!place)
    return NextResponse.json(
      { error: `Couldn't find ${city} in ${country}. Check the spelling, or use the country's full English name.` },
      { status: 400 },
    );

  const settings = { ...place, method, school };
  await (await requireDb()).collection("settings").updateOne({ _id: "prayer" }, { $set: settings }, { upsert: true });
  return NextResponse.json({ settings });
}
