import React from 'react';

interface WritingSectionProps {
  onSelectArticle: (articleId: string) => void;
}

export const WritingSection: React.FC<WritingSectionProps> = ({ onSelectArticle }) => {
  return (
    <section className="space-y-6">
      <div className="border-b border-[#18181b] pb-2">
        <h2 className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#52525b]">
          Writing
        </h2>
      </div>

      <div className="space-y-4">
        <div
          onClick={() => onSelectArticle('causal-measurement')}
          className="group p-4 rounded-xl border border-[#1e1e22] hover:border-[#383840] bg-[#0e0e10]/80 hover:bg-[#121215] transition-all duration-200 cursor-pointer select-none"
        >
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <h3 className="text-[14px] font-medium text-[#ededed] group-hover:text-white transition-colors">
              How to Measure What Can't Be Tested
            </h3>
            <span className="text-[11.5px] font-mono text-[#52525b] shrink-0">
              March 2026 · 12 min read
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
