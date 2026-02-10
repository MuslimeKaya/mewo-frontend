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
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-6">
                <button
                    onClick={() => setSelectedTopic(null)}
                    className="flex items-center space-x-2 text-slate-500 hover:text-brand-600 font-bold uppercase tracking-widest text-[10px] transition-colors group"
                >
                    <div className="bg-white dark:bg-slate-800 p-2 rounded-xl group-hover:scale-110 transition-transform shadow-sm border border-slate-100 dark:border-slate-700">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span>Gramer Listesine Dön</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-100 dark:border-slate-800 premium-shadow">

                            {/* Topic Header */}
                            <div className="relative border-b border-slate-100 dark:border-slate-800 pb-6 mb-6">
                                <div className="absolute top-0 right-0">
                                    <div className="bg-brand-50 dark:bg-brand-900/30 text-brand-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl">
                                        {selectedTopic.cefr} Level
                                    </div>
                                </div>
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none mb-3">
                                    {selectedTopic.title}
                                </h2>
                                {isCompleted(selectedTopic.id) && (
                                    <div className="flex items-center space-x-2 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10 px-3 py-1.5 rounded-lg w-fit">
                                        <CheckCircle2 className="w-4 h-4" />
                                        <span className="text-[10px] font-black uppercase tracking-wide">Tamamlandı</span>
                                    </div>
                                )}
                            </div>

                            {/* Rich Content Area */}
                            <div className="prose dark:prose-invert prose-base max-w-none 
                                prose-headings:font-black prose-headings:tracking-tight prose-headings:text-slate-900 dark:prose-headings:text-white
                                prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:font-medium prose-p:leading-relaxed
                                prose-strong:text-brand-600 dark:prose-strong:text-brand-400 prose-strong:font-black
                                prose-li:text-slate-600 dark:prose-li:text-slate-400 prose-li:font-bold
                                prose-blockquote:border-l-4 prose-blockquote:border-brand-500 prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-slate-800/50 prose-blockquote:p-4 prose-blockquote:rounded-r-xl prose-blockquote:not-italic
                                prose-table:rounded-xl prose-table:overflow-hidden prose-table:border prose-table:border-slate-200 dark:prose-table:border-slate-800 prose-table:shadow-sm
                                prose-th:bg-brand-50 dark:prose-th:bg-brand-900/20 prose-th:p-3 prose-th:text-brand-700 dark:prose-th:text-brand-300 prose-th:uppercase prose-th:text-[10px] prose-th:tracking-wider
                                prose-td:p-3 prose-td:border-t prose-td:border-slate-100 dark:prose-td:border-slate-800
                                ">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {selectedTopic.description}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Actions */}
                    <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-8 h-fit">
                        <div className="bg-slate-900 rounded-3xl p-6 text-white premium-shadow relative overflow-hidden group">
                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 w-48 h-48 bg-brand-600/20 rounded-full blur-2xl -mr-24 -mt-24 group-hover:bg-brand-600/30 transition-colors" />
                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl -ml-16 -mb-16" />

                            <div className="relative z-10 space-y-3">
                                <div className="space-y-3">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10 shadow-inner">
                                        <PlayCircle className="w-6 h-6 text-brand-300" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black uppercase tracking-tight">Pratik Yap</h4>
                                        <p className="text-slate-400 text-sm font-medium mt-1 leading-relaxed">
                                            {selectedTopic.questions.length} soruluk test ile kendini dene.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => startQuiz(false)}
                                    className="w-full bg-white text-slate-900 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                                >
                                    <span>Teste Başla</span>
                                    <ArrowLeft className="w-3 h-3 rotate-180" />
                                </button>
                            </div>
                        </div>

                        {currentTopicProgress && (
                            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-100 dark:border-slate-800 premium-shadow">
                                <div className="flex items-center space-x-2 mb-4">
                                    <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600">
                                        <Award className="w-5 h-5" />
                                    </div>
                                    <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Başarı Durumu</h5>
                                </div>
                                <div className="flex items-baseline space-x-1">
                                    <span className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">
                                        %{currentTopicProgress.score}
                                    </span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-4 overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-400 to-brand-500 rounded-full"
                                        style={{ width: `${currentTopicProgress.score}%` }}
                                    />
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
            const currentQuestions = isMistakeMode
                ? wrongAnswers.map(idx => selectedTopic.questions[idx])
                : selectedTopic.questions;

            return (
                <div className="min-h-[500px] flex items-center justify-center animate-in zoom-in duration-500">
                    <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-10 max-w-md w-full text-center border border-slate-100 dark:border-slate-800 premium-shadow space-y-6 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-b from-brand-50/50 to-transparent dark:from-brand-900/10 dark:to-transparent pointer-events-none" />

                        <div className="relative z-10">
                            <div className="w-24 h-24 bg-white dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto text-brand-600 shadow-xl shadow-brand-200 dark:shadow-brand-900/20 mb-6 border border-slate-100 dark:border-slate-700">
                                {score > currentQuestions.length / 2 ? (
                                    <Award className="w-12 h-12 text-emerald-500" />
                                ) : (
                                    <GraduationCap className="w-12 h-12 text-amber-500" />
                                )}
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter">
                                    {score > currentQuestions.length / 2 ? 'Harika!' : 'Deneme Bitti'}
                                </h3>
                                <div className="inline-flex items-center space-x-2 bg-slate-100 dark:bg-slate-800 px-5 py-2.5 rounded-xl">
                                    <span className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Skorun:</span>
                                    <span className="text-xl font-black text-slate-900 dark:text-white">
                                        {Math.round((score / currentQuestions.length) * 100)}%
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 relative z-10">
                            {wrongAnswers.length > 0 && !isMistakeMode && (
                                <button
                                    onClick={() => startQuiz(true)}
                                    className="col-span-2 bg-rose-600 hover:bg-rose-700 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-lg shadow-rose-500/30"
                                >
                                    Yanlışlarımı Çalış ({wrongAnswers.length})
                                </button>
                            )}

                            <button
                                onClick={() => startQuiz(false)}
                                className="bg-brand-600 hover:bg-brand-700 text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95 shadow-lg shadow-brand-500/30"
                            >
                                Tekrar Çöz
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
                                className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-95"
                            >
                                Konulara Dön
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
        const cleanQuestion = currentQuestion.question;

        return (
            <div className="flex flex-col items-center justify-center min-h-[500px] animate-in slide-in-from-bottom-8 duration-500 space-y-6 pb-20">
                <div className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-100 dark:border-slate-800 premium-shadow relative overflow-hidden">

                    {isMistakeMode && (
                        <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-black uppercase px-4 py-2 rounded-bl-2xl">
                            Hata Telafi Modu
                        </div>
                    )}

                    {/* Progress Bar */}
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 dark:bg-slate-800">
                        <div
                            className="h-full bg-brand-500 transition-all duration-500 ease-out"
                            style={{ width: `${((currentQuestionIdx + 1) / currentQuestions.length) * 100}%` }}
                        />
                    </div>

                    {/* Quiz Header */}
                    <div className="flex items-center justify-between mb-8 mt-2">
                        <div className="flex items-center space-x-4">
                            <div className="bg-brand-50 dark:bg-brand-900/30 px-3 py-1.5 rounded-lg">
                                <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">
                                    Soru {currentQuestionIdx + 1} <span className="text-brand-300">/ {currentQuestions.length}</span>
                                </span>
                            </div>
                        </div>
                        <button
                            onClick={() => {
                                setQuizMode(false);
                                setIsMistakeMode(false);
                                setWrongAnswers([]);
                            }}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Question */}
                    <div className="space-y-6 mb-8">
                        <h4 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white text-center leading-snug">
                            {cleanQuestion}
                        </h4>

                        {(showHint && currentQuestion.hints?.length > 0) && !isAnswered && (
                            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 p-4 rounded-2xl animate-in fade-in slide-in-from-top-4">
                                <div className="flex items-center space-x-2 text-amber-600 mb-1">
                                    <Sparkles className="w-3 h-3" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">İpucu</span>
                                </div>
                                <p className="text-xs font-bold text-amber-800 dark:text-amber-400">
                                    {currentQuestion.hints[0]}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Options or Input */}
                    {currentQuestion.type === 'fill_in_the_blank' ? (
                        <div className="mb-6">
                            <input
                                type="text"
                                value={textAnswer}
                                onChange={(e) => setTextAnswer(e.target.value)}
                                disabled={isAnswered}
                                placeholder="Cevabınızı buraya yazın..."
                                className={`w-full p-4 rounded-2xl border-2 text-lg font-bold outline-none transition-all
                                    ${isAnswered
                                        ? (textAnswer.toLowerCase() === currentQuestion.correctAnswer.toLowerCase()
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                            : 'border-rose-500 bg-rose-50 text-rose-700')
                                        : 'border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10'
                                    }
                                `}
                            />
                            {isAnswered && textAnswer.toLowerCase() !== currentQuestion.correctAnswer.toLowerCase() && (
                                <div className="mt-3 flex items-center space-x-2 text-emerald-600">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span className="text-sm font-bold">Doğru Cevap: {currentQuestion.correctAnswer}</span>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 mb-6">
                            {currentQuestion.options.map((option: string, i: number) => {
                                let stateStyles = "bg-[#FAFAFA] dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 hover:border-brand-300 dark:hover:border-slate-600";

                                if (selectedOption === option) {
                                    stateStyles = "bg-brand-50 dark:bg-brand-900/30 border border-brand-500 text-brand-700 dark:text-brand-400 ring-2 ring-brand-500/10";
                                }

                                if (isAnswered) {
                                    if (option === currentQuestion.correctAnswer) {
                                        stateStyles = "bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-500 text-emerald-700 dark:text-emerald-400";
                                    } else if (option === selectedOption && option !== currentQuestion.correctAnswer) {
                                        stateStyles = "bg-rose-50 dark:bg-rose-900/30 border border-rose-500 text-rose-700 dark:text-rose-400 opacity-50";
                                    } else {
                                        stateStyles = "opacity-40 grayscale";
                                    }
                                }

                                return (
                                    <button
                                        key={i}
                                        onClick={() => handleOptionSelect(option)}
                                        disabled={isAnswered}
                                        className={`relative p-4 rounded-2xl text-left transition-all duration-200 group ${stateStyles}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black uppercase transition-colors
                                                    ${selectedOption === option ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/30' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400'}
                                                    ${isAnswered && option === currentQuestion.correctAnswer ? '!bg-emerald-500 !text-white !border-emerald-500' : ''}
                                                    ${isAnswered && option === selectedOption && option !== currentQuestion.correctAnswer ? '!bg-rose-500 !text-white !border-rose-500' : ''}
                                                `}>
                                                    {String.fromCharCode(65 + i)}
                                                </div>
                                                <span className="text-base font-bold">{option}</span>
                                            </div>
                                            {isAnswered && option === currentQuestion.correctAnswer && (
                                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                            )}
                                            {isAnswered && option === selectedOption && option !== currentQuestion.correctAnswer && (
                                                <X className="w-5 h-5 text-rose-500" />
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Action Bar / Feedback */}
                    <div className="flex flex-col items-center space-y-4">
                        {!isAnswered ? (
                            <div className="flex items-center justify-between w-full">
                                <button
                                    onClick={() => setShowHint(!showHint)}
                                    className="flex items-center space-x-2 text-slate-400 hover:text-amber-500 font-bold uppercase text-[10px] tracking-widest transition-colors px-4 py-3 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-900/10"
                                >
                                    <Sparkles className="w-4 h-4" />
                                    <span>{showHint ? 'İpucunu Gizle' : 'İpucu Gör'}</span>
                                </button>
                                <button
                                    onClick={handleAnswerSubmit}
                                    disabled={currentQuestion.type === 'fill_in_the_blank' ? !textAnswer.trim() : !selectedOption}
                                    className={`px-8 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all shadow-lg
                                        ${(currentQuestion.type === 'fill_in_the_blank' ? textAnswer.trim() : selectedOption)
                                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-[1.02] active:scale-[0.98]'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-300 dark:text-slate-600 cursor-not-allowed shadow-none'
                                        }`}
                                >
                                    Kontrol Et
                                </button>
                            </div>
                        ) : (
                            <div className="w-full animate-in slide-in-from-bottom-4 space-y-4">
                                {/* Explanation Box */}
                                {currentQuestion.explanation && (
                                    <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-start space-x-3">
                                            <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 mt-0.5">
                                                <Book className="w-4 h-4" />
                                            </div>
                                            <div>
                                                <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Açıklama</h5>
                                                <p className="text-slate-600 dark:text-slate-300 text-sm font-medium leading-relaxed">
                                                    {currentQuestion.explanation}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleNextQuestion}
                                    className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center space-x-2"
                                >
                                    <span>{currentQuestionIdx + 1 < currentQuestions.length ? 'Sonraki Soru' : 'Sonuçları Gör'}</span>
                                    <ArrowLeft className="w-3 h-3 rotate-180" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                        <div className="bg-brand-100 dark:bg-brand-900/30 p-2 rounded-xl">
                            <GraduationCap className="w-5 h-5 text-brand-600" />
                        </div>
                        <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-widest uppercase">Gramer Laboratuvarı</h1>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-bold max-w-xl leading-relaxed">
                        Veritabanımızdaki {topics.length} gramer konusunu keşfet, anlatımları oku ve mini testlerle seviyeni belirle.
                    </p>
                </div>

                {/* Search & Filter Bar */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Konu ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm font-bold shadow-sm focus:ring-2 focus:ring-brand-500/20 outline-none w-full sm:w-48"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        {['A1', 'A2', 'B1', 'B2'].map(level => (
                            <button
                                key={level}
                                onClick={() => setSelectedLevel(selectedLevel === level ? null : level)}
                                className={`px-3 py-2 rounded-xl text-xs font-black transition-colors border
                                    ${selectedLevel === level
                                        ? 'bg-brand-600 text-white border-brand-600'
                                        : 'bg-white dark:bg-slate-900 text-slate-500 border-slate-200 dark:border-slate-800 hover:border-brand-300'
                                    }
                                 `}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <div className="flex flex-col space-y-4 relative">
                {/* Vertical Progress Line */}
                <div className="absolute left-[26px] top-8 bottom-8 w-0.5 bg-slate-200 dark:bg-slate-800 hidden md:block" />

                {filteredTopics.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 font-bold bg-white dark:bg-slate-900 rounded-[2.5rem] border border-dashed border-slate-200 dark:border-slate-800">
                        <div className="flex flex-col items-center space-y-3">
                            <X className="w-10 h-10 text-slate-300" />
                            <p className="uppercase tracking-widest text-[10px]">Aradığınız kriterlere uygun konu bulunamadı</p>
                        </div>
                    </div>
                ) : (
                    filteredTopics.map((topic, idx) => {
                        const completed = isCompleted(topic.id);

                        return (
                            <div
                                key={topic.id}
                                onClick={() => setSelectedTopic(topic)}
                                className={`group relative flex items-center bg-white dark:bg-slate-900 rounded-3xl p-4 md:p-6 border transition-all cursor-pointer hover:shadow-xl hover:translate-x-1 active:scale-[0.99] gap-4 md:gap-8 ${completed
                                        ? 'border-emerald-100 dark:border-emerald-900/20 shadow-sm shadow-emerald-500/5'
                                        : 'border-slate-100 dark:border-slate-800'
                                    }`}
                            >
                                {/* Index Circle */}
                                <div className="relative z-10 shrink-0">
                                    <div className={`w-10 h-10 md:w-14 md:h-14 rounded-2xl flex items-center justify-center font-black transition-all ${completed
                                            ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30 ring-4 ring-emerald-500/10'
                                            : 'bg-slate-900 dark:bg-slate-800 text-white group-hover:bg-brand-600 group-hover:ring-8 group-hover:ring-brand-500/10'
                                        }`}>
                                        <span className="text-sm md:text-lg">{completed ? <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6" /> : (idx + 1)}</span>
                                    </div>

                                    {/* Small indicator for progress */}
                                    {!completed && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-brand-500 rounded-full border-2 border-white dark:border-slate-900 animate-pulse hidden group-hover:block" />
                                    )}
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex flex-wrap items-center gap-2 mb-1.5 overflow-hidden">
                                        <div className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-colors ${completed
                                                ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/50'
                                                : 'bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                                            }`}>
                                            {topic.cefr} Level
                                        </div>
                                        {completed && (
                                            <span className="text-emerald-600 text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                                <Sparkles className="w-3 h-3" />
                                                Done
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-base md:text-xl font-black text-slate-900 dark:text-white tracking-tight uppercase group-hover:text-brand-600 transition-colors truncate">
                                        {topic.title}
                                    </h3>

                                    <p className="text-xs md:text-sm font-medium text-slate-400 line-clamp-1 mt-1">
                                        {topic.description.replace(/###|#|---|-\s|\*\*/g, '').substring(0, 120)}
                                    </p>
                                </div>

                                {/* Right Action */}
                                <div className="hidden sm:flex flex-col items-end gap-2 shrink-0">
                                    <div className="flex items-center space-x-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                        <HelpCircle className="w-4 h-4 text-slate-300" />
                                        <span>{topic.questions?.length || 0} Questions</span>
                                    </div>
                                    <div className={`p-2 rounded-xl transition-all ${completed
                                            ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20'
                                            : 'bg-slate-50 dark:bg-slate-800 text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600'
                                        }`}>
                                        <ChevronRight className={`w-5 h-5 transition-transform ${completed ? '' : 'group-hover:translate-x-1'}`} />
                                    </div>
                                </div>

                                {/* Mobile Arrow Only */}
                                <div className="sm:hidden text-slate-300">
                                    <ChevronRight className="w-5 h-5" />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
