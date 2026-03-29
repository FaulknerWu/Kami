import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { MarkdownContent } from "@/components/MarkdownContent";
import { MockFeatureButton } from "@/components/layout/MockFeatureButton";
import { InlineErrorState } from "@/components/states/InlineErrorState";
import { toArticleDetailViewModel } from "@/lib/adapters/public-content";
import { ApiNotFoundError } from "@/lib/api/http";
import { getPublicPostDetail } from "@/lib/api/public-content";
import { notFound } from "next/navigation";

export async function generateMetadata(
  props: PageProps<"/posts/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;

  try {
    const article = await getPublicPostDetail(slug);

    return {
      title: `${article.title} - 克制与留白`,
      description: article.summary,
    };
  } catch {
    return {
      title: "文章详情 - 克制与留白",
    };
  }
}

export default async function PostPage(props: PageProps<"/posts/[slug]">) {
  const { slug } = await props.params;

  let articleResponse;

  try {
    articleResponse = await getPublicPostDetail(slug);
  } catch (error) {
    if (error instanceof ApiNotFoundError) {
      notFound();
    }

    return (
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 md:py-24">
        <InlineErrorState
          title="文章详情暂时不可用"
          description="当前无法从后端加载文章详情，请确认服务可访问后再试。"
          retryHref={`/posts/${slug}`}
        />
      </main>
    );
  }

  const article = toArticleDetailViewModel(articleResponse);

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 md:py-24">
      <article className="prose prose-zinc prose-lg mx-auto max-w-none">
        <header className="mb-16 text-center">
          <div className="mb-6 flex items-center justify-center gap-3 text-sm font-medium uppercase tracking-widest text-zinc-500">
            <span className="text-zinc-900">{article.categoryName}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
            <span>{article.dateLabel}</span>
            <span className="h-1.5 w-1.5 rounded-full bg-zinc-300" />
            <span>{article.readTimeLabel}</span>
          </div>

          <h1 className="mb-8 text-4xl font-extrabold tracking-tighter text-zinc-900 sm:text-5xl md:text-6xl">
            {article.title}
          </h1>

          <div className="flex flex-wrap justify-center gap-2">
            {article.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/tags/${tag.slug}`}
                className="rounded-sm bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-600 no-underline"
              >
                {tag.name}
              </Link>
            ))}
          </div>
        </header>

        <div className="relative mb-16 aspect-[21/9] w-full overflow-hidden rounded-sm bg-zinc-100">
          {article.coverImage ? (
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover"
              priority
              sizes="(min-width: 1024px) 896px, 100vw"
            />
          ) : null}
        </div>

        <div className="space-y-8 text-zinc-700 leading-relaxed">
          <p className="text-xl font-light leading-relaxed text-zinc-500">
            {article.abstract}
          </p>
          <MarkdownContent content={article.content} />
        </div>

        <footer className="mt-24 flex items-center justify-between border-t border-zinc-200 pt-8">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-500 no-underline transition-colors hover:text-zinc-900"
          >
            &larr; 返回首页
          </Link>
          <MockFeatureButton
            feature="share-article"
            className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
          >
            分享文章
          </MockFeatureButton>
        </footer>
      </article>
    </main>
  );
}
