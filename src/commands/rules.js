import { getChatSettings } from "../services/chats.js";
import { getUserDefaultChatId, setUserDefaultChatId } from "../services/userContext.js";
import { isPrivateChat } from "../lib/tg.js";

function rulesFallback() {
  return "No rules have been set for this chat yet.";
}

export default function register(bot) {
  bot.command("rules", async (ctx) => {
    const isPrivate = isPrivateChat(ctx);

    let targetChatId = ctx.chat?.id;

    if (isPrivate) {
      const d = await getUserDefaultChatId(ctx.from?.id);
      if (!d) {
        return ctx.reply(
          "I do not know which community you mean yet. Use /faq in a group once, or ask an admin to configure the bot in your group."
        );
      }
      targetChatId = Number(d);
    }

    const s = await getChatSettings(targetChatId);
    const rules = s?.settings?.rulesText;

    await ctx.reply(rules && String(rules).trim() ? String(rules).trim() : rulesFallback());
  });
}
