
import React, { useState, useRef } from 'react';
import { User, Camera, Mail, User as UserIcon, Type, Save, LogOut, CheckCircle, AlertCircle, Loader2, Lock } from 'lucide-react';
import { User as UserType } from '../types';
import { authService, API_URL } from '../services/auth';

interface SettingsViewProps {
    user: UserType;
    onUpdateUser: (user: UserType) => void;
    onLogout: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user, onUpdateUser, onLogout }) => {
    const [firstName, setFirstName] = useState(user.firstName);
    const [lastName, setLastName] = useState(user.lastName);
    const [bio, setBio] = useState(user.bio || '');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
    const [isPasswordChanging, setIsPasswordChanging] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);
    const [avatarLoading, setAvatarLoading] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setLoading(true);
        setStatus(null);

        try {
            const updatedUser = await authService.updateProfile({ firstName, lastName, bio });
            onUpdateUser(updatedUser);
            setStatus({ type: 'success', message: 'Profil başarıyla güncellendi!' });
        } catch (error: any) {
            setStatus({ type: 'error', message: error.message || 'Profil güncellenirken hata oluştu' });
        } finally {
            setLoading(false);
        }
    };

    const handleSendOtp = async () => {
        setPasswordLoading(true);
        setStatus(null);
        try {
            await authService.sendOtp();
            setOtpSent(true);
            setStatus({ type: 'success', message: 'Doğrulama kodu e-posta/telefonunuza gönderildi.' });
        } catch (error: any) {
            setStatus({ type: 'error', message: error.message || 'Kod gönderilemedi' });
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!otp || !newPassword) return;

        if (newPassword !== newPasswordConfirm) {
            setStatus({ type: 'error', message: 'Şifreler uyuşmuyor!' });
            return;
        }

        if (newPassword.length < 8 || newPassword.length > 20) {
            setStatus({ type: 'error', message: 'Şifre 8 ile 20 karakter arasında olmalıdır' });
            return;
        }

        setPasswordLoading(true);
        setStatus(null);

        try {
            await authService.changePassword({ otp, newPassword });
            setOtp('');
            setNewPassword('');
            setNewPasswordConfirm('');
            setOtpSent(false);
            setIsPasswordChanging(false);
            setStatus({ type: 'success', message: 'Şifre başarıyla değiştirildi!' });
        } catch (error: any) {
            setStatus({ type: 'error', message: error.message || 'Şifre değiştirilemedi' });
        } finally {
            setPasswordLoading(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setAvatarLoading(true);
        setStatus(null);

        try {
            const updatedUser = await authService.uploadAvatar(file);
            onUpdateUser(updatedUser);
            setStatus({ type: 'success', message: 'Profil fotoğrafı güncellendi!' });
        } catch (error: any) {
            setStatus({ type: 'error', message: error.message || 'Dosya yüklenirken hata oluştu' });
        } finally {
            setAvatarLoading(false);
        }
    };

    const avatarUrl = user.avatar
        ? (user.avatar.startsWith('http') ? user.avatar : `${API_URL.replace('/api', '')}${user.avatar}`)
        : null;

    return (
        <div className="max-w-sm mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="bg-white dark:bg-slate-900 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden mb-8">
                <div className="p-5">
                    {/* Instagram-style Header: Avatar + Stats */}
                    <div className="flex items-center gap-5 mb-6">
                        <div className="relative group cursor-pointer shrink-0" onClick={() => fileInputRef.current?.click()}>
                            <div className="w-20 h-20 rounded-full p-1 bg-gradient-to-tr from-orange-500 via-orange-500 to-orange-600 shadow-lg shadow-orange-500/20">
                                <div className="w-full h-full rounded-full overflow-hidden border-2 border-white dark:border-slate-900 bg-white dark:bg-slate-900 relative">
                                    {avatarLoading ? (
                                        <div className="absolute inset-0 bg-slate-100/50 dark:bg-slate-800/50 flex items-center justify-center backdrop-blur-sm z-10">
                                            <Loader2 className="w-5 h-5 text-brand-600 animate-spin" />
                                        </div>
                                    ) : null}
                                    {avatarUrl ? (
                                        <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-brand-600 font-black text-xl uppercase">
                                            {user.firstName[0]}{user.lastName[0]}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="absolute bottom-0 right-0 p-1 bg-brand-600 text-white rounded-full shadow-lg border-2 border-white dark:border-slate-900">
                                <Camera className="w-2.5 h-2.5" />
                            </div>
                            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                        </div>

                        <div className="flex-1 flex justify-around">
                            <div className="text-center">
                                <p className="text-sm font-black text-slate-900 dark:text-white">{user.level}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Level</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-black text-slate-900 dark:text-white">{user.xp}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">XP</p>
                            </div>
                            <div className="text-center">
                                <p className="text-sm font-black text-slate-900 dark:text-white">{user.currentStreak}</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">Gün</p>
                            </div>
                        </div>
                    </div>

                    {status && (
                        <div className={`p-3 rounded-xl flex items-center gap-2 mb-4 animate-in zoom-in duration-300 ${status.type === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/10' : 'bg-rose-50 text-rose-600 dark:bg-rose-900/10'}`}>
                            {status.type === 'success' ? <CheckCircle className="w-3.5 h-3.5 shrink-0" /> : <AlertCircle className="w-3.5 h-3.5 shrink-0" />}
                            <span className="text-[9px] font-black uppercase tracking-wide">{status.message}</span>
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Profile Info Form */}
                        <form onSubmit={handleSave} className="space-y-3">
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">AD</label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={e => setFirstName(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-transparent focus:border-brand-500/20 rounded-xl px-3 py-2.5 text-xs font-bold dark:text-white outline-none transition-all"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">SOYAD</label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={e => setLastName(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-transparent focus:border-brand-500/20 rounded-xl px-3 py-2.5 text-xs font-bold dark:text-white outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">BİYOGRAFİ</label>
                                <textarea
                                    value={bio}
                                    onChange={e => setBio(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-white/5 border border-transparent focus:border-brand-500/20 rounded-xl p-3 text-xs font-medium dark:text-white outline-none transition-all h-16 resize-none leading-snug"
                                    placeholder="Bir şeyler yaz..."
                                />
                            </div>
                        </form>

                        {/* Password Section Toggle */}
                        <div className="pt-3 border-t border-slate-50 dark:border-slate-800">
                            {!isPasswordChanging ? (
                                <button
                                    onClick={() => setIsPasswordChanging(true)}
                                    className="w-full py-2 text-[9px] font-black text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 rounded-xl transition-all uppercase tracking-widest flex items-center justify-center gap-2"
                                >
                                    <Lock className="w-3 h-3" />
                                    ŞİFREYİ DEĞİŞTİR
                                </button>
                            ) : (
                                <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Şifre Güvenliği</h3>
                                        <button
                                            onClick={() => { setIsPasswordChanging(false); setOtpSent(false); }}
                                            className="text-[9px] font-black text-rose-500 uppercase tracking-widest hover:underline"
                                        >
                                            İPTAL
                                        </button>
                                    </div>

                                    {!otpSent ? (
                                        <div className="bg-indigo-50 dark:bg-indigo-900/10 p-3 rounded-xl space-y-2">
                                            <p className="text-[9px] font-bold text-indigo-600 dark:text-indigo-400 leading-relaxed">
                                                Doğrulama kodu gönderilecektir.
                                            </p>
                                            <button
                                                onClick={handleSendOtp}
                                                disabled={passwordLoading}
                                                className="w-full bg-indigo-600 text-white rounded-lg py-2 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                                            >
                                                {passwordLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Mail className="w-3 h-3" />}
                                                KOD GÖNDER
                                            </button>
                                        </div>
                                    ) : (
                                        <form onSubmit={handleChangePassword} className="space-y-3">
                                            <input
                                                type="text"
                                                value={otp}
                                                onChange={e => setOtp(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-white/5 border-2 border-indigo-100 dark:border-indigo-900/30 rounded-xl px-3 py-2 text-sm font-black text-center tracking-[0.5em] focus:border-indigo-500 outline-none"
                                                placeholder="000000"
                                                maxLength={6}
                                            />
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={e => setNewPassword(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-transparent focus:border-indigo-500/20 rounded-xl px-3 py-2 text-xs font-bold dark:text-white outline-none"
                                                placeholder="Yeni Şifre"
                                            />
                                            <input
                                                type="password"
                                                value={newPasswordConfirm}
                                                onChange={e => setNewPasswordConfirm(e.target.value)}
                                                className="w-full bg-slate-50 dark:bg-white/5 border border-transparent focus:border-indigo-500/20 rounded-xl px-3 py-2 text-xs font-bold dark:text-white outline-none"
                                                placeholder="Yeni Şifre (Tekrar)"
                                            />
                                            <button
                                                type="submit"
                                                disabled={passwordLoading}
                                                className="w-full bg-indigo-600 text-white rounded-xl py-2.5 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                                            >
                                                GÜNCELLE
                                            </button>
                                        </form>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Visible Footer Section */}
                <div className="bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 px-5 py-4">
                    <button
                        onClick={() => handleSave()}
                        disabled={loading}
                        className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl py-3 text-[9px] font-black uppercase tracking-[0.2em] transition-all hover:bg-brand-600 hover:text-white active:scale-95 flex items-center justify-center gap-2 shadow-sm"
                    >
                        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                        PROFİLİ GÜNCELLE
                    </button>

                    <div className="flex justify-end mt-3">
                        <button
                            onClick={onLogout}
                            title="Çıkış Yap"
                            className="p-2.5 text-rose-400 hover:text-rose-600 dark:text-rose-500/70 dark:hover:text-rose-400 transition-colors flex items-center gap-2 text-[9px] font-black uppercase tracking-widest active:scale-95"
                        >
                            <LogOut className="w-4 h-4" /> ÇIKIŞ YAP
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
