import { getDb } from "../lib/db.js";
import { safeErr } from "../lib/safeErr.js";

const COL = "chats";

const DEFAULTS = {
  language: "en",
  rulesText: "",
  welcomeEnabled: false,
  welcomeTemplate: "Welcome {first_name} to {chat_title}.",
  warnThreshold: 3
};

export async function getChatSettings(chatId) {
  const db = await getDb();
  try {
    const row = await db.collection(COL).findOne({ chatId: String(chatId) });
    if (!row) return null;
    row.settings = { ...DEFAULTS, ...(row.settings || {}) };
    return row;
  } catch (e) {
    console.error("[db] getChatSettings failed", { col: COL, op: "findOne", chatId: String(chatId), err: safeErr(e) });
    throw e;
  }
}

export async function upsertChatSettings(chatId, patchSettings = {}) {
  const db = await getDb();

  const mutable = { ...patchSettings };
  delete mutable._id;
  delete mutable.createdAt;

  try {
    await db.collection(COL).updateOne(
      { chatId: String(chatId) },
      {
        $setOnInsert: { createdAt: new Date(), chatId: String(chatId) },
        $set: { settings: { ...DEFAULTS, ...mutable }, updatedAt: new Date() }
      },
      { upsert: true }
    );
  } catch (e) {
    console.error("[db] upsertChatSettings failed", { col: COL, op: "updateOne", chatId: String(chatId), err: safeErr(e) });
    throw e;
  }
}
