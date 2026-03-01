import { cfg } from "./config.js";

export function getBotProfile() {
  const lines = [
    "Purpose: Help Telegram communities onboard members and give admins lightweight tools for rules, welcome messages, FAQs, suggestions, announcements, moderation warnings, and audit logs.",
    "", 
    "Public member features (mostly in private chat): /rules, /faq, /suggest.",
    "Public admin features (groups and some private flows): /admin, /setrules, /setwelcome, /welcome_on, /welcome_off, /announce, /announce_targets, /warn, /warns, /resetwarns, /audit.",
    "", 
    "Key rules:",
    "- Private chat is for member tools and some admin management.",
    "- Groups/supergroups: welcome messages for new members (when enabled) and moderation helpers.",
    "- Admin commands require Telegram chat admin permissions, unless your user ID is in BOT_ADMIN_IDS.",
    "- In groups, /start reminds users to DM the bot for member tools."
  ];

  return lines.join("\n");
}

export function getHelpText() {
  return (
    "Members (private):\n" +
    "/rules\n" +
    "/faq\n" +
    "/suggest\n\n" +
    "Admins (groups/private):\n" +
    "/admin\n" +
    "/setrules\n" +
    "/setwelcome\n" +
    "/welcome_on\n" +
    "/welcome_off\n" +
    "/announce\n" +
    "/announce_targets\n" +
    "/warn (reply)\n" +
    "/warns (reply)\n" +
    "/resetwarns (reply)\n" +
    "/audit\n\n" +
    "Admin commands require chat admin permissions."
  );
}
