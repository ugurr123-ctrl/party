import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Zap,
  Shield,
  RotateCcw,
  Sparkles,
  Trophy,
  Bot,
  User,
  Users,
  HelpCircle,
  Vibrate,
  Lock,
  Unlock,
  Check,
  EyeOff,
  Flame,
  ArrowRight
} from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { TablePlayer, loadTablePlayers } from '../utils/playerManager';

export type MoveType = 'tas' | 'kagit' | 'makas';
export type PowerType = 'cift-hasar' | 'ayna' | 'surpriz' | 'kalkan' | null;

interface PowerCardDef {
  id: PowerType;
  title: string;
  icon: string;
  desc: string;
  badge: string;
}

const POWER_CARDS: PowerCardDef[] = [
  {
    id: 'cift-hasar',
    title: '2x Çift Hasar',
    icon: '⚡',
    desc: 'Bu tur kazanırsan hanene +2 puan yazılır',
    badge: 'Hücum'
  },
  {
    id: 'ayna',
    title: 'Yansıtma Aynası',
    icon: '🔄',
    desc: 'Rakip kazanırsa beraberlik ilan edilir',
    badge: 'Savunma'
  },
  {
    id: 'surpriz',
    title: 'Sürpriz Hamle',
    icon: '🃏',
    desc: 'Beraberlik durumunda otomatik zafer',
    badge: 'Taktik'
  },
  {
    id: 'kalkan',
    title: 'Çelik Kalkan',
    icon: '🛡️',
    desc: 'Yenilirsen rakip puan kazanamaz',
    badge: 'Koruma'
  }
];

const MOVE_DETAILS: Record<MoveType, { name: string; icon: string; verb: string; color: string }> = {
  tas: { name: 'Taş', icon: '🪨', verb: 'Vuruş', color: '#ffb0cd' },
  kagit: { name: 'Kâğıt', icon: '📄', verb: 'Kapsama', color: '#4cd7f6' },
  makas: { name: 'Makas', icon: '✂️', verb: 'Kesme', color: '#bef264' }
};

interface RockPaperScissorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const RockPaperScissorsModal: React.FC<RockPaperScissorsModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  // Registered players
  const [tablePlayers, setTablePlayers] = useState<TablePlayer[]>(() => loadTablePlayers());

  // Game configuration
  const [gameMode, setGameMode] = useState<'pass_play' | 'vs_bot'>('pass_play');
  const [currentRound, setCurrentRound] = useState(1);
  const totalRounds = 5;

  // Players info
  const [p1Name, setP1Name] = useState('Efe');
  const [p2Name, setP2Name] = useState('Selin');
  const [p1Score, setP1Score] = useState(0);
  const [p2Score, setP2Score] = useState(0);

  // Power uses left (1 use per match per player)
  const [p1PowersUsed, setP1PowersUsed] = useState<Record<string, boolean>>({});
  const [p2PowersUsed, setP2PowersUsed] = useState<Record<string, boolean>>({});

  // Active selections for round
  // In pass_play:
  // Step: 'p1_turn' -> 'p1_locked_handover' -> 'p2_turn' -> 'clash_countdown' -> 'round_result'
  const [activeStep, setActiveStep] = useState<'p1_turn' | 'p1_locked_handover' | 'p2_turn' | 'clash_countdown' | 'round_result'>('p1_turn');

  // Player 1 selections
  const [p1Move, setP1Move] = useState<MoveType>('tas');
  const [p1Power, setP1Power] = useState<PowerType>('kalkan');

  // Player 2 selections
  const [p2Move, setP2Move] = useState<MoveType>('tas');
  const [p2Power, setP2Power] = useState<PowerType>('cift-hasar');

  // Clash countdown & Round outcome
  const [clashCountdownText, setClashCountdownText] = useState('3, 2, 1 KARTLARI AÇ!');
  const [roundResult, setRoundResult] = useState<{
    winner: 'p1' | 'p2' | 'tie';
    headline: string;
    description: string;
    p1PointsAwarded: number;
    p2PointsAwarded: number;
  } | null>(null);

  // Overall match winner modal
  const [matchWinner, setMatchWinner] = useState<{ name: string; score: number } | null>(null);

  // Settings & Helpers
  const [isHapticOn, setIsHapticOn] = useState(soundEngine.hapticsEnabled);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Reset or load players on open
  useEffect(() => {
    if (isOpen) {
      const players = loadTablePlayers();
      setTablePlayers(players);
      if (players.length >= 2) {
        setP1Name(players[0].name);
        setP2Name(players[1].name);
      } else if (players.length === 1) {
        setP1Name(players[0].name);
        setP2Name('Neon Bot');
        setGameMode('vs_bot');
      }
      resetMatch();
    }
  }, [isOpen]);

  const resetMatch = () => {
    setCurrentRound(1);
    setP1Score(0);
    setP2Score(0);
    setP1PowersUsed({});
    setP2PowersUsed({});
    setP1Move('tas');
    setP2Move('tas');
    setP1Power(null);
    setP2Power(null);
    setActiveStep(gameMode === 'pass_play' ? 'p1_turn' : 'p2_turn');
    setRoundResult(null);
    setMatchWinner(null);
    setClashCountdownText('3, 2, 1 KARTLARI AÇ!');
  };

  // Bot move & power generator
  const generateBotMove = (): { move: MoveType; power: PowerType } => {
    const moves: MoveType[] = ['tas', 'kagit', 'makas'];
    const randomMove = moves[Math.floor(Math.random() * moves.length)];

    // Check available powers
    const availablePowers = POWER_CARDS.filter((p) => !p1PowersUsed[p.id || '']);
    let chosenPower: PowerType = null;
    // 60% chance bot uses power if available
    if (availablePowers.length > 0 && Math.random() < 0.6) {
      chosenPower = availablePowers[Math.floor(Math.random() * availablePowers.length)].id;
    }
    return { move: randomMove, power: chosenPower };
  };

  // Switch game mode
  const handleToggleMode = (mode: 'pass_play' | 'vs_bot') => {
    soundEngine.playClick();
    setGameMode(mode);
    if (mode === 'vs_bot') {
      setP1Name('Neon Bot');
      setActiveStep('p2_turn');
    } else {
      const players = loadTablePlayers();
      setP1Name(players[0]?.name || 'Oyuncu 1');
      setP2Name(players[1]?.name || 'Oyuncu 2');
      setActiveStep('p1_turn');
    }
    resetMatch();
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

  // Calculate battle outcome considering power cards
  const executeClash = (
    move1: MoveType,
    power1: PowerType,
    move2: MoveType,
    power2: PowerType
  ) => {
    let rawWinner: 'p1' | 'p2' | 'tie' = 'tie';

    if (move1 === move2) {
      rawWinner = 'tie';
    } else if (
      (move1 === 'tas' && move2 === 'makas') ||
      (move1 === 'makas' && move2 === 'kagit') ||
      (move1 === 'kagit' && move2 === 'tas')
    ) {
      rawWinner = 'p1';
    } else {
      rawWinner = 'p2';
    }

    let finalWinner = rawWinner;
    let description = '';
    let p1Points = 0;
    let p2Points = 0;

    // Verb description
    const verb1 =
      move1 === 'tas' && move2 === 'makas'
        ? 'Taş, Makası kırar!'
        : move1 === 'makas' && move2 === 'kagit'
        ? 'Makas, Kâğıdı keser!'
        : move1 === 'kagit' && move2 === 'tas'
        ? 'Kâğıt, Taşı sarar!'
        : '';

    const verb2 =
      move2 === 'tas' && move1 === 'makas'
        ? 'Taş, Makası kırar!'
        : move2 === 'makas' && move1 === 'kagit'
        ? 'Makas, Kâğıdı keser!'
        : move2 === 'kagit' && move1 === 'tas'
        ? 'Kâğıt, Taşı sarar!'
        : '';

    // Power modifier: Surprise Move on Tie
    if (rawWinner === 'tie') {
      if (power1 === 'surpriz' && power2 !== 'surpriz') {
        finalWinner = 'p1';
        description = `İki oyuncu da ${MOVE_DETAILS[move1].name} açtı! ${p1Name} "Sürpriz Hamle" kartıyla beraberliği bozdu ve kazandı!`;
      } else if (power2 === 'surpriz' && power1 !== 'surpriz') {
        finalWinner = 'p2';
        description = `İki oyuncu da ${MOVE_DETAILS[move2].name} açtı! ${p2Name} "Sürpriz Hamle" kartıyla beraberliği bozdu ve kazandı!`;
      } else {
        description = `İki taraf da ${MOVE_DETAILS[move1].name} açtı. Beraberlik!`;
      }
    }

    // Power modifier: Mirror on loss
    if (finalWinner === 'p1' && power2 === 'ayna') {
      finalWinner = 'tie';
      description = `${verb1} Ancak ${p2Name} "Yansıtma Aynası" kullandı ve hamleyi nötrleyerek beraberlik ilan edildi!`;
    } else if (finalWinner === 'p2' && power1 === 'ayna') {
      finalWinner = 'tie';
      description = `${verb2} Ancak ${p1Name} "Yansıtma Aynası" kullandı ve hamleyi nötrleyerek beraberlik ilan edildi!`;
    }

    // Calculate Points & Shield
    if (finalWinner === 'p1') {
      if (power2 === 'kalkan') {
        p1Points = 0;
        description = `${verb1} Ancak ${p2Name}'in "Çelik Kalkan"ı puan kaybını engelledi (0 Puan).`;
      } else {
        p1Points = power1 === 'cift-hasar' ? 2 : 1;
        description =
          description ||
          `${verb1} ${power1 === 'cift-hasar' ? '2x Çift Hasar uygulandı (+2 Puan)!' : '(+1 Puan)'}`;
      }
    } else if (finalWinner === 'p2') {
      if (power1 === 'kalkan') {
        p2Points = 0;
        description = `${verb2} Ancak ${p1Name}'in "Çelik Kalkan"ı puan kaybını engelledi (0 Puan).`;
      } else {
        p2Points = power2 === 'cift-hasar' ? 2 : 1;
        description =
          description ||
          `${verb2} ${power2 === 'cift-hasar' ? '2x Çift Hasar uygulandı (+2 Puan)!' : '(+1 Puan)'}`;
      }
    }

    // Mark powers used
    if (power1) setP1PowersUsed((prev) => ({ ...prev, [power1]: true }));
    if (power2) setP2PowersUsed((prev) => ({ ...prev, [power2]: true }));

    // Apply scores
    setP1Score((s) => s + p1Points);
    setP2Score((s) => s + p2Points);

    const headline =
      finalWinner === 'p1'
        ? `${p1Name} Kazandı! 💥`
        : finalWinner === 'p2'
        ? `${p2Name} Kazandı! 💥`
        : 'Beraberlik! 🤝';

    setRoundResult({
      winner: finalWinner,
      headline,
      description,
      p1PointsAwarded: p1Points,
      p2PointsAwarded: p2Points
    });

    // Sound and vibration
    if (finalWinner !== 'tie') {
      soundEngine.playSuccess();
      soundEngine.triggerHaptic('win');
      try {
        confetti({
          particleCount: 75,
          spread: 70,
          origin: { y: 0.5 },
          colors: ['#bef264', '#f751a1', '#4cd7f6']
        });
      } catch {
        // ignore
      }
    } else {
      soundEngine.playTone(350, 0.2, 'triangle');
      soundEngine.triggerHaptic('alert');
    }
  };

  // Trigger Countdown Clash Animation
  const startClashShowdown = (finalP1Move: MoveType, finalP1Power: PowerType, finalP2Move: MoveType, finalP2Power: PowerType) => {
    setActiveStep('clash_countdown');
    soundEngine.playCountdown();
    soundEngine.triggerHaptic('touch');
    setClashCountdownText('3...');

    setTimeout(() => {
      soundEngine.playCountdown();
      soundEngine.triggerHaptic('touch');
      setClashCountdownText('2...');

      setTimeout(() => {
        soundEngine.playCountdown();
        soundEngine.triggerHaptic('urgent');
        setClashCountdownText('1... KARTLARI AÇ! 💥');

        setTimeout(() => {
          executeClash(finalP1Move, finalP1Power, finalP2Move, finalP2Power);
          setActiveStep('round_result');
          setClashCountdownText('HAMLELER AÇILDI!');
        }, 350);
      }, 320);
    }, 320);
  };

  // Player 1 locks their move
  const handleLockP1 = () => {
    soundEngine.playClick();
    soundEngine.triggerHaptic('drop');

    if (gameMode === 'pass_play') {
      setActiveStep('p1_locked_handover');
      onShowToast(`🔒 ${p1Name} hamlesini kilitledi! Cihazı ${p2Name}'e verin.`);
    }
  };

  // Player 2 confirms privacy and takes phone
  const handleHandoverToP2 = () => {
    soundEngine.playClick();
    soundEngine.triggerHaptic('tap');
    setActiveStep('p2_turn');
  };

  // Player 2 locks their move (or in Bot mode, trigger showdown)
  const handleLockP2AndClash = () => {
    soundEngine.playClick();
    soundEngine.triggerHaptic('drop');

    if (gameMode === 'vs_bot') {
      const botPick = generateBotMove();
      setP1Move(botPick.move);
      setP1Power(botPick.power);
      startClashShowdown(botPick.move, botPick.power, p2Move, p2Power);
    } else {
      startClashShowdown(p1Move, p1Power, p2Move, p2Power);
    }
  };

  // Proceed to next round or finish match
  const handleNextRound = () => {
    soundEngine.playClick();

    if (currentRound < totalRounds) {
      setCurrentRound((r) => r + 1);
      setRoundResult(null);
      // Reset selected moves for new round
      setP1Move('tas');
      setP2Move('tas');
      setP1Power(null);
      setP2Power(null);
      setClashCountdownText('3, 2, 1 KARTLARI AÇ!');
      setActiveStep(gameMode === 'pass_play' ? 'p1_turn' : 'p2_turn');
      onShowToast(`⚡ Tur 0${currentRound + 1} Başladı!`);
    } else {
      // 5 Rounds Completed! Announce Match Winner
      soundEngine.playVictory();
      soundEngine.triggerHaptic('win');

      try {
        confetti({
          particleCount: 140,
          spread: 90,
          origin: { y: 0.4 },
          colors: ['#bef264', '#f751a1', '#4cd7f6', '#ffb0cd']
        });
      } catch {
        // ignore
      }

      const matchChamp =
        p1Score > p2Score
          ? { name: p1Name, score: p1Score }
          : p2Score > p1Score
          ? { name: p2Name, score: p2Score }
          : { name: 'Dostluk Kazandı (Beraberlik)', score: p1Score };

      setMatchWinner(matchChamp);
    }
  };

  if (!isOpen) return null;

  const isP1Turn = activeStep === 'p1_turn';
  const isP2Turn = activeStep === 'p2_turn';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2 select-none font-body-md">
      <div className="relative w-full max-w-md h-[94dvh] sm:h-[96vh] max-h-[890px] bg-[#0a0e18] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        {/* ================= FIXED TOP HEADER ================= */}
        <header className="w-full pt-safe bg-[#0a0e18]/90 backdrop-blur-xl border-b border-white/10 shrink-0">
          <div className="h-16 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#571bc1] via-[#009eb9] to-[#bef264] flex items-center justify-center text-white shadow-[0_0_15px_rgba(76,215,246,0.35)] shrink-0">
                <span className="text-xl">✂️</span>
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-base text-white tracking-tight leading-none truncate">
                    Taş Kâğıt Makas 2.0
                  </h1>
                  <span className="text-[#bef264] text-xs">⚡</span>
                </div>
                <span className="text-[10px] text-[#4cd7f6] tracking-wider uppercase font-mono mt-1 truncate">
                  Düello Arenası • Yüksek Voltaj
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
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3 no-scrollbar">

        {/* Game Mode Switcher & Round Meta Header */}
        <div className="flex items-center justify-between bg-[#111827] p-2.5 sm:p-3 rounded-2xl border border-white/10 shadow-md relative overflow-hidden">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleToggleMode('pass_play')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                gameMode === 'pass_play'
                  ? 'bg-gradient-to-r from-[#571bc1] to-[#009eb9] text-white shadow-[0_0_12px_rgba(76,215,246,0.4)]'
                  : 'bg-[#1E293B] text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>2 Kişi (Elden Ele)</span>
            </button>

            <button
              onClick={() => handleToggleMode('vs_bot')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                gameMode === 'vs_bot'
                  ? 'bg-gradient-to-r from-[#f751a1] to-[#571bc1] text-white shadow-[0_0_12px_rgba(247,81,161,0.4)]'
                  : 'bg-[#1E293B] text-gray-400 hover:text-white'
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>Bot Düello</span>
            </button>
          </div>

          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-[#4cd7f6] uppercase tracking-wider">
              Aşama
            </span>
            <div className="flex items-center gap-1">
              <span className="text-base sm:text-lg font-black text-[#bef264]">
                Tur 0{currentRound}
              </span>
              <span className="text-xs text-gray-400 font-bold">/ 0{totalRounds}</span>
            </div>
          </div>
        </div>

        {/* ================= PRIVACY HANDOVER CURTAIN (Pass-and-Play) ================= */}
        {activeStep === 'p1_locked_handover' && (
          <div className="w-full bg-[#111827] border-2 border-[#4cd7f6]/40 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center gap-4 animate-in fade-in zoom-in-95 my-2">
            <div className="w-16 h-16 rounded-full bg-[#4cd7f6]/20 border border-[#4cd7f6]/50 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(76,215,246,0.3)] animate-pulse">
              🔒
            </div>

            <div className="flex flex-col">
              <span className="text-[11px] font-black uppercase text-[#4cd7f6] tracking-widest">
                Hamle Kilitlendi
              </span>
              <h3 className="text-xl font-black text-white mt-1">
                {p1Name} Hamlesini Seçti!
              </h3>
              <p className="text-xs text-gray-300 mt-1 max-w-xs leading-relaxed">
                Hamleler gizli tutuluyor. Lütfen telefonu şimdi <strong>{p2Name}</strong>'e verin!
              </p>
            </div>

            <button
              onClick={handleHandoverToP2}
              className="w-full py-4 rounded-full bg-gradient-to-r from-[#f751a1] to-pink-600 text-white font-black text-sm uppercase tracking-wider shadow-[0_0_25px_rgba(247,81,161,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <span>Ben {p2Name}'im, Hamlemi Seçeceğim</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Regular Game Arena Interface (Hidden only during handover curtain) */}
        {activeStep !== 'p1_locked_handover' && (
          <>
            {/* PLAYER 1 ZONE (Opponent / Cyan High-Voltage) */}
            <div
              className={`w-full bg-[#111827] rounded-3xl p-4 sm:p-5 flex flex-col gap-3 relative overflow-hidden shadow-xl border transition-all ${
                isP1Turn
                  ? 'border-[#4cd7f6] shadow-[0_0_25px_rgba(76,215,246,0.25)]'
                  : 'border-white/10'
              }`}
            >
              {/* Ambient Glow */}
              <div className="absolute -top-12 -right-12 w-40 h-40 bg-[#4cd7f6]/10 rounded-full blur-2xl pointer-events-none" />

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-[#1E293B] border border-[#4cd7f6]/40 flex items-center justify-center shadow-md">
                      {gameMode === 'vs_bot' ? (
                        <Bot className="w-7 h-7 text-[#4cd7f6]" />
                      ) : (
                        <User className="w-7 h-7 text-[#4cd7f6]" />
                      )}
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#10B981] shadow-sm animate-pulse" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base sm:text-lg font-black text-white">{p1Name}</span>
                      <span className="bg-[#1E293B] text-[#4cd7f6] px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                        {gameMode === 'vs_bot' ? 'Yapay Zeka' : 'Oyuncu 1'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {gameMode === 'vs_bot' ? 'Taktik Bot Rakibi' : 'Karşı Telefon Ucu'}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Skor
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xl sm:text-2xl font-black text-[#4cd7f6]">{p1Score}</span>
                    <span className="text-xs font-bold text-gray-400">Puan</span>
                  </div>
                </div>
              </div>

              {/* If it's P1's turn (in pass-and-play), render P1's interactive controls */}
              {isP1Turn && gameMode === 'pass_play' ? (
                <div className="flex flex-col gap-3 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
                      {p1Name}, Hamleni Seç
                    </span>
                    <span className="text-[11px] font-black text-[#4cd7f6]">
                      {MOVE_DETAILS[p1Move].name} Seçili
                    </span>
                  </div>

                  {/* Move Cards for P1 */}
                  <div className="grid grid-cols-3 gap-2">
                    {(['tas', 'kagit', 'makas'] as MoveType[]).map((m) => {
                      const isSel = p1Move === m;
                      const d = MOVE_DETAILS[m];
                      return (
                        <button
                          key={m}
                          type="button"
                          onClick={() => {
                            soundEngine.playClick();
                            soundEngine.triggerHaptic('tap');
                            setP1Move(m);
                          }}
                          className={`flex flex-col items-center justify-center py-3 px-2 rounded-2xl transition-all active:scale-95 shadow-lg group relative overflow-hidden border ${
                            isSel
                              ? 'bg-[#1E293B] border-[#4cd7f6] text-white shadow-[0_0_15px_rgba(76,215,246,0.3)]'
                              : 'bg-[#171b26] border-white/5 text-gray-400 hover:text-white hover:border-white/20'
                          }`}
                        >
                          <span className="text-2xl sm:text-3xl mb-1 transform group-hover:scale-110 transition-transform">
                            {d.icon}
                          </span>
                          <span className="font-black text-sm tracking-tight">{d.name}</span>
                          <span className="text-[10px] text-gray-400">{d.verb}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Power Cards for P1 */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                        Özel Güç Kartı (1 Hak)
                      </span>
                      <span className="text-[10px] font-bold text-[#bef264]">Taktik Avantajı</span>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      {POWER_CARDS.map((pow) => {
                        const isUsed = p1PowersUsed[pow.id || ''];
                        const isSel = p1Power === pow.id;
                        return (
                          <button
                            key={pow.id}
                            type="button"
                            disabled={isUsed}
                            onClick={() => {
                              soundEngine.playClick();
                              soundEngine.triggerHaptic('tap');
                              setP1Power(isSel ? null : pow.id);
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all active:scale-[0.98] border ${
                              isUsed
                                ? 'opacity-40 bg-black/20 border-white/5 cursor-not-allowed'
                                : isSel
                                ? 'bg-[#1E293B] border-[#4cd7f6] shadow-sm'
                                : 'bg-[#171b26] border-white/5 hover:border-white/15'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-xl bg-[#4cd7f6]/20 text-[#4cd7f6] flex items-center justify-center text-base shrink-0">
                                {pow.icon}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-white truncate">
                                  {pow.title}
                                </span>
                                <span className="text-[10px] text-gray-400 truncate">
                                  {isUsed ? 'Bu maçta kullanıldı' : pow.desc}
                                </span>
                              </div>
                            </div>

                            <div
                              className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                                isSel
                                  ? 'bg-[#4cd7f6] border-[#4cd7f6] text-black font-bold'
                                  : 'border-white/20 bg-transparent text-transparent'
                              }`}
                            >
                              <Check className="w-3.5 h-3.5" />
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* P1 Lock Button */}
                  <button
                    onClick={handleLockP1}
                    className="w-full py-3.5 rounded-full bg-gradient-to-r from-[#009eb9] to-[#4cd7f6] text-black font-black text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(76,215,246,0.4)] active:scale-95 transition-all flex items-center justify-center gap-2 mt-1"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Hamlemi Kilitle 👉 ({p2Name}'e Devret)</span>
                  </button>
                </div>
              ) : (
                /* Static / Locked Pill when not P1's turn */
                <>
                  <div className="flex items-center justify-between bg-[#0B0F19] px-3 py-2.5 rounded-xl border border-white/5 shadow-inner">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
                      <span className="text-xs font-bold text-[#4cd7f6]">
                        {gameMode === 'vs_bot' ? 'Bot Hamlesini Kilitledi' : 'Hamle Kilitlendi'}
                      </span>
                      <Lock className="w-3.5 h-3.5 text-[#4cd7f6]" />
                    </div>
                    <span className="text-xs text-gray-400">Gizli Hazır 🤫</span>
                  </div>

                  {/* P1 Active Power Modifier Card Indicator */}
                  {p1Power && (
                    <div className="flex items-center justify-between bg-[#1E293B] p-2 rounded-xl border border-white/5">
                      <div className="flex items-center gap-2">
                        <span className="text-base">
                          {POWER_CARDS.find((p) => p.id === p1Power)?.icon || '⚡'}
                        </span>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-white">
                            {POWER_CARDS.find((p) => p.id === p1Power)?.title || 'Güç Kartı'}
                          </span>
                          <span className="text-[10px] text-gray-400">
                            {POWER_CARDS.find((p) => p.id === p1Power)?.desc}
                          </span>
                        </div>
                      </div>
                      <span className="bg-[#171b26] text-[#4cd7f6] text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                        Aktif
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* CENTER ARENA VS CLASH ELEMENT */}
            <div className="relative py-1 flex items-center justify-center my-[-2px] z-20">
              {/* Horizontal Neon Glow Divider */}
              <div className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-[#4cd7f6] via-[#bef264] to-[#f751a1] opacity-50" />

              <div className="relative bg-[#111827] border border-white/15 px-5 py-2 rounded-full shadow-2xl flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#f751a1] to-[#571bc1] text-white flex items-center justify-center text-xs font-black tracking-tighter shadow-md">
                  VS
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black text-[#bef264] tracking-widest uppercase">
                    Düello Durumu
                  </span>
                  <span className="text-xs sm:text-sm font-black text-white tracking-tight">
                    {clashCountdownText}
                  </span>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-[#bef264] animate-pulse" />
              </div>
            </div>

            {/* PLAYER 2 ZONE (Active Player / Magenta High-Voltage) */}
            <div
              className={`w-full bg-[#111827] rounded-3xl p-4 sm:p-5 flex flex-col gap-3 relative overflow-hidden shadow-2xl border transition-all ${
                isP2Turn
                  ? 'border-[#f751a1] shadow-[0_0_25px_rgba(247,81,161,0.25)]'
                  : 'border-white/10'
              }`}
            >
              {/* Ambient Magenta Glow */}
              <div className="absolute -bottom-10 -left-10 w-44 h-44 bg-[#f751a1]/15 rounded-full blur-3xl pointer-events-none" />

              {/* P2 Header */}
              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-2xl bg-[#f751a1]/20 border border-[#f751a1]/40 flex items-center justify-center text-white shadow-md">
                      <User className="w-7 h-7 text-[#f751a1]" />
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-[#f751a1] animate-pulse" />
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                      <span className="text-base sm:text-lg font-black text-white">{p2Name}</span>
                      <span className="bg-[#1E293B] text-[#f751a1] px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                        {gameMode === 'vs_bot' ? 'Senin Sıran' : 'Oyuncu 2'}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">Gizli Hamleni Seç</span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Skor
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xl sm:text-2xl font-black text-[#f751a1]">{p2Score}</span>
                    <span className="text-xs font-bold text-gray-400">Puan</span>
                  </div>
                </div>
              </div>

              {/* PRIMARY MOVE SELECTION CARDS (Taş, Kâğıt, Makas) */}
              <div className="flex flex-col gap-1.5 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Ana Hamle Seçimi
                  </span>
                  <span className="text-[11px] font-black text-[#f751a1]">
                    {MOVE_DETAILS[p2Move].name} Seçili
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(['tas', 'kagit', 'makas'] as MoveType[]).map((m) => {
                    const isSel = p2Move === m;
                    const d = MOVE_DETAILS[m];
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={() => {
                          soundEngine.playClick();
                          soundEngine.triggerHaptic('tap');
                          setP2Move(m);
                        }}
                        className={`flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl transition-all active:scale-95 shadow-lg group relative overflow-hidden border ${
                          isSel
                            ? 'bg-[#1E293B] border-[#f751a1] text-white shadow-[0_0_20px_rgba(247,81,161,0.35)]'
                            : 'bg-[#171b26] border-white/5 text-gray-400 hover:text-white hover:border-white/20'
                        }`}
                      >
                        <span className="text-3xl mb-1 transform group-hover:scale-110 transition-transform">
                          {d.icon}
                        </span>
                        <span className="font-black text-sm tracking-tight">{d.name}</span>
                        <span className="text-[10px] text-gray-400 group-hover:text-[#f751a1] transition-colors">
                          {d.verb}
                        </span>
                        {isSel && (
                          <div className="absolute inset-0 bg-[#f751a1]/10 rounded-2xl pointer-events-none" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SPECIAL POWER MODIFIER CARDS */}
              <div className="flex flex-col gap-1.5 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
                    Özel Güç Kartı (1 Hak)
                  </span>
                  <span className="text-[10px] font-bold text-[#bef264]">Taktik Avantajı</span>
                </div>

                <div className="flex flex-col gap-1.5">
                  {POWER_CARDS.map((pow) => {
                    const isUsed = p2PowersUsed[pow.id || ''];
                    const isSel = p2Power === pow.id;
                    return (
                      <button
                        key={pow.id}
                        type="button"
                        disabled={isUsed}
                        onClick={() => {
                          soundEngine.playClick();
                          soundEngine.triggerHaptic('tap');
                          setP2Power(isSel ? null : pow.id);
                        }}
                        className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all active:scale-[0.98] border ${
                          isUsed
                            ? 'opacity-40 bg-black/20 border-white/5 cursor-not-allowed'
                            : isSel
                            ? 'bg-[#1E293B] border-[#bef264] shadow-md'
                            : 'bg-[#171b26] border-white/5 hover:border-white/15'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-[#f751a1]/20 text-[#f751a1] flex items-center justify-center text-base shrink-0 shadow-sm">
                            {pow.icon}
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-bold text-white truncate">
                              {pow.title}
                            </span>
                            <span className="text-[10px] text-gray-400 truncate">
                              {isUsed ? 'Bu maçta kullanıldı' : pow.desc}
                            </span>
                          </div>
                        </div>

                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border ${
                            isSel
                              ? 'bg-[#bef264] border-[#bef264] text-black font-bold'
                              : 'border-white/20 bg-[#1E293B] text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* BATTLE ACTION TRIGGER (Active in P2's turn or in Bot mode) */}
              <div className="w-full flex flex-col gap-1.5 mt-1 relative z-10">
                <button
                  type="button"
                  disabled={activeStep === 'clash_countdown'}
                  onClick={handleLockP2AndClash}
                  className="w-full h-14 bg-[#bef264] hover:bg-[#c9f658] text-[#0B0F19] rounded-full font-black text-sm tracking-wide flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(190,242,100,0.45)] active:scale-[0.97] transition-all cursor-pointer disabled:opacity-50"
                >
                  <Unlock className="w-5 h-5 text-black" />
                  <span>HAMLEYİ KİLİTLE &amp; GÖSTER 💥</span>
                </button>

                <div className="flex items-center justify-center gap-1.5 text-center">
                  <EyeOff className="w-3.5 h-3.5 text-gray-400" />
                  <span className="text-[10px] text-gray-400 font-medium">
                    Hamleler iki oyuncu da kilitleyene kadar gizli kalır
                  </span>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ================= CLASH ROUND RESULT MODAL ================= */}
        {roundResult && activeStep === 'round_result' && (
          <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
            <div className="bg-[#111827] border-2 border-[#bef264]/40 p-6 rounded-3xl max-w-sm w-full shadow-[0_0_50px_rgba(190,242,100,0.3)] flex flex-col items-center text-center gap-3.5 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#bef264]/20 rounded-full blur-2xl pointer-events-none" />

              <div className="w-16 h-16 rounded-full bg-[#bef264] text-[#0B0F19] flex items-center justify-center shadow-lg text-2xl font-black">
                {roundResult.winner === 'tie' ? '🤝' : '🎖️'}
              </div>

              <div className="flex flex-col">
                <span className="text-[11px] font-black text-[#bef264] uppercase tracking-widest">
                  Tur 0{currentRound} Sonucu
                </span>
                <h3 className="text-xl font-black text-white mt-0.5">{roundResult.headline}</h3>
                <p className="text-xs text-gray-300 mt-1 leading-relaxed">
                  {roundResult.description}
                </p>
              </div>

              {/* Matchup Comparison Card */}
              <div className="w-full bg-[#1E293B] p-3.5 rounded-2xl border border-white/10 flex items-center justify-around shadow-inner">
                <div className="flex flex-col items-center">
                  <span className="text-3xl mb-1">{MOVE_DETAILS[p1Move].icon}</span>
                  <span className="text-xs font-bold text-gray-300">{p1Name}</span>
                  {roundResult.p1PointsAwarded > 0 && (
                    <span className="text-[10px] font-bold text-[#4cd7f6]">
                      +{roundResult.p1PointsAwarded} Puan
                    </span>
                  )}
                </div>

                <span className="text-base font-black text-[#f751a1]">VS</span>

                <div className="flex flex-col items-center">
                  <span className="text-3xl mb-1">{MOVE_DETAILS[p2Move].icon}</span>
                  <span className="text-xs font-bold text-gray-300">{p2Name}</span>
                  {roundResult.p2PointsAwarded > 0 && (
                    <span className="text-[10px] font-bold text-[#bef264]">
                      +{roundResult.p2PointsAwarded} Puan
                    </span>
                  )}
                </div>
              </div>

              <button
                onClick={handleNextRound}
                className="w-full py-3.5 bg-gradient-to-r from-[#bef264] to-lime-400 text-black font-black text-xs uppercase tracking-wider rounded-full shadow-md active:scale-95 transition-all mt-1"
              >
                {currentRound < totalRounds
                  ? `Sonraki Tura Geç (0${currentRound + 1}/0${totalRounds})`
                  : 'Şampiyonu İlan Et & Sonuçları Gör 🏆'}
              </button>
            </div>
          </div>
        )}

        {/* ================= MATCH WINNER CEREMONY MODAL ================= */}
        {matchWinner && (
          <div className="fixed inset-0 z-70 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
            <div className="bg-[#111827] border-2 border-yellow-500/50 p-6 rounded-3xl max-w-sm w-full shadow-[0_0_60px_rgba(234,179,8,0.4)] flex flex-col items-center text-center gap-3 relative">
              <div className="w-20 h-20 rounded-full bg-yellow-500/20 border border-yellow-500/40 flex items-center justify-center text-4xl shadow-lg animate-bounce">
                🏆
              </div>

              <span className="text-[11px] font-black text-yellow-400 uppercase tracking-widest">
                DÜELLO ŞAMPİYONU
              </span>

              <h2 className="text-2xl font-black text-white">{matchWinner.name}</h2>

              <p className="text-xs text-gray-300">
                5 turluk yüksek voltaj düellonun galibi! Masadaki herkes alkışlasın!
              </p>

              {/* Final Scoreboard */}
              <div className="w-full bg-[#1E293B] p-3 rounded-2xl border border-white/10 flex items-center justify-around my-1">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-400">{p1Name}</span>
                  <span className="text-xl font-black text-[#4cd7f6]">{p1Score} Puan</span>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-400">{p2Name}</span>
                  <span className="text-xl font-black text-[#bef264]">{p2Score} Puan</span>
                </div>
              </div>

              <div className="w-full flex flex-col gap-2 pt-1">
                <button
                  onClick={resetMatch}
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

        {/* ================= RULES / INFO MINI MODAL ================= */}
        {showInfoModal && (
          <div className="fixed inset-0 z-70 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
            <div className="w-full max-w-sm sm:max-w-md bg-[#111827] border border-white/15 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 text-left relative">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✂️</span>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    Taş Kâğıt Makas 2.0 Kuralları
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
                  <strong className="text-white block font-bold mb-1">Klasik Kural:</strong>
                  Taş Makası kırar, Makas Kâğıdı keser, Kâğıt Taşı sarar.
                </div>

                <div>
                  <strong className="text-white block font-bold mb-1">Özel Güç Kartları (Maç Başına 1 Hak):</strong>
                  <ul className="space-y-1.5 list-disc pl-4 text-gray-300 text-xs">
                    <li>
                      <strong className="text-[#bef264]">⚡ 2x Çift Hasar:</strong> O tur kazanırsan hanene +2 puan eklenir.
                    </li>
                    <li>
                      <strong className="text-[#4cd7f6]">🔄 Yansıtma Aynası:</strong> Rakip kazanırsa hamleyi nötrler ve beraberlik ilan edilir.
                    </li>
                    <li>
                      <strong className="text-purple-300">🃏 Sürpriz Hamle:</strong> Hamleler aynı gelirse (beraberlikte) otomatik zafer kazanırsın.
                    </li>
                    <li>
                      <strong className="text-amber-300">🛡️ Çelik Kalkan:</strong> Yenilirsen rakip o tur puan alamaz.
                    </li>
                  </ul>
                </div>

                <div>
                  <strong className="text-white block font-bold mb-1">5 Turluk Şampiyona:</strong>
                  Toplam 5 tur oynanır. En çok puanı toplayan oyuncu Düello Şampiyonu olur!
                </div>
              </div>

              <button
                onClick={() => setShowInfoModal(false)}
                className="w-full py-3 rounded-full bg-gradient-to-r from-[#bef264] to-lime-400 text-black font-black text-xs uppercase tracking-wider shadow-md active:scale-95 transition-all mt-1"
              >
                Anladım, Düelloya Başla 💥
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
