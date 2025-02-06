import { MarkdownToJSX, default as MarkdownTool } from "markdown-to-jsx";
import React from "react";

export interface MarkdownProps {
  children: string;
}

const markdownComponents: MarkdownToJSX.Overrides = {
  h1: ({ children }) => <h1 className="text-4xl font-semibold">{children}</h1>,
  h2: ({ children }) => <h2 className="text-3xl font-semibold pt-4">{children}</h2>,
  h3: ({ children }) => <h3 className="text-xl font-semibold">{children}</h3>,
  h4: ({ children }) => <h4 className="text-lg font-semibold">{children}</h4>,
  h5: ({ children }) => <h5 className="text-lg font-semibold">{children}</h5>,
  h6: ({ children }) => <h6 className="text-base font-semibold">{children}</h6>,

  p: ({ children }) => <p className="text-lg my-2">{children}</p>,
  span: ({ children }) => <span className="text-lg">{children}</span>,
  a: ({ href, children }) => (
    <a href={href} target="_blank" className="text-blue-500 underline">
      {children}
    </a>
  ),
  ul: ({ children }) => <ul className="pl-5 list-disc my-1">{children}</ul>,
  ol: ({ children }) => <ol className="pl-5 list-decimal my-1">{children}</ol>,
  li: ({ children }) => <li className="text-lg">{children}</li>,
  input: ({ checked }) => (
    <input type="checkbox" checked={checked} disabled className="form-checkbox p-0" />
  ),
  em: ({ children }) => <em>{children}</em>,
  strong: ({ children }) => <strong>{children}</strong>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-gray-300 pl-4">{children}</blockquote>
  ),
  pre: ({ children }) => <pre className="bg-gray-200 p-4 rounded">{children}</pre>,
  code: ({ children }) => <code className="bg-gray-100 px-1 rounded">{children}</code>,
  thead: ({ children }) => <thead className="bg-gray-200">{children}</thead>,
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => <tr>{children}</tr>,
  th: ({ children }) => <th className="px-4 py-2">{children}</th>,
  td: ({ children }) => <td className="border px-4 py-2">{children}</td>,
  table: ({ children }) => <table className="min-w-full border-collapse">{children}</table>,
};

export const Markdown: React.FC<MarkdownProps> = ({ children }) => {
  return <MarkdownTool options={{ overrides: markdownComponents }}>{children}</MarkdownTool>;
};
