const BRAND_NAVY = "#0e2a45";
const BRAND_TEAL = "#026481";
const GOLD = "#f5a623";
const TEXT = "#1f2937";
const MUTED = "#6b7280";
const BORDER = "#e5e7eb";
const BG = "#f4f6f8";

export type EmailContent = {
  locale: "en" | "ar";
  brand: string;
  tagline: string;
  title: string;
  greeting: string;
  paragraphs: string[];
  table?: Array<{ label: string; value: string }>;
  cta?: { label: string; url: string };
  closing: string;
  footerNote?: string;
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildTable(rows: EmailContent["table"]): string {
  if (!rows || rows.length === 0) return "";
  const cells = rows
    .map(
      (r) => `
        <tr>
          <td style="padding:10px 16px;border-bottom:1px solid ${BORDER};font-size:13px;color:${MUTED};width:38%;vertical-align:top;">${escapeHtml(r.label)}</td>
          <td style="padding:10px 16px;border-bottom:1px solid ${BORDER};font-size:13px;color:${TEXT};font-weight:600;vertical-align:top;">${escapeHtml(r.value)}</td>
        </tr>`,
    )
    .join("");
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0;border:1px solid ${BORDER};border-radius:10px;overflow:hidden;">
      <tbody>${cells}</tbody>
    </table>`;
}

export function renderEmail(content: EmailContent): string {
  const { locale, brand, tagline, title, greeting, paragraphs, table, cta, closing, footerNote } = content;
  const dir = locale === "ar" ? "rtl" : "ltr";
  const fontFamily = locale === "ar"
    ? "'Segoe UI', Tahoma, Arial, sans-serif"
    : "Arial, Helvetica, sans-serif";

  const body = paragraphs.map((p) => `<p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:${TEXT};">${escapeHtml(p)}</p>`).join("");

  const button = cta
    ? `
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:22px 0;">
        <tr>
          <td align="${dir === "rtl" ? "right" : "left"}">
            <a href="${escapeHtml(cta.url)}" style="display:inline-block;background:${BRAND_TEAL};color:#ffffff;text-decoration:none;font-size:14px;font-weight:bold;padding:12px 26px;border-radius:8px;">
              ${escapeHtml(cta.label)}
            </a>
          </td>
        </tr>
      </table>`
    : "";

  return `<!DOCTYPE html>
<html lang="${locale}" dir="${dir}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
</head>
<body style="margin:0;padding:0;background:${BG};font-family:${fontFamily};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BG};">
    <tr>
      <td align="center" style="padding:28px 14px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid ${BORDER};box-shadow:0 6px 24px rgba(14,42,69,0.08);">
          <tr>
            <td style="background:linear-gradient(135deg, ${BRAND_NAVY} 0%, ${BRAND_TEAL} 100%);padding:26px 34px;">
              <span style="font-size:22px;font-weight:bold;color:#ffffff;">${escapeHtml(brand)}</span>
              <span style="display:block;margin-top:4px;font-size:12px;color:${GOLD};letter-spacing:0.06em;">${escapeHtml(tagline)}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:34px;">
              <h1 style="margin:0 0 18px;font-size:20px;color:${BRAND_NAVY};line-height:1.35;">${escapeHtml(title)}</h1>
              ${greeting ? `<p style="margin:0 0 14px;font-size:14px;color:${TEXT};">${escapeHtml(greeting)}</p>` : ""}
              ${body}
              ${buildTable(table)}
              ${button}
              <p style="margin:22px 0 0;font-size:13px;color:${TEXT};">${escapeHtml(closing)}</p>
            </td>
          </tr>
          <tr>
            <td style="background:${BG};padding:18px 34px;border-top:1px solid ${BORDER};">
              <p style="margin:0;font-size:12px;color:${MUTED};line-height:1.6;">
                ${escapeHtml(brand)} &middot; ${footerNote ? escapeHtml(footerNote) : ""}
              </p>
              <p style="margin:6px 0 0;font-size:11px;color:${MUTED};">&copy; ${new Date().getFullYear()} ${escapeHtml(brand)}. ${locale === "ar" ? "جميع الحقوق محفوظة." : "All rights reserved."}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export function renderPlainText(content: EmailContent): string {
  const rows = content.table ? content.table.map((r) => `${r.label}: ${r.value}`).join("\n") : "";
  return [
    content.title,
    "",
    content.greeting,
    "",
    ...content.paragraphs,
    "",
    rows,
    content.cta ? `${content.cta.label}: ${content.cta.url}` : "",
    "",
    content.closing,
    "",
    `${content.brand} — ${content.footerNote ?? ""}`,
  ].filter(Boolean).join("\n");
}
