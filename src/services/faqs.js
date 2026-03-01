import crypto from "node:crypto";

import { getDb } from "../lib/db.js";
import { safeErr } from "../lib/safeErr.js";
import { logAudit } from "./audit.js";

const COL = "faqs";

function shortId() {
  return crypto.randomBytes(3).toString("hex");
}

export async function addFaq(chatId, question, answer) {
  const db = await getDb();
  const faqId = shortId();
  const doc = {
    chatId: String(chatId),
    faqId,
    question: String(question || "").trim(),
    answer: String(answer || "").trim(),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  try {
    await db.collection(COL).insertOne(doc);
    return doc;
  } catch (e) {
    console.error("[db] addFaq failed", { col: COL, op: "insertOne", chatId: String(chatId), err: safeErr(e) });
    throw e;
  }
}

export async function editFaq(chatId, faqId, question, answer) {
  const db = await getDb();
  try {
    const r = await db.collection(COL).updateOne(
      { chatId: String(chatId), faqId: String(faqId) },
      {
        $set: {
          question: String(question || "").trim(),
          answer: String(answer || "").trim(),
          updatedAt: new Date()
        }
      }
    );

    return r.modifiedCount > 0;
  } catch (e) {
    console.error("[db] editFaq failed", { col: COL, op: "updateOne", chatId: String(chatId), faqId: String(faqId), err: safeErr(e) });
    throw e;
  }
}

export async function deleteFaq(chatId, faqId) {
  const db = await getDb();
  try {
    const r = await db.collection(COL).deleteOne({ chatId: String(chatId), faqId: String(faqId) });
    return r.deletedCount;
  } catch (e) {
    console.error("[db] deleteFaq failed", { col: COL, op: "deleteOne", chatId: String(chatId), faqId: String(faqId), err: safeErr(e) });
    throw e;
  }
}

export async function getFaqById(chatId, faqId) {
  const db = await getDb();
  try {
    return await db.collection(COL).findOne({ chatId: String(chatId), faqId: String(faqId) });
  } catch (e) {
    console.error("[db] getFaqById failed", { col: COL, op: "findOne", chatId: String(chatId), faqId: String(faqId), err: safeErr(e) });
    throw e;
  }
}

export async function listFaqsForChat(chatId, limit = 20) {
  const db = await getDb();
  const lim = Math.max(1, Math.min(Number(limit || 20), 50));

  try {
    return await db
      .collection(COL)
      .find({ chatId: String(chatId) })
      .sort({ updatedAt: -1 })
      .limit(lim)
      .toArray();
  } catch (e) {
    console.error("[db] listFaqsForChat failed", { col: COL, op: "find", chatId: String(chatId), err: safeErr(e) });
    throw e;
  }
}

export async function searchFaqs(chatId, query, limit = 5) {
  const db = await getDb();
  const q = String(query || "").trim();
  const lim = Math.max(1, Math.min(Number(limit || 5), 20));
  if (!q) return [];

  // Simple regex search; can be replaced by text index later.
  const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");

  try {
    return await db
      .collection(COL)
      .find({ chatId: String(chatId), $or: [{ question: rx }, { answer: rx }] })
      .sort({ updatedAt: -1 })
      .limit(lim)
      .toArray();
  } catch (e) {
    console.error("[db] searchFaqs failed", { col: COL, op: "find", chatId: String(chatId), err: safeErr(e) });
    throw e;
  }
}
