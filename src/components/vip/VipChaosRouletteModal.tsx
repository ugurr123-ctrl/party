import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  RotateCw,
  Flame,
  Zap,
  Crown,
  Volume2,
  VolumeX,
  AlertTriangle,
  Sparkles,
  Trophy
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../../utils/audio';
import { TablePlayer, loadTablePlayers } from '../../utils/playerManager';
import { CHAOS_ROULETTE_SEGMENTS } from '../../data/vipGamesData';

interface VipChaosRouletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const VipChaosRouletteModal: React.FC<VipChaosRouletteModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const [players, setPlayers] = useState<TablePlayer[]>([]);
  const [victimIdx, setVictimIdx] = useState(0);
  const [is2xMultiplier, setIs2xMultiplier] = useState(true);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selectedSegment, setSelectedSegment] = useState<typeof CHAOS_ROULETTE_SEGMENTS[0] | null>(null);
  const [spinCount, setSpinCount] = useState(3);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      const currentPlayers = loadTablePlayers();
      setPlayers(currentPlayers);
      setVictimIdx(Math.floor(Math.random() * (currentPlayers.length || 1)));
      setIsSpinning(false);
      setSelectedSegment(null);
      drawWheel(rotation);
    }
  }, [isOpen, rotation]);

  const currentVictim = players[victimIdx]?.name || 'Berk K.';
  const segmentAngle = 360 / CHAOS_ROULETTE_SEGMENTS.length;

  const drawWheel = (currentDeg: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = center - 8;

    ctx.clearRect(0, 0, size, size);

    // Draw Wheel slices
    CHAOS_ROULETTE_SEGMENTS.forEach((seg, idx) => {
      const startAngle = ((idx * segmentAngle + currentDeg) * Math.PI) / 180;
      const endAngle = (((idx + 1) * segmentAngle + currentDeg) * Math.PI) / 180;

      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();

      // Alternate gradients
      ctx.fillStyle = idx % 2 === 0 ? '#111827' : '#1c1f2a';
      ctx.fill();

      ctx.lineWidth = 2;
      ctx.strokeStyle = '#262a35';
      ctx.stroke();

      // Draw segment text
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(startAngle + ((endAngle - startAngle) / 2));
      ctx.textAlign = 'right';
      ctx.fillStyle = seg.color;
      ctx.font = 'bold 9px sans-serif';
      ctx.fillText(seg.text.slice(0, 18), radius - 14, 3);
      ctx.restore();
    });

    // Outer neon ring
    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#f59e0b';
    ctx.shadowColor = '#f59e0b';
    ctx.shadowBlur = 12;
    ctx.stroke();

    // Center Hub
    ctx.beginPath();
    ctx.arc(center, center, 24, 0, Math.PI * 2);
    ctx.fillStyle = '#0a0e18';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();
  };

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setSelectedSegment(null);
    soundEngine.playClick();
    soundEngine.triggerHaptic('touch');

    const totalDegrees = 360 * 5 + Math.floor(Math.random() * 360);
    const targetRotation = rotation + totalDegrees;
    const startTime = Date.now();
    const duration = 3500;
    const startRot = rotation;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutCubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startRot + totalDegrees * ease;
      setRotation(current);
      drawWheel(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        setSpinCount((c) => c + 1);

        // Calculate landed segment
        const normalized = (360 - (current % 360) + 270) % 360;
        const landedIdx = Math.floor(normalized / segmentAngle) % CHAOS_ROULETTE_SEGMENTS.length;
        const result = CHAOS_ROULETTE_SEGMENTS[landedIdx];
        setSelectedSegment(result);

        if (result.text.includes('JACKPOT') || result.text.includes('GÜVENDE')) {
          soundEngine.playVictory();
          try {
            confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
          } catch {
            // ignore
          }
        } else {
          soundEngine.playBuzzer();
          soundEngine.triggerHaptic('alert');
        }

        onShowToast(`🎰 Rulet Durdu: ${result.text}`);
      }
    };

    requestAnimationFrame(animate);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden">
      <div className="relative w-full max-w-lg h-[88dvh] sm:h-[92vh] max-h-[850px] bg-[#0a0e18] border border-amber-500/30 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        
        {/* Top Header */}
        <div className="shrink-0 p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between bg-[#111827]/90 backdrop-blur-md z-20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_8px_#f59e0b]" />
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-300 text-[10px] font-black uppercase tracking-wider">
              <Crown className="w-3 h-3 text-amber-400" />
              <span>VIP #3 · KAOS RULETİ</span>
            </div>
          </div>

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

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 pb-24 no-scrollbar space-y-3">
          
          {/* Victim Banner */}
          <div className="p-3 rounded-2xl bg-[#111827] border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
                🎯
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">SIRADAKİ KURBAN</span>
                <h4 className="text-xs sm:text-sm font-black text-white">{currentVictim} (Cesur Mod)</h4>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 font-mono">
              Ceza #{spinCount}
            </span>
          </div>

          {/* 2x Multiplier Switch */}
          <div className="p-2.5 rounded-2xl bg-gradient-to-r from-red-500/10 via-[#171b26] to-[#111827] border border-red-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <div>
                <span className="text-xs font-black text-white block">2x Çift Ceza / Çift Puan</span>
                <span className="text-[10px] text-gray-400">Rulet sonucundaki etkiyi 2 katına çıkar</span>
              </div>
            </div>
            <button
              onClick={() => {
                soundEngine.playClick();
                setIs2xMultiplier(!is2xMultiplier);
              }}
              className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                is2xMultiplier ? 'bg-[#bef264]' : 'bg-white/20'
              }`}
            >
              <div
                className={`w-5 h-5 rounded-full bg-black shadow transition-transform ${
                  is2xMultiplier ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Wheel Display Container */}
          <div className="relative py-2 flex flex-col items-center justify-center">
            {/* Top Pointer Indicator */}
            <div className="absolute top-0 z-30 flex flex-col items-center pointer-events-none">
              <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[16px] border-t-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            </div>

            <canvas
              ref={canvasRef}
              width={300}
              height={300}
              className="w-64 h-64 sm:w-72 sm:h-72 rounded-full shadow-2xl relative z-10"
            />
          </div>

          {/* Outcome Card */}
          {selectedSegment && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-900/40 via-[#171b26] to-[#111827] border border-amber-500/50 shadow-xl text-center space-y-1.5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-center gap-1.5 text-[10px] font-black text-amber-400 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>KADER KİLİTLENDİ</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white" style={{ color: selectedSegment.color }}>
                {selectedSegment.text}
              </h3>
              <p className="text-xs text-gray-300">
                {is2xMultiplier ? `🔥 2X ETKİ: ${selectedSegment.penalty} x2` : selectedSegment.penalty}
              </p>
            </div>
          )}

          {/* Anti-Overflow Spacer */}
          <div className="h-10 w-full shrink-0 pointer-events-none" />
        </div>

        {/* Sticky Action Footer */}
        <div className="shrink-0 p-3 sm:p-4 bg-[#0a0e18]/95 backdrop-blur-md border-t border-white/10 pb-safe z-20 flex gap-2">
          <button
            onClick={handleSpin}
            disabled={isSpinning}
            className={`flex-1 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${
              isSpinning
                ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-400 to-yellow-300 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]'
            }`}
          >
            <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>{isSpinning ? 'ÇARK DÖNÜYOR...' : 'KADER ÇARKINI ÇEVİR (SPIN) ⚡'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
