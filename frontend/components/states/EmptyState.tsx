interface EmptyStateProps {
  title: string;
  description: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-sm border border-zinc-100 bg-zinc-50 px-6 py-10">
      <h2 className="text-2xl font-bold tracking-tight text-zinc-900">{title}</h2>
      <p className="mt-3 max-w-2xl text-base leading-relaxed text-zinc-600">
        {description}
      </p>
    </div>
  );
}
