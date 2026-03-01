import { getDb } from "../lib/db.js";
import { safeErr } from "../lib/safeErr.js";

const COL = "audit";

export async function logAudit(chatId, action, byFrom, meta = {}) {
  const db = await getDb();

  const doc = {
    chatId: String(chatId),
    action: String(action),
    byUserId: String(byFrom?.id || ""),
    byUsername: String(byFrom?.username || ""),
    meta: meta || {},
    createdAt: new Date()
  };

  try {
    await db.collection(COL).insertOne(doc);
  } catch (e) {
    console.error("[db] logAudit failed", { col: COL, op: "insertOne", chatId: String(chatId), err: safeErr(e) });
  }
}

export async function listAudit(chatId, limit = 10) {
  const db = await getDb();
  const lim = Math.max(1, Math.min(Number(limit || 10), 50));

  try {
    return await db.collection(COL).find({ chatId: String(chatId) }).sort({ createdAt: -1 }).limit(lim).toArray();
  } catch (e) {
    console.error("[db] listAudit failed", { col: COL, op: "find", chatId: String(chatId), err: safeErr(e) });
    throw e;
  }
}
