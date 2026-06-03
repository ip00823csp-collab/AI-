export interface BasicInfo {
  name: string;
  title: string;
  email: string;
  phone: string;
  location?: string;
  summary?: string;
}

export interface EducationItem {
  id: string;
  school: string;
  major: string;
  degree: string;
  startDate: string;
  endDate: string;
  description?: string;
}

export interface WorkItem {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface ProjectItem {
  id: string;
  name: string;
  role?: string;
  link?: string;
  startDate?: string;
  endDate?: string;
  bullets: string[];
}

export interface ResumeData {
  basic: BasicInfo;
  education: EducationItem[];
  work: WorkItem[];
  projects: ProjectItem[];
  skills: string[];
}

export interface JdMatchResult {
  overallScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: { section: string; advice: string }[];
}
