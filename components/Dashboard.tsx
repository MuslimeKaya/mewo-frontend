
import React, { useState, useEffect } from 'react';
import {
  Trophy,
  BookOpen,
  Flame,
  Target,
  ArrowRight,
  Sparkles,
  Zap,
  TrendingUp,
  Clock,
  Edit3,
  Check,
  Cat,
  MessageSquare,
  Award,
  Shield,
  ShieldCheck,
  Medal,
  Users,
  History as HistoryIcon,
  Loader2,
  FileText,
  Download,
  ExternalLink,
  Image as ImageIcon,
  FileSpreadsheet,
  Calendar,
  ChevronLeft,
  X,
  Volume2,
  ChevronRight
} from 'lucide-react';
import { AppTab, WeeklyGoal, User } from '../types';
import { LiveTutor } from './LiveTutor';
import { Translator } from './Translator';
import { WordSelector } from './WordSelector';
import { TeacherWordList } from './TeacherWordList';
import { AssignmentHistory } from './AssignmentHistory';
import { BulletinBoard } from './BulletinBoard';
import { wordsService, Word as WordType } from '../services/words';
import { authService } from '../services/auth';
import { WordQuizModal } from './WordQuizModal';

interface DashboardProps {
  onNavigate: (tab: AppTab) => void;
  user: User;
  onRefreshUser?: (user: User) => void;
}

const BadgeItem = ({ title, icon, color, bg, progress }: any) => (
  <div className="group/badge flex items-center p-3 rounded-2xl border border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-brand-100 dark:hover:border-brand-900/30 transition-all duration-300 hover:scale-[1.03] cursor-pointer">
    <div className={`w-10 h-10 ${bg} ${color} rounded-xl flex items-center justify-center mr-3 shadow-sm group-hover/badge:rotate-6 transition-transform`}>
      {icon}
    </div>
    <div className="flex-1">
      <h5 className="text-xs font-black text-slate-800 dark:text-slate-200">{title}</h5>
      <div className="mt-1.5 h-1 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <div className="h-full bg-brand-500 transition-all duration-1000" style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  </div>
);

const WordCard = ({ word, isLearned, isNew, onToggle }: { word: any, isLearned: boolean, isNew?: boolean, onToggle: () => void }) => (
  <div
    onClick={(e) => {
      e.stopPropagation();
      onToggle();
    }}
    className={`flex items-center justify-between px-2.5 py-2.5 rounded-xl border-2 transition-all cursor-pointer group/word min-h-[4rem] relative overflow-hidden ${isLearned
      ? 'bg-brand-600 border-brand-500 text-white shadow-lg shadow-brand-500/20'
      : isNew
        ? 'bg-emerald-50/40 dark:bg-emerald-900/10 border-emerald-200/50 dark:border-emerald-800/50 shadow-lg shadow-emerald-500/5'
        : 'bg-[#F8F9FA] dark:bg-slate-800 border-blue-100 dark:border-slate-700 shadow-sm hover:border-emerald-500 hover:shadow-emerald-500/10 hover:bg-white'
      } hover:shadow-xl hover:-translate-y-0.5 active:scale-95 duration-300`}
  >
    <div className="min-w-0 pr-1.5 relative z-10 flex flex-col justify-center">
      <div className="flex items-center gap-1.5 mb-1">
        <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md ${isLearned ? 'bg-white/20 text-white' : isNew ? 'bg-emerald-100 text-emerald-600' : 'bg-brand-100 dark:bg-brand-900/30 text-brand-600'} inline-block tracking-tighter`}>
          {word.cefr || '??'}
        </span>
        {isNew && !isLearned && (
          <span className="bg-emerald-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter animate-bounce">Yeni</span>
        )}
        {word.pronunciation && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              new Audio(word.pronunciation).play().catch(e => console.error("Audio play error:", e));
            }}
            className={`p-1 rounded-lg transition-all active:scale-95 ${isLearned ? 'text-white/60 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
            title="Dinle"
          >
            <Volume2 className="w-3 h-3" />
          </button>
        )}
      </div>
      <p className="text-xs font-black truncate leading-tight mb-0.5">{word.en}</p>
      <p className={`text-[10px] font-bold leading-tight truncate ${isLearned ? 'text-white/70' : 'text-slate-400 dark:text-slate-500'}`}>{word.tr}</p>
    </div>
    <div className="flex items-center space-x-1 relative z-10">
      {word.teachers && word.teachers.length > 0 && (
        <div className="flex -space-x-1 overflow-hidden">
          {word.teachers.map((t: any, idx: number) => (
            <div
              key={idx}
              title={t.firstName + ' ' + t.lastName}
              className={`w-3.5 h-3.5 rounded-full border border-white dark:border-slate-900 flex items-center justify-center text-[6px] font-black uppercase ${isLearned ? 'bg-white/20 text-white' : 'bg-indigo-500 text-white'}`}
            >
              {t.firstName?.[0]}
            </div>
          ))}
        </div>
      )}
      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-all ${isLearned ? 'bg-white/20' : isNew ? 'bg-emerald-100 dark:bg-emerald-800' : 'bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800'}`}>
        {isLearned ? <Check className="w-4 h-4 text-white" /> : isNew ? <Sparkles className="w-4 h-4 text-emerald-500" /> : <Sparkles className="w-3 h-3 text-brand-500" />}
      </div>
    </div>
    {isNew && !isLearned && (
      <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-500/10 rounded-full -mr-6 -mt-6" />
    )}
  </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate, user, onRefreshUser }) => {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [teacherWords, setTeacherWords] = useState<WordType[]>([]);
  const [recommendedWords, setRecommendedWords] = useState<WordType[]>([]);
  const [loadingTeacherWords, setLoadingTeacherWords] = useState(false);
  const [loadingRecommended, setLoadingRecommended] = useState(false);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [selectedAssignment, setSelectedAssignment] = useState<any | null>(null);
  const [learnedWordIds, setLearnedWordIds] = useState<Set<string>>(new Set());
  const [readWordIds, setReadWordIds] = useState<Set<string>>(new Set());
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  // Handle Initial State from URL
  const [activeCard, setActiveCard] = useState<'study' | 'history'>(() => {
    if (typeof window === 'undefined') return 'study';
    if (window.location.pathname === '/hub/assignments') return 'history';
    return 'study';
  });
  const [wordPage, setWordPage] = useState(1);
  const WORDS_PER_PAGE = 20;

  const [activeTeacherCard, setActiveTeacherCard] = useState<'selector' | 'list' | 'history'>(() => {
    if (typeof window === 'undefined') return 'selector';
    const path = window.location.pathname;
    if (path === '/hub/vocabulary') return 'list';
    if (path === '/hub/assignments') return 'history';
    return 'selector';
  });

  const [viewingFile, setViewingFile] = useState<any | null>(null);
  const [wordToQuiz, setWordToQuiz] = useState<string | null>(null);

  // Sync Teacher URL
  const updateTeacherCard = (card: 'selector' | 'list' | 'history') => {
    setActiveTeacherCard(card);
    const path = card === 'selector' ? '/hub/create' : card === 'list' ? '/hub/vocabulary' : '/hub/assignments';
    window.history.pushState({}, '', path);
  };

  // Sync Student URL
  const updateStudentCard = (card: 'study' | 'history', assignmentId?: string) => {
    setActiveCard(card);
    let path = '/hub/study';
    if (card === 'history') path = '/hub/assignments';

    if (assignmentId) {
      const url = new URL(window.location.href);
      url.searchParams.set('id', assignmentId);
      window.history.pushState({}, '', url.toString());
    } else {
      if (card === 'study') {
        window.history.pushState({}, '', '/hub/study');
      } else {
        window.history.pushState({}, '', path);
      }
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`mewo_read_words_${user.id}`);
      if (stored) setReadWordIds(new Set(JSON.parse(stored)));
    }
  }, [user.id]);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
  };



  useEffect(() => {
    if (user.role === 'teacher') {
      fetchAssignments();
    } else {
      fetchAssignments();
      fetchTeacherWords();
      fetchLearnedWords();
      fetchRecommendedWords();
    }
  }, [user, refreshTrigger]);


  const fetchAssignments = async () => {
    try {
      const history = user.role === 'teacher'
        ? await wordsService.getAssignmentHistory()
        : await wordsService.getStudentAssignmentHistory();

      const sortedHistory = [...history].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setAssignments(sortedHistory);

      // Check URL for assignment ID
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const assignmentId = params.get('id');
        if (assignmentId) {
          const found = sortedHistory.find((a: any) => a.id === assignmentId);
          if (found) {
            setSelectedAssignment(found);
            if (activeCard !== 'study') setActiveCard('study');
          }
        }
      }
    } catch (err: any) {
      console.error('Ödev geçmişi yüklenemedi:', err);
    }
  };

  const fetchTeacherWords = async () => {
    if (user.role !== 'student') return;
    setLoadingTeacherWords(true);
    try {
      const words = await wordsService.getTeacherWords();
      setTeacherWords(typeof words === 'object' ? words : []);
    } catch (err) {
      console.error('Kelime yükleme hatası:', err);
      setTeacherWords([]);
    } finally {
      setLoadingTeacherWords(false);
    }
  };

  const fetchRecommendedWords = async () => {
    if (user.role !== 'student') return;
    setLoadingRecommended(true);
    try {
      const words = await wordsService.getRecommendedWords();
      setRecommendedWords(words);
      if (words.length > 0) {
        localStorage.setItem('mewo_recommended_words', JSON.stringify(words.map(w => w.en)));
      }
    } catch (err) {
      console.error('Önerilen kelimeler yüklenemedi:', err);
    } finally {
      setLoadingRecommended(false);
    }
  };

  const fetchLearnedWords = async () => {
    if (user.role !== 'student') return;
    try {
      const learned = await wordsService.getLearnedWords();
      setLearnedWordIds(new Set(learned.map((sw: any) => sw.wordId)));
    } catch (err) {
      console.error('Öğrenilen kelimeler yüklenemedi:', err);
    }
  };

  const handleToggleLearned = async (wordId: string) => {
    if (user.role !== 'student') return;
    if (learnedWordIds.has(wordId)) {
      try {
        await wordsService.verifyQuiz(wordId, false);
        const next = new Set(learnedWordIds);
        next.delete(wordId);
        setLearnedWordIds(next);
      } catch (e) { console.error(e); }
      return;
    }
    setWordToQuiz(wordId);
  };

  const onQuizComplete = (success: boolean, wordId: string) => {
    setWordToQuiz(null);
    if (success) {
      const next = new Set(learnedWordIds);
      next.add(wordId);
      setLearnedWordIds(next);
      if (!readWordIds.has(wordId)) {
        const nextRead = new Set(readWordIds);
        nextRead.add(wordId);
        setReadWordIds(nextRead);
        localStorage.setItem(`mewo_read_words_${user.id}`, JSON.stringify(Array.from(nextRead)));
      }
      triggerRefresh();
    }
  };

  const markWordAsRead = (wordId: string) => {
    if (readWordIds.has(wordId)) return;
    const next = new Set(readWordIds);
    next.add(wordId);
    setReadWordIds(next);
    localStorage.setItem(`mewo_read_words_${user.id}`, JSON.stringify(Array.from(next)));
  };

  const handleDownload = async (url: string, fileName: string) => {
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';
      const fullUrl = `${apiBase}${url}`;
      const response = await fetch(fullUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName || 'mewo-document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error('İndirme hatası:', err);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Minimalist Greeting Section */}
      <div className="mb-0">
        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
          Hoş geldin, <span className="text-brand-600">{user.firstName}</span>
        </h1>
      </div>

      {user.role === 'teacher' && (
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[550px] relative">
            <div
              onClick={() => activeTeacherCard !== 'selector' && updateTeacherCard('selector')}
              className={`transition-all duration-700 ease-in-out ${activeTeacherCard === 'selector'
                ? 'lg:flex-[3] w-full'
                : 'lg:flex-[0.15] w-full lg:w-20 cursor-pointer group'
                }`}
            >
              <div className="bg-[#FAFAFA] dark:bg-slate-900 border-2 border-blue-200 dark:border-slate-800 rounded-[3rem] h-full premium-shadow overflow-hidden transition-all duration-500">
                {activeTeacherCard !== 'selector' ? (
                  <div className="h-full flex flex-col items-center py-12 px-2 relative group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50 transition-colors">
                    <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl shadow-md border border-slate-100 dark:border-slate-700 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 mb-12">
                      <Edit3 className="w-6 h-6 text-brand-600" />
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <h3 className="[writing-mode:vertical-lr] rotate-180 text-sm font-black text-slate-500 dark:text-slate-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-all duration-500 uppercase tracking-[0.3em] whitespace-nowrap select-none">
                        Kelimeleri Seç
                      </h3>
                    </div>
                    <div className="mt-auto p-3 bg-brand-50 dark:bg-brand-900/20 rounded-2xl border border-brand-100/50 dark:border-brand-900/30 group-hover:bg-brand-500 group-hover:text-white transition-all duration-500">
                      <ArrowRight className="w-4 h-4 text-brand-500 group-hover:text-white rotate-180 group-hover:-translate-x-1 transition-transform" />
                    </div>
                  </div>
                ) : (
                  <div className="h-full p-6 animate-in fade-in slide-in-from-left-8 duration-700">
                    <WordSelector onWordAdded={triggerRefresh} refreshTrigger={refreshTrigger} />
                  </div>
                )}
              </div>
            </div>

            <div
              onClick={() => activeTeacherCard !== 'list' && updateTeacherCard('list')}
              className={`transition-all duration-700 ease-in-out ${activeTeacherCard === 'list'
                ? 'lg:flex-[3] w-full'
                : 'lg:flex-[0.15] w-full lg:w-20 cursor-pointer group'
                }`}
            >
              <div className="bg-[#FAFAFA] dark:bg-slate-900 border-2 border-blue-200 dark:border-slate-800 rounded-[3rem] h-full premium-shadow overflow-hidden transition-all duration-500">
                {activeTeacherCard !== 'list' ? (
                  <div className="h-full flex flex-col items-center py-12 px-2 relative group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50 transition-colors">
                    <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl shadow-md border border-slate-100 dark:border-slate-700 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 mb-12">
                      <Target className="w-6 h-6 text-brand-600" />
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <h3 className="[writing-mode:vertical-lr] rotate-180 text-sm font-black text-slate-500 dark:text-slate-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-all duration-500 uppercase tracking-[0.3em] whitespace-nowrap select-none">
                        Gönderilecek Listesi
                      </h3>
                    </div>
                    <div className="mt-auto p-3 bg-brand-50 dark:bg-brand-900/20 rounded-2xl border border-brand-100/50 dark:border-brand-900/30 group-hover:bg-brand-500 group-hover:text-white transition-all duration-500">
                      <ArrowRight className="w-4 h-4 text-brand-500 group-hover:text-white group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ) : (
                  <div className="h-full p-6 animate-in fade-in zoom-in duration-700">
                    <TeacherWordList
                      userId={user.id}
                      refreshTrigger={refreshTrigger}
                      onAssignmentSent={() => {
                        fetchAssignments();
                        triggerRefresh();
                      }}
                      onWordRemoved={triggerRefresh}
                    />
                  </div>
                )}
              </div>
            </div>

            <div
              onClick={() => activeTeacherCard !== 'history' && updateTeacherCard('history')}
              className={`transition-all duration-700 ease-in-out ${activeTeacherCard === 'history'
                ? 'lg:flex-[3] w-full'
                : 'lg:flex-[0.15] w-full lg:w-20 cursor-pointer group'
                }`}
            >
              <div className="bg-[#FAFAFA] dark:bg-slate-900 border-2 border-blue-200 dark:border-slate-800 rounded-[3rem] h-full premium-shadow overflow-hidden transition-all duration-500">
                {activeTeacherCard !== 'history' ? (
                  <div className="h-full flex flex-col items-center py-12 px-2 relative group-hover:bg-slate-50 dark:group-hover:bg-slate-800/50 transition-colors">
                    <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl shadow-md border border-slate-100 dark:border-slate-700 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 mb-12">
                      <HistoryIcon className="w-6 h-6 text-brand-600" />
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <h3 className="[writing-mode:vertical-lr] rotate-180 text-sm font-black text-slate-500 dark:text-slate-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-all duration-500 uppercase tracking-[0.3em] whitespace-nowrap select-none">
                        Ödev Geçmişi
                      </h3>
                    </div>
                    <div className="mt-auto p-3 bg-brand-50 dark:bg-brand-900/20 rounded-2xl border border-brand-100/50 dark:border-brand-900/30 group-hover:bg-brand-500 group-hover:text-white transition-all duration-500">
                      <ArrowRight className="w-4 h-4 text-brand-500 group-hover:text-white group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                ) : (
                  <div className="h-full p-6 animate-in fade-in slide-in-from-right-8 duration-700 flex flex-col">
                    <div className="flex items-center space-x-2.5 mb-3 px-1 shrink-0">
                      <div className="bg-brand-100 dark:bg-brand-900/30 p-1.5 rounded-lg">
                        <HistoryIcon className="w-4 h-4 text-brand-600" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Ödev Geçmişi</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Daha önce gönderilenler</p>
                      </div>
                    </div>
                    <AssignmentHistory
                      assignments={assignments}
                      userId={user.id}
                      onDelete={() => {
                        fetchAssignments();
                        triggerRefresh();
                      }}
                      showDelete={true}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {user.role === 'student' && (
        <div className="space-y-6 animate-in fade-in slide-in-from-top-6 duration-700">
          {!user.studentEnrollments?.some(e => e.status === 'approved') ? (
            <div className="flex-1 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-[3.5rem] flex flex-col items-center justify-center p-12 md:p-20 text-center space-y-8 premium-shadow relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
              <div className="relative w-32 h-32 bg-brand-50 dark:bg-brand-900/10 rounded-[3rem] flex items-center justify-center text-brand-600 shadow-inner group-hover:scale-110 transition-transform duration-500">
                <div className="absolute inset-4 bg-brand-100 dark:bg-brand-900/20 rounded-[2rem] animate-pulse"></div>
                <ShieldCheck className="w-14 h-14 relative z-10" />
              </div>
              <div className="space-y-4 relative z-10">
                <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Eğitmen Onayı Bekleniyor</h3>
                <p className="text-base font-bold text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Mewo dünyasına tam erişim sağlamak için bir eğitmen tarafından onaylanman gerekiyor. Bu sırada "Eğitmen Keşfet" kısmından başvurularını kontrol edebilirsin.
                </p>
              </div>
              <button
                onClick={() => onNavigate(AppTab.TEACHERS)}
                className="px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all shadow-xl"
              >
                Eğitmenleri Keşfet
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col lg:flex-row gap-6 h-auto lg:h-[550px] relative">
                <div
                  onClick={() => activeCard !== 'study' && updateStudentCard('study')}
                  className={`transition-all duration-700 ease-in-out ${activeCard === 'study' ? 'lg:flex-[4] w-full' : 'lg:flex-[0.15] w-full lg:w-20 cursor-pointer group'}`}
                >
                  <div className={`bg-[#FAFAFA] dark:bg-slate-900 border-2 border-blue-200 dark:border-slate-800 rounded-[3rem] h-full premium-shadow relative overflow-hidden transition-all duration-500`}>
                    {activeCard !== 'study' ? (
                      <div className="h-full flex flex-col items-center py-12 px-2 relative group-hover:bg-slate-50 dark:group-hover:bg-slate-800/30 transition-colors">
                        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl shadow-md border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-all duration-500 mb-12">
                          <Target className="w-6 h-6 text-brand-600" />
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                          <h3 className="[writing-mode:vertical-lr] rotate-180 text-sm font-black text-slate-500 dark:text-slate-300 group-hover:text-brand-600 transition-all duration-500 uppercase tracking-[0.3em] whitespace-nowrap">
                            Çalışma Listesi
                          </h3>
                        </div>
                        <div className="mt-auto p-3 bg-brand-50 dark:bg-brand-900/20 rounded-2xl border border-brand-100/50 group-hover:bg-brand-500 group-hover:text-white transition-all duration-500">
                          <ArrowRight className="w-4 h-4 text-brand-500 group-hover:text-white rotate-180" />
                        </div>
                      </div>
                    ) : (
                      <div className="p-6 h-full flex flex-col animate-in fade-in duration-700">
                        <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-50 dark:border-slate-800/50">
                          <div className="flex items-center space-x-2.5">
                            <div className="bg-brand-600 p-1.5 rounded-lg shadow-lg shadow-brand-500/20">
                              <Target className="w-4 h-4 text-white" />
                            </div>
                            <div>
                              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">
                                {selectedAssignment ? 'Ödev Detayı' : 'Çalışma Listesi'}
                              </h3>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                {selectedAssignment ? 'İNCELEME MODU' : `${teacherWords.length} AKTİF KELİME`}
                              </p>
                            </div>
                          </div>
                          {selectedAssignment && (
                            <button
                              onClick={() => {
                                setSelectedAssignment(null);
                                updateStudentCard('study');
                                // Remove ID from URL
                                const url = new URL(window.location.href);
                                url.searchParams.delete('id');
                                window.history.pushState({}, '', url.toString());
                              }}
                              className="group/back flex items-center space-x-2 text-[10px] font-black uppercase tracking-widest bg-slate-100 hover:bg-brand-600 dark:bg-slate-800 dark:hover:bg-brand-600 text-slate-500 hover:text-white px-4 py-2.5 rounded-2xl transition-all active:scale-95"
                            >
                              <ChevronLeft className="w-4 h-4 group-hover/back:-translate-x-1 transition-transform" />
                              <span>Geri Dön</span>
                            </button>
                          )}
                        </div>

                        <div className="flex-1 overflow-hidden pr-2 flex flex-col">
                          {selectedAssignment ? (
                            <div className="flex-1 flex flex-col">
                              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500 flex-1">
                                {/* Header & Description */}
                                <div className="space-y-2">
                                  <div className="flex items-start justify-between gap-4">
                                    <div className="space-y-1">
                                      <div className="flex items-center space-x-2">
                                        <Calendar className="w-3 h-3 text-brand-600" />
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                          {new Date(selectedAssignment.createdAt).toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                        </span>
                                      </div>
                                      <h4 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight uppercase leading-snug">
                                        {selectedAssignment.title || 'Başlıksız Ödev'}
                                      </h4>
                                    </div>
                                  </div>
                                  {selectedAssignment.description && (
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                      <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                                        {selectedAssignment.description}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Files */}
                                {selectedAssignment.files && selectedAssignment.files.length > 0 && (
                                  <div className="space-y-2">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Ekli Materyaller</p>
                                    <div className="flex flex-wrap gap-2">
                                      {selectedAssignment.files.map((file: any, fIdx: number) => {
                                        const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
                                        return (
                                          <div key={fIdx} className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden group/file hover:border-brand-500 transition-all">
                                            <div className="px-2 py-1 bg-brand-500 text-[8px] font-black text-white shrink-0">
                                              {ext}
                                            </div>
                                            <div className="px-2 py-1 flex items-center space-x-2">
                                              <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 truncate max-w-[120px]">{file.name}</span>
                                              <div className="flex items-center border-l border-slate-200 dark:border-slate-700 ml-1 pl-1 space-x-0.5">
                                                <button
                                                  onClick={() => handleDownload(file.url, file.name)}
                                                  className="p-1 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-400 hover:text-emerald-600 rounded transition-colors"
                                                  title="İndir"
                                                >
                                                  <Download className="w-3.5 h-3.5" />
                                                </button>
                                                <button
                                                  onClick={() => setViewingFile(file)}
                                                  className={`p-1 rounded transition-colors ${viewingFile?.url === file.url ? 'bg-brand-50 text-brand-600' : 'hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-400 hover:text-brand-600'}`}
                                                  title="Görüntüle"
                                                >
                                                  <ExternalLink className="w-3.5 h-3.5" />
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}

                                {viewingFile && (
                                  <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700 w-full animate-in fade-in zoom-in duration-500">
                                    <div className="bg-slate-900 rounded-[2.5rem] overflow-hidden shadow-2xl relative border-4 border-slate-800">
                                      <div className="absolute top-4 right-4 z-20">
                                        <button
                                          onClick={() => setViewingFile(null)}
                                          className="bg-black/60 hover:bg-rose-600 text-white p-2 rounded-xl backdrop-blur-xl transition-all active:scale-95 border border-white/10"
                                        >
                                          <X className="w-5 h-5" />
                                        </button>
                                      </div>
                                      <div className="flex justify-center bg-black/20">
                                        {(() => {
                                          const url = `${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001'}${viewingFile.url}`;
                                          const ext = viewingFile.name.toLowerCase().split('.').pop();
                                          if (['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'].includes(ext)) {
                                            return (
                                              <video controls autoPlay className="max-h-[500px] w-full object-contain">
                                                <source src={url} type={`video/${ext === 'mov' ? 'mp4' : ext}`} />
                                                Tarayıcınız bu videoyu oynatamıyor.
                                              </video>
                                            );
                                          }
                                          if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic', 'heif'].includes(ext)) {
                                            return (
                                              <img src={url} alt="Ödev detay" className="max-h-[600px] w-full object-contain shadow-2xl" />
                                            );
                                          }
                                          if (ext === 'pdf') {
                                            return (
                                              <iframe src={url} className="w-full h-[600px] bg-white border-none" title="PDF Önizleme" />
                                            );
                                          }
                                          if (['mp3', 'wav', 'ogg'].includes(ext)) {
                                            return (
                                              <div className="p-16 w-full flex flex-col items-center justify-center space-y-4 bg-gradient-to-b from-slate-800 to-slate-900">
                                                <div className="w-16 h-16 bg-brand-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-brand-500/20 animate-bounce">
                                                  <Sparkles className="w-8 h-8 text-white" />
                                                </div>
                                                <audio controls autoPlay className="w-full max-w-sm accent-brand-500">
                                                  <source src={url} />
                                                </audio>
                                                <p className="text-white/50 text-xs font-medium uppercase tracking-widest">{viewingFile.name}</p>
                                              </div>
                                            );
                                          }
                                          return (
                                            <div className="p-20 text-center">
                                              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-700">
                                                <FileText className="w-8 h-8 text-slate-500" />
                                              </div>
                                              <p className="text-slate-400 text-sm font-bold uppercase tracking-tight">Bu dosya formatı için önizleme desteklenmiyor.</p>
                                              <button
                                                onClick={() => handleDownload(viewingFile.url, viewingFile.name)}
                                                className="mt-4 px-6 py-2 bg-brand-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-brand-500 transition-all"
                                              >
                                                Dosyayı İndir
                                              </button>
                                            </div>
                                          );
                                          return (
                                            <div className="p-16 text-center text-slate-400">
                                              <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                              <p className="text-base font-black uppercase tracking-widest">Önizleme Desteklenmiyor</p>
                                              <a href={url} target="_blank" rel="noreferrer" className="mt-3 px-5 py-2.5 bg-brand-600 text-white rounded-xl font-black uppercase tracking-widest inline-block hover:bg-brand-500 transition-colors text-xs">Dosyayı İndir</a>
                                            </div>
                                          );
                                        })()}
                                      </div>
                                      <div className="p-4 bg-slate-800/80 backdrop-blur-md text-white flex items-center justify-between border-t border-white/5">
                                        <div className="flex items-center space-x-2">
                                          <div className="bg-brand-600 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.2em]">Önizleme</div>
                                          <span className="text-xs font-bold opacity-80">{viewingFile.name}</span>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex-1">
                                  <div className="flex items-center space-x-2">
                                    <div className="w-1 h-4 bg-brand-500 rounded-full" />
                                    <h5 className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-[0.2em]">Ödev Kelimeleri ({selectedAssignment.words?.length || 0})</h5>
                                  </div>
                                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2">
                                    {selectedAssignment.words?.slice((wordPage - 1) * WORDS_PER_PAGE, wordPage * WORDS_PER_PAGE).map((word: any, id: number) => (
                                      <WordCard key={id} word={word} isLearned={learnedWordIds.has(word.id)} onToggle={() => handleToggleLearned(word.id)} />
                                    ))}
                                  </div>
                                </div>
                              </div>
                              {/* Compact Pagination for Assignment Words */}
                              {selectedAssignment.words && selectedAssignment.words.length > WORDS_PER_PAGE && (
                                <div className="flex items-center justify-center space-x-2 mt-auto pt-2">
                                  <button
                                    onClick={() => setWordPage(p => Math.max(1, p - 1))}
                                    disabled={wordPage === 1}
                                    className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
                                  >
                                    <ChevronLeft className="w-3 h-3 text-slate-500" />
                                  </button>
                                  <span className="text-[10px] font-black tabular-nums">
                                    <span className="text-orange-500">{wordPage}</span><span className="text-slate-500 dark:text-slate-400"> / {Math.ceil(selectedAssignment.words.length / WORDS_PER_PAGE)}</span>
                                  </span>
                                  <button
                                    onClick={() => setWordPage(p => Math.min(Math.ceil(selectedAssignment.words.length / WORDS_PER_PAGE), p + 1))}
                                    disabled={wordPage >= Math.ceil(selectedAssignment.words.length / WORDS_PER_PAGE)}
                                    className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
                                  >
                                    <ChevronRight className="w-3 h-3 text-slate-500" />
                                  </button>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="h-full flex flex-col">
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2 flex-1 content-start">
                                {teacherWords.slice((wordPage - 1) * WORDS_PER_PAGE, wordPage * WORDS_PER_PAGE).map((word) => (
                                  <WordCard
                                    key={word.id}
                                    word={word}
                                    isLearned={learnedWordIds.has(word.id)}
                                    isNew={!readWordIds.has(word.id)}
                                    onToggle={() => {
                                      handleToggleLearned(word.id);
                                      markWordAsRead(word.id);
                                    }}
                                  />
                                ))}
                              </div>
                              {/* Compact Pagination for Teacher Words */}
                              {teacherWords.length > WORDS_PER_PAGE && (
                                <div className="flex items-center justify-center space-x-2 mt-auto pt-2">
                                  <button
                                    onClick={() => setWordPage(p => Math.max(1, p - 1))}
                                    disabled={wordPage === 1}
                                    className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
                                  >
                                    <ChevronLeft className="w-3 h-3 text-slate-500" />
                                  </button>
                                  <span className="text-[9px] font-bold text-slate-400">
                                    {wordPage} / {Math.ceil(teacherWords.length / WORDS_PER_PAGE)}
                                  </span>
                                  <button
                                    onClick={() => setWordPage(p => Math.min(Math.ceil(teacherWords.length / WORDS_PER_PAGE), p + 1))}
                                    disabled={wordPage >= Math.ceil(teacherWords.length / WORDS_PER_PAGE)}
                                    className="p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-colors"
                                  >
                                    <ChevronRight className="w-3 h-3 text-slate-500" />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div
                  onClick={() => activeCard !== 'history' && updateStudentCard('history')}
                  className={`transition-all duration-700 ease-in-out ${activeCard === 'history' ? 'lg:flex-[4] w-full' : 'lg:flex-[0.15] w-full lg:w-20 cursor-pointer group'}`}
                >
                  <div className={`bg-[#FAFAFA] dark:bg-slate-900 border-2 border-blue-200 dark:border-slate-800 rounded-[3rem] h-full premium-shadow relative overflow-hidden transition-all duration-500`}>
                    {activeCard !== 'history' ? (
                      <div className="h-full flex flex-col items-center py-12 px-2 relative group-hover:bg-slate-50 dark:group-hover:bg-slate-800/30 transition-colors">
                        <div className="bg-white dark:bg-slate-800 p-3.5 rounded-2xl shadow-md border border-slate-100 dark:border-slate-700 group-hover:scale-110 transition-all duration-500 mb-12">
                          <HistoryIcon className="w-6 h-6 text-brand-600" />
                        </div>
                        <div className="flex-1 flex items-center justify-center">
                          <h3 className="[writing-mode:vertical-lr] rotate-180 text-sm font-black text-slate-500 dark:text-slate-300 group-hover:text-brand-600 transition-all duration-500 uppercase tracking-[0.3em] whitespace-nowrap">
                            Atama Geçmişi
                          </h3>
                        </div>
                        <div className="mt-auto p-3 bg-brand-50 dark:bg-brand-900/20 rounded-2xl border border-brand-100/50 group-hover:bg-brand-500 group-hover:text-white transition-all duration-500">
                          <ArrowRight className="w-4 h-4 text-brand-500 group-hover:text-white" />
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col animate-in fade-in duration-700">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900/50">
                          <div className="flex items-center space-x-2.5">
                            <div className="bg-brand-500 p-1.5 rounded-lg shadow-lg shadow-brand-500/20 text-white">
                              <HistoryIcon className="w-4 h-4" />
                            </div>
                            <div>
                              <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Atama Geçmişi</h3>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Geçmişte sana atananlar</p>
                            </div>
                          </div>
                        </div>

                        <AssignmentHistory
                          assignments={assignments}
                          userId={user.id}
                          onSelect={(a) => {
                            setSelectedAssignment(a);
                            updateStudentCard('study', a.id);
                          }}
                          showDelete={false}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )
          }

          {
            user.role === 'student' && recommendedWords.length > 0 && (
              <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between px-2">
                  <div className="flex items-center space-x-3">
                    <div className="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-500/20 text-white">
                      <TrendingUp className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Sırada Ne Var?</h3>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Yol haritanda ilerlemek için bunları öğren</p>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate(AppTab.PATHWAY)}
                    className="flex items-center space-x-2 text-[9px] font-black uppercase tracking-widest text-brand-600 hover:text-brand-500 transition-colors"
                  >
                    <span>Yol Haritasına Bak</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {recommendedWords.map((word) => (
                    <WordCard
                      key={word.id}
                      word={word}
                      isLearned={learnedWordIds.has(word.id)}
                      isNew={true}
                      onToggle={() => handleToggleLearned(word.id)}
                    />
                  ))}
                </div>
              </div>
            )
          }

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-6">
              <section className="group relative bg-slate-900 rounded-[3.5rem] p-10 md:p-14 text-white overflow-hidden shadow-2xl transition-all hover:shadow-brand-900/40 hover:scale-[1.01] active:scale-[0.98] duration-500 cursor-pointer"
                onClick={() => onNavigate(AppTab.AI_TUTOR)}>
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-600/20 rounded-full blur-[100px] -mr-40 -mt-40 animate-pulse group-hover:bg-brand-500/30 transition-colors"></div>
                <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-600/10 rounded-full blur-[80px] -ml-20 -mb-20"></div>
                <div className="relative z-10 space-y-7">
                  <div className="inline-flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border border-white/10 group-hover:border-white/20 transition-colors backdrop-blur-md">
                    <Sparkles className="w-3.5 h-3.5 text-brand-400 animate-pulse" />
                    <span>Mewo AI Tutor Lab</span>
                  </div>
                  <h3 className="text-2xl md:text-3xl font-black leading-[1.1] tracking-tight group-hover:translate-x-1 transition-transform">
                    Konuşma <br /> <span className="text-brand-400 italic">Yeteneklerini <br /> Geliştir.</span>
                  </h3>
                  <p className="text-slate-400 text-sm md:text-base max-w-xs font-medium leading-relaxed">
                    Yapay zeka eğitmenin Mewo ile 7/24 konuşma pratiği yap ve anlık geri bildirim al.
                  </p>
                  <button
                    className="w-full md:w-auto bg-brand-600 hover:bg-brand-500 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-[0.2em] transition-all shadow-2xl shadow-brand-900/50 flex items-center justify-center group-hover:px-12 active:scale-95"
                  >
                    Pratiğe Başla <ArrowRight className="ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
                  </button>
                </div>
              </section>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <Translator />
              </div>
            </div>
            <div className="lg:col-span-4 space-y-6">
              <LiveTutor />
            </div>
          </div>
        </div >
      )}

      {
        wordToQuiz && (
          <WordQuizModal wordId={wordToQuiz} onClose={(success) => onQuizComplete(success, wordToQuiz)} />
        )
      }
    </div >
  );
};
