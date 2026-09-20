/**
 * RoleItem represents an individual role or position held within a company.
 */
export interface RoleItem {
  /** Job title or designation */
  title: string;
  /** Employment period or timeframe (e.g., '2026 - Present') */
  period: string;
  /** Single-line high-impact executive summary */
  summary: string;
  /** Detailed bullet points revealed when expanded */
  details?: string[];
  /** Flag indicating current active role */
  current?: boolean;
}

/**
 * CompanyExperience represents an employer or organization timeline item.
 */
export interface CompanyExperience {
  /** Unique identifier for the company (e.g., 'google') */
  id: string;
  /** Name of the organization */
  company: string;
  /** Overall tenure period at the organization */
  period: string;
  /** Work location or regions */
  location?: string;
  /** One or more sequential roles held at this organization */
  roles: RoleItem[];
}

/**
 * FocusItem represents an area of deep competency, skill, or technical focus.
 */
export interface FocusItem {
  /** Skill or focus domain name */
  label: string;
  /** Concise description of scope, systems, or technical depth */
  description: string;
}

/**
 * EducationItem represents an academic degree, certification, or examination honor.
 */
export interface EducationItem {
  /** University, college, or examination body */
  institution: string;
  /** Degree name or certificate title */
  degree: string;
  /** Field of study or concentration */
  field?: string;
  /** Graduation or attendance period */
  period?: string;
  /** Grade Point Average */
  gpa?: string;
  /** Score or percentile */
  score?: string;
  /** Category differentiating core degrees from collapsible achievement honors */
  category?: 'degree' | 'achievement';
  /** Extracurricular leadership, honors, or thesis details */
  details?: string;
}

/**
 * LinkItem represents an external or internal contact/social link.
 */
export interface LinkItem {
  /** Display label (e.g., 'linkedin', 'github', 'email') */
  label: string;
  /** Destination URL or mailto link */
  url: string;
  /** Optional handle or username display */
  handle?: string;
  /** Whether the link opens in a new tab */
  isExternal?: boolean;
}

/**
 * ProfileData is the single source of truth for the portfolio theme.
 */
export interface ProfileData {
  /** Full name */
  name: string;
  /** Pronouns */
  pronouns?: string;
  /** Primary professional title */
  title: string;
  /** Current primary company or affiliation */
  company: string;
  /** Location displayed in the status badge */
  location: string;
  /** Job seeking status toggle */
  availableForWork: boolean;
  /** Short status text or tagline */
  statusText?: string;
  /** Optional headline */
  headline?: string;
  /** Executive biography paragraph */
  bio: string;
  /** Optional custom avatar URL (defaults to '/avatar.jpg') */
  avatarUrl?: string;
  /** Optional custom copyright name (defaults to name) */
  copyrightName?: string;
  /** Optional custom legal or personal views disclaimer */
  disclaimer?: string;
  /** Career experience items */
  experience: CompanyExperience[];
  /** Competencies and focus domains */
  focus: FocusItem[];
  /** Academic degrees and examination honors */
  education: EducationItem[];
  /** Social and contact links */
  links: LinkItem[];
}
