import React from 'react';

interface WritingSectionProps {
  onSelectArticle: (articleId: string) => void;
}

export const WritingSection: React.FC<WritingSectionProps> = ({ onSelectArticle }) => {
  return (
    <section className="space-y-6">
      <div className="border-b border-[#18181b] pb-2">
        <h2 className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#82828b]">
          Writing
        </h2>
      </div>

      <div className="space-y-4">
        <div
          onClick={() => onSelectArticle('causal-measurement')}
          className="group p-4 rounded-xl border border-[#1e1e22] hover:border-[#383840] bg-[#0e0e10]/80 hover:bg-[#121215] transition-all duration-200 cursor-pointer select-none"
        >
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-[#121214] border border-[#222225] flex items-center justify-center shrink-0 group-hover:border-[#383840] group-hover:bg-[#18181c] transition-all duration-200">
              <svg
                viewBox="0 0 10 10"
                className="w-2.5 h-2.5 fill-current text-[#82828b] group-hover:text-white transition-colors duration-200"
                style={{ shapeRendering: 'crispEdges' }}
              >
                <rect x="1" y="5" width="2" height="3" />
                <rect x="4" y="2" width="2" height="6" />
                <rect x="7" y="5" width="2" height="3" />
              </svg>
            </div>
            <h3 className="text-[14px] font-medium text-[#ededed] group-hover:text-white transition-colors">
              How to Measure What Can't Be Tested
            </h3>
          </div>
        </div>
      </div>
    </section>
  );
};
