import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { ResourceManager, type FieldSpec } from "@/components/admin/resource-manager";
import { createVenue, updateVenue, deleteVenue } from "@/app/admin/(protected)/actions";

export default async function VenuesPage() {
  const [venues, regions] = await Promise.all([
    prisma.venue.findMany({ orderBy: { nameEn: "asc" }, include: { region: true } }),
    prisma.region.findMany({ orderBy: { sort: "asc" } }),
  ]);

  const items = venues.map((v) => ({
    id: v.id,
    nameEn: v.nameEn,
    nameAr: v.nameAr ?? "",
    country: v.country,
    flag: v.flag ?? "",
    regionId: v.regionId,
    regionNameEn: v.region?.nameEn ?? "",
    sort: String(v.sort),
  }));

  const fields: FieldSpec[] = [
    { key: "nameEn", label: "Venue (EN)", type: "text" },
    { key: "nameAr", label: "Venue (AR)", type: "text" },
    { key: "country", label: "Country", type: "text" },
    {
      key: "regionId",
      label: "Region",
      type: "select",
      options: regions.map((r) => ({ value: r.id, label: r.nameEn })),
    },
    { key: "sort", label: "Sort order", type: "text" },
  ];

  return (
    <div>
      <PageHeader title="Venues" description="Physical training locations grouped under regions." />
      <ResourceManager
        title="Venue"
        addLabel="Add Venue"
        fields={fields}
        items={items}
        columns={[
          { key: "nameEn", label: "Venue" },
          { key: "country", label: "Country" },
          { key: "regionNameEn", label: "Region" },
        ]}
        onCreate={createVenue}
        onUpdate={updateVenue}
        onDelete={deleteVenue}
      />
    </div>
  );
}