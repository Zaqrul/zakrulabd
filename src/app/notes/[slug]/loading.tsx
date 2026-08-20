import { Skeleton, SkeletonScreen, SkeletonText } from "@/components/skeleton";

/* Placeholder for a single note: banner, the meta line, the headline, the
   standfirst, then the body. Widths follow the real article, so the text does
   not jump sideways when it replaces this. */
export default function NoteLoading() {
  return (
    <SkeletonScreen label="Loading the article">
      <div className="flex min-h-screen flex-col bg-bg">
        <div className="border-b border-border bg-bg">
          <div className="mx-auto flex max-w-shell items-center justify-between gap-4 px-6 py-4">
            <div className="flex items-center gap-2.5">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-9 w-28 rounded-lg" />
          </div>
        </div>

        <div className="mx-auto w-full max-w-shell flex-1 px-5 py-12 md:px-6 md:py-16">
          <Skeleton className="mb-8 h-44 w-full rounded-2xl md:h-64" />

          <div className="flex flex-wrap items-center gap-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>

          <Skeleton className="mt-4 h-9 w-full max-w-2xl md:h-12" />
          <Skeleton className="mt-3 h-9 w-2/3 max-w-xl md:h-12" />

          <div className="mt-5 flex flex-col gap-2 border-b border-border pb-8">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
          </div>

          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="mt-9 flex flex-col gap-4">
              <Skeleton className="h-5 w-72" />
              <SkeletonText lines={4} />
            </div>
          ))}
        </div>
      </div>
    </SkeletonScreen>
  );
}
