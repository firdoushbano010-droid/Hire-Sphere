import { SkillName, SkillVerificationRecord, StudentProfile } from '../types';
import { SKILLS_METADATA } from '../data/mockData';

export function calculateProfileCompletion(student: StudentProfile): number {
  let points = 0;
  const totalChecks = 10;

  if (student.fullName.trim() && student.email.trim()) points += 1;
  if (student.college.trim() && student.university.trim()) points += 1;
  if (student.degree.trim() && student.branch.trim()) points += 1;
  if (student.cgpa > 0 && student.graduationYear >= 2024) points += 1;
  if (student.technicalSkills.length >= 3) points += 1;
  if (student.projects.length >= 1) points += 1;
  if (student.certifications.length >= 1) points += 1;
  if (student.experience.length >= 1) points += 1;
  if (student.githubUrl.trim() && student.linkedinUrl.trim()) points += 1;
  if (student.resume && student.resume.fileName.trim()) points += 1;

  return Math.round((points / totalChecks) * 100);
}

export interface ResumeReadinessAnalysis {
  totalScore: number;
  identifiedSkills: string[];
  missingRecommendedSkills: SkillName[];
  verifiedSkillCount: number;
  breakdown: {
    label: string;
    score: number;
    maxScore: number;
    detail: string;
  }[];
}

export function calculateResumeReadiness(
  student: StudentProfile,
  verifications: SkillVerificationRecord[]
): ResumeReadinessAnalysis {
  const studentVerifications = verifications.filter(
    (v) => v.studentId === student.id && v.verified
  );
  const verifiedSkillsSet = new Set<SkillName>(studentVerifications.map((v) => v.skill));

  // 1. Academic & Contact Completeness (20 pts)
  let academicScore = 0;
  if (student.fullName && student.email && student.college) academicScore += 10;
  if (student.cgpa >= 7.0) academicScore += 5;
  if (student.githubUrl && student.linkedinUrl) academicScore += 5;

  // 2. Technical Skill Coverage (25 pts)
  const skillCount = student.technicalSkills.length;
  const skillScore = Math.min(25, skillCount * 4 + (skillCount >= 5 ? 5 : 0));

  // 3. Verified Skill Credentials (30 pts - 10 pts per verified skill up to 3)
  const verifiedScore = Math.min(30, verifiedSkillsSet.size * 10);

  // 4. Engineering Projects & Practical Experience (25 pts)
  let projectExpScore = 0;
  if (student.projects.length >= 1) projectExpScore += 10;
  if (student.projects.length >= 2) projectExpScore += 7;
  if (student.experience.length >= 1 || student.certifications.length >= 1) {
    projectExpScore += 8;
  }

  const totalScore = Math.min(
    100,
    academicScore + skillScore + verifiedScore + projectExpScore
  );

  const allSupportedSkills = SKILLS_METADATA.map((s) => s.name);
  const missingRecommendedSkills = allSupportedSkills.filter(
    (skill) => !verifiedSkillsSet.has(skill)
  );

  return {
    totalScore,
    identifiedSkills: student.technicalSkills,
    missingRecommendedSkills: missingRecommendedSkills.slice(0, 4),
    verifiedSkillCount: verifiedSkillsSet.size,
    breakdown: [
      {
        label: 'Academic & Portfolio Links',
        score: academicScore,
        maxScore: 20,
        detail: 'CGPA, university details, GitHub, and LinkedIn presence',
      },
      {
        label: 'Declared Technical Stack',
        score: skillScore,
        maxScore: 25,
        detail: `${student.technicalSkills.length} core engineering skills indexed on resume`,
      },
      {
        label: 'Verified Assessment Credentials (≥80%)',
        score: verifiedScore,
        maxScore: 30,
        detail: `${verifiedSkillsSet.size} skill(s) verified via Hire Sphere Assessment`,
      },
      {
        label: 'Projects, Internships & Certifications',
        score: projectExpScore,
        maxScore: 25,
        detail: `${student.projects.length} project(s) and ${student.experience.length} internship(s)`,
      },
    ],
  };
}

export function generateCredentialId(skill: SkillName): string {
  const meta = SKILLS_METADATA.find((s) => s.name === skill);
  const code = meta ? meta.shortCode : 'SKILL';
  const suffix = Math.floor(1000 + Math.random() * 9000);
  return `HS-VER-${code}-${suffix}`;
}
