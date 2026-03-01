export function parseQaPipe(s) {
  const raw = String(s || "").trim();
  if (!raw) return null;
  const i = raw.indexOf("|");
  if (i < 0) return null;

  const q = raw.slice(0, i).trim();
  const a = raw.slice(i + 1).trim();

  if (!q || !a) return null;
  return { question: q, answer: a };
}
