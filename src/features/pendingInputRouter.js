import { getPendingInput, clearPendingInput } from "../services/pending.js";
import { upsertChatSettings } from "../services/chats.js";
import { addSuggestion } from "../services/suggestions.js";
import { logAudit } from "../services/audit.js";
import { InlineKeyboard } from "grammy";

export function registerPendingInputRouter(bot) {
  bot.on("message:text", async (ctx, next) => {
    const text = String(ctx.message?.text || "");
    if (text.startsWith("/")) return next();

    const chatId = ctx.chat?.id;
    const userId = ctx.from?.id;
    if (!chatId || !userId) return next();

    const pending = await getPendingInput({ chatId, userId });
    if (!pending) return next();

    await clearPendingInput({ chatId, userId });

    if (pending.kind === "setrules") {
      await upsertChatSettings(chatId, { rulesText: text });
      await logAudit(chatId, "setrules", ctx.from, { via: "prompt" });
      return ctx.reply("Rules updated.");
    }

    if (pending.kind === "setwelcome") {
      await upsertChatSettings(chatId, { welcomeTemplate: text });
      await logAudit(chatId, "setwelcome", ctx.from, { via: "prompt" });
      return ctx.reply("Welcome template updated.");
    }

    if (pending.kind === "suggest") {
      // Suggest requires a default community context, stored on the user.
      // Keep it simple: ask user to run /faq in group once.
      const suggested = await addSuggestion({ fromCtx: ctx, text });
      if (!suggested.ok) {
        return ctx.reply(suggested.message);
      }
      return ctx.reply(`Thanks. Saved as suggestion ${suggested.suggestionId}.`);
    }

    if (pending.kind === "announce_text") {
      const targets = Array.isArray(pending.meta?.targets) ? pending.meta.targets : [];
      const preview = text.length > 1000 ? text.slice(0, 1000) + "…" : text;

      const kb = new InlineKeyboard()
        .text("Send", "ann:confirm:send")
        .text("Cancel", "ann:confirm:cancel");

      // Store confirm state
      // Reuse pending store by setting a new pending record
      // This is done in the pending service for consistency.
      const { setPendingInput } = await import("../services/pending.js");
      await setPendingInput({
        chatId,
        userId,
        kind: "announce_confirm",
        ttlSeconds: 300,
        meta: { targets, text }
      });

      return ctx.reply("Confirm announcement:\n\n" + preview, { reply_markup: kb });
    }

    return next();
  });
}
