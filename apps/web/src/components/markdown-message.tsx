"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock } from "./code-block";
import { MermaidBlock } from "./mermaid-block";
import { ErrorBoundary } from "./error-boundary";

export function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="mentor-markdown">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children }) {
            const match = /language-(\w+)/.exec(className || "");
            const lang = match ? match[1] : "";
            const codeStr = String(children).replace(/\n$/, "");

            // Inline code
            if (!className && !codeStr.includes("\n") && codeStr.length < 200) {
              return <code className={className}>{children}</code>;
            }

            // Mermaid
            if (lang === "mermaid") {
              return (
                <ErrorBoundary
                  fallback={
                    <pre className="my-3 p-4 rounded-xl bg-[#282c34] text-slate-300 text-[13px] font-mono overflow-x-auto">
                      {codeStr}
                    </pre>
                  }
                >
                  <MermaidBlock chart={codeStr} />
                </ErrorBoundary>
              );
            }

            // Code block
            return (
              <ErrorBoundary>
                <CodeBlock language={lang}>{codeStr}</CodeBlock>
              </ErrorBoundary>
            );
          },

          pre({ children }) {
            return <>{children}</>;
          },

          input({ type, checked }) {
            if (type === "checkbox") {
              return (
                <input
                  type="checkbox"
                  checked={checked}
                  readOnly
                  className="mr-1.5 rounded border-gray-300 text-brand-600 pointer-events-none"
                />
              );
            }
            return <input type={type} />;
          },

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
