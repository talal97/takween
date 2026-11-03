import en from "../../messages/en.json";
import ar from "../../messages/ar.json";

export const interfaceGroups = ["navigation", "common", "course", "form"] as const;
export const interfaceFields = interfaceGroups.flatMap((group) =>
  Object.entries(en[group]).filter(([, value]) => !/[{}<>]/.test(value)).map(([key, value]) => ({
    group, key: `${group}.${key}`, en: value,
    ar: (ar[group] as Record<string, string>)[key] || value,
  }))
);
const allowedKeys = new Set(interfaceFields.map((field) => field.key));
export function interfaceSettingKey(locale: string, key: string) {
  return `interface_${locale}_${key}`;
}

export function validateInterfaceText(values: Record<string, string>) {
  for (const [key, value] of Object.entries(values)) {
    if (!allowedKeys.has(key) || typeof value !== "string" || value.length > 500 || /[{}<>]/.test(value)) {
      throw new Error("Use plain text of up to 500 characters. Braces and HTML tags are not supported.");
    }
  }
}

// Only explicitly editable labels can enter the public translation catalogue.
// Apostrophes are escaped for ICU; HTML and ICU placeholders are not accepted.
export function applyInterfaceText<T extends Record<string, unknown>>(messages: T, settings: Record<string, string>, locale: string): T {
  const result = { ...messages } as Record<string, unknown>;
  for (const group of interfaceGroups) {
    result[group] = { ...(messages[group] as Record<string, string>) };
  }
  for (const field of interfaceFields) {
    const value = settings[interfaceSettingKey(locale, field.key)]?.trim();
    if (!value || value.length > 500 || /[{}<>]/.test(value)) continue;
    const key = field.key.slice(field.group.length + 1);
    (result[field.group] as Record<string, string>)[key] = value.replace(/'/g, "''");
  }
  return result as T;
}
