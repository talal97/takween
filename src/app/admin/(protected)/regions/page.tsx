import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { ResourceManager, type FieldSpec } from "@/components/admin/resource-manager";
import { createRegion, updateRegion, deleteRegion } from "@/app/admin/(protected)/actions";

export default async function RegionsPage() {
  const regions = await prisma.region.findMany({ orderBy: { sort: "asc" } });

  const items = regions.map((r) => ({
    id: r.id,
    slug: r.slug,
    nameEn: r.nameEn,
    nameAr: r.nameAr ?? "",
    icon: r.icon ?? "",
    sort: String(r.sort),
  }));

  const fields: FieldSpec[] = [
    { key: "nameEn", label: "Name (EN)", type: "text" },
    { key: "nameAr", label: "Name (AR)", type: "text" },
    { key: "slug", label: "Slug (auto-generated from region name if blank)", type: "text" },
    { key: "sort", label: "Sort order", type: "text" },
  ];

  return (
    <div>
      <PageHeader title="Regions" description="Geographic training regions grouping venues." />
      <ResourceManager
        title="Region"
        addLabel="Add Region"
        fields={fields}
        items={items}
        columns={[
          { key: "nameEn", label: "Name" },
          { key: "slug", label: "Slug" },
          { key: "sort", label: "Sort" },
        ]}
        onCreate={createRegion}
        onUpdate={updateRegion}
        onDelete={deleteRegion}
      />
    </div>
  );
}