export function LocaleDir({ locale }: { locale: "en" | "ar" }) {
  const dir = locale === "ar" ? "rtl" : "ltr";
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `document.documentElement.lang=${JSON.stringify(locale)};document.documentElement.dir=${JSON.stringify(dir)};`,
      }}
    />
  );
}
