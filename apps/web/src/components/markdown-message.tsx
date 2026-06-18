"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./code-block";
import { MermaidBlock } from "./mermaid-block";

export function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="mentor-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Code blocks & inline code
          code({ node, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const lang = match ? match[1] : "";
            const codeStr = String(children).replace(/\n$/, "");

            // Inline code: no className, short content, no newlines
            const isInline =
              !className && !codeStr.includes("\n") && codeStr.length < 200;

            if (isInline) {
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }

            // Mermaid diagram
            if (lang === "mermaid") {
              return <MermaidBlock chart={codeStr} />;
            }

            // Fenced code block
            return <CodeBlock language={lang}>{codeStr}</CodeBlock>;
          },

          // Override pre to avoid double wrapping — CodeBlock handles its own wrapper
          pre({ children }) {
            return <>{children}</>;
          },

          // Task list checkboxes
          input({ type, checked, ...props }) {
            if (type === "checkbox") {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  className="mr-1.5 rounded border-gray-300 text-brand-600 pointer-events-none"
                  {...props}
                />
              );
            }
            return <input type={type} {...props} />;
          },

          // Table wrapper for horizontal scroll
          table({ children }) {
            return (
              <div className="my-3 overflow-x-auto rounded-lg border border-gray-200">
                <table>{children}</table>
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
