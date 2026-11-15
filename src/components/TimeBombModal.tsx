import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Flame,
  Vibrate,
  Zap,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  HelpCircle,
  Activity,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  Play
} from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { TablePlayer, loadTablePlayers } from '../utils/playerManager';

export const HAND_TO_HAND_QUESTIONS = [
  'Kırmızı renkli bir meyve veya sebze söyle!',
  'A harfiyle başlayan bir hayvan söyle!',
  'Masadaki herkesin tanıdığı ünlü bir şarkıcı söyle!',
  'Bir süper kahraman adı söyle!',
  'Sabah kahvaltısında asla yenmeyecek bir şey söyle!',
  'İçinde "Su" kelimesi geçen bir kelime söyle!',
  'Buzdolabında mutlaka bulunan bir yiyecek söyle!',
  'Türkiye\'de "B" harfiyle başlayan bir şehir söyle!',
  'En sevdiğin çizgi film veya anime karakterini söyle!',
  'Bir araba markası söyle!',
  'Evde yangın çıksa kurtaracağın ilk eşyayı söyle!',
  '3 heceli bir kadın veya erkek ismi söyle!',
  'Bir Hollywood filmi veya dizi adı söyle!',
  'Mavi renkli bir kıyafet veya aksesuar söyle!',
  'Denizde yaşayan bir canlı türü söyle!',
  'S harfiyle başlayan bir yemek söyle!',
  'Çocukken en çok korktuğun şeyi söyle!',
  'Tatile gidilecek en güzel ülke veya şehri söyle!',
  'Okulda en nefret ettiğin dersi söyle!',
  'Bir rock veya pop grubu söyle!',
  'Cebinde şu an olan bir eşyayı söyle!',
  'Kışın giyilen sıcak bir giysi söyle!',
  'M harfiyle başlayan 1 meyve veya tatlı söyle!',
  'Bir bilgisayar veya telefon oyunu söyle!',
  'Masadaki birinin giydiği bir kıyafet rengini söyle!',
  'Uçabilen bir canlı veya hava aracı söyle!',
  'Kahve veya çayın yanına yakışan bir atıştırmalık söyle!',
  'E harfiyle başlayan bir meslek söyle!',
  'Bir futbol veya basketbol takımı söyle!',
  'Bir fast-food yiyecek türü söyle!',
  'Telefonunda en çok bildirim gelen uygulamayı söyle!',
  'T harfiyle başlayan bir nesne söyle!'
];

export const BOMB_PENALTIES = [
  'Masadaki herkese birer fıkra veya espri anlat!',
  'Masadakilerin seçeceği acı/ekşi bir şeyi ye veya cezayı iç!',
  'Sonraki tura kadar konuşurken bir çizgi film karakteri gibi ses çıkar!',
  'Telefonundaki son çekilen fotoğrafı masaya göster!',
  '10 şınav çek ya da 15 saniye amuda kalkmaya çalış!',
  'Masadaki birine çok abartılı ve resmi bir iltifat et!',
  'Masadaki birinin taklidini yap, kim olduğunu diğerleri tahmin etsin!',
  'Son aradığın kişinin kim olduğunu masaya itiraf et!'
];

const CHAOTIC_MASKS = ['??:??', '08:4*', '??:12', '03:??', '00:??', '??:07', '**:**', '14:??', '??:02'];

interface TimeBombModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const TimeBombModal: React.FC<TimeBombModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  // Players
  const [players, setPlayers] = useState<TablePlayer[]>(() => loadTablePlayers());
  const [activePlayerIdx, setActivePlayerIdx] = useState(0);

  // Game state: 'idle' (waiting to ignite) | 'ticking' (burning/circulating) | 'exploded'
  const [gameState, setGameState] = useState<'idle' | 'ticking' | 'exploded'>('idle');

  // Stats & Round info
  const [handoverCount, setHandoverCount] = useState(0);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [explodedPlayer, setExplodedPlayer] = useState<TablePlayer | null>(null);
  const [penaltyText, setPenaltyText] = useState(BOMB_PENALTIES[0]);
  const [maskIndex, setMaskIndex] = useState(0);
  const [isHapticOn, setIsHapticOn] = useState(soundEngine.hapticsEnabled);
  const [isJittering, setIsJittering] = useState(false);
  const [sensorActive, setSensorActive] = useState(false);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Hidden dynamic duration (12 to 40 seconds)
  const totalDurationRef = useRef<number>(25);
  const timeRemainingRef = useRef<number>(25);
  const [progressOffset, setProgressOffset] = useState(0);

  // Timer intervals
  const tickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const nextTickDelayRef = useRef<number>(800);

  // Prepare table players on open
  useEffect(() => {
    if (isOpen) {
      const p = loadTablePlayers();
      setPlayers(p);
      setGameState('idle');
      setProgressOffset(0);
      setHandoverCount(0);
      setQuestionIndex(Math.floor(Math.random() * HAND_TO_HAND_QUESTIONS.length));

      // Listen for shake/motion events if supported
      const handleMotion = (e: DeviceMotionEvent) => {
        const acc = e.accelerationIncludingGravity;
        if (!acc) return;
        const totalAcc = Math.abs(acc.x || 0) + Math.abs(acc.y || 0) + Math.abs(acc.z || 0);
        if (totalAcc > 24) {
          setSensorActive(true);
        } else {
          setSensorActive(false);
        }
      };

      if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
        window.addEventListener('devicemotion', handleMotion);
      }

      return () => {
        if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
          window.removeEventListener('devicemotion', handleMotion);
        }
      };
    }
  }, [isOpen]);

  // Clean timer on unmount or close
  useEffect(() => {
    return () => {
      if (tickTimerRef.current) clearTimeout(tickTimerRef.current);
    };
  }, []);

  // Ignite Bomb by clicking directly on the timer core
  const igniteBombFromTimer = useCallback(() => {
    if (tickTimerRef.current) clearTimeout(tickTimerRef.current);

    // Pick fresh table players
    const currentPlayers = loadTablePlayers();
    setPlayers(currentPlayers);

    // Pick starting player completely RANDOMLY
    const randomStartIdx = Math.floor(Math.random() * (currentPlayers.length || 1));
    setActivePlayerIdx(randomStartIdx);

    // Secret random duration between 14 and 42 seconds
    const randomSec = Math.floor(Math.random() * 28) + 14;
    totalDurationRef.current = randomSec;
    timeRemainingRef.current = randomSec;
    setProgressOffset(0);
    setHandoverCount(0);
    nextTickDelayRef.current = 800;

    // Pick question
    setQuestionIndex((prev) => (prev + 1) % HAND_TO_HAND_QUESTIONS.length);
    setGameState('ticking');
    setIsJittering(true);
    setTimeout(() => setIsJittering(false), 300);

    // Sound & tactile feedback
    soundEngine.playTone(520, 0.15, 'sawtooth');
    soundEngine.triggerHaptic('touch');

    const starter = currentPlayers[randomStartIdx % (currentPlayers.length || 1)];
    onShowToast(`🔥 Fitil ateşlendi! İlk kurban rastgele seçildi: ${starter?.name || 'Oyuncu'}`);
  }, [onShowToast]);

  // Trigger explosion
  const triggerExplosion = useCallback(() => {
    if (tickTimerRef.current) clearTimeout(tickTimerRef.current);
    setGameState('exploded');

    const fallbackVictim: TablePlayer = { id: 'p1', name: 'Oyuncu', avatar: '', score: 0, color: '#f751a1' };
    const victim = players[activePlayerIdx % (players.length || 1)] || players[0] || fallbackVictim;
    setExplodedPlayer(victim);
    setPenaltyText(BOMB_PENALTIES[Math.floor(Math.random() * BOMB_PENALTIES.length)]);

    // Heavy explosion audio & haptics
    soundEngine.playBuzzer();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([200, 80, 350, 100, 500]);
    }

    try {
      confetti({
        particleCount: 90,
        spread: 100,
        origin: { y: 0.5 },
        colors: ['#f751a1', '#ff0055', '#bef264', '#f59e0b']
      });
    } catch {
      // ignore
    }

    onShowToast(`💥 BOOOOM! Bomba ${victim?.name || 'Oyuncu'}'ın elinde patladı!`);
  }, [activePlayerIdx, players, onShowToast]);

  // Accelerating ticking loop
  useEffect(() => {
    if (!isOpen || gameState !== 'ticking') {
      if (tickTimerRef.current) clearTimeout(tickTimerRef.current);
      return;
    }

    const runTick = () => {
      timeRemainingRef.current -= 0.5;

      const fraction = Math.max(0, timeRemainingRef.current / totalDurationRef.current);
      // Perimeter = 452 (2 * pi * 72)
      // Drain progress
      setProgressOffset(452 * (1 - fraction));

      // Accelerating ticks: from 800ms down to 100ms
      const delay = Math.max(90, Math.floor(800 * fraction));
      nextTickDelayRef.current = delay;

      // Play tick sound & haptic
      soundEngine.playCountdown();
      if (fraction < 0.28) {
        soundEngine.triggerHaptic('urgent');
      } else {
        soundEngine.triggerHaptic('tick');
      }

      // Check if bomb reached zero
      if (timeRemainingRef.current <= 0) {
        triggerExplosion();
      } else {
        tickTimerRef.current = setTimeout(runTick, delay);
      }
    };

    tickTimerRef.current = setTimeout(runTick, nextTickDelayRef.current);

    return () => {
      if (tickTimerRef.current) clearTimeout(tickTimerRef.current);
    };
  }, [isOpen, gameState, triggerExplosion]);

  if (!isOpen) return null;

  const currentPlayer = players[activePlayerIdx % (players.length || 1)] || players[0];
  const nextPlayer = players[(activePlayerIdx + 1) % (players.length || 1)] || players[0];
  const currentQuestion = HAND_TO_HAND_QUESTIONS[questionIndex % HAND_TO_HAND_QUESTIONS.length];

  // Action: Answered! Hand bomb to next player (Elden Ele Aktarım)
  const handleAnswerAndHandover = () => {
    if (gameState !== 'ticking') return;

    soundEngine.playClick();
    soundEngine.triggerHaptic('drop');

    setHandoverCount((prev) => prev + 1);
    setActivePlayerIdx((prev) => (prev + 1) % (players.length || 1));

    // Jitter animation on bomb
    setIsJittering(true);
    setTimeout(() => setIsJittering(false), 200);

    // Randomize masked display
    setMaskIndex((prev) => (prev + 1) % CHAOTIC_MASKS.length);

    onShowToast(`👉 Bomba ${nextPlayer.name}'a devredildi! Hızlı ol!`);
  };

  // Change hand-to-hand question
  const handleNextQuestion = () => {
    soundEngine.playClick();
    setQuestionIndex((prev) => (prev + 1) % HAND_TO_HAND_QUESTIONS.length);
    onShowToast('📋 Yeni soru belirlendi!');
  };

  // Toggle haptic
  const handleToggleHaptic = () => {
    const nextState = !isHapticOn;
    setIsHapticOn(nextState);
    soundEngine.hapticsEnabled = nextState;
    if (nextState) {
      soundEngine.triggerHaptic('tap');
      onShowToast('📳 Titreşim Açık');
    } else {
      onShowToast('🔇 Titreşim Kapalı');
    }
  };

  // Reset to idle ready state
  const handleResetToIdle = () => {
    if (tickTimerRef.current) clearTimeout(tickTimerRef.current);
    setGameState('idle');
    setProgressOffset(0);
    setExplodedPlayer(null);
    setHandoverCount(0);
    soundEngine.playClick();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2 select-none">
      <div className="relative w-full max-w-md h-[94dvh] sm:h-[96vh] max-h-[890px] bg-[#0a0e18] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        {/* ================= FIXED TOP HEADER ================= */}
        <header className="w-full pt-safe bg-[#0a0e18]/90 backdrop-blur-xl border-b border-white/10 shrink-0">
          <div className="h-16 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#f751a1] via-[#571bc1] to-[#bef264] flex items-center justify-center text-white shadow-[0_0_15px_rgba(247,81,161,0.4)] shrink-0">
                <span className="text-xl">💣</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-base text-white tracking-tight leading-none truncate">
                    Saatli Bomba
                  </h1>
                  <span className={`w-2 h-2 rounded-full shrink-0 ${gameState === 'ticking' ? 'bg-red-500 animate-ping' : 'bg-[#10B981] animate-pulse'}`} />
                </div>
                <span className="text-[10px] text-[#bef264] tracking-wider uppercase font-mono mt-1 truncate">
                  Sıcak Patates • Elden Ele Soru
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowInfoModal(true);
                }}
                className="w-10 h-10 rounded-full bg-[#1c1f2a] hover:bg-white/10 flex items-center justify-center text-[#bef264] transition-colors"
                title="Nasıl Oynanır?"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  onClose();
                }}
                className="w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center text-red-300 transition-colors"
                title="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* ================= MAIN SCROLLABLE CONTENT ================= */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3.5 no-scrollbar">

        {/* Centerpiece: Bomb Core & Timer Display (Click here to ignite!) */}
        <div className="w-full bg-[#111827] border border-white/10 rounded-3xl p-5 sm:p-6 flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
          {/* Ambient Glows */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#f751a1]/10 via-transparent to-[#111827] pointer-events-none" />
          <div
            className={`absolute w-56 h-56 rounded-full blur-3xl pointer-events-none transition-all duration-300 ${
              gameState === 'ticking'
                ? isJittering
                  ? 'bg-red-500/40 scale-125'
                  : 'bg-[#f751a1]/30 scale-110'
                : 'bg-[#bef264]/20 scale-95'
            }`}
          />

          {/* Status Badge */}
          <div className="z-10 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0a0e18] border border-white/10 text-xs font-black uppercase tracking-wider mb-2 shadow-inner">
            {gameState === 'idle' && (
              <>
                <span className="w-2 h-2 rounded-full bg-[#bef264] animate-ping" />
                <span className="text-[#bef264]">Ateşlemeye Hazır • Süreye Dokun</span>
              </>
            )}
            {gameState === 'ticking' && (
              <>
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="text-red-400">Fitil Yanıyor! 🔥 Tik-Tak Hızlanıyor</span>
              </>
            )}
            {gameState === 'exploded' && (
              <>
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span className="text-red-400">💥 BOMBA PATLADI!</span>
              </>
            )}
          </div>

          {/* Bomb Interactive Timer Vessel: USER CLICKS DIRECTLY ON THE TIMER TO IGNITE! */}
          <div
            onClick={gameState === 'idle' ? igniteBombFromTimer : undefined}
            role="button"
            tabIndex={0}
            title={gameState === 'idle' ? 'Bombayı ateşlemek için dokunun!' : 'Bomba çalışıyor'}
            className={`relative w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center my-2 select-none transition-transform duration-200 ${
              gameState === 'idle'
                ? 'cursor-pointer hover:scale-105 active:scale-95 group'
                : 'cursor-default'
            }`}
          >
            {/* Animated SVG Pressure Rings */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none" viewBox="0 0 160 160">
              <circle
                className="text-[#1E293B]"
                cx="80"
                cy="80"
                fill="none"
                r="72"
                stroke="currentColor"
                strokeDasharray="6 6"
                strokeWidth="4"
              />
              <circle
                className={`transition-all duration-150 ease-linear ${
                  gameState === 'idle'
                    ? 'text-[#bef264]'
                    : gameState === 'exploded'
                    ? 'text-red-500'
                    : 'text-[#f751a1]'
                }`}
                cx="80"
                cy="80"
                fill="none"
                r="72"
                stroke="currentColor"
                strokeDasharray="452"
                strokeDashoffset={gameState === 'idle' ? 0 : progressOffset}
                strokeLinecap="round"
                strokeWidth="5"
              />
              <circle
                className="text-[#bef264]/20"
                cx="80"
                cy="80"
                fill="none"
                r="58"
                stroke="currentColor"
                strokeDasharray="3 3"
                strokeWidth="2"
              />
            </svg>

            {/* Center Bomb Core */}
            <div
              className={`w-36 h-36 sm:w-40 sm:h-40 rounded-full bg-[#0a0e18] shadow-[inset_0_0_28px_rgba(247,81,161,0.35)] flex flex-col items-center justify-center z-10 transition-all duration-200 border ${
                gameState === 'idle'
                  ? 'border-[#bef264]/40 group-hover:border-[#bef264] shadow-[0_0_30px_rgba(190,242,100,0.3)]'
                  : 'border-[#f751a1]/40'
              } ${isJittering ? 'scale-110 rotate-3' : 'scale-100'}`}
            >
              {gameState === 'idle' ? (
                /* Idle Call-to-action */
                <div className="flex flex-col items-center justify-center text-center p-2">
                  <div className="w-10 h-10 rounded-full bg-[#bef264]/20 flex items-center justify-center text-[#bef264] mb-1 group-hover:scale-110 transition-transform">
                    <Flame className="w-6 h-6 animate-bounce" />
                  </div>
                  <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">
                    Süreye Dokun
                  </span>
                  <span className="text-base sm:text-lg font-black text-[#bef264] uppercase tracking-wide drop-shadow-[0_0_10px_rgba(190,242,100,0.6)]">
                    ATEŞLE! 🔥
                  </span>
                  <span className="text-[9px] text-gray-400 font-bold mt-0.5">
                    14-42 sn Gizli
                  </span>
                </div>
              ) : (
                /* Burning or Exploded Display */
                <div className="flex flex-col items-center justify-center text-center">
                  <div className="flex items-center gap-1 text-[#f751a1]">
                    <Flame className="w-4 h-4 animate-bounce" />
                    <span className="text-[10px] tracking-widest text-gray-400 uppercase font-black">
                      Gizli Süre
                    </span>
                  </div>

                  <div className="flex items-center justify-center gap-1 mt-0.5">
                    <span className="text-3xl sm:text-4xl font-black font-mono text-[#f751a1] tracking-wider select-none drop-shadow-[0_0_15px_rgba(247,81,161,0.85)]">
                      {gameState === 'exploded' ? 'GÜM!' : CHAOTIC_MASKS[maskIndex]}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />
                    <span className="text-[10px] text-red-400 font-bold tracking-tight">
                      Geri Sayım Hızlanıyor
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Soundwave Chaos Tickers */}
          <div className="w-full max-w-xs flex items-center justify-between gap-1 mt-1 px-4 z-10">
            <div className={`h-1.5 flex-1 rounded-full ${gameState === 'ticking' ? 'bg-[#f751a1] animate-pulse' : 'bg-[#1E293B]'}`} />
            <div className={`h-2.5 flex-1 rounded-full ${gameState === 'ticking' ? 'bg-[#ffb0cd] animate-pulse delay-75' : 'bg-[#1E293B]'}`} />
            <div className={`h-4 flex-1 rounded-full ${gameState === 'ticking' ? 'bg-[#bef264] animate-pulse delay-150' : 'bg-[#1E293B]'}`} />
            <div className={`h-3 flex-1 rounded-full ${gameState === 'ticking' ? 'bg-[#f751a1] animate-pulse delay-100' : 'bg-[#1E293B]'}`} />
            <div className={`h-5 flex-1 rounded-full ${gameState === 'ticking' ? 'bg-[#571bc1] animate-pulse delay-200' : 'bg-[#1E293B]'}`} />
            <div className={`h-3.5 flex-1 rounded-full ${gameState === 'ticking' ? 'bg-[#bef264] animate-pulse delay-75' : 'bg-[#1E293B]'}`} />
            <div className={`h-2 flex-1 rounded-full ${gameState === 'ticking' ? 'bg-[#f751a1] animate-pulse' : 'bg-[#1E293B]'}`} />
            <div className="h-1 flex-1 rounded-full bg-[#1E293B]" />
          </div>

          {gameState === 'idle' && (
            <p className="text-xs text-[#bef264] font-bold mt-2 text-center animate-pulse">
              👆 Başlatmak için yukarıdaki süre dairesine dokunun!
            </p>
          )}
        </div>

        {/* Current Player Card (Random starter, then sequentially circulated) */}
        <div className="w-full bg-[#111827] border border-white/10 rounded-2xl p-4 shadow-lg flex flex-col gap-3 relative">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-black text-gray-400 tracking-wider uppercase flex items-center gap-1.5">
              <span>{gameState === 'idle' ? 'İlk Kurban' : 'Telefon Şu An Onda'}</span>
              {gameState === 'idle' && (
                <span className="text-[10px] text-[#bef264] font-bold">(Rastgele Seçilecek)</span>
              )}
            </span>
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1E293B]">
              <span className="text-xs font-bold text-gray-300">
                Aktarım: <strong className="text-[#bef264] font-mono">{handoverCount}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#f751a1] via-[#111827] to-[#bef264] p-0.5 shadow-[0_0_16px_rgba(247,81,161,0.4)]">
                <div className="w-full h-full rounded-full bg-[#0a0e18] flex items-center justify-center overflow-hidden">
                  {currentPlayer?.avatar ? (
                    <img
                      src={currentPlayer.avatar}
                      alt={currentPlayer.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-black text-base text-white">
                      {currentPlayer?.name ? currentPlayer.name.slice(0, 2).toUpperCase() : '??'}
                    </span>
                  )}
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#10B981] text-[#0a0e18] flex items-center justify-center shadow-md">
                <Zap className="w-3 h-3 fill-current font-bold" />
              </span>
            </div>

            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-[11px] text-[#f751a1] uppercase font-black tracking-wider">
                {gameState === 'idle' ? 'Sıradaki Oyuncu:' : 'Telefonu Tutan Oyuncu:'}
              </span>
              <h2 className="text-xl font-black text-white tracking-tight truncate uppercase">
                {currentPlayer?.name || 'Oyuncu'}
              </h2>
              <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                <ArrowRight className="w-3.5 h-3.5 text-[#bef264]" />
                <span>
                  Sıradaki: <strong className="text-gray-200">{nextPlayer?.name || 'Sıradaki'}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* ELDEN ELE GEÇECEK SORU ALANI (Replaces old 'Pas kuralı') */}
          <div className="w-full bg-[#0a0e18] border border-white/10 rounded-2xl p-3.5 flex flex-col gap-1.5 relative overflow-hidden shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#bef264]" />
                <span className="text-[10px] font-black uppercase tracking-wider text-[#bef264]">
                  Elden Ele Geçecek Soru
                </span>
              </div>
              <button
                onClick={handleNextQuestion}
                className="text-[11px] font-bold text-gray-400 hover:text-[#bef264] flex items-center gap-1 transition-colors"
                title="Başka bir soru seç"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Başka Soru</span>
              </button>
            </div>

            <p className="text-sm sm:text-base font-extrabold text-white leading-snug">
              "{currentQuestion}"
            </p>

            <span className="text-[10px] text-gray-400 font-medium">
              💡 Cevabını hızlıca sesli söyle, butona dokun ve telefonu hemen sıradakine ver!
            </span>
          </div>
        </div>

        {/* PRIMARY ACTION ZONE: Hand-to-Hand Answer & Circulate Button */}
        <div className="w-full flex flex-col gap-2 pt-1">
          {gameState === 'idle' ? (
            /* When idle: Big button guiding to start via center timer */
            <button
              onClick={igniteBombFromTimer}
              className="w-full py-4 px-4 rounded-full bg-gradient-to-r from-[#bef264] via-lime-400 to-[#10B981] text-black font-black text-base tracking-wide shadow-[0_0_25px_rgba(190,242,100,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Flame className="w-5 h-5 fill-current" />
              <span>SÜREYE DOKUN YA DA BURADAN ATEŞLE 🔥</span>
            </button>
          ) : (
            /* When ticking: "Cevapladım! Sıradakine Ver 👉" */
            <button
              onClick={handleAnswerAndHandover}
              disabled={gameState !== 'ticking'}
              className="w-full py-4 px-4 rounded-full bg-gradient-to-r from-[#f751a1] via-pink-600 to-[#571bc1] text-white font-black text-base tracking-wide shadow-[0_0_25px_rgba(247,81,161,0.55),inset_0_1px_0_rgba(255,255,255,0.4)] active:scale-95 transition-all flex flex-col items-center justify-center text-center group cursor-pointer disabled:opacity-40"
            >
              <div className="flex items-center gap-2 text-white text-lg">
                <CheckCircle2 className="w-6 h-6 text-[#bef264]" />
                <span>Cevapladım! Sıradakine Ver 👉</span>
              </div>
              <span className="text-[11px] text-white/90 font-medium tracking-tight mt-0.5">
                Cevabını söyle, tıkla ve telefonu hemen {nextPlayer.name}'a uzat!
              </span>
            </button>
          )}

          {/* Emergency / Manual Explode Button (in case time is disputed or to test) */}
          {gameState === 'ticking' && (
            <button
              onClick={triggerExplosion}
              className="w-full py-2.5 px-4 rounded-full bg-[#1E293B] hover:bg-[#262a35] text-red-400 font-bold text-xs shadow-md active:scale-95 transition-all flex items-center justify-center gap-2 border border-red-500/20"
            >
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>Cevap Veremedi / Süre Bitti (Patlat) 🚨</span>
            </button>
          )}
        </div>

        {/* ================= HOW TO PLAY MINI MODAL ================= */}
        {showInfoModal && (
          <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
            <div className="w-full max-w-sm sm:max-w-md bg-[#111827] border border-white/15 rounded-3xl p-5 sm:p-6 shadow-[0_0_40px_rgba(0,0,0,0.8)] flex flex-col gap-4 text-left relative">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">💣</span>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Saatli Bomba Nasıl Oynanır?
                  </h3>
                </div>
                <button
                  onClick={() => setShowInfoModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-3 text-xs sm:text-sm text-gray-300 overflow-y-auto max-h-[60vh] pr-1">
                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#f751a1]/20 text-[#f751a1] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </span>
                  <div>
                    <strong className="text-white block font-bold">Merkezdeki Süreye Dokun &amp; Ateşle:</strong>
                    Ortadaki süre dairesine dokunulduğunda gizli bomba fitili yanar (14 - 42 saniye). Ne zaman patlayacağını kimse bilemez!
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#bef264]/20 text-[#bef264] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </span>
                  <div>
                    <strong className="text-white block font-bold">İlk Kurban Rastgele Seçilir:</strong>
                    Fitil yandığı anda oyunu kimin başlatacağı tamamen rastgele belirlenir. Telefon hemen o kişiye uzatılır.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#571bc1]/30 text-[#d0bcff] font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </span>
                  <div>
                    <strong className="text-white block font-bold">Elden Ele Soru Kuralı:</strong>
                    Telefonu elinde tutan kişi ekrandaki soruya yüksek sesle geçerli bir cevap verir, ardından <strong className="text-[#bef264]">"Cevapladım! Sıradakine Ver"</strong> tuşuna basıp telefonu hemen yanındakine aktarır.
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-red-500/20 text-red-400 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                    4
                  </span>
                  <div>
                    <strong className="text-white block font-bold">Bomba Ansızın Patlar:</strong>
                    Geri sayım ilerledikçe tik-tak sesleri ve titreşim hızlanır. Süre bittiğinde bomba kimin elindeyse o kişi turu kaybeder ve parti cezasını çeker!
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowInfoModal(false)}
                className="w-full py-3 rounded-full bg-gradient-to-r from-[#bef264] to-lime-400 text-black font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all mt-1"
              >
                Anladım, Oyuna Dön 💥
              </button>
            </div>
          </div>
        )}

        {/* ================= EXPLOSION OVERLAY MODAL ================= */}
        {gameState === 'exploded' && (
          <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
            <div className="w-full max-w-sm bg-[#111827] border-2 border-red-500/50 rounded-3xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.4)] flex flex-col items-center text-center gap-3 relative">
              <div className="w-20 h-20 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-4xl animate-bounce shadow-[0_0_25px_rgba(239,68,68,0.6)]">
                💥
              </div>

              <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 font-black text-[11px] uppercase tracking-wider">
                SÜRE DOLDU &amp; PATLADI!
              </span>

              <h3 className="text-xl font-black text-white">
                Bomba {explodedPlayer ? explodedPlayer.name : 'Oyuncu'}'ın Elinde Patladı!
              </h3>

              <div className="w-full p-4 rounded-2xl bg-[#1E293B] border border-white/10 text-left space-y-1">
                <span className="text-[10px] uppercase font-black text-[#bef264] tracking-widest block">
                  PARTİ CEZASI
                </span>
                <p className="text-xs text-gray-200 font-medium leading-relaxed">
                  "{penaltyText}"
                </p>
              </div>

              <div className="w-full flex flex-col gap-2 pt-2">
                <button
                  onClick={igniteBombFromTimer}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#bef264] to-lime-400 text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(190,242,100,0.4)] active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Yeni Bomba Ateşle 💣</span>
                </button>

                <button
                  onClick={handleResetToIdle}
                  className="w-full py-2.5 rounded-full bg-[#1E293B] text-gray-300 font-bold text-xs hover:bg-[#262a35] active:scale-95 transition-all"
                >
                  Masaya Dön (Süre Dairesine Dokunarak Başla)
                </button>
              </div>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
