What this bot does
This Telegram bot helps communities onboard members and gives admins lightweight management tools.

Behavior by chat type
1) Private chat (DM)
- Member tools: view rules, browse/search FAQ, send suggestions.
- Admin tools: manage FAQs, review suggestions, send announcements to configured target chats.

2) Group/supergroup
- Automatically welcomes new members if welcome is enabled for that chat.
- Admin tools: set rules, set welcome template, toggle welcome, moderation warnings, announcements, audit log.

Public commands
1) /start
- In private: shows welcome message and buttons for Rules, FAQ, Suggestion, Help.
- In groups: tells users to DM the bot for member tools.

2) /help
- Shows categorized commands for members and admins.

Member commands (private)
1) /rules
Shows rules for your current community context.

2) /faq
Shows FAQ list or searches when you provide terms.
Examples:
- /faq
- /faq wallet setup

3) /suggest
Prompts you to send a suggestion as your next message.

Admin commands (groups and private)
1) /admin
Shows admin panel summary for the current chat (in groups) or asks you to select a target chat (in private).

2) /setrules <text>
Sets rules text for the chat. If you omit <text>, the bot will ask you to send the next message as rules within 60 seconds.

3) /setwelcome <template>
Sets welcome message template for the chat. Supports placeholders: {first_name}, {username}, {chat_title}.
If you omit <template>, the bot will ask for the next message within 60 seconds.

4) /welcome_on and /welcome_off
Enable or disable welcome messages for the chat.

5) /faq_add <question> | <answer>
Adds an FAQ entry.

6) /faq_edit <id> <question> | <answer>
Edits an FAQ entry by id.

7) /faq_del <id>
Deletes an FAQ entry.

8) /suggestions
Lists recent suggestions for the current target chat.

9) /suggest_set <id> <new|accepted|rejected|planned|done>
Updates suggestion status.

10) /announce
Guided announcement flow: choose target(s), enter text, confirm send.

11) /announce_targets
Manage announcement target chats (add/remove) for your admin account.

12) /warn (reply)
Increments warn count for the replied user in that chat.

13) /warns (reply)
Shows warn count for the replied user.

14) /resetwarns (reply)
Resets warn count.

15) /audit
Shows last 10 admin actions for the chat.

Permissions
- Admin-only commands require you to be a chat admin (or be in BOT_ADMIN_IDS).
- Some moderation actions require the bot to have admin permissions.

Environment variables
1) TELEGRAM_BOT_TOKEN (required)
Telegram bot token from BotFather.

2) MONGODB_URI (required)
MongoDB connection string.

3) BOT_ADMIN_IDS (optional)
Comma-separated Telegram user IDs with global override admin access.

4) LOG_LEVEL (optional)
Default: info. Supports: debug, info, warn, error.

Troubleshooting
1) Bot not responding
- Confirm TELEGRAM_BOT_TOKEN is set.
- If deployed, ensure only one instance is polling (409 errors will auto-retry).

2) DB errors
- Confirm MONGODB_URI is set and reachable.
- Check logs for collection and operation names.

3) Welcome messages not sending
- Ensure /welcome_on is enabled in the chat.
- Ensure the bot has permission to send messages in the group.
