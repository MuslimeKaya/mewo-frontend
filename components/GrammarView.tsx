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
    HelpCircle,
    Check,
    X,
    Loader2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
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
    const [showHint, setShowHint] = useState(false);

    useEffect(() => {
        fetchTopics();
        fetchProgress();
    }, []);

    const fetchTopics = async () => {
        try {
            const data = await grammarService.getTopics();
            // Sort by order and then title
            const sortedData = [...data].sort((a, b) => (a.order || 999) - (b.order || 999));
            setTopics(sortedData);
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

    // State management for detailed quiz flow
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [textAnswer, setTextAnswer] = useState('');
    const [isAnswered, setIsAnswered] = useState(false);
    const [showExplanation, setShowExplanation] = useState(false);
    const [wrongAnswers, setWrongAnswers] = useState<number[]>([]);
    const [isMistakeMode, setIsMistakeMode] = useState(false);

    // Sync with URL for initial topic selection and URL updates
    useEffect(() => {
        if (loading || topics.length === 0) return;

        const path = typeof window !== 'undefined' ? window.location.pathname : '';
        if (path.startsWith('/grammar/')) {
            const topicIdFromUrl = path.split('/')[2];
            if (topicIdFromUrl && (!selectedTopic || (selectedTopic.kaId !== topicIdFromUrl && selectedTopic.id !== topicIdFromUrl))) {
                const topic = topics.find(t => t.kaId === topicIdFromUrl || t.id === topicIdFromUrl);
                if (topic) {
                    setSelectedTopic(topic);
                }
            }
        }
    }, [topics, loading]);

    useEffect(() => {
        if (typeof window === 'undefined' || loading) return;

        if (selectedTopic) {
            const topicId = selectedTopic.kaId || selectedTopic.id;
            const newPath = `/grammar/${topicId}`;
            if (window.location.pathname !== newPath) {
                window.history.pushState({}, '', newPath);
            }
        } else if (window.location.pathname.startsWith('/grammar/')) {
            // Only clear the URL sub-path if loading is finished and no topic stays selected
            window.history.pushState({}, '', '/grammar');
        }
    }, [selectedTopic, loading]);

    // Search & Filter State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

    // Filter topics based on search and level
    const filteredTopics = topics.filter(topic => {
        const matchesSearch = topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            topic.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesLevel = selectedLevel ? topic.cefr === selectedLevel : true;
        return matchesSearch && matchesLevel;
    });

    // Reset quiz state when starting new quiz
    const startQuiz = (mistakeMode = false) => {
        setQuizMode(true);
        setCurrentQuestionIdx(0);
        setScore(0);
        setQuizFinished(false);
        setIsMistakeMode(mistakeMode);

        if (!mistakeMode) {
            setWrongAnswers([]);
        }

        resetQuestionState();
    };

    const resetQuestionState = () => {
        setSelectedOption(null);
        setTextAnswer('');
        setIsAnswered(false);
        setShowExplanation(false);
        setShowHint(false);
    };

    const handleOptionSelect = (option: string) => {
        if (isAnswered) return;
        setSelectedOption(option);
    };

    const handleAnswerSubmit = () => {
        if (isAnswered) return;

        const currentQuestions = isMistakeMode
            ? wrongAnswers.map(idx => selectedTopic.questions[idx])
            : selectedTopic.questions;
        const currentQuestion = currentQuestions[currentQuestionIdx];

        let isCorrect = false;

        if (currentQuestion.type === 'fill_in_the_blank') {
            if (!textAnswer.trim()) return;
            isCorrect = textAnswer.trim().toLowerCase() === currentQuestion.correctAnswer.toLowerCase();
        } else {
            if (!selectedOption) return;
            isCorrect = selectedOption === currentQuestion.correctAnswer;
        }

        setIsAnswered(true);

        if (isCorrect) {
            setScore(prev => prev + 1);
        } else {
            // Track wrong answer index (from original array)
            const originalIndex = selectedTopic.questions.findIndex((q: any) => q.question === currentQuestion.question);
            if (!wrongAnswers.includes(originalIndex)) {
                setWrongAnswers(prev => [...prev, originalIndex]);
            }
        }
        setShowExplanation(true);
    };

    const handleNextQuestion = () => {
        const currentQuestions = isMistakeMode
            ? wrongAnswers.map(idx => selectedTopic.questions[idx])
            : selectedTopic.questions;

        if (currentQuestionIdx + 1 < currentQuestions.length) {
            setCurrentQuestionIdx(prev => prev + 1);
            resetQuestionState();
        } else {
            handleFinishQuiz();
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[500px]">
                <Loader2 className="w-10 h-10 text-brand-600 animate-spin" />
            </div>
        );
    }

    if (selectedTopic && !quizMode) {
        return (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 max-w-7xl mx-auto px-4 pb-20">
                {/* Clean Back Navigation */}
                <button
                    onClick={() => setSelectedTopic(null)}
                    className="flex items-center space-x-2 text-slate-500 hover:text-slate-900 font-bold uppercase text-[10px] tracking-widest mb-8 transition-colors"
                >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>LİSTEYE DÖN</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    {/* LEFT: CONTENT CARD */}
                    <div className="lg:col-span-8">
                        <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden">
                            {/* Header */}
                            <div className="px-6 md:px-8 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/20">
                                {isCompleted(selectedTopic.id) && (
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                                            TAMAMLANDI
                                        </span>
                                    </div>
                                )}
                                <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-normal leading-tight mb-0">
                                    {selectedTopic.title}
                                </h2>
                            </div>

                            <div className="px-6 md:px-8 py-4">
                                {/* THE RULES */}
                                <div className="prose dark:prose-invert prose-lg max-w-none 
                                    prose-headings:text-slate-900 dark:prose-headings:text-white prose-headings:font-black prose-headings:tracking-tighter
                                    prose-h1:hidden
                                    prose-h2:text-xs prose-h2:font-bold prose-h2:uppercase prose-h2:tracking-[0.15em] prose-h2:mt-10 prose-h2:mb-5 prose-h2:pb-3 prose-h2:border-b prose-h2:border-slate-100 dark:prose-h2:border-slate-800 prose-h2:text-brand-600
                                    prose-h3:text-sm prose-h3:font-bold prose-h3:mt-6 prose-h3:mb-3
                                    prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-[1.8] prose-p:text-[15px] prose-p:mb-4 prose-p:tracking-normal
                                    prose-strong:text-slate-900 dark:prose-strong:text-brand-400 prose-strong:font-bold prose-strong:bg-slate-100/50 dark:prose-strong:bg-slate-800/50 prose-strong:px-1.5 prose-strong:py-0.5 prose-strong:rounded-md
                                    prose-li:text-slate-600 dark:prose-li:text-slate-400 prose-li:text-[15px] prose-li:my-2 prose-li:leading-[1.8]
                                    prose-table:w-full prose-table:my-8 prose-table:border-collapse
                                    prose-th:bg-slate-900 dark:prose-th:bg-slate-800 prose-th:text-white dark:prose-th:text-slate-100 prose-th:p-3 prose-th:text-[10px] prose-th:font-bold prose-th:uppercase prose-th:tracking-[0.1em]
                                    prose-td:p-3 prose-td:border-b prose-td:border-slate-100 dark:prose-td:border-slate-800 prose-td:text-slate-700 dark:prose-td:text-slate-300 prose-td:font-medium prose-td:text-sm
                                    prose-blockquote:border-l-0 prose-blockquote:my-8 prose-blockquote:p-0
                                ">
                                    <ReactMarkdown
                                        remarkPlugins={[remarkGfm]}
                                        components={{
                                            blockquote: ({ node, ...props }) => (
                                                <div className="my-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border-2 border-slate-900 dark:border-slate-800">
                                                    <div className="flex items-center gap-2 text-slate-900 dark:text-white font-black uppercase text-[9px] tracking-widest mb-1">
                                                        <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                                                        TEMEL KURAL
                                                    </div>
                                                    <div className="text-slate-800 dark:text-slate-200 indent-0 not-italic font-bold text-sm leading-tight">
                                                        {props.children}
                                                    </div>
                                                </div>
                                            ),
                                            strong: ({ node, ...props }) => (
                                                <strong className="text-slate-900 dark:text-white font-black underline decoration-brand-500/30 decoration-4 underline-offset-4" {...props} />
                                            )
                                        }}
                                    >
                                        {selectedTopic.description}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: QUIZ ACTION CARD */}
                    <div className="lg:col-span-4 lg:sticky lg:top-24">
                        <div className="bg-slate-900 dark:bg-slate-800 p-5 rounded-[1.5rem] text-center space-y-4 shadow-2xl shadow-slate-900/40 relative overflow-hidden group">
                            {/* Decorative Background Element */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-brand-500/20 transition-colors" />

                            <div className="relative z-10 space-y-4">
                                <div className="space-y-3">
                                    <p className="text-slate-200 text-[15px] font-normal leading-[1.7] tracking-normal opacity-100">
                                        Kuralları incelediysen öğrenmeni pekiştirmek için hemen teste başla.
                                    </p>
                                </div>

                                <div className="pt-4">
                                    <button
                                        onClick={() => startQuiz(false)}
                                        className="w-full py-4 bg-white text-slate-900 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/95 active:scale-[0.98] transition-all shadow-xl shadow-white/5 flex items-center justify-center gap-2 group/btn"
                                    >
                                        <span>TESTE BAŞLA</span>
                                        <ArrowLeft className="w-3.5 h-3.5 rotate-180 transform group-hover/btn:translate-x-1 transition-transform" />
                                    </button>
                                </div>

                                <div className="pt-6 border-t border-white/10 flex items-center justify-center gap-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <div className="flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                                        <span>KONUYU TAMAMLA</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Additional Info / Success Stats could go here */}
                        <div className="mt-6 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                            <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/20 rounded-xl flex items-center justify-center text-brand-600">
                                <Award className="w-5 h-5" />
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Başarı Puanı</p>
                                <p className="text-sm font-black text-slate-900 dark:text-white">Min. %70 Hedefi</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }


    if (quizMode) {
        if (quizFinished) {
            const currentQuestions = isMistakeMode
                ? wrongAnswers.map(idx => selectedTopic.questions[idx])
                : selectedTopic.questions;

            return (
                <div className="min-h-[400px] flex items-center justify-center animate-in zoom-in duration-300">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 max-w-sm w-full text-center border border-slate-100 dark:border-slate-800 shadow-xl space-y-5">
                        <div className="w-16 h-16 bg-brand-50 dark:bg-brand-900/20 rounded-2xl flex items-center justify-center mx-auto text-brand-600 mb-2">
                            {score > currentQuestions.length / 2 ? (
                                <Award className="w-8 h-8 text-emerald-500" />
                            ) : (
                                <GraduationCap className="w-8 h-8 text-amber-500" />
                            )}
                        </div>

                        <div className="space-y-1">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                                {score > currentQuestions.length / 2 ? 'Tebrikler!' : 'Tamamlandı'}
                            </h3>
                            <p className="text-sm text-slate-500 font-medium">Testi tamamladınız.</p>
                        </div>

                        <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-3">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Skor</div>
                            <div className="text-2xl font-bold text-slate-900 dark:text-white">
                                {Math.round((score / currentQuestions.length) * 100)}%
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 pt-2">
                            {wrongAnswers.length > 0 && !isMistakeMode && (
                                <button
                                    onClick={() => startQuiz(true)}
                                    className="col-span-2 bg-rose-50 text-rose-600 hover:bg-rose-100 py-3 rounded-xl font-bold text-xs transition-colors"
                                >
                                    Hataları Gözden Geçir ({wrongAnswers.length})
                                </button>
                            )}

                            <button
                                onClick={() => startQuiz(false)}
                                className="bg-brand-600 hover:bg-brand-700 text-white py-3 rounded-xl font-bold text-xs transition-colors"
                            >
                                Tekrarla
                            </button>
                            <button
                                onClick={() => {
                                    setSelectedTopic(null);
                                    setQuizMode(false);
                                    setQuizFinished(false);
                                    setShowHint(false);
                                    setIsMistakeMode(false);
                                    setWrongAnswers([]);
                                }}
                                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 py-3 rounded-xl font-bold text-xs transition-colors"
                            >
                                Çıkış
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        const currentQuestions = isMistakeMode
            ? wrongAnswers.map(idx => selectedTopic.questions[idx])
            : selectedTopic.questions;
        const currentQuestion = currentQuestions[currentQuestionIdx];

        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] animate-in slide-in-from-bottom-4 duration-300 pb-10">
                <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 border border-slate-100 dark:border-slate-800 shadow-lg relative overflow-hidden">

                    {isMistakeMode && (
                        <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold uppercase px-3 py-1.5 rounded-bl-xl">
                            Hata Telafi
                        </div>
                    )}

                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-slate-100 dark:bg-slate-800">
                        <div
                            className="h-full bg-brand-500 transition-all duration-300 ease-out"
                            style={{ width: `${((currentQuestionIdx + 1) / currentQuestions.length) * 100}%` }}
                        />
                    </div>

                    {/* Quiz Navigation */}
                    <div className="flex items-center justify-between mb-6 mt-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Soru <span className="text-slate-900 dark:text-white">{currentQuestionIdx + 1}</span> / {currentQuestions.length}
                        </span>
                        <button
                            onClick={() => {
                                setQuizMode(false);
                                setIsMistakeMode(false);
                                setWrongAnswers([]);
                            }}
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Question */}
                    <div className="space-y-4 mb-8">
                        <h4 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white text-center leading-relaxed">
                            {currentQuestion.question}
                        </h4>

                        {(showHint && currentQuestion.hints?.length > 0) && !isAnswered && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 p-3 rounded-xl animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center space-x-2 text-amber-600 mb-1">
                                    <Sparkles className="w-3 h-3" />
                                    <span className="text-[10px] font-bold uppercase">İpucu</span>
                                </div>
                                <p className="text-xs text-amber-800 dark:text-amber-400 font-medium">
                                    {currentQuestion.hints[0]}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Content Body */}
                    {currentQuestion.type === 'fill_in_the_blank' ? (
                        <div className="mb-6">
                            <input
                                type="text"
                                value={textAnswer}
                                onChange={(e) => setTextAnswer(e.target.value)}
                                disabled={isAnswered}
                                placeholder="Cevabınızı yazın..."
                                className={`w-full p-3.5 rounded-xl border text-base font-medium outline-none transition-all
                                    ${isAnswered
                                        ? (textAnswer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase()
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                            : 'border-rose-500 bg-rose-50 text-rose-700')
                                        : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10'
                                    }
                                `}
                            />
                            {isAnswered && textAnswer.toLowerCase() !== currentQuestion.correctAnswer.toLowerCase() && (
                                <div className="mt-2 flex items-center space-x-1.5 text-emerald-600 text-sm font-medium">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Doğru: {currentQuestion.correctAnswer}</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-2.5 mb-6">
                            {currentQuestion.options.map((option: string, i: number) => {
                                let stateStyles = "bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-brand-300 dark:hover:border-slate-600";

                                if (selectedOption === option) {
                                    stateStyles = "bg-brand-50 dark:bg-brand-900/20 border border-brand-500 text-brand-700 dark:text-brand-400";
                                }

                                if (isAnswered) {
                                    if (option === currentQuestion.correctAnswer) {
                                        stateStyles = "bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-500 text-emerald-700 dark:text-emerald-400";
                                    } else if (option === selectedOption && option !== currentQuestion.correctAnswer) {
                                        stateStyles = "bg-rose-50 dark:bg-rose-900/20 border border-rose-500 text-rose-700 dark:text-rose-400 opacity-60";
                                    } else {
                                        stateStyles = "opacity-40 grayscale";
                                    }
                                }

                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleOptionSelect(option)}
                                        disabled={isAnswered}
                                        className={`relative p-3.5 rounded-xl text-left transition-all duration-200 group ${stateStyles}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold uppercase transition-colors
                                                    ${selectedOption === option ? 'bg-brand-500 text-white' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-400'}
                                                    ${isAnswered && option === currentQuestion.correctAnswer ? '!bg-emerald-500 !text-white !border-emerald-500' : ''}
                                                    ${isAnswered && option === selectedOption && option !== currentQuestion.correctAnswer ? '!bg-rose-500 !text-white !border-rose-500' : ''}
                                                `}>
                                                    {String.fromCharCode(65 + i)}
                                                </div>
                                                <span className="text-sm font-medium">{option}</span>
                                            </div>
                                            {isAnswered && option === currentQuestion.correctAnswer && (
                                                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Bottom Actions */}
                    <div className="flex flex-col items-center">
                        {!isAnswered ? (
                            <div className="flex items-center justify-between w-full gap-3">
                                <button
                                    onClick={() => setShowHint(!showHint)}
                                    className="flex items-center justify-center space-x-2 text-slate-400 hover:text-amber-500 font-bold uppercase text-[10px] tracking-wide transition-colors h-12 px-4 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/10 border border-transparent hover:border-amber-100"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    <span>{showHint ? 'Gizle' : 'İpucu'}</span>
                                </button>
                                <button
                                    onClick={handleAnswerSubmit}
                                    disabled={currentQuestion.type === 'fill_in_the_blank' ? !textAnswer.trim() : !selectedOption}
                                    className={`flex-1 h-12 rounded-xl font-bold text-xs uppercase tracking-wider transition-all
                                        ${(currentQuestion.type === 'fill_in_the_blank' ? textAnswer.trim() : selectedOption)
                                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90 active:scale-[0.98]'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed'
                                        }`}
                                >
                                    Kontrol Et
                                </button>
                            </div>
                        ) : (
                            <div className="w-full animate-in slide-in-from-bottom-2 space-y-4">
                                {currentQuestion.explanation && (
                                    <div className="bg-blue-50 dark:bg-blue-900/10 p-3.5 rounded-xl border border-blue-100 dark:border-blue-900/20">
                                        <div className="flex items-start space-x-2.5">
                                            <div className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600">
                                                <Book className="w-3 h-3" />
                                            </div>
                                            <div className="space-y-1">
                                                <h5 className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Açıklama</h5>
                                                <p className="text-slate-600 dark:text-slate-300 text-xs font-medium leading-relaxed">
                                                    {currentQuestion.explanation}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleNextQuestion}
                                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 h-12 rounded-xl font-bold text-xs uppercase tracking-wider transition-all hover:opacity-90 active:scale-[0.98] flex items-center justify-center space-x-2"
                                >
                                    <span>{currentQuestionIdx + 1 < currentQuestions.length ? 'Sonraki' : 'Bitir'}</span>
                                    <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 py-6 overflow-hidden">
            {/* Cool Mesh Gradient Background */}
            <div className="absolute inset-0 pointer-events-none -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-brand-500/5 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] rounded-full bg-indigo-500/5 blur-[120px]" />
                <div className="absolute top-[20%] right-[15%] w-[25%] h-[25%] rounded-full bg-emerald-500/5 blur-[100px]" />
            </div>

            <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center space-x-3">
                            <div className="bg-white dark:bg-slate-900 p-2.5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
                                <GraduationCap className="w-6 h-6 text-brand-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-extrabold tracking-normal text-transparent bg-clip-text bg-gradient-to-r from-slate-900 via-brand-600 to-indigo-600 dark:from-white dark:via-brand-400 dark:to-indigo-400">
                                    Gramer Gelişim Yolu
                                </h1>
                                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                                    Dil bilgisini adım adım, etkileşimli bir rota üzerinde keşfet.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex gap-1 bg-white/50 dark:bg-slate-800/50 backdrop-blur-md p-1 rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                            {['A1', 'A2', 'B1', 'B2'].map(level => (
                                <button
                                    key={level}
                                    onClick={() => setSelectedLevel(selectedLevel === level ? null : level)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all
                                        ${selectedLevel === level
                                            ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm'
                                            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                                        }
                                    `}
                                >
                                    {level}
                                </button>
                            ))}
                        </div>
                    </div>
                </header>

                {/* Minimalist Path List */}
                <div className="max-w-xl mx-auto relative">
                    {filteredTopics.length === 0 ? (
                        <div className="py-20 text-center text-slate-400 bg-slate-50/50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                            <X className="w-10 h-10 mx-auto mb-3 opacity-20" />
                            <p className="text-sm font-medium">Konu bulunamadı</p>
                        </div>
                    ) : (
                        <div className="space-y-0">
                            {filteredTopics.map((topic, idx) => {
                                const completed = isCompleted(topic.id);
                                const isLast = idx === filteredTopics.length - 1;

                                return (
                                    <div
                                        key={topic.id}
                                        onClick={() => setSelectedTopic(topic)}
                                        className="group relative pl-16 pb-8 cursor-pointer transition-all active:scale-[0.98]"
                                    >
                                        {/* Timeline Connector Line */}
                                        {!isLast && (
                                            <div className="absolute left-[22px] top-12 bottom-0 w-[2px] bg-slate-100 dark:bg-slate-800 transition-colors group-hover:bg-brand-100 dark:group-hover:bg-brand-900/30" />
                                        )}

                                        {/* Step Circle */}
                                        <div className={`absolute left-0 top-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 z-10
                                        ${completed
                                                ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 ring-4 ring-emerald-50 dark:ring-emerald-900/10'
                                                : 'bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 group-hover:border-brand-500'
                                            }`}
                                        >
                                            {completed ? (
                                                <Check className="w-5 h-5 stroke-[3]" />
                                            ) : (
                                                <span className={`text-sm font-bold ${completed ? 'text-white' : 'text-slate-400 group-hover:text-brand-600'}`}>
                                                    {idx + 1}
                                                </span>
                                            )}
                                        </div>

                                        {/* Text Content - No Card Background */}
                                        <div className="space-y-1">
                                            {completed && (
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded uppercase">
                                                        Tamamlandı
                                                    </span>
                                                </div>
                                            )}

                                            <h3 className="text-base font-semibold text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors tracking-normal">
                                                {topic.title}
                                            </h3>

                                            <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg">
                                                {topic.description.replace(/###|#|---|-\s|\*\*/g, '').substring(0, 85)}...
                                            </p>

                                            <div className="flex items-center gap-4 pt-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide opacity-0 group-hover:opacity-100 transition-all transform -translate-x-2 group-hover:translate-x-0">
                                                <span className="flex items-center gap-1">
                                                    <HelpCircle className="w-3.5 h-3.5" />
                                                    {topic.questions?.length || 0} Soru
                                                </span>
                                                <span className="flex items-center gap-1 text-brand-600">
                                                    İncele <ChevronRight className="w-3.5 h-3.5" />
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
