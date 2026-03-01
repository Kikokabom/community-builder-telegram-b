import { getDb } from "../lib/db.js";
import { safeErr } from "../lib/safeErr.js";

const COL = "announce_targets";

export async function addAnnounceTarget(userId, chatId) {
  const db = await getDb();
  try {
    await db.collection(COL).updateOne(
      { userId: String(userId), chatId: String(chatId) },
      { $setOnInsert: { createdAt: new Date() }, $set: { updatedAt: new Date() } },
      { upsert: true }
    );
  } catch (e) {
    console.error("[db] addAnnounceTarget failed", { col: COL, op: "updateOne", userId: String(userId), chatId: String(chatId), err: safeErr(e) });
  }
}

export async function removeAnnounceTarget(userId, chatId) {
  const db = await getDb();
  try {
    await db.collection(COL).deleteOne({ userId: String(userId), chatId: String(chatId) });
  } catch (e) {
    console.error("[db] removeAnnounceTarget failed", { col: COL, op: "deleteOne", userId: String(userId), chatId: String(chatId), err: safeErr(e) });
  }
}

export async function listAnnounceTargets(userId) {
  const db = await getDb();
  try {
    return await db.collection(COL).find({ userId: String(userId) }).sort({ updatedAt: -1 }).limit(50).toArray();
  } catch (e) {
    console.error("[db] listAnnounceTargets failed", { col: COL, op: "find", userId: String(userId), err: safeErr(e) });
    return [];
  }
}
