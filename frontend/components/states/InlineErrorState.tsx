import Link from "next/link";

interface InlineErrorStateProps {
  title: string;
  description: string;
  retryHref?: string;
}

export function InlineErrorState({
  title,
  description,
  retryHref,
}: InlineErrorStateProps) {
  return (
    <div className="rounded-sm border border-zinc-200 bg-zinc-50 px-6 py-8">
      <h2 className="text-2xl font-bold tracking-tight text-zinc-900">{title}</h2>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-600">
        {description}
      </p>
      {retryHref ? (
        <Link
          href={retryHref}
          className="mt-6 inline-flex text-sm font-medium text-zinc-900 transition-colors hover:text-zinc-600"
        >
          重新加载
        </Link>
      ) : null}
    </div>
  );
}
