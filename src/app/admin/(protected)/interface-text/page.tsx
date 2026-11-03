import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { InterfaceTextForm } from "@/components/admin/interface-text-form";

export default async function InterfaceTextPage() {
  const rows = await prisma.siteSetting.findMany({ where: { key: { startsWith: "interface_" } } });
  return <div>
    <PageHeader title="Interface Text" description="Edit English and Arabic menu labels, buttons, course headings, and registration wording." />
    <InterfaceTextForm initial={Object.fromEntries(rows.map(({ key, value }) => [key, value]))} />
  </div>;
}
