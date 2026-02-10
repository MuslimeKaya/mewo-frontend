
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Loader2, Languages, Trash2, Mic } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { ChatMessage } from '../types';

export const AITutor: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      text: input,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }));

      const responseText = await geminiService.generateResponse(input, history);
      
      const assistantMessage: ChatMessage = {
        role: 'model',
        text: responseText || 'I am sorry, I am having trouble connecting.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'model',
        text: 'Connection Error. Please check your network.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 md:border md:border-slate-200 md:dark:border-slate-800 md:rounded-[2.5rem] md:shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500"
         style={{ height: 'calc(100dvh - 5rem - 8rem)' }}>
      {/* Header */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 p-4 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-3">
          <div className="bg-brand-600 p-2 rounded-xl">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 dark:text-white text-sm">Mewo Chat</h3>
            <div className="flex items-center space-x-1 text-[9px] text-emerald-600 font-bold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              <span>AI Active</span>
            </div>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-2 text-slate-300 dark:text-slate-600 hover:text-rose-500 active:scale-90"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 dark:bg-slate-950/20"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 max-w-xs mx-auto">
            <div className="p-5 bg-brand-50 dark:bg-brand-900/20 rounded-full border border-brand-100 dark:border-brand-800">
              <Languages className="w-8 h-8 text-brand-600" />
            </div>
            <div>
              <h4 className="text-lg font-black text-slate-900 dark:text-white leading-tight">Practice English with AI</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                Say something to start our lesson!
              </p>
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-4 rounded-[1.5rem] text-sm font-medium ${
                msg.role === 'user' 
                  ? 'bg-brand-600 text-white shadow-lg rounded-tr-none' 
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 shadow-sm rounded-tl-none'
              }`}>
                {msg.text}
              </div>
              <span className="text-[9px] font-bold text-slate-400 uppercase mt-1 px-2">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-4 rounded-[1.5rem] rounded-tl-none shadow-sm">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                <div className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                <div className="w-1.5 h-1.5 bg-brand-600 rounded-full animate-bounce"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0">
        <div className="flex items-center space-x-2">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex-1 relative flex items-center bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-1.5"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 resize-none max-h-24 min-h-[36px] text-slate-800 dark:text-slate-100"
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="ml-2 text-brand-600 disabled:opacity-30 p-2 active:scale-90 transition-transform"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
          <button className="p-3 bg-brand-50 dark:bg-brand-900/30 text-brand-600 rounded-2xl active:scale-90 transition-transform">
            <Mic className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
