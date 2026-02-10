import React, { useState, useEffect } from 'react';
import { UserPlus, Check, Loader2, Users, Search, Plus, Send, ShieldCheck, Clock } from 'lucide-react';
import { authService } from '../services/auth';
import { User, Enrollment } from '../types';

interface TeacherSelectorProps {
    currentUser: User;
    onTeacherAssigned: () => void;
}

export const TeacherSelector: React.FC<TeacherSelectorProps> = ({ currentUser, onTeacherAssigned }) => {
    const [teachers, setTeachers] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
    const [joinMessage, setJoinMessage] = useState('');

    useEffect(() => {
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        setLoading(true);
        try {
            const results = await authService.getTeachers();
            setTeachers(results);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmRequest = async () => {
        if (!selectedTeacherId) return;
        setActionLoading(selectedTeacherId);
        try {
            await authService.assignTeacher(selectedTeacherId, joinMessage);
            onTeacherAssigned();
            setSelectedTeacherId(null);
            setJoinMessage('');
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const getEnrollmentStatus = (teacherId: string) => {
        return currentUser.studentEnrollments?.find(e => e.teacherId === teacherId);
    };

    const approvedEnrollments = currentUser.studentEnrollments?.filter(e => e.status === 'approved') || [];
    const pendingEnrollments = currentUser.studentEnrollments?.filter(e => e.status === 'pending') || [];

    return (
        <div className="space-y-4 mb-8">
            {/* 1. AKTİF VE BEKLEYEN HOCALAR (MİNİMAL TASARIM) */}
            {(approvedEnrollments.length > 0 || pendingEnrollments.length > 0) && (
                <div className="flex flex-wrap gap-3">
                    {approvedEnrollments.map((en) => (
                        <div key={en.id} className="bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-sm border-b-2 border-b-emerald-500">
                            <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            </div>
                            <div>
                                <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase leading-none">
                                    {en.teacher?.firstName} {en.teacher?.lastName}
                                </h4>
                                <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">Aktif Eğitmen</p>
                            </div>
                        </div>
                    ))}
                    {pendingEnrollments.map((en) => (
                        <div key={en.id} className="bg-white dark:bg-slate-900 border border-amber-200 dark:border-amber-900/50 rounded-2xl px-4 py-2 flex items-center gap-3 shadow-sm border-b-2 border-b-amber-500">
                            <div className="w-8 h-8 bg-amber-50 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
                                <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                            </div>
                            <div>
                                <h4 className="text-[11px] font-black text-slate-900 dark:text-white uppercase leading-none">
                                    {en.teacher?.firstName} {en.teacher?.lastName}
                                </h4>
                                <p className="text-[8px] font-bold text-amber-600 uppercase tracking-widest mt-0.5">Onay Bekleniyor</p>
                            </div>
                        </div>
                    ))}
                </div>
            )
            }
            {/* 2. YENİ HOCA KEŞFET (KOMPAKT TASARIM) */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-5 premium-shadow relative overflow-hidden border-b-2 border-b-brand-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-3 shrink-0">
                        <div className="bg-brand-600 p-2 rounded-xl shadow-lg shadow-brand-500/20">
                            <UserPlus className="w-4 h-4 text-white" />
                        </div>
                        <div>
                            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">Eğitmen Keşfet</h3>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">Yeni branşlar ekle</p>
                        </div>
                    </div>

                    <div className="relative group flex-1 max-w-xs ml-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Hoca ara..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl py-2 pl-10 pr-4 text-[11px] font-bold focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all"
                        />
                    </div>
                </div>

                {selectedTeacherId ? (
                    <div className="mt-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 animate-in zoom-in duration-300 border border-brand-100 dark:border-brand-900/30">
                        <div className="flex items-center justify-between mb-3 text-[10px] font-black uppercase tracking-widest">
                            <span className="text-slate-800 dark:text-slate-200">Başvuru Notun</span>
                            <button onClick={() => setSelectedTeacherId(null)} className="text-rose-500 hover:text-rose-600">Vazgeç</button>
                        </div>
                        <textarea
                            value={joinMessage}
                            onChange={(e) => setJoinMessage(e.target.value)}
                            placeholder="Kısa bir not bırak..."
                            className="w-full h-20 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 text-[11px] font-bold focus:ring-2 focus:ring-brand-500/10 focus:border-brand-500 outline-none transition-all resize-none shadow-inner"
                        />
                        <button
                            onClick={handleConfirmRequest}
                            disabled={actionLoading === selectedTeacherId}
                            className="w-full mt-3 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-brand-500/10 flex items-center justify-center gap-2"
                        >
                            {actionLoading === selectedTeacherId ? <Loader2 className="w-3 h-3 animate-spin" /> : 'BAŞVURUYU GÖNDER'}
                        </button>
                    </div>
                ) : (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 max-h-[180px] overflow-y-auto custom-scrollbar pr-1">
                        {teachers.filter(t => !getEnrollmentStatus(t.id)).filter(t => {
                            const matchesSearch = t.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                t.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                t.email?.toLowerCase().includes(searchTerm.toLowerCase());
                            return matchesSearch;
                        }).map((teacher) => (
                            <div key={teacher.id} className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-brand-500/50 transition-all group flex flex-col items-center text-center shadow-sm hover:shadow-md duration-300">
                                <div className="relative mb-2">
                                    <div className="w-10 h-10 bg-brand-50 dark:bg-brand-900/20 rounded-xl flex items-center justify-center text-xs font-black text-brand-600 shadow-inner group-hover:scale-105 transition-transform">
                                        {teacher.firstName?.[0]}{teacher.lastName?.[0]}
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white dark:border-slate-900 rounded-full shadow-sm"></div>
                                </div>

                                <p className="text-[11px] font-black text-slate-900 dark:text-white leading-tight line-clamp-1">{teacher.firstName} {teacher.lastName}</p>

                                <div className="mt-1.5 mb-2.5 px-2 py-0.5 bg-brand-50/50 dark:bg-brand-900/10 rounded-lg border border-brand-100/50 dark:border-brand-900/20">
                                    <span className="text-[7px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-widest whitespace-nowrap">
                                        {teacher.specialty || 'General English'}
                                    </span>
                                </div>

                                <button
                                    onClick={() => setSelectedTeacherId(teacher.id)}
                                    className="w-full py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-brand-600 hover:text-white rounded-lg text-[8px] font-black uppercase tracking-widest transition-all shadow-sm"
                                >
                                    BAŞVURU YAP
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div >
    );
};
