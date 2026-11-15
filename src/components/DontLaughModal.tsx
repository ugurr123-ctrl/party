import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Volume2,
  VolumeX,
  Vibrate,
  Play,
  Pause,
  RotateCcw,
  Sparkles,
  Trophy,
  AlertTriangle,
  Gavel,
  RefreshCw,
  HelpCircle,
  Flame,
  Zap,
  CheckCircle2,
  Users,
  Timer
} from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { TablePlayer, loadTablePlayers } from '../utils/playerManager';

export const LAUGH_TRAPS = [
  {
    prompt: 'Birbirinize en ciddi bakışınızla "Miyav" deyin ve dişlerinizi göstermeyin!',
    difficulty: '9/10',
    soundHint: '🐐 Keçi Bağırması Çalıyor'
  },
  {
    prompt: 'Gözlerinizi kırpmadan 10 saniye boyunca birbirinizin burnuna bakın ve ciddi kalın!',
    difficulty: '8/10',
    soundHint: '🦆 Çılgın Ördek Sesi Çalıyor'
  },
  {
    prompt: 'Ciddi bir haber spikeri gibi masadaki en saçma veya utanç verici anınızı anlatmaya çalışın!',
    difficulty: '10/10',
    soundHint: '🎺 Palyaço Borusu Çalıyor'
  },
  {
    prompt: 'Birbirinize son derece abartılı, aşırı resmi Osmanlıca bir iltifat edin ama gülmeyin!',
    difficulty: '9/10',
    soundHint: '🐐 Absürt Yay Efekti Çalıyor'
  },
  {
    prompt: 'Yanaklarınızı hava doldurup şişirin, gözlerinizi dikin ve 15 saniye nefesinizi tutun!',
    difficulty: '8/10',
    soundHint: '🦆 Vak Vak Ördek Sesi Çalıyor'
  },
  {
    prompt: 'En kalın robot sesiyle "Ben duygusuz bir makineyim, gülmem" deyin!',
    difficulty: '7/10',
    soundHint: '🎺 Titrek Boru Sesi Çalıyor'
  },
  {
    prompt: 'Birbirinizin yüz mimiklerini aynı anda ayna gibi taklit edin!',
    difficulty: '10/10',
    soundHint: '🐐 Keçi Bağırması Çalıyor'
  },
  {
    prompt: 'En tiz bebek sesiyle masadaki birine sipariş veriyormuş gibi yapın!',
    difficulty: '9/10',
    soundHint: '🦆 Palyaço Kornası Çalıyor'
  },
  {
    prompt: 'Gözlerinizi kısmadan birbirinizin saçına bakın ve ciddiyetle "Çok felsefi bir saç" deyin!',
    difficulty: '8/10',
    soundHint: '🎺 Absürt Boru Sesi Çalıyor'
  },
  {
    prompt: 'Kafanızı ağır çekimde sallayın ve derin bir iç çekerek "Ah gençlik ah..." deyin!',
    difficulty: '8/10',
    soundHint: '🐐 Absürt Yay Efekti Çalıyor'
  }
];

export const DONT_LAUGH_PENALTIES = [
  'Kaybeden masadaki herkese komik bir itiraf yapar veya fıstık/içecek ikram eder!',
  'Kaybeden bir sonraki tura kadar masadaki herkesle yalnızca fısıltıyla konuşur!',
  'Kaybeden telefonundaki en komik/garip fotoğrafı masaya göstermek zorundadır!',
  'Kaybeden masadakilerin seçeceği acı/ekşi bir cezayı afiyetle yer!',
  'Kaybeden 30 saniye boyunca bir penguen gibi yürüyerek masanın etrafında döner!',
  'Kaybeden masadaki birine çok aşırı ve yapmacık bir hayranlık mektubu okur!'
];

interface DontLaughModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const DontLaughModal: React.FC<DontLaughModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  // Players from table
  const [players, setPlayers] = useState<TablePlayer[]>(() => loadTablePlayers());
  const [p1Idx, setP1Idx] = useState(0);
  const [p2Idx, setP2Idx] = useState(1);

  // Match state
  const [currentRound, setCurrentRound] = useState(1);
  const totalRounds = 3;
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);

  // Live Duel Stopwatch (in seconds)
  const [secondsElapsed, setSecondsElapsed] = useState(18);
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // Risk meters (%)
  const [p1Risk, setP1Risk] = useState(15);
  const [p2Risk, setP2Risk] = useState(82);

  // Active Trap Card
  const [trapIndex, setTrapIndex] = useState(0);
  const [activeSoundCue, setActiveSoundCue] = useState('🐐 Absürt Ses Efekti: Keçi Bağırması');
  const [isSoundPulsing, setIsSoundPulsing] = useState(false);

  // Penalty
  const [penaltyText, setPenaltyText] = useState(DONT_LAUGH_PENALTIES[0]);

  // Modals & Popups
  const [showRefereeBustModal, setShowRefereeBustModal] = useState(false);
  const [roundWinnerPopup, setRoundWinnerPopup] = useState<{
    loserName: string;
    winnerName: string;
    reason: string;
  } | null>(null);
  const [matchChampion, setMatchChampion] = useState<{ name: string; score: number } | null>(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showPlayerPicker, setShowPlayerPicker] = useState(false);
  const [isHapticOn, setIsHapticOn] = useState(soundEngine.hapticsEnabled);

  // Init / reset match
  const initMatch = useCallback(() => {
    const tableList = loadTablePlayers();
    setPlayers(tableList);
    if (tableList.length >= 2) {
      setP1Idx(0);
      setP2Idx(1);
    }
    setCurrentRound(1);
    setP1Score(0);
    setP2Score(0);
    setSecondsElapsed(0);
    setIsTimerRunning(true);
    setP1Risk(15);
    setP2Risk(35);
    setTrapIndex(0);
    setPenaltyText(DONT_LAUGH_PENALTIES[Math.floor(Math.random() * DONT_LAUGH_PENALTIES.length)]);
    setRoundWinnerPopup(null);
    setMatchChampion(null);
    setShowRefereeBustModal(false);
  }, []);

  useEffect(() => {
    if (isOpen) {
      initMatch();
    }
  }, [isOpen, initMatch]);

  // Live Timer Loop
  useEffect(() => {
    if (!isOpen || !isTimerRunning || showRefereeBustModal || roundWinnerPopup || matchChampion) {
      return;
    }

    const interval = setInterval(() => {
      setSecondsElapsed((prev) => {
        const next = prev + 1;
        // Slowly increase risk as tension builds
        if (next % 5 === 0) {
          setP1Risk((r) => Math.min(95, r + Math.floor(Math.random() * 4) + 1));
          setP2Risk((r) => Math.min(95, r + Math.floor(Math.random() * 5) + 1));
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, isTimerRunning, showRefereeBustModal, roundWinnerPopup, matchChampion]);

  if (!isOpen) return null;

  const player1 = players[p1Idx % (players.length || 1)] || { name: 'Selin', avatar: '' };
  const player2 = players[p2Idx % (players.length || 1)] || { name: 'Arda', avatar: '' };
  const currentTrap = LAUGH_TRAPS[trapIndex % LAUGH_TRAPS.length];

  // Format MM:SS
  const mins = Math.floor(secondsElapsed / 60);
  const secs = secondsElapsed % 60;
  const timeFormatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  // Toggle Timer
  const handleToggleTimer = () => {
    soundEngine.playClick();
    setIsTimerRunning(!isTimerRunning);
    onShowToast(isTimerRunning ? '⏸️ Süre Duraklatıldı' : '▶️ Süre Devam Ediyor');
  };

  // Play Absurd Sound
  const handleTriggerAbsurdSound = () => {
    const cue = soundEngine.playAbsurdSound();
    setActiveSoundCue(cue);
    setIsSoundPulsing(true);
    setTimeout(() => setIsSoundPulsing(false), 600);

    // Boost risks on funny sound!
    setP1Risk((r) => Math.min(98, r + Math.floor(Math.random() * 12) + 6));
    setP2Risk((r) => Math.min(98, r + Math.floor(Math.random() * 15) + 8));

    onShowToast('🔊 Absürt Ses Fırlatıldı! Gülmek Yasak!');
  };

  // Roll New Trap
  const handleNextTrap = () => {
    soundEngine.playClick();
    soundEngine.triggerHaptic('tap');
    setTrapIndex((prev) => (prev + 1) % LAUGH_TRAPS.length);
    onShowToast('🎲 Yeni Gülmeme Tuzağı Belirlendi!');
  };

  // Both Endure Button (+20 bonus / resilience)
  const handleBothEndure = () => {
    soundEngine.playSuccess();
    soundEngine.triggerHaptic('touch');
    setSecondsElapsed((prev) => prev + 20);
    // Relief risk slightly
    setP1Risk((r) => Math.max(10, r - 15));
    setP2Risk((r) => Math.max(10, r - 15));
    handleNextTrap();
    onShowToast('🛡️ İkisi de Taş Yüz! +20 saniye eklendi!');
  };

  // Open Referee Bust Selector
  const handleOpenBustModal = () => {
    soundEngine.playBuzzer();
    soundEngine.triggerHaptic('alert');
    setShowRefereeBustModal(true);
  };

  // Record who smiled/cracked
  const handleRecordLoser = (loser: 'p1' | 'p2') => {
    setShowRefereeBustModal(false);

    const loserName = loser === 'p1' ? player1.name : player2.name;
    const winnerName = loser === 'p1' ? player2.name : player1.name;

    if (loser === 'p1') {
      setP2Score((s) => s + 1);
    } else {
      setP1Score((s) => s + 1);
    }

    soundEngine.playVictory();
    soundEngine.triggerHaptic('win');

    try {
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.5 },
        colors: ['#bef264', '#f751a1', '#4cd7f6']
      });
    } catch {
      // ignore
    }

    setRoundWinnerPopup({
      loserName,
      winnerName,
      reason: `${loserName} tebessüm etti / kahkaha attı!`
    });
  };

  // Proceed to Next Round or Finish Match
  const handleAdvanceRound = () => {
    setRoundWinnerPopup(null);

    if (currentRound < totalRounds) {
      setCurrentRound((r) => r + 1);
      setSecondsElapsed(0);
      setIsTimerRunning(true);
      setP1Risk(15);
      setP2Risk(25);
      handleNextTrap();
      soundEngine.playClick();
      onShowToast(`🔥 Raund ${currentRound + 1} Başladı!`);
    } else {
      // Match Finished!
      soundEngine.playVictory();
      soundEngine.triggerHaptic('win');

      try {
        confetti({
          particleCount: 150,
          spread: 100,
          origin: { y: 0.4 },
          colors: ['#bef264', '#f751a1', '#4cd7f6', '#ffb0cd']
        });
      } catch {
        // ignore
      }

      const champ =
        p1Score > p2Score
          ? { name: player1.name, score: p1Score }
          : p2Score > p1Score
          ? { name: player2.name, score: p2Score }
          : { name: 'Dostluk Kazandı (Taş Yüz Beraberliği)', score: p1Score };

      setMatchChampion(champ);
    }
  };

  // Toggle Haptic
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2 select-none font-body-md text-on-surface antialiased">
      <div className="relative w-full max-w-md h-[88dvh] sm:h-[92vh] max-h-[840px] bg-[#0a0e18] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        {/* ================= FIXED TOP HEADER ================= */}
        <header className="w-full pt-safe bg-[#0a0e18]/90 backdrop-blur-xl border-b border-white/10 shrink-0">
          <div className="h-16 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#f751a1] via-[#571bc1] to-[#bef264] flex items-center justify-center text-white shadow-[0_0_15px_rgba(247,81,161,0.35)] shrink-0">
                <span className="text-xl">😐</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-base text-white tracking-tight leading-none truncate">
                    Gülmeme Düellosu
                  </h1>
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shrink-0" />
                </div>
                <span className="text-[10px] text-[#4cd7f6] tracking-wider uppercase font-mono mt-1 truncate">
                  1v1 Göz Göze • Taş Yüz Arenası
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowPlayerPicker(true);
                }}
                className="h-9 px-2.5 rounded-xl bg-[#1c1f2a] hover:bg-white/10 border border-[#bef264]/30 text-[#bef264] flex items-center gap-1 text-xs font-bold shadow-sm active:scale-95 transition-all"
                title="Oyuncuları Seç"
              >
                <Users className="w-3.5 h-3.5 text-[#bef264]" />
                <span>İsim Seç</span>
              </button>

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
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 py-3 pb-16 flex flex-col gap-3 no-scrollbar">

        {/* Top Match Bar: Unified Round + Live Timer + Rules */}
        <div className="flex items-center justify-between bg-[#111827] px-3 py-1.5 rounded-xl border border-white/10 shrink-0 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-bold text-gray-200">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
            <span className="font-mono text-xs">Raund {currentRound}/{totalRounds}</span>
          </div>

          {/* Center Clickable Live Timer */}
          <button
            type="button"
            onClick={handleToggleTimer}
            className="flex items-center gap-1.5 bg-[#1E293B] hover:bg-[#262a35] px-3 py-1 rounded-full border border-[#bef264]/40 shadow-sm active:scale-95 transition-transform cursor-pointer"
            title="Süreyi Duraklat / Başlat"
          >
            <Timer className="w-3.5 h-3.5 text-[#bef264] animate-pulse shrink-0" />
            <span className="text-xs font-black font-mono text-[#bef264] tracking-wider">
              {timeFormatted}
            </span>
            <span className="text-[9px] text-gray-400 font-bold ml-0.5">
              {isTimerRunning ? '⏸️' : '▶️'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setShowInfoModal(true)}
            className="text-[10px] font-bold text-[#4cd7f6] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <HelpCircle className="w-3 h-3 shrink-0" />
            <span>Kural</span>
          </button>
        </div>

        {/* 1v1 Face-Off Arena - Compact Side-by-Side 2-Column */}
        <div className="relative bg-[#111827] rounded-2xl p-2 sm:p-2.5 border border-white/10 shrink-0 shadow-lg">
          <div className="grid grid-cols-2 gap-2 relative">
            {/* Center VS Badge */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-6 h-6 rounded-full bg-gradient-to-tr from-[#f751a1] to-[#571bc1] text-white flex items-center justify-center font-black text-[10px] shadow-lg border-2 border-[#111827]">
              VS
            </div>

            {/* Player 1 Card (Ice Cold / Safe) */}
            <div
              onClick={() => setShowPlayerPicker(true)}
              className="bg-[#1E293B]/95 rounded-xl p-2 flex flex-col gap-1 border border-[#4cd7f6]/30 cursor-pointer active:scale-98 transition-all min-w-0"
              title="1. Oyuncuyu Değiştir"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-[#0a0e18] border-2 border-[#4cd7f6]/70 shrink-0">
                  {player1.avatar ? (
                    <img src={player1.avatar} alt={player1.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-black text-xs text-[#4cd7f6]">
                      {player1.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#10B981] rounded-full border border-[#1E293B]" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black text-white truncate leading-tight">{player1.name}</span>
                    <span className="text-[9px] text-gray-400 shrink-0">✏️</span>
                  </div>
                  <span className="text-[9px] font-bold text-[#4cd7f6] truncate">🥶 Buz Yüz</span>
                </div>
              </div>
              {/* Risk Bar */}
              <div className="w-full bg-[#0a0e18] h-1.5 rounded-full overflow-hidden mt-0.5">
                <div className="bg-[#4cd7f6] h-full rounded-full transition-all duration-300" style={{ width: `${p1Risk}%` }} />
              </div>
              <div className="flex justify-between text-[8px] sm:text-[9px] text-gray-400 font-bold px-0.5">
                <span className="text-[#4cd7f6]">%{p1Risk} Risk</span>
                <span>🗿 Taş Yüz</span>
              </div>
            </div>

            {/* Player 2 Card (Laugh Risk / High) */}
            <div
              onClick={() => setShowPlayerPicker(true)}
              className="bg-[#1E293B]/95 rounded-xl p-2 flex flex-col gap-1 border border-red-500/40 cursor-pointer active:scale-98 transition-all min-w-0"
              title="2. Oyuncuyu Değiştir"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-[#0a0e18] border-2 border-red-500/70 shrink-0">
                  {player2.avatar ? (
                    <img src={player2.avatar} alt={player2.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-black text-xs text-[#f751a1]">
                      {player2.name.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#1E293B] animate-pulse" />
                </div>
                <div className="flex flex-col min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black text-white truncate leading-tight">{player2.name}</span>
                    <span className="text-[9px] text-gray-400 shrink-0">✏️</span>
                  </div>
                  <span className="text-[9px] font-bold text-red-400 truncate">🤭 Patlıyor!</span>
                </div>
              </div>
              {/* Risk Bar */}
              <div className="w-full bg-[#0a0e18] h-1.5 rounded-full overflow-hidden mt-0.5">
                <div className="bg-gradient-to-r from-amber-400 to-red-500 h-full rounded-full transition-all duration-300" style={{ width: `${p2Risk}%` }} />
              </div>
              <div className="flex justify-between text-[8px] sm:text-[9px] text-gray-400 font-bold px-0.5">
                <span className="text-red-400 font-bold">%{p2Risk} Risk</span>
                <span className="text-amber-400">💥 Kritik</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Provocation / Laugh Trap Card */}
        <div className="relative bg-[#111827] rounded-2xl p-3 shadow-xl flex flex-col gap-2 border border-white/10 shrink-0">
          <div className="flex items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="w-5 h-5 rounded-full bg-[#bef264]/10 text-[#bef264] flex items-center justify-center text-xs font-bold shrink-0">
                🎲
              </span>
              <span className="text-xs font-black text-[#bef264] tracking-wide uppercase truncate">
                Masa Tuzağı
              </span>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[9px] font-bold bg-[#313540] px-2 py-0.5 rounded-full text-gray-300">
                Zorluk: {currentTrap.difficulty}
              </span>
              <button
                type="button"
                onClick={handleNextTrap}
                className="text-[10px] sm:text-[11px] text-gray-200 hover:text-[#bef264] bg-white/10 hover:bg-white/15 px-2 py-0.5 rounded-lg font-bold flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                title="Yeni Tuzak"
              >
                <RefreshCw className="w-3 h-3 text-[#bef264]" />
                <span>Değiştir</span>
              </button>
            </div>
          </div>

          {/* Active Trap Prompt Box */}
          <div className="bg-[#171b26] rounded-xl p-3 border border-white/5 shadow-inner">
            <p className="text-xs sm:text-sm text-white text-center font-bold italic leading-relaxed">
              “{currentTrap.prompt}”
            </p>
          </div>

          {/* Sound Cue Trigger */}
          <div
            onClick={handleTriggerAbsurdSound}
            role="button"
            tabIndex={0}
            className={`flex items-center justify-between bg-[#1E293B] px-3 py-1.5 rounded-xl cursor-pointer hover:bg-[#262a35] active:scale-98 transition-all border ${
              isSoundPulsing ? 'border-[#bef264] shadow-[0_0_15px_rgba(190,242,100,0.5)]' : 'border-white/5'
            }`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce shrink-0" />
              <span className="text-[11px] font-bold text-gray-200 truncate">
                {activeSoundCue}
              </span>
            </div>
            <span className="text-xs font-black text-[#bef264] shrink-0 ml-2">
              Sesi Çal 🔊
            </span>
          </div>
        </div>

        {/* Table Judging / Referee Interactive Triggers */}
        <div className="flex flex-col gap-2 shrink-0">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
              MASADAN HAKEM KARARI
            </span>
            <span className="text-[10px] font-bold text-[#f751a1] flex items-center gap-1">
              <Gavel className="w-3 h-3" />
              <span>Tüm Masa İzliyor</span>
            </span>
          </div>

          {/* Primary Whistle / Buzz Button */}
          <button
            type="button"
            onClick={handleOpenBustModal}
            className="w-full bg-gradient-to-r from-[#f751a1] via-pink-600 to-[#571bc1] active:scale-[0.98] transition-transform rounded-2xl py-3 px-3 flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(247,81,161,0.45)] text-white font-black text-xs sm:text-sm uppercase tracking-wide cursor-pointer min-w-0"
          >
            <AlertTriangle className="w-4 h-4 text-white animate-pulse shrink-0" />
            <span className="truncate">🚨 İLK GÜLENİ YAKALA (ELENDİ!)</span>
          </button>

          {/* Secondary Actions Row */}
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleTriggerAbsurdSound}
              className="bg-[#1E293B] hover:bg-[#262a35] active:scale-[0.97] transition-all rounded-xl py-2 px-2 flex items-center justify-center gap-1.5 text-white shadow-md border border-white/5 cursor-pointer min-w-0"
            >
              <Zap className="w-3.5 h-3.5 text-[#4cd7f6] shrink-0" />
              <span className="text-xs font-bold truncate">Absürt Ses 🐐</span>
            </button>

            <button
              type="button"
              onClick={handleBothEndure}
              className="bg-[#1E293B] hover:bg-[#262a35] active:scale-[0.97] transition-all rounded-xl py-2 px-2 flex items-center justify-center gap-1.5 text-[#bef264] shadow-md border border-white/5 cursor-pointer min-w-0"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#bef264] shrink-0" />
              <span className="text-xs font-bold truncate">Dayandılar (+20s)</span>
            </button>
          </div>
        </div>

        {/* Penalty & Duel Score Card */}
        <div className="bg-[#111827] rounded-2xl p-3 flex flex-col gap-1.5 shadow-lg mb-1 border border-white/10 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-amber-400 text-sm">⚠️</span>
              <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">
                GECENİN MASA CEZASI
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setPenaltyText(
                  DONT_LAUGH_PENALTIES[Math.floor(Math.random() * DONT_LAUGH_PENALTIES.length)]
                );
              }}
              className="text-[10px] font-bold text-gray-400 hover:text-amber-400 transition-colors cursor-pointer"
            >
              Yeni Ceza 🔄
            </button>
          </div>

          <div className="bg-[#0a0e18] rounded-xl p-2.5 flex items-start gap-2 border border-white/5 shadow-inner">
            <span className="text-lg leading-none">🥜</span>
            <p className="text-xs text-gray-300 flex-1 leading-snug">
              {penaltyText}
            </p>
          </div>

          {/* Match Standings */}
          <div className="flex items-center justify-between pt-0.5 px-0.5 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400 font-bold">Skor:</span>
              <span className="font-black text-[#4cd7f6]">
                {player1.name} {p1Score}
              </span>
              <span className="text-gray-500 font-bold">-</span>
              <span className="font-black text-red-400">
                {player2.name} {p2Score}
              </span>
            </div>
            <span className="text-[10px] font-bold text-gray-400">
              {currentRound === totalRounds ? '🏆 Final Raundu' : `Raund ${currentRound}/${totalRounds}`}
            </span>
          </div>
        </div>

        {/* Bottom clearance spacer */}
        <div className="h-8 w-full shrink-0 pointer-events-none" aria-hidden="true" />

        {/* ================= REFEREE BUST DECISION MODAL ================= */}
        {showRefereeBustModal && (
          <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
            <div className="bg-[#111827] border-2 border-red-500/50 p-6 rounded-3xl max-w-sm w-full shadow-[0_0_50px_rgba(239,68,68,0.4)] flex flex-col items-center text-center gap-4 relative">
              <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/40 flex items-center justify-center text-3xl shadow-lg animate-bounce">
                🚨
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] font-black text-red-400 uppercase tracking-widest">
                  HAKEM DÜDÜĞÜ ÇALINDI!
                </span>
                <h3 className="text-xl font-black text-white mt-1">
                  İlk Kim Güldü / Yüzünü Bozdu?
                </h3>
                <p className="text-xs text-gray-300 mt-0.5">
                  Masa kararını versin! Gülüp elenen kişiyi seçin:
                </p>
              </div>

              <div className="w-full flex flex-col gap-2 pt-1">
                <button
                  onClick={() => handleRecordLoser('p1')}
                  className="w-full py-3.5 rounded-2xl bg-[#1E293B] hover:bg-red-500/20 border border-white/10 hover:border-red-500 text-white font-black text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-between px-4"
                >
                  <span className="text-[#4cd7f6]">{player1.name} Güldü! 😭</span>
                  <span className="text-red-400 text-[10px] font-bold">Elenir</span>
                </button>

                <button
                  onClick={() => handleRecordLoser('p2')}
                  className="w-full py-3.5 rounded-2xl bg-[#1E293B] hover:bg-red-500/20 border border-white/10 hover:border-red-500 text-white font-black text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-between px-4"
                >
                  <span className="text-[#f751a1]">{player2.name} Güldü! 😭</span>
                  <span className="text-red-400 text-[10px] font-bold">Elenir</span>
                </button>
              </div>

              <button
                onClick={() => setShowRefereeBustModal(false)}
                className="text-xs text-gray-400 hover:text-white font-bold transition-colors pt-1"
              >
                İptal (Yanlış Alarm, Devam Et)
              </button>
            </div>
          </div>
        )}

        {/* ================= ROUND WINNER MODAL ================= */}
        {roundWinnerPopup && (
          <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
            <div className="bg-[#111827] border-2 border-[#bef264]/40 p-6 rounded-3xl max-w-sm w-full shadow-2xl flex flex-col items-center text-center gap-3.5 relative overflow-hidden">
              <div className="w-16 h-16 rounded-full bg-[#bef264] text-[#0B0F19] flex items-center justify-center text-3xl shadow-lg">
                🏆
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] font-black text-[#bef264] uppercase tracking-widest">
                  RAUND {currentRound} KAZANANI
                </span>
                <h3 className="text-xl font-black text-white mt-0.5">
                  {roundWinnerPopup.winnerName} Taş Yüzünü Korudu! 🗿
                </h3>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                  {roundWinnerPopup.reason}
                </p>
              </div>

              {/* Penalty Box */}
              <div className="w-full bg-[#1E293B] p-3 rounded-2xl border border-white/10 text-left">
                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest block mb-0.5">
                  ÖDENECEK CEZA ({roundWinnerPopup.loserName})
                </span>
                <p className="text-xs text-gray-200 font-medium leading-relaxed">
                  "{penaltyText}"
                </p>
              </div>

              <button
                onClick={handleAdvanceRound}
                className="w-full py-3.5 bg-gradient-to-r from-[#bef264] to-lime-400 text-black font-black text-xs uppercase tracking-wider rounded-full shadow-md active:scale-95 transition-all mt-1"
              >
                {currentRound < totalRounds
                  ? `Sonraki Raunda Geç (0${currentRound + 1}/0${totalRounds})`
                  : 'Şampiyonu İlan Et & Sonuçları Gör 🏆'}
              </button>
            </div>
          </div>
        )}

        {/* ================= MATCH CHAMPION MODAL ================= */}
        {matchChampion && (
          <div className="fixed inset-0 z-70 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
            <div className="bg-[#111827] border-2 border-yellow-500/50 p-6 rounded-3xl max-w-sm w-full shadow-[0_0_60px_rgba(234,179,8,0.4)] flex flex-col items-center text-center gap-3 relative">
              <div className="w-20 h-20 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-4xl shadow-lg animate-bounce">
                👑
              </div>

              <span className="text-[11px] font-black text-yellow-400 uppercase tracking-widest">
                GÜLMEME DÜELLOSU ŞAMPİYONU
              </span>

              <h2 className="text-2xl font-black text-white">{matchChampion.name}</h2>

              <p className="text-xs text-gray-300">
                Buz gibi ciddiyetini koruyarak 3 raundluk meydan okumayı kazandı!
              </p>

              {/* Final Scores */}
              <div className="w-full bg-[#1E293B] p-3 rounded-2xl border border-white/10 flex items-center justify-around my-1">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-400">{player1.name}</span>
                  <span className="text-xl font-black text-[#4cd7f6]">{p1Score} Puan</span>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-400">{player2.name}</span>
                  <span className="text-xl font-black text-red-400">{p2Score} Puan</span>
                </div>
              </div>

              <div className="w-full flex flex-col gap-2 pt-1">
                <button
                  onClick={initMatch}
                  className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#bef264] to-lime-400 text-black font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all"
                >
                  Rövanş Maçı Başlat ⚔️
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-full bg-[#1E293B] text-gray-300 font-bold text-xs hover:bg-[#262a35] active:scale-95 transition-all"
                >
                  Oyunlar Menüsüne Dön
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ================= PLAYER PICKER MODAL ================= */}
        {showPlayerPicker && (
          <div className="fixed inset-0 z-70 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
            <div className="bg-[#111827] border border-white/15 p-5 rounded-3xl max-w-sm w-full shadow-2xl flex flex-col gap-3.5 text-left">
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <h3 className="text-base font-black text-white">Düello Oyuncularını Seç</h3>
                <button
                  onClick={() => setShowPlayerPicker(false)}
                  className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-col gap-3">
                <div>
                  <span className="text-xs font-bold text-[#4cd7f6] block mb-1.5 flex items-center justify-between">
                    <span>1. Oyuncu (Buz Yüz):</span>
                    <span className="text-[10px] text-gray-400 font-mono">Seçilen: {player1.name}</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                    {players.map((p, idx) => (
                      <button
                        key={`p1-${p.id || idx}`}
                        type="button"
                        onClick={() => {
                          setP1Idx(idx);
                          soundEngine.playClick();
                        }}
                        className={`p-2 rounded-xl text-xs font-bold text-left border transition-all flex items-center gap-2 cursor-pointer active:scale-95 ${
                          p1Idx === idx
                            ? 'bg-[#4cd7f6]/20 border-[#4cd7f6] text-white shadow-md'
                            : 'bg-[#1E293B] border-white/5 text-gray-300 hover:border-white/20'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-black/40 shrink-0">
                          {p.avatar ? (
                            <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-[10px] text-white">
                              {p.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="truncate flex-1">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-bold text-[#f751a1] block mb-1.5 flex items-center justify-between">
                    <span>2. Oyuncu (Meydan Okuyan):</span>
                    <span className="text-[10px] text-gray-400 font-mono">Seçilen: {player2.name}</span>
                  </span>
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                    {players.map((p, idx) => (
                      <button
                        key={`p2-${p.id || idx}`}
                        type="button"
                        onClick={() => {
                          setP2Idx(idx);
                          soundEngine.playClick();
                        }}
                        className={`p-2 rounded-xl text-xs font-bold text-left border transition-all flex items-center gap-2 cursor-pointer active:scale-95 ${
                          p2Idx === idx
                            ? 'bg-[#f751a1]/20 border-[#f751a1] text-white shadow-md'
                            : 'bg-[#1E293B] border-white/5 text-gray-300 hover:border-white/20'
                        }`}
                      >
                        <div className="w-6 h-6 rounded-full overflow-hidden bg-black/40 shrink-0">
                          {p.avatar ? (
                            <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center font-bold text-[10px] text-white">
                              {p.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <span className="truncate flex-1">{p.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowPlayerPicker(false)}
                className="w-full py-3 bg-[#bef264] text-black font-black text-xs uppercase tracking-wider rounded-full shadow-md active:scale-95 transition-all mt-1"
              >
                Seçimi Kaydet
              </button>
            </div>
          </div>
        )}

        {/* ================= RULES MINI MODAL ================= */}
        {showInfoModal && (
          <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
            <div className="w-full max-w-sm sm:max-w-md bg-[#111827] border border-white/15 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-left relative">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">😐</span>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Gülmeme Düellosu Kuralları
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
                <div>
                  <strong className="text-white block font-bold mb-1">Temel Kural:</strong>
                  İki oyuncu göz göze bakar. Gülmek, tebessüm etmek, diş göstermek veya kıkırdamak kesinlikle yasaktır!
                </div>

                <div>
                  <strong className="text-white block font-bold mb-1">Kahkaha Tuzakları &amp; Absürt Sesler:</strong>
                  Ekrana gelen kışkırtıcı komutları oyuncular sırayla veya aynı anda yerine getirmek zorundadır. Masa hakemleri dilediği zaman "Absürt Ses Fırlat" butonuna basarak gülme baskısını artırabilir!
                </div>

                <div>
                  <strong className="text-white block font-bold mb-1">Hakem Düdüğü &amp; Eleme:</strong>
                  Masadaki izleyiciler ilk güleni gördüğü anda <strong className="text-[#f751a1]">"İLK GÜLENİ YAKALA"</strong> butonuna basar ve gülen kişiyi seçer. O raundu ciddiyetini koruyan oyuncu kazanır!
                </div>

                <div>
                  <strong className="text-white block font-bold mb-1">3 Raundluk Maç:</strong>
                  Toplam 3 raund oynanır. En çok puanı alan Taş Yüz Şampiyonu olur!
                </div>
              </div>

              <button
                onClick={() => setShowInfoModal(false)}
                className="w-full py-3 rounded-full bg-gradient-to-r from-[#bef264] to-lime-400 text-black font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all mt-1"
              >
                Anladım, Düelloya Dön 😐
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
