import { ArticleCard } from "@/components/ArticleCard";
import { PaginationNav } from "@/components/PaginationNav";
import { EmptyState } from "@/components/states/EmptyState";
import type { ArticleCardViewModel } from "@/lib/adapters/public-content";

interface ContentListSectionProps {
  posts: ArticleCardViewModel[];
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
  emptyTitle: string;
  emptyDescription: string;
}

export function ContentListSection({
  posts,
  currentPage,
  totalPages,
  buildHref,
  emptyTitle,
  emptyDescription,
}: ContentListSectionProps) {
  if (posts.length === 0) {
    return (
      <EmptyState
        title={emptyTitle}
        description={emptyDescription}
      />
    );
  }

  return (
    <div className="space-y-16">
      {posts.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
      <PaginationNav
        currentPage={currentPage}
        totalPages={totalPages}
        buildHref={buildHref}
      />
    </div>
  );
}
