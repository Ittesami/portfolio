// Records which images are in public/photos so the deployed site knows about
// them even where the server can't read the public folder (e.g. Vercel).
// Runs automatically before `npm run build`.
import fs from "node:fs/promises";
import path from "node:path";

const dir = path.join(process.cwd(), "public", "photos");
const out = path.join(process.cwd(), "lib", "photos-manifest.json");
const IMAGE = /\.(jpe?g|png|webp|avif|gif)$/i;

let files = [];
try {
  files = (await fs.readdir(dir, { withFileTypes: true }))
    .filter((e) => e.isFile() && IMAGE.test(e.name))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }));
} catch {}

await fs.writeFile(out, JSON.stringify({ files }, null, 2) + "\n");
console.log(`photos-manifest: ${files.length} image(s) in public/photos`);
