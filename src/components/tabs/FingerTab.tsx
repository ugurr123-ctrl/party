import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Sparkles,
  Volume2,
  VolumeX,
  X,
  RefreshCw,
  Clock,
  CheckCircle2,
  Smile,
  Users,
  Flame,
  ChevronRight
} from 'lucide-react';
import { soundEngine } from '../../utils/audio';
import {
  FINGER_PERFORMANCE_CATEGORIES,
  FingerCategoryData
} from '../../data/partyData';

// High-contrast neon arcade colors for finger rings
const NEON_PALETTE = [
  '#bef264', // Neon lime
  '#f751a1', // Neon pink
  '#06b6d4', // Cyan
  '#f59e0b', // Amber
  '#a855f7', // Purple
  '#3b82f6', // Electric blue
  '#10b981', // Emerald
  '#ec4899', // Hot magenta
  '#fb923c', // Orange
  '#6366f1'  // Indigo
];

type GameState = 'idle' | 'collecting' | 'countdown' | 'selected' | 'waitingForRelease';

interface ActiveTouch {
  id: number;
  x: number;
  y: number;
  color: string;
}

// Fisher-Yates array shuffle for non-repeating decks
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Secure uniform random index picker (prevents modulo bias)
function getSecureRandomIndex(max: number): number {
  if (max <= 1) return 0;
  const range = 256 - (256 % max);
  const array = new Uint8Array(1);
  let val: number;
  do {
    window.crypto.getRandomValues(array);
    val = array[0];
  } while (val >= range);
  return val % max;
}

export const FingerTab: React.FC = () => {
  // Arena ref
  const arenaRef = useRef<HTMLDivElement>(null);

  // Settings states
  const [durationSec, setDurationSec] = useState<2 | 3 | 5>(() => {
    try {
      const saved = localStorage.getItem('parti_finger_duration');
      if (saved === '2' || saved === '3' || saved === '5') return Number(saved) as 2 | 3 | 5;
    } catch {
      // ignore
    }
    return 2;
  });

  const [autoTasksEnabled, setAutoTasksEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('parti_finger_autotasks');
      if (saved !== null) return saved === 'true';
    } catch {
      // ignore
    }
    return true;
  });

  const [selectedCatId, setSelectedCatId] = useState<'sahne' | 'grup' | 'komedi'>('sahne');
  const [isAudioEnabled, setIsAudioEnabled] = useState<boolean>(soundEngine.sfxEnabled);

  // Task deck states
  const [taskDeck, setTaskDeck] = useState<string[]>([]);
  const [currentTask, setCurrentTask] = useState<string>('');
  const lastTaskRef = useRef<string>('');

  // Active game touches & state
  const [gameState, setGameState] = useState<GameState>('idle');
  const [activeTouches, setActiveTouches] = useState<ActiveTouch[]>([]);
  const [winnerTouchId, setWinnerTouchId] = useState<number | null>(null);
  const [lastWinnerDare, setLastWinnerDare] = useState<{ touchNumber: number; text: string } | null>(null);

  // Ref for synchronous touch tracking (prevents stale closures and React batching lags)
  const touchMapRef = useRef<Map<number, ActiveTouch>>(new Map());
  const roundTokenRef = useRef<number>(0);
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const winnerCalmTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Persist settings
  useEffect(() => {
    try {
      localStorage.setItem('parti_finger_duration', durationSec.toString());
      localStorage.setItem('parti_finger_autotasks', autoTasksEnabled.toString());
    } catch {
      // ignore
    }
  }, [durationSec, autoTasksEnabled]);

  // Audio mute toggle
  const toggleAudio = useCallback(() => {
    const newState = soundEngine.toggleSound();
    setIsAudioEnabled(newState);
  }, []);

  // Initialize or re-shuffle task deck when category changes
  useEffect(() => {
    const cat = FINGER_PERFORMANCE_CATEGORIES.find((c) => c.id === selectedCatId) || FINGER_PERFORMANCE_CATEGORIES[0];
    if (cat.tasks.length > 0) {
      let shuffled = shuffleArray(cat.tasks);
      // Ensure the first task of the new deck doesn't repeat the previous last task
      if (shuffled.length > 1 && shuffled[0] === lastTaskRef.current) {
        const temp = shuffled[0];
        shuffled[0] = shuffled[1];
        shuffled[1] = temp;
      }
      const first = shuffled.pop() || cat.tasks[0];
      setCurrentTask(first);
      lastTaskRef.current = first;
      setTaskDeck(shuffled);
    }
  }, [selectedCatId]);

  // Next task in deck (guaranteed non-repeating until exhausted)
  const advanceToNextTask = useCallback(() => {
    soundEngine.playClick();
    const cat = FINGER_PERFORMANCE_CATEGORIES.find((c) => c.id === selectedCatId) || FINGER_PERFORMANCE_CATEGORIES[0];
    if (cat.tasks.length === 0) return;

    if (taskDeck.length === 0) {
      // Deck exhausted, re-shuffle without repeating the current one
      let fresh = shuffleArray(cat.tasks.filter((t) => t !== currentTask));
      if (fresh.length === 0) fresh = [...cat.tasks];
      const next = fresh.pop() || cat.tasks[0];
      setCurrentTask(next);
      lastTaskRef.current = next;
      setTaskDeck(fresh);
    } else {
      const next = taskDeck[taskDeck.length - 1];
      const remaining = taskDeck.slice(0, -1);
      setCurrentTask(next);
      lastTaskRef.current = next;
      setTaskDeck(remaining);
    }
  }, [selectedCatId, taskDeck, currentTask]);

  // Sync touch map ref with React state
  const syncTouchesState = useCallback(() => {
    setActiveTouches(Array.from(touchMapRef.current.values()));
  }, []);

  // Cancel any running countdowns and timers safely
  const clearTimers = useCallback(() => {
    if (countdownTimerRef.current) {
      clearTimeout(countdownTimerRef.current);
      countdownTimerRef.current = null;
    }
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (winnerCalmTimerRef.current) {
      clearTimeout(winnerCalmTimerRef.current);
      winnerCalmTimerRef.current = null;
    }
  }, []);

  // Clean full reset (invoked by X button, unmount, or window blur)
  const abortAndReset = useCallback(() => {
    clearTimers();
    touchMapRef.current.clear();
    roundTokenRef.current += 1;
    setActiveTouches([]);
    setWinnerTouchId(null);
    setGameState('idle');
  }, [clearTimers]);

  // Execute Winner Selection when countdown elapses
  const executeWinnerSelection = useCallback(
    (currentToken: number) => {
      clearTimers();
      if (currentToken !== roundTokenRef.current) return;

      const currentTouches = Array.from(touchMapRef.current.values());
      if (currentTouches.length < 2) {
        setGameState(currentTouches.length === 1 ? 'collecting' : 'idle');
        return;
      }

      // Secure equal probability selection
      const winnerIdx = getSecureRandomIndex(currentTouches.length);
      const chosenWinner = currentTouches[winnerIdx];

      setWinnerTouchId(chosenWinner.id);
      setGameState('selected');

      // Play victory sound & success haptics
      soundEngine.playFingerWinner();

      // Record task for winner
      if (autoTasksEnabled && currentTask) {
        setLastWinnerDare({
          touchNumber: winnerIdx + 1,
          text: currentTask
        });
      }

      // Transition to calm waiting-for-release phase after ~500ms
      winnerCalmTimerRef.current = setTimeout(() => {
        if (currentToken === roundTokenRef.current) {
          setGameState('waitingForRelease');
        }
      }, 500);
    },
    [autoTasksEnabled, currentTask, clearTimers]
  );

  // Restart Countdown with current participants
  const restartCountdown = useCallback(() => {
    clearTimers();
    const currentToken = ++roundTokenRef.current;
    setWinnerTouchId(null);
    setGameState('countdown');

    // Initial countdown audio tick
    soundEngine.playCountdown();

    // Rhythmic audio ticks every 700ms during countdown
    countdownIntervalRef.current = setInterval(() => {
      if (currentToken === roundTokenRef.current) {
        soundEngine.playCountdown();
      }
    }, 700);

    // Total countdown timer
    countdownTimerRef.current = setTimeout(() => {
      executeWinnerSelection(currentToken);
    }, durationSec * 1000);
  }, [durationSec, clearTimers, executeWinnerSelection]);

  // Handle Pointer Down
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Prevent default touch gestures (scrolling, zooming, selection)
    e.preventDefault();

    // If game has already selected a winner in this round, ignore extra new fingers
    if (gameState === 'selected' || gameState === 'waitingForRelease') {
      return;
    }

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Capture fallback
    }

    const currentCount = touchMapRef.current.size;
    const color = NEON_PALETTE[currentCount % NEON_PALETTE.length];

    const newTouch: ActiveTouch = {
      id: e.pointerId,
      x: e.clientX,
      y: e.clientY,
      color
    };

    touchMapRef.current.set(e.pointerId, newTouch);
    syncTouchesState();

    // Subtle audio tick on each new finger
    soundEngine.playFingerTouch();

    const count = touchMapRef.current.size;
    if (count >= 2) {
      // Restart or start countdown with new participants
      restartCountdown();
    } else {
      clearTimers();
      setGameState('collecting');
    }
  };

  // Handle Pointer Move (updates position smoothly without resetting countdown)
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const existing = touchMapRef.current.get(e.pointerId);
    if (!existing) return;

    // Update coordinates directly
    existing.x = e.clientX;
    existing.y = e.clientY;

    // Sync touches state
    syncTouchesState();
  };

  // Handle Pointer Up / Cancel
  const handlePointerUpOrCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Release fallback
    }

    touchMapRef.current.delete(e.pointerId);
    syncTouchesState();
    soundEngine.triggerHaptic('tick');

    const remainingCount = touchMapRef.current.size;

    if (gameState === 'selected' || gameState === 'waitingForRelease') {
      // If winner was already chosen and all fingers lifted, automatically return to ready state
      if (remainingCount === 0) {
        roundTokenRef.current += 1;
        setWinnerTouchId(null);
        setGameState('idle');
        // If auto tasks enabled, advance to next task for the next round
        if (autoTasksEnabled) {
          advanceToNextTask();
        }
      }
      return;
    }

    // In collecting or countdown state:
    if (remainingCount >= 2) {
      // A finger was lifted during countdown -> restart countdown with remaining participants
      restartCountdown();
    } else if (remainingCount === 1) {
      // Less than 2 fingers -> cancel countdown and return to collecting
      clearTimers();
      setGameState('collecting');
    } else {
      // 0 fingers -> idle
      clearTimers();
      setGameState('idle');
    }
  };

  // 4 Parmak Test Et (Simulation for testing / desktop / solo demo)
  const handleSimulate4Fingers = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    abortAndReset();

    const rect = arenaRef.current?.getBoundingClientRect();
    const centerX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
    const centerY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;
    const spreadX = Math.min(rect?.width || 320, 360) * 0.28;
    const spreadY = Math.min(rect?.height || 400, 360) * 0.24;

    const mockTouches: ActiveTouch[] = [
      { id: 9001, x: centerX - spreadX, y: centerY - spreadY, color: NEON_PALETTE[0] },
      { id: 9002, x: centerX + spreadX, y: centerY - spreadY, color: NEON_PALETTE[1] },
      { id: 9003, x: centerX - spreadX * 0.9, y: centerY + spreadY, color: NEON_PALETTE[2] },
      { id: 9004, x: centerX + spreadX * 0.9, y: centerY + spreadY, color: NEON_PALETTE[3] }
    ];

    mockTouches.forEach((t) => touchMapRef.current.set(t.id, t));
    syncTouchesState();
    soundEngine.playFingerTouch();
    soundEngine.triggerHaptic('touch');
    restartCountdown();
  };

  // Window-level safety listeners (blur, visibilitychange, orientation change)
  useEffect(() => {
    const handleVisibilityOrBlur = () => {
      if (document.hidden || !document.hasFocus()) {
        abortAndReset();
      }
    };

    const handleOrientationOrResize = () => {
      abortAndReset();
    };

    window.addEventListener('blur', handleVisibilityOrBlur);
    document.addEventListener('visibilitychange', handleVisibilityOrBlur);
    window.addEventListener('orientationchange', handleOrientationOrResize);

    return () => {
      window.removeEventListener('blur', handleVisibilityOrBlur);
      document.removeEventListener('visibilitychange', handleVisibilityOrBlur);
      window.removeEventListener('orientationchange', handleOrientationOrResize);
      clearTimers();
    };
  }, [abortAndReset, clearTimers]);

  // Is active touch fullscreen mode active?
  const isFullScreenActive = activeTouches.length > 0;

  // Adaptive ring sizing for dense touches (> 6 fingers)
  const ringSizePx = activeTouches.length > 8 ? 64 : activeTouches.length > 6 ? 74 : 88;
  const coreSizePx = activeTouches.length > 8 ? 16 : 22;

  return (
    <div className="flex-1 flex flex-col justify-start relative select-none">
      {/* =========================================================================
          IDLE VIEW: Header, Task Card, Category Selector, Time Setting, Auto Toggle
          (Completely hidden during active touches according to Requirement 3)
      ========================================================================= */}
      {!isFullScreenActive && (
        <div className="flex flex-col space-y-3 pb-2 pt-1 animate-in fade-in duration-200">
          {/* Top Bar: Title & Controls */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black tracking-widest text-[#bef264] block">
                PARMAK SEÇ
              </span>
              <h2 className="text-xl font-black text-white tracking-tight">
                Dokunmatik Kura
              </h2>
            </div>

            {/* Top Controls: Sound toggle & Duration Pill */}
            <div className="flex items-center gap-2">
              {/* Sound Icon Button (Without text "Ses Açık") */}
              <button
                type="button"
                onClick={toggleAudio}
                aria-label={isAudioEnabled ? 'Sesi Kapat' : 'Sesi Aç'}
                aria-pressed={isAudioEnabled}
                className={`w-9 h-9 rounded-full flex items-center justify-center border transition-all active:scale-95 ${
                  isAudioEnabled
                    ? 'bg-[#111827] border-white/10 text-cyan-400 hover:border-cyan-400/40'
                    : 'bg-red-950/40 border-red-500/30 text-red-400'
                }`}
              >
                {isAudioEnabled ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </button>

              {/* Duration Selector: 2s | 3s | 5s */}
              <div
                role="radiogroup"
                aria-label="Geri Sayım Süresi"
                className="flex items-center p-0.5 rounded-full bg-[#111827] border border-white/10"
              >
                {([2, 3, 5] as const).map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setDurationSec(sec);
                    }}
                    role="radio"
                    aria-checked={durationSec === sec}
                    className={`px-2.5 py-1 rounded-full text-xs font-black transition-all ${
                      durationSec === sec
                        ? 'bg-[#bef264] text-neutral-950 shadow-sm'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    {sec}s
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Category Tabs: Sahne Senin | Grup Eğlencesi | Cesaret & Komedi */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
            {FINGER_PERFORMANCE_CATEGORIES.map((cat) => {
              const isSelected = selectedCatId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedCatId(cat.id);
                  }}
                  className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-[#f751a1] text-pink-300 shadow-sm'
                      : 'bg-[#111827] border border-white/5 text-gray-400 hover:text-gray-200'
                  }`}
                >
                  {cat.id === 'sahne' && <Sparkles className="w-3.5 h-3.5 text-pink-400" />}
                  {cat.id === 'grup' && <Users className="w-3.5 h-3.5 text-cyan-400" />}
                  {cat.id === 'komedi' && <Smile className="w-3.5 h-3.5 text-[#bef264]" />}
                  <span>{cat.title}</span>
                </button>
              );
            })}
          </div>

          {/* Task System Card (Requirement 6) */}
          <div className="p-3.5 rounded-2xl bg-[#111827]/90 border border-white/10 shadow-md space-y-2.5">
            {/* Card Header: Auto Task Toggle */}
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#bef264] animate-pulse" />
                <span className="text-xs font-bold text-gray-200">
                  Otomatik Görevler
                </span>
              </div>

              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoTasksEnabled}
                  onChange={(e) => {
                    soundEngine.playClick();
                    setAutoTasksEnabled(e.target.checked);
                  }}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#bef264]" />
              </label>
            </div>

            {/* Task Content */}
            {autoTasksEnabled ? (
              <div className="space-y-2">
                <p className="text-xs text-gray-200 font-medium leading-relaxed italic pr-1">
                  "{currentTask}"
                </p>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-gray-400">
                    Seçilen kişi görevi yapar (Pas serbest)
                  </span>
                  <button
                    type="button"
                    onClick={advanceToNextTask}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-400 hover:text-cyan-300 text-xs font-bold flex items-center gap-1 active:scale-95 transition-all"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Başka Görev</span>
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic py-1">
                Otomatik görev kapalı: Yalnızca kişi seçimi yapılacak.
              </p>
            )}
          </div>

          {/* Last Round Result Banner (Shown if round just completed) */}
          {lastWinnerDare && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-lime-500/10 via-emerald-500/10 to-transparent border border-[#bef264]/30 flex items-start gap-2.5 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-[#bef264] shrink-0 mt-0.5" />
              <div className="flex flex-col min-w-0">
                <span className="text-[11px] font-bold text-[#bef264]">
                  Son Kura Tamamlandı (Seçilen: {lastWinnerDare.touchNumber}. Parmak)
                </span>
                <span className="text-xs text-gray-300 mt-0.5 leading-snug">
                  "{lastWinnerDare.text}"
                </span>
              </div>
            </div>
          )}

          {/* Friendly Guidance Text */}
          <div className="text-center pt-1">
            <span className="text-xs text-gray-400 font-medium">
              Aşağıdaki alana arkadaşlarınızla parmaklarınızı koyun.
            </span>
          </div>
        </div>
      )}

      {/* =========================================================================
          TOUCH ARENA:
          - In idle: Appears as an attractive framed surface inside the view.
          - During active touch: Smoothly takes over 100% of the viewport (fixed inset-0 z-50),
            clearing all distractions while retaining perfectly identical coordinates!
      ========================================================================= */}
      <div
        ref={arenaRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUpOrCancel}
        onPointerCancel={handlePointerUpOrCancel}
        className={
          isFullScreenActive
            ? 'fixed inset-0 z-50 w-full h-[100dvh] bg-[#0a0e17] touch-none select-none overflow-hidden cursor-crosshair'
            : 'relative flex-1 min-h-[380px] my-1 rounded-3xl border-2 border-dashed border-white/15 bg-[#111827]/60 flex flex-col items-center justify-center overflow-hidden touch-none select-none cursor-pointer hover:border-white/25 transition-colors'
        }
        style={{
          touchAction: 'none',
          WebkitUserSelect: 'none',
          userSelect: 'none'
        }}
      >
        {/* =========================================================================
            INDEPENDENT CLOSE (X) BUTTON (Requirement 5):
            - Always visible in top right during active touch fullscreen mode.
            - Safe 48x48px touch target.
            - Stops propagation so touching X does not register as a new participant!
            - Immediately clears all timers, touches, and returns safely to idle.
        ========================================================================= */}
        {isFullScreenActive && (
          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
              soundEngine.playClick();
              abortAndReset();
            }}
            aria-label="Kapat"
            className="fixed top-4 right-4 z-60 min-w-[48px] min-h-[48px] p-3 rounded-full bg-black/60 hover:bg-black/80 border border-white/20 text-gray-300 hover:text-white flex items-center justify-center backdrop-blur-md active:scale-90 transition-all shadow-xl"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Idle Cue (only visible when 0 touches) */}
        {!isFullScreenActive && (
          <div className="flex flex-col items-center justify-center p-6 text-center z-10 transition-opacity">
            <div className="w-16 h-16 rounded-3xl bg-[#bef264]/10 border border-[#bef264]/30 flex items-center justify-center text-3xl mb-3 animate-pulse pointer-events-none">
              👆
            </div>
            <span className="text-base font-black text-white pointer-events-none">
              Herkes Masaya Bir Parmak Koysun
            </span>
            <span className="text-xs text-gray-400 mt-1 max-w-[240px] pointer-events-none">
              En az 2 parmak temas edince {durationSec} saniyelik kura otomatik başlar.
            </span>

            {/* Test Simulation Button */}
            <button
              type="button"
              onClick={handleSimulate4Fingers}
              className="mt-4 px-4 py-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-[#bef264]/40 text-[#bef264] text-xs font-black flex items-center gap-2 active:scale-95 transition-all shadow-lg cursor-pointer"
            >
              <span>🧪 4 Parmak Test Et</span>
            </button>
          </div>
        )}

        {/* =========================================================================
            ACTIVE FINGER RINGS & CONTACT POINT EFFECTS:
            - Radial ambient neon glow halo under each fingertip
            - Concentric expanding shockwave ripples (animate-touch-ripple)
            - Orbiting cyber reticle ring with micro notches (animate-touch-rotate)
            - Multi-layered white-hot plasma nucleus (clearly visible under fingertip)
            - Explosive triple shockwave & winner burst animation
        ========================================================================= */}
        {activeTouches.map((touch, idx) => {
          const isWinner = winnerTouchId === touch.id;
          const isLoser = winnerTouchId !== null && !isWinner;
          const isCountdown = gameState === 'countdown';

          return (
            <div
              key={touch.id}
              className="absolute pointer-events-none -translate-x-1/2 -translate-y-1/2"
              style={{
                left: touch.x,
                top: touch.y,
                width: `${ringSizePx}px`,
                height: `${ringSizePx}px`,
                opacity: isLoser ? 0 : 1,
                transform: `translate(-50%, -50%) scale(${isLoser ? 0.85 : isWinner ? 1.25 : 1})`,
                transition: 'opacity 200ms ease-out, transform 200ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                zIndex: isWinner ? 50 : 20 + idx
              }}
            >
              {/* 1. Luminous Ambient Glow Field behind the finger */}
              <div
                className="absolute inset-[-40px] rounded-full pointer-events-none transition-opacity duration-300"
                style={{
                  background: isWinner
                    ? 'radial-gradient(circle, rgba(190, 242, 100, 0.45) 0%, rgba(190, 242, 100, 0.15) 50%, transparent 75%)'
                    : `radial-gradient(circle, ${touch.color}55 0%, ${touch.color}18 50%, transparent 75%)`,
                  opacity: isWinner ? 1 : isCountdown ? 0.9 : 0.6
                }}
              />

              {/* 2. Expanding Concentric Ripple Waves radiating outward */}
              {!isWinner && (
                <>
                  <div
                    className="absolute inset-0 rounded-full border border-dashed animate-touch-ripple pointer-events-none"
                    style={{
                      borderColor: touch.color,
                      boxShadow: `0 0 12px ${touch.color}44`
                    }}
                  />
                  {isCountdown && (
                    <div
                      className="absolute inset-[-10px] rounded-full border-2 animate-touch-ripple-fast pointer-events-none"
                      style={{
                        borderColor: touch.color,
                        boxShadow: `0 0 18px ${touch.color}88`
                      }}
                    />
                  )}
                </>
              )}

              {/* 3. Cyber Reticle Rotating Ring (tactile tracking ring) */}
              {!isWinner && (
                <div
                  className="absolute inset-[-6px] rounded-full border border-dashed opacity-50 animate-touch-rotate pointer-events-none"
                  style={{
                    borderColor: touch.color
                  }}
                >
                  {/* Micro crosshair ticks */}
                  <span
                    className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: touch.color }}
                  />
                  <span
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: touch.color }}
                  />
                  <span
                    className="absolute -left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: touch.color }}
                  />
                  <span
                    className="absolute -right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: touch.color }}
                  />
                </div>
              )}

              {/* 4. Winner Explosive Triple Shockwaves */}
              {isWinner && (
                <>
                  <div
                    className="absolute inset-0 rounded-full border-4 border-[#bef264] animate-winner-burst-1 pointer-events-none"
                    style={{ boxShadow: '0 0 35px #bef264' }}
                  />
                  <div
                    className="absolute inset-0 rounded-full border-2 border-white animate-winner-burst-2 pointer-events-none"
                    style={{ boxShadow: '0 0 25px #bef264' }}
                  />
                  <div
                    className="absolute inset-0 rounded-full border-2 border-[#bef264] animate-winner-burst-3 pointer-events-none"
                  />
                </>
              )}

              {/* 5. Main Outer Ring (visible outside the finger contact area) */}
              <div
                className={`absolute inset-0 rounded-full border-[3.5px] flex items-center justify-center transition-all ${
                  isWinner
                    ? 'border-white bg-[#bef264]/30 animate-winner-halo'
                    : 'bg-black/35 backdrop-blur-[2px]'
                }`}
                style={{
                  borderColor: isWinner ? '#bef264' : touch.color,
                  boxShadow: isWinner
                    ? '0 0 40px #bef264, 0 0 80px rgba(190, 242, 100, 0.6), inset 0 0 20px #bef264'
                    : `0 0 20px ${touch.color}99, inset 0 0 10px ${touch.color}33`
                }}
              >
                {/* Winner Crown & Starburst */}
                {isWinner && (
                  <div className="flex flex-col items-center justify-center -mt-1 pointer-events-none">
                    <span className="text-2xl animate-bounce drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]">
                      👑
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider text-black bg-[#bef264] px-2 py-0.5 rounded-full shadow-lg -mt-1">
                      KAZANDI!
                    </span>
                  </div>
                )}
              </div>

              {/* 6. Multi-layered White-Hot Plasma Nucleus (contact point under finger) */}
              {!isWinner && (
                <div
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none flex items-center justify-center transition-all"
                  style={{
                    width: `${coreSizePx}px`,
                    height: `${coreSizePx}px`,
                    backgroundColor: touch.color,
                    boxShadow: `0 0 15px ${touch.color}, 0 0 25px ${touch.color}`
                  }}
                >
                  {/* High-intensity white center so glow radiates even with finger pressed down */}
                  <div className="w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_8px_white] animate-pulse" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
