import { getBotProfile, getHelpText } from "../lib/botProfile.js";

export default function register(bot) {
  bot.command("help", async (ctx) => {
    await ctx.reply(getHelpText());
  });
}
