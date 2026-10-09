export type UserRole = 'student' | 'company' | 'admin';

export type SkillName =
  | 'Java'
  | 'HTML'
  | 'CSS'
  | 'JavaScript'
  | 'Python'
  | 'SQL'
  | 'Data Structures and Algorithms'
  | 'Database Management Systems';

export type DifficultyLevel = 'Beginner' | 'Intermediate' | 'Advanced';

export type ApplicationStatus = 'Applied' | 'Under Review' | 'Shortlisted' | 'Rejected';

export type OpportunityCategory = 'Job' | 'Internship';

export type WorkMode = 'On-Site' | 'Hybrid' | 'Remote';

export interface ProjectItem {
  id: string;
  title: string;
  techStack: string[];
  description: string;
  repositoryUrl?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  credentialCode?: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  organization: string;
  duration: string;
  summary: string;
}

export interface ResumeFileMetadata {
  fileName: string;
  fileSizeKb: number;
  uploadedAt: string;
  fileType: string;
  extractedTextSummary?: string;
  targetRole: string;
}

export interface StudentProfile {
  id: string;
  fullName: string;
  email: string;
  college: string;
  university: string;
  degree: string;
  branch: string;
  graduationYear: number;
  cgpa: number;
  technicalSkills: string[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  experience: ExperienceItem[];
  githubUrl: string;
  linkedinUrl: string;
  bio: string;
  location: string;
  resume: ResumeFileMetadata;
  savedOpportunityIds: string[];
  completedResourceIds: string[];
}

export interface SkillMetadata {
  name: SkillName;
  shortCode: string;
  category: string;
  difficulty: DifficultyLevel;
  description: string;
  passingScore: number;
  durationMinutes: number;
  keyTopics: string[];
}

export interface AssessmentQuestion {
  id: string;
  skill: SkillName;
  difficulty: DifficultyLevel;
  question: string;
  options: [string, string, string, string];
  correctOptionIndex: number;
  explanation: string;
}

export interface SkillVerificationRecord {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  skill: SkillName;
  scorePercentage: number;
  correctCount: number;
  totalQuestions: number;
  verified: boolean;
  attemptedAt: string;
  credentialId?: string;
}

export interface LearningResource {
  id: string;
  title: string;
  skill: SkillName;
  provider:
    | 'GeeksforGeeks'
    | 'HackerRank'
    | 'LeetCode'
    | 'MDN Web Docs'
    | 'Official Java Docs'
    | 'Official Python Docs';
  difficulty: DifficultyLevel;
  description: string;
  url: string;
  estimatedMinutes: number;
}

export interface OpportunityListing {
  id: string;
  title: string;
  companyId: string;
  companyName: string;
  companyMonogram: string;
  category: OpportunityCategory;
  workMode: WorkMode;
  location: string;
  compensation: string;
  experienceLevel: string;
  requiredSkills: string[];
  eligibilityCriteria: string;
  description: string;
  responsibilities: string[];
  deadline: string;
  postedAt: string;
  featured?: boolean;
}

export interface JobApplication {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  opportunityCategory: OpportunityCategory;
  companyId: string;
  companyName: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentBranch: string;
  studentCollege: string;
  studentCgpa: number;
  studentSkills: string[];
  verifiedSkillsSnapshot: { skill: SkillName; score: number }[];
  resumeFileName: string;
  coverNote: string;
  status: ApplicationStatus;
  appliedAt: string;
  updatedAt: string;
}

export interface CompanyProfile {
  id: string;
  name: string;
  monogram: string;
  email: string;
  industry: string;
  headquarters: string;
  website: string;
  companySize: string;
  foundedYear: number;
  description: string;
  verifiedPartner: boolean;
}
