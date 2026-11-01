import { requireDb } from "@/lib/mongodb";
import { photoBucket } from "@/lib/photos";

// Serves an uploaded photo from MongoDB. Upload ids never change, so browsers
// and the image optimiser can cache them for a year.
export async function GET(_request, { params }) {
  const { id } = await params;
  const db = await requireDb();
  const doc = await db.collection("photos").findOne({ _id: id, kind: "upload" });
  if (!doc) return new Response("Not found", { status: 404 });

  const chunks = [];
  for await (const chunk of photoBucket(db).openDownloadStream(doc.fileId)) chunks.push(chunk);
  return new Response(Buffer.concat(chunks), {
    headers: {
      "Content-Type": doc.mime || "image/jpeg",
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
