const DATE = /^\d{4}-\d{2}-\d{2}$/;

// Validates photo details. Only fields present in the body are returned,
// so a partial update leaves the rest alone. Returns { data } or { error }.
export function parsePhotoDetails(body, partial = true) {
  const data = {};
  const has = (k) => !partial || k in body;

  if (has("title")) {
    data.title = String(body.title ?? "").trim();
    if (data.title.length > 120) return { error: "Title must be 120 characters or fewer." };
  }
  if (has("date")) {
    data.date = String(body.date ?? "").trim();
    if (data.date && !DATE.test(data.date)) return { error: "Date must be YYYY-MM-DD." };
  }
  if (has("description")) {
    data.description = String(body.description ?? "").trim();
    if (data.description.length > 1000) return { error: "Description must be 1000 characters or fewer." };
  }
  if ("hidden" in body) data.hidden = body.hidden === true || body.hidden === "true";
  if ("avatar" in body) data.avatar = body.avatar === true || body.avatar === "true";
  // Travel album the photo belongs to; null/empty takes it out of any album.
  // Callers check that the album exists.
  if ("albumId" in body) data.albumId = body.albumId ? String(body.albumId) : null;
  return { data };
}
