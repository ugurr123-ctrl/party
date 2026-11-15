import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Users,
  Timer,
  Play,
  RotateCcw,
  Sparkles,
  Trophy,
  HelpCircle,
  ShieldAlert,
  Search,
  CheckCircle2,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { TablePlayer, loadTablePlayers } from '../utils/playerManager';
import { SPY_LOCATIONS } from '../data/partyData';

interface SpyModalProps {
  isOpen: boolean;
  onClose: () => void;
  players?: TablePlayer[];
  onShowToast: (msg: string) => void;
}

interface PlayerRole {
  player: TablePlayer;
  isSpy: boolean;
  role: string;
}

export const SpyModal: React.FC<SpyModalProps> = ({
  isOpen,
  onClose,
  players = [],
  onShowToast
}) => {
  const activePlayers = players.length >= 3 ? players : loadTablePlayers();
  const [soundActive, setSoundActive] = useState<boolean>(true);
  
  // Game Steps: 'setup' -> 'card_pass' -> 'discussion' -> 'voting' -> 'game_over'
  const [phase, setPhase] = useState<'setup' | 'card_pass' | 'discussion' | 'voting' | 'game_over'>('setup');
  const [location, setLocation] = useState(SPY_LOCATIONS[0]);
  const [playerRoles, setPlayerRoles] = useState<PlayerRole[]>([]);
  const [currentPassIdx, setCurrentPassIdx] = useState<number>(0);
  const [isCardRevealed, setIsCardRevealed] = useState<boolean>(false);
  
  // Timer State
  const [discussionSeconds, setDiscussionSeconds] = useState<number>(180);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Voting & Accusations
  const [accusedPlayerId, setAccusedPlayerId] = useState<string | null>(null);
  const [spyGuessLocation, setSpyGuessLocation] = useState<string>('');
  const [winnerTeam, setWinnerTeam] = useState<'civilians' | 'spy' | null>(null);
  const [endReason, setEndReason] = useState<string>('');

  // Initialize new game session
  const startNewGame = () => {
    soundEngine.playClick();
    const loc = SPY_LOCATIONS[Math.floor(Math.random() * SPY_LOCATIONS.length)];
    setLocation(loc);

    // Pick 1 spy at random
    const spyIdx = Math.floor(Math.random() * activePlayers.length);
    const roles: PlayerRole[] = activePlayers.map((player, idx) => {
      const isSpy = idx === spyIdx;
      const role = isSpy
        ? 'CASUS (Gizli Ajan)'
        : loc.roles[idx % loc.roles.length] || 'Sakin';
      return { player, isSpy, role };
    });

    setPlayerRoles(roles);
    setCurrentPassIdx(0);
    setIsCardRevealed(false);
    setDiscussionSeconds(180);
    setIsTimerRunning(false);
    setAccusedPlayerId(null);
    setSpyGuessLocation('');
    setWinnerTeam(null);
    setEndReason('');
    setPhase('card_pass');
    onShowToast(`🕵️ Casus Kim başladı! Telefonu ${roles[0].player.name}'e verin.`);
  };

  // Reveal secret role card
  const handleRevealCard = () => {
    soundEngine.playClick();
    soundEngine.triggerHaptic('drop');
    setIsCardRevealed(true);
  };

  // Next player card pass
  const handleNextPlayerPass = () => {
    soundEngine.playClick();
    soundEngine.triggerHaptic('tap');
    setIsCardRevealed(false);

    if (currentPassIdx < playerRoles.length - 1) {
      const nextIdx = currentPassIdx + 1;
      setCurrentPassIdx(nextIdx);
      onShowToast(`Cihazı ${playerRoles[nextIdx].player.name}'e teslim edin.`);
    } else {
      // Everyone saw their cards! Move to discussion
      setPhase('discussion');
      setIsTimerRunning(true);
      soundEngine.playSuccess();
      soundEngine.triggerHaptic('win');
      onShowToast('🎙️ Herkes rolünü öğrendi! 3 dakikalık sorgu başladı.');
    }
  };

  // Timer countdown
  useEffect(() => {
    if (isTimerRunning && discussionSeconds > 0) {
      timerRef.current = setInterval(() => {
        setDiscussionSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            setIsTimerRunning(false);
            soundEngine.playBuzzer();
            soundEngine.triggerHaptic('alert');
            onShowToast('⏰ Süre doldu! Oylamaya geçiliyor.');
            setPhase('voting');
            return 0;
          }
          if (prev <= 10) {
            soundEngine.triggerHaptic('tick');
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isTimerRunning, discussionSeconds, onShowToast]);

  // Vote on accused player
  const handleVoteSuspect = (playerId: string) => {
    soundEngine.playClick();
    soundEngine.triggerHaptic('alert');
    setAccusedPlayerId(playerId);

    const accused = playerRoles.find((r) => r.player.id === playerId);
    if (!accused) return;

    if (accused.isSpy) {
      // Civilians caught the spy!
      setWinnerTeam('civilians');
      setEndReason(`Tebrikler! Casus ${accused.player.name} deşifre edildi!`);
      soundEngine.playVictory();
      soundEngine.triggerHaptic('win');
      try {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
    } else {
      // Innocent was eliminated! Spy wins
      const theSpy = playerRoles.find((r) => r.isSpy);
      setWinnerTeam('spy');
      setEndReason(`Masum ${accused.player.name} elendi! Casus (${theSpy?.player.name}) kazandı!`);
      soundEngine.playBuzzer();
      soundEngine.triggerHaptic('alert');
    }
    setPhase('game_over');
  };

  if (!isOpen) return null;

  const currentRole = playerRoles[currentPassIdx];
  const minutes = Math.floor(discussionSeconds / 60);
  const seconds = discussionSeconds % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2 select-none">
      <div className="relative w-full max-w-md h-[94dvh] sm:h-[96vh] max-h-[890px] bg-[#0a0e18] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        
        {/* ================= FIXED TOP HEADER ================= */}
        <header className="w-full pt-safe bg-[#0a0e18]/90 backdrop-blur-xl border-b border-white/10 shrink-0">
          <div className="h-16 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-[#1c1f2a] flex items-center justify-center text-[#8b5cf6] text-xl shrink-0">
                🕵️
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-base text-white tracking-tight leading-none truncate">
                    Casus Kim?
                  </h1>
                  <span className="w-2 h-2 rounded-full bg-[#C4F442] animate-pulse shrink-0" />
                </div>
                <span className="text-[10px] text-[#4cd7f6] tracking-wider uppercase font-mono mt-1 truncate">
                  Gizli Ajan &amp; Blöf Arenası
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
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3.5 no-scrollbar">

          {/* SETUP SCREEN */}
          {phase === 'setup' && (
            <div className="flex flex-col items-center justify-center text-center my-auto gap-4 py-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#8b5cf6] to-[#f751a1] p-0.5 shadow-[0_0_40px_rgba(139,92,246,0.5)]">
                <div className="w-full h-full bg-[#0a0e18] rounded-[22px] flex items-center justify-center text-3xl">
                  🕵️‍♂️
                </div>
              </div>

              <div>
                <h2 className="text-xl font-black text-white">Casus Kim?</h2>
                <p className="text-xs text-gray-400 mt-1 max-w-xs">
                  Biriniz hariç herkes gizli mekânı biliyor. Casus ise nerede olduğunu bilmeden aranıza sızdı!
                </p>
              </div>

              <div className="w-full bg-[#111827] border border-white/10 rounded-2xl p-4 flex flex-col gap-2 text-left">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Masa Katılımcıları ({activePlayers.length} Oyuncu):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activePlayers.map((p) => (
                    <span
                      key={p.id}
                      className="px-2.5 py-1 rounded-full bg-black/40 border border-white/10 text-xs font-semibold text-white"
                    >
                      {p.name}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={startNewGame}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#8b5cf6] to-[#f751a1] text-white font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(139,92,246,0.5)] active:scale-95 transition-all"
              >
                <Play className="w-4 h-4 fill-white" />
                <span>Oyunu Başlat &amp; Kartları Dağıt</span>
              </button>
            </div>
          )}

          {/* CARD PASS SCREEN */}
          {phase === 'card_pass' && currentRole && (
            <div className="flex flex-col gap-3.5 flex-1 justify-between py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#8b5cf6]" />
                  <span className="text-xs font-bold text-white">
                    Sıradaki: <span className="text-[#bef264]">{currentRole.player.name}</span>
                  </span>
                </div>
                <span className="text-xs font-mono text-gray-400">
                  {currentPassIdx + 1} / {playerRoles.length}
                </span>
              </div>

              <div className="flex-1 flex flex-col items-center justify-center my-4">
                {!isCardRevealed ? (
                  <div
                    onClick={handleRevealCard}
                    className="w-full max-w-xs h-72 rounded-3xl bg-gradient-to-b from-[#1E293B] to-[#111827] border-2 border-dashed border-[#8b5cf6]/50 flex flex-col items-center justify-center p-6 text-center cursor-pointer active:scale-95 transition-all shadow-xl hover:border-[#8b5cf6]"
                  >
                    <EyeOff className="w-12 h-12 text-[#8b5cf6] mb-3 animate-pulse" />
                    <h3 className="text-lg font-black text-white">Gizli Rolünü Gör</h3>
                    <p className="text-xs text-gray-400 mt-1">
                      Telefonu sadece <span className="text-[#bef264] font-bold">{currentRole.player.name}</span> baksın! Kartı açmak için dokunun.
                    </p>
                  </div>
                ) : (
                  <div className="w-full max-w-xs h-72 rounded-3xl bg-gradient-to-b from-[#111827] to-[#0a0e18] border-2 border-[#8b5cf6] flex flex-col items-center justify-center p-6 text-center shadow-2xl animate-fade-in relative overflow-hidden">
                    {currentRole.isSpy ? (
                      <>
                        <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-3xl mb-2">
                          🕵️
                        </div>
                        <span className="text-[10px] font-black text-red-400 uppercase tracking-widest">
                          GİZLİ GÖREV
                        </span>
                        <h3 className="text-2xl font-black text-red-500 mt-1">SEN CASUSSUN!</h3>
                        <p className="text-xs text-gray-300 mt-2">
                          Mekânı bilmiyorsun! Diğer oyuncuların sorularını dinle ve mekânın neresi olduğunu tahmin etmeye çalış.
                        </p>
                      </>
                    ) : (
                      <>
                        <div className="w-14 h-14 rounded-2xl bg-[#bef264]/20 border border-[#bef264]/30 flex items-center justify-center text-3xl mb-2">
                          📍
                        </div>
                        <span className="text-[10px] font-black text-[#bef264] uppercase tracking-widest">
                          MEKÂN
                        </span>
                        <h3 className="text-2xl font-black text-white mt-1">{location.name}</h3>
                        <span className="text-xs text-purple-300 font-bold mt-1">
                          Rolün: {currentRole.role}
                        </span>
                        <p className="text-xs text-gray-400 mt-2">
                          Casusu ele vermeden mekânla ilgili sorular sor veya cevap ver!
                        </p>
                      </>
                    )}
                  </div>
                )}
              </div>

              {isCardRevealed && (
                <button
                  onClick={handleNextPlayerPass}
                  className="w-full py-3.5 rounded-2xl bg-[#bef264] text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(190,242,100,0.4)] active:scale-95"
                >
                  <span>
                    {currentPassIdx < playerRoles.length - 1
                      ? 'Kartı Gizle & Sıradakine Ver'
                      : 'Herkes Gördü, Sorguyu Başlat'}
                  </span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* DISCUSSION & TIMER SCREEN */}
          {phase === 'discussion' && (
            <div className="flex flex-col gap-3.5 flex-1 justify-between py-2">
              <div className="rounded-2xl bg-[#111827] border border-white/10 p-5 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-xl">
                <span className="text-[10px] font-bold text-[#8b5cf6] uppercase tracking-wider mb-1">
                  Soru &amp; Blöf Aşaması
                </span>

                {/* Big Timer */}
                <div className="text-5xl font-black font-mono text-white my-3 flex items-center gap-1">
                  <span className={discussionSeconds <= 30 ? 'text-red-400 animate-pulse' : 'text-[#bef264]'}>
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </span>
                </div>

                <p className="text-xs text-gray-300 max-w-xs">
                  Sırayla birbirinize şüpheli sorular sorun! Çok açık konuşmayın, casus mekânı çözebilir.
                </p>

                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => setIsTimerRunning((r) => !r)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
                  >
                    {isTimerRunning ? 'Durdur' : 'Devam Et'}
                  </button>
                  <button
                    onClick={() => setDiscussionSeconds(180)}
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs"
                  >
                    Sıfırla
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => {
                    setIsTimerRunning(false);
                    setPhase('voting');
                  }}
                  className="w-full py-3.5 rounded-2xl bg-red-500 hover:bg-red-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-[0_0_20px_rgba(239,68,68,0.4)] active:scale-95"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Şüpheliyi Oylamaya Çağır / Casusu Deşifre Et</span>
                </button>
              </div>
            </div>
          )}

          {/* VOTING SCREEN */}
          {phase === 'voting' && (
            <div className="flex flex-col gap-3 flex-1 py-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-white">Casus Olduğunu Düşündüğün Kişiyi Seç</h3>
                  <p className="text-[11px] text-gray-400">
                    Masada en çok şüphe çeken kişiye dokun:
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 my-2">
                {playerRoles.map(({ player }) => (
                  <button
                    key={player.id}
                    onClick={() => handleVoteSuspect(player.id)}
                    className="p-3 rounded-2xl bg-[#111827] border border-white/10 hover:border-red-500/50 flex items-center gap-2.5 active:scale-95 text-left transition-all group"
                  >
                    <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 font-bold flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-colors">
                      {player.name.charAt(0)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs font-bold text-white truncate">{player.name}</span>
                      <span className="text-[10px] text-gray-400 group-hover:text-red-400">Suçla &gt;</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* GAME OVER SCREEN */}
          {phase === 'game_over' && (
            <div className="flex flex-col items-center justify-center text-center my-auto gap-4 py-4">
              <div
                className={`w-20 h-20 rounded-3xl p-0.5 shadow-2xl ${
                  winnerTeam === 'civilians'
                    ? 'bg-gradient-to-tr from-[#bef264] to-emerald-400'
                    : 'bg-gradient-to-tr from-red-500 to-[#f751a1]'
                }`}
              >
                <div className="w-full h-full bg-[#0a0e18] rounded-[22px] flex items-center justify-center text-3xl">
                  {winnerTeam === 'civilians' ? '🏆' : '🕵️'}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#bef264]">
                  OYUN BİTTİ
                </span>
                <h2 className="text-2xl font-black text-white mt-1">
                  {winnerTeam === 'civilians' ? 'MASA KAZANDI!' : 'CASUS KAZANDI!'}
                </h2>
                <p className="text-xs text-gray-300 mt-1 max-w-xs">{endReason}</p>
              </div>

              {/* Secret location card */}
              <div className="w-full bg-[#111827] border border-white/10 rounded-2xl p-3 text-left">
                <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">
                  GİZLİ MEKÂN NEYDİ?
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xl">📍</span>
                  <span className="text-sm font-black text-white">{location.name}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full mt-2">
                <button
                  onClick={startNewGame}
                  className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Yeni Tur</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-[#bef264] text-black font-black text-xs"
                >
                  Kapat
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
