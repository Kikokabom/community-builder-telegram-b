import { parseQaPipe } from "../lib/text.js";
import { isGlobalOrChatAdminForPrivateTarget } from "../services/authz.js";
import { editFaq } from "../services/faqs.js";
import { getUserDefaultChatId } from "../services/userContext.js";
import { isPrivateChat } from "../lib/tg.js";

function getArgText(ctx) {
  const t = String(ctx.message?.text || "");
  const parts = t.split(/\s+/);
  parts.shift();
  return parts.join(" ").trim();
}

export default function register(bot) {
  bot.command("faq_edit", async (ctx) => {
    const isPrivate = isPrivateChat(ctx);

    let chatId = ctx.chat?.id;
    if (isPrivate) {
      chatId = await getUserDefaultChatId(ctx.from?.id);
      if (!chatId) return ctx.reply("In private chat, first set a default community by using /faq in a group.");
    }

    const ok = await isGlobalOrChatAdminForPrivateTarget(Number(chatId), ctx.from?.id, ctx);
    if (!ok) return ctx.reply("Admin only.");

    const arg = getArgText(ctx);
    const m = arg.match(/^(\S+)\s+(.*)$/);
    if (!m) return ctx.reply("Usage: /faq_edit <id> <question> | <answer>");

    const faqId = m[1];
    const rest = m[2];

    const parsed = parseQaPipe(rest);
    if (!parsed) return ctx.reply("Usage: /faq_edit <id> <question> | <answer>");

    const okEdit = await editFaq(Number(chatId), faqId, parsed.question, parsed.answer);
    if (!okEdit) return ctx.reply("FAQ not found.");

    await ctx.reply("FAQ updated.");
  });
}
