import { isGlobalOrChatAdminForPrivateTarget } from "../services/authz.js";
import { listSuggestions } from "../services/suggestions.js";
import { getUserDefaultChatId } from "../services/userContext.js";
import { isPrivateChat } from "../lib/tg.js";

export default function register(bot) {
  bot.command("suggestions", async (ctx) => {
    const isPrivate = isPrivateChat(ctx);

    let chatId = ctx.chat?.id;
    if (isPrivate) {
      chatId = await getUserDefaultChatId(ctx.from?.id);
      if (!chatId) return ctx.reply("In private chat, first set a default community by using /faq in a group.");
    }

    const ok = await isGlobalOrChatAdminForPrivateTarget(Number(chatId), ctx.from?.id, ctx);
    if (!ok) return ctx.reply("Admin only.");

    const rows = await listSuggestions(Number(chatId), 10);
    if (!rows.length) return ctx.reply("No suggestions yet.");

    const text = rows
      .map((s) => `${s.suggestionId} [${s.status}] ${String(s.text || "").slice(0, 120)}`)
      .join("\n");

    await ctx.reply(text);
  });
}
