import { InlineKeyboard } from "grammy";

import { searchFaqs, listFaqsForChat, getFaqById } from "../services/faqs.js";
import { getUserDefaultChatId, setUserDefaultChatId } from "../services/userContext.js";
import { isPrivateChat } from "../lib/tg.js";

function getArgs(ctx) {
  const t = String(ctx.message?.text || "");
  const parts = t.split(/\s+/);
  parts.shift();
  return parts.join(" ").trim();
}

export default function register(bot) {
  bot.command("faq", async (ctx) => {
    const args = getArgs(ctx);
    const isPrivate = isPrivateChat(ctx);

    if (!isPrivate) {
      // In group: set user's default context to this chat
      if (ctx.from?.id && ctx.chat?.id) await setUserDefaultChatId(ctx.from.id, ctx.chat.id);
      return ctx.reply("Got it. In DMs, use /faq to browse this chat's FAQ.");
    }

    const chatId = await getUserDefaultChatId(ctx.from?.id);
    if (!chatId) {
      return ctx.reply(
        "I do not know which community FAQ to show yet. Use /faq in the group once to set your default community."
      );
    }

    if (args) {
      const hits = await searchFaqs(Number(chatId), args, 5);
      if (!hits.length) return ctx.reply("No matches found.");

      const kb = new InlineKeyboard();
      for (const f of hits) {
        kb.text(f.question.slice(0, 48) || f.faqId, `faq:view:${f.faqId}`).row();
      }

      return ctx.reply("Top matches:", { reply_markup: kb });
    }

    const faqs = await listFaqsForChat(Number(chatId), 12);
    if (!faqs.length) return ctx.reply("No FAQ entries yet.");

    const kb = new InlineKeyboard();
    for (const f of faqs) {
      kb.text(f.question.slice(0, 48) || f.faqId, `faq:view:${f.faqId}`).row();
    }

    return ctx.reply("FAQ:", { reply_markup: kb });
  });
}
