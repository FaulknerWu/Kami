import type { Metadata } from "next";
import Image from "next/image";
import { MarkdownContent } from "@/components/MarkdownContent";
import { InlineErrorState } from "@/components/states/InlineErrorState";
import { toPageViewModel } from "@/lib/adapters/public-content";
import { ApiNotFoundError } from "@/lib/api/http";
import { getPublicPage } from "@/lib/api/public-content";
import { notFound } from "next/navigation";

export async function generateMetadata(
  props: PageProps<"/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;

  try {
    const page = await getPublicPage(slug);

    return {
      title: page.seoTitle ?? `${page.title} - 克制与留白`,
      description: page.seoDescription ?? page.summary ?? undefined,
    };
  } catch {
    return {
      title: "页面详情 - 克制与留白",
    };
  }
}

export default async function PublicPage(props: PageProps<"/[slug]">) {
  const { slug } = await props.params;

  let pageResponse;

  try {
    pageResponse = await getPublicPage(slug);
  } catch (error) {
    if (error instanceof ApiNotFoundError) {
      notFound();
    }

    return (
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 md:py-24">
        <InlineErrorState
          title="页面暂时不可用"
          description="当前无法从后端加载页面内容，请确认服务可访问后再试。"
          retryHref={`/${slug}`}
        />
      </main>
    );
  }

  const page = toPageViewModel(pageResponse);

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 md:py-24">
      <article className="prose prose-zinc prose-lg mx-auto max-w-none">
        {page.coverImage ? (
          <div className="relative mb-16 aspect-[21/9] w-full overflow-hidden rounded-sm bg-zinc-100">
            <Image
              src={page.coverImage}
              alt={page.title}
              fill
              className="object-cover"
              priority
              sizes="(min-width: 1024px) 896px, 100vw"
            />
          </div>
        ) : null}

        <header className="mb-16 text-center">
          <h1 className="mb-6 text-4xl font-extrabold tracking-tighter text-zinc-900 sm:text-5xl md:text-6xl">
            {page.title}
          </h1>
          {page.summary ? (
            <p className="text-xl font-light text-zinc-500">{page.summary}</p>
          ) : null}
        </header>

        <MarkdownContent content={page.contentMarkdown} />
      </article>
    </main>
  );
}
