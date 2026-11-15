import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface SplashScreenProps {
  onFinish: () => void;
}

const LOADING_STEPS = [
  '🎮 Party Box yükleniyor...',
  '✨ Neon arcade motoru başlatılıyor...',
  '🎡 Çark & kura mekanikleri hazırlanıyor...',
  '🚀 Parti başlıyor!'
];

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const [progress, setProgress] = useState(0);
  const [stepIndex, setStepIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 1800; // 1.8 seconds total for a crisp, responsive feel

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const currentProgress = Math.min(100, Math.round((elapsed / duration) * 100));
      setProgress(currentProgress);

      if (currentProgress < 30) {
        setStepIndex(0);
      } else if (currentProgress < 65) {
        setStepIndex(1);
      } else if (currentProgress < 95) {
        setStepIndex(2);
      } else {
        setStepIndex(3);
      }

      if (currentProgress >= 100) {
        clearInterval(interval);
        try {
          soundEngine.playSuccess();
        } catch {
          // ignore if user hasn't interacted with audio yet
        }
        setIsFadingOut(true);
        setTimeout(() => {
          onFinish();
        }, 350); // allow fade-out CSS transition
      }
    }, 25);

    return () => clearInterval(interval);
  }, [onFinish]);

  const handleSkip = () => {
    setIsFadingOut(true);
    setTimeout(() => {
      onFinish();
    }, 200);
  };

  return (
    <div
      onClick={handleSkip}
      className={`fixed inset-0 z-[100] bg-[#0a0e17] flex flex-col items-center justify-between p-6 sm:p-8 select-none overflow-hidden transition-all duration-300 cursor-pointer ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      {/* Ambient Neon Glow Backdrops */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 bg-[#bef264]/15 rounded-full blur-[100px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-80 h-80 sm:w-96 sm:h-96 bg-[#f751a1]/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none" />

      {/* Top Bar / Version */}
      <div className="w-full max-w-sm flex items-center justify-between relative z-10 pt-2">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
          <Zap className="w-3.5 h-3.5 text-[#bef264] fill-[#bef264]" />
          <span className="text-[10px] font-black uppercase tracking-widest text-[#bef264]">
            PRO EDITION
          </span>
        </div>
        <span className="text-[11px] font-bold text-gray-500 hover:text-gray-300 transition-colors">
          Atla ➔
        </span>
      </div>

      {/* Centerpiece: Logo + Title + Tagline */}
      <div className="flex flex-col items-center text-center relative z-10 my-auto">
        {/* Animated Glowing Logo Frame */}
        <div className="relative group mb-6">
          <div className="absolute -inset-2 rounded-[32px] bg-gradient-to-r from-[#bef264] via-[#4cd7f6] to-[#f751a1] opacity-75 blur-lg animate-pulse" />
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-[28px] overflow-hidden bg-[#111827] border-2 border-white/20 shadow-[0_0_35px_rgba(190,242,100,0.35)] ring-1 ring-lime-400/40">
            <img
              src="/assets/icons/app-logo.png"
              alt="Party Box Logo"
              className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
            />
          </div>
        </div>

        {/* Brand Name */}
        <div className="space-y-1.5">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-lime-300 via-white to-lime-400 drop-shadow-[0_0_20px_rgba(190,242,100,0.5)]">
            PARTY BOX
          </h1>
          <div className="flex items-center justify-center gap-2">
            <span className="h-[1px] w-6 bg-[#bef264]/40" />
            <p className="text-[11px] sm:text-xs font-black uppercase tracking-[0.25em] text-[#bef264]">
              NEON ARCADE & PARTİ OYUNLARI
            </p>
            <span className="h-[1px] w-6 bg-[#bef264]/40" />
          </div>
        </div>
      </div>

      {/* Bottom Area: Progress Bar + Status + Safe Badge */}
      <div className="w-full max-w-xs flex flex-col items-center gap-3 relative z-10 pb-4">
        {/* Progress Bar Container */}
        <div className="w-full space-y-1.5">
          <div className="w-full h-2 rounded-full bg-white/10 p-0.5 overflow-hidden backdrop-blur-sm border border-white/10 shadow-inner">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#bef264] via-emerald-400 to-[#bef264] shadow-[0_0_12px_rgba(190,242,100,0.8)] transition-all duration-75 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-gray-400 font-sans text-[11px] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#bef264] animate-spin" />
              {LOADING_STEPS[stepIndex]}
            </span>
            <span className="font-bold text-[#bef264]">%{progress}</span>
          </div>
        </div>

        {/* Compliance Footer Badge */}
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Google Play &amp; App Store Standartları</span>
        </div>
      </div>
    </div>
  );
};
