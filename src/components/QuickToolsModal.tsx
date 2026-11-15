import React, { useState, useEffect } from 'react';
import { X, Dices, Coins, Timer, Play, RotateCcw } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface QuickToolsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

const DICE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export const QuickToolsModal: React.FC<QuickToolsModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'dice' | 'coin' | 'timer'>('dice');

  // Dice state
  const [diceCount, setDiceCount] = useState<1 | 2>(1);
  const [dice1, setDice1] = useState(3);
  const [dice2, setDice2] = useState(5);
  const [isRollingDice, setIsRollingDice] = useState(false);

  // Coin state
  const [coinSide, setCoinSide] = useState<'YAZI' | 'TURA'>('YAZI');
  const [isFlippingCoin, setIsFlippingCoin] = useState(false);

  // Timer state
  const [timerSeconds, setTimerSeconds] = useState(30);
  const [initialSeconds, setInitialSeconds] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev <= 4 && prev > 1) {
            soundEngine.playCountdown();
          }
          if (prev <= 1) {
            soundEngine.playBuzzer();
            setIsTimerRunning(false);
            onShowToast('⏰ Süre Doldu!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, onShowToast]);

  if (!isOpen) return null;

  const rollDice = () => {
    if (isRollingDice) return;
    setIsRollingDice(true);
    soundEngine.playDiceRoll();

    let count = 0;
    const interval = setInterval(() => {
      setDice1(Math.floor(Math.random() * 6) + 1);
      setDice2(Math.floor(Math.random() * 6) + 1);
      count++;
      if (count > 10) {
        clearInterval(interval);
        const final1 = Math.floor(Math.random() * 6) + 1;
        const final2 = Math.floor(Math.random() * 6) + 1;
        setDice1(final1);
        setDice2(final2);
        setIsRollingDice(false);
        soundEngine.playClick();
        onShowToast(
          diceCount === 1
            ? `🎲 Zar: ${final1}`
            : `🎲 Zarlar: ${final1} + ${final2} = ${final1 + final2}`
        );
      }
    }, 60);
  };

  const flipCoin = () => {
    if (isFlippingCoin) return;
    setIsFlippingCoin(true);
    soundEngine.playCoinFlip();

    let count = 0;
    const interval = setInterval(() => {
      setCoinSide((prev) => (prev === 'YAZI' ? 'TURA' : 'YAZI'));
      count++;
      if (count > 12) {
        clearInterval(interval);
        const finalResult = Math.random() > 0.5 ? 'YAZI' : 'TURA';
        setCoinSide(finalResult);
        setIsFlippingCoin(false);
        soundEngine.playSuccess();
        onShowToast(`🪙 Sonuç: ${finalResult}!`);
      }
    }, 70);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-white/15 rounded-3xl p-5 w-full max-w-sm shadow-2xl relative text-center">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
          <div className="flex items-center gap-2 text-left">
            <span className="text-xl">🎲</span>
            <div>
              <h3 className="text-base font-black text-white">Hızlı Karar Verici</h3>
              <p className="text-[11px] text-gray-400">Anlaşmazlıkları şansa bırak</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-tool tabs */}
        <div className="flex rounded-xl bg-black/40 p-1 mb-4 border border-white/5">
          <button
            onClick={() => setActiveTab('dice')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'dice' ? 'bg-[#bef264] text-black font-extrabold shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Dices className="w-3.5 h-3.5" />
            Zar At
          </button>
          <button
            onClick={() => setActiveTab('coin')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'coin' ? 'bg-[#bef264] text-black font-extrabold shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            Yazı-Tura
          </button>
          <button
            onClick={() => setActiveTab('timer')}
            className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'timer' ? 'bg-[#bef264] text-black font-extrabold shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            <Timer className="w-3.5 h-3.5" />
            Kronometre
          </button>
        </div>

        {/* DICE TAB */}
        {activeTab === 'dice' && (
          <div className="py-2 space-y-4">
            <div className="flex justify-center items-center gap-3">
              <button
                onClick={() => setDiceCount(1)}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                  diceCount === 1 ? 'border-[#bef264] text-[#bef264] bg-lime-400/10' : 'border-white/10 text-gray-400'
                }`}
              >
                1 Zar
              </button>
              <button
                onClick={() => setDiceCount(2)}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-colors ${
                  diceCount === 2 ? 'border-[#bef264] text-[#bef264] bg-lime-400/10' : 'border-white/10 text-gray-400'
                }`}
              >
                2 Zar (Çift)
              </button>
            </div>

            <div className="flex justify-center items-center gap-4 py-2">
              <div
                className={`w-20 h-20 rounded-2xl bg-white text-gray-900 font-black text-5xl flex items-center justify-center shadow-2xl transition-transform ${
                  isRollingDice ? 'animate-bounce scale-105' : ''
                }`}
              >
                {DICE_FACES[dice1 - 1]}
              </div>

              {diceCount === 2 && (
                <div
                  className={`w-20 h-20 rounded-2xl bg-white text-gray-900 font-black text-5xl flex items-center justify-center shadow-2xl transition-transform ${
                    isRollingDice ? 'animate-bounce delay-75 scale-105' : ''
                  }`}
                >
                  {DICE_FACES[dice2 - 1]}
                </div>
              )}
            </div>

            <div className="text-xs text-gray-400 font-medium">
              {diceCount === 2 ? `Toplam: ${dice1 + dice2}` : `Zar Değeri: ${dice1}`}
            </div>

            <button
              onClick={rollDice}
              disabled={isRollingDice}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#bef264] to-lime-500 text-black font-black text-sm active:scale-95 transition-transform shadow-lg glow-lime disabled:opacity-50"
            >
              {isRollingDice ? 'Zarlar Sallanıyor...' : '🎲 Zarları Fırlat!'}
            </button>
          </div>
        )}

        {/* COIN TAB */}
        {activeTab === 'coin' && (
          <div className="py-2 space-y-4">
            <div className="flex justify-center items-center py-4">
              <div
                className={`w-28 h-28 rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-yellow-600 border-4 border-yellow-200 text-black font-black text-xl flex items-center justify-center shadow-2xl transition-transform duration-200 ${
                  isFlippingCoin ? 'animate-spin scale-90' : 'scale-100 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
                }`}
              >
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-amber-800/40 flex items-center justify-center">
                  <span className="tracking-wider">{coinSide}</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400">Yazı mı Tura mı? Şansına güven!</p>

            <button
              onClick={flipCoin}
              disabled={isFlippingCoin}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 text-black font-black text-sm active:scale-95 transition-transform shadow-lg disabled:opacity-50"
            >
              {isFlippingCoin ? 'Para Havada...' : '🪙 Parayı Havaya At!'}
            </button>
          </div>
        )}

        {/* TIMER TAB */}
        {activeTab === 'timer' && (
          <div className="py-2 space-y-4">
            <div className="flex justify-center gap-2">
              {[10, 30, 60, 90].map((sec) => (
                <button
                  key={sec}
                  onClick={() => {
                    setIsTimerRunning(false);
                    setInitialSeconds(sec);
                    setTimerSeconds(sec);
                  }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-colors ${
                    initialSeconds === sec ? 'border-[#06b6d4] text-[#06b6d4] bg-cyan-400/10' : 'border-white/10 text-gray-400'
                  }`}
                >
                  {sec}s
                </button>
              ))}
            </div>

            <div className="relative py-3">
              <div className="text-5xl font-black font-mono text-white tracking-widest text-glow-lime">
                {String(Math.floor(timerSeconds / 60)).padStart(2, '0')}:
                {String(timerSeconds % 60).padStart(2, '0')}
              </div>
              <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
                <div
                  className="bg-[#06b6d4] h-full transition-all duration-300"
                  style={{ width: `${(timerSeconds / initialSeconds) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setIsTimerRunning((prev) => !prev);
                }}
                className="flex-1 py-2.5 rounded-xl bg-[#06b6d4] text-black font-extrabold text-xs active:scale-95 transition-transform flex items-center justify-center gap-1.5 shadow"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                {isTimerRunning ? 'Durdur' : 'Başlat'}
              </button>
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setIsTimerRunning(false);
                  setTimerSeconds(initialSeconds);
                }}
                className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold text-xs hover:text-white active:scale-95 transition-transform flex items-center justify-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Sıfırla
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
