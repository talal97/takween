import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { ResourceManager, type FieldSpec } from "@/components/admin/resource-manager";
import { createProvider, updateProvider, deleteProvider } from "../actions-content";

export default async function ProvidersPage() {
  const [providers, courses] = await Promise.all([
    prisma.providerAssociation.findMany({ orderBy: { sort: "asc" } }),
    prisma.course.findMany({ orderBy: { titleEn: "asc" } }),
  ]);

  const items = providers.map((p) => ({
    id: p.id,
    code: p.code,
    nameEn: p.nameEn,
    logo: p.logo ?? "",
    url: p.url ?? "",
    kind: p.kind,
    courseId: p.courseId ?? "",
    courseName: p.courseId ? courses.find((c) => c.id === p.courseId)?.titleEn ?? "" : "",
    sort: String(p.sort),
  }));

  const fields: FieldSpec[] = [
    { key: "nameEn", label: "Provider Name", type: "text" },
    { key: "code", label: "Code (e.g. KHDA, NASBA)", type: "text" },
    { key: "logo", label: "Logo", type: "upload", image: true },
    { key: "url", label: "Website", type: "text" },
    {
      key: "kind",
      label: "Kind",
      type: "select",
      options: [
        { value: "endorsed", label: "Endorsed" },
        { value: "association", label: "Association" },
      ],
    },
    {
      key: "courseId",
      label: "Show on course",
      type: "select",
      options: [
        { value: "", label: "All courses (global)" },
        ...courses.map((c) => ({ value: c.id, label: c.titleEn || c.titleAr || c.slug })),
      ],
    },
    { key: "sort", label: "Sort order", type: "text" },
  ];

  return (
    <div>
      <PageHeader title="Providers & Associations" description="Accreditation bodies and industry partners." />
      <ResourceManager
        title="Provider"
        addLabel="Add Provider"
        fields={fields}
        items={items}
        columns={[
          { key: "nameEn", label: "Name" },
          { key: "code", label: "Code" },
          { key: "kind", label: "Kind" },
          { key: "courseName", label: "Course" },
        ]}
        onCreate={createProvider}
        onUpdate={updateProvider}
        onDelete={deleteProvider}
      />
    </div>
  );
}