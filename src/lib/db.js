import { MongoClient } from "mongodb";

import { cfg } from "./config.js";
import { safeErr } from "./safeErr.js";

let _client = null;
let _db = null;
let _indexesEnsured = false;

export async function getDb() {
  if (_db) return _db;

  if (!cfg.MONGODB_URI) {
    throw new Error("MONGODB_URI missing");
  }

  try {
    _client = new MongoClient(cfg.MONGODB_URI, { maxPoolSize: 5, ignoreUndefined: true });
    await _client.connect();
    _db = _client.db();
    console.log("[db] connected", { mongoSet: true });
    return _db;
  } catch (e) {
    console.error("[db] connect failed", { err: safeErr(e) });
    throw e;
  }
}

export async function ensureDbReady() {
  const db = await getDb();
  if (_indexesEnsured) return db;

  try {
    await db.collection("chats").createIndex({ chatId: 1 }, { unique: true });
    await db.collection("faqs").createIndex({ chatId: 1, faqId: 1 }, { unique: true });
    await db.collection("suggestions").createIndex({ chatId: 1, suggestionId: 1 }, { unique: true });
    await db.collection("warns").createIndex({ chatId: 1, userId: 1 }, { unique: true });
    await db.collection("audit").createIndex({ chatId: 1, createdAt: -1 });
    await db.collection("user_context").createIndex({ userId: 1 }, { unique: true });
    await db.collection("pending_inputs").createIndex({ chatId: 1, userId: 1 }, { unique: true });
    await db.collection("pending_inputs").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 });
    await db.collection("announce_targets").createIndex({ userId: 1, chatId: 1 }, { unique: true });

    _indexesEnsured = true;
    console.log("[db] indexes ensured");
  } catch (e) {
    console.error("[db] ensure indexes failed", { err: safeErr(e) });
    // Do not throw; bot can still run.
  }

  return db;
}
