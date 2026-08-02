import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { ResourceManager, type FieldSpec } from "@/components/admin/resource-manager";
import { createCountry, updateCountry, deleteCountry } from "@/app/admin/(protected)/actions";

export default async function CountriesPage() {
  const countries = await prisma.country.findMany({ orderBy: { nameEn: "asc" } });

  const items = countries.map((c) => ({
    id: c.iso,
    iso: c.iso,
    nameEn: c.nameEn,
    nameAr: c.nameAr ?? "",
    currency: c.currency ?? "",
  }));

  const fields: FieldSpec[] = [
    { key: "iso", label: "ISO code", type: "text" },
    { key: "nameEn", label: "English name", type: "text" },
    { key: "nameAr", label: "Arabic name", type: "text" },
    { key: "currency", label: "Currency", type: "text" },
  ];

  return (
    <div>
      <PageHeader title="Countries" description="Manage the country list used in registration forms." />
      <ResourceManager
        title="Country"
        addLabel="Add Country"
        fields={fields}
        items={items}
        columns={[
          { key: "iso", label: "ISO" },
          { key: "nameEn", label: "English" },
          { key: "nameAr", label: "Arabic", ar: true },
          { key: "currency", label: "Currency" },
        ]}
        onCreate={createCountry}
        onUpdate={updateCountry}
        onDelete={deleteCountry}
      />
    </div>
  );
}