import { Link } from "@/i18n/navigation";
import { prisma } from "@/lib/prisma";
import { localeText } from "@/lib/data";
import { ChevronDown } from "lucide-react";

export async function MegaMenu({ locale }: { locale: "en" | "ar" }) {
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
        <span>{locale === "ar" ? "الدورات" : "Courses"}</span>
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
            {superCategories.map((sc) => (
              <div key={sc.id} className="space-y-2">
                <Link
                  href={`/training-subjects/${sc.slug}`}
                  className="group/cat flex items-center gap-2"
                >
                  {sc.image && (
                    <img
                      src={sc.image}
                      alt=""
                      className="h-5 w-5 rounded object-contain"
                      loading="lazy"
                    />
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
                  {locale === "ar" ? "عرض الكل ←" : "View all →"}
                </Link>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t pt-3">
            <Link
              href="/training-subjects"
              className="text-sm font-semibold text-brand hover:underline"
            >
              {locale === "ar" ? "عرض كل التخصصات ←" : "View all Categories →"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
