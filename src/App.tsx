/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  GraduationCap,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import {
  ApplicationStatus,
  AssessmentQuestion,
  CompanyProfile,
  JobApplication,
  LearningResource,
  OpportunityListing,
  SkillName,
  SkillVerificationRecord,
  StudentProfile,
  UserRole,
} from './types';
import {
  INITIAL_APPLICATIONS,
  INITIAL_COMPANIES,
  INITIAL_LEARNING_RESOURCES,
  INITIAL_OPPORTUNITIES,
  INITIAL_QUESTIONS,
  INITIAL_STUDENTS,
  INITIAL_VERIFICATIONS,
} from './data/mockData';
import {
  calculateResumeReadiness,
  generateCredentialId,
} from './utils/assessmentEngine';
import { LandingPage } from './components/LandingPage';
import { StudentDashboard, StudentTabId } from './components/StudentDashboard';
import { CompanyDashboard } from './components/CompanyDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { BrandLogo } from './components/BrandLogo';

const STORAGE_KEY = 'hiresphere_central_student_v4';
const LEGACY_KEYS = [
  'hiresphere_demo_state_v1',
  'hiresphere_demo_state_v2',
  'hiresphere_central_student_v3',
];

export default function App() {
  // Active View Role: null = Landing Page, or 'student' | 'company' | 'admin'
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);
  const [studentInitialTab, setStudentInitialTab] =
    useState<StudentTabId>('overview');
  const [initialAssessmentSkill, setInitialAssessmentSkill] =
    useState<SkillName | null>(null);
  const [roleModalOpen, setRoleModalOpen] = useState(false);

  // Clean up legacy demo storage keys once so old stale data never overwrites the centralized student profile
  useEffect(() => {
    try {
      LEGACY_KEYS.forEach((k) => localStorage.removeItem(k));
    } catch {
      // Ignore storage access errors
    }
  }, []);

  // Core Application State (initialized from localStorage or Fictional Sample Data)
  const [students, setStudents] = useState<StudentProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.students) && parsed.students.length > 0) {
          return parsed.students;
        }
      }
    } catch {
      // Fallback to initial data
    }
    return INITIAL_STUDENTS;
  });

  const [companies, setCompanies] = useState<CompanyProfile[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.companies) && parsed.companies.length > 0) {
          return parsed.companies;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_COMPANIES;
  });

  const [opportunities, setOpportunities] = useState<OpportunityListing[]>(
    () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (
            Array.isArray(parsed.opportunities) &&
            parsed.opportunities.length > 0
          ) {
            return parsed.opportunities;
          }
        }
      } catch {
        // Fallback
      }
      return INITIAL_OPPORTUNITIES;
    }
  );

  const [applications, setApplications] = useState<JobApplication[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.applications)) {
          return parsed.applications;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_APPLICATIONS;
  });

  const [questions, setQuestions] = useState<AssessmentQuestion[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.questions) && parsed.questions.length > 0) {
          return parsed.questions;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_QUESTIONS;
  });

  const [verifications, setVerifications] = useState<SkillVerificationRecord[]>(
    () => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed.verifications)) {
            return parsed.verifications;
          }
        }
      } catch {
        // Fallback
      }
      return INITIAL_VERIFICATIONS;
    }
  );

  const [resources, setResources] = useState<LearningResource[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.resources) && parsed.resources.length > 0) {
          return parsed.resources;
        }
      }
    } catch {
      // Fallback
    }
    return INITIAL_LEARNING_RESOURCES;
  });

  // Toast Notification Banner State
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'info' | 'warning';
  } | null>(null);

  const showToast = (
    message: string,
    type: 'success' | 'info' | 'warning' = 'success'
  ) => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  // Persist changes to browser localStorage
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          students,
          companies,
          opportunities,
          applications,
          questions,
          verifications,
          resources,
        })
      );
    } catch {
      // Ignore quota errors
    }
  }, [
    students,
    companies,
    opportunities,
    applications,
    questions,
    verifications,
    resources,
  ]);

  const currentStudent = students[0] || INITIAL_STUDENTS[0];
  const currentCompany = companies[0] || INITIAL_COMPANIES[0];

  const currentStudentVerifiedSkills = Array.from(
    new Set(
      verifications
        .filter((v) => v.studentId === currentStudent.id && v.verified)
        .map((v) => v.skill)
    )
  );

  const currentStudentResumeReadiness = calculateResumeReadiness(
    currentStudent,
    verifications
  ).totalScore;

  // Centralized Student Update Handler: updates students, applications, and verifications simultaneously
  const handleUpdateStudent = (updated: StudentProfile) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === updated.id ? updated : s))
    );

    setApplications((prev) =>
      prev.map((a) =>
        a.studentId === updated.id
          ? {
              ...a,
              studentName: updated.fullName,
              studentEmail: updated.email,
              studentBranch: updated.branch,
              studentCollege: updated.college,
              studentCgpa: updated.cgpa,
              studentSkills: updated.technicalSkills,
              resumeFileName: updated.resume.fileName,
            }
          : a
      )
    );

    setVerifications((prev) =>
      prev.map((v) =>
        v.studentId === updated.id
          ? {
              ...v,
              studentName: updated.fullName,
              studentEmail: updated.email,
            }
          : v
      )
    );
  };

  const handleToggleSaveOpportunity = (oppId: string) => {
    const exists = currentStudent.savedOpportunityIds.includes(oppId);
    const updatedSaved = exists
      ? currentStudent.savedOpportunityIds.filter((id) => id !== oppId)
      : [...currentStudent.savedOpportunityIds, oppId];
    handleUpdateStudent({
      ...currentStudent,
      savedOpportunityIds: updatedSaved,
    });
    showToast(
      exists
        ? 'Removed from Saved Opportunities.'
        : 'Saved to your Student Bookmarks!',
      'info'
    );
  };

  const handleApplyOpportunity = (
    opp: OpportunityListing,
    coverNote: string
  ) => {
    const alreadyApplied = applications.some(
      (a) =>
        a.opportunityId === opp.id && a.studentId === currentStudent.id
    );
    if (alreadyApplied) {
      showToast('You have already applied to this opportunity.', 'warning');
      return;
    }

    const verifiedSnapshot = verifications
      .filter((v) => v.studentId === currentStudent.id && v.verified)
      .map((v) => ({ skill: v.skill, score: v.scorePercentage }));

    const newApp: JobApplication = {
      id: `app-${Date.now()}`,
      opportunityId: opp.id,
      opportunityTitle: opp.title,
      opportunityCategory: opp.category,
      companyId: opp.companyId,
      companyName: opp.companyName,
      studentId: currentStudent.id,
      studentName: currentStudent.fullName,
      studentEmail: currentStudent.email,
      studentBranch: currentStudent.branch,
      studentCollege: currentStudent.college,
      studentCgpa: currentStudent.cgpa,
      studentSkills: currentStudent.technicalSkills,
      verifiedSkillsSnapshot: verifiedSnapshot,
      resumeFileName: currentStudent.resume.fileName,
      coverNote:
        coverNote.trim() ||
        `Submitted with ${verifiedSnapshot.length} verified skills.`,
      status: 'Applied',
      appliedAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0],
    };

    setApplications((prev) => [newApp, ...prev]);
    showToast(
      `Application submitted to ${opp.companyName} for ${opp.title}!`,
      'success'
    );
  };

  const handleSubmitAssessment = (
    skill: SkillName,
    scorePercentage: number,
    correctCount: number,
    totalQuestions: number
  ): SkillVerificationRecord => {
    const isVerified = scorePercentage >= 80;
    const newRecord: SkillVerificationRecord = {
      id: `ver-${Date.now()}`,
      studentId: currentStudent.id,
      studentName: currentStudent.fullName,
      studentEmail: currentStudent.email,
      skill,
      scorePercentage,
      correctCount,
      totalQuestions,
      verified: isVerified,
      attemptedAt: new Date().toISOString().split('T')[0],
      credentialId: isVerified ? generateCredentialId(skill) : undefined,
    };

    setVerifications((prev) => [newRecord, ...prev]);

    if (isVerified && !currentStudent.technicalSkills.includes(skill)) {
      handleUpdateStudent({
        ...currentStudent,
        technicalSkills: [...currentStudent.technicalSkills, skill],
      });
    }

    showToast(
      isVerified
        ? `${skill} Verified with ${scorePercentage}%! Green badge added to your profile.`
        : `Assessment completed (${scorePercentage}%). Score ≥80% required for verification.`,
      isVerified ? 'success' : 'warning'
    );

    return newRecord;
  };

  const handleResetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setStudents(INITIAL_STUDENTS);
    setCompanies(INITIAL_COMPANIES);
    setOpportunities(INITIAL_OPPORTUNITIES);
    setApplications(INITIAL_APPLICATIONS);
    setQuestions(INITIAL_QUESTIONS);
    setVerifications(INITIAL_VERIFICATIONS);
    setResources(INITIAL_LEARNING_RESOURCES);
    showToast('All demo data restored to factory defaults.', 'info');
  };

  const handleNavigateRole = (
    role: UserRole,
    targetTab?: string,
    selectedSkill?: SkillName
  ) => {
    if (role === 'student') {
      setStudentInitialTab((targetTab as StudentTabId) || 'overview');
      setInitialAssessmentSkill(selectedSkill || null);
    }
    setActiveRole(role);
    setRoleModalOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen relative">
      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm bg-[#0B1220] text-white border border-white/15 px-4 py-3 rounded-xl shadow-xl flex items-center gap-3">
          <CheckCircle2
            className={`w-4 h-4 shrink-0 ${
              toast.type === 'warning' ? 'text-amber-400' : 'text-[#10B981]'
            }`}
          />
          <span className="text-xs font-medium leading-snug">
            {toast.message}
          </span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white ml-1 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* View Router */}
      {activeRole === 'student' ? (
        <StudentDashboard
          key={`stu-${studentInitialTab}-${initialAssessmentSkill || 'none'}`}
          student={currentStudent}
          opportunities={opportunities}
          applications={applications}
          questions={questions}
          verifications={verifications}
          resources={resources}
          initialTab={studentInitialTab}
          initialAssessmentSkill={initialAssessmentSkill}
          onUpdateStudent={handleUpdateStudent}
          onToggleSaveOpportunity={handleToggleSaveOpportunity}
          onApplyOpportunity={handleApplyOpportunity}
          onSubmitAssessment={handleSubmitAssessment}
          onSwitchRole={(r) => setActiveRole(r)}
          onResetDemoData={handleResetDemoData}
          onNotify={showToast}
        />
      ) : activeRole === 'company' ? (
        <CompanyDashboard
          company={currentCompany}
          students={students}
          opportunities={opportunities}
          applications={applications}
          onUpdateCompany={(updated) =>
            setCompanies((prev) =>
              prev.map((c) => (c.id === updated.id ? updated : c))
            )
          }
          onUpdateStudent={handleUpdateStudent}
          onCreateOpportunity={(newOpp) =>
            setOpportunities((prev) => [newOpp, ...prev])
          }
          onDeleteOpportunity={(id) =>
            setOpportunities((prev) => prev.filter((o) => o.id !== id))
          }
          onUpdateApplicationStatus={(appId, status: ApplicationStatus) => {
            setApplications((prev) =>
              prev.map((a) =>
                a.id === appId
                  ? {
                      ...a,
                      status,
                      updatedAt: new Date().toISOString().split('T')[0],
                    }
                  : a
              )
            );
            showToast(`Application status updated to "${status}".`, 'success');
          }}
          onSwitchRole={(r) => setActiveRole(r)}
          onNotify={showToast}
        />
      ) : activeRole === 'admin' ? (
        <AdminDashboard
          students={students}
          companies={companies}
          opportunities={opportunities}
          questions={questions}
          resources={resources}
          verifications={verifications}
          onDeleteStudent={(id) =>
            setStudents((prev) => prev.filter((s) => s.id !== id))
          }
          onDeleteCompany={(id) =>
            setCompanies((prev) => prev.filter((c) => c.id !== id))
          }
          onDeleteOpportunity={(id) =>
            setOpportunities((prev) => prev.filter((o) => o.id !== id))
          }
          onAddQuestion={(q) => setQuestions((prev) => [q, ...prev])}
          onDeleteQuestion={(id) =>
            setQuestions((prev) => prev.filter((q) => q.id !== id))
          }
          onAddResource={(r) => setResources((prev) => [r, ...prev])}
          onDeleteResource={(id) =>
            setResources((prev) => prev.filter((r) => r.id !== id))
          }
          onSwitchRole={(r) => setActiveRole(r)}
          onResetDemoData={handleResetDemoData}
          onNotify={showToast}
        />
      ) : (
        <LandingPage
          student={currentStudent}
          resumeReadinessScore={currentStudentResumeReadiness}
          opportunities={opportunities}
          savedOpportunityIds={currentStudent.savedOpportunityIds}
          verifiedSkills={currentStudentVerifiedSkills}
          onToggleSaveOpportunity={handleToggleSaveOpportunity}
          onSelectRole={handleNavigateRole}
          onOpenRoleModal={() => setRoleModalOpen(true)}
          onQuickApply={(opp) => {
            handleApplyOpportunity(
              opp,
              `Interested in ${opp.title} at ${opp.companyName}.`
            );
          }}
        />
      )}

      {/* Demo Role Selection Modal */}
      {roleModalOpen && (
        <div className="fixed inset-0 z-50 bg-[#0B1220]/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
              <div>
                <BrandLogo theme="light" size="sm" />
                <p className="text-xs text-[#64748B] mt-1">
                  Select a Demo Portal Role (Frontend-Only Prototype)
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRoleModalOpen(false)}
                className="p-1.5 rounded-lg border border-[#E2E8F0] text-[#64748B] hover:text-[#111827] cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleNavigateRole('student', 'overview')}
                className="w-full p-4 rounded-xl bg-[#F4F7FC] hover:bg-[#2563FF]/10 border border-[#E2E8F0] hover:border-[#2563FF] text-left flex items-center justify-between transition-all cursor-pointer group"
              >
                <div>
                  <div className="text-sm font-bold text-[#111827] group-hover:text-[#2563FF]">
                    1. Student Dashboard
                  </div>
                  <div className="text-xs text-[#64748B] mt-0.5">
                    {currentStudent.fullName} ({currentStudent.degree} ·{' '}
                    {currentStudent.branch}) · Resume Readiness, Jobs, & 80%
                    Skill Verification Quizzes
                  </div>
                </div>
                <GraduationCap className="w-5 h-5 text-[#2563FF] shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleNavigateRole('company', 'overview')}
                className="w-full p-4 rounded-xl bg-[#F4F7FC] hover:bg-[#2563FF]/10 border border-[#E2E8F0] hover:border-[#2563FF] text-left flex items-center justify-between transition-all cursor-pointer group"
              >
                <div>
                  <div className="text-sm font-bold text-[#111827] group-hover:text-[#2563FF]">
                    2. Company Recruiter Portal
                  </div>
                  <div className="text-xs text-[#64748B] mt-0.5">
                    Nexus Cloud Systems · Post Jobs/Internships, Inspect
                    Verified Skills & Shortlist Applicants
                  </div>
                </div>
                <Building2 className="w-5 h-5 text-[#2563FF] shrink-0" />
              </button>

              <button
                type="button"
                onClick={() => handleNavigateRole('admin', 'overview')}
                className="w-full p-4 rounded-xl bg-[#F4F7FC] hover:bg-[#2563FF]/10 border border-[#E2E8F0] hover:border-[#2563FF] text-left flex items-center justify-between transition-all cursor-pointer group"
              >
                <div>
                  <div className="text-sm font-bold text-[#111827] group-hover:text-[#2563FF]">
                    3. Placement Admin Console
                  </div>
                  <div className="text-xs text-[#64748B] mt-0.5">
                    Manage Students, Companies, Assessment Question Bank &
                    Verification Records
                  </div>
                </div>
                <SlidersHorizontal className="w-5 h-5 text-[#2563FF] shrink-0" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
