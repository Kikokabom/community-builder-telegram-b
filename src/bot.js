import { Bot } from "grammy";

import { registerCommands } from "./commands/loader.js";
import { registerWelcomeHandlers } from "./features/welcome.js";
import { registerCallbackHandlers } from "./features/callbacks.js";
import { ensureDbReady } from "./lib/db.js";
import { getBotProfile } from "./lib/botProfile.js";
import { safeErr } from "./lib/safeErr.js";

export function createBot(token) {
  const bot = new Bot(token);

  bot.use(async (ctx, next) => {
    const chatId = ctx.chat?.id;
    const userId = ctx.from?.id;
    const updateId = ctx.update?.update_id;

    if (ctx.update?.message?.text?.startsWith?.("/")) {
      const cmd = String(ctx.update.message.text || "").split(/\s+/)[0];
      console.log("[cmd] entry", { cmd, chatId, userId, updateId });
    }

    try {
      await next();
    } catch (e) {
      console.error("[middleware] error", { err: safeErr(e), chatId, userId, updateId });
      throw e;
    }
  });

  bot.use(async (ctx, next) => {
    if (!ctx.chat?.id) return next();
    try {
      await ensureDbReady();
    } catch (e) {
      console.error("[db] ensureDbReady failed", { err: safeErr(e) });
      // Let command handlers show user-friendly errors if they hit DB.
    }
    return next();
  });

  // Commands first (middleware order matters)
  registerCommands(bot);

  // Non-command features after
  registerCallbackHandlers(bot);
  registerWelcomeHandlers(bot);

  bot.on("message:text", async (ctx, next) => {
    const text = ctx.message?.text || "";
    if (text.startsWith("/")) return next();
    // No AI catch-all for this bot. Keep behavior deterministic.
    return next();
  });

  console.log("[bot] profile", { profile: getBotProfile() });

  return bot;
}
