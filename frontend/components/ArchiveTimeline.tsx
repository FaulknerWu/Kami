import Link from "next/link";
import type { ArchiveYearGroupViewModel } from "@/lib/adapters/public-content";
import { EmptyState } from "@/components/states/EmptyState";

interface ArchiveTimelineProps {
  groups: ArchiveYearGroupViewModel[];
}

export function ArchiveTimeline({ groups }: ArchiveTimelineProps) {
  if (groups.length === 0) {
    return (
      <EmptyState
        title="还没有归档内容"
        description="当前还没有已发布文章，等第一篇内容上线后这里会自动更新。"
      />
    );
  }

  return (
    <div className="space-y-16">
      {groups.map((group) => (
        <section key={group.year} className="relative">
          <h2 className="sticky top-24 z-10 -ml-4 mb-8 inline-block bg-white px-4 text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
            {group.year}
          </h2>
          <div className="space-y-8 border-l border-zinc-100 pl-6 md:pl-8">
            {group.items.map((article) => (
              <article
                key={article.id}
                className="group relative flex flex-col gap-2 sm:flex-row sm:items-baseline sm:gap-6"
              >
                <div className="absolute -left-[29px] top-2 h-2 w-2 rounded-full border-2 border-white bg-zinc-300 transition-colors group-hover:bg-zinc-900 md:-left-[37px] md:top-3" />

                <time className="shrink-0 text-sm font-medium text-zinc-400 sm:w-24">
                  {article.monthDayLabel}
                </time>

                <div className="flex-1">
                  <Link href={`/posts/${article.slug}`} className="inline-block">
                    <h3 className="text-lg font-semibold leading-snug text-zinc-900 transition-colors group-hover:text-zinc-600 md:text-xl">
                      <span className="bg-gradient-to-r from-zinc-900 to-zinc-900 bg-[length:0%_1px] bg-left-bottom bg-no-repeat transition-all duration-300 ease-out group-hover:bg-[length:100%_1px]">
                        {article.title}
                      </span>
                    </h3>
                  </Link>
                  <div className="mt-2 flex items-center gap-3 text-xs text-zinc-500">
                    <span>{article.categoryName}</span>
                    <span className="h-1 w-1 rounded-full bg-zinc-300" />
                    <span>{article.readTimeLabel}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
