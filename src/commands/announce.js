import { InlineKeyboard } from "grammy";

import { isAdminForChatOrOverride, isGlobalAdmin } from "../services/authz.js";
import { isPrivateChat } from "../lib/tg.js";
import { setPendingInput } from "../services/pending.js";
import { listAnnounceTargets } from "../services/announcements.js";

export default function register(bot) {
  bot.command("announce", async (ctx) => {
    const userId = ctx.from?.id;
    const chatId = ctx.chat?.id;
    if (!userId || !chatId) return;

    if (!isPrivateChat(ctx)) {
      const ok = await isAdminForChatOrOverride(chatId, userId, ctx);
      if (!ok) return ctx.reply("Admin only.");

      await setPendingInput({ chatId, userId, kind: "announce_text", ttlSeconds: 120, meta: { targets: [chatId] } });
      return ctx.reply("Send the announcement text as your next message within 2 minutes.");
    }

    // Private: only allow if global admin and targets exist
    if (!isGlobalAdmin(userId)) {
      return ctx.reply("In private chat, /announce is available only to global admins (BOT_ADMIN_IDS).");
    }

    const targets = await listAnnounceTargets(userId);
    if (!targets.length) {
      return ctx.reply("No announcement targets configured. Use /announce_targets add <chatId>.");
    }

    const kb = new InlineKeyboard();
    for (const t of targets.slice(0, 12)) {
      kb.text(String(t.chatId), `ann:t:${t.chatId}`).row();
    }

    await setPendingInput({ chatId, userId, kind: "announce_pick", ttlSeconds: 120 });
    return ctx.reply("Pick a target chat:", { reply_markup: kb });
  });
}
