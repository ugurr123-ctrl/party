import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Headphones,
  Music,
  Zap,
  RotateCcw,
  Check,
  Eye,
  EyeOff,
  Crown,
  Volume2,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../../utils/audio';
import { TablePlayer, loadTablePlayers } from '../../utils/playerManager';
import { KARAOKE_HUM_SONGS } from '../../data/vipGamesData';

interface VipKaraokeHumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const VipKaraokeHumModal: React.FC<VipKaraokeHumModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const [players, setPlayers] = useState<TablePlayer[]>([]);
  const [singerIdx, setSingerIdx] = useState(0);
  const [songIdx, setSongIdx] = useState(0);
  const [isSongRevealed, setIsSongRevealed] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) {
      const current = loadTablePlayers();
      setPlayers(current);
      setSingerIdx(Math.floor(Math.random() * (current.length || 1)));
      setSongIdx(Math.floor(Math.random() * KARAOKE_HUM_SONGS.length));
      setIsSongRevealed(false);
      setTimeLeft(30);
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
            onShowToast('⏱️ Karaoke süresi doldu!');
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

  const currentSinger = players[singerIdx]?.name || 'Berk T.';
  const currentSong = KARAOKE_HUM_SONGS[songIdx];

  const handleNextSong = () => {
    soundEngine.playClick();
    setSongIdx((prev) => (prev + 1) % KARAOKE_HUM_SONGS.length);
    setSingerIdx((prev) => (prev + 1) % Math.max(1, players.length));
    setIsSongRevealed(false);
    setTimeLeft(30);
    setIsTimerRunning(true);
  };

  const handleCorrectGuess = () => {
    soundEngine.playVictory();
    soundEngine.triggerHaptic('win');
    try {
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
    onShowToast(`🎉 DOĞRU TAHMİN! Masadan +50 puan kapıldı!`);
    handleNextSong();
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
              <span>VIP #9 · AKORTSUZ KARAOKE</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-mono font-black px-2.5 py-1 rounded-xl border ${
              timeLeft <= 5 ? 'bg-red-500/20 border-red-500 text-red-400 animate-pulse' : 'bg-white/10 border-white/10 text-cyan-300'
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
          
          {/* Singer Banner */}
          <div className="p-3 rounded-2xl bg-[#111827] border border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold">
                🎧
              </div>
              <div>
                <span className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">ŞARKICI (KULAKLIK TAKILI)</span>
                <h4 className="text-xs sm:text-sm font-black text-white">{currentSinger}</h4>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
              Söz Söylemek Yasak
            </span>
          </div>

          {/* Golden Rule Explainer */}
          <div className="p-3 rounded-2xl bg-gradient-to-r from-cyan-950/30 to-[#111827] border border-cyan-500/30 flex items-center gap-2.5 text-xs text-gray-300">
            <Music className="w-5 h-5 text-cyan-400 shrink-0" />
            <span>
              Kulaklıkla şarkıyı dinle, sadece <b className="text-cyan-300">“Dı-dı-dı”</b> veya mırıldanarak masaya anlat!
            </span>
          </div>

          {/* Secret Song Card with Blur Reveal */}
          <div className="p-5 rounded-3xl bg-gradient-to-b from-[#181c28] to-[#111827] border-2 border-cyan-500/40 text-center space-y-3 shadow-xl">
            <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-cyan-300 uppercase">
              <span>GİZLİ ŞARKI KARTI</span>
              <span>·</span>
              <span className="text-amber-400">{currentSong.genre}</span>
            </div>

            <div className="py-2">
              <h3 className={`text-lg sm:text-xl font-black transition-all ${
                isSongRevealed ? 'text-white' : 'text-gray-500 filter blur-md select-none'
              }`}>
                {currentSong.artist} - “{currentSong.title}”
              </h3>
              <p className={`text-xs text-cyan-300 mt-1 transition-all ${
                isSongRevealed ? 'opacity-100' : 'opacity-0'
              }`}>
                İpucu: {currentSong.hint}
              </p>
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                setIsSongRevealed(!isSongRevealed);
              }}
              className="py-2 px-4 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5 mx-auto active:scale-95 transition-all"
            >
              {isSongRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{isSongRevealed ? 'Şarkıyı Gizle' : 'Şarkıyı Gör (Sadece Şarkıcı Baksın)'}</span>
            </button>
          </div>

          {/* Equalizer Audio Waves Animation */}
          <div className="p-3 rounded-2xl bg-[#111827] border border-white/10 flex items-center justify-center gap-1.5 h-12">
            {[40, 75, 30, 90, 60, 100, 45, 80, 55, 95, 35, 70, 85].map((h, i) => (
              <div
                key={i}
                className="w-1.5 bg-cyan-400 rounded-full animate-pulse"
                style={{
                  height: `${h}%`,
                  animationDuration: `${0.4 + (i % 5) * 0.15}s`
                }}
              />
            ))}
          </div>

          {/* Table Buzzer Button */}
          <button
            onClick={() => {
              soundEngine.playBuzzer();
              soundEngine.triggerHaptic('alert');
              onShowToast('⚡ MASA BUZZER: BİLDİM DİYEN VAR!');
            }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 text-amber-300 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
          >
            <Zap className="w-4 h-4 fill-amber-400" />
            <span>MASA BUZZER: ŞARKIYI BİLDİM! ⚡</span>
          </button>

          {/* Anti-Overflow Spacer */}
          <div className="h-10 w-full shrink-0 pointer-events-none" />
        </div>

        {/* Sticky Action Footer */}
        <div className="shrink-0 p-3 sm:p-4 bg-[#0a0e18]/95 backdrop-blur-md border-t border-white/10 pb-safe z-20 flex gap-2">
          <button
            onClick={handleNextSong}
            className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider active:scale-95 transition-all"
          >
            Pas Geç
          </button>
          <button
            onClick={handleCorrectGuess}
            className="flex-[2] py-3.5 rounded-xl bg-[#bef264] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_15px_rgba(190,242,100,0.3)] active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Doğru Bildi! (+50 Puan)</span>
          </button>
        </div>

      </div>
    </div>
  );
};
