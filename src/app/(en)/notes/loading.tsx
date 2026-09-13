import { Skeleton, SkeletonScreen } from "@/components/skeleton";

/* Placeholder for the notes index: the navy band, then the four-wide grid of
   tiles, each with its artwork panel and the lines under it. */
export default function NotesLoading() {
  return (
    <SkeletonScreen label="Loading the notes">
      <div className="flex min-h-screen flex-col bg-bg">
        <div className="border-b border-border bg-bg">
          <div className="mx-auto flex max-w-shell items-center justify-between gap-4 px-6 py-4">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-9 w-32 rounded-lg" />
          </div>
        </div>

        <div className="bg-navy px-5 py-14 md:px-6 md:py-16">
          <div className="mx-auto flex w-full max-w-shell flex-col gap-4">
            <Skeleton className="skeleton-dark h-3.5 w-20" />
            <Skeleton className="skeleton-dark h-9 w-full max-w-lg md:h-12" />
            <Skeleton className="skeleton-dark h-4 w-full max-w-2xl" />
            <Skeleton className="skeleton-dark h-4 w-2/3 max-w-xl" />
          </div>
        </div>

        <div className="mx-auto w-full max-w-shell flex-1 px-5 py-14 md:px-6 md:py-16">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-2xl border border-border bg-white">
                <Skeleton className="aspect-[4/3] w-full rounded-none" />
                <div className="flex flex-col gap-3 p-6">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-11/12" />
                  <Skeleton className="mt-3 h-6 w-full" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </SkeletonScreen>
  );
}
