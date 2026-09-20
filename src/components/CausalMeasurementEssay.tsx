import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import essayMarkdown from '../content/essays/causal-measurement.md?raw';

interface CausalMeasurementEssayProps {
  onBack: () => void;
}

export const CausalMeasurementEssay: React.FC<CausalMeasurementEssayProps> = ({ onBack }) => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);

    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }
      if (e.key === 'Escape') {
        onBack();
      } else if (e.key === 't' || e.key === 'T') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onBack]);

  return (
    <article className="space-y-8">
      {/* Reading Progress Indicator (Fixed Top) */}
      <div
        className="fixed top-0 left-0 h-[2px] bg-white/70 z-50 transition-all duration-75 pointer-events-none"
        style={{ width: `${scrollProgress}%` }}
      />

      {/* Back navigation replacing 'Writing' in the exact same header position */}
      <div className="border-b border-[#18181b] pb-2 flex items-center justify-between">
        <button
          onClick={onBack}
          className="group flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-[0.15em] text-[#82828b] hover:text-white transition-colors select-none"
        >
          <span className="transition-transform group-hover:-translate-x-0.5">←</span>
          <span>Back</span>
          <kbd className="hidden sm:inline-block ml-2 px-1.5 py-0.2 text-[9.5px] font-mono text-[#71717a] bg-[#121214] border border-[#222225] rounded transition-colors group-hover:text-white group-hover:border-[#383840] normal-case tracking-normal">
            esc
          </kbd>
        </button>
      </div>

      {/* Essay Content */}
      <div className="prose prose-invert max-w-none space-y-6 text-[14.5px] md:text-[15.5px] leading-[1.8] text-[#d4d4d8]">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <div className="flex items-start gap-3.5 md:gap-4 mt-0 mb-4">
                <div className="w-9 h-9 md:w-11 md:h-11 rounded-full bg-[#121214] border border-[#27272a] flex items-center justify-center shrink-0 mt-0.5 md:mt-1">
                  <svg
                    viewBox="0 0 10 10"
                    className="w-4 h-4 md:w-5 md:h-5 fill-current text-[#ededed]"
                    style={{ shapeRendering: 'crispEdges' }}
                  >
                    <rect x="1" y="5" width="2" height="3" />
                    <rect x="4" y="2" width="2" height="6" />
                    <rect x="7" y="5" width="2" height="3" />
                  </svg>
                </div>
                <h1 className="text-2xl md:text-4xl font-semibold tracking-tight text-white leading-tight">
                  {children}
                </h1>
              </div>
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
                <table className="w-full text-left border-collapse text-[13px] md:text-[13.5px]">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="border-b border-[#27272a] bg-[#18181b] text-[#a1a1aa] font-mono text-[10.5px]">
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
              <th className="p-3 font-semibold text-[#a1a1aa]">{children}</th>
            ),
            td: ({ children }) => (
              <td className="p-3 align-top leading-relaxed">{children}</td>
            ),
            code: ({ className, children }) => {
              const isBlock = className?.includes('language-');
              if (isBlock) {
                return (
                  <pre className="p-4 rounded-xl border border-[#27272a] bg-[#111113] overflow-x-auto my-4 text-xs font-mono text-[#ededed]">
                    <code>{children}</code>
                  </pre>
                );
              }
              return (
                <code className="text-[12.5px] font-mono text-[#f4f4f5] bg-[#1c1c20] px-1.5 py-0.5 rounded border border-[#27272a]">
                  {children}
                </code>
              );
            },
            pre: ({ children }) => <>{children}</>,
            hr: () => <hr className="border-[#222225] my-8" />,
          }}
        >
          {essayMarkdown}
        </ReactMarkdown>
      </div>

      {/* Footer / Copyright & Provenance */}
      <footer className="border-t border-[#18181b] pt-8 space-y-5 mt-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11.5px] font-mono text-[#82828b]">
          <div>
            © {new Date().getFullYear()} Aritro Banerjee. All rights reserved.
          </div>
          <div className="text-[11px] text-[#71717a]">
            First published at <span className="text-[#82828b]">aritrobanerjee.github.io</span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-mono text-[#8e8e93] pt-2">
          <button
            onClick={onBack}
            className="hover:text-white transition-colors"
          >
            ← Back
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
