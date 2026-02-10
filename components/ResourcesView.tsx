
import React from 'react';
import { ExternalLink, BookText, GraduationCap, Mic2, Star } from 'lucide-react';

export const ResourcesView: React.FC = () => {
  const materials = [
    { title: 'Oxford Wordlist', icon: BookText, url: 'https://www.oxfordlearnersdictionaries.com/wordlists/oxford3000-5000', category: 'Vocab', desc: 'The core vocabulary for English learners.' },
    { title: 'Cambridge C1', icon: GraduationCap, url: 'https://www.cambridgeenglish.org/exams-and-tests/advanced/', category: 'Exam', desc: 'Resources for advanced certification.' },
    { title: 'BBC Learning', icon: Mic2, url: 'https://www.bbc.co.uk/learningenglish', category: 'Media', desc: 'News-based lessons and podcasts.' },
    { title: 'Grammar Guide', icon: Star, url: '#', category: 'Study', desc: 'Advanced grammar templates and rules.' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-500 px-4">
      <div className="text-center md:text-left">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Resources</h2>
        <p className="text-slate-500 dark:text-slate-400">Curated materials to accelerate your progress.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
        {materials.map((res, i) => (
          <a 
            key={i} 
            href={res.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="group block bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-[2.5rem] hover:border-brand-400 dark:hover:border-brand-600 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
          >
            <div className="flex items-start justify-between">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl group-hover:bg-brand-600 transition-all duration-300">
                <res.icon className="w-6 h-6 text-slate-500 dark:text-slate-400 group-hover:text-white transition-colors" />
              </div>
              <ExternalLink className="w-4 h-4 text-slate-300 dark:text-slate-600 group-hover:text-brand-400 group-hover:scale-125 transition-all" />
            </div>
            <div className="mt-6">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-extrabold text-slate-900 dark:text-white group-hover:text-brand-700 dark:group-hover:text-brand-400 transition-colors">{res.title}</h3>
                <span className="text-[10px] bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-widest group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  {res.category}
                </span>
              </div>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">{res.desc}</p>
            </div>
          </a>
        ))}
      </div>

      <div className="group relative bg-slate-900 dark:bg-slate-900 border border-slate-800 dark:border-slate-800 rounded-[3.5rem] p-10 text-white overflow-hidden shadow-2xl hover:shadow-brand-900/50 transition-all duration-500">
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-brand-500/20 transition-all duration-700"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -ml-20 -mb-20 group-hover:bg-emerald-500/20 transition-all duration-700"></div>
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-xl text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-brand-500/20 text-brand-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6 border border-brand-500/30 group-hover:scale-105 transition-transform">
                <Star className="w-3 h-3 fill-current" />
                <span>Phrase of the Day</span>
              </div>
              <h3 className="text-4xl font-black mb-4 tracking-tight group-hover:translate-x-1 transition-transform">"In the long run"</h3>
              <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                Meaning: Relating to a period of time that is far into the future.
                <br/>
                <span className="italic text-brand-300 mt-2 block font-mono text-sm group-hover:text-white transition-colors">"Consistent practice will pay off in the long run."</span>
              </p>
              <button className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold hover:bg-brand-600 hover:text-white transition-all active:scale-95">
                Save for Later
              </button>
            </div>
            
            <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] backdrop-blur-sm w-full lg:w-80 hover:bg-white/10 transition-colors duration-300">
              <h4 className="text-sm font-bold text-brand-300 uppercase tracking-widest mb-6">Study Tip</h4>
              <div className="space-y-6">
                <div className="flex items-start space-x-4 group/tip">
                  <div className="bg-brand-500/20 p-2 rounded-lg text-brand-400 font-bold text-xs group-hover/tip:bg-brand-500 group-hover/tip:text-white transition-all">01</div>
                  <p className="text-xs text-slate-300 leading-normal group-hover/tip:text-white transition-colors">Use voice chat for 5 mins daily to improve pronunciation.</p>
                </div>
                <div className="flex items-start space-x-4 group/tip">
                  <div className="bg-brand-500/20 p-2 rounded-lg text-brand-400 font-bold text-xs group-hover/tip:bg-brand-500 group-hover/tip:text-white transition-all">02</div>
                  <p className="text-xs text-slate-300 leading-normal group-hover/tip:text-white transition-colors">Set your UI to English to force passive learning.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
