/**
 * Rendu markdown partagé (avec support mermaid) pour les pages de dev qui affichent
 * un fichier .md du repo : voir ReadmeViewer.tsx et VigieViewer.tsx.
 */

import BackButton from "@/_dev/BackButton";
import MermaidBlock from "@/_dev/MermaidBlock";
import {
  Children,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
} from "react";
import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

function Pre({ children, ...props }: HTMLAttributes<HTMLPreElement>) {
  const child = Children.only(children) as ReactElement<{
    className?: string;
    children?: ReactNode;
  }>;
  const language = /language-(\w+)/.exec(child.props.className ?? "")?.[1];

  if (language === "mermaid") {
    const chart = Children.toArray(child.props.children)
      .join("")
      .replace(/\n$/, "");
    return <MermaidBlock chart={chart} />;
  }

  return (
    <pre
      className="my-4 overflow-x-auto rounded-lg border border-primary/10 bg-base-100 p-4 text-xs"
      {...props}
    >
      {children}
    </pre>
  );
}

const components: Components = {
  pre: Pre,
  code: ({ className, children, ...props }) => (
    <code
      className={`font-mono ${className ?? "rounded bg-base-100 px-1.5 py-0.5"}`}
      {...props}
    >
      {children}
    </code>
  ),
  h1: ({ children }) => (
    <h1 className="mt-8 text-3xl font-black text-primary">{children}</h1>
  ),
  h2: ({ children }) => (
    <h2 className="mt-8 mb-2 text-xl font-bold text-primary">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-6 mb-1 text-base font-bold text-primary">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="my-3 text-sm leading-relaxed text-primary/80">{children}</p>
  ),
  a: ({ children, href }) => (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="font-semibold text-primary underline decoration-primary/30 underline-offset-2 hover:decoration-primary"
    >
      {children}
    </a>
  ),
  ul: ({ children }) => (
    <ul className="my-3 ml-5 list-disc space-y-1 text-sm text-primary/80">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="my-3 ml-5 list-decimal space-y-1 text-sm text-primary/80">
      {children}
    </ol>
  ),
  li: ({ children }) => <li>{children}</li>,
  strong: ({ children }) => (
    <strong className="font-bold text-primary">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-primary/70">{children}</em>,
  hr: () => <hr className="my-8 border-primary/10" />,
  blockquote: ({ children }) => (
    <blockquote className="my-3 border-l-4 border-primary/20 pl-4 text-sm italic text-primary/60">
      {children}
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="my-4 overflow-x-auto rounded-lg border border-primary/10">
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-base-100">{children}</thead>,
  th: ({ children }) => (
    <th className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-primary/60">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-t border-primary/10 px-3 py-2 text-primary/80">
      {children}
    </td>
  ),
};

type MarkdownDocProps = {
  route: string;
  label: string;
  source: string;
};

export default function MarkdownDoc({
  route,
  label,
  source,
}: MarkdownDocProps) {
  return (
    <div className="min-h-screen bg-base-200 px-6 py-10 text-primary md:px-12">
      <div className="relative mx-auto max-w-3xl">
        <p className="inline-block rounded bg-error/15 px-2 py-0.5 text-xs font-bold uppercase tracking-widest text-error">
          Dev only · {route}
        </p>
        <BackButton />
        <p className="mt-3 font-mono text-xs text-primary/40">{label}</p>

        <div className="mt-6 rounded-xl border border-primary/10 bg-base-200 p-6 md:p-8">
          <Markdown remarkPlugins={[remarkGfm]} components={components}>
            {source}
          </Markdown>
        </div>
      </div>
    </div>
  );
}
