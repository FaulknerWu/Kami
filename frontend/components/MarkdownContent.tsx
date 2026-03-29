import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children, ...props }) => {
          const isExternal = typeof href === "string" && /^https?:\/\//.test(href);

          return (
            <a
              href={href}
              {...props}
              className="text-zinc-900 underline decoration-zinc-300 underline-offset-4 transition-colors hover:decoration-zinc-900"
              rel={isExternal ? "noreferrer" : undefined}
              target={isExternal ? "_blank" : undefined}
            >
              {children}
            </a>
          );
        },
        code: ({ className, children, ...props }) => (
          <code className={className} {...props}>
            {children}
          </code>
        ),
        pre: ({ children, ...props }) => (
          <pre
            {...props}
            className="overflow-x-auto rounded-sm bg-zinc-900 px-5 py-4 text-sm text-zinc-50"
          >
            {children}
          </pre>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
