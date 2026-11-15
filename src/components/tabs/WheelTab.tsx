import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../../utils/audio';
import {
  RotateCw,
  Zap,
  Sparkles,
  Shuffle,
  Trash2,
  Plus,
  X,
  History,
  Lightbulb,
  PartyPopper,
  Sliders,
  Check
} from 'lucide-react';

interface WheelTabProps {
  onShowToast?: (msg: string) => void;
}

const SEGMENT_COLORS = [
  '#f751a1', // Pink
  '#009eb9', // Tertiary Cyan
  '#C4F442', // Cyber Lime
  '#d0bcff', // Secondary Purple
  '#F59E0B', // Amber
  '#571bc1', // Deep Violet
  '#10B981', // Emerald
  '#ffb0cd'  // Soft Rose
];

const PRESETS: Record<string, { label: string; icon: string; items: string[] }> = {
  food: {
    label: 'Ne Yesek?',
    icon: '🍕',
    items: [
      'Pizza Söyle 🍕',
      'Tavuk Döner 🌯',
      'Burger Menü 🍔',
      'Evde Makarna 🍝',
      'Suşi & Asya 🍣',
      'Tatlı Ismarla 🍩',
      'Çorba İç 🥣',
      'Herkes Kendine 🥡'
    ]
  },
  dare: {
    label: 'Komik Ceza',
    icon: '🤪',
    items: [
      'En son mesajı oku 📱',
      '30 sn amuda kalk 🤸',
      'Komik ses tonu yap 🤡',
      'Birine iltifat et 💖',
      'Masadakilere su getir 🥤',
      '1 tur sus 🤐'
    ]
  },
  movie: {
    label: 'Film Türü',
    icon: '🎬',
    items: [
      'Gerilim & Korku 👻',
      'Bilim Kurgu 🚀',
      'Absürt Komedi 😂',
      'Aksiyon & Macera 💥',
      'Kore Dizisi 🎭',
      'Nostalji Klasik 🎞️'
    ]
  },
  drinks: {
    label: 'İçecek Ismarla',
    icon: '🍻',
    items: [
      'Kahve Ismarla ☕',
      'Buzlu Çay 🧋',
      'Soğuk Meyve Suyu 🍹',
      'Maden Suyu & Limon 🍋',
      'Herkes Çay koysun 🍵'
    ]
  },
  who: {
    label: 'Sıradaki Kim?',
    icon: '👑',
    items: [
      'Hesabı ödeyen 💳',
      'Sıradaki DJ 🎧',
      'Oyunu başlatan 🕹️',
      'Atıştırmalık alan 🍿',
      'İlk konuşan 🗣️'
    ]
  }
};

interface HistoryItem {
  id: string;
  text: string;
  timeStr: string;
}

export const WheelTab: React.FC<WheelTabProps> = ({ onShowToast }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const [activePreset, setActivePreset] = useState<string>('food');
  const [slices, setSlices] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('parti_kutusu_wheel_slices');
      return saved ? JSON.parse(saved) : PRESETS.food.items;
    } catch {
      return PRESETS.food.items;
    }
  });

  const [currentRotation, setCurrentRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [autoRemove, setAutoRemove] = useState(false);
  const [newSliceInput, setNewSliceInput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([
    { id: 'h-1', text: 'Burger Menü 🍔', timeStr: '2 dk önce' },
    { id: 'h-2', text: 'Tatlı Ismarla 🍩', timeStr: '7 dk önce' }
  ]);

  // Persist slices
  useEffect(() => {
    try {
      localStorage.setItem('parti_kutusu_wheel_slices', JSON.stringify(slices));
    } catch {
      // ignore
    }
  }, [slices]);

  // Draw wheel on canvas
  const drawWheel = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const numSlices = slices.length;
    const width = canvas.width;
    const height = canvas.height;
    const center = width / 2;
    const radius = center - 8;

    ctx.clearRect(0, 0, width, height);

    if (numSlices === 0) {
      ctx.fillStyle = '#1c1f2a';
      ctx.beginPath();
      ctx.arc(center, center, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#debec8';
      ctx.font = 'bold 24px "Outfit", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('Seçenek Ekleyin', center, center);
      return;
    }

    const arc = (Math.PI * 2) / numSlices;

    for (let i = 0; i < numSlices; i++) {
      const angle = i * arc;
      const color = SEGMENT_COLORS[i % SEGMENT_COLORS.length];

      // Slice wedge
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, angle, angle + arc);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();

      // Wedge separator border
      ctx.strokeStyle = '#0f131d';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Slice text label
      ctx.save();
      ctx.translate(center, center);
      ctx.rotate(angle + arc / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';

      // Contrast adjustment for text based on slice tone
      const isLight = color === '#C4F442' || color === '#ffb0cd';
      ctx.fillStyle = isLight ? '#0B0F19' : '#FFFFFF';
      ctx.font = 'bold 20px "Outfit", sans-serif';

      // Truncate text if needed
      let text = slices[i];
      if (text.length > 15) text = text.slice(0, 14) + '…';
      ctx.fillText(text, radius - 24, 0);

      ctx.restore();
    }
  }, [slices]);

  useEffect(() => {
    drawWheel();
  }, [drawWheel]);

  // Spin wheel action
  const spin = () => {
    if (isSpinning || slices.length === 0) return;
    setIsSpinning(true);
    setWinner(null);
    soundEngine.playClick();

    // Random spin physics
    const totalSlices = slices.length;
    const arcDegree = 360 / totalSlices;
    const fullRotations = (5 + Math.floor(Math.random() * 4)) * 360; // 5-8 full turns
    const extraRandomDegree = Math.floor(Math.random() * 360);
    const totalDegreeAdded = fullRotations + extraRandomDegree;

    const nextRotation = currentRotation + totalDegreeAdded;
    setCurrentRotation(nextRotation);

    // Audio ticking sound effects during spin
    for (let i = 0; i < 16; i++) {
      setTimeout(() => {
        soundEngine.playWheelTick();
      }, i * 110 + (i * i * 3));
    }

    // Determine winner after spin duration (2.6s)
    setTimeout(() => {
      setIsSpinning(false);
      const normalizedDegree = nextRotation % 360;
      // Arrow is at 270 deg (top). The canvas rotates clockwise.
      const pointerAngle = (360 - normalizedDegree + 270) % 360;
      const winningIndex = Math.floor(pointerAngle / arcDegree) % totalSlices;
      const winningSlice = slices[winningIndex];

      setWinner(winningSlice);
      soundEngine.playVictory();

      // Add to decision history
      setHistory((prev) => [
        { id: `h-${Date.now()}`, text: winningSlice, timeStr: 'Şimdi' },
        ...prev.slice(0, 4)
      ]);

      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {
        // fallback
      }

      if (onShowToast) {
        onShowToast(`🎉 Çarkın Kararı: ${winningSlice}!`);
      }

      // If auto-remove elimination mode is active
      if (autoRemove) {
        setTimeout(() => {
          if (slices.length > 1) {
            setSlices((prev) => prev.filter((_, idx) => idx !== winningIndex));
            if (onShowToast) {
              onShowToast(`"${winningSlice}" çarktan elendi.`);
            }
          }
        }, 1800);
      }
    }, 4500);
  };

  // Shuffle slices
  const handleShuffleSlices = () => {
    if (isSpinning) return;
    soundEngine.playClick();
    setSlices((prev) => [...prev].sort(() => Math.random() - 0.5));
    if (onShowToast) onShowToast('Seçenekler karıştırıldı! 🔀');
  };

  // Add new slice
  const handleAddSlice = (e: React.FormEvent) => {
    e.preventDefault();
    const val = newSliceInput.trim();
    if (val && slices.length < 24) {
      setSlices((prev) => [...prev, val]);
      setNewSliceInput('');
      soundEngine.playSuccess();
      if (onShowToast) onShowToast(`"${val}" çarka eklendi!`);
    }
  };

  // Remove single slice
  const handleRemoveSlice = (index: number) => {
    if (slices.length <= 1) {
      if (onShowToast) onShowToast('En az 1 seçenek kalmalıdır!');
      return;
    }
    soundEngine.playClick();
    setSlices((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Remove current winner from wheel
  const handleRemoveWinnerFromWheel = () => {
    if (!winner || slices.length <= 1) return;
    soundEngine.playClick();
    setSlices((prev) => prev.filter((s) => s !== winner));
    setWinner(null);
    if (onShowToast) onShowToast(`"${winner}" çarktan çıkarıldı.`);
  };

  // Clear all
  const handleClearAll = () => {
    soundEngine.playClick();
    setSlices([]);
    setWinner(null);
    if (onShowToast) onShowToast('Çarktaki tüm dilimler temizlendi.');
  };

  // Select preset
  const handleSelectPreset = (key: string) => {
    if (PRESETS[key]) {
      setActivePreset(key);
      setSlices([...PRESETS[key].items]);
      setWinner(null);
      soundEngine.playClick();
      if (onShowToast) onShowToast(`"${PRESETS[key].label}" şablonu yüklendi.`);
    }
  };

  return (
    <div className="flex-1 flex flex-col w-full pt-1 pb-8 gap-4 select-none">
      {/* Mode & Presets Top Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 shadow-inner">
            <span className="text-[13px] text-[#ec4899] animate-spin">🎡</span>
            <span className="text-[10px] uppercase tracking-wider text-[#ec4899] font-black">
              KARAR ÇARKI
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="px-2.5 py-1 rounded-full bg-lime-400/15 text-[#bef264] text-[10px] font-black flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#bef264] animate-pulse" />
              {slices.length} Seçenek Hazır
            </span>
            <button
              onClick={() => handleSelectPreset('food')}
              type="button"
              className="px-2.5 py-1 rounded-full bg-[#111827] border border-white/10 active:scale-95 transition-all text-cyan-400 text-[10px] font-bold flex items-center gap-1 shadow-sm hover:border-white/20"
            >
              <Zap className="w-3 h-3 text-cyan-400" />
              Şablonlar
            </button>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            Şansını Çevir!
            <span className="inline-block text-lg">✨</span>
          </h1>
          <p className="text-xs text-gray-400 leading-relaxed">
            Seçenekleri belirle, çarkı çevir, kaderine razı ol. İtiraz yok!
          </p>
        </div>
      </div>

      {/* Presets Quick Bar (Horizontal Scroll) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar -mx-4 px-4">
        {Object.entries(PRESETS).map(([key, data]) => {
          const isSelected = activePreset === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => handleSelectPreset(key)}
              className={`px-3.5 py-1.5 rounded-full active:scale-95 transition-all flex items-center gap-1.5 shrink-0 shadow-sm text-xs font-bold border ${
                isSelected
                  ? 'bg-gradient-to-r from-pink-500/30 to-purple-500/20 text-white border-pink-500/40 glow-pink'
                  : 'bg-[#111827] border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              <span>{data.icon}</span>
              <span>{data.label}</span>
            </button>
          );
        })}
      </div>

      {/* Wheel Visual Arena (Central Hero) */}
      <div className="relative w-full aspect-square max-w-[340px] mx-auto flex items-center justify-center mt-1">
        {/* Ambient Neon Halo Layers */}
        <div
          className="absolute inset-2 rounded-full bg-gradient-to-tr from-pink-500/25 via-purple-500/15 to-cyan-500/25 blur-2xl animate-pulse pointer-events-none"
          style={{ animationDuration: '3.5s' }}
        />
        <div className="absolute inset-4 rounded-full bg-[#0a0e17] shadow-[0_0_35px_rgba(247,81,161,0.22)] pointer-events-none" />

        {/* Outer Decorative Arcade Ring */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-b from-[#1e293b] to-[#111827] flex items-center justify-center shadow-[0_12px_32px_rgba(0,0,0,0.8)] border border-white/10 pointer-events-none">
          <div className="absolute inset-1.5 rounded-full bg-[#0a0e17] flex items-center justify-center overflow-hidden">
            <svg className="absolute inset-0 w-full h-full opacity-35" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="48"
                fill="none"
                stroke="currentColor"
                strokeDasharray="1 3"
                strokeWidth="0.5"
                className="text-gray-500"
              />
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="currentColor"
                strokeDasharray="0.5 5.5"
                strokeWidth="0.75"
                className="text-cyan-400/40"
              />
            </svg>
          </div>
        </div>

        {/* Top Neon Indicator Needle / Arrow */}
        <div className="absolute -top-3.5 z-30 flex flex-col items-center drop-shadow-[0_4px_10px_rgba(76,215,246,0.8)] pointer-events-none">
          <div
            className="w-5 h-7 bg-[#4cd7f6]"
            style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }}
          />
          <div className="w-2.5 h-2.5 rounded-full bg-[#bef264] -mt-5 shadow-[0_0_8px_#bef264]" />
        </div>

        {/* Spin Wheel Canvas Container */}
        <div
          ref={wrapperRef}
          id="wheel-wrapper"
          className="relative z-10 w-[84%] h-[84%] rounded-full overflow-hidden shadow-2xl transition-transform"
          style={{
            transform: `rotate(${currentRotation}deg)`,
            transition: isSpinning ? 'transform 2.6s cubic-bezier(0.12, 0.9, 0.18, 1)' : 'none'
          }}
        >
          <canvas
            ref={canvasRef}
            id="wheel-canvas"
            width={600}
            height={600}
            className="w-full h-full block rounded-full"
          />
        </div>

        {/* Center Metallic Hub & Tactile Spin Trigger */}
        <div className="absolute z-20 flex items-center justify-center pointer-events-auto">
          <div className="w-20 h-20 rounded-full bg-gradient-to-b from-[#353944] via-[#111827] to-[#0a0e17] p-1 shadow-[0_8px_20px_rgba(0,0,0,0.9)] flex items-center justify-center border border-white/20">
            <button
              id="center-spin-btn"
              type="button"
              onClick={spin}
              disabled={isSpinning || slices.length === 0}
              className="w-full h-full rounded-full bg-gradient-to-tr from-[#f751a1] via-[#ec4899] to-[#ffb0cd] active:scale-90 transition-transform shadow-[0_0_16px_rgba(247,81,161,0.6)] flex flex-col items-center justify-center group disabled:opacity-50"
              title="Çarkı Çevir"
            >
              <span className="text-[12px] leading-tight font-black text-white tracking-wider uppercase drop-shadow-sm group-hover:scale-105 transition-transform">
                {isSpinning ? '...' : 'ÇEVİR'}
              </span>
              <span className="text-[11px] text-white/90">👆</span>
            </button>
          </div>
        </div>

        {/* Winner Popover Banner */}
        {winner && !isSpinning && (
          <div
            id="winner-modal"
            className="absolute inset-x-2 z-40 bg-[#1e293b]/95 border-2 border-[#bef264] backdrop-blur-xl rounded-3xl p-4 shadow-[0_16px_36px_rgba(0,0,0,0.9)] flex flex-col items-center text-center animate-in zoom-in-95 duration-200 glow-lime"
          >
            <div className="w-10 h-10 rounded-full bg-[#bef264]/20 text-[#bef264] flex items-center justify-center mb-1.5 shadow-[0_0_15px_#bef264] text-xl">
              🎉
            </div>
            <span className="text-[10px] uppercase font-black text-cyan-400 tracking-wider">
              KAZANAN SEÇENEK
            </span>
            <h3 className="text-xl font-black text-white my-1">{winner}</h3>
            <p className="text-xs text-gray-300 mb-3">Kader senin için karar verdi!</p>

            <div className="flex items-center gap-2 w-full">
              <button
                type="button"
                onClick={() => setWinner(null)}
                className="flex-1 py-2.5 rounded-2xl bg-[#bef264] text-black text-xs font-black active:scale-95 transition-transform shadow-md"
              >
                Tamamdır
              </button>
              <button
                type="button"
                onClick={handleRemoveWinnerFromWheel}
                className="py-2.5 px-3 rounded-2xl bg-[#111827] border border-white/10 text-gray-300 hover:text-white text-xs font-bold active:scale-95 transition-transform"
              >
                Çarktan Çıkar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Spin Controls Bar */}
      <div className="flex flex-col gap-2.5 mt-1">
        <div className="flex items-center gap-2">
          {/* Main Electric Launch Button */}
          <button
            id="main-spin-btn"
            type="button"
            onClick={spin}
            disabled={isSpinning || slices.length === 0}
            className="flex-1 h-13 py-3 px-5 rounded-full bg-gradient-to-r from-[#f751a1] via-[#ec4899] to-[#f751a1] text-white font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(247,81,161,0.45)] active:scale-95 transition-transform glow-pink disabled:opacity-50"
          >
            <span className={`text-lg ${isSpinning ? 'animate-spin' : ''}`}>🎰</span>
            <span>{isSpinning ? 'Çark Dönüyor...' : 'Çarkı Hızla Çevir!'}</span>
          </button>

          {/* Shuffle Options Button */}
          <button
            id="shuffle-btn"
            type="button"
            onClick={handleShuffleSlices}
            disabled={isSpinning}
            title="Seçenekleri Karıştır"
            className="w-13 h-13 p-3 rounded-full bg-[#111827] border border-white/10 text-cyan-400 hover:text-white flex items-center justify-center active:scale-95 transition-transform shadow-sm hover:border-white/25"
          >
            <Shuffle className="w-5 h-5" />
          </button>
        </div>

        {/* Elimination Mode Switch Card */}
        <div className="flex items-center justify-between p-3 rounded-2xl bg-[#111827] border border-white/10 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-300">
              <span className="text-sm">♻️</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white">Seçileni Otomatik Kaldır</span>
              <span className="text-[10px] text-gray-400">Tekrarsız eleme usulü karar turu</span>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              id="auto-remove-toggle"
              checked={autoRemove}
              onChange={(e) => setAutoRemove(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#bef264]" />
          </label>
        </div>
      </div>

      {/* Custom Options Management (Çarktaki Dilimler) */}
      <div className="flex flex-col gap-2.5 p-4 rounded-3xl bg-[#111827] border border-white/10 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-black text-white uppercase tracking-wider">
              Çarktaki Dilimler ({slices.length})
            </h2>
          </div>
          {slices.length > 0 && (
            <button
              id="clear-all-btn"
              type="button"
              onClick={handleClearAll}
              className="text-[11px] text-pink-400 hover:underline active:scale-95 transition-transform font-bold"
            >
              Tümünü Temizle
            </button>
          )}
        </div>

        {/* Input Box to Add New Slice */}
        <form onSubmit={handleAddSlice} id="add-slice-form" className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              id="new-slice-input"
              type="text"
              value={newSliceInput}
              onChange={(e) => setNewSliceInput(e.target.value)}
              maxLength={24}
              placeholder="Yeni seçenek yaz..."
              className="w-full h-11 pl-4 pr-3 rounded-full bg-black/40 border border-white/10 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-cyan-400 shadow-inner"
            />
          </div>
          <button
            type="submit"
            className="h-11 px-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white text-xs font-black active:scale-95 transition-transform shadow-sm flex items-center justify-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ekle</span>
          </button>
        </form>

        {/* Slice Chips Flow Grid */}
        <div
          id="slice-chips-container"
          className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto pr-1"
        >
          {slices.map((slice, idx) => {
            const color = SEGMENT_COLORS[idx % SEGMENT_COLORS.length];
            return (
              <div
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/5 text-gray-200 text-xs shadow-inner shrink-0"
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="font-semibold text-xs truncate max-w-[120px]">{slice}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSlice(idx)}
                  className="text-gray-400 hover:text-red-400 ml-0.5 flex items-center justify-center transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          {slices.length === 0 && (
            <div className="w-full text-center py-3 text-xs text-gray-500 italic">
              Çarkta hiç dilim yok. Yukarıdan ekleyin veya şablon seçin.
            </div>
          )}
        </div>
      </div>

      {/* Recent Decisions Log (History) */}
      <div className="flex flex-col gap-2 p-4 rounded-3xl bg-[#111827] border border-white/10 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#bef264]" />
            <span className="text-xs font-black text-white uppercase tracking-wider">
              Son Kararlar
            </span>
          </div>
          <span className="text-[10px] text-gray-400 font-bold">Bu Oturum</span>
        </div>

        <div id="history-list" className="flex flex-col gap-1.5">
          {history.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between py-2 px-3 rounded-xl bg-black/30 border border-white/5 text-gray-200 text-xs animate-in fade-in"
            >
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#bef264] shadow-[0_0_6px_#bef264]" />
                <span className="font-bold text-white">{item.text}</span>
              </div>
              <span className="text-gray-400 text-[10px]">{item.timeStr}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Micro Prompt & Party Mood Advice */}
      <div className="p-3.5 rounded-2xl bg-white/5 border border-white/5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-pink-500/20 text-pink-400 flex items-center justify-center shrink-0">
          <Lightbulb className="w-5 h-5" />
        </div>
        <p className="text-xs text-gray-300 leading-snug">
          Arkadaş grubunda anlaşmazlık mı var? Çarkın verdiği karara herkes uymak zorundadır; kural odur!
        </p>
      </div>

      {/* Dedicated bottom clearance spacer */}
      <div className="h-20 sm:h-24 w-full shrink-0 pointer-events-none" aria-hidden="true" />
    </div>
  );
};
