import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeWorkbook } from "@/lib/excel";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category") || undefined;
  const format = req.nextUrl.searchParams.get("format") || undefined;
  const upcoming = req.nextUrl.searchParams.get("upcoming") === "true";

  const where: Record<string, unknown> = {};
  if (category) where.category = { slug: category };
  if (format) where.schedules = { some: { format } };
  if (upcoming) where.schedules = { some: { endDate: { gte: new Date() } } };

  const courses = await prisma.course.findMany({
    where,
    include: {
      schedules: { orderBy: { startDate: "asc" }, include: { venue: true } },
      category: true,
    },
    orderBy: { code: "asc" },
  });

  const rows: Array<{
    code: string;
    titleEn: string;
    titleAr: string;
    category: string;
    venue: string;
    country: string;
    start: string;
    end: string;
    fee: number;
    currency: string;
    format: string;
  }> = [];

  for (const course of courses) {
    const futureSchedules = upcoming
      ? course.schedules.filter((s) => s.endDate >= new Date())
      : course.schedules;

    if (futureSchedules.length === 0) {
      rows.push({
        code: course.code,
        titleEn: course.titleEn || "",
        titleAr: course.titleAr || "",
        category: course.category?.nameEn || "",
        venue: "",
        country: "",
        start: "",
        end: "",
        fee: 0,
        currency: "",
        format: "",
      });
    } else {
      for (const s of futureSchedules) {
        rows.push({
          code: course.code,
          titleEn: course.titleEn || "",
          titleAr: course.titleAr || "",
          category: course.category?.nameEn || "",
          venue: s.venue.nameEn,
          country: s.venue.country,
          start: s.startDate.toISOString().slice(0, 10),
          end: s.endDate.toISOString().slice(0, 10),
          fee: Number(s.fee),
          currency: s.currency,
          format: s.format,
        });
      }
    }
  }

  const columns = [
    { header: "Code", key: "code", width: 12 },
    { header: "Course (EN)", key: "titleEn", width: 40 },
    { header: "Course (AR)", key: "titleAr", width: 40 },
    { header: "Category", key: "category", width: 24 },
    { header: "Venue", key: "venue", width: 24 },
    { header: "Country", key: "country", width: 18 },
    { header: "Start", key: "start", width: 14 },
    { header: "End", key: "end", width: 14 },
    { header: "Fee", key: "fee", width: 10 },
    { header: "Currency", key: "currency", width: 10 },
    { header: "Format", key: "format", width: 12 },
  ];

  const buf = await writeWorkbook("All Courses", columns, rows);
  return new NextResponse(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="takween-courses.xlsx"`,
    },
  });
}

export const dynamic = "force-dynamic";
