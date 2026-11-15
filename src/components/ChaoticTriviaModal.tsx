import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../utils/audio';
import { TablePlayer } from '../utils/playerManager';
import {
  CHAOTIC_TRIVIA_QUESTIONS,
  TriviaQuestion,
  TriviaOption
} from '../data/triviaQuestions';
import {
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Trophy,
  RotateCcw,
  Flame,
  Zap,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Users,
  Eye,
  ChevronRight,
  Award,
  AlertCircle
} from 'lucide-react';

interface ChaoticTriviaModalProps {
  isOpen: boolean;
  onClose: () => void;
  players?: TablePlayer[];
  onShowToast: (msg: string) => void;
}

interface PlayerAnswerState {
  playerId: string;
  name: string;
  avatar?: string;
  selectedOptionIndex: number | null;
  status: 'thinking' | 'answered' | 'timeout';
  score: number;
}

interface FlyingEmoji {
  id: string;
  emoji: string;
  x: number;
}

const TOTAL_QUESTION_TIME = 15;

export const ChaoticTriviaModal: React.FC<ChaoticTriviaModalProps> = ({
  isOpen,
  onClose,
  players = [],
  onShowToast
}) => {
  // Questions list and current index
  const [questions, setQuestions] = useState<TriviaQuestion[]>(CHAOTIC_TRIVIA_QUESTIONS);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const currentQ = questions[currentIdx] || questions[0];

  // Game state
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(TOTAL_QUESTION_TIME);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [soundActive, setSoundActive] = useState<boolean>(true);

  // Power-ups and Jokers
  const [isDoubleDown, setIsDoubleDown] = useState<boolean>(false);
  const [dedikoduActive, setDedikoduActive] = useState<boolean>(false);
  const [dedikoduUsesLeft, setDedikoduUsesLeft] = useState<number>(1);
  const [eliminatedOptions, setEliminatedOptions] = useState<number[]>([]);
  const [fiftyFiftyUsesLeft, setFiftyFiftyUsesLeft] = useState<number>(1);

  // Flying reaction emojis
  const [flyingEmojis, setFlyingEmojis] = useState<FlyingEmoji[]>([]);

  // Simulated live table players state
  const [tablePlayers, setTablePlayers] = useState<PlayerAnswerState[]>([]);

  // Timer Ref
  const timerIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Initialize players from roster or fallback
  useEffect(() => {
    if (!isOpen) return;

    let initialPlayers: PlayerAnswerState[] = [];
    if (players && players.length >= 2) {
      initialPlayers = players.map((p) => ({
        playerId: p.id,
        name: p.name,
        avatar: p.avatar,
        selectedOptionIndex: null,
        status: 'thinking',
        score: p.score || 0
      }));
    } else {
      initialPlayers = [
        { playerId: 'p1', name: 'Selin', selectedOptionIndex: null, status: 'thinking', score: 45 },
        { playerId: 'p2', name: 'Efe', selectedOptionIndex: null, status: 'thinking', score: 35 },
        { playerId: 'p3', name: 'Can', selectedOptionIndex: null, status: 'thinking', score: 20 },
        { playerId: 'p4', name: 'Zeynep', selectedOptionIndex: null, status: 'thinking', score: 30 }
      ];
    }

    setTablePlayers(initialPlayers);
    setCurrentIdx(0);
    setIsGameOver(false);
    resetQuestionState(0, initialPlayers);
  }, [isOpen]);

  // Reset state for a new question
  const resetQuestionState = (qIndex: number, currentPlayersList?: PlayerAnswerState[]) => {
    setIsAnswered(false);
    setSelectedOption(null);
    setIsRevealed(false);
    setTimerSeconds(TOTAL_QUESTION_TIME);
    setIsDoubleDown(false);
    setDedikoduActive(false);
    setEliminatedOptions([]);

    const baseList = currentPlayersList || tablePlayers;
    const targetQ = questions[qIndex] || questions[0];

    // Simulate other table players' randomized thinking and answers
    setTablePlayers(
      baseList.map((p, idx) => {
        // Player 0 is the current device user
        if (idx === 0) {
          return { ...p, selectedOptionIndex: null, status: 'thinking' };
        }
        return {
          ...p,
          selectedOptionIndex: null,
          status: 'thinking'
        };
      })
    );

    // Start timer interval
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerIntervalRef.current!);
          handleTimeout();
          return 0;
        }
        if (prev <= 4) {
          soundEngine.playTone(550, 0.05, 'triangle');
          soundEngine.triggerHaptic('tick');
        }
        return prev - 1;
      });
    }, 1000);

    // Simulate other players locking in answers over random time
    baseList.forEach((_, idx) => {
      if (idx === 0) return;
      const delay = Math.random() * 6000 + 1500;
      setTimeout(() => {
        setTablePlayers((prev) =>
          prev.map((p, pIdx) => {
            if (pIdx === idx && p.status === 'thinking') {
              // Pick random option with slight bias to popular guess or correct
              const correctIdx = targetQ.options.findIndex((o) => o.isCorrect);
              const randOpt =
                Math.random() < 0.5
                  ? correctIdx
                  : Math.floor(Math.random() * targetQ.options.length);
              return {
                ...p,
                selectedOptionIndex: randOpt,
                status: 'answered'
              };
            }
            return p;
          })
        );
      }, delay);
    });
  };

  // Timeout handler
  const handleTimeout = () => {
    setIsRevealed(true);
    soundEngine.playBuzzer();
    soundEngine.triggerHaptic('alert');
    onShowToast('⏰ Süre doldu!');
  };

  // Handle option selection
  const handleSelectOption = (index: number) => {
    if (isRevealed || isAnswered || eliminatedOptions.includes(index)) return;

    soundEngine.playClick();
    soundEngine.triggerHaptic('touch');
    setSelectedOption(index);
    setIsAnswered(true);

    // Update player 0
    setTablePlayers((prev) =>
      prev.map((p, idx) => (idx === 0 ? { ...p, selectedOptionIndex: index, status: 'answered' } : p))
    );

    // Pause timer and reveal with suspense after 1.2s
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    setTimeout(() => {
      revealResult(index);
    }, 350);
  };

  // Reveal result
  const revealResult = (chosenIndex: number) => {
    setIsRevealed(true);
    const isCorrect = currentQ.options[chosenIndex]?.isCorrect;
    const multiplier = isDoubleDown ? 2 : 1;
    const pointsGained = currentQ.basePoints * multiplier;

    if (isCorrect) {
      soundEngine.playSuccess();
      soundEngine.triggerHaptic('win');
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#C4F442', '#f751a1', '#ffffff']
        });
      } catch {
        // ignore
      }
      onShowToast(`🎉 DOĞRU! +${pointsGained} Puan Kazandın!`);
    } else {
      soundEngine.playBuzzer();
      soundEngine.triggerHaptic('alert');
      if (isDoubleDown) {
        onShowToast('💥 DOUBLE DOWN KAYBETTİN! Masaya içecek borçlandın!');
      } else {
        onShowToast('❌ Yanlış Cevap!');
      }
    }

    // Update table players' scores
    setTablePlayers((prev) =>
      prev.map((p, idx) => {
        const pChoice = p.selectedOptionIndex;
        const pCorrect = pChoice !== null && currentQ.options[pChoice]?.isCorrect;
        const pts = pCorrect ? currentQ.basePoints * (idx === 0 && isDoubleDown ? 2 : 1) : 0;
        return {
          ...p,
          score: p.score + pts
        };
      })
    );
  };

  // Double Down Power-Up Toggle
  const toggleDoubleDown = () => {
    if (isAnswered || isRevealed) return;
    soundEngine.playClick();
    soundEngine.triggerHaptic('tap');
    setIsDoubleDown((prev) => !prev);
    if (!isDoubleDown) {
      onShowToast('🔥 DOUBLE DOWN AKTİF! Doğruysa x2 Puan, Yanlışsa Masaya İçecek!');
    }
  };

  // Dedikodu Joker
  const useDedikoduJoker = () => {
    if (dedikoduUsesLeft <= 0 || isRevealed) return;
    soundEngine.playSuccess();
    soundEngine.triggerHaptic('drop');
    setDedikoduUsesLeft((prev) => prev - 1);
    setDedikoduActive(true);
    onShowToast('👁️ JOKER: Masadakilerin tercihleri 4 saniyeliğine görünüyor!');

    setTimeout(() => {
      setDedikoduActive(false);
    }, 4000);
  };

  // 50/50 Joker
  const useFiftyFiftyJoker = () => {
    if (fiftyFiftyUsesLeft <= 0 || isRevealed) return;
    soundEngine.playSuccess();
    soundEngine.triggerHaptic('drop');
    setFiftyFiftyUsesLeft((prev) => prev - 1);

    const wrongIndexes = currentQ.options
      .map((opt, idx) => (!opt.isCorrect ? idx : -1))
      .filter((idx) => idx !== -1);

    // Shuffle and pick 2 wrong to eliminate
    const shuffledWrong = [...wrongIndexes].sort(() => Math.random() - 0.5);
    const toEliminate = shuffledWrong.slice(0, 2);
    setEliminatedOptions(toEliminate);
    onShowToast('✂️ 50/50 JOKERİ: İki yanlış seçenek elendi!');
  };

  // Next Question
  const handleNextQuestion = () => {
    soundEngine.playClick();
    if (currentIdx < questions.length - 1) {
      const nextIdx = currentIdx + 1;
      setCurrentIdx(nextIdx);
      resetQuestionState(nextIdx);
    } else {
      // Game Over
      setIsGameOver(true);
      soundEngine.playVictory();
      try {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.5 }
        });
      } catch {
        // ignore
      }
    }
  };

  // Send Floating Emoji Reaction
  const sendEmojiReaction = (emoji: string) => {
    soundEngine.playClick();
    soundEngine.triggerHaptic('tap');
    const newEmoji: FlyingEmoji = {
      id: Math.random().toString(),
      emoji,
      x: Math.random() * 60 + 20 // random percentage 20% to 80%
    };
    setFlyingEmojis((prev) => [...prev, newEmoji]);
    setTimeout(() => {
      setFlyingEmojis((prev) => prev.filter((e) => e.id !== newEmoji.id));
    }, 1800);
  };

  // Clean timer on close/unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  if (!isOpen) return null;

  // Sorted scoreboard for game over
  const rankedPlayers = [...tablePlayers].sort((a, b) => b.score - a.score);

  // Timer SVG circumference calculations
  const radius = 20;
  const circumference = 2 * Math.PI * radius; // ~125.6
  const strokeDashoffset = circumference - (timerSeconds / TOTAL_QUESTION_TIME) * circumference;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2 select-none">
      {/* Floating Reactions Layer */}
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
        {flyingEmojis.map((e) => (
          <div
            key={e.id}
            style={{ left: `${e.x}%` }}
            className="absolute bottom-24 text-3xl animate-bounce transition-all duration-1000 transform -translate-y-44 opacity-0 transition-opacity"
          >
            {e.emoji}
          </div>
        ))}
      </div>

      <div className="relative w-full max-w-md h-[94dvh] sm:h-[96vh] max-h-[890px] bg-[#0a0e18] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        
        {/* ================= HEADER ================= */}
        <header className="w-full pt-safe bg-[#0a0e18]/90 backdrop-blur-xl border-b border-white/10 shrink-0">
          <div className="h-16 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-[#1c1f2a] flex items-center justify-center text-[#ffb0cd]">
                <Zap className="w-5 h-5 fill-[#ffb0cd]" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-base text-white tracking-tight leading-none">
                    Kaotik Trivia
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#C4F442] animate-pulse" />
                </div>
                <span className="text-[10px] text-[#4cd7f6] tracking-wider uppercase font-mono mt-1">
                  CANLI ODA #402
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
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
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3.5 no-scrollbar">
          
          {/* Top Session Meta Bar */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-[#f751a1] animate-ping" />
                <span className="text-[10px] font-bold text-[#f751a1] tracking-wider uppercase">
                  {currentQ.category}
                </span>
              </div>
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[#4cd7f6]">
                <Zap className="w-3 h-3 fill-[#4cd7f6]" />
                <span className="text-[10px] font-mono font-bold">
                  {isDoubleDown ? '2.0x ÇARPAN 🔥' : '1.0x NORMAL'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-bold text-white">
                  Soru {String(currentIdx + 1).padStart(2, '0')}
                </span>
                <span className="text-xs text-gray-400">/ {questions.length}</span>
              </div>

              {/* Round Progress Micro Dots */}
              <div className="flex items-center gap-1">
                {questions.map((_, qIdx) => (
                  <span
                    key={qIdx}
                    className={`transition-all duration-300 rounded-full ${
                      qIdx < currentIdx
                        ? 'w-1.5 h-1.5 bg-[#C4F442]'
                        : qIdx === currentIdx
                        ? 'w-4 h-1.5 bg-[#f751a1] shadow-[0_0_8px_rgba(247,81,161,0.8)] animate-pulse'
                        : 'w-1.5 h-1.5 bg-white/10'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Central Glowing Question Card */}
          <div className="relative w-full rounded-2xl bg-[#111827] border border-white/10 p-4 overflow-hidden shadow-[0_12px_36px_rgba(0,0,0,0.6)]">
            {/* Ambient Neon Flares */}
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-[#f751a1]/15 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full bg-[#009eb9]/15 blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col gap-2.5">
              {/* Countdown Timer & Point Badge */}
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-white">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span className="text-xs font-semibold">{currentQ.difficulty}</span>
                  <span className="text-gray-500 text-xs">•</span>
                  <span className="text-xs text-[#C4F442] font-mono font-black">
                    +{currentQ.basePoints * (isDoubleDown ? 2 : 1)} Puan
                  </span>
                </div>

                {/* Circular Dynamic Timer */}
                <div className="relative flex items-center justify-center w-12 h-12 rounded-full bg-[#0a0e18] shadow-[0_0_16px_rgba(245,158,11,0.25)] border border-white/5">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 48 48">
                    <circle
                      className="stroke-white/10"
                      cx="24"
                      cy="24"
                      fill="transparent"
                      r={radius}
                      strokeWidth="3.5"
                    />
                    <circle
                      className={timerSeconds <= 4 ? 'stroke-red-500' : 'stroke-[#F59E0B]'}
                      cx="24"
                      cy="24"
                      fill="transparent"
                      r={radius}
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      strokeWidth="3.5"
                    />
                  </svg>
                  <div className="flex flex-col items-center leading-none">
                    <span
                      className={`text-base font-black font-mono ${
                        timerSeconds <= 4 ? 'text-red-400 animate-pulse' : 'text-[#F59E0B]'
                      }`}
                    >
                      {String(timerSeconds).padStart(2, '0')}
                    </span>
                    <span className="text-[8px] text-gray-400 uppercase tracking-tighter">sn</span>
                  </div>
                </div>
              </div>

              {/* Question Text */}
              <div className="pt-1">
                <h2 className="text-lg font-black text-white leading-snug tracking-tight">
                  {currentQ.question}
                </h2>
                <p className="text-xs text-gray-400 mt-1.5 flex items-center gap-1">
                  <HelpCircle className="w-3.5 h-3.5 text-[#4cd7f6] shrink-0" />
                  <span>{currentQ.teaser}</span>
                </p>
              </div>
            </div>
          </div>

          {/* 4 Interactive Choice Cards */}
          <div className="flex flex-col gap-2.5">
            {currentQ.options.map((option, optIdx) => {
              const letter = ['A', 'B', 'C', 'D'][optIdx];
              const isSelected = selectedOption === optIdx;
              const isEliminated = eliminatedOptions.includes(optIdx);

              // Correct/Wrong reveal logic
              let cardBg = 'bg-[#111827] border-white/10 hover:border-white/20';
              let badgeColor = 'bg-white/10 text-white';

              if (isEliminated) {
                cardBg = 'bg-black/30 border-dashed border-white/5 opacity-40 pointer-events-none';
              } else if (isRevealed) {
                if (option.isCorrect) {
                  cardBg = 'bg-emerald-950/40 border-emerald-500 text-emerald-200 shadow-[0_0_20px_rgba(16,185,129,0.3)]';
                  badgeColor = 'bg-emerald-500 text-black font-black';
                } else if (isSelected && !option.isCorrect) {
                  cardBg = 'bg-red-950/40 border-red-500 text-red-200 shadow-[0_0_20px_rgba(239,68,68,0.3)]';
                  badgeColor = 'bg-red-500 text-white font-black';
                }
              } else if (isSelected) {
                cardBg = 'bg-[#1E293B] border-[#f751a1] shadow-[0_0_20px_rgba(247,81,161,0.3)]';
                badgeColor = 'bg-[#f751a1] text-white font-black';
              }

              // Check which table players picked this option (for Dedikodu Joker or after reveal)
              const playersPickedThis = (dedikoduActive || isRevealed)
                ? tablePlayers.filter((p, pIdx) => pIdx !== 0 && p.selectedOptionIndex === optIdx)
                : [];

              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(optIdx)}
                  disabled={isRevealed || isAnswered || isEliminated}
                  className={`group relative w-full text-left p-3.5 rounded-2xl border transition-all active:scale-[0.98] shadow-md flex items-center justify-between gap-3 ${cardBg}`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div
                      className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center font-black text-sm transition-colors ${badgeColor}`}
                    >
                      {letter}
                    </div>

                    <div className="flex flex-col min-w-0">
                      {option.popularGuess && !isRevealed && (
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="px-1.5 py-0.2 rounded-full bg-[#f751a1]/20 text-[#f751a1] text-[10px] uppercase font-bold tracking-wider">
                            Popüler Tahmin 🔥
                          </span>
                        </div>
                      )}

                      <span className="text-sm font-semibold text-white leading-snug">
                        {option.text}
                      </span>

                      {option.subtitle && isRevealed && (
                        <span className="text-[11px] text-gray-400 mt-0.5 leading-tight">
                          {option.subtitle}
                        </span>
                      )}

                      {/* Dedikodu Mini Avatars that selected this option */}
                      {playersPickedThis.length > 0 && (
                        <div className="flex items-center gap-1.5 mt-1">
                          <span className="text-[10px] text-[#4cd7f6] font-bold">Masa Tercihi:</span>
                          <div className="flex items-center -space-x-1">
                            {playersPickedThis.map((tp) => (
                              <div
                                key={tp.playerId}
                                className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-[9px] font-bold text-white ring-1 ring-[#0a0e18]"
                                title={tp.name}
                              >
                                {tp.name.charAt(0)}
                              </div>
                            ))}
                          </div>
                          <span className="text-[10px] text-gray-400">
                            ({playersPickedThis.map((tp) => tp.name).join(', ')})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 w-6 h-6 rounded-full bg-black/40 flex items-center justify-center text-gray-400">
                    {isRevealed && option.isCorrect ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : isRevealed && isSelected ? (
                      <XCircle className="w-5 h-5 text-red-400" />
                    ) : isSelected ? (
                      <div className="w-3 h-3 rounded-full bg-[#f751a1] animate-ping" />
                    ) : (
                      <div className="w-2.5 h-2.5 rounded-full bg-white/20 group-hover:bg-[#f751a1]/50" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation Banner after Reveal */}
          {isRevealed && (
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/40 to-indigo-950/40 border border-purple-500/30 flex flex-col gap-1.5 animate-fade-in">
              <div className="flex items-center gap-1.5 text-xs font-black text-purple-300">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                <span>ABSÜRT GERÇEK:</span>
              </div>
              <p className="text-xs text-gray-200 leading-relaxed">
                {currentQ.explanation}
              </p>
              <button
                onClick={handleNextQuestion}
                className="mt-2 w-full py-2.5 rounded-xl bg-white text-black font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 shadow-lg hover:bg-gray-100 transition-all"
              >
                <span>{currentIdx < questions.length - 1 ? 'Sonraki Soruya Geç' : 'Sonuçları Gör'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Masa İddiası & Blöf Barı (Power-Ups & Side Bet) */}
          <div className="rounded-2xl bg-[#1c1f2a] border border-white/10 p-3.5 flex flex-col gap-2.5 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#571bc1] flex items-center justify-center text-[#d0bcff]">
                  <Flame className="w-4 h-4 fill-[#d0bcff]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-white leading-tight">
                    Masa İddiası & Blöf
                  </span>
                  <span className="text-[10px] text-gray-400">
                    Doğruysa x2 Puan, Yanlışsa Ceza!
                  </span>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-[#C4F442]/10 text-[#C4F442] text-[10px] font-black font-mono">
                JOKERLER
              </span>
            </div>

            {/* Double Down & Joker Cards */}
            <div className="grid grid-cols-2 gap-2">
              {/* Double Down Toggle */}
              <button
                onClick={toggleDoubleDown}
                disabled={isAnswered || isRevealed}
                className={`p-2.5 rounded-xl border transition-all flex flex-col gap-1 text-left active:scale-95 ${
                  isDoubleDown
                    ? 'bg-[#f751a1] text-white border-[#f751a1] shadow-[0_0_15px_rgba(247,81,161,0.5)]'
                    : 'bg-[#262a35] hover:bg-[#313540] border-white/5 text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-[11px] font-black uppercase ${
                      isDoubleDown ? 'text-white' : 'text-[#C4F442]'
                    }`}
                  >
                    DOUBLE DOWN
                  </span>
                  <Flame className="w-4 h-4" />
                </div>
                <span className="text-[10px] leading-tight opacity-90">
                  {isDoubleDown ? 'Aktif: Masaya İçecek Riski!' : '+50 Puan veya Masaya İçecek!'}
                </span>
              </button>

              {/* Dedikodu Joker */}
              <button
                onClick={useDedikoduJoker}
                disabled={dedikoduUsesLeft <= 0 || isRevealed}
                className={`p-2.5 rounded-xl border transition-all flex flex-col gap-1 text-left active:scale-95 ${
                  dedikoduActive
                    ? 'bg-[#009eb9] text-white border-[#4cd7f6] shadow-[0_0_15px_rgba(76,215,246,0.5)]'
                    : dedikoduUsesLeft <= 0
                    ? 'bg-black/20 border-white/5 text-gray-600 opacity-50 cursor-not-allowed'
                    : 'bg-[#262a35] hover:bg-[#313540] border-white/5 text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-[11px] font-black uppercase ${
                      dedikoduActive ? 'text-white' : 'text-[#4cd7f6]'
                    }`}
                  >
                    JOKER: DEDİKODU
                  </span>
                  <Eye className="w-4 h-4" />
                </div>
                <span className="text-[10px] leading-tight opacity-90">
                  {dedikoduActive
                    ? 'Masa tercihleri açık!'
                    : `Herkesin cevabı 4sn görünür (${dedikoduUsesLeft} Kalan)`}
                </span>
              </button>
            </div>

            {/* 50/50 Joker button */}
            <button
              onClick={useFiftyFiftyJoker}
              disabled={fiftyFiftyUsesLeft <= 0 || isRevealed || eliminatedOptions.length > 0}
              className={`w-full py-1.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-between transition-all ${
                fiftyFiftyUsesLeft <= 0 || eliminatedOptions.length > 0
                  ? 'bg-black/20 border-white/5 text-gray-600 opacity-50 cursor-not-allowed'
                  : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span>✂️ 50/50 Jokeri (2 Yanlışı Ele)</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-[#C4F442]">
                {fiftyFiftyUsesLeft} Hak
              </span>
            </button>
          </div>

          {/* Live Table Player Status Tray */}
          <div className="flex flex-col gap-2 rounded-2xl bg-[#111827] border border-white/10 p-3.5 shadow-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#f751a1]" />
                <span className="text-xs font-bold text-white">
                  Masa Durumu ({tablePlayers.length} Oyuncu)
                </span>
              </div>
              <span className="text-[10px] text-[#10B981] font-mono flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                {tablePlayers.filter((p) => p.status === 'answered').length} Kişi Kilitledi
              </span>
            </div>

            {/* Players Status Pods */}
            <div className="grid grid-cols-2 gap-2">
              {tablePlayers.map((tp, idx) => (
                <div
                  key={tp.playerId}
                  className="flex items-center gap-2 p-2 rounded-xl bg-[#0a0e18] border border-white/5"
                >
                  <div className="relative w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
                    {tp.name.charAt(0)}
                    {tp.status === 'answered' && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#10B981] flex items-center justify-center text-[7px] text-black font-black">
                        ✓
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-white truncate">
                        {tp.name} {idx === 0 && '(Sen)'}
                      </span>
                      <span className="text-[9px] text-[#C4F442] font-mono font-bold ml-1">
                        {tp.score}p
                      </span>
                    </div>
                    <span
                      className={`text-[10px] leading-tight ${
                        tp.status === 'answered'
                          ? 'text-[#10B981]'
                          : timerSeconds <= 4
                          ? 'text-red-400 animate-pulse'
                          : 'text-[#F59E0B]'
                      }`}
                    >
                      {tp.status === 'answered'
                        ? 'Cevapladı ⚡'
                        : timerSeconds <= 4
                        ? 'Süre Bitiyor ⏳'
                        : 'Düşünüyor... 🤔'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Quick Reaction Drawer */}
          <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl">
            <span className="text-[11px] text-gray-400 pl-2 flex items-center gap-1.5 font-medium">
              <span>Masaya Hızlı Tepki:</span>
            </span>
            <div className="flex items-center gap-1.5">
              {[
                { emoji: '😱', title: 'Şok' },
                { emoji: '🤥', title: 'Blöf!' },
                { emoji: '🔥', title: 'Ateş' },
                { emoji: '💀', title: 'Gülme' }
              ].map((item) => (
                <button
                  key={item.emoji}
                  onClick={() => sendEmojiReaction(item.emoji)}
                  className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/15 active:scale-90 transition-all flex items-center justify-center text-lg"
                  title={item.title}
                >
                  {item.emoji}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* ================= GAME OVER PODIUM OVERLAY ================= */}
        {isGameOver && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#f751a1] to-[#C4F442] p-0.5 shadow-[0_0_40px_rgba(247,81,161,0.5)] mb-3 animate-bounce">
              <div className="w-full h-full bg-[#0a0e18] rounded-[22px] flex items-center justify-center">
                <Trophy className="w-10 h-10 text-[#C4F442]" />
              </div>
            </div>

            <span className="text-xs font-black text-[#f751a1] tracking-widest uppercase">
              KAOTİK TRIVIA ŞAMPİYONU
            </span>
            <h2 className="text-2xl font-black text-white mt-1 mb-3">
              {rankedPlayers[0]?.name} GECENİN BİRİNCİSİ! 👑
            </h2>

            {/* Scoreboard List */}
            <div className="w-full max-w-xs flex flex-col gap-2 my-2">
              {rankedPlayers.map((player, rankIdx) => (
                <div
                  key={player.playerId}
                  className={`flex items-center justify-between p-2.5 rounded-xl border ${
                    rankIdx === 0
                      ? 'bg-[#C4F442]/15 border-[#C4F442] text-white'
                      : 'bg-white/5 border-white/10 text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black font-mono w-4">
                      #{rankIdx + 1}
                    </span>
                    <span className="text-xs font-bold">{player.name}</span>
                  </div>
                  <span className="text-xs font-mono font-black text-[#C4F442]">
                    {player.score} Puan
                  </span>
                </div>
              ))}
            </div>

            {/* Penalty for Loser */}
            {rankedPlayers.length > 1 && (
              <div className="w-full max-w-xs bg-red-500/10 border border-red-500/30 rounded-xl p-2.5 my-2 text-left">
                <span className="text-[10px] font-black text-red-400 block mb-0.5">
                  MASANIN HESABI & CEZASI:
                </span>
                <p className="text-xs text-red-200">
                  Sonuncu olan <span className="font-bold">{rankedPlayers[rankedPlayers.length - 1]?.name}</span>, masanın bir sonraki içecek siparişini üstlenir! ☕
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2.5 w-full max-w-xs mt-3">
              <button
                onClick={() => {
                  setCurrentIdx(0);
                  setIsGameOver(false);
                  resetQuestionState(0);
                }}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Tekrar Oyna</span>
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-xl bg-[#C4F442] text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(196,244,66,0.4)] active:scale-95 transition-all"
              >
                <Award className="w-4 h-4" />
                <span>Kapat</span>
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
