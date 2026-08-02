import { Link } from "@/i18n/navigation";
import { localeText } from "@/lib/data";
import { formatDateRange } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type Row = {
  id: string;
  course: { slug: string; titleEn: string; titleAr?: string | null; code: string };
  venue: { nameEn: string };
  startDate: Date;
  endDate: Date;
};

export function ScheduleList({ rows, locale }: { rows: Row[]; locale: "en" | "ar" }) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-muted-foreground">
          {locale === "ar" ? "لا توجد دورات مجدولة بعد." : "No scheduled courses yet."}
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-3">
      {rows.map((s) => (
        <Card key={s.id}>
          <CardContent className="pt-6">
            <Link href={`/training-course/${s.course.slug}`} className="group">
              <div className="font-semibold text-navy group-hover:text-brand">{localeText({ en: s.course.titleEn, ar: s.course.titleAr }, locale)}</div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm">
                <Badge variant="secondary">{formatDateRange(s.startDate, s.endDate, locale)}</Badge>
                <Badge variant="secondary">{s.venue.nameEn}</Badge>
                <Badge variant="outline">{s.course.code}</Badge>
              </div>
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}