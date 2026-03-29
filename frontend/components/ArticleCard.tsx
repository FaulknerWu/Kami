import Link from "next/link";
import type { ArticleCardViewModel } from "@/lib/adapters/public-content";

interface ArticleCardProps {
  article: ArticleCardViewModel;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <article className="group flex flex-col border-b border-zinc-100 pb-12">
      <div className="flex flex-col justify-center">
        <div className="mb-4 flex items-center gap-3 text-xs font-medium uppercase tracking-widest text-zinc-500">
          <span className="text-zinc-900">{article.categoryName}</span>
          <span className="h-1 w-1 rounded-full bg-zinc-300" />
          <span>{article.dateLabel}</span>
          <span className="h-1 w-1 rounded-full bg-zinc-300" />
          <span>{article.readTimeLabel}</span>
        </div>

        <Link href={`/posts/${article.slug}`} className="inline-block">
          <h2 className="mb-4 text-2xl font-extrabold leading-tight tracking-tight text-zinc-900 md:text-3xl lg:text-4xl">
            <span className="bg-gradient-to-r from-zinc-900 to-zinc-900 bg-[length:0%_2px] bg-left-bottom bg-no-repeat transition-all duration-500 ease-out group-hover:bg-[length:100%_2px]">
              {article.title}
            </span>
          </h2>
        </Link>

        <p className="mb-6 line-clamp-3 text-base leading-relaxed text-zinc-600 md:text-lg">
          {article.abstract}
        </p>

        <div className="mt-auto flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className="rounded-sm bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-500 transition-colors group-hover:bg-zinc-100"
            >
              {tag.name}
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
}
