import React from 'react';
import { ProjectItem } from '../types/project';
import { projects as defaultProjects } from '../data/projects';

interface WritingSectionProps {
  onSelectArticle: (articleId: string) => void;
  items?: ProjectItem[];
}

export const WritingSection: React.FC<WritingSectionProps> = ({
  onSelectArticle,
  items = defaultProjects,
}) => {
  return (
    <section className="space-y-6">
      <div className="border-b border-[#18181b] pb-2">
        <h2 className="text-[11px] font-mono uppercase tracking-[0.15em] text-[#82828b]">
          Projects
        </h2>
      </div>

      <div className="space-y-4">
        {items.map((project) => (
          <div
            key={project.id}
            onClick={() => onSelectArticle(project.slug)}
            className="group p-4 rounded-xl border border-[#1e1e22] hover:border-[#383840] bg-[#0e0e10]/80 hover:bg-[#121215] transition-all duration-200 cursor-pointer select-none"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#121214] border border-[#222225] flex items-center justify-center shrink-0 group-hover:border-[#383840] group-hover:bg-[#18181c] transition-all duration-200">
                  <div className="w-2.5 h-2.5 text-[#82828b] group-hover:text-white transition-colors duration-200 flex items-center justify-center">
                    {project.icon}
                  </div>
                </div>
                <h3 className="text-[14px] font-medium text-[#ededed] group-hover:text-white transition-colors">
                  {project.title}
                </h3>
              </div>
              {project.tag && (
                <span className="text-[10px] font-mono tracking-wider uppercase px-2 py-0.5 rounded bg-[#161619] border border-[#27272a] text-[#8e8e93] group-hover:text-[#d4d4d8] group-hover:border-[#383840] transition-colors">
                  {project.tag}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
