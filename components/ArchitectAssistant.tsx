
import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Loader2, Languages, Trash2, Mic } from 'lucide-react';
import { geminiService } from '../services/geminiService';
import { ChatMessage } from '../types';

export const ArchitectAssistant: React.FC = () => {
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
        text: responseText || 'I am sorry, I am having trouble connecting to the linguistic hub.',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'model',
        text: 'Linguistic Connection Error. Please check your network and API credentials.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <div className="h-[calc(100vh-12rem)] flex flex-col bg-white border border-slate-200 rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden animate-in zoom-in-95 duration-300">
      <div className="bg-white border-b border-slate-100 p-5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-200">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base">Mewo AI Tutor</h3>
            <div className="flex items-center space-x-2 text-[10px] text-emerald-600 font-bold uppercase tracking-widest">
              <span className="flex w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              <span>Advanced Native Voice Enabled</span>
            </div>
          </div>
        </div>
        <button 
          onClick={clearChat}
          className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6 bg-[radial-gradient(#f8fafc_1px,transparent_1px)] [background-size:20px_20px]"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-6 max-w-md mx-auto">
            <div className="p-6 bg-indigo-50 rounded-full border border-indigo-100 shadow-inner">
              <Languages className="w-10 h-10 text-indigo-600" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-900">How can I help you learn today?</h4>
              <p className="text-sm text-slate-500 leading-relaxed mt-2">
                I can practice roleplay, explain complex grammar points, or check your writing for professional polish.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 justify-center">
              <SuggestionChip text="Job interview roleplay" onClick={setInput} />
              <SuggestionChip text="Explain 'Past Perfect'" onClick={setInput} />
              <SuggestionChip text="Proofread this email" onClick={setInput} />
              <SuggestionChip text="Translate 'Kolay gelsin'" onClick={setInput} />
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] flex space-x-3 ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`p-2 rounded-xl h-fit mt-1 ${msg.role === 'user' ? 'bg-indigo-100' : 'bg-slate-100'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-indigo-700" /> : <Sparkles className="w-4 h-4 text-slate-700" />}
              </div>
              <div className={`p-5 rounded-2xl ${
                msg.role === 'user' 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                  : 'bg-white border border-slate-200 text-slate-800 shadow-sm'
              }`}>
                <div className="prose prose-sm max-w-none prose-pre:bg-slate-900 prose-pre:text-slate-100 whitespace-pre-wrap leading-relaxed">
                  {msg.text}
                </div>
                <div className={`mt-3 text-[10px] font-bold opacity-50 uppercase tracking-tighter ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="flex space-x-3">
              <div className="bg-slate-100 p-2 rounded-xl h-fit">
                <Sparkles className="w-4 h-4 text-slate-700" />
              </div>
              <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 bg-white border-t border-slate-100">
        <div className="flex items-center space-x-3">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(); }}
            className="flex-1 relative flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2 focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-50 transition-all"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Ask me anything in English..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-sm py-2 resize-none max-h-32 min-h-[40px] text-slate-800"
              rows={1}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="ml-2 bg-indigo-600 text-white p-2.5 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:bg-slate-400 transition-all shadow-md shadow-indigo-100"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <button className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-indigo-50 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100">
            <Mic className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

const SuggestionChip: React.FC<{ text: string; onClick: (val: string) => void }> = ({ text, onClick }) => (
  <button 
    onClick={() => onClick(text)}
    className="text-xs px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:border-indigo-300 hover:text-indigo-600 hover:shadow-md transition-all font-semibold"
  >
    {text}
  </button>
);
