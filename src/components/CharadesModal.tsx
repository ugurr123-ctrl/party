import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Volume2,
  VolumeX,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Trophy,
  Users,
  Film,
  Sparkles,
  ChevronRight,
  Flame,
  HelpCircle
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface CharadesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

interface CharadesCard {
  title: string;
  category: 'Türk Filmi' | 'Yabancı Sinema' | 'Kült Dizi' | 'Absürt Deyim';
  forbidden: string[];
}

const CHARADES_DECK: CharadesCard[] = [
  {
    title: 'Hababam Sınıfı',
    category: 'Türk Filmi',
    forbidden: ['İnek Şaban', 'Mahmut Hoca', 'Okul', 'Kopya']
  },
  {
    title: 'G.O.R.A.',
    category: 'Türk Filmi',
    forbidden: ['Cem Yılmaz', 'Arif', 'Uzay', 'Komutan Logar']
  },
  {
    title: 'Titanic',
    category: 'Yabancı Sinema',
    forbidden: ['Gemi', 'Buzdağı', 'Leonardo DiCaprio', 'Batmak']
  },
  {
    title: 'Yüzüklerin Efendisi',
    category: 'Yabancı Sinema',
    forbidden: ['Frodo', 'Yüzük', 'Gollum', 'Mordor']
  },
  {
    title: 'Aşk-ı Memnu',
    category: 'Kült Dizi',
    forbidden: ['Bihter', 'Behlül', 'Adnan Bey', 'Yalı']
  },
  {
    title: 'Kurtlar Vadisi',
    category: 'Kült Dizi',
    forbidden: ['Polat Alemdar', 'Çakır', 'Racon', 'Mafya']
  },
  {
    title: 'Damdan Düşer Gibi',
    category: 'Absürt Deyim',
    forbidden: ['Çatı', 'Apar topar', 'Ansızın', 'Düşmek']
  },
  {
    title: 'Etekleri Zil Çalmak',
    category: 'Absürt Deyim',
    forbidden: ['Çok sevinmek', 'Zil', 'Kıyafet', 'Mutluluk']
  },
  {
    title: 'Tosun Paşa',
    category: 'Türk Filmi',
    forbidden: ['Yeşil Vadi', 'Şener Şen', 'Hakiki', 'Sahte']
  },
  {
    title: 'Harry Potter',
    category: 'Yabancı Sinema',
    forbidden: ['Büyücü', 'Asa', 'Hogwarts', 'Voldemort']
  }
];

export const CharadesModal: React.FC<CharadesModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const [soundActive, setSoundActive] = useState<boolean>(true);
  const [cardIdx, setCardIdx] = useState<number>(0);
  const currentCard = CHARADES_DECK[cardIdx % CHARADES_DECK.length];

  // Teams & Scores
  const [activeTeam, setActiveTeam] = useState<'A' | 'B'>('A');
  const [scoreTeamA, setScoreTeamA] = useState<number>(0);
  const [scoreTeamB, setScoreTeamB] = useState<number>(0);

  // 60s Timer
  const [secondsLeft, setSecondsLeft] = useState<number>(60);
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer loop
  useEffect(() => {
    if (isTimerActive && secondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimerActive(false);
            soundEngine.playBuzzer();
            soundEngine.triggerHaptic('alert');
            onShowToast(`⏰ Süre bitti! Takım ${activeTeam} sırasını tamamladı.`);
            return 0;
          }
          if (prev <= 5) {
            soundEngine.triggerHaptic('tick');
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerActive, secondsLeft, activeTeam, onShowToast]);

  // Start round
  const handleStartTimer = () => {
    soundEngine.playClick();
    setIsTimerActive(true);
  };

  // Correct Answer (+1)
  const handleCorrect = () => {
    soundEngine.playSuccess();
    soundEngine.triggerHaptic('win');
    if (activeTeam === 'A') setScoreTeamA((s) => s + 1);
    else setScoreTeamB((s) => s + 1);

    onShowToast(`🎉 DOĞRU! Takım ${activeTeam} +1 Puan!`);
    setCardIdx((prev) => prev + 1);
  };

  // Pass (Pas)
  const handlePass = () => {
    soundEngine.playClick();
    soundEngine.triggerHaptic('tap');
    onShowToast('Pas geçildi, sıradaki kart!');
    setCardIdx((prev) => prev + 1);
  };

  // Switch Team
  const handleSwitchTeam = () => {
    soundEngine.playClick();
    setIsTimerActive(false);
    setSecondsLeft(60);
    setActiveTeam((t) => (t === 'A' ? 'B' : 'A'));
    setCardIdx((prev) => prev + 1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2 select-none">
      <div className="relative w-full max-w-md h-[94dvh] sm:h-[96vh] max-h-[890px] bg-[#0a0e18] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        
        {/* ================= FIXED TOP HEADER ================= */}
        <header className="w-full pt-safe bg-[#0a0e18]/90 backdrop-blur-xl border-b border-white/10 shrink-0">
          <div className="h-16 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-[#1c1f2a] flex items-center justify-center text-blue-400 text-xl shrink-0">
                🎭
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-base text-white tracking-tight leading-none truncate">
                    Sessiz Sinema &amp; Kelime
                  </h1>
                  <span className="w-2 h-2 rounded-full bg-[#C4F442] animate-pulse shrink-0" />
                </div>
                <span className="text-[10px] text-[#4cd7f6] tracking-wider uppercase font-mono mt-1 truncate">
                  Takım Kapışması (60sn)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  const s = soundEngine.toggleSound();
                  setSoundActive(s);
                }}
                className="w-10 h-10 rounded-full bg-[#1c1f2a] hover:bg-white/10 flex items-center justify-center text-gray-300 transition-colors"
                title="Ses Açık/Kapalı"
              >
                {soundActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center text-red-300 transition-colors"
                title="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* ================= MAIN SCROLLABLE CONTENT ================= */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3.5 no-scrollbar justify-between">
          
          {/* Team Scores Bar */}
          <div className="grid grid-cols-2 gap-2">
            <div
              className={`p-2.5 rounded-2xl border flex items-center justify-between transition-all ${
                activeTeam === 'A'
                  ? 'bg-blue-500/20 border-blue-500 text-white shadow-lg'
                  : 'bg-white/5 border-white/10 text-gray-400'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-400">
                  TAKIM A {activeTeam === 'A' && '• Sırada'}
                </span>
                <span className="text-lg font-black font-mono">{scoreTeamA} Puan</span>
              </div>
              <Users className="w-5 h-5 text-blue-400" />
            </div>

            <div
              className={`p-2.5 rounded-2xl border flex items-center justify-between transition-all ${
                activeTeam === 'B'
                  ? 'bg-[#f751a1]/20 border-[#f751a1] text-white shadow-lg'
                  : 'bg-white/5 border-white/10 text-gray-400'
              }`}
            >
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase tracking-wider text-[#f751a1]">
                  TAKIM B {activeTeam === 'B' && '• Sırada'}
                </span>
                <span className="text-lg font-black font-mono">{scoreTeamB} Puan</span>
              </div>
              <Users className="w-5 h-5 text-[#f751a1]" />
            </div>
          </div>

          {/* Center Card & Timer */}
          <div className="flex flex-col gap-3 my-auto">
            {/* 60s Round Timer */}
            <div className="flex items-center justify-between px-2">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Kalan Süre:
              </span>
              <span
                className={`text-2xl font-black font-mono ${
                  secondsLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-[#bef264]'
                }`}
              >
                {secondsLeft} sn
              </span>
            </div>

            {/* Word Card */}
            <div className="relative rounded-3xl bg-gradient-to-b from-[#111827] to-[#1E293B] border-2 border-white/10 p-6 flex flex-col items-center justify-center text-center shadow-2xl overflow-hidden">
              <span className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mb-1">
                {currentCard.category}
              </span>
              <h2 className="text-2xl font-black text-white my-2">{currentCard.title}</h2>

              {/* Forbidden Words */}
              <div className="w-full mt-3 pt-3 border-t border-white/10 flex flex-col gap-1.5">
                <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider">
                  YASAKLI KELİMELER:
                </span>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {currentCard.forbidden.map((word, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-xs font-semibold"
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 pt-2">
            {!isTimerActive && secondsLeft === 60 ? (
              <button
                onClick={handleStartTimer}
                className="w-full py-3.5 rounded-2xl bg-[#bef264] text-black font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(190,242,100,0.4)] active:scale-95"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>60 Saniyeyi Başlat &amp; Anlat!</span>
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handlePass}
                  className="py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span>Pas Geç</span>
                </button>
                <button
                  onClick={handleCorrect}
                  className="py-3 rounded-2xl bg-[#10B981] hover:bg-emerald-400 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(16,185,129,0.4)] active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Bildik! (+1 Puan)</span>
                </button>
              </div>
            )}

            <button
              onClick={handleSwitchTeam}
              className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Diğer Takıma Devret</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
