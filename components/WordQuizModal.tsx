
import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, XCircle, Sparkles, Loader2 } from 'lucide-react';
import { wordsService } from '../services/words';

interface WordQuizModalProps {
    wordId: string;
    onClose: (success: boolean) => void;
}

export const WordQuizModal: React.FC<WordQuizModalProps> = ({ wordId, onClose }) => {
    const [quizBody, setQuizBody] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedOption, setSelectedOption] = useState<number | null>(null);
    const [isAnswered, setIsAnswered] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const data = await wordsService.getQuiz(wordId);
                setQuizBody(data);
            } catch (err) {
                console.error('Quiz fetch error:', err);
                onClose(false);
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [wordId]);

    const handleSelect = async (index: number) => {
        if (isAnswered) return;

        setSelectedOption(index);
        setIsAnswered(true);

        const correct = quizBody.options[index].isCorrect;

        try {
            await wordsService.verifyQuiz(wordId, correct);
            setTimeout(() => {
                onClose(correct);
            }, 1500);
        } catch (err) {
            console.error('Verify error:', err);
        }
    };

    if (loading) {
        return (
            <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl flex flex-col items-center">
                    <Loader2 className="w-10 h-10 text-brand-500 animate-spin mb-4" />
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Soru Hazırlanıyor...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300 border-4 border-white dark:border-slate-800">
                <div className="p-8">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center space-x-3">
                            <div className="bg-brand-100 dark:bg-brand-900/30 p-2 rounded-xl text-brand-600">
                                <Sparkles className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Hızlı Kontrol</span>
                        </div>
                        {!isAnswered && (
                            <button onClick={() => onClose(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        )}
                    </div>

                    <div className="text-center space-y-4 mb-10">
                        <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight italic">"{quizBody.question}"</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Bu kelimenin anlamı hangisidir?</p>
                    </div>

                    <div className="space-y-3">
                        {quizBody.options.map((option: any, idx: number) => {
                            const isSelected = selectedOption === idx;
                            const isCorrect = option.isCorrect;

                            let style = "border-slate-100 dark:border-slate-800 hover:border-brand-200 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50";
                            if (isAnswered) {
                                if (isCorrect) style = "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-500/20";
                                else if (isSelected && !isCorrect) style = "bg-rose-500 border-rose-500 text-white shadow-lg shadow-rose-500/20";
                                else style = "opacity-40 grayscale border-slate-100 dark:border-slate-800";
                            }

                            return (
                                <button
                                    key={idx}
                                    disabled={isAnswered}
                                    onClick={() => handleSelect(idx)}
                                    className={`w-full p-5 rounded-2xl border-2 text-left font-black transition-all duration-300 flex items-center justify-between group ${style}`}
                                >
                                    <span className="text-sm">{option.text}</span>
                                    {isAnswered && isCorrect && <CheckCircle2 className="w-5 h-5" />}
                                    {isAnswered && isSelected && !isCorrect && <XCircle className="w-5 h-5" />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {isAnswered && (
                    <div className={`p-4 text-center animate-in slide-in-from-bottom-2 duration-500 ${quizBody.options[selectedOption!].isCorrect ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                        }`}>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                            {quizBody.options[selectedOption!].isCorrect ? 'Harika! Doğru Bildin.' : 'Üzgünüm, Yanlış Cevap.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};
