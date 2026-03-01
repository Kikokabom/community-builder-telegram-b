import { isAdminForChatOrOverride } from "../services/authz.js";
import { upsertChatSettings } from "../services/chats.js";
import { setPendingInput } from "../services/pending.js";
import { isPrivateChat } from "../lib/tg.js";

function getArgText(ctx) {
  const t = String(ctx.message?.text || "");
  const parts = t.split(/\s+/);
  parts.shift();
  return parts.join(" ").trim();
}

export default function register(bot) {
  bot.command("setwelcome", async (ctx) => {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    if (isPrivateChat(ctx)) {
      return ctx.reply("Run /setwelcome inside the group where you want to set the welcome template.");
    }

    const ok = await isAdminForChatOrOverride(chatId, ctx.from?.id, ctx);
    if (!ok) return ctx.reply("Admin only. You must be a chat admin to use this command.");

    const arg = getArgText(ctx);
    if (arg) {
      await upsertChatSettings(chatId, { welcomeTemplate: arg });
      return ctx.reply(
        "Welcome template updated. Placeholders supported: {first_name}, {username}, {chat_title}."
      );
    }

    await setPendingInput({
      chatId,
      userId: ctx.from?.id,
      kind: "setwelcome",
      ttlSeconds: 60
    });

    return ctx.reply(
      "Send the welcome template as your next message within 60 seconds. Placeholders: {first_name}, {username}, {chat_title}."
    );
  });
}
