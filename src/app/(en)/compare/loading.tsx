import { Skeleton, SkeletonScreen } from "@/components/skeleton";

/* Shown while the /compare segment streams in. The blocks sit on the same grid
   and the same widths as the finished page, so nothing jumps when the real
   table replaces them. */
export default function CompareLoading() {
  return (
    <SkeletonScreen label="Loading the package comparison">
      <div className="flex min-h-screen flex-col bg-bg">
        {/* HEADER */}
        <div className="border-b border-border bg-bg">
          <div className="mx-auto flex max-w-shell items-center justify-between gap-4 px-6 py-4">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-9 w-36 rounded-lg" />
          </div>
        </div>

        {/* HERO */}
        <div className="bg-navy px-5 py-14 md:px-6 md:py-16">
          <div className="mx-auto flex w-full max-w-shell flex-col items-center gap-4 md:items-start">
            <Skeleton className="skeleton-dark h-6 w-44 rounded-full" />
            <Skeleton className="skeleton-dark h-9 w-full max-w-md md:h-12" />
            <Skeleton className="skeleton-dark h-4 w-full max-w-2xl" />
            <Skeleton className="skeleton-dark h-4 w-2/3 max-w-lg" />
          </div>
        </div>

        {/* TABLE */}
        <div className="mx-auto w-full max-w-shell flex-1 px-5 py-14 md:px-6 md:py-16">
          <Skeleton className="h-11 w-full" />

          <div className="mt-4 grid grid-cols-4 border-y border-border py-3">
            <span />
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className="flex flex-col items-center gap-2 px-3">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-7 w-24 rounded-lg" />
              </span>
            ))}
          </div>

          {Array.from({ length: 3 }).map((_, group) => (
            <div key={group}>
              <div className="pb-3 pt-9">
                <Skeleton className="h-5 w-52" />
              </div>
              {Array.from({ length: 4 }).map((_, row) => (
                <div key={row} className="grid grid-cols-4 items-center border-t border-border py-4">
                  <span className="flex flex-col gap-2 pr-6">
                    <Skeleton className="h-3.5 w-4/5" />
                    <Skeleton className="h-3 w-3/5" />
                  </span>
                  {Array.from({ length: 3 }).map((_, mark) => (
                    <span key={mark} className="flex justify-center px-3">
                      <Skeleton className="h-[22px] w-[22px] rounded-full" />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          ))}

          <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-border py-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <span key={i} className="flex items-center gap-2">
                <Skeleton className="h-[22px] w-[22px] rounded-full" />
                <Skeleton className="h-3 w-28" />
              </span>
            ))}
          </div>
        </div>
      </div>
    </SkeletonScreen>
  );
}
