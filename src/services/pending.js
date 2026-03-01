import { getDb } from "../lib/db.js";
import { safeErr } from "../lib/safeErr.js";

const COL = "pending_inputs";

export async function setPendingInput({ chatId, userId, kind, ttlSeconds = 60, meta = {} }) {
  const db = await getDb();
  const expiresAt = new Date(Date.now() + Math.max(1, Number(ttlSeconds || 60)) * 1000);

  try {
    await db.collection(COL).updateOne(
      { chatId: String(chatId), userId: String(userId) },
      {
        $setOnInsert: { createdAt: new Date() },
        $set: { kind: String(kind), meta: meta || {}, expiresAt, updatedAt: new Date() }
      },
      { upsert: true }
    );
  } catch (e) {
    console.error("[db] setPendingInput failed", { col: COL, op: "updateOne", chatId: String(chatId), userId: String(userId), err: safeErr(e) });
  }
}

export async function getPendingInput({ chatId, userId }) {
  const db = await getDb();
  try {
    const row = await db.collection(COL).findOne({ chatId: String(chatId), userId: String(userId) });
    if (!row) return null;
    if (row.expiresAt && new Date(row.expiresAt).getTime() < Date.now()) return null;
    return row;
  } catch (e) {
    console.error("[db] getPendingInput failed", { col: COL, op: "findOne", chatId: String(chatId), userId: String(userId), err: safeErr(e) });
    return null;
  }
}

export async function clearPendingInput({ chatId, userId }) {
  const db = await getDb();
  try {
    await db.collection(COL).deleteOne({ chatId: String(chatId), userId: String(userId) });
  } catch (e) {
    console.error("[db] clearPendingInput failed", { col: COL, op: "deleteOne", chatId: String(chatId), userId: String(userId), err: safeErr(e) });
  }
}
