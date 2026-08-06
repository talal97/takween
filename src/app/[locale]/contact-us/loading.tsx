import { Skeleton } from "@/components/ui/skeleton";

export default function ContactLoading() {
  return (
    <div className="min-h-screen">
      <div className="bg-navy pb-10 pt-28">
        <div className="mx-auto max-w-7xl px-4">
          <Skeleton className="h-8 w-48 bg-white/20" />
          <Skeleton className="mt-2 h-4 w-96 bg-white/20" />
        </div>
      </div>
      <div className="mx-auto max-w-4xl px-4 py-10">
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    </div>
  );
}
