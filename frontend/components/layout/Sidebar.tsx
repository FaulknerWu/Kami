import Image from "next/image";
import Link from "next/link";
import {
  toCategoryListItemViewModels,
  toSiteProfileViewModel,
  toSidebarStatsViewModel,
  toTagListItemViewModels,
} from "@/lib/adapters/public-content";
import { getPublicSidebarData, getPublicSiteProfile } from "@/lib/api/public-content";

async function loadSidebarViewModel() {
  const [taxonomyResult, siteProfileResult] = await Promise.allSettled([
    getPublicSidebarData(),
    getPublicSiteProfile(),
  ]);

  return {
    taxonomy: taxonomyResult.status === "fulfilled"
      ? {
          categories: toCategoryListItemViewModels(taxonomyResult.value.categories),
          tags: toTagListItemViewModels(taxonomyResult.value.tags),
          stats: toSidebarStatsViewModel(
            taxonomyResult.value.totalArticles,
            taxonomyResult.value.categories.length,
            taxonomyResult.value.tags.length,
          ),
        }
      : null,
    siteProfile: siteProfileResult.status === "fulfilled"
      ? toSiteProfileViewModel(siteProfileResult.value)
      : null,
  };
}

export async function Sidebar() {
  const sidebarViewModel = await loadSidebarViewModel();

  return (
    <aside className="space-y-10">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-full border border-zinc-200 bg-zinc-100">
          {sidebarViewModel.siteProfile?.avatarUrl ? (
            <Image
              src={sidebarViewModel.siteProfile.avatarUrl}
              alt={sidebarViewModel.siteProfile.authorName}
              fill
              className="object-cover"
              sizes="96px"
            />
          ) : null}
        </div>
        <h2 className="text-lg font-bold tracking-tight text-zinc-900">
          {sidebarViewModel.siteProfile?.authorName ?? "站点资料暂时不可用"}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          {sidebarViewModel.siteProfile?.authorBio ?? "当前无法从后端加载作者资料。"}
        </p>

        <div className="mt-6 flex w-full justify-center gap-8 border-y border-zinc-100 py-4">
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-zinc-900">
              {sidebarViewModel.taxonomy?.stats.articles ?? 0}
            </span>
            <span className="text-xs font-medium text-zinc-500">文章</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-zinc-900">
              {sidebarViewModel.taxonomy?.stats.categories ?? 0}
            </span>
            <span className="text-xs font-medium text-zinc-500">分类</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-zinc-900">
              {sidebarViewModel.taxonomy?.stats.tags ?? 0}
            </span>
            <span className="text-xs font-medium text-zinc-500">标签</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-zinc-900">
          分类目录
        </h3>
        {sidebarViewModel.taxonomy ? (
          <ul className="space-y-2">
            {sidebarViewModel.taxonomy.categories.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/categories/${category.slug}`}
                  className="group flex items-center justify-between"
                >
                  <span className="relative text-sm text-zinc-600 transition-colors group-hover:text-zinc-900">
                    {category.name}
                    <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-zinc-900 transition-all duration-300 group-hover:w-full" />
                  </span>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs text-zinc-400">
                    {category.count}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm leading-relaxed text-zinc-500">
            分类数据暂时不可用。
          </p>
        )}
      </div>

      <div>
        <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-zinc-900">
          热门标签
        </h3>
        {sidebarViewModel.taxonomy ? (
          <div className="flex flex-wrap gap-2">
            {sidebarViewModel.taxonomy.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="rounded-sm bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-zinc-900"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-zinc-500">
            标签数据暂时不可用。
          </p>
        )}
      </div>
    </aside>
  );
}
