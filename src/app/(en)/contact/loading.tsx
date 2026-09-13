import { Skeleton, SkeletonScreen } from "@/components/skeleton";

export default function ContactLoading() {
  return (
    <SkeletonScreen label="Loading the enquiry form">
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
            <Skeleton className="skeleton-dark h-3.5 w-32" />
            <Skeleton className="skeleton-dark h-9 w-full max-w-lg md:h-12" />
            <Skeleton className="skeleton-dark h-4 w-full max-w-2xl" />
          </div>
        </div>

        <div className="mx-auto w-full max-w-shell flex-1 px-5 py-14 md:px-6 md:py-16">
          <div className="flex max-w-2xl flex-col gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-12 w-full rounded-lg" />
              </div>
            ))}
            <div className="flex flex-col gap-2">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-36 w-full rounded-lg" />
            </div>
            <Skeleton className="h-12 w-44 rounded-lg" />
          </div>
        </div>
      </div>
    </SkeletonScreen>
  );
}
