import { isAdminForChatOrOverride } from "../services/authz.js";
import { listAudit } from "../services/audit.js";
import { isPrivateChat } from "../lib/tg.js";

export default function register(bot) {
  bot.command("audit", async (ctx) => {
    if (isPrivateChat(ctx)) {
      return ctx.reply("Run /audit in a group to view that chat's audit log.");
    }

    const chatId = ctx.chat?.id;
    if (!chatId) return;

    const ok = await isAdminForChatOrOverride(chatId, ctx.from?.id, ctx);
    if (!ok) return ctx.reply("Admin only.");

    const rows = await listAudit(chatId, 10);
    if (!rows.length) return ctx.reply("No audit entries yet.");

    const text = rows
      .map((a) => {
        const who = a.byUsername ? `@${a.byUsername}` : String(a.byUserId || "");
        return `${new Date(a.createdAt).toISOString()} ${a.action} by ${who}`;
      })
      .join("\n");

    await ctx.reply(text);
  });
}
