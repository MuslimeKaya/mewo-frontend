import React, { useState, useEffect } from 'react';
import { Megaphone, Calendar, Clock, ChevronRight, Plus, Trash2, Loader2, Info, AlertCircle, Sparkles } from 'lucide-react';
import { bulletinsService, Bulletin } from '../services/bulletins';
import { User } from '../types';

interface BulletinBoardProps {
    user: User;
}

export const BulletinBoard: React.FC<BulletinBoardProps> = ({ user }) => {
    const [bulletins, setBulletins] = useState<Bulletin[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newBulletin, setNewBulletin] = useState({ title: '', content: '', category: 'Announcement' });
    const [actionLoading, setActionLoading] = useState(false);
    const [readIds, setReadIds] = useState<string[]>([]);

    useEffect(() => {
        const stored = localStorage.getItem(`mewo_read_bulletins_${user.id}`);
        if (stored) setReadIds(JSON.parse(stored));
        fetchBulletins();
    }, []);

    const fetchBulletins = async () => {
        try {
            setLoading(true);
            const data = user.role === 'teacher'
                ? await bulletinsService.getForTeacher()
                : await bulletinsService.getForStudent();
            setBulletins(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = (id: string) => {
        if (readIds.includes(id)) return;
        const newIds = [...readIds, id];
        setReadIds(newIds);
        localStorage.setItem(`mewo_read_bulletins_${user.id}`, JSON.stringify(newIds));
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBulletin.title || !newBulletin.content) return;

        setActionLoading(true);
        try {
            await bulletinsService.create(newBulletin);
            setNewBulletin({ title: '', content: '', category: 'Announcement' });
            setIsCreating(false);
            fetchBulletins();
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Bu duyuruyu silmek istediğinize emin misiniz?')) return;
        try {
            await bulletinsService.delete(id);
            fetchBulletins();
        } catch (err) {
            console.error(err);
        }
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-3">
                    <div className="bg-brand-100 dark:bg-brand-900/30 p-2.5 rounded-xl">
                        <Megaphone className="w-5 h-5 text-brand-600" />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Duyuru Panosu</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Güncel Duyurular</p>
                    </div>
                </div>
                {user.role === 'teacher' && (
                    <button
                        onClick={() => setIsCreating(!isCreating)}
                        className="p-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl transition-all active:scale-95 shadow-lg shadow-brand-500/20"
                    >
                        <Plus className={`w-5 h-5 transition-transform duration-300 ${isCreating ? 'rotate-45' : ''}`} />
                    </button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-4">
                {isCreating && (
                    <form onSubmit={handleCreate} className="bg-slate-50 dark:bg-slate-800/50 rounded-3xl p-5 border border-brand-100 dark:border-brand-900/20 animate-in zoom-in duration-300 space-y-3">
                        <input
                            type="text"
                            placeholder="Duyuru Başlığı"
                            value={newBulletin.title}
                            onChange={e => setNewBulletin({ ...newBulletin, title: e.target.value })}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-brand-500/10 outline-none"
                        />
                        <textarea
                            placeholder="Duyuru İçeriği..."
                            value={newBulletin.content}
                            onChange={e => setNewBulletin({ ...newBulletin, content: e.target.value })}
                            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-medium h-24 resize-none focus:ring-2 focus:ring-brand-500/10 outline-none"
                        />
                        <div className="grid grid-cols-2 gap-2">
                            <select
                                value={newBulletin.category}
                                onChange={e => setNewBulletin({ ...newBulletin, category: e.target.value })}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest outline-none"
                            >
                                <option value="Announcement">Duyuru</option>
                                <option value="Important">Önemli</option>
                                <option value="Exam">Sınav</option>
                            </select>
                            <button
                                type="submit"
                                disabled={actionLoading}
                                className="bg-brand-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-700 transition-all flex items-center justify-center"
                            >
                                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'YAYINLA'}
                            </button>
                        </div>
                    </form>
                )}

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => <div key={i} className="h-24 bg-slate-50 dark:bg-slate-800/50 rounded-3xl animate-pulse" />)}
                    </div>
                ) : bulletins.length > 0 ? (
                    bulletins.map((bulletin) => {
                        const isUnread = !readIds.includes(bulletin.id);
                        return (
                            <div
                                key={bulletin.id}
                                onClick={() => handleMarkAsRead(bulletin.id)}
                                className={`group border-2 rounded-[2.5rem] p-7 md:p-8 transition-all hover:shadow-2xl relative overflow-hidden active:scale-[0.99] duration-500 cursor-pointer ${isUnread
                                    ? 'bg-emerald-50/40 dark:bg-emerald-900/10 border-emerald-200/50 dark:border-emerald-800/50 shadow-lg shadow-emerald-500/5'
                                    : 'bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800/50 hover:border-brand-500/30'
                                    }`}
                            >
                                <div className="flex items-start justify-between mb-5">
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center shrink-0 border transition-colors relative ${isUnread
                                            ? 'bg-emerald-100/50 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-800/50'
                                            : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 group-hover:bg-brand-50'
                                            }`}>
                                            {isUnread && (
                                                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                                </span>
                                            )}
                                            <span className={`text-xs font-black leading-none uppercase ${isUnread ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
                                                {formatDate(bulletin.createdAt).split(' ')[1]}
                                            </span>
                                            <span className={`text-sm font-black mt-1 ${isUnread ? 'text-emerald-600' : 'text-brand-600'}`}>
                                                {formatDate(bulletin.createdAt).split(' ')[0]}
                                            </span>
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-3">
                                                <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{bulletin.title}</h4>
                                                {isUnread && (
                                                    <span className="bg-emerald-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest animate-pulse">Yeni</span>
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-3 mt-2">
                                                <span className={`text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest ${bulletin.category === 'Important'
                                                    ? 'bg-rose-100 text-rose-600 dark:bg-rose-900/30'
                                                    : 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30'
                                                    }`}>
                                                    {bulletin.category}
                                                </span>
                                                {bulletin.teacher && (
                                                    <div className="flex items-center space-x-1.5">
                                                        <div className="w-4 h-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-[8px] font-black">
                                                            {bulletin.teacher.firstName[0]}
                                                        </div>
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                            Teacher {bulletin.teacher.firstName}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {user.role === 'teacher' && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(bulletin.id);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 p-2.5 text-slate-300 hover:text-rose-500 transition-all absolute top-6 right-6 bg-slate-50 dark:bg-slate-800 rounded-xl"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    )}
                                </div>
                                <div className="max-h-32 overflow-y-auto custom-scrollbar-thin">
                                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400 leading-relaxed italic border-l-4 border-brand-100 dark:border-brand-900/30 pl-6 py-2">
                                        "{bulletin.content}"
                                    </p>
                                </div>
                                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full -mr-16 -mt-16 group-hover:opacity-20 transition-colors duration-700 ${isUnread ? 'bg-emerald-500/10' : 'bg-brand-500/5'}`} />
                            </div>
                        );
                    })
                ) : (
                    <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-30 text-center py-12">
                        <Info className="w-12 h-12 text-slate-200" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Henüz bir duyuru <br /> yayınlanmadı</p>
                    </div>
                )}
            </div>
        </div>
    );
};
