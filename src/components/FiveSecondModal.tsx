import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Volume2,
  VolumeX,
  Zap,
  RotateCcw,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  Flame,
  Shuffle,
  Mic,
  Star,
  Info,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { TablePlayer, loadTablePlayers, saveTablePlayers } from '../utils/playerManager';
import {
  FIVE_SEC_CARDS,
  FIVE_SEC_CATEGORIES,
  FiveSecCard
} from '../data/fiveSecondData';

interface FiveSecondModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const FiveSecondModal: React.FC<FiveSecondModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const TOTAL_ROUND_TIME = 15.0;
  const [selectedCat, setSelectedCat] = useState<string>('all');
  const [cardIndex, setCardIndex] = useState<number>(0);
  const [remainingTime, setRemainingTime] = useState<number>(TOTAL_ROUND_TIME);
  const [isRunning, setIsRunning] = useState<boolean>(true);
  const [round, setRound] = useState<number>(2);
  const maxRounds = 5;

  const [players, setPlayers] = useState<TablePlayer[]>(() => loadTablePlayers());
  const [activePlayerIdx, setActivePlayerIdx] = useState<number>(0);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(!soundEngine.sfxEnabled);
  const [showRulesInfo, setShowRulesInfo] = useState<boolean>(false);
  const [showAllLeaderboard, setShowAllLeaderboard] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync players when opened
  useEffect(() => {
    if (isOpen) {
      const p = loadTablePlayers();
      setPlayers(p);
      setRemainingTime(TOTAL_ROUND_TIME);
      setIsRunning(true);
    }
  }, [isOpen]);

  // Filter cards by category
  const filteredCards = selectedCat === 'all'
    ? FIVE_SEC_CARDS
    : FIVE_SEC_CARDS.filter((c) => c.category === selectedCat);

  const currentCard: FiveSecCard = filteredCards[cardIndex % (filteredCards.length || 1)] || FIVE_SEC_CARDS[0];
  const activePlayer: TablePlayer = players[activePlayerIdx % (players.length || 1)] || players[0] || { id: 'p1', name: 'Oyuncu', avatar: '', score: 0, color: '#f751a1' };

  // SVG circular progress calculation
  // Radius: 70, Circumference = 2 * PI * 70 = 439.82
  const CIRCUMFERENCE = 439.82;
  const strokeDashoffset = CIRCUMFERENCE * (1 - Math.max(0, remainingTime) / TOTAL_ROUND_TIME);
  const isUrgent = remainingTime <= 3.5;

  // Sound toggle
  const toggleSound = () => {
    soundEngine.playClick();
    const state = soundEngine.toggleSound();
    setIsAudioMuted(!state);
    onShowToast(state ? '🔊 Sesler Açık' : '🔇 Sessize Alındı');
  };

  // Timer tick effect with 100ms precision
  useEffect(() => {
    if (isRunning && isOpen) {
      timerRef.current = setInterval(() => {
        setRemainingTime((prev) => {
          const next = Math.max(0, +(prev - 0.1).toFixed(1));

          // Beep on every whole second
          if (Math.abs(Math.round(next) - next) < 0.05 && next > 0) {
            soundEngine.playCountdown();
            if (next <= 3.5) {
              soundEngine.triggerHaptic('urgent');
            }
          }

          if (next <= 0) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            setIsRunning(false);
            soundEngine.playBuzzer();
            soundEngine.triggerHaptic('alert');
            onShowToast('⏰ Süre Doldu! Pas Geçildi.');
            return 0;
          }

          return next;
        });
      }, 100);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isOpen, onShowToast]);

  if (!isOpen) return null;

  // Success handler (+10 Puan)
  const handleSuccess = () => {
    soundEngine.playSuccess();
    soundEngine.triggerHaptic('win');

    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    const updatedPlayers = players.map((p, idx) => {
      if (idx === activePlayerIdx % players.length) {
        return { ...p, score: p.score + 10 };
      }
      return p;
    });

    setPlayers(updatedPlayers);
    saveTablePlayers(updatedPlayers);
    onShowToast(`🎉 Harika! ${activePlayer.name} +10 Puan kazandı!`);

    // Next turn
    advanceTurn();
  };

  // Failure handler (0 Puan)
  const handleFailure = () => {
    soundEngine.playBuzzer();
    soundEngine.triggerHaptic('alert');
    onShowToast(`❌ Süre bitti veya yetişemedi! (+0 Puan)`);
    advanceTurn();
  };

  // Advance turn to next player & card
  const advanceTurn = () => {
    setCardIndex((prev) => (prev + 1) % filteredCards.length);
    setActivePlayerIdx((prev) => (prev + 1) % (players.length || 1));
    setRemainingTime(TOTAL_ROUND_TIME);
    setIsRunning(true);

    if ((activePlayerIdx + 1) % (players.length || 1) === 0) {
      setRound((prev) => (prev < maxRounds ? prev + 1 : 1));
    }
  };

  // Reset timer
  const handleResetTimer = () => {
    soundEngine.playClick();
    setRemainingTime(TOTAL_ROUND_TIME);
    setIsRunning(true);
  };

  const sortedLeaderboard = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2 select-none">
      <div className="relative w-full max-w-md h-[88dvh] sm:h-[92vh] max-h-[840px] bg-[#0a0e18] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        {/* ================= FIXED TOP HEADER ================= */}
        <header className="w-full pt-safe bg-[#0a0e18]/90 backdrop-blur-xl border-b border-white/10 shrink-0">
          <div className="h-16 px-3.5 sm:px-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-[#1c1f2a] flex items-center justify-center text-[#bef264] text-xl shrink-0">
                ⚡
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-base text-white tracking-tight leading-none truncate">
                    15 Saniye Kuralı
                  </h1>
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shrink-0" />
                </div>
                <span className="text-[10px] text-[#bef264] tracking-wider uppercase font-mono mt-1 truncate">
                  15sn Hızlı Refleks • Canlı Masa
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={toggleSound}
                aria-label="Ses Kontrolü"
                className="w-10 h-10 rounded-full bg-[#1c1f2a] hover:bg-white/10 flex items-center justify-center text-gray-300 transition-colors"
                title="Ses"
              >
                {!isAudioMuted ? (
                  <Volume2 className="w-4 h-4 text-[#bef264]" />
                ) : (
                  <VolumeX className="w-4 h-4 text-gray-400" />
                )}
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  onClose();
                }}
                className="w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center text-red-300 transition-colors"
                title="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* ================= MAIN SCROLLABLE CONTENT ================= */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3.5 sm:px-4 py-3 pb-16 flex flex-col gap-3.5 no-scrollbar">

        {/* ================= STATUS & SCORE HEADER PILL ================= */}
        <div className="flex items-center justify-between bg-[#111827] border border-white/10 px-4 py-2.5 rounded-full shadow-md">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-[#bbf246] animate-pulse" />
            <span className="text-xs font-black text-[#bbf246] uppercase tracking-wider">
              Tur {round}/{maxRounds}
            </span>
            <span className="text-gray-500 text-xs">•</span>
            <span className="text-xs font-medium text-gray-300">
              Hızlı Refleks
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-[#1E293B] border border-white/5 px-3 py-1 rounded-full shadow-inner">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-black text-[#ffb0cd]">
              +10 Puan
            </span>
          </div>
        </div>

        {/* ================= CENTRAL KINETIC TIMER CONTAINER ================= */}
        <div className="relative flex flex-col items-center justify-center py-2">
          {/* Ambient Radial Glow */}
          <div className="absolute w-52 h-52 bg-[#bbf246]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute w-40 h-40 bg-[#f751a1]/10 rounded-full blur-2xl pointer-events-none" />

          {/* Circular Progress Ring SVG */}
          <div className="relative w-44 h-44 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
              {/* Track circle */}
              <circle
                className="text-[#1E293B] opacity-70"
                cx="80"
                cy="80"
                fill="transparent"
                r="70"
                stroke="currentColor"
                strokeWidth="9"
              />
              {/* Dynamic countdown ring */}
              <circle
                className={`transition-all duration-100 ease-linear ${
                  isUrgent
                    ? 'text-red-500 drop-shadow-[0_0_12px_rgba(239,68,68,0.7)]'
                    : 'text-[#bbf246] drop-shadow-[0_0_12px_rgba(187,242,70,0.65)]'
                }`}
                cx="80"
                cy="80"
                fill="transparent"
                r="70"
                stroke="currentColor"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                strokeWidth="9"
              />
            </svg>

            {/* Center Countdown Readout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
                Kalan Süre
              </span>
              <span
                className={`text-4xl font-black tracking-tight leading-none my-0.5 ${
                  isUrgent ? 'text-red-400' : 'text-[#bbf246]'
                }`}
                style={{ fontFamily: 'Outfit, sans-serif' }}
              >
                {remainingTime < 10 ? `0${remainingTime.toFixed(1)}` : remainingTime.toFixed(1)}
                <span className="text-xl font-normal opacity-80">s</span>
              </span>

              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#ffb0cd]">
                <Zap className="w-3 h-3 text-[#ffb0cd] fill-[#ffb0cd] animate-bounce" />
                <span>Seri Cevap!</span>
              </span>
            </div>
          </div>

          {/* Quick Play/Pause/Reset micro-controls */}
          <div className="flex items-center gap-2 mt-2">
            <button
              onClick={() => {
                soundEngine.playClick();
                setIsRunning(!isRunning);
              }}
              className="px-3.5 py-1 rounded-full bg-[#1E293B] border border-white/10 text-xs font-bold text-gray-200 hover:text-white flex items-center gap-1 active:scale-95 transition-all"
            >
              {isRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
              <span>{isRunning ? 'Duraklat' : 'Devam Et'}</span>
            </button>
            <button
              onClick={handleResetTimer}
              className="w-7 h-7 rounded-full bg-[#1E293B] border border-white/10 flex items-center justify-center text-gray-300 hover:text-white active:scale-90 transition-all"
              title="15 Saniyeyi Yeniden Başlat"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* ================= PLAYER SPOTLIGHT PILL ================= */}
        <div className="flex items-center justify-between bg-[#111827] border border-white/10 rounded-2xl px-4 py-2.5 shadow-md">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-[#571bc1] border border-[#d0bcff]/30 flex items-center justify-center text-white overflow-hidden shadow-[0_0_12px_rgba(87,27,193,0.5)]">
                {activePlayer.avatar ? (
                  <img
                    src={activePlayer.avatar}
                    alt={activePlayer.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-black text-xs">
                    {activePlayer.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#bbf246] flex items-center justify-center shadow">
                <Mic className="w-2.5 h-2.5 text-black" />
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">
                  {activePlayer.name}
                </span>
                <span className="bg-[#f751a1]/20 text-[#f751a1] text-[10px] px-1.5 py-0.2 rounded-full uppercase font-bold">
                  Sıradaki
                </span>
              </div>
              <span className="text-[11px] text-gray-400">
                Masadaki {players.length - 1}/{players.length} oyuncu hazır
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-[#262a35] border border-white/5 px-2.5 py-1 rounded-full">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="text-[11px] text-[#10B981] uppercase tracking-wider font-semibold">
              Mikrofon Açık
            </span>
          </div>
        </div>

        {/* ================= THE BOLD QUESTION CARD (BENTO FOCUS) ================= */}
        <div className="relative overflow-hidden rounded-2xl bg-[#111827] border border-white/10 p-5 shadow-[0_12px_32px_rgba(0,0,0,0.55)] flex flex-col justify-between min-h-[200px]">
          {/* Top Card Micro-Bar */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5 bg-[#1E293B] border border-white/5 px-3 py-1 rounded-full">
              <span className="text-xs">⏱️</span>
              <span className="text-[11px] font-black text-[#bbf246] uppercase tracking-wider">
                3 Tane Say
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#bbf246]" />
              <span className="w-2 h-2 rounded-full bg-[#bbf246]" />
              <span className="w-2 h-2 rounded-full bg-gray-600" />
            </div>
          </div>

          {/* Big Bold Question Text */}
          <div className="my-auto py-2">
            <h2 className="text-xl sm:text-2xl text-white font-extrabold tracking-tight leading-tight">
              “{currentCard.prompt}”
            </h2>
            <p className="text-xs text-gray-400 mt-2">
              Düşünmek, beklemek ya da ‘eee’ demek elenme sebebidir!
            </p>
          </div>

          {/* Live Category & Audio wave visual */}
          <div className="flex items-center justify-between pt-2 bg-[#171b26] px-3 py-2 rounded-xl mt-2 border border-white/5">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-[#f751a1]" />
              <span className="text-xs text-[#ffb0cd] font-bold">
                Kategori: {currentCard.categoryTitle}
              </span>
            </div>

            {/* Mini Visualizer Wave */}
            <div className="flex items-center gap-0.5 h-4">
              <span className="w-1 bg-[#bbf246] rounded-full h-2 animate-pulse" />
              <span className="w-1 bg-[#bbf246] rounded-full h-4 animate-bounce" />
              <span className="w-1 bg-[#bbf246] rounded-full h-3 animate-pulse" />
              <span className="w-1 bg-[#bbf246] rounded-full h-1" />
            </div>
          </div>
        </div>

        {/* ================= TOUCH ACTION EVALUATION TRIGGERS ================= */}
        <div className="flex flex-col gap-2.5">
          {/* Primary Big Neon Pass Trigger */}
          <button
            id="btn-success"
            onClick={handleSuccess}
            className="group relative w-full h-14 rounded-full bg-[#bbf246] hover:bg-lime-400 text-[#0f131d] text-sm font-extrabold flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(187,242,70,0.35)] active:scale-95 transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform pointer-events-none" />
            <CheckCircle2 className="w-6 h-6 text-[#0f131d] stroke-[2.5]" />
            <span className="tracking-wide">BAŞARDI (+10 PUAN)</span>
            <span className="text-base opacity-80">😄</span>
          </button>

          {/* Secondary Glass Action Trigger */}
          <button
            id="btn-fail"
            onClick={handleFailure}
            className="w-full h-12 rounded-full bg-[#1E293B] hover:bg-[#262a35] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all border border-white/5"
          >
            <XCircle className="w-5 h-5 text-red-400" />
            <span className="text-gray-300 font-medium">Yetişemedi / Süre Bitti</span>
            <span className="text-red-400 font-bold">(-0 Puan)</span>
          </button>
        </div>

        {/* ================= QUICK RULE & LEADERBOARD BENTO CARD ================= */}
        <div className="bg-[#111827] border border-white/10 rounded-2xl p-4 flex flex-col gap-3 shadow-md">
          {/* Reminder Pill */}
          <div className="flex items-start gap-2.5 bg-[#171b26] border border-white/5 rounded-xl p-3">
            <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
              <Info className="w-3.5 h-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-white font-bold uppercase tracking-wider">
                Hızlı 15 Kuralı
              </span>
              <span className="text-xs text-gray-400 leading-tight mt-0.5">
                Cevaplar 15 saniye dolmadan tamamlanmalıdır. Şüphe durumunda masanın çoğunluk oyu geçerlidir!
              </span>
            </div>
          </div>

          {/* Mini Live Leaderboard Strip */}
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-gray-400 uppercase tracking-wider font-bold">
              Oda Sıralaması
            </span>
            <button
              onClick={() => setShowAllLeaderboard(!showAllLeaderboard)}
              className="text-xs text-[#bbf246] hover:underline flex items-center gap-0.5 font-bold"
            >
              <span>{showAllLeaderboard ? 'Gizle' : 'Tümünü Gör'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 3-Col Player Podium Cards */}
          <div className="grid grid-cols-3 gap-2">
            {sortedLeaderboard.slice(0, 3).map((pl, idx) => (
              <div
                key={pl.id}
                className="bg-[#1E293B] border border-white/5 p-2.5 rounded-xl flex flex-col items-center text-center"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs mb-1 overflow-hidden shadow-inner ${
                    idx === 0
                      ? 'bg-[#f751a1]/25 text-[#f751a1] ring-1 ring-[#f751a1]/50'
                      : idx === 1
                      ? 'bg-[#4cd7f6]/25 text-[#4cd7f6]'
                      : 'bg-[#571bc1]/25 text-[#d0bcff]'
                  }`}
                >
                  {pl.avatar ? (
                    <img src={pl.avatar} alt={pl.name} className="w-full h-full object-cover" />
                  ) : (
                    pl.name.slice(0, 2).toUpperCase()
                  )}
                </div>
                <span className="text-xs font-bold text-white truncate w-full">
                  {pl.name.split(' ')[0]}
                </span>
                <span
                  className={`text-[11px] font-mono font-bold ${
                    idx === 0 ? 'text-[#bbf246]' : 'text-gray-300'
                  }`}
                >
                  {pl.score} P
                </span>
              </div>
            ))}
          </div>

          {/* Collapsible all players */}
          {showAllLeaderboard && sortedLeaderboard.length > 3 && (
            <div className="pt-2 border-t border-white/5 space-y-1.5 animate-in fade-in">
              {sortedLeaderboard.slice(3).map((pl, idx) => (
                <div
                  key={pl.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#171b26] text-xs text-gray-300"
                >
                  <span className="font-medium">
                    #{idx + 4} {pl.name}
                  </span>
                  <span className="font-mono font-bold text-[#bbf246]">{pl.score} P</span>
                </div>
              ))}
            </div>
          )}
        </div>

          {/* Bottom clearance spacer */}
          <div className="h-8 w-full shrink-0 pointer-events-none" aria-hidden="true" />
        </div>

        {/* ================= FIXED BOTTOM ACTION BAR ================= */}
        <div className="p-3 pb-safe bg-[#0a0e18]/95 backdrop-blur-md border-t border-white/10 shrink-0 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Oyundan Çık & Masaya Dön</span>
          </button>
        </div>
      </div>
    </div>
  );
};
