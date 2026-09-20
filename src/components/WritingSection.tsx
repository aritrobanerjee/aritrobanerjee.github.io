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
        {/* Essay 1 */}
        <div
          onClick={() => onSelectArticle('causal-measurement')}
          className="group p-4 rounded-xl border border-[#1e1e22] hover:border-[#383840] bg-[#0e0e10]/80 hover:bg-[#121215] transition-all duration-200 cursor-pointer select-none"
        >
          <div className="flex items-center justify-between gap-3">
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

        {/* Essay 2 (WIP) */}
        <div
          onClick={() => onSelectArticle('design-what-cant-be-imagined')}
          className="group p-4 rounded-xl border border-[#1e1e22] hover:border-[#383840] bg-[#0e0e10]/80 hover:bg-[#121215] transition-all duration-200 cursor-pointer select-none"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-[#121214] border border-[#222225] flex items-center justify-center shrink-0 group-hover:border-[#383840] group-hover:bg-[#18181c] transition-all duration-200">
                <svg
                  viewBox="0 0 10 10"
                  className="w-2.5 h-2.5 fill-current text-[#82828b] group-hover:text-white transition-colors duration-200"
                  style={{ shapeRendering: 'crispEdges' }}
                >
                  <rect x="1" y="1" width="3" height="3" />
                  <rect x="6" y="1" width="3" height="3" />
                  <rect x="1" y="6" width="3" height="3" />
                  <rect x="6" y="6" width="3" height="3" />
                  <rect x="4" y="4" width="2" height="2" />
                </svg>
              </div>
              <h3 className="text-[14px] font-medium text-[#ededed] group-hover:text-white transition-colors">
                How to Design What Can't Be Imagined
              </h3>
            </div>
            <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-[#161619] border border-[#27272a] text-[#8e8e93] group-hover:text-[#d4d4d8] group-hover:border-[#383840] transition-colors">
              WIP
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
