import React, { useState, useEffect } from 'react';
import { Search, Plus, Check, Loader2, BookOpen, X, Zap, ChevronLeft, ArrowRight } from 'lucide-react';
import { wordsService, Word } from '../services/words';

interface WordSelectorProps {
    onWordAdded?: () => void;
    refreshTrigger?: number;
}

export const WordSelector: React.FC<WordSelectorProps> = ({ onWordAdded, refreshTrigger }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLevel, setSelectedLevel] = useState<string>('All');
    const [searchResults, setSearchResults] = useState<Word[]>([]);
    const [totalResults, setTotalResults] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [mySelections, setMySelections] = useState<Set<string>>(new Set());
    const [sentWords, setSentWords] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [successNotification, setSuccessNotification] = useState<string | null>(null);

    const levels = ['All', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'N/A'];
    const ITEMS_PER_PAGE = 25; // Reduced to fit on page without browsing

    // Reset page when search or level changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, selectedLevel]);

    // Fetch data when page, search or level changes
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            handleSearch();
        }, 300);
        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, selectedLevel, currentPage]);

    // Initial load for selections
    useEffect(() => {
        fetchSelections();
    }, [refreshTrigger]);

    const fetchSelections = async () => {
        try {
            const token = wordsService.getToken();
            if (!token) return;

            const selections = await wordsService.getMySelections();
            if (Array.isArray(selections)) {
                setMySelections(new Set(selections.map(w => w.id)));
            }

            const history = await wordsService.getAssignmentHistory();
            if (Array.isArray(history)) {
                const sentIds = new Set<string>();
                history.forEach(assignment => {
                    assignment.words?.forEach((w: any) => sentIds.add(w.id));
                });
                setSentWords(sentIds);
            }
        } catch (err) {
            // Fail silently
        }
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const data = await wordsService.findAll(
                searchTerm,
                selectedLevel === 'All' ? undefined : selectedLevel,
                currentPage,
                ITEMS_PER_PAGE
            );

            if (data) {
                setSearchResults(data.items || []);
                setTotalResults(Number(data.total) || 0);
            }
        } catch (err) {
            console.error('Arama hatası:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = async (word: Word) => {
        if (mySelections.has(word.id)) return;

        setActionLoading(word.id);
        try {
            await wordsService.selectWord(word.id);
            setMySelections(prev => new Set(prev).add(word.id));
            setSuccessNotification(`"${word.en}" eklendi!`);
            if (onWordAdded) onWordAdded();
            setTimeout(() => setSuccessNotification(null), 2000);
        } catch (err) {
            console.error('Ekleme hatası:', err);
        } finally {
            setActionLoading(null);
        }
    };

    const totalPages = Math.ceil(totalResults / ITEMS_PER_PAGE);

    return (
        <div className="bg-[#FAFAFA] dark:bg-slate-900 border-2 border-blue-200 dark:border-slate-800 rounded-[2rem] shadow-2xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden flex flex-col h-full w-full">
            {/* Success Toast */}
            {successNotification && (
                <div className="absolute top-4 inset-x-4 z-50 animate-in slide-in-from-top-4 fade-in duration-300 pointer-events-none">
                    <div className="bg-emerald-500 text-white px-6 py-3 rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center space-x-2 border border-emerald-400 mx-auto w-fit">
                        <Check className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">{successNotification}</span>
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className="px-6 pt-6 pb-2 space-y-4 flex-none z-10">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="bg-brand-600 p-2.5 rounded-xl">
                            <BookOpen className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">Kelime Kütüphanesi</h3>
                            <p className="text-[10px] font-bold text-slate-400 tracking-widest mt-2">{totalResults} Kelime Mevcut</p>
                        </div>
                    </div>
                    <button
                        onClick={async () => {
                            if (confirm('Veritabanı senkronize edilsin mi?')) {
                                setLoading(true);
                                try {
                                    await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/words/migrate`, {
                                        method: 'POST',
                                        headers: { 'Authorization': `Bearer ${wordsService.getToken()}` }
                                    });
                                    wordsService.clearCache();
                                    handleSearch();
                                } catch (e) {
                                    console.error(e);
                                } finally {
                                    setLoading(false);
                                }
                            }
                        }}
                        className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-brand-50 transition-colors group"
                        title="Veritabanını Yenile & Cache Temizle"
                    >
                        <Zap className="w-4 h-4 text-brand-600 group-hover:scale-110 transition-transform" />
                    </button>
                </div>

                {/* Controls Row */}
                <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
                    {/* Level Tabs - Scrollable */}
                    <div className="flex-1 flex items-center space-x-2 overflow-x-auto no-scrollbar mask-gradient-right">
                        {levels.map((lvl) => (
                            <button
                                key={lvl}
                                onClick={() => setSelectedLevel(lvl)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 shrink-0 ${selectedLevel === lvl
                                    ? 'bg-brand-600 border-brand-600 text-white shadow-lg shadow-brand-600/30'
                                    : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-800 text-slate-600 hover:border-brand-300 hover:text-brand-700'
                                    }`}
                            >
                                {lvl}
                            </button>
                        ))}
                    </div>

                    {/* Compact Search */}
                    <div className="relative group sm:w-64 shrink-0">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-brand-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-800 rounded-xl py-2.5 pl-10 pr-8 text-xs font-bold text-slate-800 dark:text-slate-200 focus:ring-4 focus:ring-brand-500/10 focus:border-brand-600 outline-none transition-all placeholder:text-slate-500"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => { setSearchTerm(''); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Word List - No Scroll - Fit Content */}
            <div className="flex-1 overflow-hidden px-6 py-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 h-full content-start">
                    {loading ? (
                        <div className="col-span-full flex flex-col items-center justify-center h-full space-y-4">
                            <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Yükleniyor...</p>
                        </div>
                    ) : searchResults.length > 0 ? (
                        searchResults.map(word => {
                            const isSelected = mySelections.has(word.id);
                            const isSent = sentWords.has(word.id);
                            const isPassive = isSelected || isSent;

                            return (
                                <div key={word.id} className={`flex items-center justify-between px-2.5 py-2.5 rounded-xl border-2 transition-all relative overflow-hidden group ${isPassive
                                    ? 'bg-slate-100/80 dark:bg-slate-800/20 border-slate-200 dark:border-slate-800 opacity-60'
                                    : 'bg-[#F8F9FA] dark:bg-slate-800 border-blue-100 dark:border-slate-700 shadow-sm hover:bg-white hover:border-emerald-500 hover:shadow-xl hover:shadow-emerald-500/10'
                                    }`}>
                                    <div className="flex-1 min-w-0 pr-1.5">
                                        <div className="flex items-center space-x-1.5 mb-1">
                                            <div className="px-1.5 py-0.5 bg-slate-200 dark:bg-brand-900/30 rounded border border-slate-300 dark:border-brand-800 flex items-center justify-center shrink-0">
                                                <span className="text-[9px] font-black text-slate-700 dark:text-brand-400">{word.cefr || '?'}</span>
                                            </div>
                                            {isSent && (
                                                <span className="text-[7px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-wider">OK</span>
                                            )}
                                        </div>
                                        <p className="text-xs font-black text-slate-800 dark:text-white leading-tight truncate" title={word.en}>{word.en}</p>
                                        <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 leading-tight truncate mt-0.5" title={word.tr}>{word.tr}</p>
                                    </div>
                                    <button
                                        onClick={() => handleSelect(word)}
                                        disabled={actionLoading === word.id || isPassive}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all shrink-0 ${isPassive
                                            ? 'bg-slate-50 dark:bg-slate-800 text-slate-300 dark:text-slate-600'
                                            : 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 hover:bg-brand-600 hover:text-white'
                                            }`}
                                    >
                                        {actionLoading === word.id ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : isPassive ? (
                                            <Check className="w-3 h-3" />
                                        ) : (
                                            <Plus className="w-4 h-4" />
                                        )}
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        <div className="col-span-full flex flex-col items-center justify-center text-center space-y-4 opacity-30 h-full">
                            <Search className="w-12 h-12 text-slate-300" />
                            <p className="text-[11px] font-black uppercase tracking-widest">
                                {searchTerm ? `"${searchTerm}" için sonuç yok` : `${selectedLevel} düzeyinde kelime yok`}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Zero-Bottom Pagination Footer */}
            {totalPages > 0 && (
                <div className="flex-none flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-sm z-20">
                    <div className="hidden sm:flex items-center space-x-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Toplam {totalResults}</span>
                    </div>

                    <div className="flex items-center space-x-3 w-full sm:w-auto justify-between sm:justify-center">
                        <button
                            onClick={() => {
                                setCurrentPage(p => Math.max(1, p - 1));
                            }}
                            disabled={currentPage === 1 || loading}
                            className="flex items-center space-x-1 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-brand-600 hover:border-brand-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <ChevronLeft className="w-3 h-3" />
                            <span>Önceki</span>
                        </button>

                        <div className="px-4 py-2 bg-transparent text-center min-w-[80px]">
                            <span className="text-xs font-black text-slate-700 dark:text-slate-300">{currentPage} / {totalPages}</span>
                        </div>

                        <button
                            onClick={() => {
                                setCurrentPage(p => Math.min(totalPages, p + 1));
                            }}
                            disabled={currentPage === totalPages || totalPages === 0 || loading}
                            className="flex items-center space-x-1 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-brand-600 hover:border-brand-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            <span>Sonraki</span>
                            <ArrowRight className="w-3 h-3" />
                        </button>
                    </div>

                    <div className="hidden sm:block w-[80px]"></div>
                </div>
            )}
        </div>
    );
};
