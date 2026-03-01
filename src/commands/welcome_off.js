import { isAdminForChatOrOverride } from "../services/authz.js";
import { upsertChatSettings } from "../services/chats.js";
import { isPrivateChat } from "../lib/tg.js";

export default function register(bot) {
  bot.command("welcome_off", async (ctx) => {
    const chatId = ctx.chat?.id;
    if (!chatId) return;
    if (isPrivateChat(ctx)) return ctx.reply("Run this in the group.");

    const ok = await isAdminForChatOrOverride(chatId, ctx.from?.id, ctx);
    if (!ok) return ctx.reply("Admin only.");

    await upsertChatSettings(chatId, { welcomeEnabled: false });
    await ctx.reply("Welcome messages disabled.");
  });
}
