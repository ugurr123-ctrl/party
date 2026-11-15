import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Brain,
  Zap,
  RotateCcw,
  Sparkles,
  Check,
  Crown,
  Trophy,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../../utils/audio';
import { TablePlayer, loadTablePlayers } from '../../utils/playerManager';
import { TELEPATHY_PROMPTS } from '../../data/vipGamesData';

interface VipTelepathyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const VipTelepathyModal: React.FC<VipTelepathyModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const [players, setPlayers] = useState<TablePlayer[]>([]);
  const [playerAIdx, setPlayerAIdx] = useState(0);
  const [playerBIdx, setPlayerBIdx] = useState(1);
  const [promptIdx, setPromptIdx] = useState(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [hasPlayerASaid, setHasPlayerASaid] = useState(false);
  const [hasPlayerBSaid, setHasPlayerBSaid] = useState(false);
  const [syncStreak, setSyncStreak] = useState(0);
  const [syncPercentage, setSyncPercentage] = useState(98);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      const current = loadTablePlayers();
      setPlayers(current);
      setPlayerAIdx(0);
      setPlayerBIdx(Math.min(1, Math.max(0, current.length - 1)));
      setPromptIdx(Math.floor(Math.random() * TELEPATHY_PROMPTS.length));
      setCountdown(null);
      setHasPlayerASaid(false);
      setHasPlayerBSaid(false);
    }
  }, [isOpen]);

  const playerA = players[playerAIdx]?.name || 'Efe';
  const playerB = players[playerBIdx]?.name || 'Selin';
  const currentPrompt = TELEPATHY_PROMPTS[promptIdx];

  const startCountdown = () => {
    soundEngine.playClick();
    setHasPlayerASaid(false);
    setHasPlayerBSaid(false);
    setCountdown(3);

    let count = 3;
    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        soundEngine.playWheelTick();
        setCountdown(count);
      } else if (count === 0) {
        soundEngine.playVictory();
        setCountdown(0);
      } else {
        clearInterval(interval);
        setCountdown(null);
      }
    }, 900);
  };

  const handleNextPrompt = () => {
    soundEngine.playClick();
    setPromptIdx((prev) => (prev + 1) % TELEPATHY_PROMPTS.length);
    setHasPlayerASaid(false);
    setHasPlayerBSaid(false);
    setCountdown(null);
  };

  const handleMatchSuccess = () => {
    soundEngine.playVictory();
    soundEngine.triggerHaptic('win');
    setSyncStreak((s) => s + 1);
    setSyncPercentage(Math.min(100, syncPercentage + 2));
    try {
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
    onShowToast(`🎉 %100 ZİHİN SENKRONU! ${playerA} ve ${playerB} aynı kelimeyi söyledi!`);
    handleNextPrompt();
  };

  const handleMatchFail = () => {
    soundEngine.playBuzzer();
    soundEngine.triggerHaptic('alert');
    setSyncStreak(0);
    setSyncPercentage(Math.max(60, syncPercentage - 8));
    onShowToast(`💥 Zihinler uyuşmadı! İkisi de masaya ceza çekiyor.`);
    handleNextPrompt();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden">
      <div className="relative w-full max-w-lg h-[88dvh] sm:h-[92vh] max-h-[850px] bg-[#0a0e18] border border-purple-500/30 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        
        {/* Top Header */}
        <div className="shrink-0 p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between bg-[#111827]/90 backdrop-blur-md z-20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse shadow-[0_0_8px_#c084fc]" />
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-400/10 border border-purple-400/30 text-purple-300 text-[10px] font-black uppercase tracking-wider">
              <Crown className="w-3 h-3 text-purple-400" />
              <span>VIP #6 · VIP TELEPATİ</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
              ⚡ %{syncPercentage} Sinyal
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
        <div className="flex-1 overflow-y-auto px-4 py-3 pb-24 no-scrollbar space-y-4">
          
          {/* Duelists Reel */}
          <div className="p-3 rounded-2xl bg-[#111827] border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2 text-center min-w-0 flex-1">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300 font-bold">
                1
              </div>
              <div className="min-w-0 text-left">
                <span className="text-[10px] text-gray-400 block font-mono">1. OYUNCU</span>
                <span className="text-xs font-black text-white truncate block">{playerA}</span>
              </div>
            </div>

            <div className="px-2 text-purple-400 font-black text-xs shrink-0">⚡ VS ⚡</div>

            <div className="flex items-center gap-2 text-center min-w-0 flex-1 justify-end">
              <div className="min-w-0 text-right">
                <span className="text-[10px] text-gray-400 block font-mono">2. OYUNCU</span>
                <span className="text-xs font-black text-white truncate block">{playerB}</span>
              </div>
              <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-300 font-bold">
                2
              </div>
            </div>
          </div>

          {/* Question / Category Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-950/40 via-[#171b26] to-[#111827] border border-purple-500/40 text-center space-y-2">
            <span className="text-[10px] font-mono text-purple-300 uppercase tracking-wider block">
              GİZLİ KATEGORİ KARTI
            </span>
            <h3 className="text-base sm:text-lg font-black text-white leading-snug">
              “{currentPrompt.question}”
            </h3>
            <p className="text-[11px] text-gray-400">
              3-2-1 sayacından sonra ikiniz de aklınıza ilk geleni <b className="text-purple-300">AYNI ANDA</b> yüksek sesle söyleyin!
            </p>
          </div>

          {/* Rapid Countdown & Say Trigger */}
          <div className="flex flex-col items-center justify-center py-2 space-y-3">
            {countdown !== null ? (
              <div className="w-24 h-24 rounded-full border-4 border-purple-500 bg-purple-500/20 flex items-center justify-center text-3xl font-mono font-black text-purple-300 shadow-[0_0_30px_rgba(192,132,252,0.6)] animate-pulse">
                {countdown === 0 ? 'ŞİMDİ!' : countdown}
              </div>
            ) : (
              <button
                onClick={startCountdown}
                className="py-3 px-6 rounded-2xl bg-[#bef264] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(190,242,100,0.3)] active:scale-95 transition-all flex items-center gap-2"
              >
                <Zap className="w-4 h-4 fill-black" />
                <span>3-2-1 Sayacını Başlat</span>
              </button>
            )}
          </div>

          {/* Dual Touch Buzzers */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                soundEngine.playClick();
                setHasPlayerASaid(true);
              }}
              className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center transition-all active:scale-95 ${
                hasPlayerASaid
                  ? 'bg-purple-500/30 border-purple-400 text-purple-300 shadow-[0_0_15px_rgba(192,132,252,0.4)]'
                  : 'bg-[#111827] border-white/10 hover:border-purple-500/40 text-gray-200'
              }`}
            >
              <Brain className="w-6 h-6 text-purple-400 mb-1" />
              <span className="text-xs font-black">{playerA} Butonu</span>
              <span className="text-[10px] text-purple-400 font-bold mt-0.5">
                {hasPlayerASaid ? '✓ SÖYLEDİ' : 'SÖYLEDİM! (DOKUN)'}
              </span>
            </button>

            <button
              onClick={() => {
                soundEngine.playClick();
                setHasPlayerBSaid(true);
              }}
              className={`p-4 rounded-2xl border flex flex-col items-center justify-center text-center transition-all active:scale-95 ${
                hasPlayerBSaid
                  ? 'bg-pink-500/30 border-pink-400 text-pink-300 shadow-[0_0_15px_rgba(244,114,182,0.4)]'
                  : 'bg-[#111827] border-white/10 hover:border-pink-500/40 text-gray-200'
              }`}
            >
              <Brain className="w-6 h-6 text-pink-400 mb-1" />
              <span className="text-xs font-black">{playerB} Butonu</span>
              <span className="text-[10px] text-pink-400 font-bold mt-0.5">
                {hasPlayerBSaid ? '✓ SÖYLEDİ' : 'SÖYLEDİM! (DOKUN)'}
              </span>
            </button>
          </div>

          {/* Table Match Outcome Buttons */}
          <div className="space-y-2 pt-1">
            <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider block">
              Masa Kararı (Kelimeler Eşleşti mi?)
            </span>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={handleMatchSuccess}
                className="py-3 px-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>TUTTU! (+100 PUAN)</span>
              </button>

              <button
                onClick={handleMatchFail}
                className="py-3 px-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all"
              >
                <Flame className="w-4 h-4" />
                <span>PATLADI! (CEZA)</span>
              </button>
            </div>
          </div>

          {/* Anti-Overflow Spacer */}
          <div className="h-10 w-full shrink-0 pointer-events-none" />
        </div>

        {/* Sticky Action Footer */}
        <div className="shrink-0 p-3 sm:p-4 bg-[#0a0e18]/95 backdrop-blur-md border-t border-white/10 pb-safe z-20 flex gap-2">
          <button
            onClick={handleNextPrompt}
            className="flex-1 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Sıradaki Kategori ➔</span>
          </button>
        </div>

      </div>
    </div>
  );
};
