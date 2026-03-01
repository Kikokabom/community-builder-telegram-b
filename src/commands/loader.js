import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export function registerCommands(bot) {
  const dir = path.dirname(fileURLToPath(import.meta.url));

  const files = fs
    .readdirSync(dir)
    .filter(
      (f) =>
        f.endsWith(".js") &&
        f !== "loader.js" &&
        !f.startsWith("_")
    )
    .sort();

  for (const f of files) {
    const url = pathToFileURL(path.join(dir, f)).href;
    import(url)
      .then((mod) => {
        const fn = mod?.default || mod?.register;
        if (typeof fn === "function") fn(bot);
        else console.warn("[commands] skipped (no register export)", { file: f });
      })
      .catch((e) => {
        console.error("[commands] failed to load", { file: f, err: e?.message || String(e) });
      });
  }
}
