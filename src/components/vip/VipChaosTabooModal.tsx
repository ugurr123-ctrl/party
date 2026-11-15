import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Bomb,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Crown,
  Volume2,
  Flame,
  Zap,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../../utils/audio';
import { CHAOS_TABOO_CARDS } from '../../data/vipGamesData';

interface VipChaosTabooModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const VipChaosTabooModal: React.FC<VipChaosTabooModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const [cardIdx, setCardIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45);
  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [teamBlueScore, setTeamBlueScore] = useState(30);
  const [teamRedScore, setTeamRedScore] = useState(25);
  const [activeTeam, setActiveTeam] = useState<'blue' | 'red'>('blue');

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      setCardIdx(Math.floor(Math.random() * CHAOS_TABOO_CARDS.length));
      setTimeLeft(45);
      setIsTimerRunning(true);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && isTimerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimerRunning(false);
            soundEngine.playBuzzer();
            soundEngine.triggerHaptic('alert');
            onShowToast('⏱️ SÜRE DOLDU! Sıra diğer takıma geçti.');
            return 0;
          }
          if (prev <= 5) soundEngine.playWheelTick();
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, isTimerRunning, timeLeft]);

  if (!isOpen) return null;

  const currentCard = CHAOS_TABOO_CARDS[cardIdx];

  const handleNextCard = () => {
    soundEngine.playClick();
    setCardIdx((prev) => (prev + 1) % CHAOS_TABOO_CARDS.length);
  };

  const handleHitMine = () => {
    soundEngine.playBuzzer();
    soundEngine.triggerHaptic('alert');
    if (activeTeam === 'blue') {
      setTeamBlueScore((s) => Math.max(0, s - 15));
    } else {
      setTeamRedScore((s) => Math.max(0, s - 15));
    }
    onShowToast('💥 MAYINA BASTI! -15 Puan ceza!');
    handleNextCard();
  };

  const handleCorrect = () => {
    soundEngine.playVictory();
    soundEngine.triggerHaptic('win');
    if (activeTeam === 'blue') {
      setTeamBlueScore((s) => s + 10);
    } else {
      setTeamRedScore((s) => s + 10);
    }
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
    onShowToast('🎉 DOĞRU BİLDİ! +10 Puan kazanıldı!');
    handleNextCard();
  };

  const handlePass = () => {
    soundEngine.playClick();
    if (activeTeam === 'blue') {
      setTeamBlueScore((s) => Math.max(0, s - 5));
    } else {
      setTeamRedScore((s) => Math.max(0, s - 5));
    }
    onShowToast('Pas geçildi (-5 Puan)');
    handleNextCard();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden">
      <div className="relative w-full max-w-lg h-[88dvh] sm:h-[92vh] max-h-[850px] bg-[#0a0e18] border border-amber-500/30 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        
        {/* Top Header */}
        <div className="shrink-0 p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between bg-[#111827]/90 backdrop-blur-md z-20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]" />
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-wider">
              <Crown className="w-3 h-3 text-amber-400" />
              <span>VIP #11 · KAOS TABUSU</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono font-black px-2.5 py-1 rounded-xl border ${
              timeLeft <= 8 ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse' : 'bg-white/10 border-white/10 text-amber-300'
            }`}>
              ⏱️ {timeLeft}s
            </span>
            <button
              onClick={() => {
                soundEngine.playClick();
                onClose();
              }}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-all active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 pb-24 no-scrollbar space-y-3.5">
          
          {/* Team Scoreboard Banner */}
          <div className="grid grid-cols-2 gap-2.5">
            <div
              onClick={() => setActiveTeam('blue')}
              className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                activeTeam === 'blue'
                  ? 'bg-blue-500/20 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                  : 'bg-[#111827] border-white/10 opacity-70'
              }`}
            >
              <span className="text-[10px] font-mono text-blue-300 block">MAVİ TAKIM</span>
              <span className="text-base font-black font-mono text-white">{teamBlueScore} Puan</span>
            </div>

            <div
              onClick={() => setActiveTeam('red')}
              className={`p-2.5 rounded-2xl border text-center transition-all cursor-pointer ${
                activeTeam === 'red'
                  ? 'bg-red-500/20 border-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                  : 'bg-[#111827] border-white/10 opacity-70'
              }`}
            >
              <span className="text-[10px] font-mono text-red-300 block">KIRMIZI TAKIM</span>
              <span className="text-base font-black font-mono text-white">{teamRedScore} Puan</span>
            </div>
          </div>

          {/* Target Word Card */}
          <div className="p-5 rounded-3xl bg-gradient-to-b from-[#1c1f2a] to-[#111827] border-2 border-amber-500/40 text-center space-y-2 shadow-xl">
            <div className="flex items-center justify-center gap-1.5 text-[10px] font-mono text-amber-400 uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>HEDEF KELİME · {currentCard.category}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wider text-amber-300">
              {currentCard.target}
            </h2>
          </div>

          {/* Forbidden Mine Words */}
          <div className="p-4 rounded-2xl bg-[#111827] border border-red-500/30 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] font-black uppercase text-red-400 tracking-wider">
              <span className="flex items-center gap-1">
                <Bomb className="w-3.5 h-3.5 text-red-400" />
                <span>Yasak Mayın Kelimeler (Söylemek Yasak!)</span>
              </span>
              <span className="text-[10px] text-gray-400">Rakip Gözetiminde</span>
            </div>

            <div className="space-y-1.5">
              {currentCard.mines.map((mine, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-red-950/20 border border-red-500/20 flex items-center justify-between text-xs font-black text-gray-200"
                >
                  <span>{mine}</span>
                  <span className="text-[10px] text-red-400 font-mono">MAYIN #{idx + 1}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Anti-Overflow Spacer */}
          <div className="h-10 w-full shrink-0 pointer-events-none" />
        </div>

        {/* Sticky Action Footer */}
        <div className="shrink-0 p-3 sm:p-4 bg-[#0a0e18]/95 backdrop-blur-md border-t border-white/10 pb-safe z-20 flex gap-2">
          <button
            onClick={handleHitMine}
            className="flex-1 py-3.5 rounded-xl bg-red-600/90 hover:bg-red-600 text-white font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(239,68,68,0.4)] active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Bomb className="w-4 h-4" />
            <span>MAYIN! (-15)</span>
          </button>

          <button
            onClick={handlePass}
            className="w-16 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-300 font-bold text-xs uppercase tracking-wider active:scale-95 transition-all"
          >
            Pas
          </button>

          <button
            onClick={handleCorrect}
            className="flex-1 py-3.5 rounded-xl bg-[#bef264] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(190,242,100,0.3)] active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            <span>BİLDİ! (+10)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
