import { Skeleton } from "@/components/ui/skeleton";

export default function CalendarLoading() {
  return (
    <div className="min-h-screen">
      <div className="bg-navy pb-10 pt-28">
        <div className="mx-auto max-w-7xl px-4">
          <Skeleton className="h-8 w-64 bg-white/20" />
          <Skeleton className="mt-2 h-4 w-96 bg-white/20" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-10 space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i}>
            <Skeleton className="h-6 w-32 mb-4" />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <Skeleton key={j} className="h-32 w-full rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
