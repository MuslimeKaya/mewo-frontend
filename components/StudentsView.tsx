import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, Trophy, Clock, ArrowUpRight, TrendingUp, Zap, GraduationCap, Filter, ShieldCheck, X, CheckSquare, Target, BookOpen } from 'lucide-react';
import { authService, API_URL } from '../services/auth';
import { wordsService, Word } from '../services/words';

export const StudentsView: React.FC = () => {
    const [students, setStudents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'top'>('all');
    const [activeTab, setActiveTab] = useState<'roster' | 'requests'>('roster');
    const [pendingRequests, setPendingRequests] = useState<any[]>([]);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [selectedStudent, setSelectedStudent] = useState<any | null>(null);
    const [studentProgress, setStudentProgress] = useState<any[]>([]);
    const [fetchingProgress, setFetchingProgress] = useState(false);
    const itemsPerPage = 10;

    // Handle initial URL check
    useEffect(() => {
        const path = window.location.pathname;
        const match = path.match(/\/students\/([a-f\d-]+)/i);
        if (match && match[1] && students.length > 0) {
            const student = students.find(s => s.id === match[1]);
            if (student) handleSelectStudent(student);
        }
    }, [students]);

    const handleSelectStudent = async (student: any) => {
        setSelectedStudent(student);
        window.history.pushState({}, '', `/students/${student.id}`);
        setFetchingProgress(true);
        try {
            const progress = await authService.getStudentProgressForTeacher(student.id);
            setStudentProgress(progress);
        } catch (e) {
            console.error('Progress error:', e);
        } finally {
            setFetchingProgress(false);
        }
    };

    const handleCloseModal = () => {
        setSelectedStudent(null);
        window.history.pushState({}, '', `/students`);
    };


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
            setError(null);
            const data = await authService.getMyStudents(page, itemsPerPage);
            console.log('Fetched students:', data);
            setStudents(data.students || []);
            setTotalCount(data.count || 0);
        } catch (err: any) {
            console.error('Students could not be loaded:', err);
            setError(err.message || 'Öğrenciler yüklenirken bir sorun oluştu.');
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

    const filteredStudents = (students || []).filter(s => {
        const fullName = `${s.firstName || ''} ${s.lastName || ''}`.toLowerCase();
        const email = (s.email || '').toLowerCase();
        const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || email.includes(searchTerm.toLowerCase());

        if (activeFilter === 'top') return matchesSearch && (s.xp > 1000);
        if (activeFilter === 'active') return matchesSearch && s.lastActiveAt;
        return matchesSearch;
    });

    const stats = [
        { label: 'TOPLAM ÖĞRENCİ', value: totalCount || students.length, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
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
        <div className="space-y-6 animate-in fade-in duration-500 font-sans">
            {/* Minimal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                <div className="flex items-center space-x-4">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Ders Yönetimi</h2>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                        <button
                            onClick={() => setActiveTab('roster')}
                            className={`px-4 py-1.5 text-[11px] font-bold rounded-md transition-all ${activeTab === 'roster' ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-sm' : 'text-slate-400'}`}
                        >
                            Öğrenciler
                        </button>
                        <button
                            onClick={() => setActiveTab('requests')}
                            className={`px-4 py-1.5 text-[11px] font-bold rounded-md transition-all relative ${activeTab === 'requests' ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-sm' : 'text-slate-400'}`}
                        >
                            Talepler
                            {pendingRequests.length > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-rose-500 rounded-full" />}
                        </button>
                    </div>
                </div>

                <div className="flex items-center space-x-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5" /> {totalCount} Kayıt
                    </span>
                </div>
            </div>

            {/* Quiet Search & Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-64 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                    <input
                        type="text"
                        placeholder="İsim veya e-posta ile ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl py-2 pl-9 pr-4 text-xs font-medium focus:ring-2 focus:ring-brand-500/20 transition-all placeholder:text-slate-400"
                    />
                </div>


                {activeTab === 'roster' && (
                    <div className="flex items-center space-x-1 bg-slate-50 dark:bg-slate-800/50 p-1 rounded-lg">
                        {(['all', 'active', 'top'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setActiveFilter(f)}
                                className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${activeFilter === f ? 'bg-white dark:bg-slate-900 text-brand-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                {f === 'all' ? 'Tümü' : f === 'active' ? 'Aktif' : 'Elit'}
                            </button>
                        ))}
                    </div>
                )}
            </div>


            {error ? (
                <div className="py-12 flex justify-center min-h-[60vh]">
                    <div className="bg-rose-50 dark:bg-rose-900/10 text-rose-600 px-6 py-4 rounded-xl flex flex-col items-center gap-2 max-w-sm text-center">
                        <p className="text-xs font-bold">{error}</p>
                        <button
                            onClick={() => fetchStudents(currentPage)}
                            className="text-[10px] uppercase tracking-widest font-black underline underline-offset-4 hover:opacity-70 transition-opacity"
                        >
                            Tekrar Dene
                        </button>
                    </div>
                </div>
            ) : activeTab === 'roster' ? (
                <div className="min-h-[60vh]">
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 12].map(i => (
                                <div key={i} className="h-[6vh] bg-white dark:bg-slate-900 rounded-2xl animate-pulse border border-slate-50 dark:border-slate-800" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                            {filteredStudents.map((student) => (
                                <div
                                    key={student.id}
                                    onClick={() => handleSelectStudent(student)}
                                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 p-2 px-3 hover:border-brand-500/50 transition-all cursor-pointer group shadow-sm hover:shadow-lg hover:-translate-y-0.5 flex items-center gap-3 relative overflow-hidden h-[6vh]"
                                >
                                    <div className="w-8 h-8 rounded-xl overflow-hidden flex items-center justify-center bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shrink-0 relative">
                                        {student.avatar ? (
                                            <img
                                                src={student.avatar.startsWith('http') ? student.avatar : `${API_URL.replace('/api', '')}${student.avatar}`}
                                                className="w-full h-full object-cover"
                                                alt=""
                                            />
                                        ) : (
                                            <span className="text-[10px] font-black text-brand-600/30 uppercase">{student.firstName?.[0]}</span>
                                        )}
                                        {student.lastActiveAt && (
                                            <span className="absolute bottom-0.5 right-0.5 w-2 h-2 bg-emerald-500 border border-white dark:border-slate-900 rounded-full" />
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-[11px] font-black text-slate-900 dark:text-white truncate">
                                            {student.firstName} {student.lastName}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[8px] font-black text-brand-600">Lv.{student.level || 1}</span>
                                            <span className="text-[8px] font-bold text-slate-400 tabular-nums">{student.xp || 0} XP</span>
                                        </div>
                                    </div>

                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowUpRight className="w-3 h-3 text-brand-500" />
                                    </div>
                                </div>
                            ))}

                            {filteredStudents.length === 0 && (
                                <div className="col-span-full py-16 text-center opacity-60">
                                    <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                                        <Users className="w-6 h-6" />
                                    </div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Öğrenci bulunamadı</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-3">
                    {pendingRequests.map((request) => (
                        <div key={request.id} className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between gap-4 shadow-sm hover:border-brand-200 transition-all">
                            <div className="flex items-center space-x-4 min-w-0">
                                <div className="w-10 h-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center shrink-0 border border-slate-100 dark:border-slate-700 overflow-hidden">
                                    {request.avatar ? (
                                        <img
                                            src={request.avatar.startsWith('http') ? request.avatar : `${API_URL.replace('/api', '')}${request.avatar}`}
                                            className="w-full h-full object-cover"
                                            alt=""
                                        />
                                    ) : (
                                        <Users className="w-4 h-4 text-slate-300" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{request.firstName} {request.lastName}</h3>
                                    <p className="text-[10px] text-slate-400 font-medium truncate italic">"{request.joinMessage || "Sisteme katılmak istiyorum."}"</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleApprove(request.enrollmentId)} className="p-2 text-emerald-600 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/10 dark:hover:bg-emerald-900/30 rounded-lg transition-colors" title="Onayla">
                                    <CheckSquare className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleReject(request.enrollmentId)} className="p-2 text-rose-500 bg-rose-50 hover:bg-rose-100 dark:bg-rose-900/10 dark:hover:bg-rose-900/30 rounded-lg transition-colors" title="Reddet">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                    {pendingRequests.length === 0 && (
                        <div className="py-16 text-center opacity-60">
                            <div className="w-12 h-12 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-300">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bekleyen talep yok</p>
                        </div>
                    )}
                </div>
            )}

            {/* Compact Flat Pagination - Zero gap to footer */}
            {activeTab === 'roster' && !error && (
                <div className="sticky bottom-0 z-50 flex items-center justify-center py-2 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 -mx-4 md:-mx-6 px-4 md:px-6">
                    <div className="max-w-7xl w-full flex items-center justify-between">
                        <div className="hidden sm:flex items-center gap-3">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">SAYFA</span>
                            <span className="text-[11px] font-black text-slate-900 dark:text-white tabular-nums">
                                {currentPage} / {Math.ceil(totalCount / itemsPerPage) || 1}
                            </span>
                        </div>
                        <div className="flex items-center space-x-1 mx-auto sm:mx-0">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1 || loading}
                                className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest disabled:opacity-20 text-slate-500 hover:text-brand-600 bg-slate-50 dark:bg-slate-800/50 rounded-lg transition-all"
                            >
                                Geri
                            </button>
                            <div className="px-3 py-1.5 bg-brand-600 text-white rounded-lg font-black text-[11px] shadow-md shadow-brand-500/20">
                                {currentPage}
                            </div>
                            <button
                                onClick={() => setCurrentPage(p => p + 1)}
                                disabled={currentPage * itemsPerPage >= totalCount || loading}
                                className="px-4 py-1.5 text-[10px] font-black uppercase tracking-widest disabled:opacity-20 text-slate-500 hover:text-brand-600 bg-slate-50 dark:bg-slate-800/50 rounded-lg transition-all"
                            >
                                İleri
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Compact Student Progress Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500" onClick={handleCloseModal} />
                    <div className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 relative z-10 animate-in zoom-in-95 duration-300 max-h-[85vh] flex flex-col">
                        {/* Modal Header - Compact */}
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-900/50">
                            <div className="flex items-center space-x-5">
                                <div className="w-14 h-14 bg-brand-600 rounded-2xl overflow-hidden flex items-center justify-center text-white text-xl font-black shadow-lg shadow-brand-500/20 shrink-0">
                                    {selectedStudent.avatar ? (
                                        <img
                                            src={selectedStudent.avatar.startsWith('http') ? selectedStudent.avatar : `${API_URL.replace('/api', '')}${selectedStudent.avatar}`}
                                            className="w-full h-full object-cover"
                                            alt=""
                                        />
                                    ) : (
                                        <span className="uppercase">{selectedStudent.firstName[0]}</span>
                                    )}
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                        {selectedStudent.firstName} {selectedStudent.lastName}
                                    </h3>
                                    <div className="flex gap-3 mt-1">
                                        <span className="text-[10px] font-black text-brand-600 uppercase tracking-widest">Lv. {selectedStudent.level || 1}</span>
                                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedStudent.xp || 0} XP</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleCloseModal}
                                className="p-2 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-slate-400 hover:text-rose-500 rounded-xl transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Content - Scrollable but no scrollbar visible */}
                        <div className="p-8 overflow-y-auto flex-1 scrollbar-hide" style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
                            <style dangerouslySetInnerHTML={{ __html: '.scrollbar-hide::-webkit-scrollbar { display: none; }' }} />
                            {fetchingProgress ? (
                                <div className="py-12 flex flex-col items-center justify-center space-y-4">
                                    <div className="w-10 h-10 border-4 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Veriler Yükleniyor...</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {studentProgress.length > 0 ? studentProgress.map((p, idx) => (
                                        <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 group hover:border-brand-500/30 transition-all">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="text-[10px] font-black text-brand-600 px-2 py-1 bg-white dark:bg-slate-900 rounded-lg shadow-sm">
                                                    Seviye {p.level}
                                                </div>
                                                <span className="text-sm font-black text-slate-900 dark:text-white">%{p.percentage}</span>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center px-0.5">
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Kelime Bilgisi</span>
                                                    <span className="text-[10px] font-bold text-slate-500">{p.learned}/{p.total}</span>
                                                </div>
                                                <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ${p.percentage === 100 ? 'bg-emerald-500' : 'bg-brand-600'}`}
                                                        style={{ width: `${p.percentage}%` }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                    )) : (
                                        <div className="col-span-full py-12 flex flex-col items-center justify-center text-center opacity-30">
                                            <BookOpen className="w-8 h-8 mb-3" />
                                            <p className="text-[10px] font-bold uppercase tracking-widest">Henüz aktivite verisi bulunmuyor</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Modal Footer - Compact */}
                        <div className="p-6 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                            <button
                                onClick={handleCloseModal}
                                className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all"
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

