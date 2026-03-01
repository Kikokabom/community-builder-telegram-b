import { InlineKeyboard } from "grammy";

import { getHelpText } from "../lib/botProfile.js";
import { getUserDefaultChatId } from "../services/userContext.js";
import { getChatSettings } from "../services/chats.js";
import { getFaqById } from "../services/faqs.js";
import { setPendingInput, getPendingInput, clearPendingInput } from "../services/pending.js";
import { safeErr } from "../lib/safeErr.js";

export function registerCallbackHandlers(bot) {
  bot.callbackQuery(/^(nav:)(rules|faq|suggest|help)$/, async (ctx) => {
    const action = ctx.match?.[2];
    await ctx.answerCallbackQuery();

    if (action === "help") return ctx.reply(getHelpText());

    if (action === "rules") {
      const chatId = await getUserDefaultChatId(ctx.from?.id);
      if (!chatId) return ctx.reply("Set your default community by using /faq in a group once.");
      const s = await getChatSettings(Number(chatId));
      const rules = s?.settings?.rulesText;
      return ctx.reply(rules && String(rules).trim() ? String(rules).trim() : "No rules have been set yet.");
    }

    if (action === "faq") {
      return ctx.reply("Use /faq to browse or search the FAQ.");
    }

    if (action === "suggest") {
      await setPendingInput({ chatId: ctx.chat?.id, userId: ctx.from?.id, kind: "suggest", ttlSeconds: 60 });
      return ctx.reply("Send your suggestion as your next message within 60 seconds.");
    }
  });

  bot.callbackQuery(/^faq:view:(.+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const faqId = ctx.match?.[1];
    const chatId = await getUserDefaultChatId(ctx.from?.id);
    if (!chatId) return ctx.reply("Set your default community by using /faq in a group once.");

    const f = await getFaqById(Number(chatId), faqId);
    if (!f) return ctx.reply("FAQ not found.");

    return ctx.reply(`${f.question}\n\n${f.answer}`);
  });

  bot.callbackQuery(/^ann:t:(-?\d+)$/, async (ctx) => {
    await ctx.answerCallbackQuery();
    const target = Number(ctx.match?.[1]);

    const pending = await getPendingInput({ chatId: ctx.chat?.id, userId: ctx.from?.id });
    if (!pending || pending.kind !== "announce_pick") {
      return ctx.reply("This action expired. Run /announce again.");
    }

    await clearPendingInput({ chatId: ctx.chat?.id, userId: ctx.from?.id });
    await setPendingInput({
      chatId: ctx.chat?.id,
      userId: ctx.from?.id,
      kind: "announce_text",
      ttlSeconds: 120,
      meta: { targets: [target] }
    });

    return ctx.reply("Send the announcement text as your next message within 2 minutes.");
  });

  bot.callbackQuery(/^ann:confirm:(send|cancel)$/, async (ctx) => {
    await ctx.answerCallbackQuery();

    const op = ctx.match?.[1];
    const pending = await getPendingInput({ chatId: ctx.chat?.id, userId: ctx.from?.id });
    if (!pending || pending.kind !== "announce_confirm") {
      return ctx.reply("This confirmation expired. Run /announce again.");
    }

    if (op === "cancel") {
      await clearPendingInput({ chatId: ctx.chat?.id, userId: ctx.from?.id });
      return ctx.reply("Announcement cancelled.");
    }

    const targets = Array.isArray(pending.meta?.targets) ? pending.meta.targets : [];
    const text = String(pending.meta?.text || "");

    await clearPendingInput({ chatId: ctx.chat?.id, userId: ctx.from?.id });

    if (!targets.length || !text) return ctx.reply("Nothing to send.");

    const results = [];
    for (const chatId of targets) {
      try {
        await ctx.api.sendMessage(chatId, text);
        console.log("[announce] sent", { byUserId: ctx.from?.id, targetChatId: chatId });
        results.push({ chatId, ok: true });
      } catch (e) {
        console.error("[announce] send failed", { byUserId: ctx.from?.id, targetChatId: chatId, err: safeErr(e) });
        results.push({ chatId, ok: false, err: safeErr(e) });
      }
    }

    const okN = results.filter((r) => r.ok).length;
    const failN = results.length - okN;

    return ctx.reply(`Announcement sent. Success: ${okN}. Failed: ${failN}.`);
  });
}
