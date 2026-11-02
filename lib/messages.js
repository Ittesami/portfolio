import { ObjectId } from "mongodb";

// Contact form messages, written by POST /api/contact:
//   { _id, name, email, message, createdAt, userAgent, read?: boolean }
// Messages without `read` (everything sent before the inbox existed) count as unread.

export function parseId(id) {
  return ObjectId.isValid(id) ? new ObjectId(id) : null;
}

export function messageToClient(doc) {
  return {
    id: String(doc._id),
    name: doc.name,
    email: doc.email,
    message: doc.message,
    createdAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : null,
    read: Boolean(doc.read),
  };
}

export function unreadCount(db) {
  return db.collection("messages").countDocuments({ read: { $ne: true } });
}
