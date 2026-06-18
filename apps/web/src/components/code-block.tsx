"use client";

import { useState, useCallback } from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
// CJS path — avoids ESM resolution issues in Next.js standalone builds
import oneDark from "react-syntax-highlighter/dist/cjs/styles/prism/one-dark";
import { Check, Copy } from "lucide-react";

const LANG_LABELS: Record<string, string> = {
  go: "Go", golang: "Go", js: "JavaScript", javascript: "JavaScript",
  ts: "TypeScript", typescript: "TypeScript", tsx: "TSX", jsx: "JSX",
  py: "Python", python: "Python", sql: "SQL", bash: "Bash", sh: "Shell",
  shell: "Shell", json: "JSON", yaml: "YAML", yml: "YAML",
  dockerfile: "Dockerfile", docker: "Dockerfile", nginx: "Nginx",
  html: "HTML", css: "CSS", rust: "Rust", java: "Java", c: "C", cpp: "C++",
  proto: "Protobuf", graphql: "GraphQL", toml: "TOML", makefile: "Makefile",
  md: "Markdown", text: "Text", plaintext: "Text",
};

interface CodeBlockProps {
  language?: string;
  children: string;
}

export function CodeBlock({ language, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const code = children.replace(/\n$/, "");
  const lang = language || "";
  const label =
    LANG_LABELS[lang.toLowerCase()] || (lang ? lang.toUpperCase() : "Code");

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code]);

  return (
    <div className="code-block-wrapper group my-3 rounded-xl overflow-hidden bg-[#282c34] border border-[#3e4451]">
      <div className="flex items-center justify-between px-4 py-2 bg-[#21252b] border-b border-[#3e4451]">
        <span className="text-[11px] font-medium text-[#8b929e] tracking-wide uppercase">
          {label}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[11px] text-[#8b929e] hover:text-white transition px-2 py-0.5 rounded hover:bg-[#3e4451]"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check size={12} className="text-green-400" />
              <span className="text-green-400">Copied</span>
            </>
          ) : (
            <>
              <Copy size={12} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <SyntaxHighlighter
        language={lang || "text"}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: "1rem 1.25rem",
          background: "transparent",
          fontSize: "13px",
          lineHeight: "1.7",
        }}
        codeTagProps={{
          style: {
            fontFamily:
              'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace',
          },
        }}
        showLineNumbers={code.split("\n").length > 5}
        lineNumberStyle={{
          minWidth: "2.5em",
          paddingRight: "1em",
          color: "#4b5263",
          fontSize: "12px",
        }}
        wrapLongLines={false}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}
