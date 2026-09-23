// React aur state hooks import kar rahe hain
import React, { useState, useEffect } from 'react';
// Navigation aur query param read karne ke hooks
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
// UI Icons import kar rahe hain
import { GraduationCap, Lock, Mail, ArrowRight, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';
// Authentication custom hook
import { useAuth } from '../../context/AuthContext';
// Alert banner notification component
import { AlertBanner } from '../../components/common/AlertBanner';

// Login Page Component: Authenticated entry portal for Admin, Teacher, and Student
export const LoginPage = () => {
  // Form fields ke local state hooks
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  // URL search params read karne ke liye
  const [searchParams] = useSearchParams();
  // Auth context se login method aur user status le rahe hain
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Agar URL me '?expired=1' parameter aaye toh error banner display karte hain
  useEffect(() => {
    if (searchParams.get('expired')) {
      setError('Your session has expired. Please log in again.');
    }
  }, [searchParams]);

  // Agar user pehle se login ho chuka hai toh use uske role-specific dashboard par redirect kar dete hain
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(`/${user.role}/dashboard`, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Login form submit handler function
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Backend login endpoint call kar rahe hain
      const loggedUser = await login(email, password);
      // Role ke anusar dashboard redirect (e.g. /student/dashboard)
      navigate(`/${loggedUser.role}/dashboard`, { replace: true });
    } catch (err) {
      // Error message display kar rahe hain
      setError(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  // Viva demonstration ke liye 1-Click quick fill demo credentials function
  const setDemoCredentials = (role) => {
    if (role === 'admin') {
      setEmail('admin@campusconnect.edu');
      setPassword('Admin@123');
    } else if (role === 'teacher') {
      setEmail('sharma.cs@campusconnect.edu');
      setPassword('Teacher@123');
    } else if (role === 'student') {
      setEmail('rahul.sharma@campusconnect.edu');
      setPassword('Student@123');
    }
  };

  // JSX Layout render kar rahe hain
  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glowing gradients */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header section with brand logo */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center z-10">
        <Link to="/" className="inline-flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <GraduationCap className="w-7 h-7" />
          </div>
          <span className="text-2xl font-extrabold text-white tracking-tight">CampusConnect</span>
        </Link>
        <h2 className="text-2xl font-bold text-white tracking-tight">Sign in to your portal</h2>
        <p className="mt-1.5 text-xs text-slate-400">
          Enter your academic credentials or use the demo quick-fill buttons below
        </p>
      </div>

      {/* Main Glassmorphic Login Card */}
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10">
        <div className="bg-slate-800/90 border border-slate-700/80 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-3xl sm:px-10">
          
          {/* 1-Click Demo Credentials Filler Buttons for Examiners / Evaluators */}
          <div className="mb-6 p-4 rounded-2xl bg-slate-900/80 border border-slate-700/70">
            <div className="flex items-center space-x-1.5 text-xs font-semibold text-indigo-300 mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>1-Click Demo Logins (for Viva & Evaluation)</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setDemoCredentials('admin')}
                className="px-2.5 py-2 text-xs font-medium bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30 rounded-xl transition-all"
              >
                👑 Admin
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('teacher')}
                className="px-2.5 py-2 text-xs font-medium bg-indigo-500/15 text-indigo-300 hover:bg-indigo-500/25 border border-indigo-500/30 rounded-xl transition-all"
              >
                👨‍🏫 Faculty
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('student')}
                className="px-2.5 py-2 text-xs font-medium bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25 border border-emerald-500/30 rounded-xl transition-all"
              >
                🎓 Student
              </button>
            </div>
          </div>

          {/* Error Banner display */}
          {error && (
            <AlertBanner type="error" message={error} onClose={() => setError('')} className="mb-6" />
          )}

          {/* Form input elements */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Official Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@campusconnect.edu"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Sign In to Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Footer Back Link */}
          <div className="mt-6 pt-6 border-t border-slate-700/80 text-center">
            <Link to="/" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium">
              ← Return to Homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

