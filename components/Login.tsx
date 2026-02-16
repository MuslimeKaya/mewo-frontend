
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cat, GraduationCap, UserCheck, ArrowRight, Loader2, Mail, Lock, User as UserIcon, ChevronLeft, Sparkles, Globe, Shield, Eye, EyeOff } from 'lucide-react';
import { User, UserRole } from '../types';
import { authService } from '../services/auth';
import { PolicyModal } from './PolicyModal';
import { Logo } from './Logo';

interface LoginProps {
  onLogin: (user: User) => void;
}

type ViewState = 'role' | 'auth';
type AuthMode = 'signin' | 'signup';

const BackgroundBlobs = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-slate-50 dark:bg-slate-950">
    <motion.div
      animate={{
        x: [0, 100, 0],
        y: [0, 50, 0],
        scale: [1, 1.2, 1],
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-orange-200/30 dark:bg-orange-900/20 rounded-full blur-[120px]"
    />
    <motion.div
      animate={{
        x: [0, -80, 0],
        y: [0, 100, 0],
        scale: [1, 1.1, 1],
      }}
      transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
      className="absolute top-[20%] -right-[10%] w-[45%] h-[45%] bg-amber-200/20 dark:bg-amber-900/10 rounded-full blur-[100px]"
    />
    <motion.div
      animate={{
        x: [0, 50, 0],
        y: [0, -100, 0],
        scale: [1, 1.3, 1],
      }}
      transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
      className="absolute -bottom-[10%] left-[20%] w-[40%] h-[40%] bg-rose-200/20 dark:bg-rose-900/10 rounded-full blur-[110px]"
    />
  </div>
);

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [view, setView] = useState<ViewState>('role');
  const [mode, setMode] = useState<AuthMode>('signin');
  const [role, setRole] = useState<UserRole>('student');
  const [loading, setLoading] = useState(false);
  const [showPolicy, setShowPolicy] = useState<{ open: boolean, type: 'privacy' | 'terms' | 'support' | 'about' }>({ open: false, type: 'privacy' });
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setPasswordConfirm('');
    setFirstName('');
    setLastName('');
    setOtp('');
    setError(null);
    setShowOtpInput(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  React.useEffect(() => {
    resetForm();
  }, [mode, view]);

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setView('auth');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        if (password !== passwordConfirm) {
          throw new Error('Şifreler uyuşmuyor!');
        }
        if (password.length < 8 || password.length > 20) {
          throw new Error('Şifre 8 ile 20 karakter arasında olmalıdır');
        }

        await authService.signup(email, password, firstName, lastName, role);
        setMode('signin');
        setError(null);
        // OTP input triggers only if backend throws 'unverified' during SIGNIN.
        // For new signups, we auto-verify now to match teacher logic.
        alert('Kaydınız başarılı! Şimdi giriş yapabilirsiniz.');
      } else {
        const user = await authService.signin(email, password);
        if (user) onLogin(user);
      }
    } catch (err: any) {
      console.error('Login Error:', err);
      // Backend'den dönen hatayı yakala
      const message = err.response?.data?.message || err.message || 'Bir hata oluştu. Lütfen tekrar deneyin.';
      setError(Array.isArray(message) ? message[0] : message);

      if (message.includes('Hesabınız onaylanmamış')) {
        setShowOtpInput(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const user = await authService.verifySignup(email, otp);
      if (user) onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Doğrulama başarısız.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setLoading(true);
    setError(null);
    setResendSuccess(false);
    try {
      await authService.resendVerificationOtp(email);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Kod tekrar gönderilemedi.');
    } finally {
      setLoading(false);
    }
  };
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.1
      }
    },
    exit: { opacity: 0, scale: 0.95 }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  return (
    <div className="min-h-screen flex flex-col items-center p-6 relative overflow-hidden bg-white dark:bg-slate-950">
      <BackgroundBlobs />

      {/* Decorative top header */}
      <div className="w-full max-w-7xl mx-auto p-4 md:p-8 flex items-center justify-between z-20">
        <div className="flex items-center space-x-3">
          <div className="bg-white dark:bg-slate-900 p-2 rounded-xl shadow-xl border border-slate-100 dark:border-slate-800">
            <Logo size={32} />
          </div>
          <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter italic">Mewo.</span>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center w-full max-w-6xl relative z-10 py-12">
        <div className="max-w-6xl w-full grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Side: Brand Story */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="hidden lg:block space-y-8"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center space-x-2 bg-brand-500/10 px-4 py-2 rounded-full border border-brand-500/20">
              <Sparkles className="w-4 h-4 text-brand-600 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-700 dark:text-brand-400">Next-Gen Language Lab</span>
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-6xl xl:text-7xl font-black text-slate-900 dark:text-white leading-[1.05] tracking-tight">
              Yeni Nesil <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-orange-500">
                Dil Öğrenimi
              </span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-md leading-relaxed">
              Mewo ile kişiselleştirilmiş bir öğrenme yolculuğuna çıkın. Yapay zeka destekli eğitmenler ve interaktif içeriklerle dil yeteneklerinizi zirveye taşıyın.
            </motion.p>

            <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4">
              <div className="flex items-center space-x-2 opacity-50">
                <Globe className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Global Reach</span>
              </div>
              <div className="flex items-center space-x-2 opacity-50">
                <Shield className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-widest">Enterprise Security</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side: Interactive Card */}
          <div className="relative w-full">
            <AnimatePresence mode="wait">
              {view === 'role' ? (
                <motion.div
                  key="role-selection"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={containerVariants}
                  className="space-y-4"
                >
                  <motion.button
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, translateY: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRoleSelect('student')}
                    className="w-full group bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/50 dark:border-slate-800/50 p-8 rounded-[2.5rem] shadow-2xl shadow-brand-500/5 hover:border-brand-500/50 dark:hover:border-brand-500/30 transition-all text-left flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-6">
                      <div className="bg-white dark:bg-slate-800 p-2 rounded-3xl group-hover:scale-110 transition-transform duration-500 shadow-lg border-2 border-brand-500/20">
                        <Logo size={48} />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Öğrenciyim</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium italic">Ustalığa giden yolculuğa başlayın.</p>
                      </div>
                    </div>
                    <ArrowRight className="w-6 h-6 text-slate-300 group-hover:text-brand-600 transition-all transform group-hover:translate-x-1" />
                  </motion.button>

                  <motion.button
                    variants={itemVariants}
                    whileHover={{ scale: 1.02, translateY: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleRoleSelect('teacher')}
                    className="w-full group bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/50 dark:border-slate-800/50 p-8 rounded-[2.5rem] shadow-2xl shadow-brand-500/5 hover:border-brand-500/50 dark:hover:border-brand-500/30 transition-all text-left flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-6">
                      <div className="bg-brand-50 dark:bg-brand-900/20 p-5 rounded-3xl group-hover:bg-brand-600 transition-colors duration-500">
                        <UserCheck className="w-8 h-8 text-brand-600 group-hover:text-white transition-colors duration-500" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Eğitmenim</h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium italic">Yeni nesile rehberlik edin.</p>
                      </div>
                    </div>
                    <ArrowRight className="w-6 h-6 text-slate-300 group-hover:text-brand-600 transition-all transform group-hover:translate-x-1" />
                  </motion.button>
                </motion.div>
              ) : (
                <motion.div
                  key="auth-form"
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={containerVariants}
                  className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border border-white/50 dark:border-slate-800/50 p-10 sm:p-12 rounded-[3.5rem] shadow-2xl shadow-brand-500/10 relative overflow-hidden"
                >
                  {/* Decorative glow inside card */}
                  <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl" />

                  <div className="flex items-center justify-between mb-10">
                    <button
                      onClick={() => setView('role')}
                      className="flex items-center text-[10px] font-black text-slate-400 hover:text-brand-600 uppercase tracking-[0.2em] transition-colors group"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" /> Geri Dön
                    </button>
                    <div className="h-[2px] w-12 bg-slate-100 dark:bg-slate-800 rounded-full" />
                  </div>

                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                    {showOtpInput ? 'Hesabı Doğrula' : (mode === 'signin' ? 'Tekrar Hoş Geldiniz' : 'Mewo\'ya Katılın')}
                  </h2>
                  <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-8">
                    {showOtpInput ? 'E-postanızı Kontrol Edin' : (role === 'student' ? 'Öğrenci Girişi' : 'Eğitmen Girişi')}
                  </p>

                  {showOtpInput ? (
                    <form onSubmit={handleVerifyOtp} className="space-y-6">
                      <p className="text-[11px] font-bold text-slate-500 leading-relaxed text-center">
                        <span className="text-brand-600">{email}</span> adresine 6 haneli bir doğrulama kodu gönderdik. Lütfen kodu aşağıya girin.
                      </p>
                      <div className="space-y-2">
                        <div className="flex justify-between items-center px-2">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">DOĞRULAMA KODU</label>
                          <button
                            type="button"
                            onClick={handleResendOtp}
                            className="text-[10px] font-black text-brand-600 hover:text-brand-500 uppercase tracking-widest transition-colors"
                          >
                            KOD GELMEDİ Mİ?
                          </button>
                        </div>
                        <input
                          type="text"
                          required
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 text-2xl font-black text-center tracking-[0.5em] focus:ring-4 focus:ring-brand-500/10 focus:border-brand-600 outline-none transition-all"
                          placeholder="000000"
                          maxLength={6}
                        />
                      </div>

                      {resendSuccess && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/50 p-4 rounded-2xl text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center space-x-3"
                        >
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                          <p>Yeni kod başarıyla gönderildi!</p>
                        </motion.div>
                      )}

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/50 p-4 rounded-2xl text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center space-x-3"
                        >
                          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                          <p>{error}</p>
                        </motion.div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-brand-600 text-white rounded-[2rem] py-5 font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl flex items-center justify-center space-x-3 group"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <span>DOĞRULA VE GİRİŞ YAP</span>}
                      </button>

                      <button
                        type="button"
                        onClick={() => setShowOtpInput(false)}
                        className="w-full text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest text-center"
                      >
                        BİLGİLERİ DÜZENLE
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {mode === 'signup' && (
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Ad</label>
                            <div className="relative group">
                              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
                              <input
                                type="text"
                                name="firstName"
                                autoComplete="given-name"
                                required
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-600 outline-none transition-all placeholder:text-slate-500"
                                placeholder="Adınız"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Soyad</label>
                            <div className="relative group">
                              <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
                              <input
                                type="text"
                                name="lastName"
                                autoComplete="family-name"
                                required
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-600 outline-none transition-all placeholder:text-slate-500"
                                placeholder="Soyadınız"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">E-posta</label>
                        <div className="relative group">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
                          <input
                            type="email"
                            name="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-600 outline-none transition-all placeholder:text-slate-500"
                            placeholder="Ör: mehmet@mewo.com"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center px-1">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Şifre</label>
                            {mode === 'signin' && (
                              <button type="button" className="text-[10px] font-black text-brand-600 hover:text-brand-500 uppercase tracking-widest">Unuttum?</button>
                            )}
                          </div>
                          <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              name="password"
                              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-12 text-sm font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-600 outline-none transition-all"
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {mode === 'signup' && (
                          <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Şifre (Tekrar)</label>
                            <div className="relative group">
                              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
                              <input
                                type={showConfirmPassword ? 'text' : 'password'}
                                name="confirmPassword"
                                autoComplete="new-password"
                                required
                                value={passwordConfirm}
                                onChange={(e) => setPasswordConfirm(e.target.value)}
                                className="w-full bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl py-4 pl-12 pr-12 text-sm font-bold focus:ring-4 focus:ring-brand-500/10 focus:border-brand-600 outline-none transition-all"
                                placeholder="••••••••"
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                              >
                                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {error && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-800/50 p-4 rounded-2xl text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center space-x-3"
                        >
                          <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                          <p>{error}</p>
                        </motion.div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-[2rem] py-5 font-black uppercase tracking-[0.2em] text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-2xl flex items-center justify-center space-x-3 group"
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <>
                            <span>{mode === 'signin' ? 'Giriş Yap' : 'Kayıt Ol'}</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  <div className="mt-10 pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center">
                    <p className="text-[11px] font-bold text-slate-500">
                      {mode === 'signin' ? 'Hesabınız yok mu?' : 'Zaten üye misiniz?'}
                      <button
                        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
                        className="ml-2 text-brand-600 hover:text-brand-500 underline decoration-2 underline-offset-4"
                      >
                        {mode === 'signin' ? 'Hesap Oluşturun' : 'Giriş Yapın'}
                      </button>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Minimalist App Footer - Now Global for / path */}
      <footer className="w-full max-w-7xl mx-auto px-6 py-8 mt-auto border-t border-slate-100 dark:border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-6 opacity-80 hover:opacity-100 transition-opacity z-20">
        <div className="flex items-center space-x-4">
          <span className="text-[11px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Mewo Language Lab</span>
          <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700"></div>
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em]">© 2026</p>
        </div>

        <div className="flex items-center space-x-8">
          <button onClick={() => setShowPolicy({ open: true, type: 'support' })} className="text-[10px] font-black text-slate-400 hover:text-brand-600 uppercase tracking-[0.2em] transition-colors">Destek</button>
          <button onClick={() => setShowPolicy({ open: true, type: 'privacy' })} className="text-[10px] font-black text-slate-400 hover:text-brand-600 uppercase tracking-[0.2em] transition-colors">Gizlilik</button>
          <div className="w-[1px] h-4 bg-slate-100 dark:bg-slate-800"></div>
          <p className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-tight italic">
            Empowering Learning | <span className="text-brand-600 dark:text-brand-400 font-black not-italic ml-1">HAPPY HACKING SPACE</span>
          </p>
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
