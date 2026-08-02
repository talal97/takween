import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const format = (req.nextUrl.searchParams.get("format") || "xlsx").toLowerCase();

  const course = await prisma.course.findUnique({
    where: { slug },
    include: {
      schedules: { orderBy: { startDate: "asc" }, include: { venue: true } },
      category: true,
    },
  });
  if (!course) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const title = course.titleEn || slug;
  const rows = course.schedules.map((s) => ({
    code: course.code,
    title,
    venue: s.venue.nameEn,
    country: s.venue.country,
    start: s.startDate.toISOString().slice(0, 10),
    end: s.endDate.toISOString().slice(0, 10),
    fee: Number(s.fee),
    currency: s.currency,
    format: s.format,
  }));

  if (format === "pdf") {
    const pdfmakeModule = await import("pdfmake/build/pdfmake");
    const vfsModule = await import("pdfmake/build/vfs_fonts");
    const pm = pdfmakeModule.default || pdfmakeModule;
    pm.vfs = vfsModule.default.vfs || vfsModule.vfs;
    pm.fonts = {
      Roboto: {
        normal: "Roboto-Regular.ttf",
        bold: "Roboto-Medium.ttf",
        italics: "Roboto-Italic.ttf",
        bolditalics: "Roboto-MediumItalic.ttf",
      },
    };

    const dd = {
      pageSize: "A4" as const,
      pageOrientation: "landscape" as const,
      content: [
        { text: title, style: "title" },
        { text: `${course.code}  •  ${course.category?.nameEn ?? ""}`, style: "subtitle" },
        {
          table: {
            headerRows: 1,
            widths: ["auto", "*", "auto", "auto", "auto", "auto", "auto"],
            body: [
              ["Code", "Course", "Venue", "Start", "End", "Fee", "Format"],
              ...rows.map((r) => [r.code, r.title, `${r.venue} / ${r.country}`, r.start, r.end, `${r.currency} ${r.fee}`, r.format]),
            ],
          },
        },
      ],
      styles: { title: { fontSize: 16, bold: true, margin: [0, 0, 0, 4] }, subtitle: { fontSize: 11, margin: [0, 0, 0, 12], color: "#555" } },
    };
const buffer = pm.createPdf(dd);
    return new Promise<Response>((resolve) => {
      buffer.getBuffer((b: Buffer) =>
        resolve(
          new NextResponse(new Uint8Array(b), {
            headers: { "Content-Type": "application/pdf", "Content-Disposition": `attachment; filename="${slug}.pdf"` },
          }),
        ),
      );
    });
  }

  const ExcelJS = await import("exceljs");
  const wb = new ExcelJS.default.Workbook();
  const ws = wb.addWorksheet("Schedules");
  ws.columns = [
    { header: "Code", key: "code", width: 12 },
    { header: "Course", key: "title", width: 40 },
    { header: "Venue", key: "venue", width: 24 },
    { header: "Country", key: "country", width: 18 },
    { header: "Start", key: "start", width: 14 },
    { header: "End", key: "end", width: 14 },
    { header: "Fee", key: "fee", width: 10 },
    { header: "Currency", key: "currency", width: 10 },
    { header: "Format", key: "format", width: 12 },
  ];
  ws.addRows(rows);
  ws.getRow(1).font = { bold: true };
  const buf = await wb.xlsx.writeBuffer();
  return new NextResponse(new Uint8Array(buf as ArrayBuffer), {
    headers: { "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "Content-Disposition": `attachment; filename="${slug}.xlsx"` },
  });
}

export const dynamic = "force-dynamic";