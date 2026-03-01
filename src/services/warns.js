import { getDb } from "../lib/db.js";
import { safeErr } from "../lib/safeErr.js";

const COL = "warns";

export async function incWarn(chatId, userId, warnedBy) {
  const db = await getDb();

  try {
    const r = await db.collection(COL).findOneAndUpdate(
      { chatId: String(chatId), userId: String(userId) },
      {
        $setOnInsert: { createdAt: new Date() },
        $set: { lastWarnedBy: String(warnedBy || ""), updatedAt: new Date() },
        $inc: { count: 1 }
      },
      { upsert: true, returnDocument: "after" }
    );

    return r.value;
  } catch (e) {
    console.error("[db] incWarn failed", { col: COL, op: "findOneAndUpdate", chatId: String(chatId), userId: String(userId), err: safeErr(e) });
    throw e;
  }
}

export async function getWarn(chatId, userId) {
  const db = await getDb();
  try {
    return await db.collection(COL).findOne({ chatId: String(chatId), userId: String(userId) });
  } catch (e) {
    console.error("[db] getWarn failed", { col: COL, op: "findOne", chatId: String(chatId), userId: String(userId), err: safeErr(e) });
    throw e;
  }
}

export async function resetWarn(chatId, userId) {
  const db = await getDb();
  try {
    await db.collection(COL).updateOne(
      { chatId: String(chatId), userId: String(userId) },
      { $set: { count: 0, updatedAt: new Date() } },
      { upsert: true }
    );
  } catch (e) {
    console.error("[db] resetWarn failed", { col: COL, op: "updateOne", chatId: String(chatId), userId: String(userId), err: safeErr(e) });
    throw e;
  }
}
