import { isAdminForChatOrOverride } from "../services/authz.js";
import { isPrivateChat } from "../lib/tg.js";
import { getChatSettings } from "../services/chats.js";

export default function register(bot) {
  bot.command("admin", async (ctx) => {
    if (isPrivateChat(ctx)) {
      return ctx.reply(
        "Admin tools are mostly used inside a group. If you want to manage FAQ or suggestions in private, first set your default community by using /faq in the group once."
      );
    }

    const chatId = ctx.chat?.id;
    if (!chatId) return;

    const ok = await isAdminForChatOrOverride(chatId, ctx.from?.id, ctx);
    if (!ok) return ctx.reply("Admin only.");

    const s = await getChatSettings(chatId);
    const we = !!s?.settings?.welcomeEnabled;

    await ctx.reply(
      "Admin panel\n\n" +
        `Welcome enabled: ${we}\n` +
        "Commands: /setrules, /setwelcome, /welcome_on, /welcome_off, /announce, /announce_targets, /audit, /warn"
    );
  });
}
