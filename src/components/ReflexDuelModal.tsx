import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/audio';
import { TablePlayer } from '../utils/playerManager';
import {
  X,
  Zap,
  RotateCcw,
  Trophy,
  AlertTriangle,
  Play,
  Flame,
  Volume2,
  VolumeX,
  Sparkles,
  Users,
  Timer,
  ChevronRight,
  ShieldAlert,
  Award
} from 'lucide-react';

interface ReflexDuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  players?: TablePlayer[];
  onShowToast: (msg: string) => void;
}

type GamePhase = 'idle' | 'waiting' | 'ready' | 'round_end' | 'game_over';

interface PlayerRoundResult {
  tapped: boolean;
  timeMs: number | null;
  earlyTap: boolean;
}

const PENALTY_PRESETS = [
  '☕ Masanın kahve/çay hesabını öder',
  '💃 Masanın önünde 15 saniye dans eder',
  '🎭 Kazananın istediği bir taklidi yapar',
  '🧊 Bir bardak buz gibi suyu tek dikişte içer',
  '📱 Kazanan, kaybedenin hikayesine bir emoji bırakır',
  '🤫 Sonraki oyun boyunca sadece fısıldayarak konuşur'
];

export const ReflexDuelModal: React.FC<ReflexDuelModalProps> = ({
  isOpen,
  onClose,
  players = [],
  onShowToast
}) => {
  // Player state
  const [player1Name, setPlayer1Name] = useState<string>('Oyuncu 1');
  const [player2Name, setPlayer2Name] = useState<string>('Oyuncu 2');
  const [player1Avatar, setPlayer1Avatar] = useState<string>('');
  const [player2Avatar, setPlayer2Avatar] = useState<string>('');

  // Target score (First to 3, 5, or 7)
  const [targetScore, setTargetScore] = useState<number>(3);
  const [selectedPenalty, setSelectedPenalty] = useState<string>(PENALTY_PRESETS[0]);
  const [customPenalty, setCustomPenalty] = useState<string>('');
  const [isPenaltyModalOpen, setIsPenaltyModalOpen] = useState(false);

  // Match state
  const [phase, setPhase] = useState<GamePhase>('idle');
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [p1Score, setP1Score] = useState<number>(0);
  const [p2Score, setP2Score] = useState<number>(0);

  // Round telemetry
  const [p1Result, setP1Result] = useState<PlayerRoundResult | null>(null);
  const [p2Result, setP2Result] = useState<PlayerRoundResult | null>(null);
  const [roundWinner, setRoundWinner] = useState<'p1' | 'p2' | 'tie' | null>(null);
  const [roundWinnerReason, setRoundWinnerReason] = useState<string>('');

  // Best times records
  const [fastestP1Time, setFastestP1Time] = useState<number | null>(null);
  const [fastestP2Time, setFastestP2Time] = useState<number | null>(null);
  const [p1History, setP1History] = useState<number[]>([]);
  const [p2History, setP2History] = useState<number[]>([]);

  // Sound and settings
  const [soundActive, setSoundActive] = useState<boolean>(true);

  // Timing references
  const waitTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const signalStartTimeRef = useRef<number>(0);
  const roundHandledRef = useRef<boolean>(false);

  // Initialize player names from active table
  useEffect(() => {
    if (players && players.length >= 2) {
      setPlayer1Name(players[0].name);
      setPlayer1Avatar(players[0].avatar || '');
      setPlayer2Name(players[1].name);
      setPlayer2Avatar(players[1].avatar || '');
    } else if (players && players.length === 1) {
      setPlayer1Name(players[0].name);
      setPlayer1Avatar(players[0].avatar || '');
      setPlayer2Name('Meydan Okuyan');
    } else {
      setPlayer1Name('Selin');
      setPlayer2Name('Efe');
    }
  }, [players, isOpen]);

  // Cleanup timers on unmount / close
  useEffect(() => {
    return () => {
      if (waitTimeoutRef.current) clearTimeout(waitTimeoutRef.current);
    };
  }, []);

  // Reset match entirely
  const resetMatch = useCallback(() => {
    if (waitTimeoutRef.current) clearTimeout(waitTimeoutRef.current);
    setPhase('idle');
    setRoundNumber(1);
    setP1Score(0);
    setP2Score(0);
    setP1Result(null);
    setP2Result(null);
    setRoundWinner(null);
    setRoundWinnerReason('');
    setFastestP1Time(null);
    setFastestP2Time(null);
    setP1History([]);
    setP2History([]);
    roundHandledRef.current = false;
  }, []);

  // Start next round sequence
  const startRound = useCallback(() => {
    if (waitTimeoutRef.current) clearTimeout(waitTimeoutRef.current);
    roundHandledRef.current = false;
    setP1Result(null);
    setP2Result(null);
    setRoundWinner(null);
    setRoundWinnerReason('');
    setPhase('waiting');

    soundEngine.playTone(320, 0.1, 'sine');
    soundEngine.triggerHaptic('tick');

    // Snappy, intense suspense window between 0.9s and 2.3s
    const randomDelay = Math.floor(Math.random() * 1400) + 900;

    waitTimeoutRef.current = setTimeout(() => {
      signalStartTimeRef.current = performance.now();
      setPhase('ready');
      // High-pitched reaction buzzer & intense haptic pulse
      soundEngine.playTone(880, 0.15, 'sawtooth');
      soundEngine.triggerHaptic('urgent');
    }, randomDelay);
  }, []);

  // Finish match with celebration
  const finishMatch = useCallback((winner: 'p1' | 'p2') => {
    setPhase('game_over');
    soundEngine.playVictory();
    soundEngine.triggerHaptic('win');
    try {
      confetti({
        particleCount: 140,
        spread: 90,
        origin: { y: 0.5 },
        colors: winner === 'p1' ? ['#bef264', '#10b981', '#ffffff'] : ['#f751a1', '#d0bcff', '#ffffff']
      });
    } catch {
      // ignore
    }
  }, []);

  // Player Tap Handler
  const handlePlayerTap = (player: 'p1' | 'p2') => {
    if (roundHandledRef.current) return;

    // 1. EARLY TAP PENALTY in 'waiting' phase!
    if (phase === 'waiting') {
      roundHandledRef.current = true;
      if (waitTimeoutRef.current) clearTimeout(waitTimeoutRef.current);

      soundEngine.playTone(180, 0.25, 'triangle');
      soundEngine.triggerHaptic('alert');

      if (player === 'p1') {
        setP1Result({ tapped: true, timeMs: null, earlyTap: true });
        setP2Result({ tapped: false, timeMs: null, earlyTap: false });
        setRoundWinner('p2');
        setRoundWinnerReason(`${player1Name} ERKEN BASTI! Kural ihlali (-1 Ceza)`);
        setP2Score((prev) => {
          const next = prev + 1;
          if (next >= targetScore) finishMatch('p2');
          return next;
        });
      } else {
        setP2Result({ tapped: true, timeMs: null, earlyTap: true });
        setP1Result({ tapped: false, timeMs: null, earlyTap: false });
        setRoundWinner('p1');
        setRoundWinnerReason(`${player2Name} ERKEN BASTI! Kural ihlali (-1 Ceza)`);
        setP1Score((prev) => {
          const next = prev + 1;
          if (next >= targetScore) finishMatch('p1');
          return next;
        });
      }

      setPhase('round_end');
      return;
    }

    // 2. VALID TAP in 'ready' phase!
    if (phase === 'ready') {
      roundHandledRef.current = true;
      const tapTime = performance.now();
      const reactionMs = Math.round(tapTime - signalStartTimeRef.current);

      soundEngine.playTone(660, 0.08, 'sine');
      soundEngine.triggerHaptic('touch');

      const isSub190 = reactionMs < 190;

      if (player === 'p1') {
        setP1Result({ tapped: true, timeMs: reactionMs, earlyTap: false });
        setP2Result({ tapped: false, timeMs: null, earlyTap: false });
        setRoundWinner('p1');
        setP1History((prev) => [...prev, reactionMs]);
        setFastestP1Time((prev) => (prev === null ? reactionMs : Math.min(prev, reactionMs)));

        const reason = isSub190
          ? `⚡ IŞIK HIZI! ${player1Name} ${reactionMs} ms ile rekor kırdı!`
          : `🎯 ${player1Name} kazandı! (${reactionMs} ms)`;
        setRoundWinnerReason(reason);

        setP1Score((prev) => {
          const next = prev + 1;
          if (next >= targetScore) {
            finishMatch('p1');
          } else {
            setPhase('round_end');
          }
          return next;
        });
      } else {
        setP2Result({ tapped: true, timeMs: reactionMs, earlyTap: false });
        setP1Result({ tapped: false, timeMs: null, earlyTap: false });
        setRoundWinner('p2');
        setP2History((prev) => [...prev, reactionMs]);
        setFastestP2Time((prev) => (prev === null ? reactionMs : Math.min(prev, reactionMs)));

        const reason = isSub190
          ? `⚡ IŞIK HIZI! ${player2Name} ${reactionMs} ms ile rekor kırdı!`
          : `🎯 ${player2Name} kazandı! (${reactionMs} ms)`;
        setRoundWinnerReason(reason);

        setP2Score((prev) => {
          const next = prev + 1;
          if (next >= targetScore) {
            finishMatch('p2');
          } else {
            setPhase('round_end');
          }
          return next;
        });
      }
    }
  };

  if (!isOpen) return null;

  const matchWinner = p1Score >= targetScore ? 'p1' : p2Score >= targetScore ? 'p2' : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-2 select-none">
      {/* Container simulating head-to-head mobile duel layout */}
      <div className="relative w-full max-w-md h-[94dvh] sm:h-[96vh] max-h-[880px] bg-[#0a0e18] border border-white/10 rounded-3xl overflow-hidden flex flex-col justify-between shadow-2xl">
        
        {/* ========================================================= */}
        {/* TOP PLAYER (PLAYER 2) - ROTATED 180° FOR OPPONENT EYE CONTACT */}
        {/* ========================================================= */}
        <div
          className={`relative flex-1 flex flex-col justify-between p-4 transition-all duration-300 transform rotate-180 border-b border-white/10 ${
            phase === 'waiting'
              ? 'bg-gradient-to-b from-red-950/30 to-transparent'
              : phase === 'ready'
              ? 'bg-gradient-to-b from-[#f751a1]/30 to-[#bef264]/20'
              : roundWinner === 'p2'
              ? 'bg-[#f751a1]/15'
              : 'bg-[#111827]/60'
          }`}
        >
          {/* Top Bar for Player 2 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {player2Avatar ? (
                <img
                  src={player2Avatar}
                  alt={player2Name}
                  className="w-10 h-10 rounded-2xl object-cover ring-2 ring-[#f751a1]"
                />
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#f751a1] to-purple-600 flex items-center justify-center font-black text-white text-base shadow-lg">
                  {player2Name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h4 className="text-white font-black text-sm tracking-wide flex items-center gap-1.5">
                  <span>{player2Name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#f751a1]/20 text-[#f751a1] font-mono">
                    P2
                  </span>
                </h4>
                <div className="text-[10px] text-gray-400 font-mono">
                  {fastestP2Time ? `En İyi: ${fastestP2Time} ms` : 'Hazır'}
                </div>
              </div>
            </div>

            {/* Score Dots */}
            <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full border border-white/10">
              <span className="text-xs font-black text-[#f751a1] font-mono mr-1">
                {p2Score}
              </span>
              {Array.from({ length: targetScore }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    idx < p2Score
                      ? 'bg-[#f751a1] shadow-[0_0_10px_#f751a1] scale-110'
                      : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Player 2 Tap Trigger Pad */}
          <div className="flex-1 flex flex-col items-center justify-center my-2">
            <button
              onClick={() => handlePlayerTap('p2')}
              disabled={phase === 'idle' || phase === 'round_end' || phase === 'game_over'}
              className={`w-full h-full max-h-[170px] rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.97] touch-manipulation relative overflow-hidden border ${
                phase === 'waiting'
                  ? 'bg-red-500/10 border-red-500/40 text-red-300 active:bg-red-500/30'
                  : phase === 'ready'
                  ? 'bg-[#bef264] border-white text-black font-black shadow-[0_0_35px_rgba(190,242,100,0.8)] animate-pulse'
                  : roundWinner === 'p2'
                  ? 'bg-[#f751a1]/20 border-[#f751a1] text-[#f751a1]'
                  : 'bg-white/5 border-white/10 text-gray-400'
              }`}
            >
              <Zap
                className={`w-9 h-9 ${
                  phase === 'ready'
                    ? 'text-black fill-black animate-bounce'
                    : phase === 'waiting'
                    ? 'text-red-400'
                    : 'text-gray-500'
                }`}
              />
              <span className="text-base font-black tracking-wider uppercase">
                {phase === 'waiting'
                  ? 'BEKLE! (Erken Basma)'
                  : phase === 'ready'
                  ? 'ŞİMDİ VUR! ⚡'
                  : p2Result?.earlyTap
                  ? 'ERKEN BASTIN (-1)'
                  : p2Result?.timeMs
                  ? `${p2Result.timeMs} ms`
                  : 'DOKUNMA ALANI'}
              </span>
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* CENTER CONTROL STRIP & RADAR ARENA */}
        {/* ========================================================= */}
        <div className="relative bg-[#0d121f] border-y border-white/10 px-4 py-3 z-20 flex flex-col gap-2.5">
          {/* Header Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#bef264]/20 border border-[#bef264]/30 flex items-center justify-center text-[#bef264]">
                <Zap className="w-4 h-4 fill-[#bef264]" />
              </div>
              <div>
                <span className="text-xs font-black text-white tracking-wide">
                  1v1 REFLEKS DÜELLOSU
                </span>
                <span className="text-[10px] text-gray-400 block font-mono">
                  Raund {roundNumber} / Hedef {targetScore}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  const n = soundEngine.toggleSound();
                  setSoundActive(n);
                }}
                className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white"
                title="Ses Aç/Kapat"
              >
                {soundActive ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={resetMatch}
                className="w-8 h-8 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-300 hover:text-white"
                title="Sıfırla"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-300 hover:bg-red-500/30"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Center Dynamic Radar Display */}
          <div className="relative py-2 px-3 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between overflow-hidden">
            {phase === 'idle' && (
              <div className="w-full flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-gray-300">
                    Ceza: <span className="text-[#bef264]">{selectedPenalty.slice(0, 26)}...</span>
                  </span>
                  <button
                    onClick={() => setIsPenaltyModalOpen(true)}
                    className="text-[10px] text-cyan-400 underline text-left mt-0.5 hover:text-cyan-300"
                  >
                    Cezayı Değiştir
                  </button>
                </div>
                <button
                  onClick={startRound}
                  className="px-4 py-2 rounded-xl bg-[#bef264] text-black font-black text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(190,242,100,0.5)] active:scale-95"
                >
                  <Play className="w-3.5 h-3.5 fill-black" />
                  <span>DÜELLOYU BAŞLAT</span>
                </button>
              </div>
            )}

            {phase === 'waiting' && (
              <div className="w-full flex items-center justify-center gap-3 py-1">
                <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                <span className="text-red-400 font-black text-xs tracking-wider uppercase animate-pulse">
                  BEKLE... YEŞİL IŞIK YANANA KADAR BASMA!
                </span>
                <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
              </div>
            )}

            {phase === 'ready' && (
              <div className="w-full flex items-center justify-center gap-2 py-1">
                <Zap className="w-5 h-5 text-[#bef264] fill-[#bef264] animate-bounce" />
                <span className="text-[#bef264] font-black text-sm tracking-widest uppercase">
                  ŞİMDİ BAS! VUR! VUR!
                </span>
                <Zap className="w-5 h-5 text-[#bef264] fill-[#bef264] animate-bounce" />
              </div>
            )}

            {phase === 'round_end' && (
              <div className="w-full flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-white leading-tight">
                    {roundWinnerReason}
                  </span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    Raund {roundNumber} tamamlandı
                  </span>
                </div>
                <button
                  onClick={() => {
                    setRoundNumber((r) => r + 1);
                    startRound();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-white text-black font-black text-xs flex items-center gap-1 active:scale-95 shadow-md"
                >
                  <span>Sonraki Raund</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* BOTTOM PLAYER (PLAYER 1) - UPRIGHT FOR THIS SIDE */}
        {/* ========================================================= */}
        <div
          className={`relative flex-1 flex flex-col justify-between p-4 transition-all duration-300 border-t border-white/10 ${
            phase === 'waiting'
              ? 'bg-gradient-to-t from-red-950/30 to-transparent'
              : phase === 'ready'
              ? 'bg-gradient-to-t from-[#bef264]/25 to-transparent'
              : roundWinner === 'p1'
              ? 'bg-[#bef264]/15'
              : 'bg-[#111827]/60'
          }`}
        >
          {/* Player 1 Tap Trigger Pad */}
          <div className="flex-1 flex flex-col items-center justify-center my-2">
            <button
              onClick={() => handlePlayerTap('p1')}
              disabled={phase === 'idle' || phase === 'round_end' || phase === 'game_over'}
              className={`w-full h-full max-h-[170px] rounded-2xl flex flex-col items-center justify-center gap-2 transition-all active:scale-[0.97] touch-manipulation relative overflow-hidden border ${
                phase === 'waiting'
                  ? 'bg-red-500/10 border-red-500/40 text-red-300 active:bg-red-500/30'
                  : phase === 'ready'
                  ? 'bg-[#bef264] border-white text-black font-black shadow-[0_0_35px_rgba(190,242,100,0.8)] animate-pulse'
                  : roundWinner === 'p1'
                  ? 'bg-[#bef264]/20 border-[#bef264] text-[#bef264]'
                  : 'bg-white/5 border-white/10 text-gray-400'
              }`}
            >
              <Zap
                className={`w-9 h-9 ${
                  phase === 'ready'
                    ? 'text-black fill-black animate-bounce'
                    : phase === 'waiting'
                    ? 'text-red-400'
                    : 'text-gray-500'
                }`}
              />
              <span className="text-base font-black tracking-wider uppercase">
                {phase === 'waiting'
                  ? 'BEKLE! (Erken Basma)'
                  : phase === 'ready'
                  ? 'ŞİMDİ VUR! ⚡'
                  : p1Result?.earlyTap
                  ? 'ERKEN BASTIN (-1)'
                  : p1Result?.timeMs
                  ? `${p1Result.timeMs} ms`
                  : 'DOKUNMA ALANI'}
              </span>
            </button>
          </div>

          {/* Bottom Bar for Player 1 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {player1Avatar ? (
                <img
                  src={player1Avatar}
                  alt={player1Name}
                  className="w-10 h-10 rounded-2xl object-cover ring-2 ring-[#bef264]"
                />
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#bef264] to-emerald-600 flex items-center justify-center font-black text-black text-base shadow-lg">
                  {player1Name.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h4 className="text-white font-black text-sm tracking-wide flex items-center gap-1.5">
                  <span>{player1Name}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#bef264]/20 text-[#bef264] font-mono">
                    P1
                  </span>
                </h4>
                <div className="text-[10px] text-gray-400 font-mono">
                  {fastestP1Time ? `En İyi: ${fastestP1Time} ms` : 'Hazır'}
                </div>
              </div>
            </div>

            {/* Score Dots */}
            <div className="flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full border border-white/10">
              <span className="text-xs font-black text-[#bef264] font-mono mr-1">
                {p1Score}
              </span>
              {Array.from({ length: targetScore }).map((_, idx) => (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    idx < p1Score
                      ? 'bg-[#bef264] shadow-[0_0_10px_#bef264] scale-110'
                      : 'bg-white/10'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* GAME OVER WINNER CELEBRATION MODAL OVERLAY */}
        {/* ========================================================= */}
        {phase === 'game_over' && matchWinner && (
          <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#bef264] to-emerald-400 p-0.5 shadow-[0_0_40px_rgba(190,242,100,0.5)] mb-4 animate-bounce">
              <div className="w-full h-full bg-[#0a0e18] rounded-[22px] flex items-center justify-center">
                <Trophy className="w-10 h-10 text-[#bef264]" />
              </div>
            </div>

            <span className="text-xs font-black text-[#bef264] tracking-widest uppercase">
              DÜELLONUN ŞAMPİYONU
            </span>
            <h2 className="text-3xl font-black text-white mt-1 mb-2">
              {matchWinner === 'p1' ? player1Name : player2Name} KAZANDI!
            </h2>

            {/* Final Score Card */}
            <div className="flex items-center gap-4 bg-white/5 border border-white/10 px-5 py-2.5 rounded-2xl my-3">
              <div className="text-right">
                <div className="text-xs font-bold text-gray-300">{player1Name}</div>
                <div className="text-xl font-mono font-black text-[#bef264]">{p1Score}</div>
              </div>
              <div className="text-gray-500 font-black text-sm">VS</div>
              <div className="text-left">
                <div className="text-xs font-bold text-gray-300">{player2Name}</div>
                <div className="text-xl font-mono font-black text-[#f751a1]">{p2Score}</div>
              </div>
            </div>

            {/* Execution of the Penalty */}
            <div className="w-full max-w-xs bg-red-500/10 border border-red-500/30 rounded-2xl p-3 my-2 text-left">
              <div className="flex items-center gap-1.5 text-red-400 text-xs font-black mb-1">
                <ShieldAlert className="w-4 h-4" />
                <span>KAYBEDENİN CEZASI:</span>
              </div>
              <p className="text-xs text-red-200">
                {matchWinner === 'p1' ? player2Name : player1Name},{' '}
                <span className="font-bold underline">{selectedPenalty}</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 w-full max-w-xs mt-4">
              <button
                onClick={resetMatch}
                className="flex-1 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Rövanş Maçı</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-2xl bg-[#bef264] text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(190,242,100,0.4)] active:scale-95 transition-all"
              >
                <Award className="w-4 h-4" />
                <span>Kabul Et & Kapat</span>
              </button>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* PENALTY & STAKES SETTINGS SHEET */}
        {/* ========================================================= */}
        {isPenaltyModalOpen && (
          <div className="absolute inset-0 z-40 bg-black/90 backdrop-blur-md p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-[#bef264]" />
                  <span>Düello Cezasını Seç</span>
                </h3>
                <button
                  onClick={() => setIsPenaltyModalOpen(false)}
                  className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-gray-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Rounds Target */}
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-400 block mb-1.5">Hedef Skor</label>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 5, 7].map((num) => (
                    <button
                      key={num}
                      onClick={() => setTargetScore(num)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                        targetScore === num
                          ? 'bg-[#bef264] text-black border-[#bef264]'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:border-white/20'
                      }`}
                    >
                      İlk {num} Olan
                    </button>
                  ))}
                </div>
              </div>

              {/* Presets List */}
              <div className="flex flex-col gap-2 max-h-[260px] overflow-y-auto no-scrollbar">
                {PENALTY_PRESETS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setSelectedPenalty(p);
                      setIsPenaltyModalOpen(false);
                      onShowToast('Ceza güncellendi!');
                    }}
                    className={`p-2.5 rounded-xl text-left text-xs font-semibold border transition-all ${
                      selectedPenalty === p
                        ? 'bg-[#bef264]/20 border-[#bef264] text-[#bef264]'
                        : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* Custom Penalty input */}
              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Kendi cezanı yaz..."
                  value={customPenalty}
                  onChange={(e) => setCustomPenalty(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#bef264]"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-white/10">
              <button
                onClick={() => {
                  if (customPenalty.trim()) {
                    setSelectedPenalty(customPenalty.trim());
                  }
                  setIsPenaltyModalOpen(false);
                }}
                className="w-full py-2.5 rounded-xl bg-[#bef264] text-black font-black text-xs"
              >
                Cezayı Kaydet
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
