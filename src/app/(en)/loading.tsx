import { Skeleton, SkeletonScreen } from "@/components/skeleton";

/* Homepage placeholder: sticky bar, the two-column hero, and the first grid of
   cards below it — the part of the page that is on screen before any scroll. */
export default function HomeLoading() {
  return (
    <SkeletonScreen label="Loading the page">
      <div className="flex min-h-screen flex-col bg-bg">
        {/* HEADER */}
        <div className="border-b border-border bg-bg">
          <div className="mx-auto flex max-w-shell items-center justify-between gap-3 px-4 py-3.5 sm:px-6 sm:py-4">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
            <div className="hidden items-center gap-6 md:flex">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-3.5 w-16" />
              ))}
            </div>
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>
        </div>

        {/* HERO */}
        <div className="mx-auto grid w-full max-w-shell items-center gap-16 px-6 pb-16 pt-5 md:pb-24 md:pt-8 lg:grid-cols-2 lg:gap-12">
          <div className="flex flex-col gap-5">
            <Skeleton className="h-6 w-52 rounded-full" />
            <Skeleton className="h-10 w-full md:h-14" />
            <Skeleton className="h-10 w-4/5 md:h-14" />
            <span className="flex flex-col gap-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-11/12" />
              <Skeleton className="h-4 w-2/3" />
            </span>
            <div className="mt-2 flex flex-wrap gap-3">
              <Skeleton className="h-12 w-44 rounded-lg" />
              <Skeleton className="h-12 w-40 rounded-lg" />
            </div>
          </div>
          <Skeleton className="aspect-[1000/483] w-full rounded-xl" />
        </div>

        {/* FIRST SECTION */}
        <div className="border-t border-border bg-white px-6 py-24">
          <div className="mx-auto max-w-shell">
            <div className="mx-auto mb-12 flex max-w-xl flex-col items-center gap-3">
              <Skeleton className="h-8 w-72 md:h-10" />
              <Skeleton className="h-4 w-full max-w-md" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-3 rounded-[18px] border border-border p-6">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3.5 w-5/6" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </SkeletonScreen>
  );
}
