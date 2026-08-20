import { Skeleton, SkeletonScreen, SkeletonText } from "@/components/skeleton";

/* Privacy and Terms are the same shape — a header, a title, then a stack of
   short sections — so both route placeholders come from here. */
export function LegalSkeleton({ label }: { label: string }) {
  return (
    <SkeletonScreen label={label}>
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

        <div className="mx-auto w-full max-w-shell flex-1 px-6 py-16">
          <Skeleton className="h-9 w-64 md:h-11" />
          <Skeleton className="mt-3 h-3.5 w-44" />

          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="mt-10 flex flex-col gap-4">
              <Skeleton className="h-5 w-56" />
              <SkeletonText lines={4} />
            </div>
          ))}
        </div>
      </div>
    </SkeletonScreen>
  );
}
