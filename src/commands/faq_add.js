import { parseQaPipe } from "../lib/text.js";
import { isGlobalOrChatAdminForPrivateTarget } from "../services/authz.js";
import { addFaq } from "../services/faqs.js";
import { getUserDefaultChatId } from "../services/userContext.js";
import { isPrivateChat } from "../lib/tg.js";

function getArgText(ctx) {
  const t = String(ctx.message?.text || "");
  const parts = t.split(/\s+/);
  parts.shift();
  return parts.join(" ").trim();
}

export default function register(bot) {
  bot.command("faq_add", async (ctx) => {
    const isPrivate = isPrivateChat(ctx);
    let chatId = ctx.chat?.id;

    if (isPrivate) {
      chatId = await getUserDefaultChatId(ctx.from?.id);
      if (!chatId) return ctx.reply("In private chat, first set a default community by using /faq in a group.");
    }

    const ok = await isGlobalOrChatAdminForPrivateTarget(Number(chatId), ctx.from?.id, ctx);
    if (!ok) return ctx.reply("Admin only.");

    const arg = getArgText(ctx);
    const parsed = parseQaPipe(arg);
    if (!parsed) return ctx.reply("Usage: /faq_add <question> | <answer>");

    const faq = await addFaq(Number(chatId), parsed.question, parsed.answer);
    await ctx.reply(`FAQ added. id=${faq.faqId}`);
  });
}
