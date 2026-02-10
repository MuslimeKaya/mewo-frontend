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
            <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
                <button
                    onClick={() => setSelectedTopic(null)}
                    className="flex items-center space-x-2 text-slate-500 hover:text-brand-600 font-medium text-xs transition-colors group"
                >
                    <div className="bg-white dark:bg-slate-800 p-1.5 rounded-lg group-hover:bg-brand-50 dark:group-hover:bg-brand-900/20 transition-colors border border-slate-200 dark:border-slate-700">
                        <ArrowLeft className="w-3.5 h-3.5" />
                    </div>
                    <span>Gramer Listesine Dön</span>
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 space-y-4">
                        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm">

                            {/* Topic Header */}
                            <div className="border-b border-slate-100 dark:border-slate-800 pb-4 mb-6 flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <div className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${isCompleted(selectedTopic.id)
                                            ? 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:border-emerald-800/20'
                                            : 'bg-brand-50 text-brand-600 border-brand-100 dark:bg-brand-900/20 dark:border-brand-800/20'
                                        }`}>
                                        {selectedTopic.cefr} Seviye
                                    </div>
                                    {isCompleted(selectedTopic.id) && (
                                        <div className="flex items-center space-x-1.5 text-emerald-600 bg-emerald-50 dark:bg-emerald-900/10 px-2.5 py-1 rounded-md">
                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                            <span className="text-[10px] font-bold uppercase tracking-wide">Tamamlandı</span>
                                        </div>
                                    )}
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                                    {selectedTopic.title}
                                </h2>
                            </div>

                            {/* Rich Content Area */}
                            <div className="prose dark:prose-invert prose-sm max-w-none 
                                prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-slate-900 dark:prose-headings:text-white
                                prose-p:text-slate-600 dark:prose-p:text-slate-400 prose-p:leading-relaxed
                                prose-strong:text-brand-600 dark:prose-strong:text-brand-400 prose-strong:font-bold
                                prose-li:text-slate-600 dark:prose-li:text-slate-400
                                prose-blockquote:border-l-2 prose-blockquote:border-brand-500 prose-blockquote:bg-slate-50 dark:prose-blockquote:bg-slate-800/50 prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r-lg prose-blockquote:not-italic
                                prose-code:text-brand-600 dark:prose-code:text-brand-400 prose-code:bg-brand-50 dark:prose-code:bg-brand-900/20 prose-code:px-1 prose-code:rounded prose-code:font-medium
                                prose-th:bg-slate-50 dark:prose-th:bg-slate-800/50 prose-th:p-2 prose-th:text-xs prose-th:uppercase
                                prose-td:p-2 prose-td:border-t prose-td:border-slate-100 dark:prose-td:border-slate-800
                                ">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {selectedTopic.description}
                                </ReactMarkdown>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Actions */}
                    <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-8 h-fit">
                        <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-lg relative overflow-hidden group">
                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-full blur-xl -mr-16 -mt-16 group-hover:bg-brand-500/20 transition-colors" />

                            <div className="relative z-10 space-y-4">
                                <div className="flex items-start space-x-3">
                                    <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/5">
                                        <PlayCircle className="w-5 h-5 text-brand-300" />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-bold">Pratik Yap</h4>
                                        <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                                            {selectedTopic.questions.length} soruluk test ile kendini dene.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => startQuiz(false)}
                                    className="w-full bg-white text-slate-900 py-3 rounded-xl font-bold text-xs hover:bg-brand-50 transition-colors flex items-center justify-center space-x-2"
                                >
                                    <span>Teste Başla</span>
                                    <ArrowLeft className="w-3 h-3 rotate-180" />
                                </button>
                            </div>
                        </div>

                        {currentTopicProgress && (
                            <div className="bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center space-x-2">
                                        <div className="p-1.5 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg text-emerald-600">
                                            <Award className="w-4 h-4" />
                                        </div>
                                        <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wide">Başarı</h5>
                                    </div>
                                    <span className="text-xl font-bold text-slate-900 dark:text-white">
                                        %{currentTopicProgress.score}
                                    </span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
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

    // Main Topic List View
    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-20">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 py-2">
                <div className="space-y-1">
                    <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                        <span className="p-1.5 bg-brand-100 dark:bg-brand-900/40 rounded-lg text-brand-600">
                            <GraduationCap className="w-5 h-5" />
                        </span>
                        Gramer
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium">
                        {topics.length} konu ile dil bilgisi çalışmaları.
                    </p>
                </div>

                {/* Compact Search & Filter */}
                <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative group">
                        <input
                            type="text"
                            placeholder="Konu ara..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-medium shadow-sm focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none w-full sm:w-40 transition-all"
                        />
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex gap-1.5 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
                        {['A1', 'A2', 'B1', 'B2'].map(level => (
                            <button
                                key={level}
                                onClick={() => setSelectedLevel(selectedLevel === level ? null : level)}
                                className={`px-2.5 py-1 rounded-md text-[10px] font-bold transition-all
                                    ${selectedLevel === level
                                        ? 'bg-white dark:bg-slate-700 text-brand-600 shadow-sm'
                                        : 'text-slate-400 hover:text-slate-600 hover:bg-white/50 dark:hover:bg-slate-700/50'
                                    }
                                 `}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <div className="flex flex-col space-y-3 relative">
                {/* Visual Line */}
                <div className="absolute left-[19px] top-6 bottom-6 w-px bg-slate-200 dark:bg-slate-800 hidden md:block" />

                {filteredTopics.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 font-medium bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                        <div className="flex flex-col items-center space-y-2">
                            <X className="w-8 h-8 text-slate-300" />
                            <p className="text-xs">Konu bulunamadı</p>
                        </div>
                    </div>
                ) : (
                    filteredTopics.map((topic, idx) => {
                        const completed = isCompleted(topic.id);

                        return (
                            <div
                                key={topic.id}
                                onClick={() => setSelectedTopic(topic)}
                                className={`group relative flex items-center bg-white dark:bg-slate-900 rounded-2xl p-4 border transition-all cursor-pointer hover:shadow-lg hover:border-brand-100 dark:hover:border-slate-700 gap-4 md:gap-6 ${completed
                                    ? 'border-emerald-100 dark:border-emerald-900/20 bg-emerald-50/10'
                                    : 'border-slate-100 dark:border-slate-800'
                                    }`}
                            >
                                {/* Index Circle */}
                                <div className="relative z-10 shrink-0">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${completed
                                        ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                        : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 group-hover:border-brand-200 group-hover:text-brand-600'
                                        }`}>
                                        {completed ? <Check className="w-5 h-5" /> : (idx + 1)}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0 py-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-[10px] font-bold uppercase tracking-wide
                                            ${completed ? 'text-emerald-600' : 'text-slate-400'}
                                        `}>
                                            {topic.cefr}
                                        </span>
                                        {completed && (
                                            <Sparkles className="w-3 h-3 text-emerald-500" />
                                        )}
                                    </div>

                                    <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition-colors truncate">
                                        {topic.title}
                                    </h3>

                                    <p className="text-xs font-medium text-slate-400 line-clamp-1 mt-0.5 group-hover:text-slate-500">
                                        {topic.description.replace(/###|#|---|-\s|\*\*/g, '').substring(0, 100)}...
                                    </p>
                                </div>

                                {/* Right Action */}
                                <div className="hidden sm:flex items-center gap-3 shrink-0">
                                    <div className="flex items-center space-x-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 dark:bg-slate-800 px-2 py-1 rounded-md">
                                        <HelpCircle className="w-3 h-3" />
                                        <span>{topic.questions?.length || 0} Soru</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
