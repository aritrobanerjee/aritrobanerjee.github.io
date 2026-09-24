import type { ReactNode } from 'react';

export interface OpenSourceItem {
  id: string;
  name: string;
  repoUrl: string;
  description: string;
  tag?: string;
  version?: string;
  icon: ReactNode;
}

export const openSourceProjects: OpenSourceItem[] = [
  {
    id: 'antigravity-quota-tracker',
    name: 'antigravity-quota-tracker',
    repoUrl: 'https://github.com/aritrobanerjee/antigravity-quota-tracker',
    description:
      'Diagnostic CLI & global Antigravity Skill auditing model quota usage, rate limits (RPM/TPM), token velocity, and thread bloat across Google Antigravity workspaces.',
    tag: 'Skill & CLI',
    version: 'v1.0.0',
    icon: (
      <svg
        viewBox="0 0 10 10"
        className="w-full h-full fill-current"
        style={{ shapeRendering: 'crispEdges' }}
      >
        <rect x="1" y="2" width="8" height="2" />
        <rect x="1" y="5" width="5" height="2" />
        <rect x="1" y="8" width="3" height="1" />
      </svg>
    ),
  },
];
