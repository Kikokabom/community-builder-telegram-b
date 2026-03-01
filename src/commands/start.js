import { InlineKeyboard } from "grammy";

import { getBotProfile } from "../lib/botProfile.js";
import { isPrivateChat } from "../lib/tg.js";

export default function register(bot) {
  bot.command("start", async (ctx) => {
    const chatType = ctx.chat?.type || "private";

    if (!isPrivateChat(ctx)) {
      return ctx.reply(
        "Hi. For member tools like FAQ, rules, and suggestions, please DM me. Group onboarding welcomes are automatic when enabled by admins."
      );
    }

    const kb = new InlineKeyboard()
      .text("View Rules", "nav:rules")
      .row()
      .text("FAQ", "nav:faq")
      .row()
      .text("Send Suggestion", "nav:suggest")
      .row()
      .text("Help", "nav:help");

    const msg =
      "Welcome. I help communities onboard members and give admins lightweight tools for rules, FAQs, suggestions, announcements, and moderation.\n\n" +
      "Use the buttons below to get started.";

    await ctx.reply(msg, { reply_markup: kb });
  });
}
