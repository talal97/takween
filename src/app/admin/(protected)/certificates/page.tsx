import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { ResourceManager, type FieldSpec } from "@/components/admin/resource-manager";
import { createCertificate, updateCertificate, deleteCertificate } from "@/app/admin/(protected)/actions";

export default async function CertificatesPage() {
  const certificates = await prisma.certificate.findMany({
    orderBy: { nameEn: "asc" },
    include: { _count: { select: { courses: true } } },
  });

  const items = certificates.map((c) => ({
    id: c.id,
    code: c.code,
    nameEn: c.nameEn,
    nameAr: c.nameAr ?? "",
    slug: c.slug,
    description: c.description ?? "",
    logo: c.logo ?? "",
    sort: String(c.sort),
  }));

  const fields: FieldSpec[] = [
    { key: "nameEn", label: "Name (EN)", type: "text" },
    { key: "nameAr", label: "Name (AR)", type: "text" },
    { key: "code", label: "Code", type: "text" },
    { key: "slug", label: "Slug", type: "text" },
    { key: "logo", label: "Logo", type: "upload", image: true },
    { key: "description", label: "Description", type: "textarea" },
    { key: "sort", label: "Sort order", type: "text" },
  ];

  return (
    <div>
      <PageHeader title="Certificates" description="Accreditation / certification bodies (CPD, ILM, PMI...)." />
      <ResourceManager
        title="Certificate"
        addLabel="Add Certificate"
        fields={fields}
        items={items}
        columns={[
          { key: "code", label: "Code" },
          { key: "nameEn", label: "Name" },
          { key: "slug", label: "Slug" },
          { key: "sort", label: "Sort" },
        ]}
        onCreate={createCertificate}
        onUpdate={updateCertificate}
        onDelete={deleteCertificate}
      />
    </div>
  );
}