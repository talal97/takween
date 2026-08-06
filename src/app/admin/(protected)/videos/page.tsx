import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { ResourceManager, FieldSpec, RowData } from "@/components/admin/resource-manager";
import { createVideo, updateVideo, deleteVideo } from "../actions-content";

const fields: FieldSpec[] = [
  { key: "titleEn", label: "Title (EN)", type: "text" },
  { key: "titleAr", label: "Title (AR)", type: "text" },
  { key: "youtubeId", label: "YouTube Video ID", type: "text" },
  { key: "sort", label: "Sort", type: "text" },
];

const columns = [
  { key: "titleEn", label: "Title" },
  { key: "youtubeId", label: "YouTube ID" },
  { key: "sort", label: "Sort" },
];

export default async function VideosPage() {
  const items = await prisma.video.findMany({ orderBy: { sort: "asc" } });
  const rows: RowData[] = items.map((v) => ({
    id: v.id,
    titleEn: v.titleEn,
    titleAr: v.titleAr ?? "",
    youtubeId: v.youtubeId,
    sort: v.sort,
  }));

  return (
    <div className="space-y-6">
      <PageHeader title="Videos" description="YouTube videos displayed on the site." />
      <ResourceManager
        title="Video"
        addLabel="Add Video"
        fields={fields}
        items={rows}
        columns={columns}
        onCreate={createVideo}
        onUpdate={updateVideo}
        onDelete={deleteVideo}
      />
    </div>
  );
}
