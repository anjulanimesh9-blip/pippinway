import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "lib",
  "i18n",
  "locales"
);
const en = JSON.parse(fs.readFileSync(path.join(dir, "en.json"), "utf8"));

function merge(base, overlay) {
  const out = { ...base };
  for (const [key, value] of Object.entries(overlay)) {
    out[key] =
      value && typeof value === "object" && !Array.isArray(value)
        ? merge(
            base[key] && typeof base[key] === "object" ? base[key] : {},
            value
          )
        : value;
  }
  return out;
}

const si = merge(
  en,
  JSON.parse(fs.readFileSync(path.join(dir, "_si_overlay.json"), "utf8"))
);
const dv = merge(
  en,
  JSON.parse(fs.readFileSync(path.join(dir, "_dv_overlay.json"), "utf8"))
);

fs.writeFileSync(path.join(dir, "si.json"), JSON.stringify(si, null, 2) + "\n", "utf8");
fs.writeFileSync(path.join(dir, "dv.json"), JSON.stringify(dv, null, 2) + "\n", "utf8");
console.log("wrote si.json and dv.json");
