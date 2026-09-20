import React, { useState } from 'react';
import { EducationItem } from '../types/profile';

interface EducationProps {
  items: EducationItem[];
}

export const Education: React.FC<EducationProps> = ({ items }) => {
  const [showMore, setShowMore] = useState(false);

  const degrees = items.filter((item) => item.category !== 'achievement');
  const achievements = items.filter((item) => item.category === 'achievement');

  return (
    <section className="space-y-6">
      <div className="border-b border-[#18181b] pb-2">
        <h2 className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#82828b]">
          Education
        </h2>
      </div>

      <div className="space-y-5">
        {/* Core Degrees */}
        {degrees.map((item, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4 text-[13.5px]"
          >
            <div className="flex-1 min-w-0">
              <div className="text-[#ededed] font-medium">
                {item.degree}
                {item.gpa && (
                  <span className="text-[12px] font-mono text-[#8e8e93] font-normal ml-2">
                    · {item.gpa} GPA
                  </span>
                )}
              </div>

              <div className="text-[#8e8e93] text-[13px] mt-0.5">
                {item.institution}
                {item.field && (
                  <span className="text-[#82828b]"> · {item.field}</span>
                )}
              </div>

              {item.details && (
                <div className="text-[#8e8e93] text-[12px] mt-1 leading-relaxed">
                  {item.details}
                </div>
              )}
            </div>

            {item.period && (
              <div className="text-[12.5px] font-mono text-[#82828b] shrink-0 pt-0.5">
                {item.period}
              </div>
            )}
          </div>
        ))}

        {/* Collapsible 'More' Honors & National Examination Section */}
        {achievements.length > 0 && (
          <div className="pt-2">
            <button
              onClick={() => setShowMore((prev) => !prev)}
              className="flex items-center gap-2 text-[12px] font-mono text-[#82828b] hover:text-[#d4d4d8] transition-colors py-1 select-none group"
              aria-expanded={showMore}
            >
              <span className="text-[10px] text-[#52525b] group-hover:text-[#8e8e93] transition-colors">
                {showMore ? '−' : '+'}
              </span>
              <span>
                {showMore ? 'hide examination honors' : 'more (honors & national examination)'}
              </span>
            </button>

            <div className={`expandable-grid ${showMore ? 'expanded' : ''}`}>
              <div className="expandable-inner pt-3 space-y-3">
                {achievements.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 sm:gap-4 text-[13px] border-l border-[#222225] pl-3 py-1"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-[#d4d4d8] font-medium text-[13px]">
                        {item.degree}
                        {item.score && (
                          <span className="text-[12px] font-mono text-[#8e8e93] font-normal ml-2">
                            · {item.score} Aggregate
                          </span>
                        )}
                      </div>

                      <div className="text-[#8e8e93] text-[12.5px] mt-0.5">
                        {item.institution}
                      </div>

                      {item.details && (
                        <div className="text-[#8e8e93] text-[12px] mt-1 leading-relaxed">
                          {item.details}
                        </div>
                      )}
                    </div>

                    {item.period && (
                      <div className="text-[12px] font-mono text-[#82828b] shrink-0 pt-0.5">
                        {item.period}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
