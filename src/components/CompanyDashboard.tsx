import React, { useState } from 'react';
import {
  AlertCircle,
  Briefcase,
  Building2,
  CheckCircle2,
  Edit3,
  ExternalLink,
  FileCheck2,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  PlusCircle,
  Settings,
  ShieldCheck,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import {
  ApplicationStatus,
  CompanyProfile,
  JobApplication,
  OpportunityCategory,
  OpportunityListing,
  StudentProfile,
  UserRole,
  WorkMode,
} from '../types';

export type CompanyTabId =
  | 'overview'
  | 'profile'
  | 'post-job'
  | 'post-internship'
  | 'listings'
  | 'applicants'
  | 'shortlisted'
  | 'settings';

interface CompanyDashboardProps {
  company: CompanyProfile;
  students: StudentProfile[];
  opportunities: OpportunityListing[];
  applications: JobApplication[];
  onUpdateCompany: (updated: CompanyProfile) => void;
  onUpdateStudent: (updated: StudentProfile) => void;
  onCreateOpportunity: (newOpp: OpportunityListing) => void;
  onDeleteOpportunity: (id: string) => void;
  onUpdateApplicationStatus: (appId: string, status: ApplicationStatus) => void;
  onSwitchRole: (role: UserRole | null) => void;
  onNotify: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const CompanyDashboard: React.FC<CompanyDashboardProps> = ({
  company,
  students,
  opportunities,
  applications,
  onUpdateCompany,
  onUpdateStudent,
  onCreateOpportunity,
  onDeleteOpportunity,
  onUpdateApplicationStatus,
  onSwitchRole,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<CompanyTabId>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Company profile form state
  const [companyForm, setCompanyForm] = useState<CompanyProfile>(company);

  // New Opportunity form state
  const [title, setTitle] = useState('');
  const [workMode, setWorkMode] = useState<WorkMode>('Hybrid');
  const [location, setLocation] = useState(company.headquarters);
  const [compensation, setCompensation] = useState('');
  const [skillsInput, setSkillsInput] = useState('Java, SQL, Data Structures and Algorithms');
  const [eligibility, setEligibility] = useState(
    'B.E. / B.Tech in CS/IT · Min CGPA 7.5'
  );
  const [deadline, setDeadline] = useState('2026-12-01');
  const [description, setDescription] = useState('');

  // Confirmation modal for deletion
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filter for applicants
  const [applicantStatusFilter, setApplicantStatusFilter] =
    useState<string>('All');

  // Edit Student Details Modal State
  const [editingStudent, setEditingStudent] = useState<StudentProfile | null>(
    null
  );
  const [studentFormError, setStudentFormError] = useState<string | null>(null);
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

  // Resolve live student profile from centralized students state
  const resolveStudentForApp = (app: JobApplication): StudentProfile => {
    const found = students.find((s) => s.id === app.studentId);
    if (found) return found;
    return {
      id: app.studentId,
      fullName: app.studentName,
      email: app.studentEmail,
      college: app.studentCollege,
      university: app.studentCollege,
      degree: 'B.Tech',
      branch: app.studentBranch,
      graduationYear: 2026,
      cgpa: app.studentCgpa,
      technicalSkills: app.studentSkills,
      projects: [],
      certifications: [],
      experience: [],
      githubUrl: '',
      linkedinUrl: '',
      bio: '',
      location: 'India',
      resume: {
        fileName: app.resumeFileName,
        fileSizeKb: 240,
        uploadedAt: app.appliedAt,
        fileType: 'application/pdf',
        targetRole: app.opportunityTitle,
      },
      savedOpportunityIds: [],
      completedResourceIds: [],
    };
  };

  const handleOpenEditStudentModal = (app: JobApplication) => {
    const targetStudent = resolveStudentForApp(app);
    setEditingStudent({
      ...targetStudent,
      technicalSkills: [...targetStudent.technicalSkills],
      projects: targetStudent.projects.map((p) => ({
        ...p,
        techStack: [...p.techStack],
      })),
      certifications: targetStudent.certifications.map((c) => ({ ...c })),
      experience: targetStudent.experience.map((x) => ({ ...x })),
      resume: { ...targetStudent.resume },
    });
    setStudentFormError(null);
    setNewSkillInput('');
    setNewProjectTitle('');
    setNewProjectTech('');
    setNewProjectDesc('');
    setNewCertName('');
    setNewCertIssuer('');
    setNewExpRole('');
    setNewExpOrg('');
    setNewExpDuration('');
    setNewExpSummary('');
  };

  const handleCancelEditStudent = () => {
    setEditingStudent(null);
    setStudentFormError(null);
  };

  const handleStudentResumeUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!editingStudent) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const allowedExtensions = ['.pdf', '.doc', '.docx', '.txt'];
    const lowerName = file.name.toLowerCase();
    const isValidExt = allowedExtensions.some((ext) => lowerName.endsWith(ext));
    if (!isValidExt) {
      setStudentFormError(
        'Invalid resume format. Please upload a PDF, DOCX, or TXT file.'
      );
      return;
    }
    setStudentFormError(null);
    setEditingStudent({
      ...editingStudent,
      resume: {
        ...editingStudent.resume,
        fileName: file.name,
        fileSizeKb: Math.max(12, Math.round(file.size / 1024)),
        uploadedAt: new Date().toISOString().split('T')[0],
        fileType: file.type || 'application/pdf',
      },
    });
  };

  const handleSaveStudentDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    setStudentFormError(null);

    if (!editingStudent.fullName.trim()) {
      setStudentFormError('Student full name is required.');
      onNotify('Student full name is required.', 'warning');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (
      !editingStudent.email.trim() ||
      !emailRegex.test(editingStudent.email.trim())
    ) {
      setStudentFormError(
        'Please enter a valid student email address (e.g. name@domain.com).'
      );
      onNotify('Please enter a valid email address.', 'warning');
      return;
    }

    if (!editingStudent.college.trim()) {
      setStudentFormError('College name is required.');
      onNotify('College name is required.', 'warning');
      return;
    }

    if (!editingStudent.degree.trim() || !editingStudent.branch.trim()) {
      setStudentFormError('Degree and branch are required.');
      onNotify('Degree and branch are required.', 'warning');
      return;
    }

    if (
      Number.isNaN(Number(editingStudent.cgpa)) ||
      Number(editingStudent.cgpa) < 0 ||
      Number(editingStudent.cgpa) > 10
    ) {
      setStudentFormError('CGPA must be a valid number between 0 and 10.');
      onNotify('CGPA must be between 0 and 10.', 'warning');
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

    if (!isValidHttpUrl(editingStudent.githubUrl)) {
      setStudentFormError(
        'Please enter a valid GitHub profile URL starting with https:// or http://'
      );
      onNotify('Invalid GitHub profile URL.', 'warning');
      return;
    }

    if (!isValidHttpUrl(editingStudent.linkedinUrl)) {
      setStudentFormError(
        'Please enter a valid LinkedIn profile URL starting with https:// or http://'
      );
      onNotify('Invalid LinkedIn profile URL.', 'warning');
      return;
    }

    const updatedSkills = [...editingStudent.technicalSkills];
    if (
      newSkillInput.trim() &&
      !updatedSkills.includes(newSkillInput.trim())
    ) {
      updatedSkills.push(newSkillInput.trim());
      setNewSkillInput('');
    }

    const updatedProjects = [...editingStudent.projects];
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
    }

    const updatedCerts = [...editingStudent.certifications];
    if (newCertName.trim()) {
      updatedCerts.push({
        id: `cert-${Date.now()}`,
        name: newCertName.trim(),
        issuer: newCertIssuer.trim() || 'Verified Issuer',
        issueDate: '2026',
      });
    }

    const updatedExp = [...editingStudent.experience];
    if (newExpRole.trim()) {
      updatedExp.push({
        id: `exp-${Date.now()}`,
        role: newExpRole.trim(),
        organization: newExpOrg.trim() || 'Organization',
        duration: newExpDuration.trim() || '2025 – 2026',
        summary: newExpSummary.trim() || 'Engineering internship experience.',
      });
    }

    const cleanedStudent: StudentProfile = {
      ...editingStudent,
      fullName: editingStudent.fullName.trim(),
      email: editingStudent.email.trim(),
      college: editingStudent.college.trim(),
      university:
        editingStudent.university.trim() || editingStudent.college.trim(),
      degree: editingStudent.degree.trim(),
      branch: editingStudent.branch.trim(),
      graduationYear: Number(editingStudent.graduationYear) || 2026,
      cgpa: Number(editingStudent.cgpa),
      githubUrl: editingStudent.githubUrl.trim(),
      linkedinUrl: editingStudent.linkedinUrl.trim(),
      technicalSkills: updatedSkills,
      projects: updatedProjects,
      certifications: updatedCerts,
      experience: updatedExp,
      resume: {
        ...editingStudent.resume,
        fileName:
          editingStudent.resume.fileName.trim() ||
          `${editingStudent.fullName.trim().replace(/\s+/g, '_')}_Resume.pdf`,
      },
    };

    onUpdateStudent(cleanedStudent);
    setEditingStudent(null);
    onNotify(
      `Student details for "${cleanedStudent.fullName}" updated and synchronized across all portals!`,
      'success'
    );
  };

  const companyListings = opportunities.filter(
    (o) => o.companyId === company.id || o.companyName === company.name
  );
  const shortlistedApps = applications.filter(
    (a) => a.status === 'Shortlisted'
  );

  const handlePostListing = (
    e: React.FormEvent,
    category: OpportunityCategory
  ) => {
    e.preventDefault();
    if (!title.trim() || !compensation.trim() || !description.trim()) {
      onNotify(
        'Please complete Title, Compensation, and Description.',
        'warning'
      );
      return;
    }

    const newListing: OpportunityListing = {
      id: `opp-${Date.now()}`,
      title: title.trim(),
      companyId: company.id,
      companyName: company.name,
      companyMonogram: company.monogram,
      category,
      workMode,
      location: location.trim() || company.headquarters,
      compensation: compensation.trim(),
      experienceLevel:
        category === 'Internship' ? 'Pre-Final / Final Year' : '2026 Graduate',
      requiredSkills: skillsInput
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      eligibilityCriteria: eligibility.trim(),
      description: description.trim(),
      responsibilities: [
        `Deliver high-quality engineering solutions as a ${title.trim()}.`,
        'Collaborate with product and architecture teams on code reviews.',
      ],
      deadline,
      postedAt: new Date().toISOString().split('T')[0],
      featured: true,
    };

    onCreateOpportunity(newListing);
    setTitle('');
    setCompensation('');
    setDescription('');
    setActiveTab('listings');
    onNotify(
      `${category} "${newListing.title}" published to the Hire Sphere portal!`,
      'success'
    );
  };

  const navItems: { id: CompanyTabId; label: string; icon: React.ReactNode }[] =
    [
      {
        id: 'overview',
        label: 'Overview',
        icon: <LayoutDashboard className="w-4 h-4" />,
      },
      {
        id: 'profile',
        label: 'Company Profile',
        icon: <Building2 className="w-4 h-4" />,
      },
      {
        id: 'post-job',
        label: 'Post a Job',
        icon: <PlusCircle className="w-4 h-4" />,
      },
      {
        id: 'post-internship',
        label: 'Post an Internship',
        icon: <GraduationCap className="w-4 h-4" />,
      },
      {
        id: 'listings',
        label: 'Manage Listings',
        icon: <Briefcase className="w-4 h-4" />,
      },
      {
        id: 'applicants',
        label: 'View Applicants',
        icon: <Users className="w-4 h-4" />,
      },
      {
        id: 'shortlisted',
        label: 'Shortlisted Candidates',
        icon: <FileCheck2 className="w-4 h-4" />,
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: <Settings className="w-4 h-4" />,
      },
    ];

  const renderPostingForm = (category: OpportunityCategory) => (
    <form
      onSubmit={(e) => handlePostListing(e, category)}
      className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-5"
    >
      <div className="border-b border-[#E2E8F0] pb-4">
        <h2 className="text-lg font-bold text-[#111827]">
          Post a New {category} Listing
        </h2>
        <p className="text-xs text-[#64748B]">
          Newly published listings appear immediately in the Student Opportunity
          Portal and Landing Page.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-[#111827] mb-1">
            {category} Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={
              category === 'Job'
                ? 'e.g. Backend Software Engineer (Java)'
                : 'e.g. Summer Data Engineering Intern'
            }
            className="w-full px-3.5 py-2 text-sm bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#111827] mb-1">
            {category === 'Job' ? 'Annual CTC Package' : 'Monthly Stipend'}
          </label>
          <input
            type="text"
            value={compensation}
            onChange={(e) => setCompensation(e.target.value)}
            placeholder={
              category === 'Job' ? 'e.g. ₹14.0 LPA' : 'e.g. ₹40,000 / month'
            }
            className="w-full px-3.5 py-2 text-sm bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-[#111827] mb-1">
            Location
          </label>
          <input
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              Work Mode
            </label>
            <select
              value={workMode}
              onChange={(e) => setWorkMode(e.target.value as WorkMode)}
              className="w-full px-3 py-2 text-sm bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
            >
              <option value="Hybrid">Hybrid</option>
              <option value="Remote">Remote</option>
              <option value="On-Site">On-Site</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-[#111827] mb-1">
              Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg font-mono-tabular"
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-[#111827] mb-1">
            Required Technical Skills (comma-separated)
          </label>
          <input
            type="text"
            value={skillsInput}
            onChange={(e) => setSkillsInput(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-[#111827] mb-1">
            Eligibility Criteria
          </label>
          <input
            type="text"
            value={eligibility}
            onChange={(e) => setEligibility(e.target.value)}
            className="w-full px-3.5 py-2 text-sm bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-[#111827] mb-1">
            Role Description & Expectations
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the engineering team, tech stack, and responsibilities..."
            className="w-full p-3.5 text-sm bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
          />
        </div>
      </div>

      <div className="flex justify-end pt-3 border-t border-[#E2E8F0]">
        <button
          type="submit"
          className="px-6 py-2.5 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-xl cursor-pointer"
        >
          Publish {category} Listing
        </button>
      </div>
    </form>
  );

  return (
    <div className="min-h-screen flex bg-[#F4F7FC] text-[#111827]">
      {/* Midnight Blue Sidebar */}
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
              {company.name}
            </div>
            <div className="text-[11px] text-slate-400 truncate mt-0.5">
              {company.industry}
            </div>
            <div className="mt-2 inline-flex items-center gap-1.5 text-[11px] text-[#10B981] font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Verified Recruiter</span>
            </div>
          </div>

          <nav className="p-3 space-y-1">
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
                      ? 'bg-[#2563FF] text-white font-semibold'
                      : 'text-slate-300 hover:bg-[#111C35] hover:text-white'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 bg-white border-b border-[#E2E8F0] px-6 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg border border-[#E2E8F0]"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="text-sm font-semibold text-[#111827]">
              Company Recruiter Portal{' '}
              <span className="text-[#64748B] font-normal">/</span>{' '}
              <span className="text-[#2563FF]">
                {navItems.find((n) => n.id === activeTab)?.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setActiveTab('post-job')}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-lg cursor-pointer"
            >
              + Post a Job
            </button>
            <button
              type="button"
              onClick={() => onSwitchRole('student')}
              className="hidden sm:inline-flex px-3 py-1.5 text-xs font-medium text-[#111827] bg-[#F4F7FC] hover:bg-[#E2E8F0] border border-[#E2E8F0] rounded-lg cursor-pointer"
            >
              Switch to Student View
            </button>
          </div>
        </header>

        <main className="p-6 max-w-6xl w-full mx-auto space-y-6">
          {/* OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="bg-[#0B1220] text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#2563FF] mb-1">
                    Campus Recruitment Console
                  </p>
                  <h1 className="text-2xl font-bold">{company.name}</h1>
                  <p className="text-xs text-slate-300 mt-1">
                    {company.headquarters} · {company.companySize} · Hire
                    candidates with verified ≥80% technical assessments
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('post-job')}
                    className="px-4 py-2.5 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-xl cursor-pointer"
                  >
                    Post Job
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('applicants')}
                    className="px-4 py-2.5 text-xs font-semibold text-white bg-[#111C35] border border-white/15 rounded-xl cursor-pointer"
                  >
                    Review Applicants
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
                  <div className="text-xs text-[#64748B]">
                    Total Portal Listings
                  </div>
                  <div className="text-2xl font-bold text-[#111827] tabular-nums mt-1">
                    {opportunities.length}
                  </div>
                  <div className="text-xs text-[#2563FF] mt-1">
                    {companyListings.length} posted by {company.name}
                  </div>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
                  <div className="text-xs text-[#64748B]">
                    Total Candidate Applications
                  </div>
                  <div className="text-2xl font-bold text-[#111827] tabular-nums mt-1">
                    {applications.length}
                  </div>
                  <div className="text-xs text-[#64748B] mt-1">
                    Includes verified skill snapshots
                  </div>
                </div>

                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
                  <div className="text-xs text-[#64748B]">
                    Shortlisted Candidates
                  </div>
                  <div className="text-2xl font-bold text-[#10B981] tabular-nums mt-1">
                    {shortlistedApps.length}
                  </div>
                  <div className="text-xs text-[#10B981] mt-1">
                    Ready for technical interviews
                  </div>
                </div>
              </div>

              {/* Recent Applicants Table */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-bold text-[#111827]">
                    Recent Candidate Applications
                  </h2>
                  <button
                    type="button"
                    onClick={() => setActiveTab('applicants')}
                    className="text-xs font-semibold text-[#2563FF] hover:underline cursor-pointer"
                  >
                    Manage All Applicants →
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E2E8F0] text-[11px] font-semibold uppercase text-[#64748B]">
                        <th className="py-3 pr-4">Candidate</th>
                        <th className="py-3 px-4">Role Applied</th>
                        <th className="py-3 px-4">CGPA</th>
                        <th className="py-3 px-4">Verified Skills (≥80%)</th>
                        <th className="py-3 pl-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] text-xs">
                      {applications.map((app) => {
                        const liveStu = resolveStudentForApp(app);
                        return (
                          <tr key={app.id}>
                            <td className="py-3.5 pr-4">
                              <div className="font-bold text-[#111827]">
                                {liveStu.fullName}
                              </div>
                              <div className="text-[#64748B]">
                                {liveStu.college} · {liveStu.degree}{' '}
                                {liveStu.branch}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 font-medium text-[#111827]">
                              {app.opportunityTitle}
                            </td>
                            <td className="py-3.5 px-4 font-mono-tabular font-semibold text-[#111827]">
                              {liveStu.cgpa}
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="text-[#10B981] font-medium">
                                {app.verifiedSkillsSnapshot
                                  .map((s) => `${s.skill} (${s.score}%)`)
                                  .join(' · ') || 'None'}
                              </span>
                            </td>
                            <td className="py-3.5 pl-4 text-right">
                              <div className="inline-flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditStudentModal(app)}
                                  className="px-2.5 py-1.5 text-xs font-semibold text-[#2563FF] bg-[#2563FF]/10 hover:bg-[#2563FF] hover:text-white rounded-lg inline-flex items-center gap-1 transition-colors cursor-pointer"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>Edit Student Details</span>
                                </button>
                                <select
                                  value={app.status}
                                  onChange={(e) =>
                                    onUpdateApplicationStatus(
                                      app.id,
                                      e.target.value as ApplicationStatus
                                    )
                                  }
                                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-[#E2E8F0] bg-[#F4F7FC] text-[#111827]"
                                >
                                  <option value="Applied">Applied</option>
                                  <option value="Under Review">
                                    Under Review
                                  </option>
                                  <option value="Shortlisted">Shortlisted</option>
                                  <option value="Rejected">Rejected</option>
                                </select>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* COMPANY PROFILE */}
          {activeTab === 'profile' && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                onUpdateCompany(companyForm);
                onNotify('Company profile updated!', 'success');
              }}
              className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-5"
            >
              <h2 className="text-lg font-bold text-[#111827]">
                Edit Company Profile
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={companyForm.name}
                    onChange={(e) =>
                      setCompanyForm({ ...companyForm, name: e.target.value })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">
                    Industry Sector
                  </label>
                  <input
                    type="text"
                    value={companyForm.industry}
                    onChange={(e) =>
                      setCompanyForm({
                        ...companyForm,
                        industry: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">
                    Headquarters Location
                  </label>
                  <input
                    type="text"
                    value={companyForm.headquarters}
                    onChange={(e) =>
                      setCompanyForm({
                        ...companyForm,
                        headquarters: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={companyForm.website}
                    onChange={(e) =>
                      setCompanyForm({
                        ...companyForm,
                        website: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#111827] mb-1">
                    Organization Overview
                  </label>
                  <textarea
                    rows={3}
                    value={companyForm.description}
                    onChange={(e) =>
                      setCompanyForm({
                        ...companyForm,
                        description: e.target.value,
                      })
                    }
                    className="w-full p-3.5 text-sm bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="px-5 py-2.5 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-xl cursor-pointer"
              >
                Save Company Profile
              </button>
            </form>
          )}

          {/* POST A JOB */}
          {activeTab === 'post-job' && renderPostingForm('Job')}

          {/* POST AN INTERNSHIP */}
          {activeTab === 'post-internship' && renderPostingForm('Internship')}

          {/* MANAGE LISTINGS */}
          {activeTab === 'listings' && (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[#111827]">
                    Manage Active Listings ({opportunities.length})
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Review or remove job and internship postings
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('post-job')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#2563FF] rounded-lg cursor-pointer"
                >
                  + Add New Listing
                </button>
              </div>

              <div className="divide-y divide-[#E2E8F0]">
                {opportunities.map((opp) => (
                  <div
                    key={opp.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="text-sm font-bold text-[#111827]">
                        {opp.title}{' '}
                        <span className="text-xs font-normal text-[#2563FF]">
                          ({opp.category} · {opp.workMode})
                        </span>
                      </div>
                      <div className="text-xs text-[#64748B] mt-0.5">
                        {opp.companyName} · {opp.location} ·{' '}
                        <span className="font-mono-tabular text-[#111827] font-semibold">
                          {opp.compensation}
                        </span>{' '}
                        · Skills: {opp.requiredSkills.join(', ')}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(opp.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg inline-flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VIEW APPLICANTS & SHORTLISTED */}
          {(activeTab === 'applicants' || activeTab === 'shortlisted') && (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-[#111827]">
                    {activeTab === 'shortlisted'
                      ? `Shortlisted Engineering Candidates (${shortlistedApps.length})`
                      : `All Candidate Applications (${applications.length})`}
                  </h2>
                  <p className="text-xs text-[#64748B]">
                    Review and edit student profiles, resumes, CGPA, and Hire
                    Sphere verified skill credentials
                  </p>
                </div>

                {activeTab === 'applicants' && (
                  <select
                    value={applicantStatusFilter}
                    onChange={(e) => setApplicantStatusFilter(e.target.value)}
                    className="px-3.5 py-2 text-xs font-medium bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Applied">Applied</option>
                    <option value="Under Review">Under Review</option>
                    <option value="Shortlisted">Shortlisted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                )}
              </div>

              <div className="space-y-4">
                {applications
                  .filter((a) =>
                    activeTab === 'shortlisted'
                      ? a.status === 'Shortlisted'
                      : applicantStatusFilter === 'All' ||
                        a.status === applicantStatusFilter
                  )
                  .map((app) => {
                    const stu = resolveStudentForApp(app);
                    return (
                      <div
                        key={app.id}
                        className="p-5 rounded-xl bg-[#F4F7FC] border border-[#E2E8F0] flex flex-col lg:flex-row lg:items-start justify-between gap-5"
                      >
                        <div className="space-y-2 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="text-base font-bold text-[#111827]">
                              {stu.fullName}
                            </span>
                            <span className="text-xs text-[#64748B]">
                              ({stu.email})
                            </span>
                            <span className="text-xs text-[#64748B]">
                              · {stu.college} ({stu.university}) · {stu.degree}{' '}
                              {stu.branch} · Class of {stu.graduationYear} · CGPA{' '}
                              <strong className="text-[#111827] font-mono-tabular">
                                {stu.cgpa}
                              </strong>
                            </span>
                          </div>

                          <div className="text-xs text-[#2563FF] font-semibold">
                            Applied for: {app.opportunityTitle} ({app.companyName}
                            ) · Status: {app.status}
                          </div>

                          <div className="text-xs text-[#10B981] font-medium flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 shrink-0" />
                            <span>
                              Verified Credentials:{' '}
                              {app.verifiedSkillsSnapshot
                                .map((v) => `${v.skill} (${v.score}%)`)
                                .join(' · ') || 'None yet'}
                            </span>
                          </div>

                          <div className="text-xs text-[#111827]">
                            <span className="text-[#64748B] font-medium">
                              Technical Skills:{' '}
                            </span>
                            <span>
                              {stu.technicalSkills.join(' · ') || 'None listed'}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs text-[#64748B]">
                            <div>
                              <span className="font-semibold text-[#111827]">
                                Projects ({stu.projects.length}):{' '}
                              </span>
                              <span>
                                {stu.projects.map((p) => p.title).join(', ') ||
                                  'None'}
                              </span>
                            </div>
                            <div>
                              <span className="font-semibold text-[#111827]">
                                Certifications ({stu.certifications.length}):{' '}
                              </span>
                              <span>
                                {stu.certifications
                                  .map((c) => c.name)
                                  .join(', ') || 'None'}
                              </span>
                            </div>
                            <div>
                              <span className="font-semibold text-[#111827]">
                                Experience ({stu.experience.length}):{' '}
                              </span>
                              <span>
                                {stu.experience
                                  .map((x) => `${x.role} @ ${x.organization}`)
                                  .join(', ') || 'Fresher'}
                              </span>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-4 text-xs text-[#64748B] pt-1">
                            <span>
                              <strong className="text-[#111827]">Resume:</strong>{' '}
                              {stu.resume.fileName}
                            </span>
                            {stu.githubUrl && (
                              <a
                                href={stu.githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#2563FF] hover:underline inline-flex items-center gap-1"
                              >
                                <span>GitHub</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                            {stu.linkedinUrl && (
                              <a
                                href={stu.linkedinUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#2563FF] hover:underline inline-flex items-center gap-1"
                              >
                                <span>LinkedIn</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>

                          <p className="text-xs text-[#64748B] italic">
                            Cover Note: “{app.coverNote}”
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEditStudentModal(app)}
                            className="px-3.5 py-2 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-lg inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Student Details</span>
                          </button>

                          <select
                            value={app.status}
                            onChange={(e) =>
                              onUpdateApplicationStatus(
                                app.id,
                                e.target.value as ApplicationStatus
                              )
                            }
                            className="px-3 py-2 text-xs font-semibold bg-white border border-[#E2E8F0] rounded-lg"
                          >
                            <option value="Applied">Applied</option>
                            <option value="Under Review">Under Review</option>
                            <option value="Shortlisted">Shortlisted</option>
                            <option value="Rejected">Rejected</option>
                          </select>

                          {app.status !== 'Shortlisted' && (
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateApplicationStatus(app.id, 'Shortlisted')
                              }
                              className="px-3.5 py-2 text-xs font-semibold text-white bg-[#10B981] hover:bg-emerald-600 rounded-lg cursor-pointer"
                            >
                              Shortlist
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
              <h2 className="text-lg font-bold text-[#111827] mb-1">
                Recruiter Portal Preferences
              </h2>
              <p className="text-xs text-[#64748B]">
                All job postings, student profile edits, and applicant status
                updates are synchronized across the Student, Company, and Admin
                portals in real time and saved in browser storage.
              </p>
            </div>
          )}
        </main>
      </div>

      {/* Edit Student Details Modal */}
      {editingStudent && (
        <div className="fixed inset-0 z-50 bg-[#0B1220]/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl p-6 sm:p-8">
            <form onSubmit={handleSaveStudentDetails} className="space-y-6">
              {/* Modal Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E2E8F0]">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#2563FF]">
                    Company Portal · Candidate Record Editor
                  </span>
                  <h3 className="text-xl font-bold text-[#111827] mt-0.5">
                    Edit Student Details — {editingStudent.fullName}
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Changes immediately synchronize across Company Applicant
                    Cards, Student Dashboard, Profile, and Resume Preview.
                  </p>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  <button
                    type="button"
                    onClick={handleCancelEditStudent}
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

              {studentFormError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{studentFormError}</span>
                </div>
              )}

              {/* Primary Academic, Personal & Portfolio Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={editingStudent.fullName}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        fullName: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    value={editingStudent.email}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">
                    College Name *
                  </label>
                  <input
                    type="text"
                    value={editingStudent.college}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
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
                    value={editingStudent.university}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        university: e.target.value,
                      })
                    }
                    className="w-full px-3.5 py-2 text-sm bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563FF]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-xs font-semibold text-[#111827] mb-1">
                      Degree *
                    </label>
                    <input
                      type="text"
                      value={editingStudent.degree}
                      onChange={(e) =>
                        setEditingStudent({
                          ...editingStudent,
                          degree: e.target.value,
                        })
                      }
                      placeholder="B.Tech"
                      className="w-full px-3 py-2 text-sm bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563FF]"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-[#111827] mb-1">
                      Branch *
                    </label>
                    <input
                      type="text"
                      value={editingStudent.branch}
                      onChange={(e) =>
                        setEditingStudent({
                          ...editingStudent,
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
                      value={editingStudent.graduationYear}
                      onChange={(e) =>
                        setEditingStudent({
                          ...editingStudent,
                          graduationYear: Number(e.target.value) || 2026,
                        })
                      }
                      className="w-full px-3 py-2 text-sm bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg font-mono-tabular focus:outline-none focus:border-[#2563FF]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1">
                      CGPA (0–10)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="10"
                      value={editingStudent.cgpa}
                      onChange={(e) =>
                        setEditingStudent({
                          ...editingStudent,
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
                    value={editingStudent.githubUrl}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
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
                    value={editingStudent.linkedinUrl}
                    onChange={(e) =>
                      setEditingStudent({
                        ...editingStudent,
                        linkedinUrl: e.target.value,
                      })
                    }
                    placeholder="https://linkedin.com/in/username"
                    className="w-full px-3.5 py-2 text-sm bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#111827] mb-1">
                    Resume Filename / Upload
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingStudent.resume.fileName}
                      onChange={(e) =>
                        setEditingStudent({
                          ...editingStudent,
                          resume: {
                            ...editingStudent.resume,
                            fileName: e.target.value,
                          },
                        })
                      }
                      className="flex-1 px-3 py-2 text-xs bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563FF]"
                    />
                    <label className="px-3 py-2 text-xs font-semibold text-white bg-[#0B1220] hover:bg-[#111C35] rounded-lg cursor-pointer inline-flex items-center gap-1.5 shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        onChange={handleStudentResumeUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Technical Skills Section */}
              <div className="pt-4 border-t border-[#E2E8F0]">
                <label className="block text-xs font-semibold text-[#111827] mb-2">
                  Technical Skills ({editingStudent.technicalSkills.length})
                </label>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  {editingStudent.technicalSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#F4F7FC] border border-[#E2E8F0] text-[#111827]"
                    >
                      <span>{skill}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setEditingStudent({
                            ...editingStudent,
                            technicalSkills:
                              editingStudent.technicalSkills.filter(
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
                    placeholder="Add technical skill (e.g. Java, Python, SQL)..."
                    className="flex-1 px-3.5 py-2 text-xs bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg focus:outline-none focus:border-[#2563FF]"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = newSkillInput.trim();
                      if (
                        val &&
                        !editingStudent.technicalSkills.includes(val)
                      ) {
                        setEditingStudent({
                          ...editingStudent,
                          technicalSkills: [
                            ...editingStudent.technicalSkills,
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

              {/* Projects, Certifications, Experience */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-4 border-t border-[#E2E8F0]">
                {/* 1. Projects */}
                <div className="bg-[#F4F7FC] border border-[#E2E8F0] rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
                    Projects ({editingStudent.projects.length})
                  </h4>
                  <div className="space-y-2.5">
                    {editingStudent.projects.map((proj, idx) => (
                      <div
                        key={proj.id}
                        className="p-2.5 rounded-lg bg-white border border-[#E2E8F0] space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={proj.title}
                            onChange={(e) => {
                              const next = [...editingStudent.projects];
                              next[idx] = { ...proj, title: e.target.value };
                              setEditingStudent({
                                ...editingStudent,
                                projects: next,
                              });
                            }}
                            placeholder="Project Title"
                            className="flex-1 px-2 py-1 text-xs font-bold bg-[#F4F7FC] border border-[#E2E8F0] rounded"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setEditingStudent({
                                ...editingStudent,
                                projects: editingStudent.projects.filter(
                                  (p) => p.id !== proj.id
                                ),
                              })
                            }
                            className="text-[#64748B] hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={proj.techStack.join(', ')}
                          onChange={(e) => {
                            const next = [...editingStudent.projects];
                            next[idx] = {
                              ...proj,
                              techStack: e.target.value
                                .split(',')
                                .map((s) => s.trim())
                                .filter(Boolean),
                            };
                            setEditingStudent({
                              ...editingStudent,
                              projects: next,
                            });
                          }}
                          placeholder="Tech Stack (comma-separated)"
                          className="w-full px-2 py-1 text-xs bg-[#F4F7FC] border border-[#E2E8F0] rounded"
                        />
                        <textarea
                          rows={2}
                          value={proj.description}
                          onChange={(e) => {
                            const next = [...editingStudent.projects];
                            next[idx] = {
                              ...proj,
                              description: e.target.value,
                            };
                            setEditingStudent({
                              ...editingStudent,
                              projects: next,
                            });
                          }}
                          placeholder="Project description"
                          className="w-full px-2 py-1 text-xs bg-[#F4F7FC] border border-[#E2E8F0] rounded"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0]">
                    <input
                      type="text"
                      value={newProjectTitle}
                      onChange={(e) => setNewProjectTitle(e.target.value)}
                      placeholder="New Project Title"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-lg"
                    />
                    <input
                      type="text"
                      value={newProjectTech}
                      onChange={(e) => setNewProjectTech(e.target.value)}
                      placeholder="Tech Stack (e.g. Java, SQL)"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-lg"
                    />
                    <textarea
                      rows={2}
                      value={newProjectDesc}
                      onChange={(e) => setNewProjectDesc(e.target.value)}
                      placeholder="Project description..."
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newProjectTitle.trim()) return;
                        setEditingStudent({
                          ...editingStudent,
                          projects: [
                            ...editingStudent.projects,
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
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-lg cursor-pointer"
                    >
                      + Add Project
                    </button>
                  </div>
                </div>

                {/* 2. Certifications */}
                <div className="bg-[#F4F7FC] border border-[#E2E8F0] rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
                    Certifications ({editingStudent.certifications.length})
                  </h4>
                  <div className="space-y-2.5">
                    {editingStudent.certifications.map((cert, idx) => (
                      <div
                        key={cert.id}
                        className="p-2.5 rounded-lg bg-white border border-[#E2E8F0] space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={cert.name}
                            onChange={(e) => {
                              const next = [...editingStudent.certifications];
                              next[idx] = { ...cert, name: e.target.value };
                              setEditingStudent({
                                ...editingStudent,
                                certifications: next,
                              });
                            }}
                            placeholder="Certification Name"
                            className="flex-1 px-2 py-1 text-xs font-bold bg-[#F4F7FC] border border-[#E2E8F0] rounded"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setEditingStudent({
                                ...editingStudent,
                                certifications:
                                  editingStudent.certifications.filter(
                                    (c) => c.id !== cert.id
                                  ),
                              })
                            }
                            className="text-[#64748B] hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={cert.issuer}
                          onChange={(e) => {
                            const next = [...editingStudent.certifications];
                            next[idx] = { ...cert, issuer: e.target.value };
                            setEditingStudent({
                              ...editingStudent,
                              certifications: next,
                            });
                          }}
                          placeholder="Issuer"
                          className="w-full px-2 py-1 text-xs bg-[#F4F7FC] border border-[#E2E8F0] rounded"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0]">
                    <input
                      type="text"
                      value={newCertName}
                      onChange={(e) => setNewCertName(e.target.value)}
                      placeholder="New Certification Name"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-lg"
                    />
                    <input
                      type="text"
                      value={newCertIssuer}
                      onChange={(e) => setNewCertIssuer(e.target.value)}
                      placeholder="Issuer (e.g. Oracle, NPTEL)"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newCertName.trim()) return;
                        setEditingStudent({
                          ...editingStudent,
                          certifications: [
                            ...editingStudent.certifications,
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
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-lg cursor-pointer"
                    >
                      + Add Certification
                    </button>
                  </div>
                </div>

                {/* 3. Experience */}
                <div className="bg-[#F4F7FC] border border-[#E2E8F0] rounded-xl p-4 space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#111827]">
                    Experience ({editingStudent.experience.length})
                  </h4>
                  <div className="space-y-2.5">
                    {editingStudent.experience.map((exp, idx) => (
                      <div
                        key={exp.id}
                        className="p-2.5 rounded-lg bg-white border border-[#E2E8F0] space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={exp.role}
                            onChange={(e) => {
                              const next = [...editingStudent.experience];
                              next[idx] = { ...exp, role: e.target.value };
                              setEditingStudent({
                                ...editingStudent,
                                experience: next,
                              });
                            }}
                            placeholder="Role Title"
                            className="flex-1 px-2 py-1 text-xs font-bold bg-[#F4F7FC] border border-[#E2E8F0] rounded"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setEditingStudent({
                                ...editingStudent,
                                experience: editingStudent.experience.filter(
                                  (x) => x.id !== exp.id
                                ),
                              })
                            }
                            className="text-[#64748B] hover:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          value={exp.organization}
                          onChange={(e) => {
                            const next = [...editingStudent.experience];
                            next[idx] = {
                              ...exp,
                              organization: e.target.value,
                            };
                            setEditingStudent({
                              ...editingStudent,
                              experience: next,
                            });
                          }}
                          placeholder="Company / Organization"
                          className="w-full px-2 py-1 text-xs bg-[#F4F7FC] border border-[#E2E8F0] rounded"
                        />
                        <input
                          type="text"
                          value={exp.duration}
                          onChange={(e) => {
                            const next = [...editingStudent.experience];
                            next[idx] = { ...exp, duration: e.target.value };
                            setEditingStudent({
                              ...editingStudent,
                              experience: next,
                            });
                          }}
                          placeholder="Duration"
                          className="w-full px-2 py-1 text-xs bg-[#F4F7FC] border border-[#E2E8F0] rounded"
                        />
                        <textarea
                          rows={2}
                          value={exp.summary}
                          onChange={(e) => {
                            const next = [...editingStudent.experience];
                            next[idx] = { ...exp, summary: e.target.value };
                            setEditingStudent({
                              ...editingStudent,
                              experience: next,
                            });
                          }}
                          placeholder="Summary"
                          className="w-full px-2 py-1 text-xs bg-[#F4F7FC] border border-[#E2E8F0] rounded"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="space-y-1.5 pt-2 border-t border-[#E2E8F0]">
                    <input
                      type="text"
                      value={newExpRole}
                      onChange={(e) => setNewExpRole(e.target.value)}
                      placeholder="New Role / Internship Title"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-lg"
                    />
                    <input
                      type="text"
                      value={newExpOrg}
                      onChange={(e) => setNewExpOrg(e.target.value)}
                      placeholder="Organization"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-lg"
                    />
                    <input
                      type="text"
                      value={newExpDuration}
                      onChange={(e) => setNewExpDuration(e.target.value)}
                      placeholder="Duration (e.g. May 2025 – Jul 2025)"
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-lg"
                    />
                    <textarea
                      rows={2}
                      value={newExpSummary}
                      onChange={(e) => setNewExpSummary(e.target.value)}
                      placeholder="Summary..."
                      className="w-full px-2.5 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (!newExpRole.trim()) return;
                        setEditingStudent({
                          ...editingStudent,
                          experience: [
                            ...editingStudent.experience,
                            {
                              id: `exp-${Date.now()}`,
                              role: newExpRole.trim(),
                              organization: newExpOrg.trim() || 'Organization',
                              duration: newExpDuration.trim() || '2025 – 2026',
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
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-lg cursor-pointer"
                    >
                      + Add Experience
                    </button>
                  </div>
                </div>
              </div>

              {/* Modal Footer Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={handleCancelEditStudent}
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
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-[#0B1220]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-[#111827]">
              Confirm Listing Removal
            </h3>
            <p className="text-xs text-[#64748B]">
              Are you sure you want to delete this opportunity listing from the
              demo portal?
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmDeleteId(null)}
                className="px-4 py-2 text-xs font-semibold text-[#64748B] bg-[#F4F7FC] rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteOpportunity(confirmDeleteId);
                  setConfirmDeleteId(null);
                  onNotify('Listing removed.', 'info');
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
              >
                Delete Listing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
