import Image from "next/image";
import Link from "next/link";
import {
  toCategoryListItemViewModels,
  toSidebarStatsViewModel,
  toTagListItemViewModels,
} from "@/lib/adapters/public-content";
import { getPublicSidebarData } from "@/lib/api/public-content";
import { mockSiteProfile } from "@/lib/mocks/site-profile";

async function loadSidebarViewModel() {
  try {
    const sidebarData = await getPublicSidebarData();

    return {
      categories: toCategoryListItemViewModels(sidebarData.categories),
      tags: toTagListItemViewModels(sidebarData.tags),
      stats: toSidebarStatsViewModel(
        sidebarData.totalArticles,
        sidebarData.categories.length,
        sidebarData.tags.length,
      ),
    };
  } catch {
    return null;
  }
}

export async function Sidebar() {
  const sidebarViewModel = await loadSidebarViewModel();

  return (
    <aside className="space-y-10">
      <div
        className="flex flex-col items-center text-center"
        data-kami-mock-source="adr-0004-site-profile"
      >
        <div className="relative mb-4 h-24 w-24 overflow-hidden rounded-full border border-zinc-200">
          <Image
            src={mockSiteProfile.avatar}
            alt={mockSiteProfile.name}
            fill
            className="object-cover"
            sizes="96px"
          />
        </div>
        <h2 className="text-lg font-bold tracking-tight text-zinc-900">
          {mockSiteProfile.name}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          {mockSiteProfile.bio}
        </p>

        <div className="mt-6 flex w-full justify-center gap-8 border-y border-zinc-100 py-4">
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-zinc-900">
              {sidebarViewModel?.stats.articles ?? 0}
            </span>
            <span className="text-xs font-medium text-zinc-500">文章</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-zinc-900">
              {sidebarViewModel?.stats.categories ?? 0}
            </span>
            <span className="text-xs font-medium text-zinc-500">分类</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-lg font-semibold text-zinc-900">
              {sidebarViewModel?.stats.tags ?? 0}
            </span>
            <span className="text-xs font-medium text-zinc-500">标签</span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-sm font-bold uppercase tracking-widest text-zinc-900">
          分类目录
        </h3>
        {sidebarViewModel ? (
          <ul className="space-y-2">
            {sidebarViewModel.categories.map((category) => (
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
        {sidebarViewModel ? (
          <div className="flex flex-wrap gap-2">
            {sidebarViewModel.tags.map((tag) => (
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
