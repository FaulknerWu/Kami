import Image from "next/image";
import { mockSiteProfile } from "@/lib/mocks/site-profile";

export default function AboutPage() {
  return (
    <main
      className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 md:py-24"
      data-kami-mock-source="adr-0004-site-profile"
    >
      <article className="prose prose-zinc prose-lg mx-auto max-w-none">
        <div className="relative mb-16 aspect-[21/9] w-full overflow-hidden rounded-sm bg-zinc-100">
          <Image
            src={mockSiteProfile.cover}
            alt="Cover"
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 896px, 100vw"
          />
        </div>

        <header className="mb-16 text-center">
          <h1 className="mb-6 text-4xl font-extrabold tracking-tighter text-zinc-900 sm:text-5xl md:text-6xl">
            关于我
          </h1>
          <p className="text-xl font-light text-zinc-500">{mockSiteProfile.bio}</p>
        </header>

        <div className="space-y-12 text-zinc-700">
          {mockSiteProfile.aboutSections.map((section) => (
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
              {mockSiteProfile.skills.map((skill) => (
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
            <ul className="list-none space-y-2 pl-0">
              <li>
                <strong>Email:</strong>{" "}
                <a
                  href={`mailto:${mockSiteProfile.contacts.email}`}
                  className="text-zinc-900 underline decoration-zinc-300 underline-offset-4 transition-colors hover:decoration-zinc-900"
                >
                  {mockSiteProfile.contacts.email}
                </a>
              </li>
              <li>
                <strong>GitHub:</strong>{" "}
                <a
                  href={mockSiteProfile.contacts.githubUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-zinc-900 underline decoration-zinc-300 underline-offset-4 transition-colors hover:decoration-zinc-900"
                >
                  {mockSiteProfile.contacts.githubLabel}
                </a>
              </li>
            </ul>
          </section>
        </div>
      </article>
    </main>
  );
}
