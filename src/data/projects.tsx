import type { ProjectItem } from '../types/project';
import causalMarkdown from '../content/essays/causal-measurement.md?raw';
import designMarkdown from '../content/essays/design-what-cant-be-imagined.md?raw';
import buildMarkdown from '../content/essays/build-what-cant-be-defined.md?raw';

export const projects: ProjectItem[] = [
  {
    id: 'causal-measurement',
    slug: 'causal-measurement',
    title: "How to Measure What Can't Be Tested",
    tag: 'WIP',
    markdown: causalMarkdown,
    icon: (
      <svg
        viewBox="0 0 10 10"
        className="w-full h-full fill-current"
        style={{ shapeRendering: 'crispEdges' }}
      >
        <rect x="1" y="5" width="2" height="3" />
        <rect x="4" y="2" width="2" height="6" />
        <rect x="7" y="5" width="2" height="3" />
      </svg>
    ),
  },
  {
    id: 'design-what-cant-be-imagined',
    slug: 'design-what-cant-be-imagined',
    title: "How to Design What Can't Be Imagined",
    tag: 'WIP',
    markdown: designMarkdown,
    icon: (
      <svg
        viewBox="0 0 10 10"
        className="w-full h-full fill-current"
        style={{ shapeRendering: 'crispEdges' }}
      >
        <rect x="1" y="1" width="3" height="3" />
        <rect x="6" y="1" width="3" height="3" />
        <rect x="1" y="6" width="3" height="3" />
        <rect x="6" y="6" width="3" height="3" />
        <rect x="4" y="4" width="2" height="2" />
      </svg>
    ),
  },
  {
    id: 'build-what-cant-be-defined',
    slug: 'build-what-cant-be-defined',
    title: "How to Build What Can't Be Defined",
    tag: 'WIP',
    markdown: buildMarkdown,
    icon: (
      <svg
        viewBox="0 0 10 10"
        className="w-full h-full fill-current"
        style={{ shapeRendering: 'crispEdges' }}
      >
        <rect x="1" y="6" width="8" height="2" />
        <rect x="2" y="4" width="6" height="2" />
        <rect x="3" y="2" width="4" height="2" />
      </svg>
    ),
  },
];
