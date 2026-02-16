
import React, { useState } from 'react';
import { Cat, GraduationCap, UserCheck, ArrowRight, Loader2, Mail, Lock, User as UserIcon, ChevronLeft } from 'lucide-react';
import { User, UserRole } from '../types';
import { authService } from '../services/auth';
import { PolicyModal } from './PolicyModal';

interface LoginProps {
  onLogin: (user: User) => void;
}

type ViewState = 'role' | 'auth';
type AuthMode = 'signin' | 'signup';

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [view, setView] = useState<ViewState>('role');
  const [mode, setMode] = useState<AuthMode>('signin');
  const [role, setRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);
  const [showPolicy, setShowPolicy] = useState<{ open: boolean, type: 'privacy' | 'terms' | 'support' | 'about' }>({ open: false, type: 'privacy' });
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setView('auth');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let user: User;
      if (mode === 'signup') {
        user = await authService.signup(email, password, firstName, lastName, role);
      } else {
        user = await authService.signin(email, password);
      }
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-slate-950 p-6 overflow-x-hidden relative">
      {/* Decorative background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-brand-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="flex-1 flex items-center justify-center py-12">
        <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative">
          <div className="space-y-8 relative z-10">
            <div className="flex items-center space-x-4">
              <div className="bg-brand-600 p-4 rounded-[2rem] shadow-2xl shadow-brand-500/20 active:scale-95 transition-transform cursor-pointer">
                <Cat className="w-10 h-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Mewo<span className="text-brand-600">.</span></h1>
                <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Language Lab</p>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-5xl font-extrabold text-slate-900 dark:text-white leading-[1.1] tracking-tight">
                {view === 'role' ? (
                  <>Personalized Learning <br /> <span className="text-brand-600">Powered by AI.</span></>
                ) : (
                  <>Welcome Back <br /> <span className="text-brand-600">Expert.</span></>
                )}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed max-w-md">
                A premium English learning environment designed for both ambitious students and professional educators.
              </p>
            </div>
          </div>

          <div className="relative z-10 w-full">
            {view === 'role' ? (
              <div className="space-y-4 animate-in slide-in-from-right-10 fade-in duration-500">
                <button
                  onClick={() => handleRoleSelect('student')}
                  className="w-full group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] premium-shadow hover:border-brand-500 dark:hover:border-brand-500 transition-all text-left flex items-center justify-between active:scale-95"
                >
                  <div className="flex items-center space-x-6">
                    <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-2xl group-hover:bg-brand-50 dark:group-hover:bg-brand-900/30 transition-colors">
                      <GraduationCap className="w-8 h-8 text-emerald-600 group-hover:text-brand-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">I'm a Student</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Access weekly goals and AI tutoring.</p>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-slate-300 group-hover:text-brand-600 transition-all transform group-hover:translate-x-1" />
                </button>

                <button
                  onClick={() => handleRoleSelect('teacher')}
                  className="w-full group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 rounded-[2.5rem] premium-shadow hover:border-brand-500 dark:hover:border-brand-500 transition-all text-left flex items-center justify-between active:scale-95"
                >
                  <div className="flex items-center space-x-6">
                    <div className="bg-brand-50 dark:bg-brand-900/20 p-4 rounded-2xl group-hover:bg-brand-600 transition-colors">
                      <UserCheck className="w-8 h-8 text-brand-600 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">I'm a Teacher</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">Curate goals and track progress.</p>
                    </div>
                  </div>
                  <ArrowRight className="w-6 h-6 text-slate-300 group-hover:text-brand-600 transition-all transform group-hover:translate-x-1" />
                </button>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-10 rounded-[3rem] premium-shadow animate-in zoom-in-95 fade-in duration-500">
                <button
                  onClick={() => setView('role')}
                  className="mb-8 flex items-center text-xs font-black text-slate-400 hover:text-brand-600 uppercase tracking-widest transition-colors group"
                >
                  <ChevronLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" /> Back to Role Selection
                </button>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {mode === 'signup' && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">First Name</label>
                        <div className="relative group">
                          <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                          <input
                            type="text"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                            placeholder="John"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Last Name</label>
                        <input
                          type="text"
                          required
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 px-4 text-sm font-bold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                          placeholder="Doe"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                        placeholder="name@example.com"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Password</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  {error && <p className="text-xs font-bold text-rose-500 px-1 animate-pulse">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-brand-600 hover:bg-brand-700 text-white p-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-brand-500/20 transition-all flex items-center justify-center space-x-3 active:scale-95 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                      <>
                        <span>{mode === 'signin' ? 'Sign In' : 'Join Mewo'}</span>
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 text-center">
                  <button
                    onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                    className="text-xs font-black text-slate-400 hover:text-brand-600 uppercase tracking-widest transition-colors"
                  >
                    {mode === 'signin' ? "Don't have an account? Create one" : "Already have an account? Sign in"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modern Premium Footer */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto pt-8 pb-12 border-t border-slate-200/50 dark:border-slate-800/50">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 px-6">
          <div className="flex flex-col items-center md:items-start space-y-4">
            <div className="flex items-center space-x-2">
              <Cat className="w-5 h-5 text-brand-600" />
              <span className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">Mewo<span className="text-brand-600">.</span></span>
            </div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest text-center md:text-left max-w-[240px] leading-loose">
              Advanced English learning platform powered by artificial intelligence.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 text-center md:text-left">
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Product</h4>
              <ul className="space-y-2">
                <li><button onClick={() => setShowPolicy({ open: true, type: 'about' })} className="text-[10px] font-bold text-slate-400 hover:text-brand-600 transition-colors uppercase tracking-widest">Roadmap</button></li>
                <li><button onClick={() => setShowPolicy({ open: true, type: 'about' })} className="text-[10px] font-bold text-slate-400 hover:text-brand-600 transition-colors uppercase tracking-widest">AI Tutor</button></li>
                <li><button onClick={() => setShowPolicy({ open: true, type: 'about' })} className="text-[10px] font-bold text-slate-400 hover:text-brand-600 transition-colors uppercase tracking-widest">Library</button></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Support</h4>
              <ul className="space-y-2">
                <li><button onClick={() => setShowPolicy({ open: true, type: 'support' })} className="text-[10px] font-bold text-slate-400 hover:text-brand-600 transition-colors uppercase tracking-widest">Help Center</button></li>
                <li><button onClick={() => setShowPolicy({ open: true, type: 'privacy' })} className="text-[10px] font-bold text-slate-400 hover:text-brand-600 transition-colors uppercase tracking-widest">Privacy</button></li>
                <li><button onClick={() => setShowPolicy({ open: true, type: 'terms' })} className="text-[10px] font-bold text-slate-400 hover:text-brand-600 transition-colors uppercase tracking-widest">Terms</button></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col md:flex-row items-center justify-between gap-6 px-6 pt-8 border-t border-slate-100 dark:border-slate-800/50">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            © 2026 Mewo Language Lab. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <a href="#" className="text-slate-400 hover:text-brand-600 transition-colors"><Cat className="w-5 h-5" /></a>
            <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-800"></div>
            <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest italic group">
              Made with <span className="text-rose-500 group-hover:animate-pulse">❤️</span> by <span className="text-brand-600">Happy Hacking Space</span>
            </p>
          </div>
        </div>
      </footer>

      <PolicyModal
        isOpen={showPolicy.open}
        onClose={() => setShowPolicy({ ...showPolicy, open: false })}
        type={showPolicy.type}
      />
    </div>
  );
};
