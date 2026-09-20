import React from 'react';
import { FocusItem } from '../types/profile';

interface FocusProps {
  items: FocusItem[];
}

export const Focus: React.FC<FocusProps> = ({ items }) => {
  return (
    <section className="space-y-6">
      <div className="border-b border-[#18181b] pb-2">
        <h2 className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#82828b]">
          Competencies
        </h2>
      </div>

      {/* Mobile view (< md): exactly unchanged vertical rows */}
      <div className="space-y-2.5 md:hidden">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 text-[13px]"
          >
            {/* Monospace Key Label */}
            <div className="w-full sm:w-[150px] shrink-0 font-mono text-[12.5px] text-[#82828b]">
              {item.label}
            </div>

            {/* Description */}
            <div className="flex-1 text-[#8e8e93] leading-relaxed">
              {item.description}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop view (>= md): 3-column tactile cards utilizing full width */}
      <div className="hidden md:grid md:grid-cols-3 gap-3.5">
        {items.map((item, index) => (
          <div
            key={index}
            className="p-4 rounded-xl border border-[#1e1e22] hover:border-[#383840] bg-[#0e0e10]/80 hover:bg-[#121215] transition-all duration-200 flex flex-col justify-between"
          >
            <div>
              <div className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#82828b]">
                {item.label}
              </div>
              <p className="text-[13px] text-[#d4d4d8] leading-relaxed mt-2.5">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
