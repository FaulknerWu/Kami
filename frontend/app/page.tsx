import Image from "next/image";
import { ContentListSection } from "@/components/ContentListSection";
import { Sidebar } from "@/components/layout/Sidebar";
import { InlineErrorState } from "@/components/states/InlineErrorState";
import { toArticleCardViewModel } from "@/lib/adapters/public-content";
import { getPublicPostPage } from "@/lib/api/public-content";
import { mockSiteProfile } from "@/lib/mocks/site-profile";
import { buildPageHref, parsePageParam } from "@/lib/query";

const HOME_PAGE_SIZE = 5;

export default async function Home(props: PageProps<"/">) {
  const searchParams = await props.searchParams;
  const currentPage = parsePageParam(searchParams.page);

  const homeFeed = await getPublicPostPage({
    page: currentPage,
    size: HOME_PAGE_SIZE,
  }).catch(() => null);

  return (
    <main className="w-full">
      <section
        className="relative mb-16 h-[60vh] min-h-[400px] w-full md:mb-24"
        data-kami-mock-source="adr-0004-site-profile"
      >
        <Image
          src={mockSiteProfile.cover}
          alt="Blog Cover"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-4xl font-extrabold tracking-tighter text-white drop-shadow-lg sm:text-5xl md:text-6xl lg:text-7xl">
            {mockSiteProfile.heroTitle}
          </h1>
          <p className="mt-6 max-w-2xl text-lg font-medium leading-relaxed text-white/90 drop-shadow-md sm:text-xl">
            {mockSiteProfile.heroTagline}
          </p>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 pb-12 sm:px-6 lg:px-8 md:pb-24">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-12 lg:gap-24">
          <div className="lg:col-span-8">
            {homeFeed ? (
              <ContentListSection
                posts={homeFeed.items.map(toArticleCardViewModel)}
                currentPage={homeFeed.page}
                totalPages={homeFeed.totalPages}
                buildHref={(page) => buildPageHref("/", page)}
                emptyTitle="还没有已发布文章"
                emptyDescription="后端当前还没有可展示的内容，等文章发布后这里会自动出现。"
              />
            ) : (
              <InlineErrorState
                title="文章列表暂时不可用"
                description="当前无法从后端加载首页文章列表，请确认后端服务已启动，并稍后重试。"
                retryHref={buildPageHref("/", currentPage)}
              />
            )}
          </div>

          <div className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-24">
              <Sidebar />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
