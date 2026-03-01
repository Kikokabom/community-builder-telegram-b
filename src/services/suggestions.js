import crypto from "node:crypto";

import { getDb } from "../lib/db.js";
import { safeErr } from "../lib/safeErr.js";
import { getUserDefaultChatId } from "./userContext.js";
import { logAudit } from "./audit.js";

const COL = "suggestions";

function shortId() {
  return crypto.randomBytes(3).toString("hex");
}

export async function addSuggestion({ fromCtx, text }) {
  const userId = fromCtx.from?.id;
  if (!userId) return { ok: false, message: "Missing user." };

  const defaultChatId = await getUserDefaultChatId(userId);
  if (!defaultChatId) {
    return { ok: false, message: "First set your default community by using /faq in a group once." };
  }

  const suggestionId = shortId();
  const doc = {
    chatId: String(defaultChatId),
    suggestionId,
    fromUserId: String(userId),
    fromUsername: String(fromCtx.from?.username || ""),
    text: String(text || "").trim(),
    status: "new",
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const db = await getDb();

  try {
    await db.collection(COL).insertOne(doc);
    return { ok: true, suggestionId };
  } catch (e) {
    console.error("[db] addSuggestion failed", { col: COL, op: "insertOne", chatId: String(defaultChatId), err: safeErr(e) });
    return { ok: false, message: "Failed to save suggestion." };
  }
}

export async function listSuggestions(chatId, limit = 10) {
  const db = await getDb();
  const lim = Math.max(1, Math.min(Number(limit || 10), 50));

  try {
    return await db
      .collection(COL)
      .find({ chatId: String(chatId) })
      .sort({ createdAt: -1 })
      .limit(lim)
      .toArray();
  } catch (e) {
    console.error("[db] listSuggestions failed", { col: COL, op: "find", chatId: String(chatId), err: safeErr(e) });
    throw e;
  }
}

export async function setSuggestionStatus(chatId, suggestionId, status) {
  const db = await getDb();
  try {
    const r = await db.collection(COL).updateOne(
      { chatId: String(chatId), suggestionId: String(suggestionId) },
      { $set: { status: String(status), updatedAt: new Date() } }
    );

    return r.modifiedCount > 0;
  } catch (e) {
    console.error("[db] setSuggestionStatus failed", { col: COL, op: "updateOne", chatId: String(chatId), suggestionId: String(suggestionId), err: safeErr(e) });
    throw e;
  }
}
