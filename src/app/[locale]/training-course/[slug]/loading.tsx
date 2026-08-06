import { Skeleton } from "@/components/ui/skeleton";

export default function CourseLoading() {
  return (
    <div className="min-h-screen">
      <div className="bg-navy pb-10 pt-28">
        <div className="mx-auto max-w-7xl px-4">
          <Skeleton className="h-8 w-64 bg-white/20" />
          <Skeleton className="mt-2 h-4 w-96 bg-white/20" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-64 w-full rounded-lg" />
          </div>
          <div>
            <Skeleton className="h-80 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  );
}
