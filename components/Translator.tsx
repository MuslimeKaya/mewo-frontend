
import React, { useState } from 'react';
import { Languages, ArrowRightLeft, Loader2, Copy, Check, Info, Trash2, Volume2, Sparkles } from 'lucide-react';
import { geminiService } from '../services/geminiService';

interface TranslatorProps {
  initialText?: string;
}

export const Translator: React.FC<TranslatorProps> = ({ initialText }) => {
  const [inputText, setInputText] = useState(initialText || '');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  React.useEffect(() => {
    if (initialText) {
      setInputText(initialText);
    }
  }, [initialText]);

  const handleTranslate = async () => {
    if (!inputText.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const translation = await geminiService.translate(inputText);
      setResult(translation || null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
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
    <div className="relative group overflow-hidden bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 rounded-[2.5rem] p-6 premium-shadow transition-all duration-500 min-h-[400px] flex flex-col">
      {/* Dynamic Background Decor */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-brand-500/10 rounded-full blur-[60px] pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-brand-500 to-orange-500 p-2.5 rounded-xl shadow-lg">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight leading-none">AI Translator</h3>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Powered by Mewo Intelligence</p>
          </div>
        </div>

        <div className="flex items-center bg-white/50 dark:bg-slate-800/50 px-2.5 py-1 rounded-lg border border-white/20 dark:border-slate-700/50 backdrop-blur-md">
          <span className="text-[9px] font-black text-slate-400">EN</span>
          <ArrowRightLeft className="w-2.5 h-2.5 text-brand-500 mx-2" />
          <span className="text-[9px] font-black text-brand-600">TR</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col space-y-4 relative z-10">
        <div className="relative flex-1 group/input">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Kelime veya cümle yazın..."
            className="w-full h-full min-h-[120px] bg-white/30 dark:bg-slate-950/20 border border-white/40 dark:border-slate-800/50 rounded-2xl p-5 text-sm font-bold focus:ring-4 focus:ring-brand-500/5 focus:border-brand-500/30 transition-all outline-none resize-none placeholder:text-slate-400 text-slate-800 dark:text-slate-100"
          />
          <div className="absolute bottom-3 right-3 flex items-center space-x-2">
            {inputText && (
              <button onClick={clear} className="p-2 text-slate-400 hover:text-rose-500 transition-colors bg-white/50 dark:bg-slate-800/50 rounded-lg backdrop-blur-md">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={handleTranslate}
              disabled={isLoading || !inputText.trim()}
              className="bg-brand-600 text-white px-4 py-2 rounded-xl hover:bg-brand-500 transition-all shadow-lg active:scale-95 disabled:opacity-50 flex items-center space-x-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
              <span className="text-[10px] font-black uppercase tracking-widest">Translate</span>
            </button>
          </div>
        </div>

        <div className={`transition-all duration-500 ${result ? 'opacity-100 translate-y-0 h-auto' : 'opacity-0 translate-y-4 h-0 pointer-events-none'}`}>
          <div className="bg-brand-500/5 dark:bg-brand-500/10 border border-brand-500/20 rounded-2xl p-5 relative group/result">
            <div className="flex justify-between items-center mb-3">
              <span className="text-[8px] font-black text-brand-600 dark:text-brand-400 uppercase tracking-[0.2em] flex items-center">
                <Info className="w-3 h-3 mr-2" />
                Contextual Meaning
              </span>
              <div className="flex items-center space-x-1">
                <button onClick={copyToClipboard} className="p-1.5 text-brand-600 hover:bg-white dark:hover:bg-slate-800 rounded-lg transition-colors">
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div className="text-sm font-bold text-slate-800 dark:text-slate-100 leading-relaxed pr-2">
              {result}
            </div>
          </div>
        </div>

        {!result && !isLoading && (
          <div className="py-8 flex flex-col items-center justify-center text-center opacity-40">
            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3 group-hover:rotate-12 transition-transform">
              <Languages className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Start discovery with Mewo AI
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
