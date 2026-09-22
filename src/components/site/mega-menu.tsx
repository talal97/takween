import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/prisma";
import { localeText } from "@/lib/data";
import { ChevronDown } from "lucide-react";
import { getCategoryIcon } from "@/lib/category-icons";

export async function MegaMenu({ locale }: { locale: "en" | "ar" }) {
  const t = await getTranslations("navigation");
  const superCategories = await prisma.superCategory.findMany({
    orderBy: { sort: "asc" },
    include: {
      categories: {
        orderBy: { sort: "asc" },
        select: { id: true, slug: true, nameEn: true, nameAr: true },
      },
    },
  });

  return (
    <div className="mega-menu-trigger">
      <button
        type="button"
        aria-expanded="false"
        className="flex items-center gap-1 py-4 text-sm font-medium text-white transition-colors hover:text-gold"
      >
        <span>{t("courses")}</span>
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      <div className="mega-menu-content absolute inset-x-0 top-full z-50 border-t-2 border-brand bg-white shadow-xl">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="mb-4 border-b border-brand/20 pb-3">
            <span className="text-sm font-semibold text-brand">
              {locale === "ar" ? "اختر تخصصك. ابحث عن دورتك" : "Select your Category. Find Your Course"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
            {superCategories.map((sc) => {
              const FallbackIcon = getCategoryIcon(sc.slug);
              return (
              <div key={sc.id} className="space-y-2">
                <Link
                  href={`/training-subjects/${sc.slug}`}
                  className="group/cat flex items-center gap-2"
                >
                  {sc.icon || sc.image ? (
                    <img
                      src={sc.icon || sc.image || ""}
                      alt=""
                      className="h-6 w-6 rounded object-contain"
                      loading="lazy"
                    />
                  ) : (
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-brand-light text-brand">
                      <FallbackIcon size={14} strokeWidth={1.75} />
                    </span>
                  )}
                  <span className="text-sm font-semibold text-navy transition-colors group-hover/cat:text-brand">
                    {localeText({ en: sc.nameEn, ar: sc.nameAr }, locale)}
                  </span>
                </Link>
                <ul className="space-y-1 ps-7">
                  {sc.categories.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        href={`/training-courses/${cat.slug}`}
                        className="text-xs text-muted-foreground transition-colors hover:text-brand"
                      >
                        {localeText({ en: cat.nameEn, ar: cat.nameAr }, locale)}
                      </Link>
                    </li>
                  ))}
                </ul>
                <Link
                  href={`/training-subjects/${sc.slug}`}
                  className="ms-7 inline-block text-xs font-semibold text-brand hover:underline"
                >
                  {t("viewAll")} →
                </Link>
              </div>
              );
            })}
          </div>
          <div className="mt-4 border-t pt-3">
            <Link
              href="/training-subjects"
              className="text-sm font-semibold text-brand hover:underline"
            >
              {t("viewAllCategories")} →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
