import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { ResourceManager, type FieldSpec } from "@/components/admin/resource-manager";
import { createHeroSlide, updateHeroSlide, deleteHeroSlide } from "../actions-content";

export default async function HeroSlidesPage() {
  const slides = await prisma.heroSlide.findMany({ orderBy: { sort: "asc" } });

  const items = slides.map((s) => ({
    id: s.id,
    image: s.image,
    titleEn: s.titleEn ?? "",
    titleAr: s.titleAr ?? "",
    sort: String(s.sort),
  }));

  const fields: FieldSpec[] = [
    { key: "image", label: "Image", type: "upload", image: true },
    { key: "titleEn", label: "Caption (EN)", type: "text" },
    { key: "titleAr", label: "Caption (AR)", type: "text" },
    { key: "sort", label: "Sort order", type: "text" },
  ];

  return (
    <div>
      <PageHeader
        title="Hero Slides"
        description="Images shown in the rotating homepage banner. Add a few for a slideshow, or leave empty to use the background settings image."
      />
      <ResourceManager
        title="Slide"
        addLabel="Add Slide"
        fields={fields}
        items={items}
        columns={[
          { key: "image", label: "Image", kind: "image" },
          { key: "titleEn", label: "Caption" },
        ]}
        onCreate={createHeroSlide}
        onUpdate={updateHeroSlide}
        onDelete={deleteHeroSlide}
      />
    </div>
  );
}
