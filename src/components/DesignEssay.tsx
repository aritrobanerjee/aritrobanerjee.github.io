import React from 'react';
import essayMarkdown from '../content/essays/design-what-cant-be-imagined.md?raw';
import { EssayReader } from './EssayReader';

interface DesignEssayProps {
  onBack: () => void;
}

export const DesignEssay: React.FC<DesignEssayProps> = ({ onBack }) => {
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
          <rect x="1" y="1" width="3" height="3" />
          <rect x="6" y="1" width="3" height="3" />
          <rect x="1" y="6" width="3" height="3" />
          <rect x="6" y="6" width="3" height="3" />
          <rect x="4" y="4" width="2" height="2" />
        </svg>
      }
    />
  );
};
