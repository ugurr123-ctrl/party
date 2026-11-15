import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Eye,
  EyeOff,
  RotateCcw,
  Trash2,
  Undo2,
  Check,
  Zap,
  Crown,
  Sparkles,
  Flame
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../../utils/audio';
import { TablePlayer, loadTablePlayers } from '../../utils/playerManager';
import { BLIND_DRAWING_TASKS } from '../../data/vipGamesData';

interface VipBlindDrawingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const VipBlindDrawingModal: React.FC<VipBlindDrawingModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const [players, setPlayers] = useState<TablePlayer[]>([]);
  const [currentDrawerIdx, setCurrentDrawerIdx] = useState(0);
  const [taskIdx, setTaskIdx] = useState(0);
  const [isWordRevealed, setIsWordRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeColor, setActiveColor] = useState('#4cd7f6');
  const [strokeHistory, setStrokeHistory] = useState<ImageData[]>([]);
  
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      const currentPlayers = loadTablePlayers();
      setPlayers(currentPlayers);
      setCurrentDrawerIdx(0);
      setTaskIdx(Math.floor(Math.random() * BLIND_DRAWING_TASKS.length));
      setIsWordRevealed(false);
      setTimeLeft(30);
      setIsTimerRunning(true);
      setStrokeHistory([]);

      // Reset canvas after mount
      setTimeout(() => {
        clearCanvas();
      }, 50);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimerRunning(false);
            soundEngine.playBuzzer();
            soundEngine.triggerHaptic('alert');
            onShowToast('⏱️ Süre doldu! Tahminler bitti.');
            return 0;
          }
          if (prev <= 6) {
            soundEngine.playWheelTick();
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, timeLeft]);

  if (!isOpen) return null;

  const currentDrawer = players[currentDrawerIdx]?.name || 'Efe';
  const currentTask = BLIND_DRAWING_TASKS[taskIdx];

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      canvas.width = Math.round(rect.width);
      canvas.height = Math.round(rect.height);
    }
    ctx.fillStyle = '#0a0e18';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setStrokeHistory([]);
  };

  const saveState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setStrokeHistory((prev) => [...prev.slice(-10), data]);
  };

  const handleUndo = () => {
    if (strokeHistory.length === 0) return;
    soundEngine.playClick();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const newHistory = [...strokeHistory];
    newHistory.pop(); // remove current
    const previous = newHistory[newHistory.length - 1];
    if (previous) {
      ctx.putImageData(previous, 0, 0);
      setStrokeHistory(newHistory);
    } else {
      clearCanvas();
    }
  };

  // Canvas drawing handlers (mouse & touch)
  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const isTouchEvent = 'touches' in e;
    const clientX = isTouchEvent
      ? e.touches[0]?.clientX ?? e.changedTouches[0]?.clientX ?? 0
      : e.clientX;
    const clientY = isTouchEvent
      ? e.touches[0]?.clientY ?? e.changedTouches[0]?.clientY ?? 0
      : e.clientY;
    const scaleX = canvas.width / (rect.width || 1);
    const scaleY = canvas.height / (rect.height || 1);
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDrawingRef.current = true;
    saveState();
    const coords = getCoordinates(e);
    lastPosRef.current = coords;
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current || !lastPosRef.current) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const coords = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
    ctx.lineTo(coords.x, coords.y);
    ctx.strokeStyle = activeColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = activeColor;
    ctx.shadowBlur = 10;
    ctx.stroke();

    lastPosRef.current = coords;
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  };

  const handleNextTurn = () => {
    soundEngine.playClick();
    setTaskIdx((prev) => (prev + 1) % BLIND_DRAWING_TASKS.length);
    setCurrentDrawerIdx((prev) => (prev + 1) % Math.max(1, players.length));
    setIsWordRevealed(false);
    setTimeLeft(30);
    setIsTimerRunning(true);
    clearCanvas();
  };

  const handleCorrectGuess = () => {
    soundEngine.playVictory();
    soundEngine.triggerHaptic('win');
    try {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
    onShowToast(`🎉 DOĞRU TAHMİN! +50 Puan kazanıldı!`);
    handleNextTurn();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md overflow-hidden">
      <div className="relative w-full max-w-lg h-[88dvh] sm:h-[92vh] max-h-[850px] bg-[#0a0e18] border border-cyan-500/30 rounded-2xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white">
        
        {/* Top Header */}
        <div className="shrink-0 p-3.5 sm:p-4 border-b border-white/10 flex items-center justify-between bg-[#111827]/90 backdrop-blur-md z-20">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]" />
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/30 text-cyan-300 text-[10px] font-black uppercase tracking-wider">
              <Crown className="w-3 h-3 text-cyan-400" />
              <span>VIP #2 · KÖR ÇİZİM</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono font-black px-2.5 py-1 rounded-xl border ${
              timeLeft <= 5
                ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse'
                : 'bg-white/10 border-white/10 text-cyan-300'
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

        {/* Scrollable Canvas Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 pb-24 no-scrollbar space-y-3">
          
          {/* Drawer Banner */}
          <div className="p-3 rounded-2xl bg-[#111827] border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold">
                🎨
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">ÇİZEN OYUNCU</span>
                <h4 className="text-xs sm:text-sm font-black text-white">{currentDrawer} (Gözleri Kapalı 🙈)</h4>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 font-bold border border-red-500/30">
              Tek Çizgi Modu
            </span>
          </div>

          {/* Secret Word Card */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-purple-900/30 to-[#111827] border border-purple-500/30 flex items-center justify-between">
            <div className="min-w-0 flex-1 pr-2">
              <span className="text-[10px] font-mono text-purple-300 uppercase tracking-wider block">
                VIP Gizli Görev Kartı ({currentTask.hint})
              </span>
              <p className={`text-sm sm:text-base font-black transition-all ${
                isWordRevealed ? 'text-white' : 'text-gray-500 filter blur-sm select-none'
              }`}>
                {currentTask.word}
              </p>
            </div>
            <button
              onClick={() => {
                soundEngine.playClick();
                setIsWordRevealed(!isWordRevealed);
              }}
              className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-300 font-bold text-xs flex items-center gap-1 active:scale-95 transition-all shrink-0"
            >
              {isWordRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{isWordRevealed ? 'Gizle' : 'Aç (Çizen Görsün)'}</span>
            </button>
          </div>

          {/* Canvas Controls Toolbar */}
          <div className="flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-1.5">
              {['#4cd7f6', '#f751a1', '#bef264', '#ffffff'].map((color) => (
                <button
                  key={color}
                  onClick={() => {
                    soundEngine.playClick();
                    setActiveColor(color);
                  }}
                  className={`w-7 h-7 rounded-full border-2 transition-transform active:scale-95 ${
                    activeColor === color ? 'scale-110 border-white shadow-[0_0_10px_white]' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleUndo}
                className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-gray-300 active:scale-95 transition-all"
                title="Geri Al"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  clearCanvas();
                }}
                className="w-8 h-8 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 active:scale-95 transition-all"
                title="Temizle"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Neon Canvas Pad */}
          <div className="w-full h-64 sm:h-72 rounded-2xl bg-[#0a0e18] border border-cyan-500/30 shadow-inner overflow-hidden relative touch-none">
            <canvas
              ref={canvasRef}
              width={400}
              height={320}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              className="w-full h-full cursor-crosshair"
            />
            <div className="absolute bottom-2 right-2 pointer-events-none px-2 py-0.5 rounded-full bg-black/60 border border-white/10 text-[9px] font-mono text-cyan-400">
              NEON GLOW 3.0
            </div>
          </div>

          {/* Guess Buzzer Announcement */}
          <button
            onClick={() => {
              soundEngine.playBuzzer();
              soundEngine.triggerHaptic('alert');
              onShowToast('⚡ MASA BUZZER: BİRİ TAHMİN EDİYOR!');
            }}
            className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-300 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>MASA BUZZER: BİLDİM DİYEN BASSIN!</span>
          </button>

          {/* Anti-Overflow Spacer */}
          <div className="h-10 w-full shrink-0 pointer-events-none" />
        </div>

        {/* Sticky Action Footer */}
        <div className="shrink-0 p-3 sm:p-4 bg-[#0a0e18]/95 backdrop-blur-md border-t border-white/10 pb-safe z-20 flex gap-2">
          <button
            onClick={handleNextTurn}
            className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider active:scale-95 transition-all"
          >
            Pas Geç
          </button>
          <button
            onClick={handleCorrectGuess}
            className="flex-[2] py-3 rounded-xl bg-[#bef264] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(190,242,100,0.3)] active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Doğru Bildi! (+50 Puan)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
