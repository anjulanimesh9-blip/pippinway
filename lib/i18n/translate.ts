type Dict = Record<string, unknown>;

export function lookupKey(dict: Dict, key: string): string | undefined {
  const value = key.split(".").reduce<unknown>((acc, part) => {
    if (acc && typeof acc === "object" && part in acc) {
      return (acc as Dict)[part];
    }
    return undefined;
  }, dict);
  return typeof value === "string" ? value : undefined;
}

export function interpolate(
  template: string,
  vars?: Record<string, string | number>
): string {
  if (!vars) return template;
  return template.replace(/\{\{(\w+)\}\}/g, (_, name: string) =>
    vars[name] === undefined ? `{{${name}}}` : String(vars[name])
  );
}

function humanizeKey(key: string): string {
  const last = key.includes(".") ? key.slice(key.lastIndexOf(".") + 1) : key;
  return last
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]+/g, " ")
    .replace(/^\w/, (ch) => ch.toUpperCase());
}

export function translate(
  locale: Dict,
  fallback: Dict,
  key: string,
  vars?: Record<string, string | number>
): string {
  const raw = lookupKey(locale, key) ?? lookupKey(fallback, key);
  if (raw === undefined) {
    return interpolate(humanizeKey(key), vars);
  }
  return interpolate(raw, vars);
}
