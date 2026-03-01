import "dotenv/config";

import { cfg } from "./lib/config.js";
import { safeErr } from "./lib/safeErr.js";

process.on("unhandledRejection", (e) => {
  console.error("[process] unhandledRejection", { err: safeErr(e) });
  process.exit(1);
});

process.on("uncaughtException", (e) => {
  console.error("[process] uncaughtException", { err: safeErr(e) });
  process.exit(1);
});

async function boot() {
  console.log("[boot] starting", {
    nodeEnv: process.env.NODE_ENV || "",
    tokenSet: !!cfg.TELEGRAM_BOT_TOKEN,
    mongoSet: !!cfg.MONGODB_URI,
    logLevel: cfg.LOG_LEVEL,
    polling: true
  });

  if (!cfg.TELEGRAM_BOT_TOKEN) {
    console.error(
      "TELEGRAM_BOT_TOKEN is required. Add it to your environment variables and redeploy."
    );
    process.exit(1);
  }

  if (!cfg.MONGODB_URI) {
    console.error(
      "MONGODB_URI is required for this bot (rules/FAQ/suggestions/audit). Add it to your environment variables and redeploy."
    );
    process.exit(1);
  }

  try {
    const { startBot } = await import("./runner.js");
    await startBot();
  } catch (e) {
    console.error("[boot] fatal", { err: safeErr(e) });
    process.exit(1);
  }
}

boot();
