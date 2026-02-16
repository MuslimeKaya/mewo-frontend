import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, Trophy, Clock, ArrowUpRight, TrendingUp, Zap, GraduationCap, Filter, ShieldCheck, X, CheckSquare, Target } from 'lucide-react';
import { authService } from '../services/auth';
import { Word } from '../services/words';

export const StudentsView: React.FC = () => {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'top'>('all');
    const [activeTab, setActiveTab] = useState<'roster' | 'requests'>('roster');
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
    const [studentProgress, setStudentProgress] = useState<any[]>([]);
    const [fetchingProgress, setFetchingProgress] = useState(false);
    const itemsPerPage = 20;

    useEffect(() => {
        if (activeTab === 'roster') {
            fetchStudents(currentPage);
        } else {
            fetchRequests();
        }
    }, [currentPage, activeTab]);

    const fetchStudents = async (page: number = 1) => {
        try {
            setLoading(true);
            const data = await authService.getMyStudents(page, itemsPerPage);
            setStudents(data.students || []);
            setTotalCount(data.count || 0);
        } catch (err) {
            console.error('Students could not be loaded:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const data = await authService.getJoinRequests();
            setPendingRequests(data || []);
        } catch (err) {
            console.error('Requests could not be loaded:', err);
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter(s => {
        const matchesSearch = `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.email.toLowerCase().includes(searchTerm.toLowerCase());

        if (activeFilter === 'top') return matchesSearch && (s.xp > 1000);
        if (activeFilter === 'active') return matchesSearch && s.lastActiveAt;
        return matchesSearch;
    });

    const stats = [
        { label: 'TOPLAM ÖĞRENCİ', value: students.length, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
        { label: 'BEKLEYEN ONAY', value: pendingRequests.length, icon: ShieldCheck, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
        { label: 'AKTİF ÖĞRENCİ', value: students.filter(s => s.lastActiveAt).length, icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' }
    ];

    const handleApprove = async (id: string) => {
        try {
            await authService.approveRequest(id);
            fetchRequests();
            if (activeTab === 'roster') fetchStudents(currentPage);
        } catch (err) {
            alert('Onaylanırken bir hata oluştu.');
        }
    };

    const handleReject = async (id: string) => {
        try {
            await authService.rejectRequest(id);
            fetchRequests();
        } catch (err) {
            alert('Reddedilirken bir hata oluştu.');
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Admission Control Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-8">
                <div className="space-y-1">
                    <div className="flex items-center space-x-2 text-brand-600 mb-1">
                        <ShieldCheck className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Erişim ve Onay Paneli</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white tracking-tight uppercase leading-none">
                        DERS <span className="text-brand-600">YÖNETİMİ</span>
                    </h2>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">
                        {activeTab === 'roster' ? `KAYITLI ${students.length} ÖĞRENCİ` : `${pendingRequests.length} YENİ BAŞVURU İNCELENİYOR`}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl flex items-center border border-slate-200 dark:border-slate-700">
                        <button
                            onClick={() => setActiveTab('roster')}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all ${activeTab === 'roster' ? 'bg-white dark:bg-slate-900 shadow-lg text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            ÖĞRENCİ LİSTESİ
                        </button>
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black transition-all relative ${activeTab === 'requests' ? 'bg-white dark:bg-slate-900 shadow-lg text-brand-600' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            KATILIM TALEPLERİ
                            {pendingRequests.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-brand-600 text-white text-[8px] flex items-center justify-center rounded-full animate-bounce">
                                    {pendingRequests.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Scale Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, idx) => (
                    <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-all group">
                        <div className="flex items-center space-x-3">
                            <div className={`${stat.bg} ${stat.color} w-9 h-9 rounded-xl flex items-center justify-center shrink-0`}>
                                <stat.icon className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">{stat.label}</p>
                                <h4 className="text-xl font-black text-slate-900 dark:text-white leading-none mt-0.5">{stat.value}</h4>
                            </div>
                        </div>
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <ArrowUpRight className="w-3 h-3 text-slate-300" />
                        </div>
                    </div>
                ))}
            </div>

            {activeTab === 'roster' && (
                <div className="flex items-center justify-between bg-slate-50 dark:bg-slate-800/50 px-6 py-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-4 overflow-x-auto no-scrollbar scroll-smooth">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] whitespace-nowrap">Filtrele:</span>
                        {(['all', 'active', 'top'] as const).map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setActiveFilter(filter)}
                                className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeFilter === filter
                                    ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-sm border border-slate-100 dark:border-slate-700'
                                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                                    }`}
                            >
                                {filter === 'all' ? 'TÜM KAYITLAR' : filter === 'active' ? 'YAKINDA AKTİF' : 'ELİT PUAN (+1000)'}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'roster' ? (
                loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
                            <div key={i} className="h-32 bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-100 dark:border-slate-800" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {filteredStudents.map((student) => (
                            <div key={student.id}
                                onClick={async () => {
                                    setSelectedStudent(student);
                                    setFetchingProgress(true);
                                    try {
                                        const progress = await authService.getStudentProgressForTeacher(student.id);
                                        setStudentProgress(progress);
                                    } catch (e) {
                                        console.error('Progress error:', e);
                                    } finally {
                                        setFetchingProgress(false);
                                    }
                                }}
                                className="group bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-2.5 px-3 shadow-sm hover:shadow-md hover:border-brand-500/30 transition-all duration-300 cursor-pointer flex items-center gap-3">
                                <div className="w-8 h-8 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700/50 group-hover:bg-brand-600 group-hover:text-white transition-all">
                                    <span className="text-[10px] font-black uppercase text-slate-400 group-hover:text-white">{student.firstName?.[0]}{student.lastName?.[0]}</span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h3 className="text-[11px] font-black text-slate-900 dark:text-white leading-tight truncate">
                                        {student.firstName} {student.lastName}
                                    </h3>
                                    <div className="flex items-center space-x-1.5 mt-0.5">
                                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">L{student.level || 1} • {student.xp || 0} XP</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {pendingRequests.length > 0 ? (
                        <div className="space-y-2 col-span-full">
                            {pendingRequests.map((request) => (
                                <div key={request.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 px-5 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 animate-in slide-in-from-right-4 duration-300">
                                    <div className="flex items-center space-x-3 shrink-0">
                                        <div className="w-9 h-9 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg flex items-center justify-center">
                                            <Users className="w-4 h-4" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="text-xs font-black text-slate-900 dark:text-white leading-none uppercase truncate">{request.firstName} {request.lastName}</h3>
                                            <p className="text-[9px] font-bold text-slate-400 mt-0.5 truncate">{request.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl px-4 py-2 text-[10px] font-medium text-slate-500 italic truncate max-w-md border border-slate-100 dark:border-slate-800">
                                        "{request.joinMessage || "Sisteminize dahil olmak istiyorum."}"
                                    </div>

                                    <div className="flex items-center gap-2 shrink-0">
                                        <button
                                            onClick={() => handleApprove(request.enrollmentId)}
                                            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-[9px] font-black uppercase tracking-widest rounded-lg transition-all active:scale-95 shadow-lg shadow-emerald-500/10"
                                        >
                                            ONAYLA
                                        </button>
                                        <button
                                            onClick={() => handleReject(request.enrollmentId)}
                                            className="px-5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-red-600 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all active:scale-95"
                                        >
                                            REDDET
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="col-span-full py-32 flex flex-col items-center justify-center text-center opacity-30">
                            <ShieldCheck className="w-16 h-16 text-slate-300 mb-4" />
                            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">BEKLEYEN BAŞVURU YOK</h3>
                            <p className="text-sm font-bold text-slate-400 max-w-xs mt-2">Şu an için onayınızı bekleyen herhangi bir ders katılım talebi bulunmamaktadır.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Pagination / Scalability Footer */}
            {activeTab === 'roster' && (
                <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                    <p>
                        GÖSTERİLEN: {Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)} - {Math.min(currentPage * itemsPerPage, totalCount)} / TOPLAM {totalCount}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1 || loading}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all duration-300 flex items-center gap-2 ${currentPage === 1
                                ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-brand-600 hover:text-white hover:shadow-lg hover:shadow-brand-500/20 active:scale-95'
                                }`}
                        >
                            <span className="text-sm">←</span> ÖNCEKİ
                        </button>

                        <div className="flex items-center bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-xl px-4 py-2.5">
                            <span className="text-[10px] font-black text-slate-400 uppercase mr-2 tracking-tighter">SAYFA</span>
                            <span className="text-xs font-black text-brand-600">{currentPage}</span>
                        </div>

                        <button
                            onClick={() => setCurrentPage(p => p + 1)}
                            disabled={currentPage * itemsPerPage >= totalCount || loading}
                            className={`px-5 py-2.5 rounded-xl text-[10px] font-black tracking-widest transition-all duration-300 flex items-center gap-2 ${currentPage * itemsPerPage >= totalCount
                                ? 'bg-slate-100 dark:bg-slate-800/50 text-slate-300 dark:text-slate-600 cursor-not-allowed opacity-50'
                                : 'bg-brand-600 text-white hover:bg-brand-700 hover:shadow-lg hover:shadow-brand-500/30 active:scale-95'
                                }`}
                        >
                            SONRAKİ <span className="text-sm">→</span>
                        </button>
                    </div>
                </div>
            )}
            {/* Student Progress Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border-4 border-white dark:border-slate-800">
                        <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/50">
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center text-white text-lg font-black">
                                    {selectedStudent.firstName[0]}{selectedStudent.lastName[0]}
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                        {selectedStudent.firstName} {selectedStudent.lastName}
                                    </h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Yol Haritası ve Seviye İlerlemesi</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedStudent(null)} className="p-2 hover:bg-white dark:hover:bg-slate-700 rounded-xl transition-colors">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>
                        </div>

                        <div className="p-8 space-y-6">
                            {fetchingProgress ? (
                                <div className="py-20 flex flex-col items-center justify-center space-y-4">
                                    <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
                                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Veriler yükleniyor...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {studentProgress.map((p, idx) => (
                                        <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 group hover:border-brand-500/30 transition-all">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center space-x-3">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${p.percentage === 100 ? 'bg-emerald-500 text-white' : 'bg-brand-100 dark:bg-brand-900/30 text-brand-600'}`}>
                                                        {p.level}
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Kelime Bilgisi</p>
                                                        <h4 className="text-sm font-black text-slate-900 dark:text-white">{p.learned} / {p.total} Kelime</h4>
                                                    </div>
                                                </div>
                                                <span className={`text-xs font-black ${p.percentage === 100 ? 'text-emerald-500' : 'text-brand-600'}`}>%{p.percentage}</span>
                                            </div>
                                            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <div
                                                    className={`h-full transition-all duration-1000 ${p.percentage === 100 ? 'bg-emerald-500' : 'bg-brand-500'}`}
                                                    style={{ width: `${p.percentage}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
                            >
                                Kapat
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
