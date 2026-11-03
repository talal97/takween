import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";
import { getSettingsCached } from "@/lib/settings";
import { applyInterfaceText } from "@/lib/interface-text";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: applyInterfaceText((await import(`../../messages/${locale}.json`)).default, await getSettingsCached(), locale),
  };
});
