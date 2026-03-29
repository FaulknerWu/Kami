import { ContentListSection } from "@/components/ContentListSection";
import { Sidebar } from "@/components/layout/Sidebar";
import { InlineErrorState } from "@/components/states/InlineErrorState";
import { toArticleCardViewModel } from "@/lib/adapters/public-content";
import { getPublicPostPage, getPublicTags } from "@/lib/api/public-content";
import { buildPageHref, parsePageParam } from "@/lib/query";
import { notFound } from "next/navigation";

const TAG_PAGE_SIZE = 5;

export default async function TagPage(props: PageProps<"/tags/[slug]">) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const currentPage = parsePageParam(searchParams.page);
  const tags = await getPublicTags().catch(() => null);

  if (!tags) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 md:py-24">
        <InlineErrorState
          title="标签页面暂时不可用"
          description="当前无法读取标签目录，请确认后端服务已启动。"
          retryHref={`/tags/${slug}`}
        />
      </main>
    );
  }

  const currentTag = tags.find((tag) => tag.slug === slug);

  if (!currentTag) {
    notFound();
  }

  const tagFeed = await getPublicPostPage({
    page: currentPage,
    size: TAG_PAGE_SIZE,
    tag: slug,
  }).catch(() => null);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 md:py-24">
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-24">
        <div className="lg:col-span-8">
          <header className="mb-16 border-b border-zinc-200 pb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 md:text-5xl">
              #{currentTag.name}
            </h1>
            <p className="mt-4 text-zinc-500">
              当前标签下共有 {currentTag.articleCount} 篇已发布文章。
            </p>
          </header>

          {tagFeed ? (
            <ContentListSection
              posts={tagFeed.items.map(toArticleCardViewModel)}
              currentPage={tagFeed.page}
              totalPages={tagFeed.totalPages}
              buildHref={(page) => buildPageHref(`/tags/${slug}`, page)}
              emptyTitle="这个标签下还没有文章"
              emptyDescription="等相关内容发布后，这里会自动补齐。"
            />
          ) : (
            <InlineErrorState
              title="标签文章加载失败"
              description="当前无法从后端加载该标签的文章列表，请稍后重试。"
              retryHref={buildPageHref(`/tags/${slug}`, currentPage)}
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
