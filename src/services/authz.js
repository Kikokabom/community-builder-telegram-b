import { cfg } from "../lib/config.js";
import { safeErr } from "../lib/safeErr.js";

export function isGlobalAdmin(userId) {
  const id = Number(userId);
  if (!Number.isFinite(id)) return false;
  return Array.isArray(cfg.BOT_ADMIN_IDS) && cfg.BOT_ADMIN_IDS.includes(id);
}

export async function isAdminForChatOrOverride(chatId, userId, ctx) {
  if (!chatId || !userId) return false;
  if (isGlobalAdmin(userId)) return true;

  try {
    const m = await ctx.api.getChatMember(chatId, userId);
    return m?.status === "administrator" || m?.status === "creator";
  } catch (e) {
    console.error("[authz] getChatMember failed", { chatId, userId, err: safeErr(e) });
    return false;
  }
}

export async function isGlobalOrChatAdminForPrivateTarget(targetChatId, userId, ctx) {
  if (!targetChatId || !userId) return false;
  if (isGlobalAdmin(userId)) return true;

  // In private chat we still validate admin status in that target chat.
  try {
    const m = await ctx.api.getChatMember(targetChatId, userId);
    return m?.status === "administrator" || m?.status === "creator";
  } catch (e) {
    console.error("[authz] private target getChatMember failed", { targetChatId, userId, err: safeErr(e) });
    return false;
  }
}
