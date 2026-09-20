import React from 'react';

interface WritingSectionProps {
  onSelectArticle: (articleId: string) => void;
}

export const WritingSection: React.FC<WritingSectionProps> = ({ onSelectArticle }) => {
  return (
    <section className="space-y-6">
      <div className="border-b border-[#18181b] pb-2 flex items-center justify-between">
        <h2 className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#52525b]">
          Writing & Artifacts
        </h2>
        <span className="text-[10px] font-mono text-[#52525b]">01</span>
      </div>

      <div className="space-y-4">
        <div
          onClick={() => onSelectArticle('causal-measurement')}
          className="group p-4 rounded-xl border border-[#1e1e22] hover:border-[#383840] bg-[#0e0e10]/80 hover:bg-[#121215] transition-all duration-200 cursor-pointer select-none space-y-2"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-0.5">
              <h3 className="text-[14px] font-medium text-[#ededed] group-hover:text-white transition-colors flex items-center gap-1.5">
                <span>How to Measure What Can't Be Tested</span>
                <span className="text-[11px] text-[#71717a] group-hover:translate-x-0.5 transition-transform">→</span>
              </h3>
              <p className="text-[11.5px] font-mono text-[#52525b]">
                March 2026 · 12 min read · Causal Inference
              </p>
            </div>
          </div>

          <p className="text-[13px] leading-relaxed text-[#71717a] group-hover:text-[#8e8e93] transition-colors">
            A first-principles guide to causal inference, SUTVA violations, and quasi-experimentation when standard A/B testing breaks across enterprise platforms.
          </p>
        </div>
      </div>
    </section>
  );
};
