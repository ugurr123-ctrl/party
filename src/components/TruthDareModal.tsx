import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Volume2,
  VolumeX,
  Vibrate,
  HelpCircle,
  Flame,
  Shield,
  RotateCw,
  Ban,
  ThumbsUp,
  Sparkles,
  Play,
  ArrowRight,
  Lock,
  Timer,
  CheckCircle2,
  PartyPopper,
  Users,
  Award,
  AlertTriangle,
  ChevronRight,
  Pause
} from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { TablePlayer, loadTablePlayers, saveTablePlayers } from '../utils/playerManager';
import {
  TRUTH_BY_LEVEL,
  DARE_BY_LEVEL
} from '../data/truthDareData';

interface TruthDareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const TruthDareModal: React.FC<TruthDareModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const [level, setLevel] = useState<'hafif' | 'parti' | 'atesli'>('parti');
  const [players, setPlayers] = useState<TablePlayer[]>(() => loadTablePlayers());
  const [activePlayerIdx, setActivePlayerIdx] = useState<number>(0);
  const [round, setRound] = useState<number>(1);
  const maxRounds = 5;
  const [passCount, setPassCount] = useState<number>(1);
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(!soundEngine.sfxEnabled);
  const [isHapticOn, setIsHapticOn] = useState<boolean>(soundEngine.hapticsEnabled);
  const [showRulesInfo, setShowRulesInfo] = useState<boolean>(false);

  // Question indices
  const [tIndex, setTIndex] = useState<number>(0);
  const [dIndex, setDIndex] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // Card selection & 30s Dare countdown
  const [selectedCardType, setSelectedCardType] = useState<'truth' | 'dare' | null>(null);
  const [isDareTimerActive, setIsDareTimerActive] = useState<boolean>(false);
  const [dareTimer, setDareTimer] = useState<number>(30);

  // Sync players from table when opened
  useEffect(() => {
    if (isOpen) {
      const table = loadTablePlayers();
      setPlayers(table);
      setActivePlayerIdx(0);
      setRound(1);
      setPassCount(1);
      setSelectedCardType(null);
      setIsDareTimerActive(false);
      setDareTimer(30);
    }
  }, [isOpen]);

  const truths = TRUTH_BY_LEVEL[level];
  const dares = DARE_BY_LEVEL[level];
  const currentPlayer = players[activePlayerIdx % (players.length || 1)] || {
    id: 'p1',
    name: 'Oyuncu',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    score: 0,
    color: '#f751a1'
  };

  // 30-Second Dare Timer Effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isDareTimerActive && dareTimer > 0) {
      interval = setInterval(() => {
        soundEngine.playCountdown();
        if (dareTimer <= 6) {
          soundEngine.triggerHaptic('urgent');
        }
        setDareTimer((prev) => {
          if (prev <= 1) {
            soundEngine.playBuzzer();
            soundEngine.triggerHaptic('alert');
            setIsDareTimerActive(false);
            onShowToast(`⏰ Süre doldu! ${currentPlayer.name} masaya ceza borçlandı!`);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isDareTimerActive, dareTimer, currentPlayer.name, onShowToast]);

  if (!isOpen) return null;

  // Toggle sound
  const handleToggleSound = () => {
    soundEngine.playClick();
    const newState = soundEngine.toggleSound();
    setIsAudioMuted(!newState);
    onShowToast(newState ? '🔊 Ses Açıldı' : '🔇 Sessize Alındı');
  };

  // Toggle haptic
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

  // Reroll questions with smooth fade
  const rerollDeck = () => {
    soundEngine.playClick();
    soundEngine.triggerHaptic('tap');
    setIsAnimating(true);
    setTimeout(() => {
      setTIndex((prev) => (prev + 1) % truths.length);
      setDIndex((prev) => (prev + 1) % dares.length);
      setIsAnimating(false);
      setSelectedCardType(null);
    }, 180);
    onShowToast('🎲 Yeni kartlar çekildi!');
  };

  // Change Level
  const handleChangeLevel = (newLevel: 'hafif' | 'parti' | 'atesli') => {
    soundEngine.playClick();
    soundEngine.triggerHaptic('tap');
    setLevel(newLevel);
    setTIndex(0);
    setDIndex(0);
    setSelectedCardType(null);
    if (isDareTimerActive) {
      setIsDareTimerActive(false);
      setDareTimer(30);
    }
    const labels = {
      hafif: 'Hafif & Eğlenceli Mod 🌱',
      parti: 'Parti Modu Aktif 🔥',
      atesli: 'Ateşli (+18) Mod Aktif 🌶️'
    };
    onShowToast(labels[newLevel]);
  };

  // Award points to current player and save table
  const awardPointsToCurrent = (points: number, message: string) => {
    soundEngine.playSuccess();
    soundEngine.triggerHaptic('win');
    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#bef264', '#4cd7f6', '#f751a1']
      });
    } catch {
      // ignore
    }

    const updated = players.map((p, idx) =>
      idx === activePlayerIdx ? { ...p, score: p.score + points } : p
    );
    setPlayers(updated);
    saveTablePlayers(updated);
    onShowToast(message);
    advanceTurn(true);
  };

  // Advance turn to next player
  const advanceTurn = (awardPass: boolean = false) => {
    if (isDareTimerActive) {
      setIsDareTimerActive(false);
      setDareTimer(30);
    }
    setSelectedCardType(null);

    const nextIdx = (activePlayerIdx + 1) % (players.length || 1);
    setActivePlayerIdx(nextIdx);

    // If cycle completed, advance round
    if (nextIdx === 0) {
      setRound((prev) => (prev < maxRounds ? prev + 1 : 1));
      if (awardPass) {
        setPassCount(1); // Refresh 1 pass for new round
      }
    }

    // Reroll cards for new player
    setTimeout(() => {
      setTIndex((prev) => (prev + 1) % truths.length);
      setDIndex((prev) => (prev + 1) % dares.length);
    }, 150);
  };

  // Skip / Penalty
  const handleSkipOrPenalty = () => {
    soundEngine.playClick();
    if (passCount > 0) {
      soundEngine.triggerHaptic('tap');
      setPassCount((prev) => prev - 1);
      onShowToast(`🛡️ ${currentPlayer.name} pas hakkını kullandı! (0 pas kaldı)`);
      rerollDeck();
    } else {
      soundEngine.playBuzzer();
      soundEngine.triggerHaptic('alert');
      onShowToast(`⚠️ Pas hakkı kalmadı! ${currentPlayer.name} masaya ceza borçlandı!`);
      advanceTurn(false);
    }
  };

  // Group Approval (+10 Puan)
  const handleGroupApproval = () => {
    awardPointsToCurrent(10, `🎉 Grubun Onayı! ${currentPlayer.name} +10 Puan kazandı!`);
  };

  // Truth Confession (+5 Puan)
  const handleTruthDone = () => {
    awardPointsToCurrent(5, `🤐 İtiraf Tamamlandı! ${currentPlayer.name} +5 Puan kazandı!`);
  };

  // Start Dare Timer
  const handleStartDare = () => {
    soundEngine.playClick();
    soundEngine.triggerHaptic('urgent');
    setSelectedCardType('dare');
    setDareTimer(30);
    setIsDareTimerActive(true);
    onShowToast(`⏱️ ${currentPlayer.name} için 30 saniye cesaret süresi başladı!`);
  };

  // Dare Completed (+10 Puan)
  const handleDareSuccess = () => {
    setIsDareTimerActive(false);
    awardPointsToCurrent(10, `🔥 Cesaret Görevi Başarılı! ${currentPlayer.name} +10 Puan kazandı!`);
  };

  // Dare Forfeit / Cancel
  const handleDareForfeit = () => {
    soundEngine.playBuzzer();
    soundEngine.triggerHaptic('alert');
    setIsDareTimerActive(false);
    setDareTimer(30);
    onShowToast(`❌ ${currentPlayer.name} cesaret görevinden vazgeçti! Masaya ceza borçlu!`);
    advanceTurn(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2 select-none font-body-md text-on-surface antialiased">
      <div className="relative w-full max-w-md h-[88dvh] sm:h-[92vh] max-h-[840px] bg-[#0a0e18] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        {/* ================= FIXED TOP HEADER ================= */}
        <header className="w-full pt-safe bg-[#0a0e18]/90 backdrop-blur-xl border-b border-white/10 shrink-0">
          <div className="h-16 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#f751a1] via-[#571bc1] to-[#bef264] flex items-center justify-center text-white shadow-[0_0_15px_rgba(247,81,161,0.4)] shrink-0">
                <Flame className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-base text-white tracking-tight leading-none truncate">
                    Doğruluk mu Cesaret mi?
                  </h1>
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shrink-0" />
                </div>
                <span className="text-[10px] text-[#bef264] tracking-wider uppercase font-mono mt-1 truncate">
                  İtiraf &amp; Meydan Okuma • Canlı Masa
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowRulesInfo(true);
                }}
                className="w-10 h-10 rounded-full bg-[#1c1f2a] hover:bg-white/10 flex items-center justify-center text-[#bef264] transition-colors"
                title="Nasıl Oynanır?"
                type="button"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              <button
                onClick={handleToggleSound}
                aria-label="Ses Kontrolü"
                className="w-10 h-10 rounded-full bg-[#1c1f2a] hover:bg-white/10 flex items-center justify-center text-gray-300 transition-colors"
                title="Ses"
                type="button"
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
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* ================= MAIN SCROLLABLE CONTENT ================= */}
        <div className="flex-1 overflow-y-auto px-4 py-3 pb-16 flex flex-col gap-3.5 no-scrollbar">

        {/* ================= ACTIVE PLAYER & STATUS BANNER ================= */}
        <section className="w-full bg-[#111827] border border-white/10 rounded-2xl p-3.5 sm:p-4 shadow-lg relative overflow-hidden">
          <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-[#f751a1]/15 blur-2xl pointer-events-none" />
          <div className="absolute -left-8 -bottom-8 w-28 h-28 rounded-full bg-[#4cd7f6]/10 blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between relative z-10 gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 shadow-md ring-2 ring-[#f751a1]/40">
                <img
                  className="w-full h-full object-cover"
                  src={currentPlayer.avatar}
                  alt={currentPlayer.name}
                />
                <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-[#10B981] ring-2 ring-[#111827]" />
              </div>

              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#4cd7f6]">
                    Masanın Sırası
                  </span>
                  <Flame className="w-3 h-3 text-[#f751a1] fill-[#f751a1]" />
                </div>
                <h2 className="text-base sm:text-lg font-black text-white truncate leading-tight">
                  {currentPlayer.name}
                </h2>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                  <span className="text-gray-300 font-bold">Tur {round}/{maxRounds}</span>
                  <span>•</span>
                  <span className="text-[#bef264] font-black">{currentPlayer.score} Puan</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {/* Pass counter badge */}
              <div className="flex flex-col items-end">
                <span className="text-[9px] font-black uppercase text-gray-400">
                  Pas Hakkı
                </span>
                <div className="flex items-center gap-1 mt-0.5 bg-[#0B0F19] border border-white/5 px-2.5 py-1 rounded-full shadow-sm">
                  <Shield className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
                  <span className="text-xs font-black text-[#F59E0B]">
                    {passCount} Kalan
                  </span>
                </div>
              </div>

              {/* Next player quick switch button */}
              <button
                onClick={() => {
                  soundEngine.playClick();
                  advanceTurn(false);
                  onShowToast(`👉 Sıradaki: ${players[(activePlayerIdx + 1) % players.length]?.name}`);
                }}
                className="h-9 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 transition-all text-gray-300 hover:text-white flex items-center gap-1 text-xs font-bold"
                title="Sıradaki Oyuncuya Devret"
                type="button"
              >
                <span>Sonraki</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </section>

        {/* ================= DOSE / LEVEL SELECTOR ================= */}
        <section className="w-full flex flex-col gap-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
              Oyun Dozu
            </span>
            <span className="text-[11px] font-bold text-[#ffb0cd] flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#ffb0cd]" />
              {level === 'hafif'
                ? 'Tatlı & Sakin 🌱'
                : level === 'parti'
                ? 'Pro Seviye 🔥'
                : 'Cesur (+18) 🌶️'}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 bg-[#0a0e18] p-1.5 rounded-full border border-white/10 shadow-inner">
            <button
              onClick={() => handleChangeLevel('hafif')}
              className={`py-2 px-1 rounded-full text-center text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                level === 'hafif'
                  ? 'bg-[#bef264] text-black shadow-[0_0_14px_rgba(190,242,100,0.35)]'
                  : 'text-gray-400 hover:text-white'
              }`}
              type="button"
            >
              <span>🌱</span>
              <span>Hafif</span>
            </button>

            <button
              onClick={() => handleChangeLevel('parti')}
              className={`py-2 px-1 rounded-full text-center text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                level === 'parti'
                  ? 'bg-[#bef264] text-black shadow-[0_0_14px_rgba(190,242,100,0.35)]'
                  : 'text-gray-400 hover:text-white'
              }`}
              type="button"
            >
              <PartyPopper className="w-3.5 h-3.5" />
              <span>Parti 🔥</span>
            </button>

            <button
              onClick={() => handleChangeLevel('atesli')}
              className={`py-2 px-1 rounded-full text-center text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                level === 'atesli'
                  ? 'bg-[#bef264] text-black shadow-[0_0_14px_rgba(190,242,100,0.35)]'
                  : 'text-gray-400 hover:text-white'
              }`}
              type="button"
            >
              <Flame className="w-3.5 h-3.5 text-red-500 fill-red-500" />
              <span>Ateşli 🌶️</span>
            </button>
          </div>
        </section>

        {/* ================= INTERACTIVE CARDS: DOĞRULUK VS CESARET ================= */}
        <section className="w-full flex flex-col gap-3">
          {/* TRUTH CARD (Neon Cyan / Electric Blue) */}
          <div
            className={`group relative w-full bg-[#111827] border rounded-2xl p-4 shadow-xl transition-all duration-300 overflow-hidden select-none ${
              selectedCardType === 'truth'
                ? 'border-[#4cd7f6] ring-1 ring-[#4cd7f6] shadow-[0_0_24px_rgba(76,215,246,0.3)]'
                : 'border-white/10 hover:border-[#4cd7f6]/50'
            }`}
          >
            <div className="absolute -top-12 -left-12 w-44 h-44 rounded-full bg-[#4cd7f6]/15 blur-3xl pointer-events-none group-hover:bg-[#4cd7f6]/25 transition-all" />
            <div className="relative z-10 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 bg-[#0B0F19]/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/5">
                  <span className="w-2 h-2 rounded-full bg-[#4cd7f6] animate-pulse" />
                  <span className="text-xs font-black text-[#4cd7f6] tracking-wider uppercase">
                    DOĞRULUK
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-[#4cd7f6]/10 px-2.5 py-0.5 rounded-full">
                  <Lock className="w-3 h-3 text-[#4cd7f6]" />
                  <span className="text-[10px] font-black text-[#4cd7f6] uppercase tracking-wider">
                    İtiraf Odası
                  </span>
                </div>
              </div>

              <div className="py-1">
                <p
                  className={`text-sm sm:text-base font-semibold text-white leading-relaxed min-h-[52px] transition-opacity duration-200 ${
                    isAnimating ? 'opacity-0' : 'opacity-100'
                  }`}
                >
                  “{truths[tIndex % (truths?.length || 1)] || truths?.[0] || 'Doğruluk sorusu seçiliyor...'}”
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4cd7f6]" /> Dürüstçe Cevapla
                </span>
                <button
                  onClick={handleTruthDone}
                  className="h-9 px-4 rounded-full bg-[#4cd7f6] text-black font-black text-xs flex items-center gap-1.5 shadow-[0_0_18px_rgba(76,215,246,0.4)] hover:brightness-110 active:scale-95 transition-all"
                  type="button"
                >
                  <span>İtirafı Yaptı (+5 Puan)</span>
                  <ArrowRight className="w-3.5 h-3.5 text-black stroke-[2.5]" />
                </button>
              </div>
            </div>
          </div>

          {/* DARE CARD (Neon Pink / Electric Magenta) */}
          <div
            className={`group relative w-full bg-[#111827] border rounded-2xl p-4 shadow-xl transition-all duration-300 overflow-hidden select-none ${
              selectedCardType === 'dare'
                ? 'border-[#f751a1] ring-1 ring-[#f751a1] shadow-[0_0_24px_rgba(247,81,161,0.35)]'
                : 'border-white/10 hover:border-[#f751a1]/50'
            }`}
          >
            <div className="absolute -bottom-12 -right-12 w-44 h-44 rounded-full bg-[#f751a1]/20 blur-3xl pointer-events-none group-hover:bg-[#f751a1]/35 transition-all" />
            <div className="relative z-10 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 bg-[#0B0F19]/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/5">
                  <span className="w-2 h-2 rounded-full bg-[#f751a1] animate-pulse" />
                  <span className="text-xs font-black text-[#ffb0cd] tracking-wider uppercase">
                    CESARET
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-[#f751a1]/15 px-2.5 py-0.5 rounded-full">
                  <Timer className="w-3 h-3 text-[#ffb0cd]" />
                  <span className="text-[10px] font-black text-[#ffb0cd] uppercase tracking-wider">
                    30 Saniye Limit
                  </span>
                </div>
              </div>

              <div className="py-1">
                <p
                  className={`text-sm sm:text-base font-semibold text-white leading-relaxed min-h-[52px] transition-opacity duration-200 ${
                    isAnimating ? 'opacity-0' : 'opacity-100'
                  }`}
                >
                  “{dares[dIndex % (dares?.length || 1)] || dares?.[0] || 'Cesaret görevi seçiliyor...'}”
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/5">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-[#f751a1]" /> Masanın Önünde Yap
                </span>

                <button
                  onClick={handleStartDare}
                  className="h-9 px-4 rounded-full bg-[#f751a1] text-white font-black text-xs flex items-center gap-1.5 shadow-[0_0_20px_rgba(247,81,161,0.45)] hover:brightness-110 active:scale-95 transition-all"
                  type="button"
                >
                  <span>30sn Süreyi Başlat</span>
                  <Play className="w-3.5 h-3.5 fill-white" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ================= ACTIVE DARE 30-SECOND COUNTDOWN PANEL ================= */}
        {isDareTimerActive && (
          <section className="p-4 rounded-2xl bg-[#0a0e18] border-2 border-[#f751a1] flex flex-col gap-3 shadow-[0_0_30px_rgba(247,81,161,0.3)] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-pink-500/20 text-[#f751a1] border border-[#f751a1]/40 flex items-center justify-center font-mono font-black text-2xl animate-pulse">
                  {dareTimer}s
                </div>
                <div>
                  <span className="text-sm font-black text-white block">
                    Cesaret Süresi Devam Ediyor!
                  </span>
                  <span className="text-xs text-gray-400">
                    {currentPlayer.name} görevi yerine getiriyor...
                  </span>
                </div>
              </div>

              {/* Progress bar visual */}
              <div className="w-24 bg-white/10 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#bef264] to-[#f751a1] h-full transition-all duration-1000 ease-linear"
                  style={{ width: `${(dareTimer / 30) * 100}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-white/10">
              <button
                onClick={handleDareForfeit}
                className="py-2.5 rounded-xl bg-[#111827] hover:bg-red-950/40 border border-white/10 text-red-400 text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-1"
                type="button"
              >
                <Ban className="w-4 h-4" />
                <span>Pes Etti (Ceza)</span>
              </button>

              <button
                onClick={handleDareSuccess}
                className="py-2.5 rounded-xl bg-[#bef264] hover:brightness-110 text-black text-xs font-black shadow-[0_0_16px_rgba(190,242,100,0.4)] active:scale-95 transition-all flex items-center justify-center gap-1"
                type="button"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Görevi Başardı (+10)</span>
              </button>
            </div>
          </section>
        )}

        {/* ================= CONTROLS ACTION BAR ================= */}
        <section className="w-full flex flex-col gap-2 pt-1">
          <div className="grid grid-cols-2 gap-2">
            {/* Reroll questions */}
            <button
              onClick={rerollDeck}
              className="w-full h-11 rounded-full bg-[#111827] hover:bg-[#1E293B] border border-white/10 active:scale-95 transition-all flex items-center justify-center gap-1.5 text-gray-200 shadow-md font-bold text-xs"
              type="button"
            >
              <RotateCw className="w-4 h-4 text-[#4cd7f6]" />
              <span>Yeni Soru Çek</span>
            </button>

            {/* Skip / Penalty */}
            <button
              onClick={handleSkipOrPenalty}
              className="w-full h-11 rounded-full bg-[#111827] hover:bg-red-950/30 border border-white/10 active:scale-95 transition-all flex items-center justify-center gap-1.5 text-red-400 shadow-md font-bold text-xs"
              type="button"
            >
              <Ban className="w-4 h-4 text-red-400" />
              <span>{passCount > 0 ? 'Pas Kullan' : 'Pas / Ceza Borçlan'}</span>
            </button>
          </div>

          {/* Group Approval Big Action */}
          <button
            onClick={handleGroupApproval}
            className="w-full h-12 rounded-full bg-gradient-to-r from-[#bef264] via-emerald-400 to-[#bef264] text-black font-black text-sm shadow-[0_0_24px_rgba(190,242,100,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 hover:brightness-105"
            type="button"
          >
            <ThumbsUp className="w-5 h-5 fill-black" />
            <span>Grubun Onayı (+10 Puan)</span>
          </button>
        </section>

        {/* ================= LIVE ROOM TABLE PARTICIPANTS ================= */}
        <section className="w-full bg-[#111827]/80 border border-white/10 rounded-2xl p-3 flex flex-col gap-2 shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider flex items-center gap-1">
              <Users className="w-3 h-3 text-[#4cd7f6]" /> Masadaki Oyuncular ({players.length} Kişi)
            </span>
            <span className="text-[10px] font-bold text-[#10B981] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              Senkronize
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto py-1 no-scrollbar">
            {players.map((player, idx) => {
              const isSelected = idx === activePlayerIdx;
              return (
                <button
                  key={player.id}
                  onClick={() => {
                    soundEngine.playClick();
                    soundEngine.triggerHaptic('tap');
                    setActivePlayerIdx(idx);
                    setSelectedCardType(null);
                    if (isDareTimerActive) {
                      setIsDareTimerActive(false);
                      setDareTimer(30);
                    }
                    onShowToast(`🎯 Sıradaki: ${player.name}`);
                  }}
                  className={`flex items-center gap-1.5 shrink-0 px-3 py-1.5 rounded-full text-xs transition-all ${
                    isSelected
                      ? 'bg-[#0B0F19] border border-[#bef264] shadow-[0_0_12px_rgba(190,242,100,0.3)] text-white font-black'
                      : 'bg-[#1E293B]/70 border border-white/5 text-gray-300 hover:text-white font-medium'
                  }`}
                  type="button"
                >
                  <img
                    src={player.avatar}
                    alt={player.name}
                    className="w-5 h-5 rounded-full object-cover ring-1 ring-white/20"
                  />
                  <span>{player.name}</span>
                  <span className="text-[10px] text-[#bef264] font-bold">({player.score}p)</span>
                  {isSelected && (
                    <span className="text-[9px] text-[#bef264] font-black uppercase">
                      (Sırada)
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </section>

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

      {/* ================= RULES / HOW TO PLAY MODAL ================= */}
      {showRulesInfo && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#111827] border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#bef264]/20 text-[#bef264] flex items-center justify-center">
                  <Flame className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-white">Nasıl Oynanır?</h3>
              </div>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowRulesInfo(false);
                }}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white"
                type="button"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-gray-300 leading-relaxed">
              <div className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-[#4cd7f6]/20 text-[#4cd7f6] font-black flex items-center justify-center shrink-0">1</span>
                <p>
                  <strong className="text-white">Seçim Yap:</strong> Sırası gelen oyuncu masanın önünde <strong className="text-[#4cd7f6]">Doğruluk</strong> ya da <strong className="text-[#f751a1]">Cesaret</strong> kartını seçer.
                </p>
              </div>

              <div className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-[#bef264]/20 text-[#bef264] font-black flex items-center justify-center shrink-0">2</span>
                <p>
                  <strong className="text-white">Doğruluk İtirafı:</strong> Soruya karşı dürüst yanıt verirse masa onayıyla <strong className="text-[#bef264]">+5 Puan</strong> kazanır.
                </p>
              </div>

              <div className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-[#f751a1]/20 text-[#f751a1] font-black flex items-center justify-center shrink-0">3</span>
                <p>
                  <strong className="text-white">Cesaret Görevi:</strong> 30 saniyelik sayaç başlar. Görev başarıyla tamamlanırsa <strong className="text-[#bef264]">+10 Puan</strong> kazanılır.
                </p>
              </div>

              <div className="flex gap-2">
                <span className="w-5 h-5 rounded-full bg-[#F59E0B]/20 text-[#F59E0B] font-black flex items-center justify-center shrink-0">4</span>
                <p>
                  <strong className="text-white">Pas &amp; Ceza:</strong> Her oyuncunun tur başına 1 pas hakkı vardır. Pas hakkı bittiğinde reddeden kişi masaya içecek, kahve veya tatlı ısmarlama cezası borçlanır!
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                setShowRulesInfo(false);
              }}
              className="w-full py-2.5 rounded-xl bg-[#bef264] text-black font-black text-xs hover:brightness-110 active:scale-95 transition-all mt-1"
              type="button"
            >
              Anladım, Oyuna Dön 🎮
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};
