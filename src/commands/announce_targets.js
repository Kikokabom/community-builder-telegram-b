import { isPrivateChat } from "../lib/tg.js";
import { isGlobalAdmin } from "../services/authz.js";
import { addAnnounceTarget, removeAnnounceTarget, listAnnounceTargets } from "../services/announcements.js";

function getArgText(ctx) {
  const t = String(ctx.message?.text || "");
  const parts = t.split(/\s+/);
  parts.shift();
  return parts.join(" ").trim();
}

export default function register(bot) {
  bot.command("announce_targets", async (ctx) => {
    // This command is intentionally simple: global overrides can manage; otherwise use in group.
    // Real-world admin validation for arbitrary targets can be added later.

    const arg = getArgText(ctx);
    const userId = ctx.from?.id;
    if (!userId) return;

    // Safer default: only global admins can manage targets in private.
    if (isPrivateChat(ctx) && !isGlobalAdmin(userId)) {
      return ctx.reply(
        "For safety, manage announcement targets as a global admin (BOT_ADMIN_IDS) or run /announce in the group to send to that group."
      );
    }

    if (!arg) {
      const targets = await listAnnounceTargets(userId);
      if (!targets.length) return ctx.reply("No announcement targets configured.");
      return ctx.reply("Announcement targets:\n" + targets.map((t) => String(t.chatId)).join("\n"));
    }

    const m = arg.match(/^(add|remove)\s+(-?\d+)$/i);
    if (!m) {
      return ctx.reply("Usage: /announce_targets add <chatId> OR /announce_targets remove <chatId>");
    }

    const op = m[1].toLowerCase();
    const chatId = Number(m[2]);

    if (op === "add") {
      await addAnnounceTarget(userId, chatId);
      return ctx.reply("Target added.");
    }

    await removeAnnounceTarget(userId, chatId);
    return ctx.reply("Target removed.");
  });
}
