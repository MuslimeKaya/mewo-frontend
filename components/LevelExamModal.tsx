
import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, Sparkles, Loader2, Trophy, ArrowRight, BookOpen } from 'lucide-react';
import { wordsService } from '../services/words';

interface LevelExamModalProps {
    level: string;
    onClose: () => void;
}

export const LevelExamModal: React.FC<LevelExamModalProps> = ({ level, onClose }) => {
    const [loading, setLoading] = useState(true);
    const [questions, setQuestions] = useState<any[]>([]);
    const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
    const [answers, setAnswers] = useState<{ wordId: string, answer: string }[]>([]);
    const [results, setResults] = useState<any | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        const fetchExam = async () => {
            try {
                const data = await wordsService.getLevelExam(level);
                setQuestions(data.questions);
            } catch (err) {
                console.error('Exam fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchExam();
    }, [level]);

    const handleAnswer = (wordId: string, answer: string) => {
        // Save answer
        const newAnswers = [...answers];
        newAnswers[currentQuestionIdx] = { wordId, answer };
        setAnswers(newAnswers);

        // Auto advance
        if (currentQuestionIdx < questions.length - 1) {
            setTimeout(() => setCurrentQuestionIdx(prev => prev + 1), 300);
        }
    };

    const submitExam = async () => {
        setSubmitting(true);
        try {
            const resultData = await wordsService.submitLevelExam(level, answers);
            setResults(resultData);
        } catch (err) {
            console.error('Submit error:', err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center">
                    <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{level} Seviye Sınavı Oluşturuluyor...</p>
                </div>
            </div>
        );
    }

    if (results) {
        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
                <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 relative">
                    <button onClick={onClose} className="absolute top-6 right-6 p-2 bg-slate-100 dark:bg-slate-800 rounded-xl hover:scale-105 transition-transform z-10">
                        <X className="w-5 h-5 text-slate-500" />
                    </button>

                    <div className="p-8 md:p-12 flex flex-col items-center text-center">
                        <div className={`w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-2xl ${results.passed ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-rose-500 shadow-rose-500/30'}`}>
                            {results.passed ? <Trophy className="w-12 h-12 text-white" /> : <XCircle className="w-12 h-12 text-white" />}
                        </div>

                        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">
                            {results.passed ? 'Tebrikler!' : 'Daha Çok Çalışmalısın'}
                        </h2>
                        <p className="text-slate-500 font-medium mb-8">
                            {results.passed
                                ? `${level} seviyesini başarıyla tamamladın.`
                                : `${level} seviyesini geçmek için %70 başarı gerekli.`}
                        </p>

                        <div className="w-full bg-slate-50 dark:bg-slate-800 p-6 rounded-3xl mb-8 flex justify-between items-center px-12">
                            <div className="text-center">
                                <div className="text-3xl font-black text-slate-900 dark:text-white">{results.score}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Puan</div>
                            </div>
                            <div className="w-px h-10 bg-slate-200 dark:bg-slate-700"></div>
                            <div className="text-center">
                                <div className={`text-3xl font-black ${results.passed ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {results.correctCount}/{results.totalQuestions}
                                </div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Doğru</div>
                            </div>
                        </div>

                        <button onClick={onClose} className="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-brand-500/20 active:scale-95 transition-all">
                            {results.passed ? 'Devam Et' : 'Kapat'}
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const currentQ = questions[currentQuestionIdx];
    const isLast = currentQuestionIdx === questions.length - 1;
    const hasAnsweredCurrent = !!answers[currentQuestionIdx];

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-[600px] flex flex-col rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 border-4 border-white dark:border-slate-800">

                {/* Header */}
                <div className="bg-slate-50 dark:bg-slate-800/50 p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-4">
                        <div className="bg-brand-100 dark:bg-brand-900/30 p-2.5 rounded-xl text-brand-600">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white">{level} Seviye Sınavı</h3>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Soru {currentQuestionIdx + 1} / {questions.length}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-colors">
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800">
                    <div
                        className="h-full bg-brand-500 transition-all duration-500 ease-out"
                        style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
                    />
                </div>

                {/* Content */}
                <div className="flex-1 p-8 md:p-12 overflow-y-auto flex flex-col justify-center">
                    <div className="mb-10 text-center">
                        <span className="inline-block px-3 py-1 bg-brand-50 dark:bg-brand-900/20 text-brand-600 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-4">
                            Translate to Turkish
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                            "{currentQ.question}"
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentQ.options.map((opt: any, idx: number) => {
                            const isSelected = answers[currentQuestionIdx]?.answer === opt.text;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => handleAnswer(currentQ.wordId, opt.text)}
                                    className={`p-6 rounded-2xl border-2 text-left font-bold transition-all duration-200 active:scale-95 ${isSelected
                                        ? 'bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-500/30'
                                        : 'border-slate-100 dark:border-slate-800 hover:border-brand-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                                        }`}
                                >
                                    {opt.text}
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 relative z-10">
                    <button
                        disabled={currentQuestionIdx === 0}
                        onClick={() => setCurrentQuestionIdx(prev => prev - 1)}
                        className="px-6 py-3 text-slate-400 font-black uppercase tracking-widest text-xs hover:text-slate-600 disabled:opacity-30 transition-colors"
                    >
                        Geri
                    </button>

                    {isLast ? (
                        <button
                            onClick={submitExam}
                            disabled={submitting || answers.length < questions.length}
                            className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trophy className="w-4 h-4" />}
                            <span>Sınavı Tamamla</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => setCurrentQuestionIdx(prev => prev + 1)}
                            disabled={!hasAnsweredCurrent}
                            className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-black uppercase tracking-widest text-xs hover:scale-105 active:scale-95 transition-all flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <span>Sonraki</span>
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};
