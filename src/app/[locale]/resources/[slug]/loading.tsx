import { Skeleton } from "@/components/ui/skeleton";

export default function ArticleLoading() {
  return (
    <div className="min-h-screen">
      <div className="bg-navy pb-10 pt-28">
        <div className="mx-auto max-w-7xl px-4">
          <Skeleton className="h-8 w-64 bg-white/20" />
        </div>
      </div>
      <div className="mx-auto max-w-3xl px-4 py-10 space-y-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-48" />
        <div className="space-y-3 pt-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    </div>
  );
}
