import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  Coffee,
  Volume2,
  VolumeX,
  Vibrate,
  HelpCircle,
  EyeOff,
  Flame,
  Award,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Target
} from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { TablePlayer, loadTablePlayers } from '../utils/playerManager';

export interface PlayerScoreEntry {
  playerId: string;
  name: string;
  avatar: string;
  time: number;
  delta: number;
  absDelta: number;
  points: number;
  status: 'perfect' | 'close' | 'missed' | 'waiting';
}

const COFFEE_PENALTIES = [
  '10.00 saniyeden en çok sapan (1 saniyeden fazla şaşan) masanın bir sonraki kahve ya da tatlı siparişini söyler!',
  'En kötü dereceyi yapan, masadaki herkese su ikram eder ve garson gibi servis açar!',
  'Hedef 10 saniyeden en çok sapan masadaki herkesin istediği bir şarkıyı mırıldanır!',
  '10 saniyeyi en çok kaçıran masadaki herkesin kahve fincanını toplar!'
];

interface TenSecondsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const TenSecondsModal: React.FC<TenSecondsModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  // Table players
  const [players, setPlayers] = useState<TablePlayer[]>(() => loadTablePlayers());
  const [activePlayerIdx, setActivePlayerIdx] = useState(0);

  // Chronometer State: 'IDLE' | 'RUNNING' | 'BLIND' | 'STOPPED'
  const [gameState, setGameState] = useState<'IDLE' | 'RUNNING' | 'BLIND' | 'STOPPED'>('IDLE');

  // Time tracking
  const startTimeRef = useRef<number>(0);
  const timerFrameRef = useRef<number | null>(null);
  const [elapsedSec, setElapsedSec] = useState<number>(0);
  const [isBlindPhase, setIsBlindPhase] = useState<boolean>(false);

  // Final stop result
  const [lastResult, setLastResult] = useState<{
    totalElapsed: number;
    delta: number;
    absDelta: number;
    feedback: string;
    points: number;
    colorClass: string;
  } | null>(null);

  // Leaderboard of the round
  const [leaderboard, setLeaderboard] = useState<PlayerScoreEntry[]>([]);

  // Penalty Card
  const [penaltyText, setPenaltyText] = useState(COFFEE_PENALTIES[0]);

  // Settings & popups
  const [isHapticOn, setIsHapticOn] = useState(soundEngine.hapticsEnabled);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showMatchChampModal, setShowMatchChampModal] = useState(false);

  const maxChronoMs = 10000;
  const circumference = 640;

  const isRunningRef = useRef<boolean>(false);
  const isBlindRef = useRef<boolean>(false);

  // Initialize round and players on open
  useEffect(() => {
    if (isOpen) {
      const p = loadTablePlayers();
      setPlayers(p);
      setActivePlayerIdx(0);
      setGameState('IDLE');
      setElapsedSec(0);
      setIsBlindPhase(false);
      isRunningRef.current = false;
      isBlindRef.current = false;
      setLastResult(null);
      setShowMatchChampModal(false);

      // Initialize leaderboard with players
      const initLb: PlayerScoreEntry[] = p.map((player) => ({
        playerId: player.id,
        name: player.name,
        avatar: player.avatar,
        time: 0,
        delta: 0,
        absDelta: 999,
        points: 0,
        status: 'waiting'
      }));
      setLeaderboard(initLb);
    }
  }, [isOpen]);

  // Clean timer on unmount
  useEffect(() => {
    return () => {
      isRunningRef.current = false;
      if (timerFrameRef.current) cancelAnimationFrame(timerFrameRef.current);
    };
  }, []);

  // Stop chronometer
  const handleStopChrono = useCallback(() => {
    isRunningRef.current = false;
    if (timerFrameRef.current) cancelAnimationFrame(timerFrameRef.current);

    const totalElapsed = (Date.now() - startTimeRef.current) / 1000;
    const delta = totalElapsed - 10.0;
    const absDelta = Math.abs(delta);

    setGameState('STOPPED');
    setIsBlindPhase(false);
    isBlindRef.current = false;
    setElapsedSec(totalElapsed);

    let feedback = '';
    let points = 10;
    let colorClass = 'text-[#bef264]';
    let status: 'perfect' | 'close' | 'missed' = 'missed';

    if (absDelta <= 0.15) {
      feedback = '🎯 EFSANE! Mükemmel Tolerans (+50 Puan)';
      points = 50;
      colorClass = 'text-[#bef264]';
      status = 'perfect';
      soundEngine.playVictory();
      soundEngine.triggerHaptic('win');
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#bef264', '#f751a1', '#4cd7f6']
        });
      } catch {
        // ignore
      }
    } else if (absDelta <= 0.5) {
      feedback = '👏 ÇOK YAKIN! Harika İç Ritim (+30 Puan)';
      points = 30;
      colorClass = 'text-[#4cd7f6]';
      status = 'close';
      soundEngine.playSuccess();
      soundEngine.triggerHaptic('touch');
    } else if (delta > 0) {
      feedback = `⏳ GEÇ KALDIN! (${delta > 1.0 ? '☕ Cezaya Aday!' : '+10 Puan'})`;
      points = delta > 1.0 ? 0 : 10;
      colorClass = 'text-[#f751a1]';
      status = 'missed';
      if (delta > 1.0) soundEngine.playBuzzer();
      else soundEngine.playTone(380, 0.15, 'triangle');
    } else {
      feedback = `⚡ ERKEN BASTIN! (${absDelta > 1.0 ? '☕ Cezaya Aday!' : '+10 Puan'})`;
      points = absDelta > 1.0 ? 0 : 10;
      colorClass = 'text-amber-400';
      status = 'missed';
      if (absDelta > 1.0) soundEngine.playBuzzer();
      else soundEngine.playTone(380, 0.15, 'triangle');
    }

    setLastResult({
      totalElapsed,
      delta,
      absDelta,
      feedback,
      points,
      colorClass
    });

    // Update player score in leaderboard
    const curr = players[activePlayerIdx % (players.length || 1)];
    if (curr) {
      setLeaderboard((prev) => {
        const updated = prev.map((item) => {
          if (item.playerId === curr.id) {
            return {
              ...item,
              time: totalElapsed,
              delta,
              absDelta,
              points,
              status
            };
          }
          return item;
        });
        return [...updated].sort((a, b) => a.absDelta - b.absDelta);
      });
    }
  }, [players, activePlayerIdx]);

  // Start chronometer
  const handleStartChrono = () => {
    soundEngine.playClick();
    soundEngine.triggerHaptic('tap');
    if (timerFrameRef.current) cancelAnimationFrame(timerFrameRef.current);

    startTimeRef.current = Date.now();
    isRunningRef.current = true;
    isBlindRef.current = false;

    setGameState('RUNNING');
    setIsBlindPhase(false);
    setElapsedSec(0);
    setLastResult(null);

    const loop = () => {
      if (!isRunningRef.current) return;
      const now = Date.now();
      const currentSeconds = (now - startTimeRef.current) / 1000;
      setElapsedSec(currentSeconds);

      if (currentSeconds >= 3.0 && !isBlindRef.current) {
        isBlindRef.current = true;
        setIsBlindPhase(true);
        setGameState('BLIND');
        soundEngine.triggerHaptic('urgent');
      }

      if (currentSeconds >= 14.99) {
        handleStopChrono();
        return;
      }

      timerFrameRef.current = requestAnimationFrame(loop);
    };

    timerFrameRef.current = requestAnimationFrame(loop);
  };


  // Next Player Turn
  const handleNextPlayer = () => {
    soundEngine.playClick();
    if (activePlayerIdx + 1 < players.length) {
      setActivePlayerIdx((prev) => prev + 1);
      setGameState('IDLE');
      setElapsedSec(0);
      setIsBlindPhase(false);
      setLastResult(null);
      const nextP = players[activePlayerIdx + 1];
      onShowToast(`👉 Sıradaki yarışmacı: ${nextP.name}`);
    } else {
      // All players in table completed their turn!
      soundEngine.playVictory();
      soundEngine.triggerHaptic('win');
      try {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.4 },
          colors: ['#bef264', '#f751a1', '#4cd7f6']
        });
      } catch {
        // ignore
      }
      setShowMatchChampModal(true);
    }
  };

  // Toggle Haptic
  const handleToggleHaptic = () => {
    const nextState = !isHapticOn;
    setIsHapticOn(nextState);
    soundEngine.hapticsEnabled = nextState;
    if (nextState) {
      soundEngine.triggerHaptic('tap');
      onShowToast('📳 Titreşim Açık');
    } else {
      onShowToast('🔇 Titreşim Kapalı');
    }
  };

  const currentPlayer = players[activePlayerIdx % (players.length || 1)] || {
    id: 'p1',
    name: 'Oyuncu',
    avatar: '',
    score: 0
  };

  const progressFraction = Math.min((elapsedSec * 1000) / maxChronoMs, 1);
  const strokeDashoffset = circumference - circumference * progressFraction;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2 select-none">
      <div className="relative w-full max-w-md h-[94dvh] sm:h-[96vh] max-h-[890px] bg-[#0a0e18] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        {/* Header Bar */}
        <header className="w-full pt-safe bg-[#0a0e18]/90 backdrop-blur-xl border-b border-white/10 shrink-0">
          <div className="h-16 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#bef264] via-[#009eb9] to-[#f751a1] flex items-center justify-center text-white shadow-[0_0_15px_rgba(190,242,100,0.35)] shrink-0">
                <span className="text-xl">⏱️</span>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-base font-black text-white tracking-tight leading-tight">
                    Tam 10.00 Saniye
                  </h1>
                  <span className="w-2 h-2 rounded-full bg-[#bef264] animate-pulse" />
                </div>
                <span className="text-[10px] font-bold text-[#4cd7f6] uppercase tracking-wider">
                  İç Ses &amp; Kör Kronometre
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              {/* Rules Info Button */}
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowInfoModal(true);
                }}
                className="h-8 px-2.5 rounded-full bg-[#1E293B] hover:bg-[#262a35] border border-white/10 text-[#bef264] flex items-center gap-1 text-[11px] font-bold shadow-sm active:scale-95 transition-all"
                title="Nasıl Oynanır?"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Kurallar</span>
              </button>

              {/* Haptic Toggle */}
              <button
                onClick={handleToggleHaptic}
                aria-label="Titreşim Durumu"
                className={`h-8 px-2 rounded-full border border-white/10 flex items-center justify-center text-[11px] font-bold shadow-sm active:scale-95 transition-all ${
                  isHapticOn ? 'bg-[#1E293B] text-[#bef264] border-[#bef264]/30' : 'bg-[#111827] text-gray-400'
                }`}
              >
                <Vibrate className="w-4 h-4" />
              </button>

              {/* Close Button */}
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onClose();
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 flex items-center justify-center text-gray-300 hover:text-white transition-all shadow"
                title="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* Scrollable Body */}
        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 py-2.5 flex flex-col gap-2.5 no-scrollbar">

        {/* Compact Challenger & Target Header */}
        <div className="w-full bg-[#111827] px-3.5 py-2 rounded-2xl flex items-center justify-between border border-white/10 shadow-sm shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative w-8 h-8 shrink-0">
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-[#f751a1] to-[#bef264] p-0.5 flex items-center justify-center shadow">
                <div className="w-full h-full rounded-full bg-[#0a0e18] flex items-center justify-center overflow-hidden">
                  {currentPlayer.avatar ? (
                    <img src={currentPlayer.avatar} alt={currentPlayer.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-black text-xs text-[#f751a1]">
                      {currentPlayer.name.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-black text-white truncate">{currentPlayer.name}</span>
                <span className="px-1.5 py-0.5 rounded-full bg-[#bef264]/20 text-[#bef264] text-[9px] font-black uppercase">
                  Sıradaki
                </span>
              </div>
              <span className="text-[10px] text-gray-400 truncate">
                Tur {activePlayerIdx + 1}/{players.length} • Dikkat dağıtmak serbest!
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#1E293B] text-[#bef264] text-[11px] font-black border border-white/5 shrink-0">
            <Target className="w-3.5 h-3.5 text-[#bef264]" />
            <span>Hedef: 10.00s</span>
          </div>
        </div>

        {/* The Blind Arena Interactive Stopwatch Chronograph */}
        <div className="w-full relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-3xl bg-[#111827] shadow-[0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden border border-white/10 shrink-0">
          {/* Radial Chrono Gauge Layout */}
          <div className="relative w-48 h-48 sm:w-56 sm:h-56 flex items-center justify-center">
            {/* Ambient Glow Underlay */}
            <div
              className={`absolute inset-0 rounded-full blur-2xl transition-all duration-700 pointer-events-none ${
                isBlindPhase
                  ? 'bg-red-500/25 scale-110'
                  : gameState === 'RUNNING'
                  ? 'bg-[#4cd7f6]/20'
                  : 'bg-[#bef264]/15'
              }`}
            />

            {/* Chrono SVG Rings */}
            <svg className="w-full h-full -rotate-90 transform pointer-events-none" viewBox="0 0 240 240">
              {/* Background Track */}
              <circle
                className="text-[#1E293B]"
                cx="120"
                cy="120"
                fill="none"
                r="102"
                stroke="currentColor"
                strokeWidth="8"
              />
              {/* Tolerance Target Sector (approx 10s notch) */}
              <circle
                className="text-[#bef264] opacity-80"
                cx="120"
                cy="120"
                fill="none"
                r="102"
                stroke="currentColor"
                strokeDasharray="16 625"
                strokeDashoffset="-532"
                strokeWidth="12"
              />
              {/* Animated Running Arc */}
              <circle
                className={`transition-all duration-75 ${
                  lastResult
                    ? lastResult.colorClass.includes('bef264')
                      ? 'text-[#bef264]'
                      : lastResult.colorClass.includes('f751a1')
                      ? 'text-[#f751a1]'
                      : 'text-[#4cd7f6]'
                    : isBlindPhase
                    ? 'text-[#f751a1]'
                    : 'text-[#4cd7f6]'
                }`}
                cx="120"
                cy="120"
                fill="none"
                r="102"
                stroke="currentColor"
                strokeDasharray="640"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                strokeWidth="8"
              />
            </svg>

            {/* Center Inner Display */}
            <div className="absolute inset-4 rounded-full bg-[#0a0e18] flex flex-col items-center justify-center p-3 text-center shadow-inner border border-white/5">
              {/* Time Display */}
              <div className="flex flex-col items-center justify-center">
                {gameState === 'IDLE' && (
                  <div className="flex flex-col items-center">
                    <span className="text-4xl sm:text-5xl font-black font-mono tracking-tighter text-[#bef264] drop-shadow-[0_0_15px_rgba(190,242,100,0.5)]">
                      00.00
                    </span>
                    <span className="text-[11px] font-black text-gray-400 mt-1 uppercase tracking-wider">
                      Hedef: 10.00 sn
                    </span>
                  </div>
                )}

                {gameState === 'RUNNING' && (
                  <div className="flex flex-col items-center">
                    <span className="text-4xl sm:text-5xl font-black font-mono tracking-tighter text-[#4cd7f6] drop-shadow-[0_0_15px_rgba(76,215,246,0.6)]">
                      {elapsedSec < 10 ? `0${elapsedSec.toFixed(2)}` : elapsedSec.toFixed(2)}
                    </span>
                    <span className="text-[10px] font-black text-amber-400 mt-1 uppercase tracking-wider">
                      3.00s'de kararacak!
                    </span>
                  </div>
                )}

                {gameState === 'BLIND' && (
                  <div className="flex flex-col items-center">
                    <div className="flex items-center gap-1.5 text-[#f751a1] animate-pulse">
                      <EyeOff className="w-5 h-5 text-[#f751a1]" />
                      <span className="text-3xl sm:text-4xl font-black font-mono tracking-wider drop-shadow-[0_0_15px_rgba(247,81,161,0.8)]">
                        ??:??
                      </span>
                    </div>
                    <span className="mt-1 px-2.5 py-0.5 rounded-full bg-[#f751a1]/20 text-[#f751a1] text-[10px] font-black uppercase tracking-wider border border-[#f751a1]/30">
                      Kör Mod • İçinden Say!
                    </span>
                  </div>
                )}

                {gameState === 'STOPPED' && lastResult && (
                  <div className="flex flex-col items-center animate-in zoom-in-95">
                    <span className={`text-4xl sm:text-5xl font-black font-mono tracking-tight ${lastResult.colorClass}`}>
                      {lastResult.totalElapsed.toFixed(2)}s
                    </span>
                    <span className="text-xs font-mono font-bold text-gray-300 mt-0.5">
                      Sapma: {lastResult.delta >= 0 ? '+' : ''}{lastResult.delta.toFixed(2)}s
                    </span>
                  </div>
                )}
              </div>

              {/* Sub guidance status */}
              <div className="mt-2.5 px-3 py-1 rounded-full bg-[#1E293B] text-gray-300 text-[10px] font-bold border border-white/5">
                {gameState === 'IDLE' && <span>Hazır olduğunda başla</span>}
                {gameState === 'RUNNING' && <span className="text-[#4cd7f6]">Zaman akıyor...</span>}
                {gameState === 'BLIND' && (
                  <span className="text-[#bef264] font-black animate-pulse">
                    10.00 sn hissettiğinde DURDUR!
                  </span>
                )}
                {gameState === 'STOPPED' && <span className="text-[#bef264]">Tur tamamlandı!</span>}
              </div>
            </div>
          </div>

          {/* Accuracy Tolerance Range Strip */}
          <div className="mt-3 flex items-center gap-2 px-3 py-1 rounded-full bg-[#171b26] text-gray-400 border border-white/5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#bef264]" />
            <span className="text-[11px] font-medium">
              Mükemmel Aralık: <strong className="text-white">9.85s – 10.15s</strong>
            </span>
          </div>

          {/* Dynamic Result Toast Area */}
          {lastResult && (
            <div className="mt-3 w-full max-w-sm px-4 py-2.5 rounded-2xl bg-[#1E293B] border border-white/10 text-center animate-in zoom-in-95">
              <div className={`text-xl font-black ${lastResult.colorClass}`}>
                {lastResult.totalElapsed.toFixed(2)} sn{' '}
                <span className="text-xs font-bold text-gray-400">
                  (Sapma: {lastResult.delta >= 0 ? '+' : ''}
                  {lastResult.delta.toFixed(2)}s)
                </span>
              </div>
              <div className="text-xs text-gray-200 font-bold mt-0.5">{lastResult.feedback}</div>
            </div>
          )}
        </div>

        {/* Primary Interactive Controls */}
        <div className="flex flex-col gap-2 w-full mt-0.5">
          {gameState === 'STOPPED' ? (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={handleNextPlayer}
                className="w-full h-15 rounded-full bg-gradient-to-r from-[#bef264] to-lime-400 text-black font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(196,244,66,0.4)] active:scale-95 transition-all cursor-pointer"
              >
                <span>
                  {activePlayerIdx + 1 < players.length
                    ? 'Sıradaki Yarışmacıya Geç 👉'
                    : 'Masa Şampiyonunu İlan Et 🏆'}
                </span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={handleStartChrono}
                className="w-full py-2.5 rounded-full bg-[#1E293B] hover:bg-[#262a35] text-gray-300 font-bold text-xs active:scale-95 transition-all border border-white/10"
              >
                Aynı Kişi Tekrar Denesin 🔄
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={gameState === 'IDLE' ? handleStartChrono : handleStopChrono}
              className={`w-full h-16 rounded-full font-black text-base flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-95 ${
                gameState === 'IDLE'
                  ? 'bg-[#bef264] text-black shadow-[0_0_25px_rgba(196,244,66,0.4)]'
                  : 'bg-gradient-to-r from-[#f751a1] to-pink-600 text-white shadow-[0_0_30px_rgba(247,81,161,0.6)] animate-pulse'
              }`}
            >
              {gameState === 'IDLE' ? (
                <>
                  <Play className="w-6 h-6 fill-current" />
                  <span>SAYACI BAŞLAT</span>
                </>
              ) : (
                <>
                  <Target className="w-6 h-6 animate-spin" />
                  <span>DURDUR! (TAM 10.00 SN) 💥</span>
                </>
              )}
            </button>
          )}

          <div className="text-center text-[11px] text-gray-400 font-medium">
            (3.00 saniyeden sonra ekran kararır, 10.00'da dokunup durdur!)
          </div>
        </div>

        {/* Live Room Accuracy Leaderboard (Masa Sıralaması) */}
        <div className="flex flex-col gap-2 mt-1">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-[#bef264]" />
              <span className="text-xs font-black text-white uppercase tracking-wider">
                Masa Sıralaması (En Az Sapanlar)
              </span>
            </div>
            <span className="text-[11px] font-bold text-[#4cd7f6]">
              {leaderboard.filter((l) => l.status !== 'waiting').length} Tamamlandı
            </span>
          </div>

          {/* Leaderboard Stack */}
          <div className="flex flex-col gap-2">
            {leaderboard.map((item, idx) => {
              const isDone = item.status !== 'waiting';
              const sign = item.delta >= 0 ? '+' : '';
              return (
                <div
                  key={item.playerId}
                  className={`w-full p-3 rounded-2xl flex items-center justify-between shadow-sm border transition-all ${
                    idx === 0 && isDone
                      ? 'bg-[#1E293B] border-[#bef264]/50 shadow-[0_0_15px_rgba(190,242,100,0.15)]'
                      : 'bg-[#111827] border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                        idx === 0 && isDone
                          ? 'bg-[#bef264] text-black shadow'
                          : idx === 1 && isDone
                          ? 'bg-[#4cd7f6] text-black shadow'
                          : idx === 2 && isDone
                          ? 'bg-[#f751a1] text-white shadow'
                          : 'bg-[#1E293B] text-gray-400'
                      }`}
                    >
                      {idx + 1}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-black text-white truncate">
                          {item.name}
                        </span>
                        {item.status === 'perfect' && (
                          <span className="px-1.5 py-0.2 rounded-full bg-[#bef264]/20 text-[#bef264] text-[9px] font-black uppercase">
                            🥇 MÜKEMMEL
                          </span>
                        )}
                        {item.status === 'close' && (
                          <span className="px-1.5 py-0.2 rounded-full bg-[#4cd7f6]/20 text-[#4cd7f6] text-[9px] font-black uppercase">
                            🥈 ÇOK YAKIN
                          </span>
                        )}
                        {item.status === 'missed' && (
                          <span className="px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-400 text-[9px] font-black uppercase">
                            {item.delta > 0 ? '🥉 GEÇ KALDI' : '⚡ ERKEN'}
                          </span>
                        )}
                      </div>

                      <span className="text-[10px] text-gray-400 truncate">
                        {isDone ? (
                          <>
                            Sapma: <strong className="text-white">{sign}{item.delta.toFixed(2)}s</strong>
                          </>
                        ) : (
                          'Sırası bekleniyor...'
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end shrink-0 pl-2">
                    {isDone ? (
                      <>
                        <span className="text-sm font-black text-white font-mono">
                          {item.time.toFixed(2)}s
                        </span>
                        <span className="text-[10px] font-bold text-[#bef264]">
                          +{item.points} Puan
                        </span>
                      </>
                    ) : (
                      <span className="text-gray-500 text-xs">⏳</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Penalty / Coffee Stake Card */}
        <div className="w-full p-4 rounded-3xl bg-[#111827] flex items-start gap-3 shadow-lg border border-white/10 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <Coffee className="w-6 h-6" />
          </div>
          <div className="flex flex-col flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-400 uppercase tracking-wider">
                KAFE CEZASI AKTİF
              </span>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setPenaltyText(
                    COFFEE_PENALTIES[Math.floor(Math.random() * COFFEE_PENALTIES.length)]
                  );
                }}
                className="text-[10px] text-gray-400 hover:text-amber-400 font-bold"
              >
                Yeni Ceza
              </button>
            </div>
            <p className="text-xs text-gray-300 mt-1 leading-snug">
              {penaltyText}
            </p>
          </div>
        </div>

        {/* ================= ALL PLAYERS MATCH CHAMPION MODAL ================= */}
        {showMatchChampModal && (
          <div className="fixed inset-0 z-70 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
            <div className="bg-[#111827] border-2 border-yellow-500/50 p-6 rounded-3xl max-w-sm w-full shadow-[0_0_60px_rgba(234,179,8,0.4)] flex flex-col items-center text-center gap-3 relative">
              <div className="w-20 h-20 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-4xl shadow-lg animate-bounce">
                👑
              </div>

              <span className="text-[11px] font-black text-yellow-400 uppercase tracking-widest">
                İÇ SES REFLEKS ŞAMPİYONU
              </span>

              <h2 className="text-2xl font-black text-white">
                {leaderboard[0]?.name || 'Şampiyon'}
              </h2>

              <p className="text-xs text-gray-300">
                10.00 saniyeye en yakın durdurarak masanın zamanlama ustası oldu!
              </p>

              {/* Best score display */}
              <div className="w-full bg-[#1E293B] p-3 rounded-2xl border border-white/10 flex items-center justify-around my-1">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-400">Derece</span>
                  <span className="text-xl font-black text-[#bef264] font-mono">
                    {leaderboard[0]?.time.toFixed(2)}s
                  </span>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-400">Sapma</span>
                  <span className="text-xl font-black text-white font-mono">
                    {leaderboard[0]?.delta >= 0 ? '+' : ''}
                    {leaderboard[0]?.delta.toFixed(2)}s
                  </span>
                </div>
              </div>

              {/* Penalty for the worst deviation */}
              {leaderboard.length > 1 && (
                <div className="w-full p-2.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-left">
                  <span className="text-[10px] font-black text-red-400 uppercase tracking-wider block">
                    ☕ Cezayı Çekecek Kişi: {leaderboard[leaderboard.length - 1].name}
                  </span>
                  <span className="text-[11px] text-gray-300">
                    En çok sapan kişi olarak masanın kahve veya tatlı siparişini ısmarlar!
                  </span>
                </div>
              )}

              <div className="w-full flex flex-col gap-2 pt-1">
                <button
                  onClick={() => {
                    const p = loadTablePlayers();
                    setActivePlayerIdx(0);
                    setGameState('IDLE');
                    setElapsedSec(0);
                    setLastResult(null);
                    setShowMatchChampModal(false);
                    const initLb: PlayerScoreEntry[] = p.map((player) => ({
                      playerId: player.id,
                      name: player.name,
                      avatar: player.avatar,
                      time: 0,
                      delta: 0,
                      absDelta: 999,
                      points: 0,
                      status: 'waiting'
                    }));
                    setLeaderboard(initLb);
                    soundEngine.playClick();
                  }}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#bef264] to-lime-400 text-black font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all"
                >
                  Yeni Tur Başlat 🔄
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-full bg-[#1E293B] text-gray-300 font-bold text-xs hover:bg-[#262a35] active:scale-95 transition-all"
                >
                  Oyunlar Menüsüne Dön
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= RULES MINI MODAL ================= */}
        {showInfoModal && (
          <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
            <div className="w-full max-w-sm sm:max-w-md bg-[#111827] border border-white/15 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-left relative">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⏱️</span>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Tam 10.00 Saniye Nasıl Oynanır?
                  </h3>
                </div>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-3 text-xs sm:text-sm text-gray-300 overflow-y-auto max-h-[60vh] pr-1">
                <div>
                  <strong className="text-white block font-bold mb-1">1. Hedef:</strong>
                  Sayacı başlattıktan sonra tam olarak <strong>10.00 saniyede</strong> durdurmaya çalış!
                </div>

                <div>
                  <strong className="text-white block font-bold mb-1">2. Kör Faz (Ekran Kararır):</strong>
                  İlk 3.00 saniye süreyi görürsün. 3.00 saniyeden sonra sayaç kararır ve "??.??" olur. Artık yalnızca iç sesine ve biyolojik ritmine güvenmelisin!
                </div>

                <div>
                  <strong className="text-white block font-bold mb-1">3. Dikkat Dağıtma Kuralı:</strong>
                  Yarışmacı gözlerini kapatıp içinden sayarken masadaki diğer oyuncular ses çıkarabilir, tempo şaşırtabilir ve dikkat dağıtabilir!
                </div>

                <div>
                  <strong className="text-white block font-bold mb-1">4. Puanlama &amp; Kafe Cezası:</strong>
                  10.00 saniyeye en yakın durduran (±0.15s) 50 puan kapar! En çok şaşan ise masadaki eğlenceli kafe cezasını çeker!
                </div>
              </div>

              <button
                onClick={() => setShowInfoModal(false)}
                className="w-full py-3 rounded-full bg-gradient-to-r from-[#bef264] to-lime-400 text-black font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all mt-1"
              >
                Anladım, Oyuna Başla ⏱️
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
