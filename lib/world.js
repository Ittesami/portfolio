import { geoCentroid, geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import world110 from "world-atlas/countries-110m.json" with { type: "json" };
import world50 from "world-atlas/countries-50m.json" with { type: "json" };

// World map for the travel page, rendered to SVG on the server.
// Shapes come from the light 110m Natural Earth data. The detailed 50m data is
// only used for the full country list and to place a dot on countries too
// small to see (or missing) at 110m, like the Maldives.
// Countries are identified by ISO 3166-1 numeric codes, e.g. "826" = United Kingdom.

const WIDTH = 960;
const HEIGHT = 470;
const ANTARCTICA = "010";
const SMALL_AREA = 60; // px²: below this a country also gets a dot

const shapes = feature(world110, world110.objects.countries).features.filter((f) => f.id !== ANTARCTICA);
const detailed = new Map(feature(world50, world50.objects.countries).features.map((f) => [f.id, f]));

const projection = geoNaturalEarth1().fitSize([WIDTH, HEIGHT], { type: "FeatureCollection", features: shapes });
const path = geoPath(projection).digits(0); // whole pixels: plenty at this size, and much smaller

// Every country by name, for pickers in the admin panel.
export const COUNTRIES = [...detailed.values()]
  .filter((f) => f.id && f.id !== ANTARCTICA)
  .map((f) => ({ code: f.id, name: f.properties.name }))
  .sort((a, b) => a.name.localeCompare(b.name));

const NAMES = new Map(COUNTRIES.map((c) => [c.code, c.name]));
export const countryName = (code) => NAMES.get(code) ?? "";
export const isCountryCode = (code) => NAMES.has(code);

// Returns SVG path data with each country's state, plus dots for small countries.
export function renderMap({ visited = [], home = "" }) {
  const visitedSet = new Set(visited);
  const state = (code) => (code === home ? "home" : visitedSet.has(code) ? "visited" : "");

  const countries = shapes.map((f) => ({
    code: f.id,
    name: f.properties.name,
    d: path(f),
    state: state(f.id),
  }));

  const drawn = new Map(shapes.map((f) => [f.id, path.area(f)]));
  const dots = [...visitedSet, ...(home ? [home] : [])]
    .filter((code) => !drawn.has(code) || drawn.get(code) < SMALL_AREA)
    .map((code) => {
      const f = detailed.get(code);
      if (!f) return null;
      const [x, y] = projection(geoCentroid(f));
      return { code, name: countryName(code), x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10, state: state(code) };
    })
    .filter(Boolean);

  return { width: WIDTH, height: HEIGHT, countries, dots };
}
