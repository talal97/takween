import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { ResourceManager, type FieldSpec } from "@/components/admin/resource-manager";
import { createFaq, updateFaq, deleteFaq } from "../actions-content";

export default async function FaqsPage() {
  const [faqs, categories] = await Promise.all([
    prisma.faq.findMany({ orderBy: { sort: "asc" } }),
    prisma.category.findMany({ orderBy: { sort: "asc" } }),
  ]);

  const items = faqs.map((f) => ({
    id: f.id,
    questionEn: f.questionEn,
    questionAr: f.questionAr ?? "",
    answerEn: f.answerEn,
    answerAr: f.answerAr ?? "",
    categoryId: f.categoryId,
    categoryNameEn: categories.find((c) => c.id === f.categoryId)?.nameEn ?? "",
    sort: String(f.sort),
  }));

  const fields: FieldSpec[] = [
    { key: "questionEn", label: "Question (EN)", type: "text" },
    { key: "questionAr", label: "Question (AR)", type: "text" },
    { key: "answerEn", label: "Answer (EN)", type: "textarea" },
    { key: "answerAr", label: "Answer (AR)", type: "textarea" },
    {
      key: "categoryId",
      label: "Category",
      type: "select",
      options: categories.map((c) => ({ value: c.id, label: c.nameEn })),
    },
    { key: "sort", label: "Sort order", type: "text" },
  ];

  return (
    <div>
      <PageHeader title="FAQs" description="Frequently asked questions shown on course pages." />
      <ResourceManager
        title="FAQ"
        addLabel="Add FAQ"
        fields={fields}
        items={items}
        columns={[
          { key: "questionEn", label: "Question" },
          { key: "categoryNameEn", label: "Category" },
        ]}
        onCreate={createFaq}
        onUpdate={updateFaq}
        onDelete={deleteFaq}
      />
    </div>
  );
}