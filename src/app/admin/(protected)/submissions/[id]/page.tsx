import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import NextLink from "next/link";
import { StatusButton } from "@/components/admin/status-button";
import { AdminNoteForm } from "@/components/admin/admin-note-form";

export const dynamic = "force-dynamic";

export default async function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const r = await prisma.registration.findUnique({ where: { id } });
  if (!r) notFound();

  const country =
    r.countryIso && (await prisma.country.findUnique({ where: { iso: r.countryIso } }));

  const rows: Array<[string, React.ReactNode]> = [
    ["Status", <Badge key="s" variant={r.status === "new" ? "default" : "secondary"}>{r.status}</Badge>],
    ["Course", <span key="c">{r.courseTitle}{r.courseCode ? ` (${r.courseCode})` : ""}</span>],
    ["Preferred Schedule", r.scheduleSummary || "—"],
    ["Full Name", r.fullName],
    ["Email", <a key="e" href={`mailto:${r.email}`} className="text-brand hover:underline">{r.email}</a>],
    ["Phone", r.phone || "—"],
    ["Country", country ? `${country.nameEn}${country.nameAr ? ` / ${country.nameAr}` : ""}` : r.countryIso || "—"],
    ["Company", r.company || "—"],
    ["Job Title", r.designation || "—"],
    ["Payment Mode", r.paymentMode || "—"],
    ["Locale", r.locale || "en"],
    ["Submitted", r.createdAt.toLocaleString()],
  ];

  return (
    <div>
      <PageHeader title="Registration Detail" description={r.fullName} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
                {rows.map(([label, value]) => (
                  <div key={label} className="border-b pb-2">
                    <dt className="text-xs font-semibold uppercase text-muted-foreground">{label}</dt>
                    <dd className="mt-1 text-sm text-navy">{value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold text-navy">Message</h3>
              <p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">
                {r.message || "No message was provided."}
              </p>
            </CardContent>
          </Card>

          {r.billingInfo && (
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold text-navy">Billing / Company Details</h3>
                <pre className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">
                  {JSON.stringify(r.billingInfo, null, 2)}
                </pre>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="pt-6">
              <h3 className="mb-3 font-semibold text-navy">Admin Note</h3>
              <AdminNoteForm id={r.id} note={r.adminNote || ""} />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardContent className="space-y-3 pt-6">
              <StatusButton id={r.id} status={r.status} />
              <NextLink
                href="/admin/submissions"
                className="block w-full rounded-md border px-4 py-2 text-center text-sm font-medium text-muted-foreground hover:bg-muted"
              >
                ← Back to list
              </NextLink>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}