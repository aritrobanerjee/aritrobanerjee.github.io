import React from 'react';
import { FocusItem } from '../types/profile';

interface FocusProps {
  items: FocusItem[];
}

export const Focus: React.FC<FocusProps> = ({ items }) => {
  return (
    <section className="space-y-6">
      <div className="border-b border-[#18181b] pb-2">
        <h2 className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#52525b]">
          Competencies
        </h2>
      </div>

      <div className="space-y-2.5">
        {items.map((item, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 text-[13px]"
          >
            {/* Monospace Key Label */}
            <div className="w-full sm:w-[125px] shrink-0 font-mono text-[12.5px] text-[#52525b]">
              {item.label}
            </div>

            {/* Description */}
            <div className="flex-1 text-[#8e8e93] leading-relaxed">
              {item.description}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
