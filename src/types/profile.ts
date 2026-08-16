export interface RoleItem {
  title: string;
  period: string;
  summary: string;
  details?: string[];
  current?: boolean;
}

export interface CompanyExperience {
  id: string;
  company: string;
  period: string;
  location?: string;
  roles: RoleItem[];
}

export interface FocusItem {
  label: string;
  description: string;
}

export interface EducationItem {
  institution: string;
  degree: string;
  field?: string;
  period?: string;
  gpa?: string;
  score?: string;
  category?: 'degree' | 'achievement';
  details?: string;
}

export interface LinkItem {
  label: string;
  url: string;
  handle?: string;
  isExternal?: boolean;
}

export interface ProfileData {
  name: string;
  pronouns?: string;
  title: string;
  company: string;
  location: string;
  availableForWork: boolean;
  statusText?: string;
  headline?: string;
  bio: string;
  experience: CompanyExperience[];
  focus: FocusItem[];
  education: EducationItem[];
  links: LinkItem[];
}
