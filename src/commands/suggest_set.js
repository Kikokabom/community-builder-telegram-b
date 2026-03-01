import { isGlobalOrChatAdminForPrivateTarget } from "../services/authz.js";
import { setSuggestionStatus } from "../services/suggestions.js";
import { getUserDefaultChatId } from "../services/userContext.js";
import { isPrivateChat } from "../lib/tg.js";

function getArgText(ctx) {
  const t = String(ctx.message?.text || "");
  const parts = t.split(/\s+/);
  parts.shift();
  return parts.join(" ").trim();
}

const ALLOWED = new Set(["new", "accepted", "rejected", "planned", "done"]);

export default function register(bot) {
  bot.command("suggest_set", async (ctx) => {
    const isPrivate = isPrivateChat(ctx);

    let chatId = ctx.chat?.id;
    if (isPrivate) {
      chatId = await getUserDefaultChatId(ctx.from?.id);
      if (!chatId) return ctx.reply("In private chat, first set a default community by using /faq in a group.");
    }

    const ok = await isGlobalOrChatAdminForPrivateTarget(Number(chatId), ctx.from?.id, ctx);
    if (!ok) return ctx.reply("Admin only.");

    const arg = getArgText(ctx);
    const [id, status] = arg.split(/\s+/);
    if (!id || !status) return ctx.reply("Usage: /suggest_set <id> <new|accepted|rejected|planned|done>");
    if (!ALLOWED.has(status)) return ctx.reply("Invalid status.");

    const updated = await setSuggestionStatus(Number(chatId), id, status);
    if (!updated) return ctx.reply("Suggestion not found.");

    await ctx.reply("Suggestion updated.");
  });
}
