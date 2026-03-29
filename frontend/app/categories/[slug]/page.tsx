import { ContentListSection } from "@/components/ContentListSection";
import { Sidebar } from "@/components/layout/Sidebar";
import { InlineErrorState } from "@/components/states/InlineErrorState";
import { toArticleCardViewModel } from "@/lib/adapters/public-content";
import { getPublicCategories, getPublicPostPage } from "@/lib/api/public-content";
import { buildPageHref, parsePageParam } from "@/lib/query";
import { notFound } from "next/navigation";

const CATEGORY_PAGE_SIZE = 5;

export default async function CategoryPage(props: PageProps<"/categories/[slug]">) {
  const { slug } = await props.params;
  const searchParams = await props.searchParams;
  const currentPage = parsePageParam(searchParams.page);
  const categories = await getPublicCategories().catch(() => null);

  if (!categories) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 md:py-24">
        <InlineErrorState
          title="分类页面暂时不可用"
          description="当前无法读取分类目录，请确认后端服务已启动。"
          retryHref={`/categories/${slug}`}
        />
      </main>
    );
  }

  const currentCategory = categories.find((category) => category.slug === slug);

  if (!currentCategory) {
    notFound();
  }

  const categoryFeed = await getPublicPostPage({
    page: currentPage,
    size: CATEGORY_PAGE_SIZE,
    category: slug,
  }).catch(() => null);

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 md:py-24">
      <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-24">
        <div className="lg:col-span-8">
          <header className="mb-16 border-b border-zinc-200 pb-8">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 md:text-5xl">
              {currentCategory.name}
            </h1>
            <p className="mt-4 text-zinc-500">
              {currentCategory.description?.trim()
                ? currentCategory.description
                : `当前分类下共有 ${currentCategory.articleCount} 篇已发布文章。`}
            </p>
          </header>

          {categoryFeed ? (
            <ContentListSection
              posts={categoryFeed.items.map(toArticleCardViewModel)}
              currentPage={categoryFeed.page}
              totalPages={categoryFeed.totalPages}
              buildHref={(page) => buildPageHref(`/categories/${slug}`, page)}
              emptyTitle="这个分类下还没有文章"
              emptyDescription="等相关内容发布后，这里会自动补齐。"
            />
          ) : (
            <InlineErrorState
              title="分类文章加载失败"
              description="当前无法从后端加载该分类的文章列表，请稍后重试。"
              retryHref={buildPageHref(`/categories/${slug}`, currentPage)}
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
