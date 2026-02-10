import React, { useState, useEffect } from 'react';
import {
    Book,
    ChevronRight,
    Award,
    CheckCircle2,
    Lock,
    Sparkles,
    ArrowLeft,
    GraduationCap,
    PlayCircle,
    HelpCircle,
    Check,
    X,
    Loader2
} from 'lucide-react';
import { grammarService } from '../services/grammar';
import { User } from '../types';

interface GrammarViewProps {
    user: User;
}

export const GrammarView: React.FC<GrammarViewProps> = ({ user }) => {
    const [topics, setTopics] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTopic, setSelectedTopic] = useState<any | null>(null);
    const [quizMode, setQuizMode] = useState(false);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [score, setScore] = useState(0);
    const [quizFinished, setQuizFinished] = useState(false);
    const [studentProgress, setStudentProgress] = useState<any[]>([]);

    useEffect(() => {
        fetchTopics();
        fetchProgress();
    }, []);

    const fetchTopics = async () => {
        try {
            const data = await grammarService.getTopics();
            setTopics(data);
        } catch (err) {
            console.error('Topics error:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchProgress = async () => {
        try {
            const data = await grammarService.getProgress();
            setStudentProgress(data);
        } catch (err) {
            console.error('Progress error:', err);
        }
    };

    const isCompleted = (topicId: string) => {
        return studentProgress.some(p => p.topicId === topicId && p.isCompleted);
    };

    const handleFinishQuiz = async () => {
        const finalScore = Math.round((score / selectedTopic.questions.length) * 100);
        try {
            await grammarService.submitResult(selectedTopic.id, finalScore);
            fetchProgress();
        } catch (e) {
            console.error('Submit error:', e);
        }
        setQuizFinished(true);
    };

    const currentTopicProgress = studentProgress.find(p => p.topicId === selectedTopic?.id);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[600px]">
                <Loader2 className="w-12 h-12 text-brand-600 animate-spin" />
            </div>
        );
    }

    if (selectedTopic && !quizMode) {
        return (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-8">
                <button
                    onClick={() => setSelectedTopic(null)}
                    className="flex items-center space-x-2 text-slate-500 hover:text-brand-600 font-bold uppercase tracking-widest text-[10px] transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Gramer Listesine Dön</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 border border-slate-100 dark:border-slate-800 premium-shadow">
                            <div className="flex items-center justify-between mb-8">
                                <div className="space-y-1">
                                    <div className="bg-brand-50 dark:bg-brand-900/30 text-brand-600 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full inline-block">
                                        {selectedTopic.cefr} Level
                                    </div>
                                    <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{selectedTopic.title}</h2>
                                </div>
                                {isCompleted(selectedTopic.id) && (
                                    <div className="bg-emerald-50 text-emerald-600 p-3 rounded-2xl border border-emerald-100 flex items-center space-x-2">
                                        <CheckCircle2 className="w-5 h-5" />
                                        <span className="text-xs font-black uppercase">Tamamlandı</span>
                                    </div>
                                )}
                            </div>

                            <div className="prose dark:prose-invert max-w-none text-slate-600 dark:text-slate-400 font-medium leading-relaxed">
                                {selectedTopic.description.split('\n').map((line: string, i: number) => (
                                    <p key={i} className="mb-4">{line}</p>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-slate-900 rounded-[3rem] p-8 text-white premium-shadow relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/20 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-brand-500/40 transition-colors" />
                            <div className="relative z-10 space-y-6">
                                <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center">
                                    <PlayCircle className="w-6 h-6 text-brand-400" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-black uppercase tracking-tight">Konuyu Pekiştir</h4>
                                    <p className="text-sm text-slate-400 font-medium mt-2">
                                        Hazırsan bu konuyla ilgili mini testi çözüp ilerlemeni kaydet.
                                    </p>
                                </div>
                                <button
                                    onClick={() => setQuizMode(true)}
                                    className="w-full bg-brand-600 hover:bg-brand-500 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95 shadow-xl shadow-brand-900/40"
                                >
                                    Teste Başla
                                </button>
                            </div>
                        </div>

                        {currentTopicProgress && (
                            <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-slate-100 dark:border-slate-800 premium-shadow">
                                <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Son Performansın</h5>
                                <div className="flex items-end justify-between">
                                    <div className="text-4xl font-black text-slate-900 dark:text-white">%{currentTopicProgress.score}</div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase mb-2">Başarı Oranı</div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (quizMode) {
        if (quizFinished) {
            return (
                <div className="flex items-center justify-center h-[600px] animate-in zoom-in duration-500">
                    <div className="bg-white dark:bg-slate-900 rounded-[4rem] p-12 max-w-md w-full text-center border border-slate-100 dark:border-slate-800 premium-shadow space-y-8">
                        <div className="w-24 h-24 bg-brand-50 dark:bg-brand-900/30 rounded-[2rem] flex items-center justify-center mx-auto text-brand-600">
                            <Award className="w-12 h-12" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Test Tamamlandı!</h3>
                            <p className="text-slate-400 font-bold">Skorun: %{Math.round((score / selectedTopic.questions.length) * 100)}</p>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            <button
                                onClick={() => {
                                    setQuizMode(false);
                                    setQuizFinished(false);
                                    setCurrentQuestionIdx(0);
                                    setScore(0);
                                }}
                                className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95"
                            >
                                Konuya Geri Dön
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedTopic(null);
                                    setQuizMode(false);
                                    setQuizFinished(false);
                                }}
                                className="w-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all active:scale-95"
                            >
                                Diğer Konulara Bak
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        const currentQuestion = selectedTopic.questions[currentQuestionIdx];

        return (
            <div className="flex flex-col items-center justify-center min-h-[600px] animate-in slide-in-from-bottom-8 duration-500 space-y-8">
                <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[3.5rem] p-10 border border-slate-100 dark:border-slate-800 premium-shadow">
                    <div className="flex items-center justify-between mb-10">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Soru {currentQuestionIdx + 1} / {selectedTopic.questions.length}</span>
                        <div className="flex-1 max-w-[100px] h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mx-4 overflow-hidden">
                            <div
                                className="h-full bg-brand-600 transition-all duration-500"
                                style={{ width: `${((currentQuestionIdx + 1) / selectedTopic.questions.length) * 100}%` }}
                            />
                        </div>
                        <button onClick={() => setQuizMode(false)} className="text-slate-400 hover:text-rose-500 transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <h4 className="text-2xl font-black text-slate-900 dark:text-white text-center mb-10 leading-relaxed px-4">
                        {currentQuestion.question}
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQuestion.options.map((option: string, i: number) => (
                            <button
                                key={i}
                                onClick={() => {
                                    if (option === currentQuestion.correctAnswer) {
                                        setScore(prev => prev + 1);
                                    }
                                    if (currentQuestionIdx + 1 < selectedTopic.questions.length) {
                                        setCurrentQuestionIdx(prev => prev + 1);
                                    } else {
                                        handleFinishQuiz();
                                    }
                                }}
                                className="p-6 bg-[#FAFAFA] dark:bg-slate-800/50 border-2 border-slate-100 dark:border-slate-800 rounded-3xl text-left text-sm font-black text-slate-700 dark:text-slate-300 hover:border-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all active:scale-[0.98]"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-[10px] font-black text-slate-400 uppercase">
                                        {String.fromCharCode(65 + i)}
                                    </div>
                                    <span>{option}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-700 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                        <div className="bg-brand-100 dark:bg-brand-900/30 p-2.5 rounded-2xl">
                            <GraduationCap className="w-6 h-6 text-brand-600" />
                        </div>
                        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-widest uppercase">Gramer Laboratuvarı</h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 font-bold max-w-xl leading-relaxed">
                        Veritabanımızdaki gerçek gramer konularını keşfet, anlatımları oku ve mini testlerle seviyeni belirle.
                    </p>
                </div>
                <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 px-6 py-4 rounded-[2rem] border border-slate-200 dark:border-slate-800 premium-shadow">
                    <Sparkles className="w-4 h-4 text-brand-500" />
                    <span className="text-xs font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest">
                        {studentProgress.filter(p => p.isCompleted).length} Konu Tamamlandı
                    </span>
                </div>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {topics.map((topic, idx) => {
                    const completed = isCompleted(topic.id);
                    const active = true; // For now all real DB topics are active

                    return (
                        <div
                            key={topic.id}
                            onClick={() => setSelectedTopic(topic)}
                            className={`group relative bg-white dark:bg-slate-900 rounded-[3rem] p-8 border-2 transition-all cursor-pointer hover:shadow-2xl hover:-translate-y-1 active:scale-[0.98] h-full flex flex-col ${completed
                                    ? 'border-emerald-100 dark:border-emerald-900/30 bg-emerald-50/10'
                                    : 'border-slate-200 dark:border-slate-800'
                                }`}
                        >
                            <div className="flex items-center justify-between mb-6">
                                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg ${completed ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-slate-900 dark:bg-brand-600'
                                    }`}>
                                    {completed ? <CheckCircle2 className="w-6 h-6" /> : <Book className="w-5 h-5" />}
                                </div>
                                <div className="text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 px-3 py-1 rounded-full uppercase tracking-widest">
                                    {topic.cefr}
                                </div>
                            </div>

                            <div className="flex-1 space-y-2">
                                <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase group-hover:text-brand-600 transition-colors">
                                    {topic.title}
                                </h3>
                                <p className="text-xs font-bold text-slate-400 line-clamp-2">
                                    {topic.description.replace(/###|#|---|-\s|\*\*/g, '').substring(0, 100)}...
                                </p>
                            </div>

                            <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-50 dark:border-slate-800/50">
                                <div className="flex items-center space-x-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                    <HelpCircle className="w-4 h-4" />
                                    <span>{topic.questions?.length || 0} Soru</span>
                                </div>
                                <div className="text-brand-600 group-hover:translate-x-1 transition-transform">
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
