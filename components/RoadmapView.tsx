
import React, { useState, useEffect } from 'react';
import { LearningPathItem } from '../types';
import { Map, Trophy, Star, ChevronRight, Lock, BookOpen, Crown, Activity, CheckCircle2, Clock, Sparkles, Loader2 } from 'lucide-react';
import { wordsService } from '../services/words';
import { LevelExamModal } from './LevelExamModal';

export const RoadmapView: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [progressData, setProgressData] = useState<any[]>([]);

  const [examModalOpen, setExamModalOpen] = useState(false);
  const [examLevel, setExamLevel] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('mewo_user');
    if (userStr) {
      setUser(JSON.parse(userStr));
    }

    // Initial fetch
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      const data = await wordsService.getStudentProgress();
      setProgressData(data);

      // Aktif seviyeyi AI context'i için kaydet
      const activeLevel = data.find(p => p.percentage < 100)?.level || 'A1';
      localStorage.setItem('mewo_student_level', activeLevel);
    } catch (err) {
      console.error('Progress fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const startExam = (level: string) => {
    setExamLevel(level);
    setExamModalOpen(true);
  };

  const getLearningPath = (): LearningPathItem[] => {
    const levels = [
      { id: '1', level: 'A1' as const, title: 'A1: Breakthrough', category: 'Grammar', description: 'Temel selamlaşmalar, kişisel bilgiler ve basit günlük ifadeler.' },
      { id: '2', level: 'A2' as const, title: 'A2: Elementary', category: 'Grammar', description: 'Ortak ifadeler, aile bilgileri, alışveriş ve yerel coğrafya.' },
      { id: '3', level: 'B1' as const, title: 'B1: Intermediate', category: 'Speaking', description: 'Standart konular, iş, okul ve seyahat durumlarını yönetme.' },
      { id: '4', level: 'B2' as const, title: 'B2: Upper Intermediate', category: 'Conversation', description: 'Teknik tartışmalar, soyut konular ve akıcı etkileşimler.' },
      { id: '5', level: 'C1' as const, title: 'C1: Advanced', category: 'Business', description: 'İnce anlamlar, organizasyonel yapılar ve sosyal esneklik.' },
    ];

    let previousComplete = true; // İlk seviye açık başlasın

    return levels.map((lvl) => {
      const p = progressData.find(pd => pd.level === lvl.level) || { percentage: 0, learned: 0, total: 0 };

      const isWordsComplete = p.percentage >= 100 && p.total > 0;
      let status: LearningPathItem['status'] = 'Locked';

      if (isWordsComplete) {
        status = 'Complete';
      } else if (previousComplete) {
        status = 'Active';
      } else {
        status = 'Locked';
      }

      // Chain logic: Eğer bu level complete değilse, bir sonraki 'Active' olamaz (eğer bu active ise kendisi active kalır, bir sonraki locked olur)
      if (status !== 'Complete') previousComplete = false;

      return {
        ...lvl,
        status,
        percentage: p.percentage,
        learned: p.learned,
        total: p.total
      };
    });
  };

  const getStatusIcon = (status: LearningPathItem['status']) => {
    switch (status) {
      case 'Complete': return <CheckCircle2 className="w-6 h-6 text-emerald-500" />;
      case 'Active': return <Clock className="w-6 h-6 text-brand-500 animate-pulse" />;
      case 'Locked': return <Lock className="w-6 h-6 text-slate-300 dark:text-slate-600" />;
    }
  };

  const getStatusStyle = (status: LearningPathItem['status']) => {
    switch (status) {
      case 'Complete': return 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30';
      case 'Active': return 'bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-400 border-brand-200 dark:border-brand-800 shadow-sm';
      case 'Locked': return 'bg-slate-100 dark:bg-slate-800/50 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="w-10 h-10 text-brand-500 animate-spin" />
        <p className="text-slate-500 font-medium">Yol haritası hazırlanıyor...</p>
      </div>
    );
  }

  const learningPath = getLearningPath();

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-500 max-w-4xl mx-auto px-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl md:text-3xl font-extrabold tracking-normal text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-brand-600 to-indigo-600 dark:from-white dark:via-brand-400 dark:to-indigo-400">
          Öğrenme Yolculuğun
        </h2>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Sıfırdan tam akıcılığa yapılandırılmış ilerleme.</p>
      </div>

      <div className="relative space-y-6 pb-12">
        <div className="absolute left-8 top-4 bottom-4 w-0.5 bg-slate-200 dark:bg-slate-800 -z-10"></div>

        {learningPath.map((item) => (
          <div
            key={item.id}
            className={`group relative flex items-start space-x-6 p-6 rounded-[2.5rem] border transition-all duration-300 ${item.status === 'Active'
              ? 'bg-white dark:bg-slate-900 shadow-2xl scale-[1.02] border-brand-300 dark:border-brand-800'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-brand-200 hover:shadow-xl hover:scale-[1.01]'
              } ${item.status === 'Locked' ? 'opacity-70 dark:opacity-50 grayscale' : ''}`}
          >
            <div className={`mt-1 bg-white dark:bg-slate-900 p-1 rounded-full z-10 group-hover:scale-110 transition-transform`}>
              {getStatusIcon(item.status)}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-lg group-hover:text-brand-600 transition-colors">{item.title}</h3>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border tracking-widest ${getStatusStyle(item.status)}`}>
                    {item.status === 'Complete' ? 'TAMAMLANDI' : item.status === 'Active' ? 'AKTİF' : 'KİLİTLİ'}
                  </span>
                </div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg">
                  {item.category}
                </span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{item.description}</p>

              <div className="mt-4 flex items-center space-x-4">
                <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-1000 ${item.status === 'Complete' ? 'bg-emerald-500' : 'bg-brand-500'
                      }`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
                <div className="flex flex-col items-end">
                  <span className={`text-xs font-bold ${item.status === 'Complete' ? 'text-emerald-600' : 'text-brand-600'}`}>
                    %{item.percentage} Tamamlandı
                  </span>
                  <span className="text-[9px] text-slate-400 font-medium">
                    {item.learned} / {item.total} Kelime
                  </span>
                </div>
              </div>

              {item.status === 'Complete' && (
                <button
                  onClick={(e) => { e.stopPropagation(); startExam(item.level); }}
                  className="mt-4 w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-500/20 text-xs"
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Seviye Tespit Sınavı</span>
                </button>
              )}
            </div>

            {item.status === 'Active' && (
              <div className="absolute -top-3 -right-3 bg-amber-400 p-2 rounded-full shadow-lg group-hover:rotate-12 transition-transform">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
            )}
          </div>
        ))}
      </div>

      {examModalOpen && examLevel && (
        <LevelExamModal
          level={examLevel}
          onClose={() => {
            setExamModalOpen(false);
            setExamLevel(null);
            fetchProgress(); // Sınav sonrası progress güncelle
          }}
        />
      )}
    </div>
  );
};
