import React, { useState, useEffect } from 'react';
import { Megaphone, Calendar, Trash2, Plus, Loader2, ChevronRight, Info, Clock } from 'lucide-react';
import { bulletinsService, Bulletin } from '../services/bulletins';
import { User } from '../types';
import { API_URL } from '../services/auth';

interface BulletinBoardProps {
    user: User;
}

export const BulletinBoard: React.FC<BulletinBoardProps> = ({ user }) => {
    const [bulletins, setBulletins] = useState<Bulletin[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newBulletin, setNewBulletin] = useState({
        title: '',
        content: '',
        category: 'Announcement',
        priority: 'medium' as 'low' | 'medium' | 'high'
    });
    const [actionLoading, setActionLoading] = useState(false);
    const [expandedIds, setExpandedIds] = useState<string[]>([]);
    useEffect(() => {
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

    const handleMarkAsRead = async (id: string, currentlyRead?: boolean) => {
        if (user.role !== 'student' || currentlyRead) return;
        try {
            // Optimistic update
            setBulletins(prev => prev.map(msg => msg.id === id ? { ...msg, isRead: true } : msg));
            await bulletinsService.markAsRead(id);
        } catch (err) {
            console.error('Duyuru okundu işaretlenemedi:', err);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBulletin.title || !newBulletin.content) return;

        setActionLoading(true);
        try {
            await bulletinsService.create(newBulletin);
            setNewBulletin({
                title: '',
                content: '',
                category: 'Announcement',
                priority: 'medium'
            });
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

    const toggleExpand = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setExpandedIds(prev => prev.includes(id)
            ? prev.filter(i => i !== id)
            : [...prev, id]
        );
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('tr-TR', { day: '2-digit', month: 'short' });
    };

    const getRelativeTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Az önce';
        if (diffInHours < 24) return `${diffInHours}s önce`;
        return `${Math.floor(diffInHours / 24)}g önce`;
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
                        <div className="grid grid-cols-2 gap-3">
                            <input
                                type="text"
                                placeholder="Duyuru Başlığı"
                                value={newBulletin.title}
                                onChange={e => setNewBulletin({ ...newBulletin, title: e.target.value })}
                                className="col-span-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-bold focus:ring-2 focus:ring-brand-500/10 outline-none"
                            />
                            <textarea
                                placeholder="Duyuru İçeriği..."
                                value={newBulletin.content}
                                onChange={e => setNewBulletin({ ...newBulletin, content: e.target.value })}
                                className="col-span-2 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2 text-xs font-medium h-24 resize-none focus:ring-2 focus:ring-brand-500/10 outline-none"
                            />
                            <select
                                value={newBulletin.category}
                                onChange={e => setNewBulletin({ ...newBulletin, category: e.target.value })}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest outline-none"
                            >
                                <option value="Announcement">Duyuru</option>
                                <option value="Important">Önemli</option>
                                <option value="Exam">Sınav</option>
                            </select>
                            <select
                                value={newBulletin.priority}
                                onChange={e => setNewBulletin({ ...newBulletin, priority: e.target.value as any })}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest outline-none"
                            >
                                <option value="low">Düşük Öncelik</option>
                                <option value="medium">Orta Öncelik</option>
                                <option value="high">Yüksek Öncelik 🔥</option>
                            </select>
                            <button
                                type="submit"
                                disabled={actionLoading}
                                className="col-span-2 bg-brand-600 text-white rounded-xl py-3 text-[10px] font-black uppercase tracking-widest hover:bg-brand-700 transition-all flex items-center justify-center mt-2"
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
                        const isUnread = !bulletin.isRead;
                        const isHigh = bulletin.priority === 'high';
                        const isLow = bulletin.priority === 'low';
                        const isExpanded = expandedIds.includes(bulletin.id);

                        return (
                            <div
                                key={bulletin.id}
                                onClick={() => handleMarkAsRead(bulletin.id, bulletin.isRead)}
                                className={`group rounded-3xl transition-all duration-300 border-2 relative overflow-hidden active:scale-[0.99] cursor-pointer ${isUnread
                                    ? isHigh
                                        ? 'bg-orange-50/20 border-orange-200 dark:bg-orange-950/5 dark:border-orange-500/20 shadow-sm'
                                        : 'bg-emerald-50/20 border-emerald-200 dark:bg-emerald-950/5 dark:border-emerald-500/20 shadow-sm'
                                    : 'bg-white dark:bg-slate-900 border-slate-50 dark:border-slate-800/50 hover:border-brand-500/20'
                                    }`}
                            >
                                <div className="p-4">
                                    <div className="flex items-center justify-between gap-2 mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${isHigh ? 'bg-orange-100 text-orange-600' : 'bg-slate-50 text-slate-400 dark:bg-slate-800'}`}>
                                                {bulletin.category}
                                            </span>
                                            {isUnread && (
                                                <div className="relative flex items-center justify-center">
                                                    <span className="absolute inline-flex h-3 w-3 animate-ping rounded-full bg-orange-400 opacity-75"></span>
                                                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-orange-600"></span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1 opacity-40">
                                                <Clock className="w-2.5 h-2.5" />
                                                <span className="text-[9px] font-bold">{getRelativeTime(bulletin.createdAt)}</span>
                                            </div>
                                            {user.role === 'teacher' && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDelete(bulletin.id); }}
                                                    className="p-1 text-slate-300 hover:text-rose-500 transition-colors"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white leading-tight">{bulletin.title}</h4>
                                        <div className={`text-[11px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed transition-all duration-300 overflow-hidden ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-5 opacity-70 truncate'}`}>
                                            {bulletin.content}
                                        </div>
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                                        <button
                                            onClick={(e) => toggleExpand(bulletin.id, e)}
                                            className="flex items-center gap-1 text-[9px] font-black text-brand-600 hover:text-brand-700 uppercase tracking-widest transition-colors"
                                        >
                                            {isExpanded ? 'Küçült' : 'Detaylar'}
                                            <ChevronRight className={`w-2.5 h-2.5 transition-transform duration-300 ${isExpanded ? '-rotate-90' : 'rotate-90'}`} />
                                        </button>

                                        <div className="flex items-center gap-1.5 grayscale opacity-60">
                                            <div className="w-4 h-4 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center text-[7px] font-black uppercase border border-slate-200 dark:border-slate-700 overflow-hidden">
                                                {bulletin.teacher?.avatar ? (
                                                    <img
                                                        src={bulletin.teacher.avatar.startsWith('http') ? bulletin.teacher.avatar : `${API_URL.replace('/api', '')}${bulletin.teacher.avatar}`}
                                                        alt="Avatar"
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    bulletin.teacher?.firstName?.[0] || 'T'
                                                )}
                                            </div>
                                            <span className="text-[9px] font-bold text-slate-400 capitalize">
                                                {bulletin.teacher?.firstName} {bulletin.teacher?.lastName}
                                            </span>
                                        </div>
                                    </div>

                                    {user.role === 'teacher' && bulletin.readStats && isExpanded && (
                                        <div className="mt-3 p-2.5 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl animate-in slide-in-from-top-1">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Okunma</span>
                                                <span className="text-[8px] font-black text-brand-600">%{Math.round(bulletin.readStats.percentage)}</span>
                                            </div>
                                            <div className="h-0.5 w-full bg-slate-100 dark:bg-slate-700/50 rounded-full overflow-hidden">
                                                <div className="h-full bg-brand-500" style={{ width: `${bulletin.readStats.percentage}%` }} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {isHigh && (
                                    <div className="absolute top-0 right-0 w-12 h-12 bg-orange-500/5 -mr-6 -mt-6 rotate-45 pointer-events-none" />
                                )}
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
