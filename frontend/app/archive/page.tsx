import { ArchiveTimeline } from "@/components/ArchiveTimeline";
import { Sidebar } from "@/components/layout/Sidebar";
import { InlineErrorState } from "@/components/states/InlineErrorState";
import { toArchiveYearGroups } from "@/lib/adapters/public-content";
import { getAllPublicPosts } from "@/lib/api/public-content";

export default async function ArchivePage() {
  const archivePosts = await getAllPublicPosts().catch(() => null);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 md:py-24">
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-24">
        <div className="lg:col-span-8">
          <header className="mb-16 border-b border-zinc-200 pb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 md:text-5xl">
              归档
            </h1>
            <p className="mt-4 text-zinc-500">
              {archivePosts
                ? `共计 ${archivePosts.length} 篇文章。继续努力。`
                : "暂时无法加载归档数据。"}
            </p>
          </header>

          {archivePosts ? (
            <ArchiveTimeline groups={toArchiveYearGroups(archivePosts)} />
          ) : (
            <InlineErrorState
              title="归档暂时不可用"
              description="当前无法从后端读取归档数据，请确认后端服务可访问后再试。"
              retryHref="/archive"
            />
          )}
        </div>

        <div className="hidden lg:col-span-4 lg:block">
          <div className="sticky top-24">
            <Sidebar />
          </div>
        </div>
      </div>
    </main>
  );
}
