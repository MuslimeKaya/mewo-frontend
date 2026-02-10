import React, { useState, useEffect } from 'react';
import { Target, Trash2, Loader2, Sparkles, Zap, Edit3, Check, X, FileText, Type, Paperclip, Upload } from 'lucide-react';
import { wordsService, Word } from '../services/words';

interface TeacherWordListProps {
    refreshTrigger: number;
    onAssignmentSent?: () => void;
    onWordRemoved?: () => void;
}

export const TeacherWordList: React.FC<TeacherWordListProps> = ({
    refreshTrigger,
    onAssignmentSent,
    onWordRemoved
}) => {
    const [mySelections, setMySelections] = useState<Word[]>([]);
    const [loading, setLoading] = useState(false);
    const [sendLoading, setSendLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    useEffect(() => {
        fetchMySelections();
    }, [refreshTrigger]);

    const fetchMySelections = async () => {
        setLoading(true);
        try {
            const results = await wordsService.getMySelections();
            if (Array.isArray(results)) {
                setMySelections(results);
            } else {
                setMySelections([]);
            }
        } catch (err: any) {
            console.error('Seçimler yüklenirken hata:', err);
            // Error is already logged in wordsService
        } finally {
            setLoading(false);
        }
    };

    const handleUnselect = async (wordId: string) => {
        setActionLoading(wordId);
        try {
            await wordsService.unselectWord(wordId);
            setMySelections(prev => prev.filter(w => w.id !== wordId));
            if (onWordRemoved) onWordRemoved();
        } catch (err) {
            console.error('Kaldırma hatası:', err);
        } finally {
            setActionLoading(null);
        }
    };

    const handleSendToStudents = async () => {
        if (mySelections.length === 0) return;
        setSendLoading(true);
        try {
            await wordsService.sendAssignment(mySelections, title, description, selectedFiles.length > 0 ? selectedFiles : undefined);
            if (onAssignmentSent) onAssignmentSent();

            setIsSent(true);
            setTitle('');
            setDescription('');
            setSelectedFiles([]);
            setMySelections([]); // Listeyi temizle
            setTimeout(() => setIsSent(false), 2000);
        } catch (err) {
            console.error('Gönderim hatası:', err);
        } finally {
            setSendLoading(false);
        }
    };

    return (
        <div className="bg-[#FAFAFA] dark:bg-slate-900 border-2 border-blue-200 dark:border-slate-800 rounded-[3rem] p-8 premium-shadow space-y-6 flex flex-col h-[600px]">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="bg-emerald-600 p-2.5 rounded-xl">
                        <Target className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Ödev Listem</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Öğrencilere Gönderilecekler</p>
                    </div>
                </div>
                <button
                    onClick={fetchMySelections}
                    className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-emerald-50 transition-colors"
                >
                    <Zap className={`w-4 h-4 text-emerald-600 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Title and Description Inputs */}
            {mySelections.length > 0 && (
                <div className="space-y-3">
                    <div className="relative group">
                        <Type className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Ödev Başlığı (Örn: Hafta 1 Kelimeleri)"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                    </div>
                    <div className="relative group">
                        <FileText className="absolute left-4 top-4 w-4 h-4 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
                        <textarea
                            placeholder="Ödev Açıklaması veya Notunuz..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full pl-10 pr-4 pt-3 pb-12 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 rounded-3xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all min-h-[120px] resize-none"
                        />

                        {/* Integrated Upload Button */}
                        <div className="absolute right-3 bottom-3 flex flex-col items-end space-y-2">
                            {selectedFiles.length > 0 && (
                                <div className="flex flex-wrap gap-2 justify-end max-w-[300px]">
                                    {selectedFiles.map((file, idx) => (
                                        <div key={idx} className="flex items-center space-x-1 px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-100 dark:border-emerald-800 rounded-lg animate-in zoom-in duration-200">
                                            <span className="text-[8px] font-black text-emerald-600 truncate max-w-[80px]">{file.name}</span>
                                            <button
                                                onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== idx))}
                                                className="p-1 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-md text-rose-500 transition-colors"
                                            >
                                                <X className="w-2.5 h-2.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <label className="flex items-center space-x-2 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-200 transition-all shadow-sm">
                                <Paperclip className={`w-3 h-3 ${selectedFiles.length > 0 ? 'text-emerald-500' : 'text-slate-400'}`} />
                                <span className="text-slate-500">
                                    {selectedFiles.length > 0 ? `${selectedFiles.length} Dosya Seçildi` : 'PDF, Excel, Resim...'}
                                </span>
                                <input
                                    type="file"
                                    className="hidden"
                                    multiple
                                    onChange={(e) => {
                                        if (e.target.files) {
                                            const filesArray = Array.from(e.target.files);
                                            setSelectedFiles(prev => [...prev, ...filesArray]);
                                        }
                                    }}
                                />
                            </label>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3">
                {loading && mySelections.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 space-y-4">
                        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                    </div>
                ) : mySelections.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                        {mySelections.map(word => {
                            const isPassive = actionLoading === word.id;

                            return (
                                <div key={word.id} className={`flex items-center justify-between px-4 py-3 rounded-2xl border-2 transition-all min-h-[4.5rem] relative overflow-hidden ${isPassive
                                    ? 'bg-slate-50/50 dark:bg-slate-800/20 border-slate-100 dark:border-slate-800 opacity-60'
                                    : 'bg-[#F8F9FA] dark:bg-slate-800 border-blue-100 dark:border-slate-700 hover:bg-white hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-500/10 group'
                                    }`}>
                                    <div className="flex-1 min-w-0 pr-2">
                                        <div className="flex items-center space-x-2 mb-1.5">
                                            <div className="px-1.5 py-0.5 bg-brand-50 dark:bg-brand-900/30 rounded border border-brand-100 dark:border-brand-800 flex items-center justify-center shrink-0">
                                                <span className="text-[8px] font-black text-brand-600">{word.cefr || '??'}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm font-black text-slate-900 dark:text-white leading-tight truncate">{word.en}</p>
                                        <p className="text-[11px] font-bold text-slate-400 leading-tight truncate mt-0.5">{word.tr}</p>
                                    </div>
                                    <div className="flex items-center shrink-0">
                                        <button
                                            onClick={() => handleUnselect(word.id)}
                                            disabled={isPassive}
                                            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isPassive
                                                ? 'bg-slate-50 dark:bg-slate-800 text-slate-300'
                                                : 'bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-500 hover:text-white'
                                                }`}
                                        >
                                            {isPassive ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="w-4 h-4" />
                                            )}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-30">
                        <Target className="w-12 h-12 text-slate-200" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-center">Henüz kelime <br /> seçilmedi</p>
                    </div>
                )}
            </div>

            {mySelections.length > 0 && (
                <div className="pt-2">
                    <button
                        onClick={handleSendToStudents}
                        disabled={sendLoading || isSent}
                        className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl active:scale-95 flex items-center justify-center group disabled:opacity-50 ${isSent
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-900 dark:bg-brand-600 hover:bg-slate-800 dark:hover:bg-brand-500 text-white shadow-slate-200 dark:shadow-none'
                            }`}
                    >
                        {sendLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isSent ? (
                            'GÖNDERİLDİ! ✓'
                        ) : (
                            <>
                                ÖĞRENCİLERE GÖNDER
                                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </>
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};
