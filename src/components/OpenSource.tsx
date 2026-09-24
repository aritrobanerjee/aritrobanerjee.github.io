import React from 'react';
import { openSourceProjects, OpenSourceItem } from '../data/openSource';

interface OpenSourceProps {
  items?: OpenSourceItem[];
}

export const OpenSource: React.FC<OpenSourceProps> = ({
  items = openSourceProjects,
}) => {
  return (
    <section className="space-y-6">
      <div className="border-b border-[#18181b] pb-2">
        <h2 className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#82828b]">
          Open Source
        </h2>
      </div>

      <div className="space-y-4">
        {items.map((project) => (
          <a
            key={project.id}
            href={project.repoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group block p-4 rounded-xl border border-[#1e1e22] hover:border-[#383840] bg-[#0e0e10]/80 hover:bg-[#121215] transition-all duration-200 select-none"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#121214] border border-[#222225] flex items-center justify-center shrink-0 group-hover:border-[#383840] group-hover:bg-[#18181c] transition-all duration-200">
                  <div className="w-2.5 h-2.5 text-[#82828b] group-hover:text-white transition-colors duration-200 flex items-center justify-center">
                    {project.icon}
                  </div>
                </div>
                <h3 className="text-[14px] font-medium text-[#ededed] group-hover:text-white transition-colors flex items-center gap-1.5">
                  {project.name}
                  <span className="text-[#52525b] group-hover:text-[#82828b] transition-colors text-[11px] font-mono font-normal">
                    ↗
                  </span>
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {project.tag && (
                  <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-[#161619] border border-[#27272a] text-[#8e8e93] group-hover:text-[#d4d4d8] group-hover:border-[#383840] transition-colors">
                    {project.tag}
                  </span>
                )}
                {project.version && (
                  <span className="text-[11px] font-mono text-[#82828b] hidden sm:inline">
                    {project.version}
                  </span>
                )}
              </div>
            </div>

            <p className="mt-2.5 text-[13px] leading-relaxed text-[#8e8e93] group-hover:text-[#d4d4d8] transition-colors pl-9">
              {project.description}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
};
