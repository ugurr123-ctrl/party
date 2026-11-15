import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Receipt,
  RotateCcw,
  Crown,
  Flame,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Sparkles,
  DollarSign
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../../utils/audio';
import { TablePlayer, loadTablePlayers } from '../../utils/playerManager';

interface VipBillRouletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

interface BillCard {
  id: string;
  name: string;
  avatar: string;
  isEliminated: boolean; // true = safe!
  isVictim: boolean; // true = pays!
}

export const VipBillRouletteModal: React.FC<VipBillRouletteModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const [billAmount, setBillAmount] = useState('840,00');
  const [isEditingBill, setIsEditingBill] = useState(false);
  const [cards, setCards] = useState<BillCard[]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState<number | null>(null);
  const [finalVictim, setFinalVictim] = useState<BillCard | null>(null);

  useEffect(() => {
    if (isOpen) {
      const players = loadTablePlayers();
      const initialCards: BillCard[] = players.map((p) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        isEliminated: false,
        isVictim: false
      }));
      setCards(initialCards);
      setIsSpinning(false);
      setHighlightIdx(null);
      setFinalVictim(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const remainingCards = cards.filter((c) => !c.isEliminated);

  const handleEliminateOne = () => {
    if (isSpinning || remainingCards.length <= 1) return;
    setIsSpinning(true);
    soundEngine.playClick();
    soundEngine.triggerHaptic('touch');

    let counter = 0;
    const maxSteps = 16 + Math.floor(Math.random() * 8);
    const interval = setInterval(() => {
      counter++;
      const randIdx = Math.floor(Math.random() * remainingCards.length);
      setHighlightIdx(randIdx);
      soundEngine.playWheelTick();

      if (counter >= maxSteps) {
        clearInterval(interval);
        setIsSpinning(false);
        setHighlightIdx(null);

        // One card becomes safe (eliminated from danger)
        const safeCard = remainingCards[randIdx];
        setCards((prev) =>
          prev.map((c) => (c.id === safeCard.id ? { ...c, isEliminated: true } : c))
        );

        soundEngine.playVictory();
        onShowToast(`🛡️ ${safeCard.name} GÜVENDE! Hesaptan kurtuldu.`);

        // Check if only 1 card left
        const nowRemaining = remainingCards.filter((c) => c.id !== safeCard.id);
        if (nowRemaining.length === 1) {
          const victim = nowRemaining[0];
          setCards((prev) =>
            prev.map((c) => (c.id === victim.id ? { ...c, isVictim: true } : c))
          );
          setFinalVictim(victim);
          soundEngine.playBuzzer();
          soundEngine.triggerHaptic('alert');
          try {
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
          } catch {
            // ignore
          }
          onShowToast(`💸 HESAP KİLİTLENDİ! Masanın adisyonu ${victim.name} tarafından ödeniyor!`);
        }
      }
    }, 100);
  };

  const handleInstantPick = () => {
    if (isSpinning || remainingCards.length === 0) return;
    setIsSpinning(true);
    soundEngine.playClick();
    soundEngine.triggerHaptic('touch');

    let counter = 0;
    const maxSteps = 20;
    const interval = setInterval(() => {
      counter++;
      const randIdx = Math.floor(Math.random() * cards.length);
      setHighlightIdx(randIdx);
      soundEngine.playWheelTick();

      if (counter >= maxSteps) {
        clearInterval(interval);
        setIsSpinning(false);
        const unlucky = cards[randIdx];
        setCards((prev) =>
          prev.map((c) =>
            c.id === unlucky.id ? { ...c, isVictim: true } : { ...c, isEliminated: true }
          )
        );
        setFinalVictim(unlucky);
        soundEngine.playBuzzer();
        soundEngine.triggerHaptic('alert');
        onShowToast(`💸 ANINDA ÇEKİLİŞ: Hesabı ${unlucky.name} ödüyor!`);
      }
    }, 90);
  };

  const handleResetCards = () => {
    soundEngine.playClick();
    const players = loadTablePlayers();
    setCards(
      players.map((p) => ({
        id: p.id,
        name: p.name,
        avatar: p.avatar,
        isEliminated: false,
        isVictim: false
      }))
    );
    setFinalVictim(null);
    setHighlightIdx(null);
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
              <span>VIP #10 · HESAP RULETİ</span>
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

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3 pb-24 no-scrollbar space-y-3.5">
          
          {/* Active Table Receipt Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/20 via-[#171b26] to-[#111827] border border-amber-500/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">AKTİF MASA ADİSYONU</span>
                {isEditingBill ? (
                  <input
                    type="text"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    onBlur={() => setIsEditingBill(false)}
                    autoFocus
                    className="bg-black/60 border border-amber-400 rounded px-2 py-0.5 text-base font-black text-amber-300 font-mono w-28 outline-none"
                  />
                ) : (
                  <h3
                    onClick={() => setIsEditingBill(true)}
                    className="text-lg font-mono font-black text-amber-300 cursor-pointer hover:underline"
                    title="Tutarı Değiştirmek İçin Dokun"
                  >
                    ₺{billAmount}
                  </h3>
                )}
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-mono border border-amber-500/30">
              {remainingCards.length} Kart Tehlikede
            </span>
          </div>

          {/* Victim Locked Banner */}
          {finalVictim && (
            <div className="p-4 rounded-2xl bg-gradient-to-b from-red-950/40 to-[#111827] border-2 border-red-500 shadow-2xl text-center space-y-1.5 animate-in zoom-in-95 duration-200">
              <span className="text-3xl">💸</span>
              <h3 className="text-base sm:text-lg font-black text-white">
                HESAP {finalVictim.name.toUpperCase()} KARTINA KİTLENDİ!
              </h3>
              <p className="text-xs text-red-300">
                Masanın toplam ₺{billAmount} adisyonunu ödeme sırası onda! Afiyet olsun!
              </p>
            </div>
          )}

          {/* Cards Grid */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-black text-gray-400 uppercase tracking-wider">
              <span>Masadaki Kredi Kartları / Jetonlar</span>
              <button
                onClick={handleResetCards}
                className="text-amber-400 hover:underline flex items-center gap-1 font-bold text-[10px]"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Kartları Sıfırla</span>
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {cards.map((c, idx) => {
                const isHighlighted = highlightIdx === idx;
                return (
                  <div
                    key={c.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center gap-2.5 ${
                      c.isVictim
                        ? 'bg-red-500/30 border-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse'
                        : c.isEliminated
                        ? 'bg-emerald-500/10 border-emerald-500/30 opacity-60 text-emerald-300'
                        : isHighlighted
                        ? 'bg-amber-400/30 border-amber-400 text-white shadow-[0_0_15px_rgba(245,158,11,0.5)] scale-105'
                        : 'bg-[#111827] border-white/10 text-gray-200'
                    }`}
                  >
                    <img
                      src={c.avatar}
                      alt={c.name}
                      className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/10"
                    />
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-black truncate block">{c.name}</span>
                      <span className="text-[10px] font-mono">
                        {c.isVictim ? '💸 HESAP ÖDEYECEK' : c.isEliminated ? '✅ GÜVENDE' : 'Tehlikede'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Instant Split Option */}
          <div className="p-3 rounded-2xl bg-[#111827] border border-white/10 flex items-center justify-between">
            <span className="text-xs text-gray-300 font-bold">Alternatif: Anında Kurban Seç</span>
            <button
              onClick={handleInstantPick}
              disabled={isSpinning || Boolean(finalVictim)}
              className="px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/40 text-purple-300 font-bold text-xs active:scale-95 transition-all"
            >
              Tek Çekiliş
            </button>
          </div>

          {/* Anti-Overflow Spacer */}
          <div className="h-10 w-full shrink-0 pointer-events-none" />
        </div>

        {/* Sticky Action Footer */}
        <div className="shrink-0 p-3 sm:p-4 bg-[#0a0e18]/95 backdrop-blur-md border-t border-white/10 pb-safe z-20 flex gap-2">
          {finalVictim ? (
            <button
              onClick={handleResetCards}
              className="flex-1 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(190,242,100,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2 bg-[#bef264] text-black"
            >
              <RotateCcw className="w-4 h-4 stroke-[2.5]" />
              <span>YENİ HESAP ÇEKİLİŞİ BAŞLAT</span>
            </button>
          ) : (
            <button
              onClick={handleEliminateOne}
              disabled={isSpinning || remainingCards.length <= 1}
              className={`flex-1 py-3.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 ${
                isSpinning || remainingCards.length <= 1
                  ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-400 to-yellow-300 text-black shadow-[0_0_20px_rgba(245,158,11,0.4)]'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>KART ÇEK / ÇEVİR (1 KİŞİ KURTULSUN) ⚡</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
