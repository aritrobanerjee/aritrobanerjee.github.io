import React from 'react';
import essayMarkdown from '../content/essays/build-what-cant-be-defined.md?raw';
import { EssayReader } from './EssayReader';

interface BuildEssayProps {
  onBack: () => void;
}

export const BuildEssay: React.FC<BuildEssayProps> = ({ onBack }) => {
  return (
    <EssayReader
      markdown={essayMarkdown}
      onBack={onBack}
      icon={
        <svg
          viewBox="0 0 10 10"
          className="w-4 h-4 md:w-5 md:h-5 fill-current text-[#ededed]"
          style={{ shapeRendering: 'crispEdges' }}
        >
          <rect x="1" y="6" width="8" height="2" />
          <rect x="2" y="4" width="6" height="2" />
          <rect x="3" y="2" width="4" height="2" />
        </svg>
      }
    />
  );
};
