import { run } from "@grammyjs/runner";

import { cfg } from "./lib/config.js";
import { createBot } from "./bot.js";
import { safeErr } from "./lib/safeErr.js";

let _runner = null;
let _starting = false;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function is409(e) {
  const msg = safeErr(e);
  return String(msg).includes("409") || String(msg).toLowerCase().includes("conflict");
}

export async function startBot() {
  if (_starting) return;
  _starting = true;

  const bot = createBot(cfg.TELEGRAM_BOT_TOKEN);

  bot.catch((err) => {
    console.error("[bot.catch] update error", {
      err: safeErr(err?.error || err),
      updateId: err?.ctx?.update?.update_id
    });
  });

  let backoffMs = 2000;
  while (true) {
    try {
      console.log("[polling] init");
      await bot.api.deleteWebhook({ drop_pending_updates: true });

      console.log("[polling] starting", { runnerConcurrency: 1 });
      _runner = run(bot, { concurrency: 1 });
      await _runner.task();

      console.warn("[polling] runner ended unexpectedly; restarting", { backoffMs });
      await sleep(backoffMs);
      backoffMs = Math.min(20000, Math.floor(backoffMs * 1.8));
    } catch (e) {
      const err = safeErr(e);
      console.error("[polling] failure", { err, backoffMs });

      if (is409(e)) {
        await sleep(backoffMs);
        backoffMs = Math.min(20000, Math.floor(backoffMs * 1.8));
        continue;
      }

      await sleep(backoffMs);
      backoffMs = Math.min(20000, Math.floor(backoffMs * 1.8));
    }
  }
}
