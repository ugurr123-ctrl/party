import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Camera,
  RotateCcw,
  AlertTriangle,
  Flame,
  Crown,
  Eye,
  EyeOff,
  Clock,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { soundEngine } from '../../utils/audio';
import { TablePlayer, loadTablePlayers } from '../../utils/playerManager';
import { GALLERY_ROULETTE_DARES } from '../../data/vipGamesData';

interface VipGalleryRouletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const VipGalleryRouletteModal: React.FC<VipGalleryRouletteModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const [players, setPlayers] = useState<TablePlayer[]>([]);
  const [victimIdx, setVictimIdx] = useState(0);
  const [dareIdx, setDareIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isRevealed, setIsRevealed] = useState(false);
  const [isCompleted, setIsCompleted] = useState<'revealed' | 'penalty' | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      const currentPlayers = loadTablePlayers();
      setPlayers(currentPlayers);
      setVictimIdx(Math.floor(Math.random() * (currentPlayers.length || 1)));
      setDareIdx(Math.floor(Math.random() * GALLERY_ROULETTE_DARES.length));
      setTimeLeft(20);
      setIsRevealed(false);
      setIsCompleted(null);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && timeLeft > 0 && !isCompleted) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            soundEngine.playBuzzer();
            soundEngine.triggerHaptic('alert');
            onShowToast('⏱️ Galeri süresi doldu! Ceza devreye girdi.');
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
  }, [isOpen, timeLeft, isCompleted]);

  if (!isOpen) return null;

  const currentVictim = players[victimIdx]?.name || 'Can T.';
  const currentDare = GALLERY_ROULETTE_DARES[dareIdx];

  const handleNextDare = () => {
    soundEngine.playClick();
    setDareIdx((prev) => (prev + 1) % GALLERY_ROULETTE_DARES.length);
    setVictimIdx((prev) => (prev + 1) % Math.max(1, players.length));
    setTimeLeft(20);
    setIsRevealed(false);
    setIsCompleted(null);
  };

  const handleMirrorReveal = () => {
    soundEngine.playVictory();
    soundEngine.triggerHaptic('win');
    setIsRevealed(true);
    setIsCompleted('revealed');
    onShowToast(`📸 ${currentVictim} cesaret gösterdi ve fotoğrafı masaya açtı!`);
  };

  const handlePenaltyCard = () => {
    soundEngine.playBuzzer();
    soundEngine.triggerHaptic('alert');
    setIsCompleted('penalty');
    onShowToast(`🔥 Ceza kabul edildi! ${currentVictim} masaya içecek ısmarlıyor veya ceza çekiyor.`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden">
      <div className="relative w-full max-w-lg h-[88dvh] sm:h-[92vh] max-h-[850px] bg-[#0a0e18] border border-pink-500/30 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        
        {/* Top Header */}
        <div className="shrink-0 p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between bg-[#111827]/90 backdrop-blur-md z-20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-pink-400 animate-pulse shadow-[0_0_8px_#f472b6]" />
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-pink-400/10 border border-pink-400/30 text-pink-300 text-[10px] font-black uppercase tracking-wider">
              <Crown className="w-3 h-3 text-pink-400" />
              <span>VIP #5 · GALERİ RULETİ</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono font-black px-2.5 py-1 rounded-xl border ${
              timeLeft <= 5 ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse' : 'bg-white/10 border-white/10 text-pink-300'
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
          
          {/* Victim Banner */}
          <div className="p-3 rounded-2xl bg-[#111827] border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-pink-500/20 border border-pink-500/40 flex items-center justify-center text-pink-400 font-bold">
                📸
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">SIRADAKİ KURBAN</span>
                <h4 className="text-xs sm:text-sm font-black text-white">{currentVictim} (Hedefte)</h4>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30 uppercase">
              {currentDare.danger} RİSK
            </span>
          </div>

          {/* Gallery Radar Target Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-950/30 via-[#171b26] to-[#111827] border border-pink-500/40 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-pink-300 uppercase">
              <span>GALERİ RADARI DEVREDE</span>
              <span className="text-amber-400">ÖZEL DOSYA YAKALANDI</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-wide">
              🎯 HEDEF: “{currentDare.target}”
            </h3>
            <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
              {currentDare.desc}
            </p>
          </div>

          {/* Simulated Photo Viewport */}
          <div className="relative w-full h-52 sm:h-56 rounded-2xl bg-[#0a0e18] border border-white/10 overflow-hidden flex flex-col items-center justify-center p-4 text-center">
            {isRevealed ? (
              <div className="space-y-2 animate-in zoom-in-95 duration-200">
                <span className="text-4xl">🔓</span>
                <h4 className="text-sm font-black text-emerald-400">EKRAN MASAYA AÇILDI</h4>
                <p className="text-xs text-gray-300 max-w-xs">
                  {currentVictim} hedeflenen fotoğrafı masadakilere başarıyla gösterdi!
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-pink-400 mx-auto">
                  <Camera className="w-6 h-6" />
                </div>
                <h4 className="text-xs font-black text-gray-300">TELEFON EKRANI KORUMALI</h4>
                <p className="text-[11px] text-gray-400 max-w-xs">
                  Fotoğrafı masaya göstermek için aşağıdaki butona basın veya ceza kartı çekin.
                </p>
              </div>
            )}
          </div>

          {/* Two Action Choice Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={handleMirrorReveal}
              className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center transition-all active:scale-95 ${
                isCompleted === 'revealed'
                  ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-[0_0_15px_rgba(52,211,153,0.3)]'
                  : 'bg-[#111827] border-white/10 hover:border-pink-500/40 text-gray-200'
              }`}
            >
              <Eye className="w-5 h-5 text-pink-400 mb-1" />
              <span className="text-xs font-black">Masaya Aç</span>
              <span className="text-[10px] text-pink-400 font-bold mt-0.5">Cesaret (+50 Puan)</span>
            </button>

            <button
              onClick={handlePenaltyCard}
              className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-center transition-all active:scale-95 ${
                isCompleted === 'penalty'
                  ? 'bg-red-500/20 border-red-500 text-red-300 shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                  : 'bg-[#111827] border-white/10 hover:border-red-500/40 text-gray-200'
              }`}
            >
              <Flame className="w-5 h-5 text-red-400 mb-1" />
              <span className="text-xs font-black">Ceza Çek</span>
              <span className="text-[10px] text-red-400 font-bold mt-0.5">Gösterme & İçecek</span>
            </button>
          </div>

          {/* Anti-Overflow Spacer */}
          <div className="h-10 w-full shrink-0 pointer-events-none" />
        </div>

        {/* Sticky Action Footer */}
        <div className="shrink-0 p-3 sm:p-4 bg-[#0a0e18]/95 backdrop-blur-md border-t border-white/10 pb-safe z-20 flex gap-2">
          <button
            onClick={handleNextDare}
            className="flex-1 py-3.5 rounded-xl bg-[#bef264] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(190,242,100,0.3)] active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Sıradaki Kurban & Görev ➔</span>
          </button>
        </div>

      </div>
    </div>
  );
};
