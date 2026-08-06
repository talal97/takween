import { Skeleton } from "@/components/ui/skeleton";

export default function AboutLoading() {
  return (
    <div className="min-h-screen">
      <div className="bg-navy pb-10 pt-28">
        <div className="mx-auto max-w-7xl px-4">
          <Skeleton className="h-8 w-48 bg-white/20" />
          <Skeleton className="mt-2 h-4 w-64 bg-white/20" />
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-10 space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="grid grid-cols-3 gap-4 pt-8">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
