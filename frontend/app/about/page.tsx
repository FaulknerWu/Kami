import type { Metadata } from "next";
import Image from "next/image";
import { MarkdownContent } from "@/components/MarkdownContent";
import { InlineErrorState } from "@/components/states/InlineErrorState";
import {
  toAboutPageViewModel,
  toSiteProfileViewModel,
} from "@/lib/adapters/public-content";
import { ApiNotFoundError } from "@/lib/api/http";
import { getPublicPage, getPublicSiteProfile } from "@/lib/api/public-content";
import { notFound } from "next/navigation";

export async function generateMetadata(): Promise<Metadata> {
  try {
    const aboutPage = await getPublicPage("about");

    return {
      title: aboutPage.seoTitle ?? `${aboutPage.title} - 克制与留白`,
      description: aboutPage.seoDescription ?? aboutPage.summary ?? undefined,
    };
  } catch {
    return {
      title: "关于 - 克制与留白",
    };
  }
}

export default function AboutPage() {
  return <AboutPageContent />;
}

async function AboutPageContent() {
  let aboutPageResponse;

  try {
    aboutPageResponse = await getPublicPage("about");
  } catch (error) {
    if (error instanceof ApiNotFoundError) {
      notFound();
    }

    return (
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 md:py-24">
        <InlineErrorState
          title="关于页暂时不可用"
          description="当前无法从后端加载关于页内容，请确认服务可访问后再试。"
          retryHref="/about"
        />
      </main>
    );
  }

  const aboutPage = toAboutPageViewModel(aboutPageResponse);
  const siteProfile = await getPublicSiteProfile()
    .then(toSiteProfileViewModel)
    .catch(() => null);
  const pageCoverImage = aboutPage.coverImage ?? siteProfile?.coverImageUrl ?? null;

  if (aboutPage.renderMode === "MARKDOWN") {
    return (
      <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 md:py-24">
        <article className="prose prose-zinc prose-lg mx-auto max-w-none">
          <header className="mb-16 text-center">
            <h1 className="mb-6 text-4xl font-extrabold tracking-tighter text-zinc-900 sm:text-5xl md:text-6xl">
              {aboutPage.title}
            </h1>
            {aboutPage.summary ? (
              <p className="text-xl font-light text-zinc-500">{aboutPage.summary}</p>
            ) : null}
          </header>
          <MarkdownContent content={aboutPage.contentMarkdown ?? ""} />
        </article>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 md:py-24">
      <article className="prose prose-zinc prose-lg mx-auto max-w-none">
        <div className="relative mb-16 aspect-[21/9] w-full overflow-hidden rounded-sm bg-zinc-100">
          {pageCoverImage ? (
            <Image
              src={pageCoverImage}
              alt={aboutPage.title}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 896px, 100vw"
            />
          ) : null}
        </div>

        <header className="mb-16 text-center">
          <h1 className="mb-6 text-4xl font-extrabold tracking-tighter text-zinc-900 sm:text-5xl md:text-6xl">
            {aboutPage.title}
          </h1>
          {siteProfile?.authorBio ? (
            <p className="text-xl font-light text-zinc-500">{siteProfile.authorBio}</p>
          ) : null}
        </header>

        <div className="space-y-12 text-zinc-700">
          {aboutPage.sections.map((section) => (
            <section key={section.title}>
              <h2 className="mb-6 border-b border-zinc-200 pb-4 text-2xl font-bold tracking-tight text-zinc-900">
                {section.title}
              </h2>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </section>
          ))}

          <section>
            <h2 className="mb-6 border-b border-zinc-200 pb-4 text-2xl font-bold tracking-tight text-zinc-900">
              技能
            </h2>
            <ul className="grid list-none grid-cols-1 gap-4 pl-0 md:grid-cols-2">
              {aboutPage.skills.map((skill) => (
                <li key={skill} className="flex items-center gap-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-zinc-900" />
                  <span>{skill}</span>
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="mb-6 border-b border-zinc-200 pb-4 text-2xl font-bold tracking-tight text-zinc-900">
              联系方式
            </h2>
            <p>如果你有任何问题或想交流技术，欢迎通过以下方式联系我：</p>
            {siteProfile?.contacts.length ? (
              <ul className="list-none space-y-2 pl-0">
                {siteProfile.contacts.map((contact) => (
                  <li key={contact.id}>
                    <strong>{contact.typeLabel}:</strong>{" "}
                    {contact.href ? (
                      <a
                        href={contact.href}
                        target={/^https?:\/\//.test(contact.href) ? "_blank" : undefined}
                        rel={/^https?:\/\//.test(contact.href) ? "noreferrer" : undefined}
                        className="text-zinc-900 underline decoration-zinc-300 underline-offset-4 transition-colors hover:decoration-zinc-900"
                      >
                        {contact.label}
                      </a>
                    ) : (
                      <span>{contact.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-zinc-500">当前还没有公开的联系方式。</p>
            )}
          </section>
        </div>
      </article>
    </main>
  );
}
