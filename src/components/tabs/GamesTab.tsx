import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../../utils/audio';
import { TabType, TournamentRound, TournamentPlayer } from '../../types';
import {
  GAME_CATALOG,
  TOURNAMENT_ROUNDS,
  FIVE_SECOND_QUESTIONS,
  TRUTH_QUESTIONS,
  DARE_TASKS,
  SPY_LOCATIONS,
  MOST_LIKELY_QUESTIONS,
  NEVER_HAVE_I_EVER_QUESTIONS,
  DEFAULT_CUSTOM_DECK
} from '../../data/partyData';
import { CustomDeckModal } from '../CustomDeckModal';
import { TableRescuerModal } from '../TableRescuerModal';
import { TruthDareModal } from '../TruthDareModal';
import { FiveSecondModal } from '../FiveSecondModal';
import { MostLikelyModal } from '../MostLikelyModal';
import { NeverHaveIModal } from '../NeverHaveIModal';
import { TimeBombModal } from '../TimeBombModal';
import { RockPaperScissorsModal } from '../RockPaperScissorsModal';
import { DontLaughModal } from '../DontLaughModal';
import { TenSecondsModal } from '../TenSecondsModal';
import { ReflexDuelModal } from '../ReflexDuelModal';
import { ChaoticTriviaModal } from '../ChaoticTriviaModal';
import { SpyModal } from '../SpyModal';
import { FunnyAnswersModal } from '../FunnyAnswersModal';
import { CharadesModal } from '../CharadesModal';
import { VipLieDetectorModal } from '../vip/VipLieDetectorModal';
import { VipBlindDrawingModal } from '../vip/VipBlindDrawingModal';
import { VipChaosRouletteModal } from '../vip/VipChaosRouletteModal';
import { VipMafiaAllianceModal } from '../vip/VipMafiaAllianceModal';
import { VipGalleryRouletteModal } from '../vip/VipGalleryRouletteModal';
import { VipTelepathyModal } from '../vip/VipTelepathyModal';
import { VipHostagePhoneModal } from '../vip/VipHostagePhoneModal';
import { VipSecretDetectiveModal } from '../vip/VipSecretDetectiveModal';
import { VipKaraokeHumModal } from '../vip/VipKaraokeHumModal';
import { VipBillRouletteModal } from '../vip/VipBillRouletteModal';
import { VipChaosTabooModal } from '../vip/VipChaosTabooModal';
import {
  Sparkles,
  Trophy,
  Shuffle,
  Layers,
  Play,
  RotateCcw,
  Check,
  X,
  Plus,
  Flame,
  Clock,
  Eye,
  EyeOff,
  UserCheck,
  Award,
  UserPlus,
  Users,
  Camera,
  Search,
  ArrowRight,
  Zap,
  Gamepad2,
  SlidersHorizontal,
  Crown,
  Lock
} from 'lucide-react';
import { TablePlayer, loadTablePlayers, saveTablePlayers } from '../../utils/playerManager';
import { vipManager, VIPStatus } from '../../utils/vipManager';

interface GamesTabProps {
  onSwitchTab: (tab: TabType) => void;
  onShowToast: (msg: string) => void;
  players?: TablePlayer[];
  onOpenPlayerManager?: () => void;
  onOpenVIP?: () => void;
  launchGameId?: string | null;
  onClearLaunchGame?: () => void;
}

export const GamesTab: React.FC<GamesTabProps> = ({
  onSwitchTab,
  onShowToast,
  players,
  onOpenPlayerManager,
  onOpenVIP,
  launchGameId,
  onClearLaunchGame
}) => {
  const activePlayers = players && players.length > 0 ? players : loadTablePlayers();
  const [vipStatus, setVipStatus] = useState<VIPStatus>(() => vipManager.getStatus());

  useEffect(() => {
    return vipManager.subscribe((newStatus) => setVipStatus(newStatus));
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isCustomDeckModalOpen, setIsCustomDeckModalOpen] = useState(false);
  const [isTableRescuerModalOpen, setIsTableRescuerModalOpen] = useState(false);
  const [isTruthDareModalOpen, setIsTruthDareModalOpen] = useState(false);
  const [isFiveSecModalOpen, setIsFiveSecModalOpen] = useState(false);
  const [isMostLikelyModalOpen, setIsMostLikelyModalOpen] = useState(false);
  const [isNeverHaveIModalOpen, setIsNeverHaveIModalOpen] = useState(false);
  const [isTimeBombModalOpen, setIsTimeBombModalOpen] = useState(false);
  const [isRockPaperScissorsModalOpen, setIsRockPaperScissorsModalOpen] = useState(false);
  const [isDontLaughModalOpen, setIsDontLaughModalOpen] = useState(false);
  const [isTenSecondsModalOpen, setIsTenSecondsModalOpen] = useState(false);
  const [isReflexDuelModalOpen, setIsReflexDuelModalOpen] = useState(false);
  const [isTriviaModalOpen, setIsTriviaModalOpen] = useState(false);
  const [isSpyModalOpen, setIsSpyModalOpen] = useState(false);
  const [isFunnyModalOpen, setIsFunnyModalOpen] = useState(false);
  const [isCharadesModalOpen, setIsCharadesModalOpen] = useState(false);
  const [isVipLieDetectorOpen, setIsVipLieDetectorOpen] = useState(false);
  const [isVipBlindDrawingOpen, setIsVipBlindDrawingOpen] = useState(false);
  const [isVipChaosRouletteOpen, setIsVipChaosRouletteOpen] = useState(false);
  const [isVipMafiaAllianceOpen, setIsVipMafiaAllianceOpen] = useState(false);
  const [isVipGalleryRouletteOpen, setIsVipGalleryRouletteOpen] = useState(false);
  const [isVipTelepathyOpen, setIsVipTelepathyOpen] = useState(false);
  const [isVipHostagePhoneOpen, setIsVipHostagePhoneOpen] = useState(false);
  const [isVipSecretDetectiveOpen, setIsVipSecretDetectiveOpen] = useState(false);
  const [isVipKaraokeHumOpen, setIsVipKaraokeHumOpen] = useState(false);
  const [isVipBillRouletteOpen, setIsVipBillRouletteOpen] = useState(false);
  const [isVipChaosTabooOpen, setIsVipChaosTabooOpen] = useState(false);
  const [customDeckCount, setCustomDeckCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('parti_kutusu_custom_deck');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed.length;
      }
    } catch {
      // ignore
    }
    return DEFAULT_CUSTOM_DECK.length;
  });

  // Modal states
  const [isTournamentModalOpen, setIsTournamentModalOpen] = useState(false);
  const [tournamentCurrentRoundIdx, setTournamentCurrentRoundIdx] = useState(0);
  const [tournamentPlayers, setTournamentPlayers] = useState<TournamentPlayer[]>([
    { id: 'p1', name: 'Burak', score: 0 },
    { id: 'p2', name: 'Cansu', score: 0 },
    { id: 'p3', name: 'Efe', score: 0 },
    { id: 'p4', name: 'Deniz', score: 0 }
  ]);



  const [searchQuery, setSearchQuery] = useState<string>('');

  // Filter games catalog
  const filteredGames = GAME_CATALOG.filter((g) => {
    const matchesCat =
      selectedCategory === 'all'
        ? true
        : selectedCategory === 'vip'
        ? Boolean(g.isVIP)
        : g.cat === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    if (!q) return matchesCat;
    const matchesSearch =
      g.title.toLowerCase().includes(q) ||
      g.desc.toLowerCase().includes(q) ||
      (g.badge && g.badge.toLowerCase().includes(q)) ||
      g.tag.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  // Start 5-round tournament (VIP exclusive party championship)
  const startTournament = () => {
    if (!vipStatus.isVIP) {
      soundEngine.playBuzzer();
      onShowToast('👑 5 Turluk Şampiyona VIP Kulübüne Özeldir!');
      if (onOpenVIP) onOpenVIP();
      return;
    }
    soundEngine.playVictory();
    setTournamentCurrentRoundIdx(0);
    setIsTournamentModalOpen(true);
    try {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    } catch {
      // ignore
    }
    onShowToast('🏆 5 Turluk Parti Şampiyonası Başladı!');
  };

  // Tournament score addition
  const addTournamentScore = (playerId: string, points: number) => {
    soundEngine.playSuccess();
    setTournamentPlayers((prev) =>
      prev.map((p) => (p.id === playerId ? { ...p, score: p.score + points } : p))
    );
    onShowToast(`+${points} puan eklendi!`);
  };

  // Next tournament round
  const nextTournamentRound = () => {
    if (tournamentCurrentRoundIdx < TOURNAMENT_ROUNDS.length - 1) {
      soundEngine.playClick();
      setTournamentCurrentRoundIdx((prev) => prev + 1);
    } else {
      // Tournament Finished!
      soundEngine.playVictory();
      try {
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
      } catch {
        // ignore
      }
      onShowToast('🎉 Şampiyona Tamamlandı! Gecenin Şampiyonu Kutlanıyor!');
    }
  };

  // Play random game
  const playRandomGame = () => {
    soundEngine.playClick();
    const playable = GAME_CATALOG.filter((g) => !g.isVIP || vipStatus.isVIP);
    const rand = playable[Math.floor(Math.random() * playable.length)];
    onShowToast(`Rastgele Seçildi: ${rand.title}`);
    handleLaunchGame(rand.id);
  };

  // Handle launch game with VIP gatecheck
  const handleLaunchGame = (gameId: string) => {
    soundEngine.playClick();
    const targetGame = GAME_CATALOG.find((g) => g.id === gameId);
    if (targetGame?.isVIP && !vipStatus.isVIP) {
      soundEngine.playBuzzer();
      onShowToast(`👑 ${targetGame.title} VIP Kulübüne Özeldir!`);
      if (onOpenVIP) {
        onOpenVIP();
      }
      return;
    }

    if (gameId === 'finger') {
      onSwitchTab('finger');
    } else if (gameId === 'wheel') {
      onSwitchTab('wheel');
    } else if (gameId === 'name' || gameId === 'dicecoin') {
      onSwitchTab('name');
    } else if (gameId === 'team') {
      onSwitchTab('team');
    } else if (gameId === 'spy') {
      setIsSpyModalOpen(true);
    } else if (gameId === 'fivesec') {
      setIsFiveSecModalOpen(true);
    } else if (gameId === 'timebomb') {
      setIsTimeBombModalOpen(true);
    } else if (gameId === 'rockpaperscissors') {
      setIsRockPaperScissorsModalOpen(true);
    } else if (gameId === 'dontlaugh') {
      setIsDontLaughModalOpen(true);
    } else if (gameId === 'tenseconds') {
      setIsTenSecondsModalOpen(true);
    } else if (gameId === 'speedquiz' || gameId === 'reflex') {
      setIsReflexDuelModalOpen(true);
    } else if (gameId === 'trivia' || gameId === 'kaotik_trivia') {
      setIsTriviaModalOpen(true);
    } else if (gameId === 'truthdare') {
      setIsTruthDareModalOpen(true);
    } else if (gameId === 'mostlikely') {
      setIsMostLikelyModalOpen(true);
    } else if (gameId === 'neverhave') {
      setIsNeverHaveIModalOpen(true);
    } else if (gameId === 'table_rescuer') {
      setIsTableRescuerModalOpen(true);
    } else if (gameId === 'funny') {
      setIsFunnyModalOpen(true);
    } else if (gameId === 'charades') {
      setIsCharadesModalOpen(true);
    } else if (gameId === 'customdeck') {
      setIsCustomDeckModalOpen(true);
    } else if (gameId === 'vip_lie_detector') {
      setIsVipLieDetectorOpen(true);
    } else if (gameId === 'vip_blind_drawing') {
      setIsVipBlindDrawingOpen(true);
    } else if (gameId === 'vip_chaos_roulette') {
      setIsVipChaosRouletteOpen(true);
    } else if (gameId === 'vip_mafia_table') {
      setIsVipMafiaAllianceOpen(true);
    } else if (gameId === 'vip_gallery_roulette') {
      setIsVipGalleryRouletteOpen(true);
    } else if (gameId === 'vip_telepathy') {
      setIsVipTelepathyOpen(true);
    } else if (gameId === 'vip_hostage_phone') {
      setIsVipHostagePhoneOpen(true);
    } else if (gameId === 'vip_secret_detective') {
      setIsVipSecretDetectiveOpen(true);
    } else if (gameId === 'vip_karaoke_hum') {
      setIsVipKaraokeHumOpen(true);
    } else if (gameId === 'vip_bill_roulette') {
      setIsVipBillRouletteOpen(true);
    } else if (gameId === 'vip_chaos_taboo') {
      setIsVipChaosTabooOpen(true);
    } else {
      onShowToast(`${gameId.toUpperCase()} modu hazırlanıyor!`);
    }
  };

  // Launch requested game externally (e.g. from VIP Modal)
  useEffect(() => {
    if (launchGameId) {
      handleLaunchGame(launchGameId);
      if (onClearLaunchGame) {
        onClearLaunchGame();
      }
    }
  }, [launchGameId]);






  const currentTournamentRound = TOURNAMENT_ROUNDS[tournamentCurrentRoundIdx];
  const sortedTournamentPlayers = [...tournamentPlayers].sort((a, b) => b.score - a.score);

  return (
    <div className="flex-1 flex flex-col space-y-4 py-1">
      {/* TOP: MASA OYUNCULARI (BAŞTA EKLE & OYUNLAR DÖNSÜN) */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#171b26] to-[#111827] border border-[#bef264]/30 shadow-lg flex flex-col space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#bef264]/20 border border-[#bef264]/30 text-[#bef264] flex items-center justify-center">
              <Users className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black text-white">Masa Oyuncuları</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#bef264]/20 text-[#bef264] font-mono font-bold">
                  {activePlayers.length} Kişi
                </span>
              </div>
              <p className="text-[10px] text-gray-400">Oyunlar bu masadaki oyuncular arasında döner</p>
            </div>
          </div>

          {onOpenPlayerManager && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenPlayerManager();
              }}
              className="px-3 py-1.5 rounded-xl bg-[#bef264] text-black font-black text-xs flex items-center gap-1 shadow-[0_0_12px_rgba(190,242,100,0.35)] active:scale-95 hover:brightness-105 transition-all"
            >
              <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>+ Oyuncu Ekle</span>
            </button>
          )}
        </div>

        {/* Player Avatars Reel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
          {activePlayers.map((p, idx) => (
            <div
              key={p.id}
              onClick={() => {
                soundEngine.playClick();
                onOpenPlayerManager && onOpenPlayerManager();
              }}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-black/40 border border-white/5 hover:border-[#bef264]/40 shrink-0 cursor-pointer active:scale-95 transition-all"
              title="Oyuncuyu Düzenle veya Fotoğraf Değiştir"
            >
              <img
                src={p.avatar}
                alt={p.name}
                className="w-7 h-7 rounded-lg object-cover ring-1 ring-[#bef264]/50"
              />
              <div className="flex flex-col text-left">
                <span className="text-[11px] font-bold text-white leading-tight truncate max-w-[85px]">
                  {p.name}
                </span>
                <span className="text-[9px] text-[#bef264] font-mono leading-tight">
                  {p.score} Puan
                </span>
              </div>
            </div>
          ))}

          {onOpenPlayerManager && (
            <button
              onClick={() => {
                soundEngine.playClick();
                onOpenPlayerManager();
              }}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl border border-dashed border-white/20 hover:border-[#bef264] text-gray-400 hover:text-[#bef264] text-xs font-bold shrink-0 transition-all active:scale-95"
            >
              <Camera className="w-3.5 h-3.5 text-[#bef264]" />
              <span className="text-[11px] whitespace-nowrap">Fotoğraflı Ekle</span>
            </button>
          )}
        </div>
      </div>

      {/* ================= HERO SPOTLIGHT: GÜNÜN HIT OYUNU ================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2a1322] via-[#111827] to-[#121c2d] p-5 border border-white/10 shadow-[0_8px_32px_rgba(247,81,161,0.18)]">
        {/* Ambient atmospheric glows */}
        <div className="absolute -right-8 -top-8 w-44 h-44 rounded-full bg-[#f751a1]/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-40 h-40 rounded-full bg-[#ef4444]/20 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span className="text-[11px] font-black uppercase tracking-wider text-red-400">
                Günün Yıldızı · Canlı Kaos
              </span>
            </div>
            <span className="text-[11px] font-bold text-[#bef264] bg-[#bef264]/10 px-2.5 py-0.5 rounded-full border border-[#bef264]/20">
              💣 Trend 1. Sırada
            </span>
          </div>

          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                Saatli Bomba - Sıcak Patates 💣
              </h2>
              <p className="text-xs text-gray-300 mt-1 leading-relaxed max-w-lg">
                Gizli geri sayım ve ivmeölçer hareket sensörü! Patlamadan önce soruyu cevapla, telefonu masadaki bir sonraki oyuncuya hızla pasla.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 flex-wrap">
            <button
              onClick={() => {
                soundEngine.playClick();
                setIsTimeBombModalOpen(true);
              }}
              className="flex-1 min-w-[140px] py-3 px-4 rounded-xl bg-gradient-to-r from-red-500 via-pink-600 to-[#f751a1] text-white font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(239,68,68,0.4)] active:scale-95 hover:brightness-110 transition-all"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Hemen Oyna</span>
            </button>

            <button
              onClick={startTournament}
              className={`py-3 px-3.5 rounded-xl border font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all ${
                vipStatus.isVIP
                  ? 'bg-amber-400/20 border-amber-400/50 text-amber-300 hover:bg-amber-400/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                  : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
              }`}
              title="5 Turluk Parti Şampiyonası (VIP)"
            >
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">5 Tur Şampiyona</span>
              <span className="text-[9px] bg-amber-400/20 text-amber-300 px-1.5 py-0.5 rounded font-black border border-amber-400/30">
                VIP
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* ================= 4-UP QUICK LAUNCH SHORTCUTS ================= */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <button
          onClick={() => {
            soundEngine.playClick();
            setIsTriviaModalOpen(true);
          }}
          className="group p-3 rounded-2xl bg-[#111827] border border-white/10 hover:border-[#f751a1]/50 flex flex-col items-center justify-center text-center transition-all active:scale-95 shadow-md"
        >
          <div className="w-9 h-9 rounded-xl bg-[#f751a1]/15 border border-[#f751a1]/30 text-[#f751a1] flex items-center justify-center mb-1.5 text-base group-hover:scale-110 transition-transform">
            🧠
          </div>
          <span className="text-xs font-black text-white group-hover:text-[#f751a1] transition-colors">Kaotik Trivia</span>
          <span className="text-[10px] text-gray-400 mt-0.5">Masa & Blöf</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            setIsReflexDuelModalOpen(true);
          }}
          className="group p-3 rounded-2xl bg-[#111827] border border-white/10 hover:border-[#bef264]/50 flex flex-col items-center justify-center text-center transition-all active:scale-95 shadow-md"
        >
          <div className="w-9 h-9 rounded-xl bg-[#bef264]/15 border border-[#bef264]/30 text-[#bef264] flex items-center justify-center mb-1.5 text-base group-hover:scale-110 transition-transform">
            ⚡
          </div>
          <span className="text-xs font-black text-white group-hover:text-[#bef264] transition-colors">1v1 Refleks</span>
          <span className="text-[10px] text-gray-400 mt-0.5">Yüz Yüze Kapış</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            setIsTenSecondsModalOpen(true);
          }}
          className="group p-3 rounded-2xl bg-[#111827] border border-white/10 hover:border-amber-500/50 flex flex-col items-center justify-center text-center transition-all active:scale-95 shadow-md"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center mb-1.5 text-base group-hover:scale-110 transition-transform">
            ⏱️
          </div>
          <span className="text-xs font-black text-white group-hover:text-amber-300 transition-colors">Kör Saat</span>
          <span className="text-[10px] text-gray-400 mt-0.5">Tam 10.00 Sn</span>
        </button>

        <button
          onClick={() => {
            soundEngine.playClick();
            setIsRockPaperScissorsModalOpen(true);
          }}
          className="group p-3 rounded-2xl bg-[#111827] border border-white/10 hover:border-[#4cd7f6]/50 flex flex-col items-center justify-center text-center transition-all active:scale-95 shadow-md"
        >
          <div className="w-9 h-9 rounded-xl bg-[#4cd7f6]/15 border border-[#4cd7f6]/30 text-[#4cd7f6] flex items-center justify-center mb-1.5 text-base group-hover:scale-110 transition-transform">
            ✂️
          </div>
          <span className="text-xs font-black text-white group-hover:text-[#4cd7f6] transition-colors">Taş Kâğıt</span>
          <span className="text-[10px] text-gray-400 mt-0.5">Taktik Düello</span>
        </button>
      </section>

      {/* ================= VIP PARTY CLUB BANNER ================= */}
      {onOpenVIP && (
        <div
          onClick={() => {
            soundEngine.playClick();
            onOpenVIP();
          }}
          className={`p-2.5 sm:p-3 rounded-2xl border transition-all active:scale-[0.99] cursor-pointer flex items-center justify-between gap-2.5 shadow-md overflow-hidden min-w-0 ${
            vipStatus.isVIP
              ? 'bg-gradient-to-r from-amber-500/20 via-[#1c1810] to-[#111827] border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
              : 'bg-gradient-to-r from-[#171b26] via-[#111827] to-[#1c1810] border-amber-500/30 hover:border-amber-400/60'
          }`}
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-300 text-black flex items-center justify-center shrink-0 shadow">
              <Crown className="w-4 h-4 fill-black" />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                <span className="text-xs font-black text-white shrink-0">
                  {vipStatus.isVIP ? 'VIP Kulübü Aktif 👑' : 'VIP Parti Kulübü'}
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-400 text-black font-black uppercase shrink-0">
                  {vipStatus.isVIP ? vipStatus.planName : '+100 Kart'}
                </span>
              </div>
              <p className="text-[10px] text-gray-300 truncate mt-0.5">
                {vipStatus.isVIP
                  ? 'Tüm özel kartlar, sınırsız deste ve şampiyona açık!'
                  : 'Özel ateşli kartlar, turnuva modu ve VIP rozeti'}
              </p>
            </div>
          </div>

          <button
            type="button"
            className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-yellow-300 text-black text-[10px] sm:text-[11px] font-black uppercase shrink-0 shadow active:scale-95 transition-all flex items-center gap-1"
          >
            <span>{vipStatus.isVIP ? 'Yönet' : 'VIP Ol ✨'}</span>
          </button>
        </div>
      )}

      {/* ================= SEARCH & CATEGORY FILTER BAR ================= */}
      <section className="flex flex-col gap-2.5 pt-1">
        {/* Instant Search Bar */}
        <div className="relative w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Oyun ara... (örn. Bomba, Casus, Gülmeme, 10 Saniye)"
            className="w-full bg-[#111827] border border-white/10 focus:border-[#bef264] rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-gray-500 outline-none transition-all shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              title="Temizle"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Header Title & Available Game Count */}
        <div className="flex items-center justify-between px-0.5">
          <h3 className="text-xs font-black text-gray-300 uppercase tracking-wider flex items-center gap-1.5">
            <Gamepad2 className="w-4 h-4 text-[#bef264]" />
            <span>Parti Koleksiyonu</span>
          </h3>
          <span className="text-[11px] font-semibold text-gray-400">
            {filteredGames.length} / {GAME_CATALOG.length} Oyun
          </span>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: `Tümü (${GAME_CATALOG.length})` },
            { id: 'vip', label: '👑 VIP Oyunlar' },
            { id: 'party', label: '🔥 Parti & Kaos' },
            { id: 'quick', label: '⚡ Hızlı Düello' },
            { id: 'role', label: '🕵️ Blöf & Rol' },
            { id: 'dare', label: '🌶️ Doğruluk & Cesaret' }
          ].map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedCategory(cat.id);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? cat.id === 'vip'
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-black shadow-[0_0_14px_rgba(245,158,11,0.5)] font-black'
                      : 'bg-[#bef264] text-black shadow-[0_0_14px_rgba(190,242,100,0.35)]'
                    : cat.id === 'vip'
                    ? 'bg-[#1c1810] border border-amber-500/40 text-amber-300 hover:border-amber-400'
                    : 'bg-[#111827] border border-white/10 text-gray-300 hover:text-white hover:border-white/20'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ================= BENTO GAME CARDS GRID ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-16">
        {filteredGames.length > 0 ? (
          filteredGames.map((game) => {
            const isLocked = Boolean(game.isVIP && !vipStatus.isVIP);
            return (
              <div
                key={game.id}
                onClick={() => handleLaunchGame(game.id)}
                className={`group relative rounded-2xl bg-[#111827] p-4 flex flex-col justify-between transition-all duration-200 cursor-pointer shadow-lg hover:shadow-2xl active:scale-[0.99] overflow-hidden select-none border ${
                  game.isVIP
                    ? vipStatus.isVIP
                      ? 'border-amber-400/60 shadow-[0_0_20px_rgba(245,158,11,0.2)] bg-gradient-to-b from-[#1b1710] to-[#111827]'
                      : 'border-amber-500/30 hover:border-amber-400/70 shadow-[0_0_15px_rgba(245,158,11,0.12)] bg-gradient-to-b from-[#161410] to-[#111827]'
                    : 'border-white/10 hover:border-white/25'
                }`}
              >
                {/* Dynamic corner gradient glow */}
                <div
                  className={`absolute -top-12 -right-12 w-32 h-32 rounded-full bg-gradient-to-br ${
                    game.gradient || 'from-white/10 to-transparent'
                  } blur-2xl pointer-events-none opacity-40 group-hover:opacity-80 transition-opacity`}
                />

                {/* Top Row: Icon + Meta Unboxed Kicker */}
                <div className="relative z-10 flex items-start justify-between gap-3 mb-2.5">
                  <div className="relative">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border shadow-md shrink-0 transition-transform duration-200 group-hover:scale-110"
                      style={{
                        backgroundColor: game.isVIP ? '#f59e0b18' : `${game.color || '#f751a1'}15`,
                        borderColor: game.isVIP ? '#f59e0b40' : `${game.color || '#f751a1'}35`
                      }}
                    >
                      {game.icon}
                    </div>
                    {game.isVIP && (
                      <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 text-black flex items-center justify-center shadow-md">
                        <Crown className="w-3 h-3 fill-black" />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end text-right min-w-0 flex-1">
                    {game.badge && (
                      <span
                        className={`text-[9px] sm:text-[10px] font-black tracking-wider uppercase flex items-center gap-1 truncate max-w-full ${
                          game.isVIP ? 'text-amber-400' : ''
                        }`}
                        style={!game.isVIP ? { color: game.color || '#bef264' } : undefined}
                      >
                        {game.badge}
                      </span>
                    )}
                    <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-gray-400 mt-0.5 truncate max-w-full">
                      <span className="truncate">{game.minPlayers || game.tag}</span>
                      {game.playTime && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="shrink-0">{game.playTime}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Middle Section: Title & Description */}
                <div className="relative z-10 flex-1 flex flex-col mb-3">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <h3 className="text-sm sm:text-base font-black text-white tracking-tight group-hover:text-[#bef264] transition-colors leading-snug truncate">
                      {game.title}
                    </h3>
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed mt-1 line-clamp-2">
                    {game.desc}
                  </p>
                </div>

                {/* Bottom Row: Status Indicator + High-Tactile Launch Button */}
                <div className="relative z-10 flex items-center justify-between gap-2 pt-2.5 border-t border-white/5 min-w-0">
                  <div className="flex items-center gap-1.5 text-[11px] text-gray-400 min-w-0 flex-1 truncate">
                    {isLocked ? (
                      <span className="flex items-center gap-1 text-amber-400 font-bold truncate">
                        <Lock className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">VIP Özel</span>
                      </span>
                    ) : game.isVIP ? (
                      <span className="flex items-center gap-1 text-amber-400 font-bold truncate">
                        <Crown className="w-3.5 h-3.5 fill-amber-400 shrink-0" />
                        <span className="truncate">VIP Açık</span>
                      </span>
                    ) : (
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                        <span className="font-semibold text-gray-300 truncate">Canlı Masa</span>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleLaunchGame(game.id);
                    }}
                    className={`h-8 px-3 rounded-xl font-black text-xs flex items-center gap-1 shadow-md transition-all active:scale-95 group-hover:brightness-110 shrink-0 cursor-pointer ${
                      isLocked
                        ? 'bg-amber-400 hover:bg-yellow-300 text-black shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                        : game.isVIP
                        ? 'bg-gradient-to-r from-amber-400 to-yellow-300 text-black shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                        : 'text-black'
                    }`}
                    style={
                      !isLocked && !game.isVIP
                        ? { backgroundColor: game.color || '#bef264' }
                        : undefined
                    }
                    type="button"
                  >
                    {isLocked ? (
                      <>
                        <Lock className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                        <span>VIP Aç 👑</span>
                      </>
                    ) : game.isVIP ? (
                      <>
                        <Crown className="w-3.5 h-3.5 fill-black stroke-[2.5] shrink-0" />
                        <span>Oyna</span>
                        <ArrowRight className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                      </>
                    ) : (
                      <>
                        <span>Oyna</span>
                        <ArrowRight className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-12 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-[#111827] border border-white/5">
            <span className="text-3xl mb-2">🔍</span>
            <h4 className="text-sm font-bold text-white">Eşleşen oyun bulunamadı</h4>
            <p className="text-xs text-gray-400 mt-1 max-w-xs">
              Arama kriterinize uygun oyun bulunamadı. Aramayı temizleyebilir veya kategoriyi değiştirebilirsiniz.
            </p>
            <button
              onClick={() => {
                soundEngine.playClick();
                setSearchQuery('');
                setSelectedCategory('all');
              }}
              className="mt-3 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all active:scale-95"
            >
              Tüm Oyunları Listele
            </button>
          </div>
        )}
      </div>

      {/* Dedicated bottom clearance spacer for games tab */}
      <div className="h-20 sm:h-24 w-full shrink-0 pointer-events-none" aria-hidden="true" />

      {/* ================= MODAL: 5 TURLUK ŞAMPİYONA ================= */}
      {isTournamentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-white/20 rounded-3xl p-5 w-full max-w-sm shadow-2xl space-y-4 text-center">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-left">
                <Trophy className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-sm font-black text-white">Parti Şampiyonası</h3>
                  <span className="text-[10px] text-gray-400">
                    Tur {tournamentCurrentRoundIdx + 1} / {TOURNAMENT_ROUNDS.length}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setIsTournamentModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Round Card */}
            <div className="bg-black/40 border border-white/10 p-4 rounded-2xl text-left space-y-1.5">
              <span className="text-[10px] font-black uppercase text-[#bef264] tracking-wider block">
                {currentTournamentRound.sub} (+{currentTournamentRound.points} Puan)
              </span>
              <h4 className="text-lg font-black text-white">{currentTournamentRound.title}</h4>
              <p className="text-xs text-gray-300 leading-relaxed pt-1">
                {currentTournamentRound.instructions}
              </p>

              <button
                onClick={() => {
                  setIsTournamentModalOpen(false);
                  handleLaunchGame(currentTournamentRound.gameId);
                }}
                className="w-full mt-3 py-2.5 rounded-xl bg-[#ec4899] text-white font-black text-xs active:scale-95 transition-transform flex items-center justify-center gap-1.5 shadow"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                Bu Turun Oyununu Başlat
              </button>
            </div>

            {/* Live Scoreboard */}
            <div className="text-left space-y-1.5">
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">
                CANLI PUAN DURUMU
              </span>
              <div className="space-y-1.5">
                {sortedTournamentPlayers.map((player, idx) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/5 text-xs font-bold"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-amber-400 font-black">
                        {idx === 0 ? '👑' : `#${idx + 1}`}
                      </span>
                      <span className="text-white">{player.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[#bef264]">{player.score} Puan</span>
                      <button
                        onClick={() => addTournamentScore(player.id, currentTournamentRound.points)}
                        className="px-2 py-0.5 rounded-lg bg-lime-400/20 text-[#bef264] hover:bg-lime-400/40 text-[10px]"
                      >
                        +{currentTournamentRound.points}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="pt-2 flex gap-2">
              <button
                onClick={nextTournamentRound}
                className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#bef264] to-lime-500 text-black font-black text-xs active:scale-95 transition-transform shadow glow-lime"
              >
                {tournamentCurrentRoundIdx < TOURNAMENT_ROUNDS.length - 1
                  ? 'Sonraki Tura Geç ➡️'
                  : '🏆 Şampiyonu İlan Et!'}
              </button>
            </div>
          </div>
        </div>
      )}



      {/* ================= MODAL: KİM DAHA ÇOK? ================= */}
      <MostLikelyModal
        isOpen={isMostLikelyModalOpen}
        onClose={() => setIsMostLikelyModalOpen(false)}
        onShowToast={onShowToast}
      />

      {/* ================= MODAL: BEN HİÇ YAPMADIM ================= */}
      <NeverHaveIModal
        isOpen={isNeverHaveIModalOpen}
        onClose={() => setIsNeverHaveIModalOpen(false)}
        onShowToast={onShowToast}
      />

      {/* ================= MODAL: ÖZEL DESTE YÖNETİCİSİ ================= */}
      <CustomDeckModal
        isOpen={isCustomDeckModalOpen}
        onClose={() => {
          setIsCustomDeckModalOpen(false);
          try {
            const saved = localStorage.getItem('parti_kutusu_custom_deck');
            if (saved) {
              const parsed = JSON.parse(saved);
              if (Array.isArray(parsed)) setCustomDeckCount(parsed.length);
            }
          } catch {
            // ignore
          }
        }}
        onShowToast={onShowToast}
      />

      {/* ================= MODAL: MASA KURTARICISI ================= */}
      <TableRescuerModal
        isOpen={isTableRescuerModalOpen}
        onClose={() => setIsTableRescuerModalOpen(false)}
        onShowToast={onShowToast}
      />

      {/* ================= MODAL: DOĞRULUK VE CESARET ================= */}
      <TruthDareModal
        isOpen={isTruthDareModalOpen}
        onClose={() => setIsTruthDareModalOpen(false)}
        onShowToast={onShowToast}
      />

      {/* ================= MODAL: 5 SANİYE KURALI ================= */}
      <FiveSecondModal
        isOpen={isFiveSecModalOpen}
        onClose={() => setIsFiveSecModalOpen(false)}
        onShowToast={onShowToast}
      />

      {/* ================= MODAL: SAATLİ BOMBA - SICAK PATATES ================= */}
      <TimeBombModal
        isOpen={isTimeBombModalOpen}
        onClose={() => setIsTimeBombModalOpen(false)}
        onShowToast={onShowToast}
      />

      {/* ================= MODAL: TAŞ KAĞIT MAKAS 2.0 - DÜELLO ARENASI ================= */}
      <RockPaperScissorsModal
        isOpen={isRockPaperScissorsModalOpen}
        onClose={() => setIsRockPaperScissorsModalOpen(false)}
        onShowToast={onShowToast}
      />

      {/* ================= MODAL: GÜLMEME MEYDAN OKUMASI 1V1 ================= */}
      <DontLaughModal
        isOpen={isDontLaughModalOpen}
        onClose={() => setIsDontLaughModalOpen(false)}
        onShowToast={onShowToast}
      />

      {/* ================= MODAL: TAM 10.00 SANİYE (KÖR KRONOMETRE) ================= */}
      <TenSecondsModal
        isOpen={isTenSecondsModalOpen}
        onClose={() => setIsTenSecondsModalOpen(false)}
        onShowToast={onShowToast}
      />

      {/* ================= MODAL: 1V1 REFLEKS DÜELLOSU ================= */}
      <ReflexDuelModal
        isOpen={isReflexDuelModalOpen}
        onClose={() => setIsReflexDuelModalOpen(false)}
        players={activePlayers}
        onShowToast={onShowToast}
      />

      {/* ================= MODAL: KAOTİK TRIVIA & POPÜLER KÜLTÜR ================= */}
      <ChaoticTriviaModal
        isOpen={isTriviaModalOpen}
        onClose={() => setIsTriviaModalOpen(false)}
        players={activePlayers}
        onShowToast={onShowToast}
      />

      {/* ================= MODAL: CASUS KİM? ================= */}
      <SpyModal
        isOpen={isSpyModalOpen}
        onClose={() => setIsSpyModalOpen(false)}
        players={activePlayers}
        onShowToast={onShowToast}
      />

      {/* ================= MODAL: EN KOMİK CEVAP ================= */}
      <FunnyAnswersModal
        isOpen={isFunnyModalOpen}
        onClose={() => setIsFunnyModalOpen(false)}
        players={activePlayers}
        onShowToast={onShowToast}
      />

      {/* ================= MODAL: SESSİZ SİNEMA & KELİME ================= */}
      <CharadesModal
        isOpen={isCharadesModalOpen}
        onClose={() => setIsCharadesModalOpen(false)}
        onShowToast={onShowToast}
      />

      {/* ================= VIP MODALS (11 EXCLUSIVE PARTY GAMES) ================= */}
      <VipLieDetectorModal
        isOpen={isVipLieDetectorOpen}
        onClose={() => setIsVipLieDetectorOpen(false)}
        onShowToast={onShowToast}
      />

      <VipBlindDrawingModal
        isOpen={isVipBlindDrawingOpen}
        onClose={() => setIsVipBlindDrawingOpen(false)}
        onShowToast={onShowToast}
      />

      <VipChaosRouletteModal
        isOpen={isVipChaosRouletteOpen}
        onClose={() => setIsVipChaosRouletteOpen(false)}
        onShowToast={onShowToast}
      />

      <VipMafiaAllianceModal
        isOpen={isVipMafiaAllianceOpen}
        onClose={() => setIsVipMafiaAllianceOpen(false)}
        onShowToast={onShowToast}
      />

      <VipGalleryRouletteModal
        isOpen={isVipGalleryRouletteOpen}
        onClose={() => setIsVipGalleryRouletteOpen(false)}
        onShowToast={onShowToast}
      />

      <VipTelepathyModal
        isOpen={isVipTelepathyOpen}
        onClose={() => setIsVipTelepathyOpen(false)}
        onShowToast={onShowToast}
      />

      <VipHostagePhoneModal
        isOpen={isVipHostagePhoneOpen}
        onClose={() => setIsVipHostagePhoneOpen(false)}
        onShowToast={onShowToast}
      />

      <VipSecretDetectiveModal
        isOpen={isVipSecretDetectiveOpen}
        onClose={() => setIsVipSecretDetectiveOpen(false)}
        onShowToast={onShowToast}
      />

      <VipKaraokeHumModal
        isOpen={isVipKaraokeHumOpen}
        onClose={() => setIsVipKaraokeHumOpen(false)}
        onShowToast={onShowToast}
      />

      <VipBillRouletteModal
        isOpen={isVipBillRouletteOpen}
        onClose={() => setIsVipBillRouletteOpen(false)}
        onShowToast={onShowToast}
      />

      <VipChaosTabooModal
        isOpen={isVipChaosTabooOpen}
        onClose={() => setIsVipChaosTabooOpen(false)}
        onShowToast={onShowToast}
      />
    </div>
  );
};
