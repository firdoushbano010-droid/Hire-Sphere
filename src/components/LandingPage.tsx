import React, { useState } from 'react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronDown,
  Code2,
  FileCheck2,
  GraduationCap,
  MapPin,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  UserCheck,
  Bookmark,
} from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import {
  OpportunityCategory,
  OpportunityListing,
  SkillMetadata,
  SkillName,
  StudentProfile,
  UserRole,
} from '../types';
import { SKILLS_METADATA } from '../data/mockData';

interface LandingPageProps {
  student: StudentProfile;
  resumeReadinessScore: number;
  opportunities: OpportunityListing[];
  savedOpportunityIds: string[];
  verifiedSkills: SkillName[];
  onToggleSaveOpportunity: (id: string) => void;
  onSelectRole: (role: UserRole, targetTab?: string, selectedSkill?: SkillName) => void;
  onOpenRoleModal: () => void;
  onQuickApply: (opportunity: OpportunityListing) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  student,
  resumeReadinessScore,
  opportunities,
  savedOpportunityIds,
  verifiedSkills,
  onToggleSaveOpportunity,
  onSelectRole,
  onOpenRoleModal,
  onQuickApply,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'All' | OpportunityCategory>('All');
  const [workModeFilter, setWorkModeFilter] = useState<string>('All');
  const [selectedOpportunityDetail, setSelectedOpportunityDetail] =
    useState<OpportunityListing | null>(null);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const filteredOpportunities = opportunities.filter((opp) => {
    const matchesCategory =
      categoryFilter === 'All' || opp.category === categoryFilter;
    const matchesMode =
      workModeFilter === 'All' || opp.workMode === workModeFilter;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      opp.title.toLowerCase().includes(q) ||
      opp.companyName.toLowerCase().includes(q) ||
      opp.location.toLowerCase().includes(q) ||
      opp.requiredSkills.some((s) => s.toLowerCase().includes(q));
    return matchesCategory && matchesMode && matchesQuery;
  });

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const faqs = [
    {
      question: 'How does the 80% Skill Verification threshold work?',
      answer:
        'Each technical assessment presents curated multiple-choice engineering problems covering core concepts, time complexity, and practical scenarios. Scoring 80% or higher automatically issues a Verified Skill badge with a credential ID on your student profile and resume.',
    },
    {
      question: 'Can I retake a skill assessment if I score below 80%?',
      answer:
        'Yes. If your score is below 80%, the results screen displays full question-by-question explanations and recommended learning resources from MDN, Official Java/Python Docs, GeeksforGeeks, and LeetCode so you can study and retake the quiz immediately.',
    },
    {
      question: 'How is the Resume Readiness Score calculated?',
      answer:
        'The prototype calculates a transparent, rule-based Demo Estimate out of 100 based on four concrete pillars: Academic & Portfolio Links (20 pts), Declared Technical Stack (25 pts), Verified Assessment Credentials (30 pts), and Projects & Internships (25 pts).',
    },
    {
      question: 'How can I explore the Student, Company, and Admin portals?',
      answer:
        'Click "Get Started", "Login", or any of the Demo Portal cards to switch roles instantaneously. All actions—such as posting a job as a Company, passing a quiz as a Student, or adding a question as an Admin—persist in browser storage.',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F7FC] text-[#111827]">
      {/* Top Bar Contract: 3 Zones separated by gap-8 */}
      <header className="sticky top-0 z-30 bg-[#0B1220]/95 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-6 py-4">
          {/* Zone 1: Single brand wordmark */}
          <BrandLogo
            theme="dark"
            size="md"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          />

          {/* Zone 2: Single-line navigation links */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-slate-300">
            <button
              type="button"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => {
                setCategoryFilter('Job');
                scrollToSection('opportunities-section');
              }}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Find Jobs
            </button>
            <button
              type="button"
              onClick={() => {
                setCategoryFilter('Internship');
                scrollToSection('opportunities-section');
              }}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Internships
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('verification-section')}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Skill Verification
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('about-section')}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              About Us
            </button>
            <button
              type="button"
              onClick={onOpenRoleModal}
              className="hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Login
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onOpenRoleModal}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section: Midnight Blue #0B1220 with subtle Electric Blue #2563FF gradient */}
      <section className="relative bg-[#0B1220] text-white overflow-hidden border-b border-white/10">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(circle at 80% 20%, rgba(37, 99, 255, 0.22) 0%, rgba(17, 28, 53, 0.4) 45%, rgba(11, 18, 32, 0) 75%)',
          }}
        />
        <div className="max-w-7xl mx-auto px-6 pt-14 pb-16 lg:pt-20 lg:pb-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
            {/* Left Column: Value Proposition & CTAs */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <p className="text-xs font-semibold tracking-wider text-[#2563FF] uppercase mb-4">
                  Engineering Career & Skill Verification Platform
                </p>
                <h1
                  className="text-4xl sm:text-5xl lg:text-[54px] font-bold tracking-tight text-white leading-[1.1] mb-6"
                  style={{ textWrap: 'balance' }}
                >
                  Your Skills. Your Future. Your Career.
                </h1>
                <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl mb-8">
                  Discover opportunities, verify your skills, strengthen your
                  resume, and connect with companies that value your potential.
                </p>

                <div className="flex flex-wrap items-center gap-4 mb-10">
                  <button
                    type="button"
                    onClick={() => scrollToSection('opportunities-section')}
                    className="px-6 py-3.5 text-sm font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-xl transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer shadow-sm"
                  >
                    <span>Explore Opportunities</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onSelectRole('student', 'overview')}
                    className="px-6 py-3.5 text-sm font-semibold text-white bg-[#111C35] hover:bg-slate-800 border border-white/15 rounded-xl transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Start Your Journey</span>
                  </button>
                </div>
              </div>

              {/* Direct Interactive Role Switcher Strip */}
              <div className="pt-6 border-t border-white/10">
                <p className="text-xs text-slate-400 mb-3">
                  Interactive Prototype — Launch any role dashboard directly:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => onSelectRole('student', 'overview')}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[#111C35] hover:bg-[#182646] border border-white/10 text-left transition-colors group cursor-pointer"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-[#2563FF] transition-colors">
                        Student Portal
                      </div>
                      <div className="text-xs text-slate-400">
                        {student.fullName} · {student.degree} ’{String(student.graduationYear).slice(-2)}
                      </div>
                    </div>
                    <GraduationCap className="w-4 h-4 text-[#2563FF] shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectRole('company', 'overview')}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[#111C35] hover:bg-[#182646] border border-white/10 text-left transition-colors group cursor-pointer"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-[#2563FF] transition-colors">
                        Company Portal
                      </div>
                      <div className="text-xs text-slate-400">
                        Nexus Cloud Systems
                      </div>
                    </div>
                    <Building2 className="w-4 h-4 text-[#2563FF] shrink-0" />
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectRole('admin', 'overview')}
                    className="flex items-center justify-between p-3.5 rounded-xl bg-[#111C35] hover:bg-[#182646] border border-white/10 text-left transition-colors group cursor-pointer"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white group-hover:text-[#2563FF] transition-colors">
                        Admin Console
                      </div>
                      <div className="text-xs text-slate-400">
                        Placement Cell Admin
                      </div>
                    </div>
                    <SlidersHorizontal className="w-4 h-4 text-[#2563FF] shrink-0" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Live Interactive Career Dashboard Preview Card */}
            <div className="lg:col-span-5 flex">
              <div className="w-full bg-[#111C35] border border-white/15 rounded-2xl p-6 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="flex items-center justify-between pb-4 mb-5 border-b border-white/10">
                    <div>
                      <div className="text-sm font-semibold text-white">
                        Candidate Readiness Preview
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {student.fullName} · {student.degree} {student.branch} · {student.college}
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#10B981]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Verified Profile</span>
                    </span>
                  </div>

                  {/* Key Metrics inside Preview */}
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <div className="bg-[#0B1220] border border-white/10 rounded-xl p-3.5">
                      <div className="text-xs text-slate-400">Resume Score</div>
                      <div className="text-xl font-bold text-white tabular-nums mt-1">
                        {resumeReadinessScore}%
                      </div>
                      <div className="text-[11px] text-[#10B981] mt-0.5">
                        Demo Estimate
                      </div>
                    </div>
                    <div className="bg-[#0B1220] border border-white/10 rounded-xl p-3.5">
                      <div className="text-xs text-slate-400">Verified Skills</div>
                      <div className="text-xl font-bold text-white tabular-nums mt-1">
                        {verifiedSkills.length} / 8
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        ≥80% Standard
                      </div>
                    </div>
                    <div className="bg-[#0B1220] border border-white/10 rounded-xl p-3.5">
                      <div className="text-xs text-slate-400">CGPA</div>
                      <div className="text-xl font-bold text-white tabular-nums mt-1">
                        {student.cgpa}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {student.graduationYear} Batch
                      </div>
                    </div>
                  </div>

                  {/* Verified Skill Credentials List */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-xs text-slate-300 mb-2.5">
                      <span>Verified Technical Credentials (≥80% Rule)</span>
                      <button
                        type="button"
                        onClick={() => onSelectRole('student', 'assessments')}
                        className="text-[#2563FF] hover:underline font-medium cursor-pointer"
                      >
                        Take Quiz →
                      </button>
                    </div>
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B1220] border border-white/10">
                        <div className="flex items-center gap-2.5">
                          <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
                          <div>
                            <div className="text-xs font-semibold text-white">
                              Java (JVM & Collections)
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Credential ID: HS-VER-JAVA-9042
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-mono-tabular font-semibold text-[#10B981]">
                          100% · Verified
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-3 rounded-xl bg-[#0B1220] border border-white/10">
                        <div className="flex items-center gap-2.5">
                          <ShieldCheck className="w-4 h-4 text-[#10B981] shrink-0" />
                          <div>
                            <div className="text-xs font-semibold text-white">
                              SQL (Joins & Window Functions)
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Credential ID: HS-VER-SQL-7731
                            </div>
                          </div>
                        </div>
                        <span className="text-xs font-mono-tabular font-semibold text-[#10B981]">
                          80% · Verified
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Action inside Preview */}
                <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-4">
                  <div className="text-xs text-slate-300">
                    Ready to test your engineering fundamentals?
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectRole('student', 'assessments')}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Start Assessment
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Full-Width 4-Column Platform Statistics Strip (Clearly Labeled Demo Data) */}
          <div className="mt-12 pt-8 border-t border-white/10">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-slate-400">
                Platform Benchmark Metrics (Fictional Sample Dataset for Demonstration)
              </span>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-[#111C35]/90 border border-white/10 rounded-xl p-5">
                <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
                  {opportunities.length} Active
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Curated Engineering Jobs & Internships
                </div>
              </div>
              <div className="bg-[#111C35]/90 border border-white/10 rounded-xl p-5">
                <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
                  8 Core Domains
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Java · DSA · DBMS · SQL · Python · Web
                </div>
              </div>
              <div className="bg-[#111C35]/90 border border-white/10 rounded-xl p-5">
                <div className="text-2xl sm:text-3xl font-bold text-[#10B981] tabular-nums">
                  80% Score Rule
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Automated Skill Verification Standard
                </div>
              </div>
              <div className="bg-[#111C35]/90 border border-white/10 rounded-xl p-5">
                <div className="text-2xl sm:text-3xl font-bold text-white tabular-nums">
                  3 Portals
                </div>
                <div className="text-xs text-slate-300 mt-1">
                  Student · Recruiter · Placement Admin
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Jobs & Internships Discovery Portal */}
      <section id="opportunities-section" className="py-16 lg:py-20 max-w-7xl mx-auto px-6 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#2563FF] mb-2">
              Opportunity Discovery Portal (Fictional Sample Listings)
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111827]">
              Featured Engineering Jobs & Internships
            </h2>
          </div>

          {/* Interactive Segmented Filter Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 p-1 bg-white border border-[#E2E8F0] rounded-xl">
              {(['All', 'Job', 'Internship'] as const).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    categoryFilter === cat
                      ? 'bg-[#2563FF] text-white'
                      : 'text-[#64748B] hover:text-[#111827]'
                  }`}
                >
                  {cat === 'All' ? 'All Roles' : `${cat}s`}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-1 p-1 bg-white border border-[#E2E8F0] rounded-xl">
              {(['All', 'Hybrid', 'Remote', 'On-Site'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setWorkModeFilter(mode)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    workModeFilter === mode
                      ? 'bg-[#0B1220] text-white'
                      : 'text-[#64748B] hover:text-[#111827]'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Search Input Bar */}
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-3 mb-8 flex flex-col sm:flex-row items-center gap-3 shadow-xs">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by role (e.g. Java Developer, Data Analyst, Intern), company, or skill (SQL, Python)..."
              className="w-full pl-10 pr-4 py-2.5 text-sm text-[#111827] placeholder-[#64748B] bg-transparent focus:outline-none"
            />
          </div>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="px-3 py-1.5 text-xs font-medium text-[#64748B] hover:text-[#111827] cursor-pointer"
            >
              Clear
            </button>
          )}
          <div className="text-xs text-[#64748B] px-3 tabular-nums whitespace-nowrap">
            Showing {filteredOpportunities.length} of {opportunities.length} roles
          </div>
        </div>

        {/* Opportunity Cards Grid */}
        {filteredOpportunities.length === 0 ? (
          <div className="bg-white border border-[#E2E8F0] rounded-xl p-12 text-center">
            <p className="text-base font-semibold text-[#111827] mb-1">
              No matching opportunities found
            </p>
            <p className="text-sm text-[#64748B] mb-4">
              Try clearing your search filter or switching between Jobs and Internships.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('All');
                setWorkModeFilter('All');
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-lg transition-colors cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOpportunities.map((opp) => {
              const isSaved = savedOpportunityIds.includes(opp.id);
              return (
                <div
                  key={opp.id}
                  className="bg-white border border-[#E2E8F0] hover:border-[#2563FF]/50 rounded-xl p-6 flex flex-col justify-between transition-all shadow-xs"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#0B1220] text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {opp.companyMonogram}
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-[#111827] leading-snug">
                            {opp.title}
                          </h3>
                          <p className="text-xs text-[#64748B] mt-0.5">
                            {opp.companyName}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onToggleSaveOpportunity(opp.id)}
                        title={isSaved ? 'Remove from Saved Jobs' : 'Save Opportunity'}
                        className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                          isSaved
                            ? 'border-[#2563FF] bg-[#2563FF]/10 text-[#2563FF]'
                            : 'border-[#E2E8F0] text-[#64748B] hover:text-[#111827]'
                        }`}
                      >
                        <Bookmark className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Unboxed Clean Metadata with Typographic Separators */}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-[#64748B] mb-3">
                      <span className="font-semibold text-[#2563FF]">
                        {opp.category}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>{opp.workMode}</span>
                      <span aria-hidden="true">·</span>
                      <span>{opp.location}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs pb-3 mb-3 border-b border-[#E2E8F0]">
                      <span className="font-mono-tabular font-semibold text-[#111827]">
                        {opp.compensation}
                      </span>
                      <span className="text-[#64748B] tabular-nums">
                        Apply by {opp.deadline}
                      </span>
                    </div>

                    <p className="text-xs text-[#64748B] line-clamp-2 mb-4 leading-relaxed">
                      {opp.description}
                    </p>

                    <div className="text-xs text-[#111827] mb-5">
                      <span className="text-[#64748B]">Required Skills: </span>
                      <span className="font-medium">
                        {opp.requiredSkills.join(' · ')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 pt-3 border-t border-[#E2E8F0]">
                    <button
                      type="button"
                      onClick={() => setSelectedOpportunityDetail(opp)}
                      className="flex-1 px-3.5 py-2 text-xs font-semibold text-[#111827] bg-[#F4F7FC] hover:bg-[#E2E8F0]/70 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                    >
                      View Details
                    </button>
                    <button
                      type="button"
                      onClick={() => onQuickApply(opp)}
                      className="flex-1 px-3.5 py-2 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                    >
                      Apply Now
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Skill Verification & 80% Standard Section */}
      <section
        id="verification-section"
        className="py-16 lg:py-20 bg-[#0B1220] text-white border-y border-white/10"
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#2563FF] mb-2">
                Verified Competency Engine
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Prove Your Engineering Fundamentals with the 80% Rule
              </h2>
              <p className="text-sm text-slate-300 mt-2 max-w-2xl">
                Select any of the 8 core technical subjects below to review learning
                resources or launch an interactive assessment. Score 80% or higher to
                earn a Verified Green badge on your student profile.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onSelectRole('student', 'assessments')}
              className="px-5 py-2.5 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer self-start lg:self-auto"
            >
              Open Full Assessment Center →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {SKILLS_METADATA.map((skill: SkillMetadata) => {
              const isVerified = verifiedSkills.includes(skill.name);
              return (
                <div
                  key={skill.name}
                  className="bg-[#111C35] border border-white/10 rounded-xl p-5 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-mono-tabular text-slate-400">
                        {skill.shortCode} · {skill.difficulty}
                      </span>
                      {isVerified ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#10B981]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Verified</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">
                          Pass ≥ 80%
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-white mb-2">
                      {skill.name}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed mb-4">
                      {skill.description}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 tabular-nums">
                      5 MCQs · {skill.durationMinutes} mins
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        onSelectRole('student', 'assessments', skill.name)
                      }
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-lg transition-colors cursor-pointer"
                    >
                      {isVerified ? 'Retake Quiz' : 'Start Quiz'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works & Resume Improvement Section */}
      <section id="about-section" className="py-16 lg:py-20 max-w-7xl mx-auto px-6 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left 7 Cols: How It Works Numbered Steps */}
          <div className="lg:col-span-7">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#2563FF] mb-2">
              How Hire Sphere Works
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111827] mb-6">
              From Engineering Classroom to Verified Placement
            </h2>

            <div className="space-y-4">
              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
                <div className="text-xs font-mono-tabular font-semibold text-[#2563FF] mb-1">
                  01. Profile & Resume Readiness Analysis
                </div>
                <h3 className="text-base font-bold text-[#111827] mb-1.5">
                  Structure Your Academic & Technical Portfolio
                </h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  Maintain your CGPA, engineering branch, GitHub projects, and resume
                  in one structured profile. Receive a transparent readiness breakdown
                  and identify missing skills for your target roles.
                </p>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
                <div className="text-xs font-mono-tabular font-semibold text-[#2563FF] mb-1">
                  02. Curated Study & 80% Skill Verification
                </div>
                <h3 className="text-base font-bold text-[#111827] mb-1.5">
                  Study Trusted Docs & Earn Verified Green Badges
                </h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  Prepare with direct links to GeeksforGeeks, HackerRank, LeetCode,
                  MDN Web Docs, and Official Java/Python documentation. Score 80% or
                  higher on timed assessments to unlock verified credentials.
                </p>
              </div>

              <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
                <div className="text-xs font-mono-tabular font-semibold text-[#2563FF] mb-1">
                  03. Direct Recruiter Shortlisting
                </div>
                <h3 className="text-base font-bold text-[#111827] mb-1.5">
                  Apply to Roles with Verified Proof of Competency
                </h3>
                <p className="text-sm text-[#64748B] leading-relaxed">
                  When you apply to a job or internship, your verified skill scores
                  attach automatically to your application—helping engineering
                  recruiters shortlist you faster.
                </p>
              </div>
            </div>
          </div>

          {/* Right 5 Cols: Resume Improvement & Benefits Card */}
          <div className="lg:col-span-5 bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-[#E2E8F0]">
              <div>
                <h3 className="text-lg font-bold text-[#111827]">
                  Resume Readiness & Skill Gap Engine
                </h3>
                <p className="text-xs text-[#64748B] mt-0.5">
                  Rule-Based Demo Estimate · Interactive Student Feature
                </p>
              </div>
              <FileCheck2 className="w-6 h-6 text-[#2563FF] shrink-0" />
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-[#111827]">
                    Verified Assessment Credentials (≥80%)
                  </span>
                  <span className="font-mono-tabular text-[#2563FF]">30 / 30 pts</span>
                </div>
                <div className="w-full h-2 bg-[#F4F7FC] rounded-full overflow-hidden">
                  <div className="h-full bg-[#2563FF] w-full rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-[#111827]">
                    Engineering Projects & Internships
                  </span>
                  <span className="font-mono-tabular text-[#2563FF]">25 / 25 pts</span>
                </div>
                <div className="w-full h-2 bg-[#F4F7FC] rounded-full overflow-hidden">
                  <div className="h-full bg-[#2563FF] w-full rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-medium mb-1">
                  <span className="text-[#111827]">
                    Declared Technical Stack Coverage
                  </span>
                  <span className="font-mono-tabular text-[#10B981]">25 / 25 pts</span>
                </div>
                <div className="w-full h-2 bg-[#F4F7FC] rounded-full overflow-hidden">
                  <div className="h-full bg-[#10B981] w-full rounded-full" />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#F4F7FC] border border-[#E2E8F0] mb-6">
              <div className="text-xs font-semibold text-[#111827] mb-1">
                Built for Students, Recruiters & Placement Cells
              </div>
              <p className="text-xs text-[#64748B] leading-relaxed">
                Students gain actionable feedback on missing skills; recruiters filter
                applicants by verified assessment scores; placement admins manage the
                question bank and verification records.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => onSelectRole('student', 'resume')}
                className="flex-1 px-4 py-2.5 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-xl transition-colors cursor-pointer"
              >
                Inspect Resume Analyzer
              </button>
              <button
                type="button"
                onClick={() => onSelectRole('company', 'overview')}
                className="flex-1 px-4 py-2.5 text-xs font-semibold text-[#111827] bg-[#F4F7FC] hover:bg-[#E2E8F0] rounded-xl transition-colors cursor-pointer"
              >
                Explore Recruiter View
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Student Testimonials (Fictional Demo Profiles) */}
      <section className="py-16 bg-white border-y border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10">
            <p className="text-xs font-semibold uppercase tracking-wider text-[#2563FF] mb-2">
              Student Outcomes (Fictional Demo Profiles)
            </p>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#111827]">
              How Verified Skills Accelerate Engineering Placements
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#F4F7FC] border border-[#E2E8F0] rounded-xl p-6 flex flex-col justify-between">
              <p className="text-sm text-[#111827] leading-relaxed mb-6">
                “Completing the Java and SQL assessments with a 90%+ score gave
                recruiters immediate confidence in my backend fundamentals before the
                technical interview even began.”
              </p>
              <div className="pt-4 border-t border-[#E2E8F0]">
                <div className="text-sm font-bold text-[#111827]">
                  {student.fullName} (Student Profile)
                </div>
                <div className="text-xs text-[#64748B] mt-0.5">
                  {student.degree} {student.branch} · {student.college} · Shortlisted at Nexus Cloud Systems
                </div>
              </div>
            </div>

            <div className="bg-[#F4F7FC] border border-[#E2E8F0] rounded-xl p-6 flex flex-col justify-between">
              <p className="text-sm text-[#111827] leading-relaxed mb-6">
                “The Resume Readiness analyzer pointed out that I lacked verified CSS
                Grid and JavaScript async credentials. After studying the linked MDN
                guides, I passed both quizzes on my second attempt.”
              </p>
              <div className="pt-4 border-t border-[#E2E8F0]">
                <div className="text-sm font-bold text-[#111827]">
                  Diya Nair (Demo Profile)
                </div>
                <div className="text-xs text-[#64748B] mt-0.5">
                  B.Tech IT · VIT University · Frontend Developer Offer
                </div>
              </div>
            </div>

            <div className="bg-[#F4F7FC] border border-[#E2E8F0] rounded-xl p-6 flex flex-col justify-between">
              <p className="text-sm text-[#111827] leading-relaxed mb-6">
                “Having curated LeetCode, HackerRank, and GeeksforGeeks tracks mapped
                directly to DBMS and DSA assessments saved me weeks of scattered
                placement preparation.”
              </p>
              <div className="pt-4 border-t border-[#E2E8F0]">
                <div className="text-sm font-bold text-[#111827]">
                  Rohan Deshmukh (Demo Profile)
                </div>
                <div className="text-xs text-[#64748B] mt-0.5">
                  B.Tech Computer Engg · COEP Pune · Data Analytics Track
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-16 max-w-4xl mx-auto px-6 w-full">
        <div className="text-center mb-10">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#2563FF] mb-2">
            Platform Guide & FAQ
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-[#111827]">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={faq.question}
                className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left font-semibold text-sm text-[#111827] hover:bg-[#F4F7FC]/60 transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#64748B] shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-[#64748B] leading-relaxed border-t border-[#E2E8F0] pt-3">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0B1220] text-slate-400 border-t border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-white/10">
            <div className="md:col-span-2">
              <BrandLogo theme="dark" size="md" />
              <p className="text-xs text-slate-400 mt-3 max-w-md leading-relaxed">
                HIRE SPHERE — “Your Skills. Your Future. Your Career.” An interactive
                engineering placement, skill verification, and recruitment web
                application prototype.
              </p>
            </div>

            <div>
              <div className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
                Role Dashboards
              </div>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => onSelectRole('student', 'overview')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Student Dashboard
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onSelectRole('company', 'overview')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Company Recruiter Portal
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onSelectRole('admin', 'overview')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Placement Admin Console
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
                Student Modules
              </div>
              <ul className="space-y-2 text-xs">
                <li>
                  <button
                    type="button"
                    onClick={() => onSelectRole('student', 'assessments')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Skill Assessments (80% Rule)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onSelectRole('student', 'resume')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Resume Readiness Analyzer
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => onSelectRole('student', 'resources')}
                    className="hover:text-white transition-colors cursor-pointer"
                  >
                    Learning Resource Library
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              © {new Date().getFullYear()} HIRE SPHERE. All sample listings, profiles,
              and scores are fictional demonstration data.
            </div>
            <div>Midnight Blue #0B1220 · Electric Blue #2563FF</div>
          </div>
        </div>
      </footer>

      {/* Opportunity Details Modal */}
      {selectedOpportunityDetail && (
        <div className="fixed inset-0 z-50 bg-[#0B1220]/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl max-w-2xl w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-start justify-between gap-4 pb-4 mb-5 border-b border-[#E2E8F0]">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-xl bg-[#0B1220] text-white font-bold text-sm flex items-center justify-center shrink-0">
                  {selectedOpportunityDetail.companyMonogram}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#111827]">
                    {selectedOpportunityDetail.title}
                  </h3>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    {selectedOpportunityDetail.companyName} ·{' '}
                    {selectedOpportunityDetail.location} ({selectedOpportunityDetail.workMode})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOpportunityDetail(null)}
                className="text-xs font-semibold text-[#64748B] hover:text-[#111827] px-2.5 py-1 rounded-lg border border-[#E2E8F0] cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              <div className="p-3 rounded-xl bg-[#F4F7FC] border border-[#E2E8F0]">
                <div className="text-[11px] text-[#64748B]">Compensation</div>
                <div className="text-sm font-bold text-[#111827] font-mono-tabular mt-0.5">
                  {selectedOpportunityDetail.compensation}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#F4F7FC] border border-[#E2E8F0]">
                <div className="text-[11px] text-[#64748B]">Opportunity Type</div>
                <div className="text-sm font-bold text-[#2563FF] mt-0.5">
                  {selectedOpportunityDetail.category} ({selectedOpportunityDetail.workMode})
                </div>
              </div>
              <div className="p-3 rounded-xl bg-[#F4F7FC] border border-[#E2E8F0]">
                <div className="text-[11px] text-[#64748B]">Application Deadline</div>
                <div className="text-sm font-bold text-[#111827] tabular-nums mt-0.5">
                  {selectedOpportunityDetail.deadline}
                </div>
              </div>
            </div>

            <div className="space-y-4 text-sm text-[#111827] mb-6">
              <div>
                <h4 className="font-semibold text-xs uppercase tracking-wider text-[#64748B] mb-1">
                  Role Overview
                </h4>
                <p className="text-[#111827] leading-relaxed">
                  {selectedOpportunityDetail.description}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-xs uppercase tracking-wider text-[#64748B] mb-1">
                  Eligibility Criteria
                </h4>
                <p className="text-[#111827]">
                  {selectedOpportunityDetail.eligibilityCriteria}
                </p>
              </div>

              <div>
                <h4 className="font-semibold text-xs uppercase tracking-wider text-[#64748B] mb-1.5">
                  Key Responsibilities
                </h4>
                <ul className="list-disc list-inside space-y-1 text-[#64748B]">
                  {selectedOpportunityDetail.responsibilities.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-xs uppercase tracking-wider text-[#64748B] mb-1.5">
                  Required Technical Skills
                </h4>
                <p className="font-medium text-[#111827]">
                  {selectedOpportunityDetail.requiredSkills.join(' · ')}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() =>
                  onToggleSaveOpportunity(selectedOpportunityDetail.id)
                }
                className="px-4 py-2.5 text-xs font-semibold text-[#111827] bg-[#F4F7FC] hover:bg-[#E2E8F0] rounded-xl transition-colors cursor-pointer"
              >
                {savedOpportunityIds.includes(selectedOpportunityDetail.id)
                  ? 'Saved in Bookmarks'
                  : 'Save Opportunity'}
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = selectedOpportunityDetail;
                  setSelectedOpportunityDetail(null);
                  onQuickApply(target);
                }}
                className="px-5 py-2.5 text-xs font-semibold text-white bg-[#2563FF] hover:bg-[#1D4ED8] rounded-xl transition-colors cursor-pointer"
              >
                Apply Now as Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
