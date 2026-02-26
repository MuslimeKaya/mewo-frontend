import React, { useState, useEffect, useMemo } from 'react';
import { Target, Trash2, Loader2, Zap, Edit3, Check, X, Users, CheckSquare, Search, Send, Paperclip, Volume2, ChevronRight, Filter, ChevronLeft, Plus, BookOpen, FileText } from 'lucide-react';
import { wordsService, Word } from '../services/words';
import { authService, API_URL } from '../services/auth';
import { grammarService } from '../services/grammar';

interface TeacherWordListProps {
    userId?: string;
    refreshTrigger: number;
    onAssignmentSent?: () => void;
    onWordRemoved?: () => void;
    onTemplatesClick?: () => void;
}

export const TeacherWordList: React.FC<TeacherWordListProps> = ({
    userId,
    refreshTrigger,
    onAssignmentSent,
    onWordRemoved,
    onTemplatesClick
}) => {
    const [mySelections, setMySelections] = useState<Word[]>([]);
    const [loading, setLoading] = useState(false);
    const [sendLoading, setSendLoading] = useState(false);
    const [isSent, setIsSent] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    // Scalable Student Selection State
    const [showSelectionModal, setShowSelectionModal] = useState(false);
    const [students, setStudents] = useState<any[]>([]);
    const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
    const [studentSearch, setStudentSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const WORDS_PER_PAGE = 32;

    // Grammar Selection State
    const [grammarTopics, setGrammarTopics] = useState<any[]>([]);
    const [selectedGrammarIds, setSelectedGrammarIds] = useState<Set<string>>(new Set());
    const [showGrammarSelector, setShowGrammarSelector] = useState(false);

    const [saveTemplateLoading, setSaveTemplateLoading] = useState(false);
    const [showTemplateSelector, setShowTemplateSelector] = useState(false);
    const [templates, setTemplates] = useState<any[]>([]);
    const [loadingTemplates, setLoadingTemplates] = useState(false);

    useEffect(() => {
        fetchMySelections();
        fetchStudents();
        fetchGrammarTopics();
        checkForAppliedTemplate();
    }, [refreshTrigger]);

    const fetchTemplates = async () => {
        setLoadingTemplates(true);
        try {
            const data = await wordsService.getTemplates();
            setTemplates(data);
        } catch (err) {
            console.error('Templates fetch error:', err);
        } finally {
            setLoadingTemplates(false);
        }
    };

    const applyTemplateLocally = (template: any) => {
        setTitle(template.title || '');
        setDescription(template.description || '');
        setMySelections(template.words || []);
        if (template.grammars) {
            setSelectedGrammarIds(new Set(template.grammars.map((g: any) => g.id)));
        }
        setShowTemplateSelector(false);
    };

    const fetchGrammarTopics = async () => {
        try {
            const data = await grammarService.getTopics();
            setGrammarTopics(data);
        } catch (err) {
            console.error('Grammar topics error:', err);
        }
    };

    const checkForAppliedTemplate = () => {
        const saved = localStorage.getItem('mewo_applied_template');
        if (saved) {
            try {
                const template = JSON.parse(saved);
                setTitle(template.title || '');
                setDescription(template.description || '');
                setMySelections(template.words || []);
                if (template.grammars) {
                    setSelectedGrammarIds(new Set(template.grammars.map((g: any) => g.id)));
                }
                localStorage.removeItem('mewo_applied_template');
            } catch (e) {
                console.error('Template parse error:', e);
            }
        }
    };

    const fetchStudents = async () => {
        try {
            const data = await authService.getMyStudents();
            setStudents(data.students || []);
        } catch (err) {
            console.error('Students error:', err);
        }
    };

    const fetchMySelections = async () => {
        setLoading(true);
        setError(null);
        try {
            const results = await wordsService.getMySelections();
            setMySelections(Array.isArray(results) ? results : []);
        } catch (err: any) {
            setError('Yüklenemedi.');
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
        } catch (err: any) {
            setError('Hata.');
        } finally {
            setActionLoading(null);
        }
    };

    const handleFinalSend = async () => {
        setSendLoading(true);
        try {
            await wordsService.sendAssignment(
                mySelections,
                title,
                description,
                selectedFiles.length > 0 ? selectedFiles : undefined,
                selectedStudentIds.size > 0 ? Array.from(selectedStudentIds) : undefined,
                grammarTopics.filter(g => selectedGrammarIds.has(g.id))
            );

            setIsSent(true);
            setShowSelectionModal(false);
            setMySelections([]);
            setTitle('');
            setDescription('');
            setSelectedFiles([]);
            setSelectedStudentIds(new Set());
            if (onAssignmentSent) onAssignmentSent();
            setTimeout(() => setIsSent(false), 2000);
        } catch (err: any) {
            alert(err.message);
        } finally {
            setSendLoading(false);
        }
    };

    // Scalable Selection Logic
    const toggleStudent = (id: string) => {
        const next = new Set(selectedStudentIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedStudentIds(next);
    };

    const toggleAll = () => {
        if (selectedStudentIds.size === students.length) {
            setSelectedStudentIds(new Set());
        } else {
            setSelectedStudentIds(new Set(students.map(s => s.id)));
        }
    };

    const filteredStudents = useMemo(() => {
        return students.filter(s =>
            s.firstName.toLowerCase().includes(studentSearch.toLowerCase()) ||
            s.lastName.toLowerCase().includes(studentSearch.toLowerCase())
        );
    }, [students, studentSearch]);

    const handleSaveAsTemplate = async () => {
        if (!title) {
            alert('Şablon için bir başlık girmelisiniz.');
            return;
        }
        setSaveTemplateLoading(true);
        try {
            await wordsService.createTemplate({
                title,
                description,
                words: mySelections,
                files: [],
                grammars: grammarTopics.filter(g => selectedGrammarIds.has(g.id))
            });
            alert('Şablon başarıyla kaydedildi.');
        } catch (err: any) {
            alert('Şablon kaydedilirken hata oluştu.');
        } finally {
            setSaveTemplateLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const totalPages = Math.ceil(mySelections.length / WORDS_PER_PAGE);
    const paginatedSelections = mySelections.slice((currentPage - 1) * WORDS_PER_PAGE, currentPage * WORDS_PER_PAGE);

    return (
        <div className="h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-sm flex flex-col overflow-hidden relative">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-50 dark:border-slate-800/50 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-orange-500/10 flex items-center justify-center">
                        <Target className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                        <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">Ödev Oluşturucu</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{mySelections.length} KELİME SEÇİLDİ</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => {
                            setShowTemplateSelector(true);
                            fetchTemplates();
                        }}
                        className="flex items-center gap-2 px-3 py-1.5 bg-orange-500/5 hover:bg-orange-500/10 text-orange-600 rounded-xl text-[10px] font-black transition-all border border-orange-200/50"
                    >
                        <Zap className="w-3 h-3" />
                        ŞABLON UYGULA
                    </button>
                    <button onClick={fetchMySelections} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95 text-slate-400 hover:text-orange-500">
                        <Loader2 className={`w-4 h-4 ${loading ? 'animate-spin' : 'hidden'}`} />
                        {!loading && <Zap className="w-4 h-4" />}
                    </button>
                </div>
            </div>

            {/* Word Grid - maximized space */}
            <div className="flex-1 overflow-hidden p-3 bg-[#FAFAFA]/50 dark:bg-slate-950/20 relative pb-12">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 xl:grid-cols-10 gap-2 h-full content-start">
                    {paginatedSelections.map((word) => (
                        <div
                            key={word.id}
                            className={`group flex flex-col p-2 rounded-xl border transition-all cursor-pointer relative h-16 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800/60 hover:border-orange-500/30 hover:-translate-y-1 duration-300 shadow-sm`}
                        >
                            <div className="flex items-center justify-between mb-auto">
                                <span className="bg-orange-600/10 text-orange-600 text-[7px] font-black px-1 py-0.5 rounded-md uppercase tracking-tight">
                                    {word.cefr || 'A1'}
                                </span>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleUnselect(word.id);
                                    }}
                                    className="w-5 h-5 rounded-lg flex items-center justify-center bg-rose-500/10 text-rose-500 hover:bg-rose-600 hover:text-white transition-all"
                                >
                                    {actionLoading === word.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                                </button>
                            </div>
                            <div className="mt-auto">
                                <h4 className="text-[10px] font-black text-slate-900 dark:text-white tracking-tight truncate leading-none mb-0.5">{word.en}</h4>
                                <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 truncate leading-none uppercase">{word.tr}</p>
                            </div>
                        </div>
                    ))}
                    {mySelections.length === 0 && (
                        <div className="col-span-full py-24 text-center opacity-30 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 rounded-3xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-4">
                                <Target className="w-8 h-8 text-slate-400" />
                            </div>
                            <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">Listeniz Boş</h4>
                            <p className="text-[10px] font-medium text-slate-500 mt-1 max-w-[200px]">Kelime havuzundan öğrencilerinize göndermek için kelime seçin.</p>
                        </div>
                    )}
                </div>

                {/* Compact Floating Pagination */}
                {totalPages > 1 && (
                    <div className="absolute bottom-2 inset-x-0 flex items-center justify-center space-x-2 z-20 pointer-events-none">
                        <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200 dark:border-slate-700 shadow-sm rounded-full px-2 py-1 flex items-center space-x-2 pointer-events-auto scale-75 text-[9px] font-black transition-all hover:scale-80 origin-bottom">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full disabled:opacity-30 transition-colors"
                            >
                                <ChevronLeft className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                            </button>
                            <span className="text-slate-500 dark:text-slate-400 tabular-nums">
                                <span className="text-orange-500">{currentPage}</span> / {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full disabled:opacity-30 transition-colors"
                            >
                                <ChevronRight className="w-3 h-3 text-slate-600 dark:text-slate-300" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Control Panel - More compact */}
            <div className="px-6 py-4 border-t border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 space-y-3 z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
                {/* Inputs Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="relative group">
                        <Edit3 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Ödev Başlığı..."
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-[10px] font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-orange-500/5 transition-all focus:border-orange-200 focus:bg-white dark:focus:bg-slate-800"
                        />
                    </div>

                    <div className="relative group bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl transition-all focus-within:border-orange-200 focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:ring-4 focus-within:ring-orange-500/5">
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Ödev notu (PDF, Excel, Resim eklemek için ataç ikonunu kullanın)..."
                            className="w-full bg-transparent border-none px-4 py-2.5 text-[10px] font-medium text-slate-600 dark:text-slate-300 outline-none resize-none h-11 placeholder:text-slate-400 leading-tight"
                        />
                        <div className="absolute top-1/2 -translate-y-1/2 right-2">
                            <label className="w-7 h-7 flex items-center justify-center bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg cursor-pointer hover:border-orange-500 hover:text-orange-600 text-slate-400 transition-all shadow-sm">
                                <Paperclip className="w-3.5 h-3.5" />
                                <input type="file" multiple className="hidden" onChange={handleFileChange} />
                            </label>
                        </div>
                    </div>
                </div>

                {/* Grammar & Files Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 px-1">
                    <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Ekstralar:</span>
                        <div className="flex flex-wrap gap-2">
                            {/* Grammar Button */}
                            <button
                                onClick={() => setShowGrammarSelector(!showGrammarSelector)}
                                className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-[9px] font-black transition-all ${showGrammarSelector || selectedGrammarIds.size > 0 ? 'bg-orange-500 border-orange-500 text-white' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'}`}
                            >
                                <BookOpen className="w-3 h-3" />
                                GRAMER {selectedGrammarIds.size > 0 && `(${selectedGrammarIds.size})`}
                            </button>

                            {/* Applied Grammars List */}
                            {selectedGrammarIds.size > 0 && !showGrammarSelector && grammarTopics.filter(g => selectedGrammarIds.has(g.id)).map(topic => (
                                <div key={topic.id} className="flex items-center gap-1.5 px-2 py-1 bg-orange-50 dark:bg-orange-500/5 rounded-lg border border-orange-100 dark:border-orange-500/20">
                                    <span className="text-[8px] font-bold text-orange-600 dark:text-orange-400 uppercase truncate max-w-[80px]">{topic.title}</span>
                                    <button onClick={() => {
                                        const next = new Set(selectedGrammarIds);
                                        next.delete(topic.id);
                                        setSelectedGrammarIds(next);
                                    }} className="text-orange-300 hover:text-rose-500">
                                        <X className="w-2.5 h-2.5" />
                                    </button>
                                </div>
                            ))}

                            {/* Files Indicator */}
                            {selectedFiles.length > 0 && (
                                <div className="flex items-center gap-1.5 px-2 py-1 bg-blue-50 dark:bg-blue-500/5 rounded-lg border border-blue-100 dark:border-blue-500/20">
                                    <Paperclip className="w-2.5 h-2.5 text-blue-500" />
                                    <span className="text-[8px] font-bold text-blue-600 dark:text-blue-400 uppercase">{selectedFiles.length} DOSYA</span>
                                    <button onClick={() => setSelectedFiles([])} className="text-blue-300 hover:text-rose-500">
                                        <X className="w-2.5 h-2.5" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons Row */}
                <div className="flex gap-2.5 pt-1">
                    <button
                        onClick={handleSaveAsTemplate}
                        disabled={saveTemplateLoading || mySelections.length === 0 || !title}
                        className="flex-[0.4] h-10 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 rounded-xl font-bold uppercase text-[9px] tracking-wider transition-all disabled:opacity-30 flex items-center justify-center gap-2 border-dashed"
                    >
                        {saveTemplateLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                        Şablon Kaydet
                    </button>

                    <button
                        onClick={() => setShowSelectionModal(true)}
                        disabled={mySelections.length === 0}
                        className="flex-1 h-10 bg-slate-900 dark:bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.15em] shadow-lg shadow-orange-500/10 active:scale-[0.98] transition-all disabled:opacity-30 flex items-center justify-center gap-2 group"
                    >
                        {isSent ? <Check className="w-4 h-4 text-emerald-400" /> : <Send className="w-3.5 h-3.5 opacity-60" />}
                        {isSent ? 'GÖNDERİLDİ' : 'ÖĞRENCİ SEÇİMİNE GEÇ'}
                        {!isSent && <ChevronRight className="w-4 h-4 opacity-40 group-hover:translate-x-1 transition-transform" />}
                    </button>
                </div>
            </div>

            {/* Grammar Selector Modal overlay style */}
            {showGrammarSelector && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowGrammarSelector(false)} />
                    <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl flex flex-col max-h-[70vh] overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
                        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                            <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Ünite Seç</h4>
                            <button onClick={() => setShowGrammarSelector(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-1 gap-2 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/20">
                            {grammarTopics.map(topic => (
                                <button
                                    key={topic.id}
                                    onClick={() => {
                                        const next = new Set(selectedGrammarIds);
                                        if (next.has(topic.id)) next.delete(topic.id);
                                        else next.add(topic.id);
                                        setSelectedGrammarIds(next);
                                    }}
                                    className={`p-3 rounded-xl border text-[10px] font-bold transition-all text-left flex items-center justify-between ${selectedGrammarIds.has(topic.id)
                                        ? 'bg-orange-500 border-orange-500 text-white'
                                        : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-orange-200'
                                        }`}
                                >
                                    <span className="truncate pr-2">{topic.title}</span>
                                    {selectedGrammarIds.has(topic.id) ? <Check className="w-3.5 h-3.5 shrink-0" /> : <Plus className="w-3.5 h-3.5 shrink-0 opacity-40" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* SCALABLE SELECTION MODAL */}
            {showSelectionModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-md transition-opacity" onClick={() => setShowSelectionModal(false)} />
                    <div className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[80vh] rounded-[2.5rem] relative z-10 shadow-2xl border border-white/10 flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                            <div>
                                <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">Öğrenci Seçimi</h4>
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                                    {selectedStudentIds.size} / {students.length} SEÇİLDİ
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="hidden md:flex relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-500" />
                                    <input
                                        value={studentSearch}
                                        onChange={(e) => setStudentSearch(e.target.value)}
                                        placeholder="Öğrenci ara..."
                                        className="pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-orange-500/20 w-[200px] transition-all"
                                    />
                                </div>
                                <button onClick={() => setShowSelectionModal(false)} className="w-10 h-10 flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors border border-transparent hover:border-slate-200">
                                    <X className="w-5 h-5 text-slate-400" />
                                </button>
                            </div>
                        </div>

                        {/* Selection List */}
                        <div className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50/50 dark:bg-slate-950/20 p-6">
                            <button
                                onClick={toggleAll}
                                className={`w-full flex items-center justify-between py-1 px-4 mb-3 rounded-xl border-2 transition-all group ${selectedStudentIds.size === students.length && students.length > 0
                                    ? 'bg-orange-50/50 dark:bg-orange-500/5 border-orange-200 dark:border-orange-500/30'
                                    : 'bg-white dark:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${selectedStudentIds.size === students.length && students.length > 0
                                        ? 'bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400'
                                        : 'bg-slate-50 dark:bg-slate-900 text-slate-400'
                                        }`}>
                                        <Users className="w-3 h-3" />
                                    </div>
                                    <div className="text-left py-0.5">
                                        <p className="text-[11px] font-black uppercase tracking-tight">Tüm Sınıfı Seç</p>
                                        <p className="text-[8px] font-bold uppercase tracking-wider leading-none text-slate-400">{students.length} ÖĞRENCİ</p>
                                    </div>
                                </div>
                                <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${selectedStudentIds.size === students.length && students.length > 0 ? 'bg-orange-500 text-white border-orange-500' : 'border-slate-200 dark:border-slate-600'}`}>
                                    {selectedStudentIds.size === students.length && students.length > 0 && <Check className="w-2.5 h-2.5" />}
                                </div>
                            </button>

                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 pb-safe mt-4">
                                {filteredStudents.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => toggleStudent(s.id)}
                                        className={`flex flex-col p-2.5 rounded-xl border-2 transition-all text-left relative h-fit ${selectedStudentIds.has(s.id)
                                            ? 'bg-orange-50/30 dark:bg-orange-500/5 border-orange-500/50 shadow-sm'
                                            : 'bg-white dark:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-1.5 w-full">
                                            <div className="w-7 h-7 shrink-0 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 flex items-center justify-center font-black text-[10px] text-slate-400 overflow-hidden">
                                                {s.avatar ? <img src={s.avatar.startsWith('http') ? s.avatar : `${API_URL.replace('/api', '')}${s.avatar}`} className="w-full h-full object-cover" alt="" /> : s.firstName[0]}
                                            </div>
                                            <div className={`w-4 h-4 shrink-0 rounded-md border flex items-center justify-center transition-all ${selectedStudentIds.has(s.id) ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-200 dark:border-slate-600'}`}>
                                                {selectedStudentIds.has(s.id) && <Check className="w-3 h-3" />}
                                            </div>
                                        </div>
                                        <div className="space-y-0.5">
                                            <p className={`text-[11px] font-black truncate leading-tight uppercase tracking-tight ${selectedStudentIds.has(s.id) ? 'text-orange-600 dark:text-orange-400' : 'text-slate-800 dark:text-slate-100'}`}>
                                                {s.firstName} {s.lastName}
                                            </p>
                                            <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter opacity-60">
                                                {s.level || 'A1'} • {s.xp || 0} XP
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 flex items-center gap-4">
                            <div className="hidden md:block text-xs font-bold text-slate-400">
                                {selectedStudentIds.size} kişi seçildi
                            </div>
                            <button
                                onClick={handleFinalSend}
                                disabled={sendLoading || selectedStudentIds.size === 0}
                                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {sendLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                                {sendLoading ? 'GÖNDERİLİYOR...' : `ÖDEVİ GÖNDER (${selectedStudentIds.size})`}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Template Selector Modal - Local */}
            {showTemplateSelector && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowTemplateSelector(false)} />
                    <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl flex flex-col max-h-[80vh] overflow-hidden border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                                    <Zap className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight">Şablon Uygula</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">KAYITLI LİSTELERİNDEN SEÇ</p>
                                </div>
                            </div>
                            <button onClick={() => setShowTemplateSelector(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl">
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-slate-50/50 dark:bg-slate-950/20">
                            {loadingTemplates ? (
                                <div className="flex flex-col items-center justify-center py-20 opacity-40">
                                    <Loader2 className="w-8 h-8 animate-spin text-orange-600 mb-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Yükleniyor...</span>
                                </div>
                            ) : templates.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 opacity-40">
                                    <Zap className="w-12 h-12 text-slate-300 mb-4" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Kayıtlı şablonunuz yok</span>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-2.5">
                                    {templates.map(template => (
                                        <button
                                            key={template.id}
                                            onClick={() => applyTemplateLocally(template)}
                                            className="group w-full p-4 bg-white dark:bg-slate-800 border-2 border-transparent hover:border-orange-500/30 rounded-2xl transition-all text-left shadow-sm flex items-center justify-between"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-600">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h5 className="text-[13px] font-black text-slate-900 dark:text-white uppercase tracking-tight line-clamp-1">{template.title}</h5>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{template.words?.length || 0} KELİME</span>
                                                        <div className="w-1 h-1 rounded-full bg-slate-300" />
                                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{(template.grammars?.length ?? 0)} GRAMER</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-[10px] font-black text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">
                                                <span>Seç</span>
                                                <ChevronRight className="w-4 h-4" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-center bg-white dark:bg-slate-900">
                            <button
                                onClick={() => onTemplatesClick?.()}
                                className="text-[10px] font-black text-slate-400 hover:text-orange-600 uppercase tracking-[0.2em] transition-colors"
                            >
                                Tüm Şablonları Yönet
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
