import React from 'react';
import essayMarkdown from '../content/essays/causal-measurement.md?raw';
import { EssayReader } from './EssayReader';

interface CausalMeasurementEssayProps {
  onBack: () => void;
}

export const CausalMeasurementEssay: React.FC<CausalMeasurementEssayProps> = ({ onBack }) => {
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
          <rect x="1" y="5" width="2" height="3" />
          <rect x="4" y="2" width="2" height="6" />
          <rect x="7" y="5" width="2" height="3" />
        </svg>
      }
    />
  );
};
