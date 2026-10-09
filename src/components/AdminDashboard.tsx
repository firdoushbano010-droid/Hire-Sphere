import React, { useState } from 'react';
import {
  Award,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle2,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import {
  AssessmentQuestion,
  CompanyProfile,
  DifficultyLevel,
  LearningResource,
  OpportunityListing,
  SkillName,
  SkillVerificationRecord,
  StudentProfile,
  UserRole,
} from '../types';
import { SKILLS_METADATA } from '../data/mockData';

export type AdminTabId =
  | 'overview'
  | 'students'
  | 'companies'
  | 'jobs'
  | 'internships'
  | 'questions'
  | 'resources'
  | 'verifications'
  | 'reports'
  | 'settings';

interface AdminDashboardProps {
  students: StudentProfile[];
  companies: CompanyProfile[];
  opportunities: OpportunityListing[];
  questions: AssessmentQuestion[];
  resources: LearningResource[];
  verifications: SkillVerificationRecord[];
  onDeleteStudent: (id: string) => void;
  onDeleteCompany: (id: string) => void;
  onDeleteOpportunity: (id: string) => void;
  onAddQuestion: (q: AssessmentQuestion) => void;
  onDeleteQuestion: (id: string) => void;
  onAddResource: (r: LearningResource) => void;
  onDeleteResource: (id: string) => void;
  onSwitchRole: (role: UserRole | null) => void;
  onResetDemoData: () => void;
  onNotify: (msg: string, type?: 'success' | 'info' | 'warning') => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  students,
  companies,
  opportunities,
  questions,
  resources,
  verifications,
  onDeleteStudent,
  onDeleteCompany,
  onDeleteOpportunity,
  onAddQuestion,
  onDeleteQuestion,
  onAddResource,
  onDeleteResource,
  onSwitchRole,
  onResetDemoData,
  onNotify,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTabId>('overview');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Search and Filter
  const [searchQuery, setSearchQuery] = useState('');
  const [questionSkillFilter, setQuestionSkillFilter] = useState<string>('All');

  // Add New Question Form State
  const [newQSkill, setNewQSkill] = useState<SkillName>('Java');
  const [newQDifficulty, setNewQDifficulty] =
    useState<DifficultyLevel>('Intermediate');
  const [newQText, setNewQText] = useState('');
  const [opt0, setOpt0] = useState('');
  const [opt1, setOpt1] = useState('');
  const [opt2, setOpt2] = useState('');
  const [opt3, setOpt3] = useState('');
  const [correctIdx, setCorrectIdx] = useState<number>(0);
  const [explanation, setExplanation] = useState('');

  // Add Learning Resource State
  const [resTitle, setResTitle] = useState('');
  const [resSkill, setResSkill] = useState<SkillName>('Java');
  const [resProvider, setResProvider] =
    useState<LearningResource['provider']>('GeeksforGeeks');
  const [resDifficulty, setResDifficulty] =
    useState<DifficultyLevel>('Intermediate');
  const [resUrl, setResUrl] = useState('https://www.geeksforgeeks.org/');
  const [resDesc, setResDesc] = useState('');

  // Delete Confirmation Modal State
  const [pendingDelete, setPendingDelete] = useState<{
    type: 'student' | 'company' | 'opportunity' | 'question' | 'resource';
    id: string;
    label: string;
  } | null>(null);

  const navItems: { id: AdminTabId; label: string; icon: React.ReactNode }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      id: 'students',
      label: 'Manage Students',
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: 'companies',
      label: 'Manage Companies',
      icon: <Building2 className="w-4 h-4" />,
    },
    {
      id: 'jobs',
      label: 'Manage Jobs',
      icon: <Briefcase className="w-4 h-4" />,
    },
    {
      id: 'internships',
      label: 'Manage Internships',
      icon: <GraduationCap className="w-4 h-4" />,
    },
    {
      id: 'questions',
      label: 'Assessment Question Bank',
      icon: <HelpCircle className="w-4 h-4" />,
    },
    {
      id: 'resources',
      label: 'Learning Resources',
      icon: <BookOpen className="w-4 h-4" />,
    },
    {
      id: 'verifications',
      label: 'Skill Verification Records',
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
    },
  ];

  const handleAddQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !newQText.trim() ||
      !opt0.trim() ||
      !opt1.trim() ||
      !opt2.trim() ||
      !opt3.trim()
    ) {
      onNotify(
        'Please provide the question text and all 4 options.',
        'warning'
      );
      return;
    }

    const created: AssessmentQuestion = {
      id: `q-${Date.now()}`,
      skill: newQSkill,
      difficulty: newQDifficulty,
      question: newQText.trim(),
      options: [opt0.trim(), opt1.trim(), opt2.trim(), opt3.trim()],
      correctOptionIndex: correctIdx,
      explanation:
        explanation.trim() ||
        'Verified engineering solution explanation provided by Placement Admin.',
    };

    onAddQuestion(created);
    setNewQText('');
    setOpt0('');
    setOpt1('');
    setOpt2('');
    setOpt3('');
    setExplanation('');
    onNotify(`Added new ${newQSkill} question to Assessment Bank!`, 'success');
  };

  const handleAddResourceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resTitle.trim() || !resUrl.trim()) {
      onNotify('Resource title and URL are required.', 'warning');
      return;
    }
    const created: LearningResource = {
      id: `res-${Date.now()}`,
      title: resTitle.trim(),
      skill: resSkill,
      provider: resProvider,
      difficulty: resDifficulty,
      description:
        resDesc.trim() ||
        `Curated ${resSkill} engineering reference on ${resProvider}.`,
      url: resUrl.trim(),
      estimatedMinutes: 45,
    };
    onAddResource(created);
    setResTitle('');
    setResDesc('');
    onNotify('Learning resource added to Student Library!', 'success');
  };

  const confirmDeletion = () => {
    if (!pendingDelete) return;
    const { type, id, label } = pendingDelete;
    if (type === 'student') onDeleteStudent(id);
    if (type === 'company') onDeleteCompany(id);
    if (type === 'opportunity') onDeleteOpportunity(id);
    if (type === 'question') onDeleteQuestion(id);
    if (type === 'resource') onDeleteResource(id);
    setPendingDelete(null);
    onNotify(`Deleted "${label}".`, 'info');
  };

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
            <div className="text-xs font-semibold text-white">
              Placement Cell Administrator
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Governance & Question Bank
            </div>
          </div>

          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-210px)]">
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
              Admin Governance Console{' '}
              <span className="text-[#64748B] font-normal">/</span>{' '}
              <span className="text-[#2563FF]">
                {navItems.find((n) => n.id === activeTab)?.label}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setActiveTab('questions')}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-lg cursor-pointer"
            >
              + Add Quiz Question
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
                    Platform Administration
                  </p>
                  <h1 className="text-2xl font-bold">
                    Hire Sphere Placement Cell Console
                  </h1>
                  <p className="text-xs text-slate-300 mt-1">
                    Monitor student verifications, manage company listings, and
                    curate the 8-domain technical assessment question bank.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('verifications')}
                  className="px-4 py-2.5 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-xl cursor-pointer self-start sm:self-auto"
                >
                  Audit Verification Records
                </button>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
                  <div className="text-xs text-[#64748B]">
                    Registered Students
                  </div>
                  <div className="text-2xl font-bold text-[#111827] tabular-nums mt-1">
                    {students.length}
                  </div>
                </div>
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
                  <div className="text-xs text-[#64748B]">
                    Partner Companies
                  </div>
                  <div className="text-2xl font-bold text-[#111827] tabular-nums mt-1">
                    {companies.length}
                  </div>
                </div>
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
                  <div className="text-xs text-[#64748B]">
                    Question Bank Items
                  </div>
                  <div className="text-2xl font-bold text-[#2563FF] tabular-nums mt-1">
                    {questions.length}
                  </div>
                </div>
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
                  <div className="text-xs text-[#64748B]">
                    Verified Skill Badges
                  </div>
                  <div className="text-2xl font-bold text-[#10B981] tabular-nums mt-1">
                    {verifications.filter((v) => v.verified).length}
                  </div>
                </div>
              </div>

              {/* Recent Verification Records */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
                <h2 className="text-base font-bold text-[#111827] mb-4">
                  Latest Skill Verification Records (≥80% Rule)
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-[#E2E8F0] text-[11px] font-semibold uppercase text-[#64748B]">
                        <th className="py-3 pr-4">Student</th>
                        <th className="py-3 px-4">Skill Domain</th>
                        <th className="py-3 px-4">Score</th>
                        <th className="py-3 px-4">Credential ID</th>
                        <th className="py-3 pl-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] text-xs">
                      {verifications.map((ver) => (
                        <tr key={ver.id}>
                          <td className="py-3 pr-4 font-bold text-[#111827]">
                            {ver.studentName}
                          </td>
                          <td className="py-3 px-4 text-[#111827]">
                            {ver.skill}
                          </td>
                          <td className="py-3 px-4 font-mono-tabular font-semibold">
                            {ver.scorePercentage}% ({ver.correctCount}/
                            {ver.totalQuestions})
                          </td>
                          <td className="py-3 px-4 font-mono-tabular text-[#64748B]">
                            {ver.credentialId || '—'}
                          </td>
                          <td className="py-3 pl-4 text-right">
                            {ver.verified ? (
                              <span className="text-[#10B981] font-semibold">
                                Verified (≥80%)
                              </span>
                            ) : (
                              <span className="text-amber-600 font-semibold">
                                Not Verified
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* MANAGE STUDENTS */}
          {activeTab === 'students' && (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="text-lg font-bold text-[#111827]">
                  Manage Student Records ({students.length})
                </h2>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students by name, college, or branch..."
                  className="px-3.5 py-2 text-xs bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg w-full sm:w-72"
                />
              </div>

              <div className="divide-y divide-[#E2E8F0]">
                {students
                  .filter(
                    (s) =>
                      !searchQuery.trim() ||
                      s.fullName
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase()) ||
                      s.college
                        .toLowerCase()
                        .includes(searchQuery.toLowerCase())
                  )
                  .map((stu) => (
                    <div
                      key={stu.id}
                      className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="text-sm font-bold text-[#111827]">
                          {stu.fullName}{' '}
                          <span className="text-xs font-normal text-[#64748B]">
                            ({stu.email})
                          </span>
                        </div>
                        <div className="text-xs text-[#64748B] mt-0.5">
                          {stu.college} · {stu.degree} {stu.branch} · CGPA{' '}
                          <strong className="font-mono-tabular text-[#111827]">
                            {stu.cgpa}
                          </strong>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setPendingDelete({
                            type: 'student',
                            id: stu.id,
                            label: stu.fullName,
                          })
                        }
                        className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer self-start sm:self-auto"
                      >
                        Remove Record
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* MANAGE COMPANIES */}
          {activeTab === 'companies' && (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-[#111827]">
                Manage Partner Companies ({companies.length})
              </h2>
              <div className="divide-y divide-[#E2E8F0]">
                {companies.map((comp) => (
                  <div
                    key={comp.id}
                    className="py-4 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="text-sm font-bold text-[#111827]">
                        {comp.name}
                      </div>
                      <div className="text-xs text-[#64748B]">
                        {comp.industry} · {comp.headquarters} ·{' '}
                        {comp.companySize}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setPendingDelete({
                          type: 'company',
                          id: comp.id,
                          label: comp.name,
                        })
                      }
                      className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* MANAGE JOBS & INTERNSHIPS */}
          {(activeTab === 'jobs' || activeTab === 'internships') && (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-[#111827]">
                Manage {activeTab === 'jobs' ? 'Job' : 'Internship'} Listings
              </h2>
              <div className="divide-y divide-[#E2E8F0]">
                {opportunities
                  .filter((o) =>
                    activeTab === 'jobs'
                      ? o.category === 'Job'
                      : o.category === 'Internship'
                  )
                  .map((opp) => (
                    <div
                      key={opp.id}
                      className="py-4 flex items-center justify-between gap-4"
                    >
                      <div>
                        <div className="text-sm font-bold text-[#111827]">
                          {opp.title}
                        </div>
                        <div className="text-xs text-[#64748B]">
                          {opp.companyName} · {opp.location} ·{' '}
                          <span className="font-mono-tabular text-[#111827] font-semibold">
                            {opp.compensation}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setPendingDelete({
                            type: 'opportunity',
                            id: opp.id,
                            label: opp.title,
                          })
                        }
                        className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ASSESSMENT QUESTION BANK */}
          {activeTab === 'questions' && (
            <div className="space-y-6">
              {/* Add Question Form */}
              <form
                onSubmit={handleAddQuestionSubmit}
                className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-4"
              >
                <h2 className="text-base font-bold text-[#111827]">
                  Add New Assessment Question
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1">
                      Technical Skill
                    </label>
                    <select
                      value={newQSkill}
                      onChange={(e) =>
                        setNewQSkill(e.target.value as SkillName)
                      }
                      className="w-full px-3 py-2 text-xs bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
                    >
                      {SKILLS_METADATA.map((s) => (
                        <option key={s.name} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1">
                      Difficulty Level
                    </label>
                    <select
                      value={newQDifficulty}
                      onChange={(e) =>
                        setNewQDifficulty(e.target.value as DifficultyLevel)
                      }
                      className="w-full px-3 py-2 text-xs bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#111827] mb-1">
                      Correct Option (1–4)
                    </label>
                    <select
                      value={correctIdx}
                      onChange={(e) => setCorrectIdx(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
                    >
                      <option value={0}>Option 1</option>
                      <option value={1}>Option 2</option>
                      <option value={2}>Option 3</option>
                      <option value={3}>Option 4</option>
                    </select>
                  </div>
                </div>

                <input
                  type="text"
                  value={newQText}
                  onChange={(e) => setNewQText(e.target.value)}
                  placeholder="Enter the multiple-choice technical question prompt..."
                  className="w-full px-3.5 py-2 text-xs bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={opt0}
                    onChange={(e) => setOpt0(e.target.value)}
                    placeholder="Option 1"
                    className="px-3 py-2 text-xs bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
                  />
                  <input
                    type="text"
                    value={opt1}
                    onChange={(e) => setOpt1(e.target.value)}
                    placeholder="Option 2"
                    className="px-3 py-2 text-xs bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
                  />
                  <input
                    type="text"
                    value={opt2}
                    onChange={(e) => setOpt2(e.target.value)}
                    placeholder="Option 3"
                    className="px-3 py-2 text-xs bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
                  />
                  <input
                    type="text"
                    value={opt3}
                    onChange={(e) => setOpt3(e.target.value)}
                    placeholder="Option 4"
                    className="px-3 py-2 text-xs bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
                  />
                </div>

                <input
                  type="text"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder="Technical explanation shown after student submits quiz..."
                  className="w-full px-3.5 py-2 text-xs bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
                />

                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-xl cursor-pointer"
                >
                  + Save Question to Bank
                </button>
              </form>

              {/* Existing Questions Filter & List */}
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-[#111827]">
                    Question Bank ({questions.length} Total Questions)
                  </h3>
                  <select
                    value={questionSkillFilter}
                    onChange={(e) => setQuestionSkillFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
                  >
                    <option value="All">All 8 Skills</option>
                    {SKILLS_METADATA.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  {questions
                    .filter(
                      (q) =>
                        questionSkillFilter === 'All' ||
                        q.skill === questionSkillFilter
                    )
                    .map((q) => (
                      <div
                        key={q.id}
                        className="p-4 rounded-xl bg-[#F4F7FC] border border-[#E2E8F0] flex items-start justify-between gap-4"
                      >
                        <div>
                          <div className="text-xs font-semibold text-[#2563FF]">
                            {q.skill} · {q.difficulty}
                          </div>
                          <div className="text-xs font-bold text-[#111827] mt-1">
                            {q.question}
                          </div>
                          <div className="text-[11px] text-[#10B981] font-medium mt-1">
                            Correct Answer: {q.options[q.correctOptionIndex]}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setPendingDelete({
                              type: 'question',
                              id: q.id,
                              label: q.question.slice(0, 32) + '...',
                            })
                          }
                          className="text-[#64748B] hover:text-red-600 cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* LEARNING RESOURCES */}
          {activeTab === 'resources' && (
            <div className="space-y-6">
              <form
                onSubmit={handleAddResourceSubmit}
                className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-4"
              >
                <h2 className="text-base font-bold text-[#111827]">
                  Add Curated Learning Resource
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <input
                    type="text"
                    value={resTitle}
                    onChange={(e) => setResTitle(e.target.value)}
                    placeholder="Resource Title"
                    className="px-3 py-2 text-xs bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
                  />
                  <select
                    value={resSkill}
                    onChange={(e) => setResSkill(e.target.value as SkillName)}
                    className="px-3 py-2 text-xs bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
                  >
                    {SKILLS_METADATA.map((s) => (
                      <option key={s.name} value={s.name}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={resProvider}
                    onChange={(e) =>
                      setResProvider(
                        e.target.value as LearningResource['provider']
                      )
                    }
                    className="px-3 py-2 text-xs bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
                  >
                    <option value="GeeksforGeeks">GeeksforGeeks</option>
                    <option value="HackerRank">HackerRank</option>
                    <option value="LeetCode">LeetCode</option>
                    <option value="MDN Web Docs">MDN Web Docs</option>
                    <option value="Official Java Docs">
                      Official Java Docs
                    </option>
                    <option value="Official Python Docs">
                      Official Python Docs
                    </option>
                  </select>
                </div>
                <input
                  type="url"
                  value={resUrl}
                  onChange={(e) => setResUrl(e.target.value)}
                  placeholder="External Resource URL (https://...)"
                  className="w-full px-3 py-2 text-xs bg-[#F4F7FC] border border-[#E2E8F0] rounded-lg"
                />
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#2563FF] rounded-lg cursor-pointer"
                >
                  + Add Resource
                </button>
              </form>

              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-3">
                <h3 className="text-base font-bold text-[#111827]">
                  Active Learning Resources ({resources.length})
                </h3>
                {resources.map((r) => (
                  <div
                    key={r.id}
                    className="p-3.5 rounded-xl bg-[#F4F7FC] border border-[#E2E8F0] flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="text-xs font-bold text-[#111827]">
                        {r.title}
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        {r.skill} · {r.provider} · {r.difficulty}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setPendingDelete({
                          type: 'resource',
                          id: r.id,
                          label: r.title,
                        })
                      }
                      className="text-[#64748B] hover:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* VERIFICATION RECORDS & REPORTS */}
          {(activeTab === 'verifications' || activeTab === 'reports') && (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-[#111827]">
                  Skill Verification Audit & Domain Distribution
                </h2>
                <p className="text-xs text-[#64748B]">
                  Complete ledger of student quiz attempts evaluated under the
                  ≥80% verification threshold
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {SKILLS_METADATA.map((s) => {
                  const count = verifications.filter(
                    (v) => v.skill === s.name && v.verified
                  ).length;
                  return (
                    <div
                      key={s.name}
                      className="p-3.5 rounded-xl bg-[#F4F7FC] border border-[#E2E8F0]"
                    >
                      <div className="text-xs font-bold text-[#111827] truncate">
                        {s.name}
                      </div>
                      <div className="text-lg font-bold text-[#2563FF] font-mono-tabular mt-1">
                        {count} Verified
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-bold text-[#111827]">
                Admin Platform Settings
              </h2>
              <p className="text-xs text-[#64748B]">
                Restore the initial fictional sample dataset at any time.
              </p>
              <button
                type="button"
                onClick={onResetDemoData}
                className="px-4 py-2 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer"
              >
                Reset All Demo Data to Factory Defaults
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Confirmation Dialog */}
      {pendingDelete && (
        <div className="fixed inset-0 z-50 bg-[#0B1220]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-[#111827]">
              Confirm Deletion
            </h3>
            <p className="text-xs text-[#64748B]">
              Are you sure you want to permanently remove{' '}
              <strong className="text-[#111827]">{pendingDelete.label}</strong>{' '}
              from the demo state?
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPendingDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-[#64748B] bg-[#F4F7FC] rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeletion}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
