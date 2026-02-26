import React, { useState, useEffect } from 'react';
import {
    Layout,
    Plus,
    Trash2,
    Send,
    Edit3,
    Check,
    X,
    Loader2,
    BookOpen,
    Target,
    ChevronRight,
    Search,
    Clock,
    Sparkles,
    FileText,
    Book
} from 'lucide-react';
import { wordsService } from '../services/words';
import { grammarService } from '../services/grammar';
import { Word } from '../types';

interface Template {
    id: string;
    title: string;
    description: string;
    words: any[];
    files: any[];
    grammars?: any[];
    createdAt: string;
}

interface AssignmentTemplatesProps {
    onApplyTemplate: (template: Template) => void;
}

export const AssignmentTemplates: React.FC<AssignmentTemplatesProps> = ({ onApplyTemplate }) => {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    // Edit State
    const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
    const [updateLoading, setUpdateLoading] = useState(false);

    // Create/Edit State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [newTemplate, setNewTemplate] = useState({
        title: '',
        description: '',
        words: [] as Word[],
        grammars: [] as any[]
    });

    // Selection search states
    const [wordSearch, setWordSearch] = useState('');
    const [wordResults, setWordResults] = useState<Word[]>([]);
    const [grammarTopics, setGrammarTopics] = useState<any[]>([]);
    const [loadingWords, setLoadingWords] = useState(false);
    const [activeTab, setActiveTab] = useState<'words' | 'grammar'>('words');

    useEffect(() => {
        fetchTemplates();
        fetchGrammarTopics();
    }, []);

    const fetchGrammarTopics = async () => {
        try {
            const data = await grammarService.getTopics();
            setGrammarTopics(data);
        } catch (err) {
            console.error('Grammar topics fetch error:', err);
        }
    };

    useEffect(() => {
        if (wordSearch.length >= 2) {
            const delayDebounce = setTimeout(async () => {
                setLoadingWords(true);
                try {
                    const data = await wordsService.findAll(wordSearch, undefined, 1, 10);
                    setWordResults(data.items);
                } catch (err) {
                    console.error('Words search error:', err);
                } finally {
                    setLoadingWords(false);
                }
            }, 500);
            return () => clearTimeout(delayDebounce);
        } else {
            setWordResults([]);
        }
    }, [wordSearch]);

    const fetchTemplates = async () => {
        setLoading(true);
        try {
            const data = await wordsService.getTemplates();
            setTemplates(data);
        } catch (err) {
            console.error('Templates fetch error:', err);
        } finally {
            setLoading(false);
        }
    };

    const requestDelete = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        setConfirmDeleteId(id);
    };

    const confirmDelete = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        setDeletingId(id);
        setConfirmDeleteId(null);
        try {
            await wordsService.deleteTemplate(id);
            setTemplates(prev => prev.filter(t => t.id !== id));
        } catch (err) {
            alert('Silme işlemi başarısız oldu.');
        } finally {
            setDeletingId(null);
        }
    };

    const cancelDelete = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setConfirmDeleteId(null);
    };

    const handleUpdateTemplate = async () => {
        if (!editingTemplate || !editingTemplate.title) {
            alert('Lütfen bir başlık giriniz.');
            return;
        }

        setUpdateLoading(true);
        try {
            const updated = await wordsService.updateTemplate(editingTemplate.id, {
                title: editingTemplate.title,
                description: editingTemplate.description
            });
            setTemplates(prev => prev.map(t => t.id === updated.id ? updated : t));
            setEditingTemplate(null);
        } catch (err) {
            alert('Şablon güncellenemedi.');
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleCreateTemplate = async () => {
        if (!newTemplate.title) {
            alert('Lütfen bir başlık giriniz.');
            return;
        }

        setIsSaving(true);
        try {
            const saved = await wordsService.createTemplate({
                title: newTemplate.title,
                description: newTemplate.description,
                words: newTemplate.words,
                grammars: newTemplate.grammars
            });
            setTemplates(prev => [saved, ...prev]);
            setIsModalOpen(false);
            setNewTemplate({ title: '', description: '', words: [], grammars: [] });
        } catch (err) {
            alert('Şablon oluşturulamadı.');
        } finally {
            setIsSaving(false);
        }
    };

    const toggleWord = (word: Word) => {
        setNewTemplate(prev => {
            const exists = prev.words.find(w => w.id === word.id);
            if (exists) {
                return { ...prev, words: prev.words.filter(w => w.id !== word.id) };
            } else {
                return { ...prev, words: [...prev.words, word] };
            }
        });
    };

    const toggleGrammar = (topic: any) => {
        setNewTemplate(prev => {
            const exists = prev.grammars.find(g => g.id === topic.id);
            if (exists) {
                return { ...prev, grammars: prev.grammars.filter(g => g.id !== topic.id) };
            } else {
                return { ...prev, grammars: [...prev.grammars, topic] };
            }
        });
    };

    const filteredTemplates = templates.filter(t =>
        t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center p-12">
                <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-[#FAFAFA]/50 dark:bg-slate-950/20 overflow-hidden">
            {/* Toolbar */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600">
                        <Layout className="w-4.5 h-4.5" />
                    </div>
                    <div>
                        <h3 className="text-[13px] font-black text-slate-800 dark:text-white uppercase tracking-tight">Hazır Şablonlar</h3>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{templates.length} KAYITLI TASLAK</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative group flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-orange-500 transition-colors" />
                        <input
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Şablon ara..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:ring-4 focus:ring-orange-500/5 transition-all"
                        />
                    </div>
                </div>
            </div>

            {/* Template List */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                {filteredTemplates.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center opacity-40 py-20">
                        <div className="w-20 h-20 rounded-[2rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-6">
                            <Sparkles className="w-10 h-10 text-slate-400" />
                        </div>
                        <h4 className="text-base font-black text-slate-800 dark:text-white uppercase tracking-tight">Şablon Bulunamadı</h4>
                        <p className="text-[11px] font-medium text-slate-500 mt-2 text-center max-w-xs px-4 leading-relaxed">
                            "Ödev Oluşturucu" sayfasından hazırladığınız kelime listelerini şablon olarak kaydederek burada yönetebilirsiniz.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTemplates.map((template) => (
                            <div
                                key={template.id}
                                className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-5 hover:border-orange-500/30 hover:shadow-xl hover:shadow-orange-500/5 transition-all duration-300 relative overflow-hidden flex flex-col"
                            >
                                {/* Decorative Gradient */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl -mr-16 -mt-16 group-hover:bg-orange-500/10 transition-all pointer-events-none" />

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    {confirmDeleteId === template.id ? (
                                        <div className="flex items-center bg-rose-50 dark:bg-rose-500/10 rounded-xl p-0.5 animate-in zoom-in-95 duration-200 shadow-sm border border-rose-100 dark:border-rose-500/20">
                                            <button
                                                onClick={(e) => confirmDelete(e, template.id)}
                                                className="flex items-center gap-1 px-2.5 py-1.5 text-[9px] font-black text-white bg-rose-500 hover:bg-rose-600 rounded-[10px] uppercase tracking-widest transition-all shadow-sm"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                SİL
                                            </button>
                                            <button
                                                onClick={cancelDelete}
                                                className="px-2.5 py-1.5 text-[9px] font-black text-rose-600 dark:text-rose-400 hover:bg-white dark:hover:bg-slate-800 rounded-[10px] uppercase tracking-widest transition-all"
                                            >
                                                VAZGEÇ
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();
                                                    setEditingTemplate(template);
                                                }}
                                                className="p-2 text-slate-400 border border-slate-100 dark:border-slate-800 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-500/10 hover:border-orange-200 dark:hover:border-orange-500/30 rounded-xl transition-all shadow-sm"
                                                title="Şablonu Düzenle"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={(e) => requestDelete(e, template.id)}
                                                className="p-2 text-slate-400 border border-slate-100 dark:border-slate-800 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:border-rose-200 dark:hover:border-rose-500/30 rounded-xl transition-all shadow-sm"
                                                title="Şablonu Sil"
                                            >
                                                {deletingId === template.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1.5 flex-1 mb-6 relative z-10">
                                    <h4 className="text-sm font-black text-slate-800 dark:text-white uppercase tracking-tight line-clamp-1">{template.title}</h4>
                                    <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed h-8">
                                        {template.description || 'Açıklama belirtilmemiş.'}
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between mb-4 relative z-10">
                                    <div className="flex gap-2">
                                        <div className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center gap-1.5">
                                            <Target className="w-3 h-3 text-orange-500" />
                                            <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase">{template.words?.length || 0} Kelime</span>
                                        </div>
                                        {(template.grammars?.length ?? 0) > 0 && (
                                            <div className="px-2.5 py-1 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center gap-1.5">
                                                <BookOpen className="w-3 h-3 text-orange-500" />
                                                <span className="text-[10px] font-black text-slate-600 dark:text-slate-300 uppercase">{template.grammars?.length} Gramer</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <button
                                    onClick={() => onApplyTemplate(template)}
                                    className="w-full py-2.5 bg-slate-50 dark:bg-slate-800/50 hover:bg-orange-600 hover:text-white text-slate-500 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all relative z-10 flex items-center justify-center gap-2 group/btn"
                                >
                                    <span>ŞABLONU UYGULA</span>
                                    <ChevronRight className="w-3.5 h-3.5 opacity-40 group-hover/btn:opacity-100 group-hover/btn:translate-x-1 transition-all" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {/* Edit Template Modal */}
            {editingTemplate && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setEditingTemplate(null)} />
                    <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl flex flex-col p-6 lg:p-8 border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center text-orange-600 shadow-inner">
                                    <Edit3 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tight">Şablonu Düzenle</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">İSİM VE AÇIKLAMA GÜNCELLE</p>
                                </div>
                            </div>
                            <button onClick={() => setEditingTemplate(null)} className="w-10 h-10 flex items-center justify-center border border-slate-100 dark:border-slate-800 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-rose-500 transition-colors">
                                <X className="w-4 h-4 text-slate-400" />
                            </button>
                        </div>

                        <div className="space-y-4 flex-1">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">ŞABlon Başlığı</label>
                                <input
                                    type="text"
                                    value={editingTemplate.title}
                                    onChange={(e) => setEditingTemplate({ ...editingTemplate, title: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 dark:text-white outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-300 transition-all placeholder:font-medium placeholder:text-slate-400"
                                    placeholder="Örn: Yeni Başlayanlar İçin"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Açıklama (Opsiyonel)</label>
                                <textarea
                                    value={editingTemplate.description || ''}
                                    onChange={(e) => setEditingTemplate({ ...editingTemplate, description: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-medium text-slate-600 dark:text-slate-300 outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-300 transition-all min-h-[100px] resize-none placeholder:text-slate-400"
                                    placeholder="Bu şablon neleri içeriyor?"
                                />
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <button
                                onClick={handleUpdateTemplate}
                                disabled={updateLoading || !editingTemplate.title}
                                className="w-full py-4 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                {updateLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                {updateLoading ? 'KAYDEDİLİYOR...' : 'DEĞİŞİKLİKLERİ KAYDET'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
