import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="rounded-sm border border-zinc-200 bg-zinc-50 px-6 py-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900">
          没找到你要的内容
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-zinc-600">
          这篇文章、分类或标签可能还不存在，也可能已经被移除了。
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex text-sm font-medium text-zinc-900 transition-colors hover:text-zinc-600"
        >
          返回首页
        </Link>
      </div>
    </main>
  );
}
