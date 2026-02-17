import React, { useState, useEffect, useMemo } from 'react';
import { Target, Trash2, Loader2, Zap, Edit3, Check, X, Users, CheckSquare, Search, Send, Paperclip, Volume2, ChevronRight, Filter, ChevronLeft } from 'lucide-react';
import { wordsService, Word } from '../services/words';
import { authService, API_URL } from '../services/auth';

interface TeacherWordListProps {
    userId?: string;
    refreshTrigger: number;
    onAssignmentSent?: () => void;
    onWordRemoved?: () => void;
}

export const TeacherWordList: React.FC<TeacherWordListProps> = ({
    userId,
    refreshTrigger,
    onAssignmentSent,
    onWordRemoved
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
    const WORDS_PER_PAGE = 18; // 3 rows x 6 columns = 18 items

    useEffect(() => {
        fetchMySelections();
        fetchStudents();
    }, [refreshTrigger]);

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
                selectedStudentIds.size > 0 ? Array.from(selectedStudentIds) : undefined
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

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSelectedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const getLevelColor = (level?: string) => {
        // Uniform Orange Theme per request
        return 'bg-orange-500 text-white border-orange-600 shadow-sm shadow-orange-500/20';
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
                <button onClick={fetchMySelections} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-all active:scale-95 text-slate-400 hover:text-orange-500">
                    <Zap className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Word Grid - Compact & Professional */}
            <div className="flex-1 overflow-hidden p-5 bg-[#FAFAFA]/50 dark:bg-slate-950/20 relative pb-10">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5 h-full content-start">
                    {paginatedSelections.map((word) => (
                        <div key={word.id} className="relative group bg-white dark:bg-[#1e293b] border border-slate-200 dark:border-slate-800 rounded-xl p-3 hover:border-orange-500/30 hover:shadow-md dark:hover:shadow-orange-900/5 transition-all duration-300">
                            <div className="flex items-start justify-between mb-2">
                                <span className={`px-1.5 py-[2px] rounded text-[8px] font-black uppercase tracking-wider ${getLevelColor(word.cefr)}`}>
                                    {word.cefr || 'A1'}
                                </span>
                                <div className="flex gap-1.5">
                                    <Volume2 className="w-3 h-3 text-slate-400 opacity-40 group-hover:opacity-100 transition-opacity" />
                                    <button
                                        onClick={() => handleUnselect(word.id)}
                                        className="text-slate-300 hover:text-rose-500 transition-colors"
                                    >
                                        {actionLoading === word.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-0.5">
                                <p className="text-xs font-black text-slate-800 dark:text-slate-100 leading-tight truncate pr-2">{word.en}</p>
                                <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 truncate w-full">{word.tr}</p>
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
                    <div className="absolute bottom-1 inset-x-0 flex items-center justify-center space-x-2 z-20 pointer-events-none pb-0.5">
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

            {/* Footer Control Panel */}
            <div className="px-6 py-5 border-t border-slate-50 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
                {/* Information Inputs */}
                <div className="grid grid-cols-1 gap-4">
                    <div className="relative group">
                        <Edit3 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            placeholder="Ödev Başlığı..."
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl py-3 pl-11 pr-4 text-[11px] font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-orange-500/5 transition-all focus:border-orange-200 focus:bg-white dark:focus:bg-slate-800"
                        />
                    </div>

                    <div className="relative group bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-2xl transition-all focus-within:border-orange-200 focus-within:bg-white dark:focus-within:bg-slate-800 focus-within:ring-4 focus-within:ring-orange-500/5">
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            placeholder="Öğrenciler için bir not ekleyin..."
                            className="w-full bg-transparent border-none px-5 py-4 text-[11px] font-medium text-slate-600 dark:text-slate-300 outline-none resize-none h-20 placeholder:text-slate-400 leading-relaxed"
                        />

                        <div className="absolute bottom-3 right-3 flex items-center gap-2">
                            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tight pointer-events-none hidden group-focus-within:block group-hover:block transition-all mr-2">
                                (PDF, Excel, Resim, Video)
                            </span>
                            <label className="w-8 h-8 flex items-center justify-center bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl cursor-pointer hover:border-orange-500 hover:text-orange-600 text-slate-400 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0">
                                <Paperclip className="w-4 h-4" />
                                <input type="file" multiple className="hidden" onChange={handleFileChange} />
                            </label>
                        </div>
                    </div>
                </div>

                {/* File List */}
                {selectedFiles.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                        {selectedFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700 animate-in zoom-in-95 group/file">
                                <div className="w-1.5 h-1.5 rounded-full bg-orange-500/50"></div>
                                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 truncate max-w-[120px]">{file.name}</span>
                                <button onClick={() => removeFile(idx)} className="text-slate-300 hover:text-rose-500 transition-colors ml-1">
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                {/* Action Button */}
                <button
                    onClick={() => setShowSelectionModal(true)}
                    disabled={mySelections.length === 0}
                    className="w-full h-12 bg-slate-900 dark:bg-orange-600 hover:bg-orange-700 text-white rounded-[1.2rem] font-black uppercase text-[11px] tracking-[0.2em] shadow-xl shadow-orange-500/20 active:scale-[0.98] transition-all disabled:opacity-30 disabled:hover:bg-slate-900 flex items-center justify-center gap-3 group"
                >
                    {isSent ? <Check className="w-4 h-4 text-emerald-400" /> : <Send className="w-4 h-4 opacity-60 group-hover:opacity-100 transition-opacity" />}
                    {isSent ? 'GÖNDERİLDİ' : 'ÖĞRENCİ SEÇİMİNE GEÇ'}
                    {!isSent && <ChevronRight className="w-4 h-4 opacity-40 group-hover:translate-x-1 transition-transform" />}
                </button>
            </div>

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

                        {/* Mobile Search */}
                        <div className="md:hidden px-6 py-3 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    value={studentSearch}
                                    onChange={(e) => setStudentSearch(e.target.value)}
                                    placeholder="İsim ile ara..."
                                    className="w-full pl-9 pr-4 py-3 bg-white dark:bg-slate-800 rounded-xl text-xs font-bold outline-none border border-slate-100 dark:border-slate-700"
                                />
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
                                        <p className={`text-[11px] font-black uppercase tracking-tight ${selectedStudentIds.size === students.length && students.length > 0 ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-200'
                                            }`}>Tüm Sınıfı Seç</p>
                                        <p className={`text-[8px] font-bold uppercase tracking-wider leading-none ${selectedStudentIds.size === students.length && students.length > 0 ? 'text-orange-600 dark:text-orange-400' : 'text-slate-400'
                                            }`}>
                                            {students.length} ÖĞRENCİ
                                        </p>
                                    </div>
                                </div>
                                <div className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${selectedStudentIds.size === students.length && students.length > 0
                                    ? 'bg-orange-500 text-white border-orange-500'
                                    : 'border-slate-200 dark:border-slate-600 group-hover:border-orange-300'
                                    }`}>
                                    {selectedStudentIds.size === students.length && students.length > 0 && <Check className="w-2.5 h-2.5" />}
                                </div>
                            </button>

                            <div className="flex items-center gap-4 mb-4 opacity-50">
                                <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1" />
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">ÖĞRENCİ LİSTESİ</span>
                                <div className="h-px bg-slate-200 dark:bg-slate-700 flex-1" />
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2 pb-safe">
                                {filteredStudents.map(s => (
                                    <button
                                        key={s.id}
                                        onClick={() => toggleStudent(s.id)}
                                        className={`flex flex-col p-1.5 rounded-xl border-2 transition-all text-left relative h-fit ${selectedStudentIds.has(s.id)
                                            ? 'bg-orange-50/30 dark:bg-orange-500/5 border-orange-500/50 shadow-sm'
                                            : 'bg-white dark:bg-slate-800 border-transparent hover:border-slate-200 dark:hover:border-slate-700 shadow-sm'
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-1 w-full">
                                            <div className="w-6 h-6 shrink-0 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 flex items-center justify-center font-black text-[9px] text-slate-400 overflow-hidden">
                                                {s.avatar ? <img src={s.avatar.startsWith('http') ? s.avatar : `${API_URL.replace('/api', '')}${s.avatar}`} className="w-full h-full object-cover" /> : s.firstName[0]}
                                            </div>
                                            <div className={`w-3.5 h-3.5 shrink-0 rounded-md border flex items-center justify-center transition-all ${selectedStudentIds.has(s.id) ? 'bg-orange-500 border-orange-500 text-white' : 'border-slate-200 dark:border-slate-600'
                                                }`}>
                                                {selectedStudentIds.has(s.id) && <Check className="w-2.5 h-2.5" />}
                                            </div>
                                        </div>

                                        <div className="space-y-0">
                                            <p className={`text-[10px] font-black truncate leading-tight uppercase tracking-tight ${selectedStudentIds.has(s.id) ? 'text-orange-600 dark:text-orange-400' : 'text-slate-800 dark:text-slate-100'}`}>
                                                {s.firstName} {s.lastName}
                                            </p>
                                            <div className="flex items-center gap-1 opacity-60">
                                                <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">
                                                    {s.level || 'A1'} • {s.xp || 0} XP
                                                </span>
                                            </div>
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
                                className="flex-1 bg-orange-600 hover:bg-orange-700 text-white py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:shadow-none"
                            >
                                {sendLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                                {sendLoading ? 'GÖNDERİLİYOR...' : `SEÇİLENLERİ GÖNDER (${selectedStudentIds.size})`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
