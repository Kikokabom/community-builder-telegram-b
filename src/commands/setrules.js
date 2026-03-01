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
  bot.command("setrules", async (ctx) => {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    if (isPrivateChat(ctx)) {
      return ctx.reply("Run /setrules inside the group where you want to set rules.");
    }

    const ok = await isAdminForChatOrOverride(chatId, ctx.from?.id, ctx);
    if (!ok) return ctx.reply("Admin only. You must be a chat admin to use this command.");

    const arg = getArgText(ctx);
    if (arg) {
      await upsertChatSettings(chatId, { rulesText: arg });
      return ctx.reply("Rules updated.");
    }

    await setPendingInput({
      chatId,
      userId: ctx.from?.id,
      kind: "setrules",
      ttlSeconds: 60
    });

    return ctx.reply("Send the rules text as your next message within 60 seconds.");
  });
}
