import React, { useState, useEffect } from 'react';
import { History, Calendar, Clock, BookOpen, ChevronDown, FileText, Trash2, Loader2, Download, ExternalLink, Image, FileSpreadsheet, Eye, CheckCheck, Users, ChevronRight, ChevronLeft } from 'lucide-react';
import { wordsService } from '../services/words';

interface AssignmentHistoryProps {
    assignments: any[];
    onDelete?: () => void;
    onSelect?: (assignment: any) => void;
    showDelete?: boolean;
    userId?: string;
}

const ITEMS_PER_PAGE = 5;

export const AssignmentHistory: React.FC<AssignmentHistoryProps> = ({ assignments, onDelete, onSelect, showDelete, userId }) => {
    const [activeId, setActiveId] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [viewedIds, setViewedIds] = useState<Set<string>>(new Set());
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        if (typeof window !== 'undefined' && userId) {
            const key = `mewo_viewed_assignments_${userId}`;
            const saved = localStorage.getItem(key);
            if (saved) setViewedIds(new Set(JSON.parse(saved)));
        }
    }, [userId]);

    const totalPages = Math.ceil(assignments.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedAssignments = assignments.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    const markAsViewed = async (id: string, isStudent: boolean) => {
        if (!viewedIds.has(id)) {
            const next = new Set(viewedIds);
            next.add(id);
            setViewedIds(next);
            if (userId) {
                localStorage.setItem(`mewo_viewed_assignments_${userId}`, JSON.stringify(Array.from(next)));
            }
            if (isStudent) {
                try {
                    await wordsService.markAsViewed(id);
                } catch (err) {
                    console.error('Görüntüleme kaydedilemedi:', err);
                }
            }
        }
    };

    const toggleExpand = (id: string, assignment: any) => {
        if (activeId === id) {
            setActiveId(null);
        } else {
            setActiveId(id);
            markAsViewed(id, !showDelete);
            if (onSelect) onSelect(assignment);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (!confirm('Bu ödevi silmek istediğinizden emin misiniz?')) return;

        setDeletingId(id);
        try {
            await wordsService.deleteAssignment(id);
            if (onDelete) onDelete();
            if (activeId === id) setActiveId(null);
        } catch (err) {
            console.error('Silme hatası:', err);
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: '2-digit' }).replace(/\//g, '.');
    };

    const handleDownload = async (url: string, fileName: string) => {
        try {
            const apiBase = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001';
            const fullUrl = `${apiBase}${url}`;
            const response = await fetch(fullUrl);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = fileName || 'assignment-file';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            console.error('İndirme hatası:', err);
            alert('Dosya indirilemedi.');
        }
    };

    const getFileIcon = (fileName: string) => {
        const ext = fileName.toLowerCase().split('.').pop();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return <Image className="w-4 h-4 text-white" />;
        if (['xlsx', 'xls', 'csv'].includes(ext || '')) return <FileSpreadsheet className="w-4 h-4 text-white" />;
        return <FileText className="w-4 h-4 text-white" />;
    };

    return (
        <div className="flex flex-col flex-1 min-h-0 w-full relative">
            <div className="flex-1 overflow-hidden space-y-2 relative pb-14">
                {paginatedAssignments.length > 0 ? (
                    paginatedAssignments.map((assignment) => {
                        const isActive = activeId === assignment.id;
                        const isPassive = activeId !== null && !isActive;
                        const isAlreadyViewedInBackend = assignment.viewers?.some((v: any) => v.userId === userId);
                        const isNew = !showDelete && !viewedIds.has(assignment.id) && !isAlreadyViewedInBackend;

                        // If an item is active, we might want to hide others or overlay them depending on design preference.
                        // Here we keep the accordion logic but ensure it overflows gracefully or takes priority.
                        // For a strict "fit in card" requirement, an expanded item might need to take up all space or use a scroll within ITSELF.

                        return (
                            <div
                                key={assignment.id}
                                className={`rounded-3xl border-2 transition-all duration-500 flex flex-col ${isActive
                                    ? 'absolute inset-0 z-20 bg-white dark:bg-slate-800 border-emerald-500/50 shadow-xl overflow-hidden'
                                    : `relative bg-[#F8F9FA] dark:bg-slate-800/50 border-blue-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-white cursor-pointer ${isPassive ? 'opacity-0 pointer-events-none' : ''}`
                                    }`}
                                style={{
                                    maxHeight: isActive ? '100%' : 'auto' // ensure active allows internal scroll
                                }}
                                onClick={() => !isActive && toggleExpand(assignment.id, assignment)}
                            >
                                <div className={`flex items-center justify-between p-4 shrink-0 ${isActive ? 'border-b border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 sticky top-0 z-10' : ''}`}>
                                    <div className="flex items-center space-x-4 min-w-0 flex-1">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${isActive
                                            ? 'bg-emerald-100 text-emerald-600 border-emerald-200'
                                            : isNew
                                                ? 'bg-emerald-100 text-emerald-600 border-emerald-200 animate-pulse'
                                                : 'bg-white dark:bg-slate-700 text-slate-400 border-slate-200 dark:border-slate-600'
                                            }`}>
                                            {isNew ? <Calendar className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center justify-between w-full">
                                                <h4 className={`text-xs font-black truncate pr-4 ${isActive ? 'text-slate-900 dark:text-white text-sm' : 'text-slate-700 dark:text-slate-300'}`}>
                                                    {assignment.title || 'Başlıksız Ödev'}
                                                </h4>
                                                <div className="shrink-0 flex items-center space-x-1.5 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                                    <Calendar className="w-3.5 h-3.5 text-brand-500" />
                                                    <span className="text-[11px] font-black text-slate-700 dark:text-slate-200 tracking-wide">
                                                        {formatDate(assignment.createdAt)}
                                                    </span>
                                                </div>
                                            </div>
                                            {!isActive && (
                                                <div className="flex items-center mt-1 space-x-2">
                                                    {isNew && <span className="text-[7px] font-black bg-emerald-500 text-white px-1.5 py-0.5 rounded uppercase tracking-tighter">YENİ</span>}
                                                    <span className="text-[9px] text-slate-400 font-medium truncate">
                                                        {assignment.words?.length || 0} Kelime • {assignment.teacher?.firstName} {assignment.teacher?.lastName}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="ml-2 flex items-center">
                                        {isActive ? (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setActiveId(null); }}
                                                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                                            >
                                                <ChevronDown className="w-4 h-4 text-slate-400" />
                                            </button>
                                        ) : (
                                            <ChevronRight className="w-4 h-4 text-slate-300" />
                                        )}
                                    </div>
                                </div>

                                {isActive && (
                                    <div className="flex flex-col h-full overflow-hidden bg-white dark:bg-slate-800">
                                        <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-5">
                                            {showDelete && assignment.viewers && (
                                                <div className="bg-[#F8F9FA] dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                    <div className="flex items-center space-x-2 mb-3">
                                                        <Eye className="w-3 h-3 text-brand-500" />
                                                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Görüntüleyenler ({assignment.viewers.length})</p>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {assignment.viewers.length > 0 ? assignment.viewers.map((v: any, i: number) => (
                                                            <span key={i} className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-600 font-bold shadow-sm">
                                                                {v.fullName}
                                                            </span>
                                                        )) : (
                                                            <span className="text-[10px] text-slate-400 italic">Henüz kimse görüntülemedi.</span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {assignment.description && (
                                                <div className="flex items-start space-x-3 p-4 bg-[#F8F9FA] dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800">
                                                    <FileText className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                                                    <p className="text-xs text-slate-600 dark:text-slate-300 italic leading-relaxed">
                                                        "{assignment.description}"
                                                    </p>
                                                </div>
                                            )}

                                            {assignment.files?.length > 0 && (
                                                <div className="space-y-2">
                                                    {assignment.files.map((file: any, fIdx: number) => (
                                                        <div key={fIdx} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-emerald-500 hover:shadow-sm transition-all group/file">
                                                            <div className="flex items-center space-x-3">
                                                                <div className="bg-emerald-50 p-2 rounded-lg text-emerald-600">
                                                                    {getFileIcon(file.name)}
                                                                </div>
                                                                <span className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{file.name}</span>
                                                            </div>
                                                            <div className="flex items-center space-x-1">
                                                                <button onClick={() => handleDownload(file.url, file.name)} className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-lg transition-colors">
                                                                    <Download className="w-4 h-4" />
                                                                </button>
                                                                <a href={`${process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3001'}${file.url}`} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-slate-50 text-slate-400 hover:text-brand-600 rounded-lg transition-colors">
                                                                    <ExternalLink className="w-4 h-4" />
                                                                </a>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {assignment.words && (
                                                <div>
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Kelime İçeriği ({assignment.words.length})</p>
                                                    <div className="flex flex-wrap gap-1.5">
                                                        {assignment.words.map((w: any, idx: number) => (
                                                            <span key={idx} className="text-[10px] px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-slate-600">
                                                                <span className="font-bold text-brand-600 mr-1">{w.en}</span>
                                                                <span className="text-slate-400">{w.tr}</span>
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="shrink-0 p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-800 flex items-center justify-between z-10">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setActiveId(null); }}
                                                className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors"
                                            >
                                                Kapat
                                            </button>

                                            {showDelete && (
                                                <button
                                                    onClick={(e) => handleDelete(e, assignment.id)}
                                                    className="flex items-center space-x-2 px-4 py-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors"
                                                >
                                                    {deletingId === assignment.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Sil</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-30 text-center">
                        <BookOpen className="w-12 h-12 mx-auto text-slate-200" />
                        <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Henüz ödev <br /> gönderilmedi</p>
                    </div>
                )}
            </div>

            {assignments.length > 0 && !activeId && (
                <div className="absolute bottom-0 inset-x-0 bg-[#FAFAFA] dark:bg-slate-900 border-t-2 border-slate-200 dark:border-slate-800 p-4 flex items-center justify-between z-10 rounded-b-[2rem]">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="p-3 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-sm disabled:opacity-30 hover:bg-slate-50 hover:border-brand-200 transition-all active:scale-95 group"
                    >
                        <ChevronLeft className="w-5 h-5 text-slate-900 dark:text-white group-hover:text-brand-600" />
                    </button>

                    <div className="bg-white dark:bg-slate-800 px-6 py-2 rounded-xl border-2 border-slate-200 dark:border-slate-700 shadow-sm">
                        <span className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">
                            {currentPage} / {totalPages}
                        </span>
                    </div>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="p-3 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-sm disabled:opacity-30 hover:bg-slate-50 hover:border-brand-200 transition-all active:scale-95 group"
                    >
                        <ChevronRight className="w-5 h-5 text-slate-900 dark:text-white group-hover:text-brand-600" />
                    </button>
                </div>
            )}
        </div>
    );
};
