import { Skeleton } from "@/components/ui/skeleton";

export default function ResourcesLoading() {
  return (
    <div className="min-h-screen">
      <div className="bg-navy pb-10 pt-28">
        <div className="mx-auto max-w-7xl px-4">
          <Skeleton className="h-8 w-48 bg-white/20" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}
