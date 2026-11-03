import { getSettingsCached } from "@/lib/settings";

const GLOBAL_TOKENS: Array<[string, string]> = [
  ["--brand", "color_brand"],
  ["--brand-dark", "color_brand_dark"],
  ["--brand-light", "color_brand_light"],
  ["--navy", "color_navy"],
  ["--gold", "color_gold"],
  ["--background", "color_background"],
  ["--foreground", "color_foreground"],
  ["--ring", "color_ring"],
];

const LOCALE_TOKENS: Array<["en" | "ar", string]> = [
  ["en", "color_brand_en"],
  ["en", "color_navy_en"],
  ["en", "color_gold_en"],
  ["ar", "color_brand_ar"],
  ["ar", "color_navy_ar"],
  ["ar", "color_gold_ar"],
];
const VAR_BY_KEY: Record<string, string> = {
  color_brand_en: "--brand",
  color_navy_en: "--navy",
  color_gold_en: "--gold",
  color_brand_ar: "--brand",
  color_navy_ar: "--navy",
  color_gold_ar: "--gold",
};

export async function ThemeStyle() {
  const settings = await getSettingsCached();

  const globalDefs = GLOBAL_TOKENS.map(([cssVar, key]) => {
    const value = settings[key];
    return value && /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(value) ? `${cssVar}: ${value};` : "";
  }).filter(Boolean);

  const perLocale: Record<string, string[]> = {};
  for (const [locale, key] of LOCALE_TOKENS) {
    const value = settings[key];
    if (value && /^#[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(value)) (perLocale[locale] ??= []).push(`${VAR_BY_KEY[key]}: ${value};`);
  }

  const rules: string[] = [];
  if (globalDefs.length) rules.push(`:root{${globalDefs.join("")}}`);
  for (const [locale, defs] of Object.entries(perLocale)) {
    rules.push(`html[lang="${locale}"]{${defs.join("")}}`);
  }

  if (!rules.length) return null;

  return <style dangerouslySetInnerHTML={{ __html: rules.join("\n") }} />;
}
