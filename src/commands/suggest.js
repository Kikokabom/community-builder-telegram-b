import { isPrivateChat } from "../lib/tg.js";
import { setPendingInput } from "../services/pending.js";

export default function register(bot) {
  bot.command("suggest", async (ctx) => {
    if (!isPrivateChat(ctx)) {
      return ctx.reply("Please DM me to send suggestions.");
    }

    await setPendingInput({
      chatId: ctx.chat?.id,
      userId: ctx.from?.id,
      kind: "suggest",
      ttlSeconds: 60
    });

    await ctx.reply("Send your suggestion as your next message within 60 seconds.");
  });
}
