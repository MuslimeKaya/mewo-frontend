
"use client";

import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, Modality } from '@google/genai';
import { Mic, MicOff, PhoneOff, Volume2, Sparkles, Loader2, Signal, Activity } from 'lucide-react';
import { encode, decode, decodeAudioData } from '../lib/audio-utils';

export const LiveTutor: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [statusText, setStatusText] = useState<string>('Ses senkronizasyonu için hazır');

  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const stopSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    setIsActive(false);
    setIsConnecting(false);
    setStatusText('Session terminated');
    setTimeout(() => setStatusText('Ready for voice sync'), 3000);
  };

  const startSession = async () => {
    setIsConnecting(true);
    setStatusText('Bağlanıyor...');
    try {
      // Create a fresh instance of GoogleGenAI using the environment variable directly.
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            setStatusText('Live Established');

            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);

            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              // Always use the resolved sessionPromise to send data to avoid race conditions.
              sessionPromise.then((s: any) => s.sendRealtimeInput({ media: pcmBlob }));
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: any) => {
            // Correct extraction of audio from the model turn's parts.
            const audioData = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              const ctx = audioContextRef.current!;
              // Precise audio scheduling to ensure gapless playback.
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              // Immediately stop all pending audio sources if the model is interrupted.
              for (const source of sourcesRef.current) {
                try { source.stop(); } catch (e) { }
              }
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onerror: (e: any) => {
            console.error('Live Error:', e);
            stopSession();
          },
          onclose: () => stopSession()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: 'You are a friendly and professional English tutor. Help the user master conversation and vocabulary.',
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setIsConnecting(false);
      setStatusText('Connection Failed');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 rounded-[3rem] p-10 premium-shadow flex flex-col items-center text-center space-y-10 relative overflow-hidden group h-[600px]">
      <div className={`absolute top-0 inset-x-0 h-1 transition-all duration-1000 ${isActive ? 'bg-brand-500 shadow-[0_0_15px_rgba(86,109,249,0.5)]' : 'bg-transparent'}`}></div>
      <div className={`absolute inset-0 bg-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}></div>

      <div className="relative">
        <div className={`p-10 rounded-[2.5rem] transition-all duration-700 relative z-10 ${isActive
          ? 'bg-brand-600 shadow-2xl shadow-brand-200 dark:shadow-none scale-105'
          : 'bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700'
          }`}>
          <Sparkles className={`w-14 h-14 ${isActive ? 'text-white animate-pulse' : 'text-slate-300 dark:text-slate-600'}`} />
          {isActive && (
            <div className="absolute inset-0 rounded-[2.5rem] bg-brand-400 animate-ping opacity-20"></div>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Sesli Sohbet</h3>
        <p className="text-slate-400 dark:text-slate-500 text-xs font-bold uppercase tracking-[0.2em]">Canlı Oturum</p>
      </div>

      <div className={`w-full p-5 rounded-3xl transition-all duration-300 border flex items-center justify-between ${isActive ? 'bg-brand-50 dark:bg-brand-900/20 border-brand-100 dark:border-brand-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-700'
        }`}>
        <div className="flex items-center space-x-3">
          <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-brand-500 animate-pulse' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
          <p className={`text-xs font-bold uppercase tracking-widest ${isActive ? 'text-brand-700 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'}`}>
            {statusText}
          </p>
        </div>
        {isActive && <Activity className="w-4 h-4 text-brand-400" />}
      </div>

      <div className="w-full">
        {!isActive ? (
          <button
            onClick={startSession}
            disabled={isConnecting}
            className="w-full flex items-center justify-center space-x-4 bg-brand-600 hover:bg-brand-700 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest transition-all shadow-xl shadow-brand-100 dark:shadow-none disabled:opacity-50 group active:scale-95"
          >
            {isConnecting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Mic className="w-6 h-6 transition-transform group-hover:scale-110" />}
            <span>{isConnecting ? 'Bağlanıyor...' : 'AI ile Konuş'}</span>
          </button>
        ) : (
          <button
            onClick={stopSession}
            className="w-full flex items-center justify-center space-x-4 bg-rose-500 hover:bg-rose-600 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest transition-all shadow-xl shadow-rose-100 dark:shadow-none active:scale-95"
          >
            <PhoneOff className="w-6 h-6" />
            <span>Oturumu Kapat</span>
          </button>
        )}
      </div>

      <div className="flex items-center space-x-6 text-[10px] font-black text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">
        <div className="flex items-center space-x-2">
          <Signal className="w-3 h-3 text-emerald-500" />
          <span>Sync OK</span>
        </div>
        <div className="w-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full"></div>
        <div className="flex items-center space-x-2">
          <Volume2 className="w-3 h-3" />
          <span>24kHz Out</span>
        </div>
      </div>
    </div>
  );
};
