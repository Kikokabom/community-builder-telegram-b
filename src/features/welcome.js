import { getChatSettings } from "../services/chats.js";
import { renderTemplate } from "../lib/templates.js";
import { safeErr } from "../lib/safeErr.js";
import { logAudit } from "../services/audit.js";

export function registerWelcomeHandlers(bot) {
  bot.on("message:new_chat_members", async (ctx) => {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    const s = await getChatSettings(chatId);
    if (!s?.settings?.welcomeEnabled) return;

    const tpl =
      String(s?.settings?.welcomeTemplate || "Welcome {first_name} to {chat_title}.").trim() ||
      "Welcome {first_name} to {chat_title}.";

    const chatTitle = ctx.chat?.title || "this chat";

    for (const m of ctx.message?.new_chat_members || []) {
      const msg = renderTemplate(tpl, {
        first_name: m.first_name || "there",
        username: m.username ? `@${m.username}` : "",
        chat_title: chatTitle
      });

      try {
        await ctx.reply(msg);
      } catch (e) {
        console.error("[welcome] send failed", { chatId, err: safeErr(e) });
        // Fail gracefully: can't do much if bot has no rights
      }
    }
  });
}
