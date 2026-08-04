import { describe, it, expect } from "vitest";
import { buildEmail, type EmailInput } from "@/lib/emails/templates";
import { renderEmail } from "@/lib/emails/render";

const base: EmailInput = {
  type: "register",
  locale: "en",
  brand: "Takween",
  tagline: "Training & Professional Development",
  fullName: "Jane Doe",
  courseTitle: "LEED Green Associate",
  courseCode: "LEED-101",
  email: "jane@example.com",
  phone: "+971 55 000 0000",
  venue: "Dubai, UAE",
  startDate: "17 Aug 2026",
  endDate: "21 Aug 2026",
  fee: "5950",
  currency: "USD",
  paymentMode: "invoice-company",
  message: "Looking forward to it.",
};

describe("email templates", () => {
  it("renders an English customer registration email with details", () => {
    const { subject, html, text } = buildEmail(base, "customer");
    expect(subject).toContain("LEED Green Associate");
    expect(html).toContain("Thank you for registering");
    expect(html).toContain("Jane Doe");
    expect(html).toContain("USD 5950");
    expect(html).toContain("invoice-company");
    expect(text).toContain("Course: LEED Green Associate");
    expect(html).toContain('dir="ltr"');
  });

  it("renders an Arabic customer email RTL with Arabic copy", () => {
    const { subject, html } = buildEmail({ ...base, locale: "ar" }, "customer");
    expect(subject).toContain("تم استلام طلب التسجيل");
    expect(html).toContain("شكراً لتسجيلك");
    expect(html).toContain('dir="rtl"');
    expect(html).toContain('lang="ar"');
  });

  it("uses per-type subjects and admin titles", () => {
    expect(buildEmail({ ...base, type: "contact" }, "customer").subject).toBe("Thank you for contacting us");
    expect(buildEmail({ ...base, type: "online" }, "admin").subject).toContain("New online request");
    expect(buildEmail({ ...base, type: "inhouse" }, "admin").html).toContain("New in-house training request");
    expect(buildEmail({ ...base, type: "enquiry" }, "customer").html).toContain("Enquiry received");
  });

  it("adds the admin CTA only when an admin URL is provided", () => {
    const without = buildEmail(base, "admin");
    expect(without.html).not.toContain("Open in admin panel");
    const withUrl = buildEmail({ ...base, adminUrl: "https://takween.com/admin/submissions" }, "admin");
    expect(withUrl.html).toContain("Open in admin panel");
    expect(withUrl.html).toContain("https://takween.com/admin/submissions");
  });

  it("escapes HTML in user-supplied values", () => {
    const { html } = buildEmail({ ...base, fullName: "<script>alert(1)</script>" }, "customer");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("renderEmail emits a full document shell", () => {
    const html = renderEmail({
      locale: "en",
      brand: "Takween",
      tagline: "Tag",
      title: "Hi",
      greeting: "Dear X,",
      paragraphs: ["Body text"],
      closing: "Regards",
    });
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("Takween");
  });
});
