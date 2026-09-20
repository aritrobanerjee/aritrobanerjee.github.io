import type { ReactNode } from 'react';

export interface ProjectItem {
  /** Unique identifier for the project or essay */
  id: string;
  /** URL slug (e.g., 'causal-measurement' routes to /writing/causal-measurement) */
  slug: string;
  /** Display title for the card and document heading */
  title: string;
  /** Optional status pill text (e.g., 'WIP', 'NEW', 'ESSAY') */
  tag?: string;
  /** Markdown raw content */
  markdown: string;
  /** Crisp pixel SVG icon rendered on the card and article banner */
  icon: ReactNode;
  /** Optional short summary */
  summary?: string;
}
