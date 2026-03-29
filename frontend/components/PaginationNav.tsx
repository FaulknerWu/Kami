import Link from "next/link";

interface PaginationNavProps {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
}

export function PaginationNav({
  currentPage,
  totalPages,
  buildHref,
}: PaginationNavProps) {
  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <div className="flex items-center justify-between border-t border-zinc-100 pt-8">
      {hasPrevious ? (
        <Link
          href={buildHref(currentPage - 1)}
          className="text-sm font-medium text-zinc-900 transition-colors hover:text-zinc-600"
        >
          &larr; 上一页
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="text-sm font-medium text-zinc-400 transition-colors disabled:opacity-50"
        >
          &larr; 上一页
        </button>
      )}
      <span className="text-xs font-medium text-zinc-500">
        第 {currentPage} 页，共 {Math.max(totalPages, 1)} 页
      </span>
      {hasNext ? (
        <Link
          href={buildHref(currentPage + 1)}
          className="text-sm font-medium text-zinc-900 transition-colors hover:text-zinc-600"
        >
          下一页 &rarr;
        </Link>
      ) : (
        <button
          type="button"
          disabled
          className="text-sm font-medium text-zinc-400 transition-colors disabled:opacity-50"
        >
          下一页 &rarr;
        </button>
      )}
    </div>
  );
}
