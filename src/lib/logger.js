import { cfg } from "./config.js";

const levels = { debug: 10, info: 20, warn: 30, error: 40 };

function enabled(lvl) {
  const cur = levels[cfg.LOG_LEVEL] ?? 20;
  return (levels[lvl] ?? 20) >= cur;
}

export const log = {
  debug: (msg, meta = {}) => enabled("debug") && console.log("[debug]", msg, meta),
  info: (msg, meta = {}) => enabled("info") && console.log("[info]", msg, meta),
  warn: (msg, meta = {}) => enabled("warn") && console.warn("[warn]", msg, meta),
  error: (msg, meta = {}) => enabled("error") && console.error("[error]", msg, meta)
};
