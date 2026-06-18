"use client";

import { useEffect, useRef, useState } from "react";

let mermaidInitialized = false;

export function MermaidBlock({ chart }: { chart: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        const mermaid = (await import("mermaid")).default;

        if (!mermaidInitialized) {
          mermaid.initialize({
            startOnLoad: false,
            theme: "neutral",
            fontFamily:
              'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',
            flowchart: { curve: "monotoneX", padding: 15 },
            themeVariables: {
              primaryColor: "#dbe4ff",
              primaryTextColor: "#1e293b",
              primaryBorderColor: "#4c6ef5",
              lineColor: "#94a3b8",
              secondaryColor: "#f1f5f9",
              tertiaryColor: "#f8fafc",
            },
          });
          mermaidInitialized = true;
        }

        const id = "mermaid-" + Math.random().toString(36).slice(2, 9);
        const { svg: rendered } = await mermaid.render(id, chart.trim());

        if (!cancelled) {
          setSvg(rendered);
          setError("");
        }
      } catch (e: any) {
        if (!cancelled) {
          setError(e.message || "Failed to render diagram");
        }
      }
    }

    render();
    return () => {
      cancelled = true;
    };
  }, [chart]);

  if (error) {
    // Fallback: show raw code
    return (
      <div className="my-3 rounded-xl overflow-hidden bg-[#282c34] border border-[#3e4451]">
        <div className="px-4 py-2 bg-[#21252b] border-b border-[#3e4451]">
          <span className="text-[11px] font-medium text-[#8b929e] tracking-wide uppercase">
            MERMAID
          </span>
        </div>
        <pre className="p-4 text-[13px] text-slate-300 font-mono overflow-x-auto">
          {chart}
        </pre>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="my-3 p-8 rounded-xl bg-gray-50 border border-gray-200 text-center text-sm text-gray-400">
        Rendering diagram...
      </div>
    );
  }

  return (
    <div className="my-3 p-4 rounded-xl bg-white border border-gray-200 overflow-x-auto">
      <div
        ref={containerRef}
        className="flex justify-center [&_svg]:max-w-full"
        dangerouslySetInnerHTML={{ __html: svg }}
      />
    </div>
  );
}
