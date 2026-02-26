import React, { useState } from 'react';
import { LayoutDashboard, Compass, Sparkles, Library, Cat, Bell, Moon, Sun, LogOut, ShieldCheck, User as UserIcon, Users, X, BookOpen, Layout as LayoutIcon } from 'lucide-react';
import { AppTab, User } from '../types';
import { BulletinBoard } from './BulletinBoard';
import { bulletinsService } from '../services/bulletins';
import { PolicyModal } from './PolicyModal';
import { Logo } from './Logo';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  user: User;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, isDarkMode, toggleTheme, user, onLogout }) => {
  const [showBulletins, setShowBulletins] = useState(false);
  const [hasUnread, setHasUnread] = useState(false);
  const [latestBulletin, setLatestBulletin] = useState<any>(null);
  const [showSneakPeek, setShowSneakPeek] = useState(false);
  const [showPolicy, setShowPolicy] = useState<{ open: boolean, type: 'privacy' | 'terms' | 'support' | 'about' }>({ open: false, type: 'privacy' });

  React.useEffect(() => {
    const fetchLatest = async () => {
      try {
        const bulletins = user.role === 'teacher'
          ? await bulletinsService.getForTeacher()
          : await bulletinsService.getForStudent();

        if (bulletins.length > 0) {
          const latest = bulletins[0];
          setLatestBulletin(latest);

          const lastReadId = localStorage.getItem(`mewo_last_read_${user.id}`);
          if (lastReadId !== latest.id) {
            setHasUnread(true);

            // Show sneak peek if not already seen in this session
            const sessionSeen = sessionStorage.getItem(`mewo_peek_seen_${latest.id}`);
            if (!sessionSeen) {
              setShowSneakPeek(true);
              sessionStorage.setItem(`mewo_peek_seen_${latest.id}`, 'true');
              setTimeout(() => setShowSneakPeek(false), 6000);
            }
          }
        }
      } catch (err) {
        console.error('Bildirimler yüklenemedi:', err);
      }
    };

    fetchLatest();
    // Refresh every 10 minutes
    const interval = setInterval(fetchLatest, 600000);
    return () => clearInterval(interval);
  }, [user.id, user.role]);

  const handleOpenBulletins = () => {
    setShowBulletins(true);
    setHasUnread(false);
    setShowSneakPeek(false);
    if (latestBulletin) {
      localStorage.setItem(`mewo_last_read_${user.id}`, latestBulletin.id);
    }
  };

  React.useEffect(() => {
    if (showBulletins) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showBulletins]);

  const navItems = [
    { id: AppTab.DASHBOARD, label: 'Hub', icon: LayoutDashboard },
    ...(user.role === 'student' ? [{ id: AppTab.PATHWAY, label: 'Roadmap', icon: Compass }] : []),
    { id: AppTab.GRAMMAR, label: 'Grammar', icon: BookOpen },
    { id: AppTab.LIBRARY, label: 'Library', icon: Library },
    ...(user.role === 'teacher' ? [
      { id: AppTab.STUDENTS, label: 'Students', icon: Users },
      { id: AppTab.TEMPLATES, label: 'Templates', icon: LayoutIcon }
    ] : []),
    ...(user.role === 'student' ? [{ id: AppTab.TEACHERS, label: 'Teachers', icon: Users }] : []),
  ];

  const handleTabChange = (id: AppTab) => {
    onTabChange(id);
    let path = '/hub';
    switch (id) {
      case AppTab.PATHWAY: path = '/roadmap'; break;
      case AppTab.GRAMMAR: path = '/grammar'; break;
      case AppTab.LIBRARY: path = '/library'; break;
      case AppTab.STUDENTS: path = '/students'; break;
      case AppTab.TEACHERS: path = '/teachers'; break;
      case AppTab.SETTINGS: path = '/settings'; break;
      case AppTab.TEMPLATES: path = '/hub/templates'; break;
      case AppTab.DASHBOARD: path = '/hub'; break;
    }
    window.history.pushState({}, '', path);
  };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const avatarUrl = user.avatar
    ? (user.avatar.startsWith('http') ? user.avatar : `${API_URL.replace('/api', '')}${user.avatar}`)
    : null;

  return (
    <div className="min-h-full flex flex-col bg-[#F8FAFC] dark:bg-slate-950">
      {/* Header: Mobil için daha kompakt */}
      <header className="sticky top-0 z-[60] glass-panel border-b border-slate-200/50 dark:border-slate-800/50 h-16 md:h-20 px-4">
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between gap-4">
          <div className="flex items-center space-x-2 md:space-x-4 cursor-pointer group shrink-0" onClick={() => onTabChange(AppTab.DASHBOARD)}>
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white dark:bg-slate-900 rounded-2xl shadow-xl shadow-brand-500/10 flex items-center justify-center border-2 border-brand-500/10 transition-transform duration-300 group-hover:scale-105">
              <Logo size={32} />
            </div>
            <div>
              <h1 className="text-base md:text-xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-none">
                Mewo<span className="text-brand-600">.</span>
              </h1>
            </div>
          </div>

          <nav className="hidden md:flex items-center bg-slate-100/50 dark:bg-slate-900/50 p-1 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 shrink-0">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className={`flex items-center px-5 py-2.5 rounded-xl transition-all text-sm font-semibold ${activeTab === item.id
                  ? 'bg-white dark:bg-slate-800 text-brand-700 dark:text-brand-400 shadow-md ring-1 ring-slate-200/50 dark:ring-slate-700/50'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-slate-800/40'
                  }`}
              >
                {item.id === AppTab.SETTINGS && avatarUrl ? (
                  <img src={avatarUrl} className={`w-4 h-4 mr-2 rounded-full object-cover ring-2 ${activeTab === item.id ? 'ring-brand-500' : 'ring-transparent'}`} />
                ) : (
                  <item.icon className={`w-4 h-4 mr-2 ${activeTab === item.id ? 'text-brand-600' : 'text-slate-400 dark:text-slate-500'}`} />
                )}
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-3 md:space-x-4 shrink-0 relative">
            {/* Sneak Peek Toast */}
            {showSneakPeek && latestBulletin && (
              <div
                className="absolute top-full right-0 mt-4 w-72 bg-white dark:bg-slate-900 border-2 border-brand-500/20 rounded-3xl p-5 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-500 z-[70] cursor-pointer"
                onClick={handleOpenBulletins}
              >
                <div className="flex items-center space-x-3 mb-2">
                  <div className="bg-brand-100 dark:bg-brand-900/40 p-1.5 rounded-lg">
                    <Bell className="w-4 h-4 text-brand-600" />
                  </div>
                  <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Yeni Bildirim</span>
                </div>
                <h4 className="text-[11px] font-black text-slate-900 dark:text-white leading-tight mb-1">{latestBulletin.title}</h4>
                <p className="text-[10px] font-medium text-slate-500 line-clamp-2 italic">"{latestBulletin.content}"</p>
                <div className="absolute -top-2 right-12 w-4 h-4 bg-white dark:bg-slate-900 border-t-2 border-l-2 border-brand-500/10 rotate-45"></div>
              </div>
            )}

            {/* Action Buttons: Notification, Theme & Avatar */}
            <div className="flex items-center space-x-1.5 md:space-x-2 pl-2 md:pl-4">
              <button
                onClick={handleOpenBulletins}
                className="relative p-2 text-slate-400 hover:text-brand-600 dark:text-slate-500 dark:hover:text-brand-400 transition-all active:scale-90 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl border border-slate-200/50 dark:border-slate-800/50"
              >
                <Bell className={`w-4 h-4 md:w-5 md:h-5 ${hasUnread ? 'text-brand-600' : ''}`} />
                {hasUnread && (
                  <div className="absolute top-2 right-2 flex items-center justify-center">
                    <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-orange-600 border border-white dark:border-slate-900"></span>
                  </div>
                )}
              </button>
              <button
                onClick={toggleTheme}
                className="p-2 text-slate-400 hover:text-slate-900 dark:text-slate-500 dark:hover:text-white transition-all active:scale-90 bg-slate-100/50 dark:bg-slate-900/50 rounded-xl border border-slate-200/50 dark:border-slate-800/50"
              >
                {isDarkMode ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
              </button>



              <button
                onClick={() => handleTabChange(AppTab.SETTINGS)}
                className={`p-1 transition-all active:scale-90 rounded-full border-2 ${activeTab === AppTab.SETTINGS ? 'border-brand-600 scale-105 shadow-lg shadow-brand-500/10' : 'border-transparent'}`}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="User" className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Bulletin Board Slide-over Modal */}
      {showBulletins && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] transition-opacity"
            onClick={() => setShowBulletins(false)}
          />
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-xl bg-white dark:bg-slate-950 z-[110] shadow-2xl animate-in slide-in-from-right duration-500 border-l border-slate-200 dark:border-slate-800">
            <div className="h-full flex flex-col p-6">
              <div className="flex items-center justify-between mb-4 mt-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Duyurular</h2>
                <button
                  onClick={() => setShowBulletins(false)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="flex-1 min-h-0">
                <BulletinBoard user={user} />
              </div>
            </div>
          </div>
        </>
      )}

      <main className="flex-1 w-full max-w-7xl mx-auto overflow-x-hidden flex flex-col py-6 md:py-10 px-4 md:px-6">
        <div className="page-transition flex-1">
          {children}
        </div>

        {/* Minimalist App Footer */}
        <footer className="px-6 py-8 mt-auto border-t border-slate-100 dark:border-slate-800/50 flex flex-col md:flex-row items-center justify-between gap-6 opacity-80 hover:opacity-100 transition-opacity">
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
              Empowering Teachers & Students | <span className="text-brand-600 dark:text-brand-400 font-black not-italic ml-1">HAPPY HACKING SPACE</span>
            </p>
          </div>
        </footer>
      </main>

      {/* Modern Mobile Bottom Navigation (Safe Area Aware) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] px-4 pointer-events-none"
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}>
        <div className="glass-panel border border-white/20 dark:border-white/5 shadow-2xl rounded-[2.5rem] h-18 flex items-center justify-around px-2 pointer-events-auto ring-1 ring-black/5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabChange(item.id)}
                className="relative flex flex-col items-center justify-center w-16 h-14 group active:scale-95 transition-transform"
              >
                {isActive && (
                  <div className="absolute -top-1 w-1 h-1 bg-brand-600 rounded-full"></div>
                )}
                <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/40 scale-110' : 'text-slate-400 dark:text-slate-500'
                  }`}>
                  {item.id === AppTab.SETTINGS && avatarUrl ? (
                    <img src={avatarUrl} className={`w-5 h-5 rounded-full object-cover ring-1 ${isActive ? 'ring-white' : 'ring-transparent'}`} />
                  ) : (
                    <item.icon className="w-5 h-5" />
                  )}
                </div>
                <span className={`text-[8px] font-black uppercase tracking-widest mt-1 transition-colors ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400'
                  }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <PolicyModal
        isOpen={showPolicy.open}
        onClose={() => setShowPolicy({ ...showPolicy, open: false })}
        type={showPolicy.type}
      />
    </div>
  );
};
