import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import essayMarkdown from '../content/essays/causal-measurement.md?raw';

interface CausalMeasurementEssayProps {
  onBack: () => void;
}

export const CausalMeasurementEssay: React.FC<CausalMeasurementEssayProps> = ({ onBack }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <article className="space-y-10">
      {/* Top Navigation */}
      <nav className="flex items-center justify-between border-b border-[#18181b] pb-3">
        <button
          onClick={onBack}
          className="group flex items-center gap-1.5 text-[12px] font-mono text-[#71717a] hover:text-white transition-colors"
        >
          <span className="transition-transform group-hover:-translate-x-0.5">←</span>
          <span>Writing</span>
        </button>
      </nav>

      {/* Markdown Content Renderer */}
      <div className="prose prose-invert max-w-none space-y-6 text-[14.5px] md:text-[15.5px] leading-[1.8] text-[#d4d4d8]">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl md:text-4xl font-semibold tracking-tight text-white leading-tight mt-0 mb-3">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl md:text-2xl font-semibold text-white tracking-tight pt-8 border-t border-[#1c1c20] mt-8 mb-4">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-base md:text-lg font-semibold text-white tracking-tight mt-6 mb-2">
                {children}
              </h3>
            ),
            h4: ({ children }) => (
              <h4 className="text-sm font-semibold font-mono text-amber-400 mt-4 mb-1">
                {children}
              </h4>
            ),
            p: ({ children }) => (
              <p className="leading-[1.8] text-[#d4d4d8] my-3">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside space-y-2.5 pl-2 text-[#a1a1aa] my-3 text-[13.5px] md:text-[14px]">
                {children}
              </ul>
            ),
            li: ({ children }) => (
              <li className="leading-relaxed">{children}</li>
            ),
            strong: ({ children }) => (
              <strong className="text-[#ededed] font-semibold">{children}</strong>
            ),
            blockquote: ({ children }) => (
              <blockquote className="p-4 rounded-xl border border-[#27272a] bg-[#121215] text-xs text-[#d4d4d8] leading-relaxed my-4 not-italic">
                {children}
              </blockquote>
            ),
            table: ({ children }) => (
              <div className="rounded-xl border border-[#27272a] bg-[#111113] overflow-hidden my-4 overflow-x-auto">
                <table className="w-full text-xs text-left">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="border-b border-[#27272a] bg-[#18181b] text-[#71717a] font-mono text-[10.5px]">
                {children}
              </thead>
            ),
            tbody: ({ children }) => (
              <tbody className="divide-y divide-[#222225] text-[#d4d4d8]">
                {children}
              </tbody>
            ),
            tr: ({ children }) => (
              <tr className="hover:bg-[#141417]/40 transition-colors">
                {children}
              </tr>
            ),
            th: ({ children }) => (
              <th className="p-3 font-semibold text-[#71717a]">{children}</th>
            ),
            td: ({ children }) => (
              <td className="p-3 align-top leading-relaxed">{children}</td>
            ),
            code: ({ className, children }) => {
              const isBlock = className?.includes('language-');
              if (isBlock) {
                return (
                  <pre className="p-4 rounded-xl border border-[#27272a] bg-[#111113] text-[12px] font-mono text-[#d4d4d8] overflow-x-auto leading-relaxed my-4">
                    <code>{children}</code>
                  </pre>
                );
              }
              return (
                <code className="font-mono text-white font-medium bg-[#18181b] px-1.5 py-0.5 rounded border border-[#27272a] text-[12px]">
                  {children}
                </code>
              );
            },
            pre: ({ children }) => <>{children}</>,
            hr: () => <hr className="border-[#1c1c20] my-8" />,
          }}
        >
          {essayMarkdown}
        </ReactMarkdown>
      </div>

      {/* Footer / Copyright & Provenance */}
      <footer className="border-t border-[#18181b] pt-8 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11.5px] font-mono text-[#52525b]">
          <div>
            © {new Date().getFullYear()} Aritro Banerjee. All rights reserved.
          </div>
          <div className="text-[11px] text-[#3f3f46]">
            First published at <span className="text-[#52525b]">aritrobanerjee.github.io</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-mono text-[#71717a] pt-2">
          <button
            onClick={onBack}
            className="hover:text-white transition-colors"
          >
            ← Writing
          </button>
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="hover:text-white transition-colors"
          >
            ↑ Back to top
          </button>
        </div>
      </footer>
    </article>
  );
};
