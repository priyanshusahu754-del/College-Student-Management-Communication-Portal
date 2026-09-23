import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  GraduationCap, 
  ShieldCheck, 
  UserCheck, 
  BookOpen, 
  Award, 
  Bell, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Sparkles,
  ChevronRight,
  Database,
  Cpu,
  Lock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LandingPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('student');

  const roleFeatures = {
    student: [
      "Real-time attendance percentage tracking with 75% eligibility warnings",
      "Digital assignment submission with file upload & teacher grading view",
      "Official semester grade cards & CGPA breakdown",
      "Direct download of verified lecture notes & study materials",
      "Event registration and campus hackathon participation",
    ],
    teacher: [
      "Rapid one-click attendance recording with Present/Absent/Late statuses",
      "Assignment publishing with deadline policies and grading rubrics",
      "Student submission review drawer with inline feedback and marks entry",
      "Course-wise study material repository management",
      "Internal assessment and semester result spreadsheet-like entry",
    ],
    admin: [
      "Centralized user lifecycle management (Students, Faculty, Staff)",
      "Department, course, semester, and curriculum configuration",
      "System-wide analytics: enrollment stats, attendance trends, submission rates",
      "Targeted notice publishing with priority badges (Urgent, High, General)",
      "Security audit logs capturing administrative actions with sanitized metadata",
    ]
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-white flex items-center gap-1.5">
                CampusConnect <span className="text-xs bg-indigo-500/20 text-indigo-400 font-semibold px-2 py-0.5 rounded-full border border-indigo-500/30">ERP 2.0</span>
              </span>
              <p className="text-xs text-slate-400 font-medium">College Student Management & Communication Portal</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <button
                onClick={() => navigate(`/${user?.role}/dashboard`)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2"
              >
                <span>Portal Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        {/* Glow gradients */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[300px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs font-medium text-indigo-300 mb-8 shadow-inner">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>B.Tech Final Year Capstone Project · Production Ready</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.15] max-w-5xl mx-auto">
            Centralized Academic ERP & <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Campus Communication</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto font-normal leading-relaxed">
            A unified digital ecosystem bridging Students, Faculty, and Administrators. Real-time attendance, assignments, examinations, study materials, circulars, and events in one high-performance platform.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-base shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center space-x-3"
            >
              <span>Launch Live Portal</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a
              href="#demo-credentials"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-800/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-base transition-all flex items-center justify-center space-x-2"
            >
              <span>Demo Login Credentials</span>
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-sm">
              <p className="text-2xl font-bold text-white">3 Distinct</p>
              <p className="text-xs text-slate-400 mt-1">Role-Based Dashboards</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-sm">
              <p className="text-2xl font-bold text-indigo-400">100% Turnkey</p>
              <p className="text-xs text-slate-400 mt-1">Zero-Config Local & Cloud</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-sm">
              <p className="text-2xl font-bold text-emerald-400">RESTful API</p>
              <p className="text-xs text-slate-400 mt-1">Flask 3.x + JWT Extended</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-sm">
              <p className="text-2xl font-bold text-purple-400">Relational DB</p>
              <p className="text-xs text-slate-400 mt-1">MySQL 8+ / SQLAlchemy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Role-Based Showcase Section */}
      <section className="py-20 bg-slate-950/60 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-400 mb-2">Tailored Experiences</h2>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">Engineered for Every Campus Role</p>
            <p className="text-slate-400 text-sm mt-3">CampusConnect enforces rigorous server-side authorization ensuring each user operates strictly within their academic domain.</p>
          </div>

          {/* Role Tabs */}
          <div className="flex justify-center mb-8">
            <div className="p-1.5 bg-slate-800/80 rounded-2xl border border-slate-700/80 inline-flex space-x-1">
              {[
                { id: 'student', label: '🎓 Student Portal' },
                { id: 'teacher', label: '👨‍🏫 Teacher Portal' },
                { id: 'admin', label: '👑 Admin ERP' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Role Tab Content */}
          <div className="max-w-4xl mx-auto bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-xl font-bold text-white mb-4 capitalize">
                  {activeTab} Capabilities & Workflows
                </h3>
                <div className="space-y-3">
                  {roleFeatures[activeTab].map((feat, idx) => (
                    <div key={idx} className="flex items-start space-x-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-300 leading-relaxed">{feat}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-8">
                  <Link
                    to="/login"
                    className="inline-flex items-center space-x-2 text-sm font-semibold text-indigo-400 hover:text-indigo-300"
                  >
                    <span>Sign in as {activeTab}</span>
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Visual Card Representation */}
              <div className="p-6 bg-slate-800/60 rounded-2xl border border-slate-700/80 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-700">
                  <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Active Workspace</span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full">LIVE</span>
                </div>
                <div className="space-y-2">
                  <div className="h-10 bg-slate-700/50 rounded-xl flex items-center px-4 justify-between">
                    <span className="text-xs text-slate-300">Access Scope</span>
                    <span className="text-xs font-bold text-white capitalize">{activeTab} Privileges</span>
                  </div>
                  <div className="h-10 bg-slate-700/50 rounded-xl flex items-center px-4 justify-between">
                    <span className="text-xs text-slate-300">Authentication</span>
                    <span className="text-xs font-bold text-emerald-400">JWT Bearer Token</span>
                  </div>
                  <div className="h-10 bg-slate-700/50 rounded-xl flex items-center px-4 justify-between">
                    <span className="text-xs text-slate-300">Server Validation</span>
                    <span className="text-xs font-bold text-indigo-300">RBAC Decorator Guard</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Credentials Section (For Viva & Evaluation) */}
      <section id="demo-credentials" className="py-20 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">Live Demonstration Access</h2>
            <p className="text-3xl font-extrabold text-white">Pre-Loaded Academic Test Accounts</p>
            <p className="text-slate-400 text-sm mt-2">Use any of these credentials or test the 1-click credential selector on the login screen.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {/* Admin Card */}
            <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/80 hover:border-rose-500/50 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">👑</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-500/20 text-rose-300 px-2.5 py-1 rounded-full border border-rose-500/30">
                    Administrator
                  </span>
                </div>
                <h4 className="font-bold text-white text-base">Dr. Rajeshwar Sharma</h4>
                <p className="text-xs text-slate-400 mt-0.5">Dean of Academic Affairs</p>
                <div className="mt-4 p-3 bg-slate-900/80 rounded-xl font-mono text-xs text-slate-300 space-y-1">
                  <p><span className="text-slate-500">Email:</span> admin@campusconnect.edu</p>
                  <p><span className="text-slate-500">Pass:</span> Admin@123</p>
                </div>
              </div>
              <Link
                to="/login"
                className="mt-6 w-full py-2.5 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-xl text-xs font-bold text-center border border-rose-500/30 transition-all"
              >
                Sign In as Admin
              </Link>
            </div>

            {/* Teacher Card */}
            <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/80 hover:border-indigo-500/50 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">👨‍🏫</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 px-2.5 py-1 rounded-full border border-indigo-500/30">
                    Faculty / HOD
                  </span>
                </div>
                <h4 className="font-bold text-white text-base">Prof. Vikram Sharma</h4>
                <p className="text-xs text-slate-400 mt-0.5">HOD - Computer Science</p>
                <div className="mt-4 p-3 bg-slate-900/80 rounded-xl font-mono text-xs text-slate-300 space-y-1">
                  <p><span className="text-slate-500">Email:</span> sharma.cs@campusconnect.edu</p>
                  <p><span className="text-slate-500">Pass:</span> Teacher@123</p>
                </div>
              </div>
              <Link
                to="/login"
                className="mt-6 w-full py-2.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-xl text-xs font-bold text-center border border-indigo-500/30 transition-all"
              >
                Sign In as Faculty
              </Link>
            </div>

            {/* Student Card */}
            <div className="p-6 rounded-2xl bg-slate-800/70 border border-slate-700/80 hover:border-emerald-500/50 transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl">🎓</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-500/30">
                    Undergraduate
                  </span>
                </div>
                <h4 className="font-bold text-white text-base">Rahul Sharma</h4>
                <p className="text-xs text-slate-400 mt-0.5">B.Tech CSE - 5th Semester</p>
                <div className="mt-4 p-3 bg-slate-900/80 rounded-xl font-mono text-xs text-slate-300 space-y-1">
                  <p><span className="text-slate-500">Email:</span> rahul.sharma@campusconnect.edu</p>
                  <p><span className="text-slate-500">Pass:</span> Student@123</p>
                </div>
              </div>
              <Link
                to="/login"
                className="mt-6 w-full py-2.5 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-300 hover:text-white rounded-xl text-xs font-bold text-center border border-emerald-500/30 transition-all"
              >
                Sign In as Student
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <GraduationCap className="w-5 h-5" />
            </div>
            <span className="font-bold text-white text-sm">CampusConnect Portal</span>
          </div>
          <p className="text-xs text-slate-500">
            © 2025 CampusConnect. B.Tech Final Year Capstone Project. Built with Flask, React, and MySQL.
          </p>
        </div>
      </footer>
    </div>
  );
};
