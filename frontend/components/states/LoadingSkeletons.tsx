function SkeletonBlock({ className }: { className: string }) {
  return <div className={`animate-pulse rounded-sm bg-zinc-100 ${className}`} />;
}

function SidebarSkeleton() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col items-center text-center">
        <SkeletonBlock className="mb-4 h-24 w-24 rounded-full" />
        <SkeletonBlock className="h-5 w-28" />
        <SkeletonBlock className="mt-3 h-4 w-40" />
        <div className="mt-6 flex w-full justify-center gap-8 border-y border-zinc-100 py-4">
          <SkeletonBlock className="h-10 w-12" />
          <SkeletonBlock className="h-10 w-12" />
          <SkeletonBlock className="h-10 w-12" />
        </div>
      </div>
      <div className="space-y-3">
        <SkeletonBlock className="h-4 w-16" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-4/5" />
      </div>
      <div className="space-y-3">
        <SkeletonBlock className="h-4 w-16" />
        <div className="flex flex-wrap gap-2">
          <SkeletonBlock className="h-6 w-16" />
          <SkeletonBlock className="h-6 w-20" />
          <SkeletonBlock className="h-6 w-14" />
        </div>
      </div>
    </div>
  );
}

function FeedSkeleton() {
  return (
    <div className="space-y-16">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="border-b border-zinc-100 pb-12">
          <SkeletonBlock className="mb-4 h-4 w-44" />
          <SkeletonBlock className="mb-4 h-10 w-5/6" />
          <SkeletonBlock className="mb-3 h-4 w-full" />
          <SkeletonBlock className="mb-6 h-4 w-11/12" />
          <div className="flex gap-2">
            <SkeletonBlock className="h-6 w-14" />
            <SkeletonBlock className="h-6 w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <main className="w-full">
      <section className="relative mb-16 h-[60vh] min-h-[400px] w-full bg-zinc-100 md:mb-24" />
      <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8 md:pb-24">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-24">
          <div className="lg:col-span-8">
            <FeedSkeleton />
          </div>
          <div className="hidden lg:col-span-4 lg:block">
            <SidebarSkeleton />
          </div>
        </div>
      </div>
    </main>
  );
}

export function ContentPageSkeleton() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 md:py-24">
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-24">
        <div className="lg:col-span-8">
          <SkeletonBlock className="mb-4 h-10 w-40" />
          <SkeletonBlock className="mb-16 h-4 w-56" />
          <FeedSkeleton />
        </div>
        <div className="hidden lg:col-span-4 lg:block">
          <SidebarSkeleton />
        </div>
      </div>
    </main>
  );
}

export function ArchivePageSkeleton() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 md:py-24">
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-24">
        <div className="lg:col-span-8">
          <SkeletonBlock className="mb-4 h-10 w-32" />
          <SkeletonBlock className="mb-16 h-4 w-48" />
          <div className="space-y-16">
            {Array.from({ length: 2 }).map((_, sectionIndex) => (
              <div key={sectionIndex}>
                <SkeletonBlock className="mb-8 h-8 w-20" />
                <div className="space-y-6 border-l border-zinc-100 pl-6">
                  {Array.from({ length: 3 }).map((__, itemIndex) => (
                    <div key={itemIndex}>
                      <SkeletonBlock className="mb-3 h-6 w-5/6" />
                      <SkeletonBlock className="h-4 w-36" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="hidden lg:col-span-4 lg:block">
          <SidebarSkeleton />
        </div>
      </div>
    </main>
  );
}

export function ArticlePageSkeleton() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 md:py-24">
      <article className="mx-auto max-w-none">
        <header className="mb-16 text-center">
          <SkeletonBlock className="mx-auto mb-6 h-4 w-56" />
          <SkeletonBlock className="mx-auto mb-8 h-14 w-3/4" />
          <div className="flex justify-center gap-2">
            <SkeletonBlock className="h-7 w-16" />
            <SkeletonBlock className="h-7 w-16" />
            <SkeletonBlock className="h-7 w-20" />
          </div>
        </header>
        <SkeletonBlock className="mb-16 aspect-[21/9] w-full" />
        <div className="space-y-6">
          <SkeletonBlock className="h-6 w-full" />
          <SkeletonBlock className="h-6 w-11/12" />
          <SkeletonBlock className="h-6 w-10/12" />
          <SkeletonBlock className="h-40 w-full" />
        </div>
      </article>
    </main>
  );
}

export function AboutPageSkeleton() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 md:py-24">
      <SkeletonBlock className="mb-16 aspect-[21/9] w-full" />
      <SkeletonBlock className="mx-auto mb-6 h-12 w-40" />
      <SkeletonBlock className="mx-auto mb-16 h-6 w-56" />
      <div className="space-y-12">
        <SkeletonBlock className="h-8 w-40" />
        <SkeletonBlock className="h-4 w-full" />
        <SkeletonBlock className="h-4 w-11/12" />
        <SkeletonBlock className="h-4 w-5/6" />
      </div>
    </main>
  );
}
