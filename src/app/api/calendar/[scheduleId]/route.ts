import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ scheduleId: string }> },
) {
  const { scheduleId } = await params;

  const schedule = await prisma.schedule.findUnique({
    where: { id: scheduleId },
    include: { course: true, venue: true },
  });

  if (!schedule) {
    return NextResponse.json({ error: "Schedule not found" }, { status: 404 });
  }

  const course = schedule.course;
  const venue = schedule.venue;
  const title = course.titleEn || course.titleAr || "Training Course";
  const description = course.subtitleEn || course.subtitleAr || "";
  const location = `${venue.nameEn}, ${venue.country}`;
  const now = formatICSDate(new Date());

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Takween//Training Course//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `DTSTART:${formatICSDate(schedule.startDate)}`,
    `DTEND:${formatICSDate(schedule.endDate)}`,
    `DTSTAMP:${now}`,
    `UID:${scheduleId}@takween.com`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${description.replace(/\n/g, "\\n")}`,
    `LOCATION:${location.replace(/,/g, "\\,")}`,
    "STATUS:CONFIRMED",
    `URL:https://${process.env.NEXT_PUBLIC_SITE_URL || "wazzankw.com"}/en/training-course/${course.slug}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${course.slug}.ics"`,
    },
  });
}
