import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { ResourceManager, type FieldSpec } from "@/components/admin/resource-manager";
import { createDownload, updateDownload, deleteDownload } from "@/app/admin/(protected)/actions";

export default async function DownloadsPage() {
  const downloads = await prisma.download.findMany({ orderBy: { sort: "asc" } });

  const items = downloads.map((d) => ({
    id: d.id,
    titleEn: d.titleEn,
    titleAr: d.titleAr ?? "",
    fileUrl: d.fileUrl,
    type: d.type,
    sort: String(d.sort),
  }));

  const fields: FieldSpec[] = [
    { key: "titleEn", label: "Title (EN)", type: "text" },
    { key: "titleAr", label: "Title (AR)", type: "text" },
    { key: "fileUrl", label: "File (PDF / Excel)", type: "upload" },
    {
      key: "type",
      label: "Type",
      type: "select",
      options: [
        { value: "catalogue", label: "Catalogue" },
        { value: "brochure", label: "Brochure" },
        { value: "schedule", label: "Schedule" },
        { value: "other", label: "Other" },
      ],
    },
    { key: "sort", label: "Sort order", type: "text" },
  ];

  return (
    <div>
      <PageHeader title="Downloads & Resources" description="PDFs, brochures and catalogues offered to visitors." />
      <ResourceManager
        title="Download"
        addLabel="Add Download"
        fields={fields}
        items={items}
        columns={[
          { key: "titleEn", label: "Title" },
          { key: "type", label: "Type" },
          { key: "fileUrl", label: "Link", kind: "link" },
        ]}
        onCreate={createDownload}
        onUpdate={updateDownload}
        onDelete={deleteDownload}
      />
    </div>
  );
}