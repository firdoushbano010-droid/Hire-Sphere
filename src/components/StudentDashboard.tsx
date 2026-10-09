import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  Bookmark,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  FileCheck2,
  FileText,
  FolderGit2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  RotateCcw,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  User,
  X,
  AlertCircle,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import {
  AssessmentQuestion,
  DifficultyLevel,
  JobApplication,
  LearningResource,
  OpportunityListing,
  SkillMetadata,
  SkillName,
  SkillVerificationRecord,
  StudentProfile,
  UserRole,
} from '../types';
import { SKILLS_METADATA } from '../data/mockData';
import {
  calculateProfileCompletion,
  calculateResumeReadiness,
} from '../utils/assessmentEngine';

export type StudentTabId =
  | 'overview'
  | 'profile'
  | 'resume'
  | 'jobs'
  | 'internships'
  | 'assessments'
  | 'verified'
  | 'resources'
  | 'saved'
  | 'applications'
  | 'settings';

interface StudentDashboardProps {
  student: StudentProfile;
  opportunities: OpportunityListing[];
  applications: JobApplication[];
  questions: AssessmentQuestion[];
  verifications: SkillVerificationRecord[];
  resources: LearningResource[];
  initialTab?: StudentTabId;
  initialAssessmentSkill?: SkillName | null;
  onUpdateStudent: (updated: StudentProfile) => void;
  onToggleSaveOpportunity: (id: string) => void;
  onApplyOpportunity: (opp: OpportunityListing, coverNote: string) => void;
  onSubmitAssessment: (
    skill: SkillName,
    scorePercentage: number,
    correctCount: number,
    totalQuestions: number
  ) => SkillVerificationRecord;
  onSwitchRole: (role: UserRole | null) => void;
  onResetDemoData: () => void;
  onNotify: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  opportunities,
  applications,
  questions,
  verifications,
  resources,
  initialTab = 'overview',
  initialAssessmentSkill = null,
  onUpdateStudent,
  onToggleSaveOpportunity,
  onApplyOpportunity,
  onSubmitAssessment,
  onSwitchRole,
  onResetDemoData,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<StudentTabId>(initialTab);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Job & Internship Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [workModeFilter, setWorkModeFilter] = useState<string>('All');
  const [skillFilter, setSkillFilter] = useState<string>('All');
  const [selectedOpportunity, setSelectedOpportunity] =
    useState<OpportunityListing | null>(null);
  const [applyingOpportunity, setApplyingOpportunity] =
    useState<OpportunityListing | null>(null);
  const [coverNote, setCoverNote] = useState('');

  // Profile Editing State
  const [isEditingProfile, setIsEditingProfile] = useState<boolean>(false);
  const [profileForm, setProfileForm] = useState<StudentProfile>(student);
  const [profileFormError, setProfileFormError] = useState<string | null>(null);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [newProjectTitle, setNewProjectTitle] = useState('');
  const [newProjectTech, setNewProjectTech] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newCertName, setNewCertName] = useState('');
  const [newCertIssuer, setNewCertIssuer] = useState('');
  const [newExpRole, setNewExpRole] = useState('');
  const [newExpOrg, setNewExpOrg] = useState('');
  const [newExpDuration, setNewExpDuration] = useState('');
  const [newExpSummary, setNewExpSummary] = useState('');

  // Resume Upload State
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Learning Resource Filter State
  const [resourceSkillFilter, setResourceSkillFilter] = useState<string>('All');
  const [resourceDifficultyFilter, setResourceDifficultyFilter] =
    useState<string>('All');

  // Skill Assessment Quiz State
  const [activeQuizSkill, setActiveQuizSkill] = useState<SkillName | null>(
    initialAssessmentSkill
  );
  const [quizStarted, setQuizStarted] = useState<boolean>(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>(
    {}
  );
  const [quizSubmittedRecord, setQuizSubmittedRecord] =
    useState<SkillVerificationRecord | null>(null);

  // Derived student metrics
  const studentVerifications = verifications.filter(
    (v) => v.studentId === student.id
  );
  const verifiedRecords = studentVerifications.filter((v) => v.verified);
  const verifiedSkillNames = Array.from(
    new Set(verifiedRecords.map((r) => r.skill))
  );
  const profileCompletion = calculateProfileCompletion(student);
  const resumeReadiness = calculateResumeReadiness(student, verifications);
  const studentApplications = applications.filter(
    (a) => a.studentId === student.id
  );

  const completedCount = student.completedResourceIds.length;
  const learningProgressPct =
    resources.length > 0
      ? Math.round((completedCount / resources.length) * 100)
      : 0;

  // Start or Reset a Skill Quiz
  const handleStartQuiz = (skill: SkillName) => {
    setActiveQuizSkill(skill);
    setQuizStarted(true);
    setCurrentQuestionIdx(0);
    setSelectedAnswers({});
    setQuizSubmittedRecord(null);
    setActiveTab('assessments');
  };

  const activeSkillQuestions = activeQuizSkill
    ? questions.filter((q) => q.skill === activeQuizSkill)
    : [];

  const handleFinishQuiz = () => {
    if (!activeQuizSkill || activeSkillQuestions.length === 0) return;
    let correct = 0;
    activeSkillQuestions.forEach((q) => {
      if (selectedAnswers[q.id] === q.correctOptionIndex) {
        correct += 1;
      }
    });
    const pct = Math.round((correct / activeSkillQuestions.length) * 100);
    const record = onSubmitAssessment(
      activeQuizSkill,
      pct,
      correct,
      activeSkillQuestions.length
    );
    setQuizSubmittedRecord(record);
  };

  // Toggle completed learning resource
  const handleToggleResourceComplete = (resourceId: string) => {
    const exists = student.completedResourceIds.includes(resourceId);
    const updatedIds = exists
      ? student.completedResourceIds.filter((id) => id !== resourceId)
      : [...student.completedResourceIds, resourceId];

    const updatedStudent = {
      ...student,
      completedResourceIds: updatedIds,
    };
    onUpdateStudent(updatedStudent);
    setProfileForm(updatedStudent);
    onNotify(
      exists
        ? 'Resource marked as incomplete.'
        : 'Learning resource marked as completed!',
      'success'
    );
  };

  // Resume Upload Handler with validation
  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
    const lowerName = file.name.toLowerCase();
    const isValidExt = allowedExtensions.some((ext) => lowerName.endsWith(ext));

    if (!isValidExt) {
      setUploadError(
        'Invalid file format. Please upload a PDF, DOCX, or TXT resume file.'
      );
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size exceeds the 5 MB maximum limit.');
      return;
    }

    const updatedStudent: StudentProfile = {
      ...student,
      resume: {
        ...student.resume,
        fileName: file.name,
        fileSizeKb: Math.max(12, Math.round(file.size / 1024)),
        uploadedAt: new Date().toISOString().split('T')[0],
        fileType: file.type || 'application/pdf',
      },
    };
    onUpdateStudent(updatedStudent);
    setProfileForm(updatedStudent);
    onNotify(
      `Resume "${file.name}" uploaded and readiness estimate refreshed.`,
      'success'
    );
  };

  // Open Edit Profile Form pre-filled with current student state
  const handleOpenEditProfile = () => {
    setProfileForm(student);
    setProfileFormError(null);
    setIsEditingProfile(true);
    setActiveTab('profile');
  };

  // Cancel Profile Edits and revert to saved student state
  const handleCancelEditProfile = () => {
    setProfileForm(student);
    setProfileFormError(null);
    setIsEditingProfile(false);
    onNotify('Profile edits canceled.', 'info');
  };

  // Save Profile Form with Email & URL Validation
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setProfileFormError(null);

    if (!profileForm.fullName.trim()) {
      setProfileFormError('Full name is required.');
      onNotify('Full name is required.', 'warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!profileForm.email.trim() || !emailRegex.test(profileForm.email.trim())) {
      setProfileFormError('Please enter a valid email address (e.g. name@domain.com).');
      onNotify('Please enter a valid email address.', 'warning');
      return;
    }

    const isValidHttpUrl = (val: string) => {
      if (!val.trim()) return true;
      try {
        const parsed = new URL(val.trim());
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    };

    if (!isValidHttpUrl(profileForm.githubUrl)) {
      setProfileFormError(
        'Please enter a valid GitHub URL starting with https:// or http://'
      );
      onNotify('Invalid GitHub URL format.', 'warning');
      return;
    }

    if (!isValidHttpUrl(profileForm.linkedinUrl)) {
      setProfileFormError(
        'Please enter a valid LinkedIn URL starting with https:// or http://'
      );
      onNotify('Invalid LinkedIn URL format.', 'warning');
      return;
    }

    // Include any pending typed inputs if the user didn't click the small "+ Add" sub-buttons
    const updatedSkills = [...profileForm.technicalSkills];
    if (
      newSkillInput.trim() &&
      !updatedSkills.includes(newSkillInput.trim())
    ) {
      updatedSkills.push(newSkillInput.trim());
      setNewSkillInput('');
    }

    const updatedProjects = [...profileForm.projects];
    if (newProjectTitle.trim()) {
      updatedProjects.push({
        id: `proj-${Date.now()}`,
        title: newProjectTitle.trim(),
        techStack: newProjectTech
          ? newProjectTech
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean)
          : ['Engineering'],
        description:
          newProjectDesc.trim() || 'Academic engineering implementation.',
      });
      setNewProjectTitle('');
      setNewProjectTech('');
      setNewProjectDesc('');
    }

    const updatedCerts = [...profileForm.certifications];
    if (newCertName.trim()) {
      updatedCerts.push({
        id: `cert-${Date.now()}`,
        name: newCertName.trim(),
        issuer: newCertIssuer.trim() || 'Verified Issuer',
        issueDate: '2026',
      });
      setNewCertName('');
      setNewCertIssuer('');
    }

    const updatedExp = [...profileForm.experience];
    if (newExpRole.trim()) {
      updatedExp.push({
        id: `exp-${Date.now()}`,
        role: newExpRole.trim(),
        organization: newExpOrg.trim() || 'Organization',
        duration: newExpDuration.trim() || '2025 – 2026',
        summary: newExpSummary.trim() || 'Engineering internship experience.',
      });
      setNewExpRole('');
      setNewExpOrg('');
      setNewExpDuration('');
      setNewExpSummary('');
    }

    const cleanedStudent: StudentProfile = {
      ...profileForm,
      fullName: profileForm.fullName.trim(),
      email: profileForm.email.trim(),
      college: profileForm.college.trim() || 'Engineering College',
      university: profileForm.university.trim() || 'University',
      degree: profileForm.degree.trim() || 'B.Tech',
      branch: profileForm.branch.trim() || 'Computer Science & Engineering',
      githubUrl: profileForm.githubUrl.trim(),
      linkedinUrl: profileForm.linkedinUrl.trim(),
      technicalSkills: updatedSkills,
      projects: updatedProjects,
      certifications: updatedCerts,
      experience: updatedExp,
      resume: {
        ...profileForm.resume,
        fileName:
          profileForm.resume.fileName.trim() ||
          `${profileForm.fullName.trim().replace(/\s+/g, '_')}_Resume.pdf`,
      },
    };

    onUpdateStudent(cleanedStudent);
    setProfileForm(cleanedStudent);
    setIsEditingProfile(false);
    onNotify('Student profile changes saved and synchronized across all views!', 'success');
  };

  const navItems: { id: StudentTabId; label: string; icon: React.ReactNode }[] =
    [
      {
        id: 'overview',
        label: 'Overview',
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
      { id: 'profile', label: 'My Profile', icon: <User className="w-4 h-4" /> },
      {
        id: 'resume',
        label: 'My Resume',
        icon: <FileText className="w-4 h-4" />,
      },
      {
        id: 'jobs',
        label: 'Find Jobs',
        icon: <Briefcase className="w-4 h-4" />,
      },
      {
        id: 'internships',
        label: 'Internships',
        icon: <GraduationCap className="w-4 h-4" />,
      },
      {
        id: 'assessments',
        label: 'Skill Assessment',
        icon: <Award className="w-4 h-4" />,
      },
      {
        id: 'verified',
        label: 'Verified Skills',
        icon: <ShieldCheck className="w-4 h-4" />,
      },
      {
        id: 'resources',
        label: 'Learning Resources',
        icon: <BookOpen className="w-4 h-4" />,
      },
      {
        id: 'saved',
        label: 'Saved Jobs',
        icon: <Bookmark className="w-4 h-4" />,
      },
      {
        id: 'applications',
        label: 'My Applications',
        icon: <FileCheck2 className="w-4 h-4" />,
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: <Settings className="w-4 h-4" />,
      },
    ];

  const renderOpportunitiesGrid = (categoryFilter: 'Job' | 'Internship' | 'Saved') => {
    const baseList = opportunities.filter((opp) => {
      if (categoryFilter === 'Saved') {
        return student.savedOpportunityIds.includes(opp.id);
      }
      return opp.category === categoryFilter;
    });

    const filtered = baseList.filter((opp) => {
      const matchesMode =
        workModeFilter === 'All' || opp.workMode === workModeFilter;
      const matchesSkill =
        skillFilter === 'All' || opp.requiredSkills.includes(skillFilter);
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        opp.title.toLowerCase().includes(q) ||
        opp.companyName.toLowerCase().includes(q) ||
        opp.location.toLowerCase().includes(q) ||
        opp.requiredSkills.some((s) => s.toLowerCase().includes(q));
      return matchesMode && matchesSkill && matchesQuery;
    });

    return (
      <div>
        {/* Search and Filters */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 mb-6 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by role title, company name, location, or skill..."
                className="w-full pl-10 pr-4 py-2 text-sm bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563FF]"
              />
            </div>

            <select
              value={workModeFilter}
              onChange={(e) => setWorkModeFilter(e.target.value)}
              className="px-3.5 py-2 text-xs font-medium bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg text-[#111827] focus:outline-none focus:border-[#2563FF]"
            >
              <option value="All">All Work Modes</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
              <option value="On-Site">On-Site</option>
            </select>

            <select
              value={skillFilter}
              onChange={(e) => setSkillFilter(e.target.value)}
              className="px-3.5 py-2 text-xs font-medium bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg text-[#111827] focus:outline-none focus:border-[#2563FF]"
            >
              <option value="All">All Required Skills</option>
              {SKILLS_METADATA.map((s) => (
                <option key={s.name} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center">
            <p className="text-base font-bold text-[#111827] mb-1">
              {categoryFilter === 'Saved'
                ? 'No saved opportunities yet'
                : 'No matching listings found'}
            </p>
            <p className="text-xs text-[#64748B] mb-4">
              {categoryFilter === 'Saved'
                ? 'Bookmark jobs or internships using the Save button on any listing card.'
                : 'Try adjusting your search keywords or skill filters.'}
            </p>
            {categoryFilter === 'Saved' ? (
              <button
                type="button"
                onClick={() => setActiveTab('jobs')}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-lg cursor-pointer"
              >
                Browse Jobs
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setWorkModeFilter('All');
                  setSkillFilter('All');
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-lg cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filtered.map((opp) => {
              const isSaved = student.savedOpportunityIds.includes(opp.id);
              const existingApp = studentApplications.find(
                (a) => a.opportunityId === opp.id
              );
              const matchedVerifiedCount = opp.requiredSkills.filter((req) =>
                verifiedSkillNames.includes(req as SkillName)
              ).length;

              return (
                <div
                  key={opp.id}
                  className="bg-white border border-[#E2E8F0] rounded-xl p-6 flex flex-col justify-between shadow-xs"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#0B1220] text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {opp.companyMonogram}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-[#111827]">
                            {opp.title}
                          </h3>
                          <p className="text-xs text-[#64748B]">
                            {opp.companyName} · {opp.location}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onToggleSaveOpportunity(opp.id)}
                        className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                          isSaved
                            ? 'border-[#2563FF] bg-[#2563FF]/10 text-[#2563FF]'
                            : 'border-[#E2E8F0] text-[#64748B] hover:text-[#111827]'
                        }`}
                        title={isSaved ? 'Unsave' : 'Save'}
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#64748B] mb-3">
                      <span className="font-semibold text-[#2563FF]">
                        {opp.category}
                      </span>
                      <span>·</span>
                      <span>{opp.workMode}</span>
                      <span>·</span>
                      <span className="font-mono-tabular font-semibold text-[#111827]">
                        {opp.compensation}
                      </span>
                      <span>·</span>
                      <span className="tabular-nums">Deadline: {opp.deadline}</span>
                    </div>

                    <p className="text-xs text-[#64748B] leading-relaxed mb-3">
                      {opp.description}
                    </p>

                    <div className="text-xs mb-3">
                      <span className="text-[#64748B]">Required Skills: </span>
                      <span className="font-medium text-[#111827]">
                        {opp.requiredSkills.join(' · ')}
                      </span>
                    </div>

                    <div className="text-xs text-[#10B981] font-medium mb-4">
                      You have verified {matchedVerifiedCount} of{' '}
                      {opp.requiredSkills.length} required skills
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 pt-3 border-t border-[#E2E8F0]">
                    <button
                      type="button"
                      onClick={() => setSelectedOpportunity(opp)}
                      className="flex-1 px-3 py-2 text-xs font-semibold text-[#111827] bg-[#F4F7FC] hover:bg-[#E2E8F0] rounded-lg transition-colors cursor-pointer"
                    >
                      View Details
                    </button>
                    {existingApp ? (
                      <button
                        type="button"
                        onClick={() => setActiveTab('applications')}
                        className="flex-1 px-3 py-2 text-xs font-semibold text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg cursor-pointer"
                      >
                        {existingApp.status} ✓
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setApplyingOpportunity(opp);
                          setCoverNote(
                            `Applying with ${verifiedSkillNames.length} Hire Sphere verified skills (${verifiedSkillNames.join(
                              ', '
                            )}) and CGPA ${student.cgpa}.`
                          );
                        }}
                        className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-lg transition-colors cursor-pointer"
                      >
                        Apply Now
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-[#F4F7FC] text-[#111827]">
      {/* Midnight Blue Sidebar (#0B1220) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#0B1220] text-white flex flex-col justify-between border-r border-white/10 transition-transform lg:translate-x-0 lg:static lg:shrink-0 ${
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <BrandLogo
              theme="dark"
              size="sm"
              onClick={() => onSwitchRole(null)}
            />
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-4 border-b border-white/10 bg-[#111C35]/60">
            <div className="text-xs font-semibold text-white truncate">
              {student.fullName}
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">
              {student.degree} · {student.branch}
            </div>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-[#10B981] font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{verifiedSkillNames.length} Verified Skills</span>
            </div>
          </div>

          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-220px)]">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#2563FF] text-white font-semibold shadow-xs'
                      : 'text-slate-300 hover:bg-[#111C35] hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span className="whitespace-nowrap">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => onSwitchRole(null)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-300 hover:bg-[#111C35] hover:text-white transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Exit to Home / Switch Role</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Workspace Bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-[#E2E8F0] px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-[#E2E8F0] text-[#111827]"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="text-sm font-semibold text-[#111827]">
              Student Portal{' '}
              <span className="text-[#64748B] font-normal">/</span>{' '}
              <span className="text-[#2563FF]">
                {navItems.find((n) => n.id === activeTab)?.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleOpenEditProfile}
              className="px-3.5 py-1.5 text-xs font-semibold text-[#111827] bg-[#F4F7FC] hover:bg-[#E2E8F0] border border-[#E2E8F0] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Edit Profile
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('assessments')}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Verify a Skill
            </button>
            <button
              type="button"
              onClick={() => onSwitchRole('company')}
              className="hidden sm:inline-flex px-3 py-1.5 text-xs font-medium text-[#111827] bg-[#F4F7FC] hover:bg-[#E2E8F0] border border-[#E2E8F0] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Switch to Company View
            </button>
          </div>
        </header>

        <main className="p-6 max-w-6xl w-full mx-auto space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <div className="bg-[#0B1220] text-white rounded-2xl p-6 sm:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#2563FF] mb-1">
                    Student Career Command Center
                  </p>
                  <h1 className="text-2xl font-bold text-white">
                    Welcome back, {student.fullName}
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-300 mt-1">
                    {student.college} · {student.degree} {student.branch} (Class
                    of {student.graduationYear}) · CGPA{' '}
                    <span className="font-mono-tabular font-semibold text-white">
                      {student.cgpa}
                    </span>
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={handleOpenEditProfile}
                    className="px-4 py-2.5 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-xl transition-colors cursor-pointer"
                  >
                    Edit Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('assessments')}
                    className="px-4 py-2.5 text-xs font-semibold text-white bg-[#111C35] hover:bg-slate-800 border border-white/15 rounded-xl transition-colors cursor-pointer"
                  >
                    Take Skill Assessment
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('resume')}
                    className="px-4 py-2.5 text-xs font-semibold text-white bg-[#111C35] hover:bg-slate-800 border border-white/15 rounded-xl transition-colors cursor-pointer"
                  >
                    View Resume Score
                  </button>
                </div>
              </div>

              {/* 4 Key KPI Statistic Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
                  <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
                    <span>Profile Completion</span>
                    <User className="w-4 h-4 text-[#2563FF]" />
                  </div>
                  <div className="text-2xl font-bold text-[#111827] tabular-nums">
                    {profileCompletion}%
                  </div>
                  <div className="w-full h-1.5 bg-[#F4F7FC] rounded-full overflow-hidden mt-3">
                    <div
                      className="h-full bg-[#2563FF] rounded-full"
                      style={{ width: `${profileCompletion}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
                  <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
                    <span>Resume Readiness (Demo)</span>
                    <FileText className="w-4 h-4 text-[#2563FF]" />
                  </div>
                  <div className="text-2xl font-bold text-[#111827] tabular-nums">
                    {resumeReadiness.totalScore} / 100
                  </div>
                  <div className="w-full h-1.5 bg-[#F4F7FC] rounded-full overflow-hidden mt-3">
                    <div
                      className="h-full bg-[#2563FF] rounded-full"
                      style={{ width: `${resumeReadiness.totalScore}%` }}
                    />
                  </div>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
                  <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
                    <span>Verified Skills (≥80%)</span>
                    <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                  </div>
                  <div className="text-2xl font-bold text-[#10B981] tabular-nums">
                    {verifiedSkillNames.length} / {SKILLS_METADATA.length}
                  </div>
                  <div className="text-xs text-[#64748B] mt-3 truncate">
                    {verifiedSkillNames.length > 0
                      ? verifiedSkillNames.join(' · ')
                      : 'No verified skills yet'}
                  </div>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
                  <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
                    <span>Learning Progress</span>
                    <BookOpen className="w-4 h-4 text-[#2563FF]" />
                  </div>
                  <div className="text-2xl font-bold text-[#111827] tabular-nums">
                    {learningProgressPct}%
                  </div>
                  <div className="w-full h-1.5 bg-[#F4F7FC] rounded-full overflow-hidden mt-3">
                    <div
                      className="h-full bg-[#10B981] rounded-full"
                      style={{ width: `${learningProgressPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Two-column Split: Recommended Opportunities & Available Assessments */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Recommended Jobs & Internships (7 Cols) */}
                <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-base font-bold text-[#111827]">
                        Recommended Jobs & Internships
                      </h2>
                      <p className="text-xs text-[#64748B]">
                        Matched against your technical skills and verified badges
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('jobs')}
                      className="text-xs font-semibold text-[#2563FF] hover:underline cursor-pointer"
                    >
                      View All →
                    </button>
                  </div>

                  <div className="divide-y divide-[#E2E8F0]">
                    {opportunities.slice(0, 4).map((opp) => (
                      <div
                        key={opp.id}
                        className="py-3.5 first:pt-0 last:pb-0 flex items-center justify-between gap-4"
                      >
                        <div>
                          <div className="text-sm font-bold text-[#111827]">
                            {opp.title}
                          </div>
                          <div className="text-xs text-[#64748B] mt-0.5">
                            {opp.companyName} · {opp.category} · {opp.location}{' '}
                            ·{' '}
                            <span className="font-mono-tabular text-[#111827] font-medium">
                              {opp.compensation}
                            </span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOpportunity(opp);
                          }}
                          className="px-3 py-1.5 text-xs font-semibold text-[#2563FF] bg-[#F4F7FC] hover:bg-[#2563FF] hover:text-white rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          Inspect
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Available Assessments & Recent Applications (5 Cols) */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-base font-bold text-[#111827]">
                        Available Skill Assessments
                      </h2>
                      <button
                        type="button"
                        onClick={() => setActiveTab('assessments')}
                        className="text-xs font-semibold text-[#2563FF] hover:underline cursor-pointer"
                      >
                        All 8 Skills →
                      </button>
                    </div>
                    <div className="space-y-3">
                      {SKILLS_METADATA.slice(0, 4).map((s) => {
                        const isVer = verifiedSkillNames.includes(s.name);
                        return (
                          <div
                            key={s.name}
                            className="flex items-center justify-between p-3 rounded-xl bg-[#F4F7FC] border border-[#E2E8F0]"
                          >
                            <div>
                              <div className="text-xs font-bold text-[#111827]">
                                {s.name}
                              </div>
                              <div className="text-[11px] text-[#64748B]">
                                {s.difficulty} · Pass ≥ 80%
                              </div>
                            </div>
                            {isVer ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#10B981]">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Verified</span>
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleStartQuiz(s.name)}
                                className="px-3 py-1.5 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-lg cursor-pointer"
                              >
                                Start Quiz
                              </button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Recent Applications */}
                  <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-base font-bold text-[#111827]">
                        Recent Applications
                      </h2>
                      <button
                        type="button"
                        onClick={() => setActiveTab('applications')}
                        className="text-xs font-semibold text-[#2563FF] hover:underline cursor-pointer"
                      >
                        Track Status →
                      </button>
                    </div>
                    {studentApplications.length === 0 ? (
                      <p className="text-xs text-[#64748B]">
                        You have not submitted any applications yet.
                      </p>
                    ) : (
                      <div className="space-y-2.5">
                        {studentApplications.slice(0, 3).map((app) => (
                          <div
                            key={app.id}
                            className="flex items-center justify-between text-xs py-2 border-b last:border-none border-[#E2E8F0]"
                          >
                            <div>
                              <div className="font-semibold text-[#111827]">
                                {app.opportunityTitle}
                              </div>
                              <div className="text-[#64748B]">
                                {app.companyName} · Applied {app.appliedAt}
                              </div>
                            </div>
                            <span
                              className={`font-semibold ${
                                app.status === 'Shortlisted'
                                  ? 'text-[#10B981]'
                                  : app.status === 'Rejected'
                                  ? 'text-red-600'
                                  : 'text-[#2563FF]'
                              }`}
                            >
                              {app.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MY PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Header Card with Edit Profile Toggle */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#2563FF]">
                    Student Profile & Academic Record
                  </span>
                  <h2 className="text-xl font-bold text-[#111827] mt-0.5">
                    {student.fullName}
                  </h2>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {student.email} · {student.degree} in {student.branch} ·{' '}
                    {student.college} ({student.university})
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {!isEditingProfile ? (
                    <button
                      type="button"
                      onClick={handleOpenEditProfile}
                      className="px-5 py-2.5 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-xl transition-colors cursor-pointer"
                    >
                      Edit Profile
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleCancelEditProfile}
                      className="px-4 py-2.5 text-xs font-semibold text-[#64748B] bg-[#F4F7FC] hover:bg-[#E2E8F0] border border-[#E2E8F0] rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              {!isEditingProfile ? (
                /* READ-ONLY PROFILE SUMMARY VIEW */
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
                      <div className="text-xs text-[#64748B]">
                        College & University
                      </div>
                      <div className="text-sm font-bold text-[#111827] mt-1">
                        {student.college}
                      </div>
                      <div className="text-xs text-[#64748B] mt-0.5">
                        {student.university}
                      </div>
                    </div>

                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
                      <div className="text-xs text-[#64748B]">
                        Degree, Branch & Batch
                      </div>
                      <div className="text-sm font-bold text-[#111827] mt-1">
                        {student.degree} · {student.branch}
                      </div>
                      <div className="text-xs text-[#64748B] mt-0.5 font-mono-tabular">
                        Graduation Year: {student.graduationYear} · CGPA:{' '}
                        <strong className="text-[#111827]">
                          {student.cgpa}
                        </strong>
                      </div>
                    </div>

                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
                      <div className="text-xs text-[#64748B]">
                        Portfolio Links & Resume
                      </div>
                      <div className="text-xs font-medium text-[#2563FF] truncate mt-1">
                        <a
                          href={student.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {student.githubUrl || 'No GitHub URL'}
                        </a>
                      </div>
                      <div className="text-xs font-medium text-[#2563FF] truncate mt-0.5">
                        <a
                          href={student.linkedinUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:underline"
                        >
                          {student.linkedinUrl || 'No LinkedIn URL'}
                        </a>
                      </div>
                      <div className="text-xs text-[#64748B] truncate mt-1">
                        Resume: {student.resume.fileName}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
                    <h3 className="text-sm font-bold text-[#111827] mb-2">
                      Technical Skills ({student.technicalSkills.length})
                    </h3>
                    <p className="text-xs text-[#111827] leading-relaxed">
                      {student.technicalSkills.join(' · ') ||
                        'No technical skills listed.'}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
                      <h3 className="text-sm font-bold text-[#111827] mb-3">
                        Projects ({student.projects.length})
                      </h3>
                      <div className="space-y-3">
                        {student.projects.map((p) => (
                          <div
                            key={p.id}
                            className="p-3 rounded-xl bg-[#F4F7FC] border border-[#E2E8F0]"
                          >
                            <div className="text-xs font-bold text-[#111827]">
                              {p.title}
                            </div>
                            <div className="text-[11px] text-[#2563FF] font-medium mt-0.5">
                              {p.techStack.join(' · ')}
                            </div>
                            <p className="text-xs text-[#64748B] mt-1">
                              {p.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
                      <h3 className="text-sm font-bold text-[#111827] mb-3">
                        Certifications ({student.certifications.length})
                      </h3>
                      <div className="space-y-3">
                        {student.certifications.map((c) => (
                          <div
                            key={c.id}
                            className="p-3 rounded-xl bg-[#F4F7FC] border border-[#E2E8F0]"
                          >
                            <div className="text-xs font-bold text-[#111827]">
                              {c.name}
                            </div>
                            <div className="text-[11px] text-[#64748B] mt-0.5">
                              {c.issuer} · {c.issueDate}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
                      <h3 className="text-sm font-bold text-[#111827] mb-3">
                        Experience ({student.experience.length})
                      </h3>
                      <div className="space-y-3">
                        {student.experience.length === 0 ? (
                          <p className="text-xs text-[#64748B]">
                            No experience records added yet.
                          </p>
                        ) : (
                          student.experience.map((exp) => (
                            <div
                              key={exp.id}
                              className="p-3 rounded-xl bg-[#F4F7FC] border border-[#E2E8F0]"
                            >
                              <div className="text-xs font-bold text-[#111827]">
                                {exp.role}
                              </div>
                              <div className="text-[11px] text-[#2563FF] font-medium mt-0.5">
                                {exp.organization} · {exp.duration}
                              </div>
                              <p className="text-xs text-[#64748B] mt-1">
                                {exp.summary}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* COMPLETE EDITABLE PROFILE FORM */
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {profileFormError && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{profileFormError}</span>
                    </div>
                  )}

                  <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-[#E2E8F0]">
                      <div>
                        <h3 className="text-base font-bold text-[#111827]">
                          Edit Personal, Academic & Resume Details
                        </h3>
                        <p className="text-xs text-[#64748B]">
                          All fields are pre-filled with your current profile
                          and persist in localStorage when saved.
                        </p>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          onClick={handleCancelEditProfile}
                          className="px-4 py-2 text-xs font-semibold text-[#64748B] bg-[#F4F7FC] hover:bg-[#E2E8F0] rounded-xl transition-colors cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-xl transition-colors cursor-pointer"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-[#111827] mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={profileForm.fullName}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              fullName: e.target.value,
                            })
                          }
                          className="w-full px-3.5 py-2 text-sm bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563FF]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#111827] mb-1">
                          Email Address
                        </label>
                        <input
                          type="email"
                          value={profileForm.email}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              email: e.target.value,
                            })
                          }
                          className="w-full px-3.5 py-2 text-sm bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563FF]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#111827] mb-1">
                          College Name
                        </label>
                        <input
                          type="text"
                          value={profileForm.college}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              college: e.target.value,
                            })
                          }
                          className="w-full px-3.5 py-2 text-sm bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563FF]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#111827] mb-1">
                          University Name
                        </label>
                        <input
                          type="text"
                          value={profileForm.university}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              university: e.target.value,
                            })
                          }
                          className="w-full px-3.5 py-2 text-sm bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563FF]"
                        />
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1">
                          <label className="block text-xs font-semibold text-[#111827] mb-1">
                            Degree
                          </label>
                          <input
                            type="text"
                            value={profileForm.degree}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                degree: e.target.value,
                              })
                            }
                            placeholder="B.Tech"
                            className="w-full px-3 py-2 text-sm bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563FF]"
                          />
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-semibold text-[#111827] mb-1">
                            Branch
                          </label>
                          <input
                            type="text"
                            value={profileForm.branch}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                branch: e.target.value,
                              })
                            }
                            placeholder="Computer Science & Engineering"
                            className="w-full px-3 py-2 text-sm bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563FF]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-[#111827] mb-1">
                            Graduation Year
                          </label>
                          <input
                            type="number"
                            value={profileForm.graduationYear}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                graduationYear: Number(e.target.value) || 2026,
                              })
                            }
                            className="w-full px-3 py-2 text-sm bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg font-mono-tabular focus:outline-none focus:border-[#2563FF]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-[#111827] mb-1">
                            CGPA (out of 10)
                          </label>
                          <input
                            type="number"
                            step="0.01"
                            min="0"
                            max="10"
                            value={profileForm.cgpa}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                cgpa: Number(e.target.value) || 0,
                              })
                            }
                            className="w-full px-3 py-2 text-sm bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg font-mono-tabular focus:outline-none focus:border-[#2563FF]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#111827] mb-1">
                          GitHub Profile URL
                        </label>
                        <input
                          type="url"
                          value={profileForm.githubUrl}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              githubUrl: e.target.value,
                            })
                          }
                          placeholder="https://github.com/username"
                          className="w-full px-3.5 py-2 text-sm bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563FF]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#111827] mb-1">
                          LinkedIn Profile URL
                        </label>
                        <input
                          type="url"
                          value={profileForm.linkedinUrl}
                          onChange={(e) =>
                            setProfileForm({
                              ...profileForm,
                              linkedinUrl: e.target.value,
                            })
                          }
                          placeholder="https://linkedin.com/in/username"
                          className="w-full px-3.5 py-2 text-sm bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563FF]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-[#111827] mb-1">
                          Resume Filename or Upload
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={profileForm.resume.fileName}
                            onChange={(e) =>
                              setProfileForm({
                                ...profileForm,
                                resume: {
                                  ...profileForm.resume,
                                  fileName: e.target.value,
                                },
                              })
                            }
                            placeholder="Firdoush_Bano_Resume.pdf"
                            className="flex-1 px-3 py-2 text-xs bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563FF]"
                          />
                          <label className="px-3 py-2 text-xs font-semibold text-white bg-[#0B1220] hover:bg-[#111C35] rounded-lg cursor-pointer inline-flex items-center gap-1.5 shrink-0">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload</span>
                            <input
                              type="file"
                              accept=".pdf,.doc,.docx,.txt"
                              onChange={handleResumeFileChange}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Technical Skills Manager */}
                    <div className="mt-6 pt-6 border-t border-[#E2E8F0]">
                      <label className="block text-xs font-semibold text-[#111827] mb-2">
                        Technical Skills ({profileForm.technicalSkills.length})
                      </label>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {profileForm.technicalSkills.map((skill) => (
                          <span
                            key={skill}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#F4F7FC] border border-[#E2E8F0] text-[#111827]"
                          >
                            <span>{skill}</span>
                            <button
                              type="button"
                              onClick={() =>
                                setProfileForm({
                                  ...profileForm,
                                  technicalSkills:
                                    profileForm.technicalSkills.filter(
                                      (s) => s !== skill
                                    ),
                                })
                              }
                              className="text-[#64748B] hover:text-red-600 cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <div className="flex gap-2 max-w-md">
                        <input
                          type="text"
                          value={newSkillInput}
                          onChange={(e) => setNewSkillInput(e.target.value)}
                          placeholder="Add technical skill (e.g. Python, DBMS, Docker)..."
                          className="flex-1 px-3.5 py-2 text-xs bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563FF]"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const val = newSkillInput.trim();
                            if (
                              val &&
                              !profileForm.technicalSkills.includes(val)
                            ) {
                              setProfileForm({
                                ...profileForm,
                                technicalSkills: [
                                  ...profileForm.technicalSkills,
                                  val,
                                ],
                              });
                              setNewSkillInput('');
                            }
                          }}
                          className="px-4 py-2 text-xs font-semibold text-white bg-[#0B1220] hover:bg-[#111C35] rounded-lg cursor-pointer"
                        >
                          Add Skill
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Editable Projects, Certifications & Experience */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* 1. Projects */}
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-4">
                      <h3 className="text-sm font-bold text-[#111827]">
                        Projects ({profileForm.projects.length})
                      </h3>
                      <div className="space-y-3">
                        {profileForm.projects.map((proj, idx) => (
                          <div
                            key={proj.id}
                            className="p-3 rounded-xl bg-[#F4F7FC] border border-[#E2E8F0] space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <input
                                type="text"
                                value={proj.title}
                                onChange={(e) => {
                                  const next = [...profileForm.projects];
                                  next[idx] = {
                                    ...proj,
                                    title: e.target.value,
                                  };
                                  setProfileForm({
                                    ...profileForm,
                                    projects: next,
                                  });
                                }}
                                placeholder="Project Title"
                                className="flex-1 px-2.5 py-1.5 text-xs font-bold bg-white border border-[#E2E8F0] rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setProfileForm({
                                    ...profileForm,
                                    projects: profileForm.projects.filter(
                                      (p) => p.id !== proj.id
                                    ),
                                  })
                                }
                                className="text-[#64748B] hover:text-red-600 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <input
                              type="text"
                              value={proj.techStack.join(', ')}
                              onChange={(e) => {
                                const next = [...profileForm.projects];
                                next[idx] = {
                                  ...proj,
                                  techStack: e.target.value
                                    .split(',')
                                    .map((s) => s.trim())
                                    .filter(Boolean),
                                };
                                setProfileForm({
                                  ...profileForm,
                                  projects: next,
                                });
                              }}
                              placeholder="Tech Stack (comma-separated)"
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-lg"
                            />
                            <textarea
                              rows={2}
                              value={proj.description}
                              onChange={(e) => {
                                const next = [...profileForm.projects];
                                next[idx] = {
                                  ...proj,
                                  description: e.target.value,
                                };
                                setProfileForm({
                                  ...profileForm,
                                  projects: next,
                                });
                              }}
                              placeholder="Project description"
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-lg"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2 pt-3 border-t border-[#E2E8F0]">
                        <input
                          type="text"
                          value={newProjectTitle}
                          onChange={(e) => setNewProjectTitle(e.target.value)}
                          placeholder="New Project Title"
                          className="w-full px-3 py-2 text-xs bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
                        />
                        <input
                          type="text"
                          value={newProjectTech}
                          onChange={(e) => setNewProjectTech(e.target.value)}
                          placeholder="Tech Stack (e.g. Java, SQL)"
                          className="w-full px-3 py-2 text-xs bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
                        />
                        <textarea
                          value={newProjectDesc}
                          onChange={(e) => setNewProjectDesc(e.target.value)}
                          placeholder="Project summary..."
                          rows={2}
                          className="w-full px-3 py-2 text-xs bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!newProjectTitle.trim()) return;
                            setProfileForm({
                              ...profileForm,
                              projects: [
                                ...profileForm.projects,
                                {
                                  id: `proj-${Date.now()}`,
                                  title: newProjectTitle.trim(),
                                  techStack: newProjectTech
                                    ? newProjectTech
                                        .split(',')
                                        .map((s) => s.trim())
                                        .filter(Boolean)
                                    : ['Engineering'],
                                  description:
                                    newProjectDesc.trim() ||
                                    'Academic engineering implementation.',
                                },
                              ],
                            });
                            setNewProjectTitle('');
                            setNewProjectTech('');
                            setNewProjectDesc('');
                          }}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-lg cursor-pointer"
                        >
                          + Add Project
                        </button>
                      </div>
                    </div>

                    {/* 2. Certifications */}
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-4">
                      <h3 className="text-sm font-bold text-[#111827]">
                        Certifications ({profileForm.certifications.length})
                      </h3>
                      <div className="space-y-3">
                        {profileForm.certifications.map((cert, idx) => (
                          <div
                            key={cert.id}
                            className="p-3 rounded-xl bg-[#F4F7FC] border border-[#E2E8F0] space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <input
                                type="text"
                                value={cert.name}
                                onChange={(e) => {
                                  const next = [...profileForm.certifications];
                                  next[idx] = { ...cert, name: e.target.value };
                                  setProfileForm({
                                    ...profileForm,
                                    certifications: next,
                                  });
                                }}
                                placeholder="Certification Name"
                                className="flex-1 px-2.5 py-1.5 text-xs font-bold bg-white border border-[#E2E8F0] rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setProfileForm({
                                    ...profileForm,
                                    certifications:
                                      profileForm.certifications.filter(
                                        (c) => c.id !== cert.id
                                      ),
                                  })
                                }
                                className="text-[#64748B] hover:text-red-600 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <input
                              type="text"
                              value={cert.issuer}
                              onChange={(e) => {
                                const next = [...profileForm.certifications];
                                next[idx] = { ...cert, issuer: e.target.value };
                                setProfileForm({
                                  ...profileForm,
                                  certifications: next,
                                });
                              }}
                              placeholder="Issuing Organization"
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-lg"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2 pt-3 border-t border-[#E2E8F0]">
                        <input
                          type="text"
                          value={newCertName}
                          onChange={(e) => setNewCertName(e.target.value)}
                          placeholder="New Certification Title"
                          className="w-full px-3 py-2 text-xs bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
                        />
                        <input
                          type="text"
                          value={newCertIssuer}
                          onChange={(e) => setNewCertIssuer(e.target.value)}
                          placeholder="Issuer (e.g. NPTEL, Oracle)"
                          className="w-full px-3 py-2 text-xs bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!newCertName.trim()) return;
                            setProfileForm({
                              ...profileForm,
                              certifications: [
                                ...profileForm.certifications,
                                {
                                  id: `cert-${Date.now()}`,
                                  name: newCertName.trim(),
                                  issuer:
                                    newCertIssuer.trim() || 'Verified Issuer',
                                  issueDate: '2026',
                                },
                              ],
                            });
                            setNewCertName('');
                            setNewCertIssuer('');
                          }}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-lg cursor-pointer"
                        >
                          + Add Certification
                        </button>
                      </div>
                    </div>

                    {/* 3. Experience */}
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-4">
                      <h3 className="text-sm font-bold text-[#111827]">
                        Experience ({profileForm.experience.length})
                      </h3>
                      <div className="space-y-3">
                        {profileForm.experience.map((exp, idx) => (
                          <div
                            key={exp.id}
                            className="p-3 rounded-xl bg-[#F4F7FC] border border-[#E2E8F0] space-y-2"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <input
                                type="text"
                                value={exp.role}
                                onChange={(e) => {
                                  const next = [...profileForm.experience];
                                  next[idx] = { ...exp, role: e.target.value };
                                  setProfileForm({
                                    ...profileForm,
                                    experience: next,
                                  });
                                }}
                                placeholder="Role Title"
                                className="flex-1 px-2.5 py-1.5 text-xs font-bold bg-white border border-[#E2E8F0] rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() =>
                                  setProfileForm({
                                    ...profileForm,
                                    experience: profileForm.experience.filter(
                                      (x) => x.id !== exp.id
                                    ),
                                  })
                                }
                                className="text-[#64748B] hover:text-red-600 cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <input
                              type="text"
                              value={exp.organization}
                              onChange={(e) => {
                                const next = [...profileForm.experience];
                                next[idx] = {
                                  ...exp,
                                  organization: e.target.value,
                                };
                                setProfileForm({
                                  ...profileForm,
                                  experience: next,
                                });
                              }}
                              placeholder="Company / Organization"
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-lg"
                            />
                            <input
                              type="text"
                              value={exp.duration}
                              onChange={(e) => {
                                const next = [...profileForm.experience];
                                next[idx] = {
                                  ...exp,
                                  duration: e.target.value,
                                };
                                setProfileForm({
                                  ...profileForm,
                                  experience: next,
                                });
                              }}
                              placeholder="Duration (e.g. May 2025 – Jul 2025)"
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-lg"
                            />
                            <textarea
                              rows={2}
                              value={exp.summary}
                              onChange={(e) => {
                                const next = [...profileForm.experience];
                                next[idx] = {
                                  ...exp,
                                  summary: e.target.value,
                                };
                                setProfileForm({
                                  ...profileForm,
                                  experience: next,
                                });
                              }}
                              placeholder="Experience summary"
                              className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-lg"
                            />
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2 pt-3 border-t border-[#E2E8F0]">
                        <input
                          type="text"
                          value={newExpRole}
                          onChange={(e) => setNewExpRole(e.target.value)}
                          placeholder="New Role / Internship Title"
                          className="w-full px-3 py-2 text-xs bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
                        />
                        <input
                          type="text"
                          value={newExpOrg}
                          onChange={(e) => setNewExpOrg(e.target.value)}
                          placeholder="Company / Organization"
                          className="w-full px-3 py-2 text-xs bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
                        />
                        <input
                          type="text"
                          value={newExpDuration}
                          onChange={(e) => setNewExpDuration(e.target.value)}
                          placeholder="Duration (e.g. May 2025 – Jul 2025)"
                          className="w-full px-3 py-2 text-xs bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
                        />
                        <textarea
                          rows={2}
                          value={newExpSummary}
                          onChange={(e) => setNewExpSummary(e.target.value)}
                          placeholder="Responsibilities and impact..."
                          className="w-full px-3 py-2 text-xs bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            if (!newExpRole.trim()) return;
                            setProfileForm({
                              ...profileForm,
                              experience: [
                                ...profileForm.experience,
                                {
                                  id: `exp-${Date.now()}`,
                                  role: newExpRole.trim(),
                                  organization:
                                    newExpOrg.trim() || 'Organization',
                                  duration:
                                    newExpDuration.trim() || '2025 – 2026',
                                  summary:
                                    newExpSummary.trim() ||
                                    'Engineering internship experience.',
                                },
                              ],
                            });
                            setNewExpRole('');
                            setNewExpOrg('');
                            setNewExpDuration('');
                            setNewExpSummary('');
                          }}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-lg cursor-pointer"
                        >
                          + Add Experience
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Form Action Bar */}
                  <div className="bg-white border border-[#E2E8F0] rounded-xl p-4 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={handleCancelEditProfile}
                      className="px-5 py-2.5 text-xs font-semibold text-[#64748B] bg-[#F4F7FC] hover:bg-[#E2E8F0] rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-xl transition-colors cursor-pointer shadow-xs"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* TAB 3: MY RESUME & READINESS ANALYZER */}
          {activeTab === 'resume' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left 5 Cols: Upload & Readiness Breakdown */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-base font-bold text-[#111827]">
                        Resume Readiness Score
                      </h2>
                      <span className="text-xs font-semibold text-[#2563FF]">
                        Rule-Based Demo Estimate
                      </span>
                    </div>
                    <p className="text-xs text-[#64748B] mb-5">
                      Simulated readiness evaluation computed from your uploaded
                      resume metadata, projects, and verified skill credentials.
                    </p>

                    <div className="p-4 rounded-xl bg-[#0B1220] text-white flex items-center justify-between mb-5">
                      <div>
                        <div className="text-xs text-slate-400">
                          Overall Readiness Estimate
                        </div>
                        <div className="text-3xl font-bold tabular-nums mt-0.5">
                          {resumeReadiness.totalScore} / 100
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-[#10B981] font-semibold">
                          {resumeReadiness.verifiedSkillCount} Verified Skills
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          Target: {student.resume.targetRole}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3.5 mb-6">
                      {resumeReadiness.breakdown.map((item) => (
                        <div key={item.label}>
                          <div className="flex justify-between text-xs font-medium mb-1">
                            <span className="text-[#111827]">{item.label}</span>
                            <span className="font-mono-tabular text-[#2563FF]">
                              {item.score} / {item.maxScore}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-[#F4F7FC] rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#2563FF] rounded-full"
                              style={{
                                width: `${Math.round(
                                  (item.score / item.maxScore) * 100
                                )}%`,
                              }}
                            />
                          </div>
                          <p className="text-[11px] text-[#64748B] mt-0.5">
                            {item.detail}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Identified & Missing Skills */}
                    <div className="space-y-3 pt-4 border-t border-[#E2E8F0]">
                      <div>
                        <div className="text-xs font-semibold text-[#111827] mb-1">
                          Identified Resume Skills:
                        </div>
                        <p className="text-xs text-[#64748B]">
                          {resumeReadiness.identifiedSkills.join(' · ') ||
                            'None listed'}
                        </p>
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[#111827] mb-1">
                          Recommended Unverified Skills to Add:
                        </div>
                        <p className="text-xs text-amber-600 font-medium">
                          {resumeReadiness.missingRecommendedSkills.join(' · ') ||
                            'All core skills verified!'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setActiveTab('assessments')}
                      className="w-full mt-5 px-4 py-2.5 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-xl transition-colors cursor-pointer"
                    >
                      Improve Skills & Verify Credentials →
                    </button>
                  </div>

                  {/* Upload / Replace Resume Card */}
                  <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
                    <h3 className="text-sm font-bold text-[#111827] mb-1">
                      Upload or Replace Resume
                    </h3>
                    <p className="text-xs text-[#64748B] mb-4">
                      Supported formats: PDF, DOCX, TXT (Max 5 MB)
                    </p>

                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-[#E2E8F0] hover:border-[#2563FF] rounded-xl p-6 text-center cursor-pointer transition-colors bg-[#F4F7FC]/60">
                      <Upload className="w-6 h-6 text-[#2563FF] mb-2" />
                      <span className="text-xs font-semibold text-[#111827]">
                        Click to select a resume file
                      </span>
                      <span className="text-[11px] text-[#64748B] mt-1">
                        Current: {student.resume.fileName} (
                        {student.resume.fileSizeKb} KB)
                      </span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleResumeFileChange}
                        className="hidden"
                      />
                    </label>

                    {uploadError && (
                      <div className="mt-3 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{uploadError}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right 7 Cols: Live Formatted Engineering Resume Preview */}
                <div className="lg:col-span-7 bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8">
                  <div className="flex items-center justify-between pb-4 mb-6 border-b border-[#E2E8F0]">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#2563FF]">
                        Interactive Resume Preview
                      </span>
                      <h3 className="text-sm font-bold text-[#111827] mt-0.5">
                        {student.resume.fileName}
                      </h3>
                    </div>
                    <span className="text-xs text-[#64748B] tabular-nums">
                      Updated {student.resume.uploadedAt}
                    </span>
                  </div>

                  {/* Structured Resume Document Sheet */}
                  <div className="border border-[#E2E8F0] rounded-xl p-6 bg-[#F4F7FC]/40 space-y-5">
                    <div className="border-b border-[#E2E8F0] pb-4">
                      <h4 className="text-xl font-bold text-[#111827]">
                        {student.fullName}
                      </h4>
                      <p className="text-xs text-[#64748B] mt-1">
                        {student.email} · {student.location}
                        {student.githubUrl ? ` · ${student.githubUrl}` : ''}
                        {student.linkedinUrl ? ` · ${student.linkedinUrl}` : ''}
                      </p>
                    </div>

                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-[#0B1220] mb-1.5">
                        Education
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-[#111827]">
                          {student.college} ({student.university})
                        </span>
                        <span className="font-mono-tabular text-[#64748B]">
                          Graduating {student.graduationYear}
                        </span>
                      </div>
                      <div className="text-xs text-[#64748B] mt-0.5">
                        {student.degree} in {student.branch} · CGPA:{' '}
                        <span className="font-mono-tabular font-semibold text-[#111827]">
                          {student.cgpa} / 10.0
                        </span>
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-[#0B1220] mb-1.5">
                        Hire Sphere Verified Skill Credentials (≥80% Assessment
                        Standard)
                      </div>
                      {verifiedRecords.length === 0 ? (
                        <p className="text-xs text-[#64748B]">
                          No verified skills yet. Pass a Skill Assessment with
                          ≥80% to embed verified credentials on your resume.
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {verifiedRecords.map((rec) => (
                            <div
                              key={rec.id}
                              className="p-2.5 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-between text-xs"
                            >
                              <div className="flex items-center gap-2">
                                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
                                <span className="font-semibold text-[#111827]">
                                  {rec.skill}
                                </span>
                              </div>
                              <span className="font-mono-tabular text-[#10B981] font-semibold">
                                {rec.scorePercentage}%
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-[#0B1220] mb-1.5">
                        Technical Skills
                      </div>
                      <p className="text-xs text-[#111827] leading-relaxed">
                        {student.technicalSkills.join(' · ') ||
                          'No technical skills listed.'}
                      </p>
                    </div>

                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-[#0B1220] mb-2">
                        Key Engineering Projects
                      </div>
                      <div className="space-y-3">
                        {student.projects.map((p) => (
                          <div key={p.id}>
                            <div className="text-xs font-bold text-[#111827]">
                              {p.title}{' '}
                              <span className="font-normal text-[#2563FF]">
                                ({p.techStack.join(', ')})
                              </span>
                            </div>
                            <p className="text-xs text-[#64748B] mt-0.5">
                              {p.description}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {student.experience.length > 0 && (
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-[#0B1220] mb-2">
                          Experience & Internships
                        </div>
                        <div className="space-y-2.5">
                          {student.experience.map((exp) => (
                            <div key={exp.id}>
                              <div className="text-xs font-bold text-[#111827]">
                                {exp.role} ·{' '}
                                <span className="text-[#2563FF] font-medium">
                                  {exp.organization}
                                </span>{' '}
                                <span className="font-normal text-[#64748B]">
                                  ({exp.duration})
                                </span>
                              </div>
                              <p className="text-xs text-[#64748B] mt-0.5">
                                {exp.summary}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {student.certifications.length > 0 && (
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-[#0B1220] mb-2">
                          Certifications
                        </div>
                        <div className="space-y-1.5">
                          {student.certifications.map((cert) => (
                            <div key={cert.id} className="text-xs text-[#111827]">
                              <span className="font-semibold">{cert.name}</span>{' '}
                              <span className="text-[#64748B]">
                                — {cert.issuer} ({cert.issueDate})
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FIND JOBS */}
          {activeTab === 'jobs' && (
            <div>
              <div className="mb-5">
                <h2 className="text-xl font-bold text-[#111827]">
                  Engineering Job Opportunities
                </h2>
                <p className="text-xs text-[#64748B]">
                  Fictional sample graduate roles — search by role, company, or
                  required skill
                </p>
              </div>
              {renderOpportunitiesGrid('Job')}
            </div>
          )}

          {/* TAB 5: INTERNSHIPS */}
          {activeTab === 'internships' && (
            <div>
              <div className="mb-5">
                <h2 className="text-xl font-bold text-[#111827]">
                  Engineering Internships
                </h2>
                <p className="text-xs text-[#64748B]">
                  Stipend-backed internships for pre-final and final-year
                  engineering students
                </p>
              </div>
              {renderOpportunitiesGrid('Internship')}
            </div>
          )}

          {/* TAB 6: SKILL ASSESSMENT AND VERIFICATION */}
          {activeTab === 'assessments' && (
            <div className="space-y-6">
              {!quizStarted || !activeQuizSkill ? (
                <>
                  <div className="bg-[#0B1220] text-white rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-[#2563FF] mb-1">
                        80% Verification Standard
                      </p>
                      <h2 className="text-xl font-bold">
                        Technical Skill Assessment Center
                      </h2>
                      <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                        Select any of the 8 engineering skills below. Score 80%
                        or above to earn a Verified Green badge and credential
                        ID. Score below 80% to review detailed explanations and
                        retake anytime.
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-2xl font-bold text-[#10B981] tabular-nums">
                        {verifiedSkillNames.length} / {SKILLS_METADATA.length}
                      </div>
                      <div className="text-xs text-slate-400">
                        Skills Verified
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {SKILLS_METADATA.map((skill: SkillMetadata) => {
                      const latestAttempt = [...studentVerifications]
                        .reverse()
                        .find((v) => v.skill === skill.name);
                      const isVerified = verifiedSkillNames.includes(
                        skill.name
                      );
                      const skillResources = resources.filter(
                        (r) => r.skill === skill.name
                      );
                      const questionCount = questions.filter(
                        (q) => q.skill === skill.name
                      ).length;

                      return (
                        <div
                          key={skill.name}
                          className="bg-white border border-[#E2E8F0] rounded-xl p-6 flex flex-col justify-between shadow-xs"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div>
                                <span className="text-xs font-mono-tabular text-[#64748B]">
                                  {skill.shortCode} · {skill.difficulty} ·{' '}
                                  {questionCount} Questions
                                </span>
                                <h3 className="text-lg font-bold text-[#111827] mt-0.5">
                                  {skill.name}
                                </h3>
                              </div>

                              {isVerified ? (
                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#10B981]/10 text-[#10B981] text-xs font-semibold">
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Verified</span>
                                </span>
                              ) : latestAttempt ? (
                                <span className="text-xs font-semibold text-amber-600">
                                  Last Score: {latestAttempt.scorePercentage}%
                                  (Not Verified)
                                </span>
                              ) : (
                                <span className="text-xs text-[#64748B]">
                                  Not Attempted
                                </span>
                              )}
                            </div>

                            <p className="text-xs text-[#64748B] leading-relaxed mb-4">
                              {skill.description}
                            </p>

                            <div className="text-xs text-[#111827] mb-4">
                              <span className="text-[#64748B]">
                                Key Topics:{' '}
                              </span>
                              <span>{skill.keyTopics.join(' · ')}</span>
                            </div>

                            {/* Recommended Study Links for this Skill */}
                            <div className="p-3 rounded-xl bg-[#F4F7FC] border border-[#E2E8F0] mb-5">
                              <div className="text-[11px] font-semibold text-[#111827] mb-1.5">
                                Preparation Resources ({skillResources.length}):
                              </div>
                              <div className="space-y-1">
                                {skillResources.map((res) => (
                                  <a
                                    key={res.id}
                                    href={res.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center justify-between text-xs text-[#2563FF] hover:underline"
                                  >
                                    <span className="truncate">
                                      {res.title} ({res.provider})
                                    </span>
                                    <ExternalLink className="w-3 h-3 shrink-0 ml-2" />
                                  </a>
                                ))}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
                            <span className="text-xs text-[#64748B] tabular-nums">
                              Passing Score: ≥80%
                            </span>
                            <button
                              type="button"
                              onClick={() => handleStartQuiz(skill.name)}
                              className="px-4 py-2 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-lg transition-colors cursor-pointer"
                            >
                              {isVerified
                                ? 'Retake Assessment'
                                : 'Start Assessment'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              ) : quizSubmittedRecord ? (
                /* ASSESSMENT RESULTS & EXPLANATIONS SCREEN */
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#2563FF]">
                        Assessment Result · {quizSubmittedRecord.skill}
                      </span>
                      <h2 className="text-2xl font-bold text-[#111827] mt-1">
                        {quizSubmittedRecord.verified
                          ? 'Congratulations! Skill Verified (≥80%)'
                          : 'Score Below 80% — Not Verified Yet'}
                      </h2>
                      <p className="text-xs text-[#64748B] mt-1">
                        You answered {quizSubmittedRecord.correctCount} out of{' '}
                        {quizSubmittedRecord.totalQuestions} questions
                        correctly.
                        {quizSubmittedRecord.credentialId
                          ? ` Credential ID: ${quizSubmittedRecord.credentialId}`
                          : ' Review the explanations below and retake the assessment anytime.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div
                        className={`px-5 py-3 rounded-xl border text-center ${
                          quizSubmittedRecord.verified
                            ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
                            : 'bg-amber-50 border-amber-200 text-amber-700'
                        }`}
                      >
                        <div className="text-2xl font-bold font-mono-tabular">
                          {quizSubmittedRecord.scorePercentage}%
                        </div>
                        <div className="text-[11px] font-semibold">
                          {quizSubmittedRecord.verified
                            ? 'VERIFIED BADGE ISSUED'
                            : 'PASS MARK: 80%'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Question-by-Question Review & Technical Explanations */}
                  <div className="space-y-4">
                    <h3 className="text-base font-bold text-[#111827]">
                      Detailed Answer Key & Explanations
                    </h3>
                    {activeSkillQuestions.map((q, idx) => {
                      const chosenIdx = selectedAnswers[q.id];
                      const isCorrect = chosenIdx === q.correctOptionIndex;

                      return (
                        <div
                          key={q.id}
                          className="p-5 rounded-xl bg-[#F4F7FC] border border-[#E2E8F0] space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="text-sm font-bold text-[#111827]">
                              {idx + 1}. {q.question}
                            </div>
                            <span
                              className={`text-xs font-semibold shrink-0 ${
                                isCorrect ? 'text-[#10B981]' : 'text-red-600'
                              }`}
                            >
                              {isCorrect ? 'Correct (+20%)' : 'Incorrect'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {q.options.map((opt, optIdx) => {
                              const isTargetCorrect =
                                optIdx === q.correctOptionIndex;
                              const isUserPick = optIdx === chosenIdx;
                              return (
                                <div
                                  key={opt}
                                  className={`p-2.5 rounded-lg border ${
                                    isTargetCorrect
                                      ? 'bg-[#10B981]/10 border-[#10B981] text-[#111827] font-semibold'
                                      : isUserPick
                                      ? 'bg-red-50 border-red-300 text-red-800'
                                      : 'bg-white border-[#E2E8F0] text-[#64748B]'
                                  }`}
                                >
                                  <span>{opt}</span>
                                  {isTargetCorrect && (
                                    <span className="ml-2 text-[#10B981]">
                                      ✓ Correct Answer
                                    </span>
                                  )}
                                  {!isTargetCorrect && isUserPick && (
                                    <span className="ml-2 text-red-600">
                                      ✗ Your Choice
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>

                          <div className="text-xs text-[#64748B] bg-white p-3 rounded-lg border border-[#E2E8F0]">
                            <span className="font-semibold text-[#111827]">
                              Explanation:{' '}
                            </span>
                            {q.explanation}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[#E2E8F0]">
                    <button
                      type="button"
                      onClick={() => {
                        setQuizStarted(false);
                        setActiveQuizSkill(null);
                        setQuizSubmittedRecord(null);
                      }}
                      className="px-4 py-2.5 text-xs font-semibold text-[#111827] bg-[#F4F7FC] hover:bg-[#E2E8F0] rounded-xl cursor-pointer"
                    >
                      ← Back to All Assessments
                    </button>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleStartQuiz(activeQuizSkill)}
                        className="px-4 py-2.5 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Retake Assessment</span>
                      </button>
                      {quizSubmittedRecord.verified && (
                        <button
                          type="button"
                          onClick={() => setActiveTab('verified')}
                          className="px-4 py-2.5 text-xs font-semibold text-white bg-[#10B981] hover:bg-emerald-600 rounded-xl cursor-pointer"
                        >
                          View Verified Badges →
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* ACTIVE MULTIPLE-CHOICE ASSESSMENT INTERFACE */
                <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
                    <div>
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#2563FF]">
                        Active Assessment · Pass Threshold: 80%
                      </span>
                      <h2 className="text-xl font-bold text-[#111827] mt-0.5">
                        {activeQuizSkill} Verification Quiz
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setQuizStarted(false);
                        setActiveQuizSkill(null);
                      }}
                      className="text-xs font-semibold text-[#64748B] hover:text-[#111827] px-3 py-1.5 rounded-lg border border-[#E2E8F0] cursor-pointer self-start"
                    >
                      Cancel Quiz
                    </button>
                  </div>

                  {/* Progress Indicator */}
                  <div>
                    <div className="flex justify-between text-xs text-[#64748B] mb-1.5 tabular-nums">
                      <span>
                        Question {currentQuestionIdx + 1} of{' '}
                        {activeSkillQuestions.length}
                      </span>
                      <span>
                        Answered: {Object.keys(selectedAnswers).length} /{' '}
                        {activeSkillQuestions.length}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-[#F4F7FC] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[#2563FF] transition-all rounded-full"
                        style={{
                          width: `${Math.round(
                            ((currentQuestionIdx + 1) /
                              Math.max(1, activeSkillQuestions.length)) *
                              100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>

                  {activeSkillQuestions[currentQuestionIdx] && (
                    <div className="space-y-4 py-2">
                      <h3 className="text-base sm:text-lg font-bold text-[#111827] leading-snug">
                        {currentQuestionIdx + 1}.{' '}
                        {activeSkillQuestions[currentQuestionIdx].question}
                      </h3>

                      <div className="space-y-2.5">
                        {activeSkillQuestions[currentQuestionIdx].options.map(
                          (optionText, optIndex) => {
                            const qId =
                              activeSkillQuestions[currentQuestionIdx].id;
                            const isSelected =
                              selectedAnswers[qId] === optIndex;
                            return (
                              <button
                                key={optionText}
                                type="button"
                                onClick={() =>
                                  setSelectedAnswers({
                                    ...selectedAnswers,
                                    [qId]: optIndex,
                                  })
                                }
                                className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-center justify-between gap-3 cursor-pointer ${
                                  isSelected
                                    ? 'bg-[#2563FF]/10 border-[#2563FF] text-[#111827] font-semibold'
                                    : 'bg-[#F4F7FC]/60 border-[#E2E8F0] text-[#111827] hover:border-[#2563FF]/50'
                                }`}
                              >
                                <span>{optionText}</span>
                                <span
                                  className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs shrink-0 ${
                                    isSelected
                                      ? 'border-[#2563FF] bg-[#2563FF] text-white'
                                      : 'border-[#64748B]'
                                  }`}
                                >
                                  {isSelected ? '✓' : ''}
                                </span>
                              </button>
                            );
                          }
                        )}
                      </div>
                    </div>
                  )}

                  {/* Quiz Navigation Controls */}
                  <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
                    <button
                      type="button"
                      disabled={currentQuestionIdx === 0}
                      onClick={() =>
                        setCurrentQuestionIdx((i) => Math.max(0, i - 1))
                      }
                      className="px-4 py-2 text-xs font-semibold text-[#111827] bg-[#F4F7FC] hover:bg-[#E2E8F0] disabled:opacity-40 rounded-lg cursor-pointer"
                    >
                      ← Previous
                    </button>

                    <div className="flex items-center gap-2">
                      {currentQuestionIdx < activeSkillQuestions.length - 1 ? (
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentQuestionIdx((i) =>
                              Math.min(activeSkillQuestions.length - 1, i + 1)
                            )
                          }
                          className="px-5 py-2 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-lg cursor-pointer"
                        >
                          Next Question →
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleFinishQuiz}
                          className="px-6 py-2.5 text-xs font-semibold text-white bg-[#10B981] hover:bg-emerald-600 rounded-lg cursor-pointer shadow-xs"
                        >
                          Submit Assessment & Calculate Score
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 7: VERIFIED SKILLS */}
          {activeTab === 'verified' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 mb-6 border-b border-[#E2E8F0]">
                  <div>
                    <h2 className="text-lg font-bold text-[#111827]">
                      Verified Skill Credentials
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      Earned by scoring 80% or higher on Hire Sphere technical
                      assessments. Automatically visible to recruiters.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('assessments')}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-xl cursor-pointer self-start"
                  >
                    + Verify Another Skill
                  </button>
                </div>

                {verifiedRecords.length === 0 ? (
                  <div className="text-center py-10">
                    <ShieldCheck className="w-10 h-10 text-[#64748B] mx-auto mb-2" />
                    <p className="text-sm font-bold text-[#111827]">
                      No Verified Skills Yet
                    </p>
                    <p className="text-xs text-[#64748B] mt-1 mb-4">
                      Complete a skill assessment with a score of 80% or above
                      to unlock your first green verified badge.
                    </p>
                    <button
                      type="button"
                      onClick={() => setActiveTab('assessments')}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#2563FF] rounded-lg cursor-pointer"
                    >
                      Take Assessment
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {verifiedRecords.map((rec) => (
                      <div
                        key={rec.id}
                        className="p-5 rounded-xl bg-[#F4F7FC] border border-[#10B981]/40 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#10B981]">
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Verified Badge</span>
                            </span>
                            <span className="font-mono-tabular text-sm font-bold text-[#111827]">
                              {rec.scorePercentage}%
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-[#111827]">
                            {rec.skill}
                          </h3>
                          <p className="text-xs text-[#64748B] mt-1 font-mono-tabular">
                            ID: {rec.credentialId || 'HS-VER-2026'}
                          </p>
                        </div>
                        <div className="pt-3 mt-4 border-t border-[#E2E8F0] flex items-center justify-between text-[11px] text-[#64748B]">
                          <span>Issued {rec.attemptedAt}</span>
                          <span>
                            {rec.correctCount}/{rec.totalQuestions} Correct
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 8: LEARNING RESOURCES */}
          {activeTab === 'resources' && (
            <div className="space-y-6">
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className="text-lg font-bold text-[#111827]">
                      Engineering Learning Resource Library
                    </h2>
                    <p className="text-xs text-[#64748B]">
                      Curated documentation and coding tracks from GeeksforGeeks,
                      HackerRank, LeetCode, MDN Web Docs, and Official
                      Java/Python Docs.
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-lg font-bold text-[#2563FF] tabular-nums">
                      {completedCount} / {resources.length} Completed
                    </div>
                    <div className="text-xs text-[#64748B]">
                      {learningProgressPct}% Track Progress
                    </div>
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-3 mb-6">
                  <select
                    value={resourceSkillFilter}
                    onChange={(e) => setResourceSkillFilter(e.target.value)}
                    className="px-3.5 py-2 text-xs font-medium bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
                  >
                    <option value="All">All Technical Skills</option>
                    {SKILLS_METADATA.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={resourceDifficultyFilter}
                    onChange={(e) =>
                      setResourceDifficultyFilter(e.target.value)
                    }
                    className="px-3.5 py-2 text-xs font-medium bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
                  >
                    <option value="All">All Difficulty Levels</option>
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {resources
                    .filter(
                      (r) =>
                        (resourceSkillFilter === 'All' ||
                          r.skill === resourceSkillFilter) &&
                        (resourceDifficultyFilter === 'All' ||
                          r.difficulty === resourceDifficultyFilter)
                    )
                    .map((res) => {
                      const isDone = student.completedResourceIds.includes(
                        res.id
                      );
                      return (
                        <div
                          key={res.id}
                          className="p-5 rounded-xl bg-[#F4F7FC] border border-[#E2E8F0] flex flex-col justify-between"
                        >
                          <div>
                            <div className="flex items-center justify-between text-xs text-[#64748B] mb-2">
                              <span className="font-semibold text-[#2563FF]">
                                {res.skill} · {res.provider}
                              </span>
                              <span>
                                {res.difficulty} · {res.estimatedMinutes} mins
                              </span>
                            </div>
                            <h3 className="text-sm font-bold text-[#111827] mb-1.5">
                              {res.title}
                            </h3>
                            <p className="text-xs text-[#64748B] leading-relaxed mb-4">
                              {res.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#E2E8F0]">
                            <a
                              href={res.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3.5 py-1.5 text-xs font-semibold text-[#111827] bg-white hover:bg-[#E2E8F0] border border-[#E2E8F0] rounded-lg inline-flex items-center gap-1.5 transition-colors"
                            >
                              <span>Open Resource</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>

                            <button
                              type="button"
                              onClick={() =>
                                handleToggleResourceComplete(res.id)
                              }
                              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                                isDone
                                  ? 'bg-[#10B981] text-white'
                                  : 'bg-[#2563FF] text-white hover:bg-[#1D4ED8]'
                              }`}
                            >
                              {isDone
                                ? 'Completed ✓'
                                : 'Mark as Completed'}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 9: SAVED JOBS */}
          {activeTab === 'saved' && (
            <div>
              <div className="mb-5">
                <h2 className="text-xl font-bold text-[#111827]">
                  Saved Jobs & Internships ({student.savedOpportunityIds.length}
                  )
                </h2>
                <p className="text-xs text-[#64748B]">
                  Opportunities you bookmarked for quick comparison and
                  application
                </p>
              </div>
              {renderOpportunitiesGrid('Saved')}
            </div>
          )}

          {/* TAB 10: MY APPLICATIONS */}
          {activeTab === 'applications' && (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-[#111827]">
                    My Submitted Applications ({studentApplications.length})
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Real-time application status tracking (updates when a
                    company shortlists your profile)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('jobs')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#2563FF] rounded-lg cursor-pointer"
                >
                  Browse More Roles
                </button>
              </div>

              {studentApplications.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-sm font-bold text-[#111827]">
                    No Applications Submitted Yet
                  </p>
                  <p className="text-xs text-[#64748B] mt-1">
                    Apply to any Job or Internship to track its recruitment
                    stage here.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E2E8F0] text-[11px] font-semibold uppercase text-[#64748B]">
                        <th className="py-3 pr-4">Role & Category</th>
                        <th className="py-3 px-4">Company</th>
                        <th className="py-3 px-4">Attached Verified Skills</th>
                        <th className="py-3 px-4">Applied Date</th>
                        <th className="py-3 pl-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] text-xs">
                      {studentApplications.map((app) => (
                        <tr key={app.id} className="hover:bg-[#F4F7FC]/60">
                          <td className="py-3.5 pr-4 font-bold text-[#111827]">
                            {app.opportunityTitle}{' '}
                            <span className="font-normal text-[#64748B]">
                              · {app.opportunityCategory}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-[#64748B]">
                            {app.companyName}
                          </td>
                          <td className="py-3.5 px-4 text-[#111827]">
                            {app.verifiedSkillsSnapshot.length > 0
                              ? app.verifiedSkillsSnapshot
                                  .map((s) => `${s.skill} (${s.score}%)`)
                                  .join(' · ')
                              : 'None attached'}
                          </td>
                          <td className="py-3.5 px-4 font-mono-tabular text-[#64748B]">
                            {app.appliedAt}
                          </td>
                          <td className="py-3.5 pl-4 text-right">
                            <span
                              className={`font-semibold ${
                                app.status === 'Shortlisted'
                                  ? 'text-[#10B981]'
                                  : app.status === 'Rejected'
                                  ? 'text-red-600'
                                  : 'text-[#2563FF]'
                              }`}
                            >
                              {app.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 11: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[#111827]">
                  Student Portal Settings & Demo State
                </h2>
                <p className="text-xs text-[#64748B]">
                  All changes to your profile, verified badges, and job
                  applications are stored locally in your browser.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-[#F4F7FC] border border-[#E2E8F0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-bold text-[#111827]">
                    Reset Prototype Demo Data
                  </div>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Restore all default sample listings, assessment records, and
                    Firdoush Bano’s initial profile state.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onResetDemoData}
                  className="px-4 py-2 text-xs font-semibold text-red-600 bg-white border border-red-200 hover:bg-red-50 rounded-lg cursor-pointer shrink-0"
                >
                  Reset All Demo Data
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* View Opportunity Details Modal */}
      {selectedOpportunity && (
        <div className="fixed inset-0 z-50 bg-[#0B1220]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-start justify-between gap-3 border-b border-[#E2E8F0] pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#111827]">
                  {selectedOpportunity.title}
                </h3>
                <p className="text-xs text-[#64748B]">
                  {selectedOpportunity.companyName} ·{' '}
                  {selectedOpportunity.location} ({selectedOpportunity.workMode}
                  )
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOpportunity(null)}
                className="text-xs text-[#64748B] hover:text-[#111827] px-2 py-1 border border-[#E2E8F0] rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="text-xs space-y-2 text-[#111827]">
              <div>
                <span className="text-[#64748B]">Compensation: </span>
                <span className="font-mono-tabular font-bold">
                  {selectedOpportunity.compensation}
                </span>
              </div>
              <div>
                <span className="text-[#64748B]">Eligibility: </span>
                <span>{selectedOpportunity.eligibilityCriteria}</span>
              </div>
              <div>
                <span className="text-[#64748B]">Required Skills: </span>
                <span className="font-semibold">
                  {selectedOpportunity.requiredSkills.join(' · ')}
                </span>
              </div>
              <p className="text-[#64748B] pt-2 leading-relaxed">
                {selectedOpportunity.description}
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => {
                  const target = selectedOpportunity;
                  setSelectedOpportunity(null);
                  setApplyingOpportunity(target);
                  setCoverNote(
                    `Applying with verified skills (${verifiedSkillNames.join(
                      ', '
                    )}) and CGPA ${student.cgpa}.`
                  );
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-lg cursor-pointer"
              >
                Proceed to Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Confirmation Modal */}
      {applyingOpportunity && (
        <div className="fixed inset-0 z-50 bg-[#0B1220]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <h3 className="text-base font-bold text-[#111827]">
                Submit Application — {applyingOpportunity.title}
              </h3>
              <button
                type="button"
                onClick={() => setApplyingOpportunity(null)}
                className="text-xs text-[#64748B]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F4F7FC] border border-[#E2E8F0] text-xs space-y-1">
              <div className="font-semibold text-[#111827]">
                Candidate: {student.fullName} ({student.branch}, CGPA{' '}
                {student.cgpa})
              </div>
              <div className="text-[#64748B]">
                Attached Resume: {student.resume.fileName}
              </div>
              <div className="text-[#10B981] font-medium">
                Verified Credentials Attached:{' '}
                {verifiedSkillNames.join(' · ') || 'None'}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#111827] mb-1">
                Cover Note to Recruiter
              </label>
              <textarea
                rows={3}
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                className="w-full p-3 text-xs bg-[#F4F7FC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563FF]"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setApplyingOpportunity(null)}
                className="px-4 py-2 text-xs font-semibold text-[#64748B] bg-[#F4F7FC] rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onApplyOpportunity(applyingOpportunity, coverNote);
                  setApplyingOpportunity(null);
                }}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-lg cursor-pointer"
              >
                Submit Application
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
