// YouTube helpers for exercise demo videos.

// Pulls the 11-character video id out of any common YouTube link:
// watch?v=, youtu.be/, /shorts/, /embed/, /live/, or a bare id.
export function parseYouTubeId(input) {
  const s = String(input ?? "").trim();
  if (/^[\w-]{11}$/.test(s)) return s;
  let url;
  try {
    url = new URL(s.startsWith("http") ? s : `https://${s}`);
  } catch {
    return null;
  }
  const host = url.hostname.replace(/^(www\.|m\.|music\.)/, "");
  if (host === "youtu.be") return /^[\w-]{11}$/.test(url.pathname.slice(1, 12)) ? url.pathname.slice(1, 12) : null;
  if (host !== "youtube.com" && host !== "youtube-nocookie.com") return null;
  const v = url.searchParams.get("v");
  if (v && /^[\w-]{11}$/.test(v)) return v;
  const m = /^\/(?:shorts|embed|live|v)\/([\w-]{11})/.exec(url.pathname);
  return m ? m[1] : null;
}

// Checks a video with YouTube's oEmbed endpoint: it only answers for videos
// that exist and allow embedding. Returns { id, title, channel } or null.
export async function fetchVideoInfo(id) {
  const res = await fetch(
    `https://www.youtube.com/oembed?format=json&url=${encodeURIComponent(`https://www.youtube.com/watch?v=${id}`)}`,
    { cache: "no-store" },
  );
  if (!res.ok) return null;
  const j = await res.json();
  return { id, title: String(j.title ?? "").trim(), channel: String(j.author_name ?? "").trim() };
}
