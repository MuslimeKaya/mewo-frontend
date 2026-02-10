import React from 'react';
import { TeacherSelector } from './TeacherSelector';
import { User } from '../types';
import { Users, ShieldCheck } from 'lucide-react';

interface TeachersViewProps {
    user: User;
}

export const TeachersView: React.FC<TeachersViewProps> = ({ user }) => {
    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header section */}
            <div className="pb-10 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-brand-600 mb-1">
                        <div className="w-2 h-2 bg-brand-600 rounded-full animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-70">Elit Eğitmen Ağı</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                        AKADEMİK <span className="text-brand-600 italic">KADRO</span>
                    </h2>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest max-w-2xl leading-relaxed">
                        Global standartlarda uzmanlaşmış hoca kadromuzla, öğrenim sürecinizi stratejik bir başarı hikayesine dönüştürün.
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto">
                <TeacherSelector currentUser={user} onTeacherAssigned={() => window.location.reload()} />
            </div>
        </div>
    );
};
