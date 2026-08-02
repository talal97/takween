import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { ResourceManager, type FieldSpec } from "@/components/admin/resource-manager";
import { createClient, updateClient, deleteClient } from "@/app/admin/(protected)/actions";

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({ orderBy: { sort: "asc" } });

  const items = clients.map((c) => ({
    id: c.id,
    nameEn: c.nameEn,
    logo: c.logo ?? "",
    url: c.url ?? "",
    sort: String(c.sort),
  }));

  const fields: FieldSpec[] = [
    { key: "nameEn", label: "Name", type: "text" },
    { key: "logo", label: "Logo", type: "upload", image: true },
    { key: "url", label: "Website", type: "text" },
    { key: "sort", label: "Sort order", type: "text" },
  ];

  return (
    <div>
      <PageHeader title="Clients" description="Client names and logos shown on the homepage." />
      <ResourceManager
        title="Client"
        addLabel="Add Client"
        fields={fields}
        items={items}
        columns={[
          { key: "nameEn", label: "Name" },
          { key: "logo", label: "Logo", kind: "image" },
        ]}
        onCreate={createClient}
        onUpdate={updateClient}
        onDelete={deleteClient}
      />
    </div>
  );
}