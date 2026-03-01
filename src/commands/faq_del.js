import { isGlobalOrChatAdminForPrivateTarget } from "../services/authz.js";
import { deleteFaq } from "../services/faqs.js";
import { getUserDefaultChatId } from "../services/userContext.js";
import { isPrivateChat } from "../lib/tg.js";

function getArgText(ctx) {
  const t = String(ctx.message?.text || "");
  const parts = t.split(/\s+/);
  parts.shift();
  return parts.join(" ").trim();
}

export default function register(bot) {
  bot.command("faq_del", async (ctx) => {
    const isPrivate = isPrivateChat(ctx);

    let chatId = ctx.chat?.id;
    if (isPrivate) {
      chatId = await getUserDefaultChatId(ctx.from?.id);
      if (!chatId) return ctx.reply("In private chat, first set a default community by using /faq in a group.");
    }

    const ok = await isGlobalOrChatAdminForPrivateTarget(Number(chatId), ctx.from?.id, ctx);
    if (!ok) return ctx.reply("Admin only.");

    const id = getArgText(ctx);
    if (!id) return ctx.reply("Usage: /faq_del <id>");

    const n = await deleteFaq(Number(chatId), id);
    if (!n) return ctx.reply("FAQ not found.");

    await ctx.reply("FAQ deleted.");
  });
}
