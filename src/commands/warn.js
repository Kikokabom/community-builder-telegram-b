import { isAdminForChatOrOverride } from "../services/authz.js";
import { incWarn, getWarn, resetWarn } from "../services/warns.js";
import { logAudit } from "../services/audit.js";
import { getChatSettings } from "../services/chats.js";
import { isPrivateChat } from "../lib/tg.js";

function getRepliedUserId(ctx) {
  const u = ctx.message?.reply_to_message?.from;
  return u?.id;
}

export default function register(bot) {
  bot.command("warn", async (ctx) => {
    if (isPrivateChat(ctx)) return ctx.reply("Run /warn in a group as a reply to a user's message.");
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    const ok = await isAdminForChatOrOverride(chatId, ctx.from?.id, ctx);
    if (!ok) return ctx.reply("Admin only.");

    const targetUserId = getRepliedUserId(ctx);
    if (!targetUserId) return ctx.reply("Use /warn as a reply to a user's message.");

    const s = await getChatSettings(chatId);
    const threshold = Number(s?.settings?.warnThreshold || 3);

    const row = await incWarn(chatId, targetUserId, ctx.from?.id);

    await logAudit(chatId, "warn", ctx.from, { targetUserId, count: row.count });

    if (row.count >= threshold) {
      return ctx.reply(`Warned. Count is now ${row.count}. Threshold is ${threshold}. Consider muting or banning.`);
    }

    return ctx.reply(`Warned. Count is now ${row.count}.`);
  });

  bot.command("warns", async (ctx) => {
    if (isPrivateChat(ctx)) return ctx.reply("Run /warns in a group as a reply.");
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    const ok = await isAdminForChatOrOverride(chatId, ctx.from?.id, ctx);
    if (!ok) return ctx.reply("Admin only.");

    const targetUserId = getRepliedUserId(ctx);
    if (!targetUserId) return ctx.reply("Use /warns as a reply to a user's message.");

    const row = await getWarn(chatId, targetUserId);
    const count = row?.count || 0;
    return ctx.reply(`Warn count: ${count}`);
  });

  bot.command("resetwarns", async (ctx) => {
    if (isPrivateChat(ctx)) return ctx.reply("Run /resetwarns in a group as a reply.");
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    const ok = await isAdminForChatOrOverride(chatId, ctx.from?.id, ctx);
    if (!ok) return ctx.reply("Admin only.");

    const targetUserId = getRepliedUserId(ctx);
    if (!targetUserId) return ctx.reply("Use /resetwarns as a reply to a user's message.");

    await resetWarn(chatId, targetUserId);
    await logAudit(chatId, "resetwarns", ctx.from, { targetUserId });
    return ctx.reply("Warns reset.");
  });
}
