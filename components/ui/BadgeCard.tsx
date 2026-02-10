
import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  progress: number;
  isLocked?: boolean;
  colorClass?: string;
  bgClass?: string;
}

export const BadgeCard = ({ 
  title, 
  subtitle, 
  icon, 
  progress, 
  isLocked, 
  colorClass = "text-brand-600", 
  bgClass = "bg-brand-50 dark:bg-brand-900/20" 
}: BadgeCardProps) => {
  return (
    <div className={cn(
      "relative group p-4 rounded-[2rem] border border-slate-100 dark:border-slate-800 transition-all hover:scale-[1.02]",
      isLocked ? "opacity-60 grayscale cursor-not-allowed" : "hover:shadow-lg cursor-help"
    )}>
      <div className="flex items-center gap-4">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm", bgClass, colorClass)}>
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h5 className="text-sm font-black text-slate-900 dark:text-white truncate">{title}</h5>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{subtitle}</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-black text-slate-500">{progress}%</span>
        </div>
      </div>
      <div className="mt-3 h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-1000", isLocked ? "bg-slate-300" : "bg-brand-500")} 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};
