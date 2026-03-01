This is a Telegram community onboarding and admin tools bot built with grammY.

It supports member-facing tools in DMs (rules, FAQ, suggestions) and group features (welcome messages, moderation helpers, announcements).

Quick start
1) Create a Telegram bot with BotFather and get TELEGRAM_BOT_TOKEN
2) Set env vars (see .env.sample)
3) Install and run:
   npm run build
   npm start

Notes
- MongoDB is required for persistence (rules, welcome templates, FAQ, suggestions, audit logs).
- The bot uses long polling via @grammyjs/runner.

See DOCS.md for full command reference and troubleshooting.
