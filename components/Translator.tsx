
import React, { useState } from 'react';
import { Languages, ArrowRightLeft, Loader2, Copy, Check, Info, Trash2, Volume2, Sparkles } from 'lucide-react';
import { geminiService } from '../services/geminiService';

export const Translator: React.FC = () => {
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleTranslate = async () => {
    if (!inputText.trim() || isLoading) return;
    setIsLoading(true);
    const translation = await geminiService.translate(inputText);
    setResult(translation || null);
    setIsLoading(false);
  };

  const copyToClipboard = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clear = () => {
    setInputText('');
    setResult(null);
  };

  return (
    <div className="relative group overflow-hidden bg-white dark:bg-slate-900 border-2 border-transparent hover:border-emerald-500/20 rounded-[3.5rem] p-8 premium-shadow transition-all duration-500 h-[600px] flex flex-col">
      {/* Background Decor */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-[80px] pointer-events-none group-hover:bg-emerald-500/20 transition-all"></div>

      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="flex items-center space-x-4">
          <div className="bg-emerald-600 p-3 rounded-2xl shadow-lg shadow-emerald-200 dark:shadow-none">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight leading-none">AI Çevirmen</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Gelişmiş Anlamsal Motor</p>
          </div>
        </div>

        <div className="flex items-center bg-slate-50 dark:bg-slate-800 p-1.5 rounded-xl border border-slate-100 dark:border-slate-700">
          <span className="text-[10px] font-black px-2 text-slate-400">EN</span>
          <ArrowRightLeft className="w-3 h-3 text-emerald-500 mx-1" />
          <span className="text-[10px] font-black px-2 text-emerald-600">TR</span>
        </div>
      </div>

      <div className="flex-1 space-y-4 relative z-10">
        <div className="relative group/input">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ne çevirmemi istersin?"
            className="w-full h-32 bg-slate-50/50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-[2rem] p-6 text-sm font-medium focus:ring-4 focus:ring-emerald-500/5 focus:border-emerald-500/30 transition-all outline-none resize-none placeholder:text-slate-400 text-slate-700 dark:text-slate-200"
          />
          <div className="absolute bottom-4 right-4 flex items-center space-x-2">
            {inputText && (
              <button onClick={clear} className="p-2 text-slate-300 hover:text-rose-500 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleTranslate}
              disabled={isLoading || !inputText.trim()}
              className="bg-emerald-600 text-white p-3 rounded-2xl hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-200 dark:shadow-none active:scale-95 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRightLeft className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {result ? (
          <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100/50 dark:border-emerald-900/30 rounded-[2.5rem] p-6 animate-in zoom-in-95 duration-500">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-emerald-100/30 dark:border-emerald-900/30">
              <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest flex items-center">
                <Info className="w-3 h-3 mr-2" />
                Bağlamsal Analiz
              </span>
              <div className="flex items-center space-x-1">
                <button className="p-1.5 text-emerald-500 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors"><Volume2 className="w-4 h-4" /></button>
                <button onClick={copyToClipboard} className="p-1.5 text-emerald-500 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors">
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="text-sm font-bold text-slate-700 dark:text-slate-200 leading-relaxed max-h-40 overflow-y-auto custom-scrollbar pr-2 whitespace-pre-wrap">
              {result}
            </div>
          </div>
        ) : !isLoading && (
          <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-6">
            <p className="text-[10px] font-black text-slate-300 dark:text-slate-600 uppercase tracking-[0.2em] text-center">
              Mewo AI ile <br /> anlamı çözmeye başla
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
