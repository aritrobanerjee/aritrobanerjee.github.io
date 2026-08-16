import React, { useState } from 'react';
import { CompanyExperience } from '../types/profile';

interface ExperienceProps {
  items: CompanyExperience[];
}

export const Experience: React.FC<ExperienceProps> = ({ items }) => {
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  const toggleExpand = (key: string) => {
    setExpandedRole((prev) => (prev === key ? null : key));
  };

  return (
    <section className="space-y-6">
      <div className="border-b border-[#18181b] pb-2">
        <h2 className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#52525b]">
          Experience
        </h2>
      </div>

      <div className="space-y-7">
        {items.map((company) => (
          <div
            key={company.id}
            className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4 text-[13.5px]"
          >
            {/* Monospace Company Period */}
            <div className="w-full sm:w-[125px] shrink-0 font-mono text-[12.5px] text-[#52525b] pt-0.5">
              {company.period}
            </div>

            {/* Company & Roles */}
            <div className="flex-1 min-w-0 space-y-3.5">
              <div className="text-[#ededed] font-medium text-[14px]">
                {company.company}
              </div>

              {/* Nested Sub-roles */}
              <div className="space-y-3">
                {company.roles.map((role, idx) => {
                  const roleKey = `${company.id}-${idx}`;
                  const isExpanded = expandedRole === roleKey;

                  return (
                    <div
                      key={idx}
                      className="group cursor-pointer select-none"
                      onClick={() => toggleExpand(roleKey)}
                    >
                      <div className="flex items-baseline justify-between gap-2">
                        <div className="text-[13.5px] text-[#d4d4d8] group-hover:text-white transition-colors">
                          <span>{role.title}</span>
                          {company.roles.length > 1 && (
                            <span className="text-[#52525b] font-mono text-[11.5px] ml-2">
                              {role.period}
                            </span>
                          )}
                        </div>

                        {role.details && role.details.length > 0 && (
                          <span className="text-[10px] font-mono text-[#3f3f46] group-hover:text-[#71717a] transition-colors">
                            {isExpanded ? '−' : '+'}
                          </span>
                        )}
                      </div>

                      {/* 1-line high impact summary */}
                      <p className="mt-0.5 text-[13px] leading-relaxed text-[#71717a] group-hover:text-[#8e8e93] transition-colors">
                        {role.summary}
                      </p>

                      {/* Expandable details */}
                      {role.details && (
                        <div className={`expandable-grid ${isExpanded ? 'expanded' : ''}`}>
                          <div className="expandable-inner">
                            <ul className="mt-2 space-y-1 border-l border-[#222225] pl-3 py-0.5">
                              {role.details.map((detail, dIdx) => (
                                <li
                                  key={dIdx}
                                  className="text-[12.5px] text-[#52525b] leading-relaxed"
                                >
                                  {detail}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
