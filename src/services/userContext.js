import { getDb } from "../lib/db.js";
import { safeErr } from "../lib/safeErr.js";

const COL = "user_context";

export async function setUserDefaultChatId(userId, chatId) {
  const db = await getDb();
  try {
    await db.collection(COL).updateOne(
      { userId: String(userId) },
      {
        $setOnInsert: { createdAt: new Date() },
        $set: { defaultChatId: String(chatId), updatedAt: new Date() }
      },
      { upsert: true }
    );
  } catch (e) {
    console.error("[db] setUserDefaultChatId failed", { col: COL, op: "updateOne", userId: String(userId), err: safeErr(e) });
  }
}

export async function getUserDefaultChatId(userId) {
  if (!userId) return "";
  const db = await getDb();
  try {
    const row = await db.collection(COL).findOne({ userId: String(userId) });
    return row?.defaultChatId || "";
  } catch (e) {
    console.error("[db] getUserDefaultChatId failed", { col: COL, op: "findOne", userId: String(userId), err: safeErr(e) });
    return "";
  }
}
