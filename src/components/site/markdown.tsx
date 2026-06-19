"use client";
import ReactMarkdown from "react-markdown";
import type { ReactNode } from "react";

/** Extract plain text from React children (for heading slug ids). */
function nodeToText(node: ReactNode): string {
  if (typeof node === "string") return node;
  if (typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(nodeToText).join("");
  if (node && typeof node === "object" && "props" in node) {
    return nodeToText((node as { props: { children?: ReactNode } }).props.children);
  }
  return "";
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

/** Minimal markdown renderer with brand-aware styling + heading anchor ids. */
export function Markdown({ content }: { content: string }) {
  return (
    <div className="prose-cinema">
      <ReactMarkdown
        components={{
          h1: ({ ...p }) => <h1 className="mt-10 font-display text-3xl font-bold tracking-tight scroll-mt-24" {...p} />,
          h2: ({ children, ...p }) => (
            <h2
              id={slugify(nodeToText(children))}
              className="mt-8 font-display text-2xl font-semibold tracking-tight scroll-mt-24"
              {...p}
            >
              {children}
            </h2>
          ),
          h3: ({ children, ...p }) => (
            <h3
              id={slugify(nodeToText(children))}
              className="mt-6 font-display text-xl font-semibold scroll-mt-24"
              {...p}
            >
              {children}
            </h3>
          ),
          p: ({ ...p }) => <p className="mt-4 text-base leading-relaxed text-foreground/90 text-pretty" {...p} />,
          ul: ({ ...p }) => <ul className="mt-4 list-disc space-y-2 pl-5 text-foreground/90" {...p} />,
          ol: ({ ...p }) => <ol className="mt-4 list-decimal space-y-2 pl-5 text-foreground/90" {...p} />,
          li: ({ ...p }) => <li className="text-base leading-relaxed" {...p} />,
          a: ({ ...p }) => <a className="text-brand underline underline-offset-2 hover:no-underline" target="_blank" rel="noopener noreferrer" {...p} />,
          blockquote: ({ ...p }) => <blockquote className="mt-6 border-l-2 border-brand pl-5 italic text-muted-foreground" {...p} />,
          code: ({ ...p }) => <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm" {...p} />,
          hr: () => <hr className="my-8 border-border" />,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
