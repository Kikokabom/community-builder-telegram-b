function parseCsvIds(s) {
  const raw = String(s || "").trim();
  if (!raw) return [];
  return raw
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean)
    .map((x) => Number(x))
    .filter((n) => Number.isFinite(n));
}

export const cfg = {
  TELEGRAM_BOT_TOKEN: process.env.TELEGRAM_BOT_TOKEN,
  MONGODB_URI: process.env.MONGODB_URI || "",
  BOT_ADMIN_IDS: parseCsvIds(process.env.BOT_ADMIN_IDS || ""),
  LOG_LEVEL: String(process.env.LOG_LEVEL || "info").toLowerCase()
};
