import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Shuffle,
  Mic,
  Award,
  Clock,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  Hand,
  Volume2,
  VolumeX,
  Flame,
  Zap,
  Users,
  Eye,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  Vibrate
} from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { TablePlayer, loadTablePlayers } from '../utils/playerManager';

export type MostLikelyCategory =
  | 'all'
  | 'Gizli Sırlar'
  | 'Çılgınlık'
  | 'Aşk & Flört'
  | 'Sosyal Medya'
  | 'Masa Dedikodusu'
  | 'Para & Kariyer';

export interface MostLikelyCard {
  id: string;
  question: string;
  category: Exclude<MostLikelyCategory, 'all'>;
}

export const MOST_LIKELY_DECK: MostLikelyCard[] = [
  // Gizli Sırlar
  {
    id: 'ml-1',
    question: 'Telefonuna şifre koymadan masada asla bırakamayacak kişi kim?',
    category: 'Gizli Sırlar'
  },
  {
    id: 'ml-9',
    question: 'Gizli ajan olsa 5 dakika içinde sırrı birine ağzından kaçıracak kişi kim?',
    category: 'Gizli Sırlar'
  },
  {
    id: 'ml-13',
    question: 'Tarayıcı geçmişi masanın ortasında açılsa en çok panikleyecek kişi kim?',
    category: 'Gizli Sırlar'
  },
  {
    id: 'ml-14',
    question: 'En büyük yalanını söylerken bile gözünü kırpmadan masayı inandıracak kişi kim?',
    category: 'Gizli Sırlar'
  },
  // Çılgınlık
  {
    id: 'ml-3',
    question: 'Masada yanlışlıkla polise veya güvenliğe yakalanması en olası kişi kim?',
    category: 'Çılgınlık'
  },
  {
    id: 'ml-5',
    question: 'Grup tatilinde sabahın beşinde herkesi zorla düdükle uyandıracak kişi kim?',
    category: 'Çılgınlık'
  },
  {
    id: 'ml-10',
    question: 'Bir reality şovda yarışsa ilk haftadan tüm ev halkıyla kavga edecek kişi kim?',
    category: 'Çılgınlık'
  },
  {
    id: 'ml-11',
    question: 'Gece 03:00\'te aniden "Hadi başka şehre gidiyoruz" diye masayı gaza getirecek kişi kim?',
    category: 'Çılgınlık'
  },
  {
    id: 'ml-15',
    question: 'Canlı konserde sahneye atlayıp güvenlikle köşe kapmaca oynayacak kişi kim?',
    category: 'Çılgınlık'
  },
  // Aşk & Flört
  {
    id: 'ml-2',
    question: 'Eski sevgilisinin düğününe gidip en önde pasta yiyecek kişi kim?',
    category: 'Aşk & Flört'
  },
  {
    id: 'ml-12',
    question: 'Aşık olduğu kişinin burcuna göre hayatını şekillendirecek kişi kim?',
    category: 'Aşk & Flört'
  },
  {
    id: 'ml-16',
    question: 'İlk buluşmada hemen evlilik ve gelecekteki çocuk isimlerini açacak kişi kim?',
    category: 'Aşk & Flört'
  },
  {
    id: 'ml-17',
    question: 'Aynı anda birden fazla flörtü idare ederken hepsinin ismini birbirine karıştıracak kişi kim?',
    category: 'Aşk & Flört'
  },
  // Sosyal Medya
  {
    id: 'ml-7',
    question: 'Sahte hesap açıp stalk yaparken yanlışlıkla hikayeyi beğenecek kişi kim?',
    category: 'Sosyal Medya'
  },
  {
    id: 'ml-18',
    question: 'Yemek soğuyana kadar fotoğraf çekmeden masadaki kimseye çatal vurdurmayacak kişi kim?',
    category: 'Sosyal Medya'
  },
  {
    id: 'ml-19',
    question: 'Fotoğraflarına en çok filtre basıp gerçek hayatta zor tanınacak hale gelen kişi kim?',
    category: 'Sosyal Medya'
  },
  {
    id: 'ml-20',
    question: 'Gittiği her kafenin tuvaletinde ayna pozu çekmeden ayrılamayan kişi kim?',
    category: 'Sosyal Medya'
  },
  // Masa Dedikodusu
  {
    id: 'ml-4',
    question: 'Issız adada kalsa ilk gün herkesi tek bir konserve için satacak kişi kim?',
    category: 'Masa Dedikodusu'
  },
  {
    id: 'ml-8',
    question: 'Girdiği her ortamda ortamın en gürültülü ve dikkat çeken kahkahasını atacak kişi kim?',
    category: 'Masa Dedikodusu'
  },
  {
    id: 'ml-21',
    question: 'Masadan 5 dakika erken kalksa arkasından en çok dedikodu yapılacak kişi kim?',
    category: 'Masa Dedikodusu'
  },
  {
    id: 'ml-22',
    question: '"Bana güvenin hiçbir şey olmayacak" dedikten sonra ortalığı birbirine katacak kişi kim?',
    category: 'Masa Dedikodusu'
  },
  // Para & Kariyer
  {
    id: 'ml-6',
    question: 'Maaşını aldığı ilk 24 saat içinde tamamını lüks saçmalıklara harcayacak kişi kim?',
    category: 'Para & Kariyer'
  },
  {
    id: 'ml-23',
    question: 'Masada hesap ödeme anı gelince tuvalete kaçması en olası kişi kim?',
    category: 'Para & Kariyer'
  },
  {
    id: 'ml-24',
    question: 'Piyangodan büyük ikramiye çıksa gruptan gizleyip ertesi gün kayıplara karışacak kişi kim?',
    category: 'Para & Kariyer'
  }
];

interface MostLikelyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const MostLikelyModal: React.FC<MostLikelyModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const [players, setPlayers] = useState<TablePlayer[]>(() => loadTablePlayers());
  const [currentRound, setCurrentRound] = useState(1);
  const totalRounds = 12;
  const [selectedCategory, setSelectedCategory] = useState<MostLikelyCategory>('all');
  const [cardIndex, setCardIndex] = useState(0);
  const [votes, setVotes] = useState<Record<string, number>>({});
  
  // Countdown state
  const [isCounting, setIsCounting] = useState(false);
  const [countdownLabel, setCountdownLabel] = useState('3, 2, 1 PARMAKLA GÖSTER!');
  
  // Defense stage timer state
  const [defenseTimeLeft, setDefenseTimeLeft] = useState(30);
  const [isDefenseTimerRunning, setIsDefenseTimerRunning] = useState(false);
  const [selectedDefensePlayerId, setSelectedDefensePlayerId] = useState<string | null>(null);

  // Sound & Haptic
  const [isHapticOn, setIsHapticOn] = useState(soundEngine.hapticsEnabled);
  const [showInfoModal, setShowInfoModal] = useState(false);

  // Load players on mount/open
  useEffect(() => {
    if (isOpen) {
      const p = loadTablePlayers();
      setPlayers(p);
      
      // Initialize votes
      const initVotes: Record<string, number> = {};
      p.forEach((pl, idx) => {
        initVotes[pl.id] = idx === 1 ? 2 : idx === 0 ? 1 : 0;
      });
      setVotes(initVotes);
      setDefenseTimeLeft(30);
      setIsDefenseTimerRunning(false);
      setCountdownLabel('3, 2, 1 PARMAKLA GÖSTER!');
      setIsCounting(false);
    }
  }, [isOpen]);

  // Defense timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isDefenseTimerRunning && defenseTimeLeft > 0) {
      interval = setInterval(() => {
        setDefenseTimeLeft((prev) => {
          if (prev <= 1) {
            soundEngine.playBuzzer();
            setIsDefenseTimerRunning(false);
            onShowToast('⏰ Savunma Süresi Bitti! Cezayı İç veya İtiraf Et!');
            return 0;
          }
          if (prev <= 5) {
            soundEngine.triggerHaptic('tick');
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isDefenseTimerRunning, defenseTimeLeft, onShowToast]);

  if (!isOpen) return null;

  const filteredCards = MOST_LIKELY_DECK.filter(
    (c) => selectedCategory === 'all' || c.category === selectedCategory
  );
  const currentCard = filteredCards[cardIndex % filteredCards.length] || MOST_LIKELY_DECK[0];

  // Identify leader / most voted player
  const sortedPlayersByVote = [...players].sort((a, b) => {
    const vA = votes[a.id] || 0;
    const vB = votes[b.id] || 0;
    return vB - vA;
  });

  const maxVotes = sortedPlayersByVote.length > 0 ? votes[sortedPlayersByVote[0].id] || 0 : 0;
  const fallbackPlayer: TablePlayer = { id: 'p1', name: 'Oyuncu', avatar: '', score: 0, color: '#f751a1' };
  const topVotedPlayer = sortedPlayersByVote.length > 0 && maxVotes > 0 ? sortedPlayersByVote[0] : (players[0] || fallbackPlayer);
  const activeDefensePlayer = players.find(p => p.id === selectedDefensePlayerId) || topVotedPlayer || fallbackPlayer;

  const totalVotesCount = Object.values(votes).reduce((sum, v) => sum + v, 0);

  // Trigger Countdown 3-2-1
  const handleStartCountdown = () => {
    if (isCounting) return;
    setIsCounting(true);
    soundEngine.playClick();
    soundEngine.triggerHaptic('tap');
    
    let count = 3;
    setCountdownLabel(`${count}...`);
    soundEngine.playCountdown();

    const interval = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdownLabel(`${count}...`);
        soundEngine.playCountdown();
      } else if (count === 0) {
        setCountdownLabel('GÖSTER! 👉');
        soundEngine.playVictory();
        soundEngine.triggerHaptic('win');
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setCountdownLabel('3, 2, 1 PARMAKLA GÖSTER!');
          setIsCounting(false);
        }, 800);
      }
    }, 450);
  };

  // Add / Increment vote for player
  const handleVotePlayer = (playerId: string) => {
    soundEngine.playClick();
    soundEngine.triggerHaptic('tap');
    setVotes((prev) => ({
      ...prev,
      [playerId]: (prev[playerId] || 0) + 1
    }));
  };

  // Card navigation
  const handlePrevCard = () => {
    soundEngine.playClick();
    setCardIndex((prev) => (prev <= 0 ? filteredCards.length - 1 : prev - 1));
  };

  const handleNextCardInline = () => {
    soundEngine.playClick();
    setCardIndex((prev) => (prev + 1) % filteredCards.length);
  };

  const handleShuffleQuestion = () => {
    soundEngine.playClick();
    soundEngine.triggerHaptic('tap');
    const rand = Math.floor(Math.random() * filteredCards.length);
    setCardIndex(rand);
    onShowToast('🔀 Yeni soru çekildi!');
  };

  // Reveal votes & Celebrate
  const handleRevealVotes = () => {
    soundEngine.playVictory();
    soundEngine.triggerHaptic('win');
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }
    if (topVotedPlayer) {
      setSelectedDefensePlayerId(topVotedPlayer.id);
      onShowToast(`🎯 En çok oy alan: ${topVotedPlayer.name} (${maxVotes} Oy) kürsüde!`);
    }
  };

  // Next round
  const handleNextRound = () => {
    soundEngine.playClick();
    setCurrentRound((prev) => (prev >= totalRounds ? 1 : prev + 1));
    setCardIndex((prev) => (prev + 1) % filteredCards.length);
    
    // Reset votes for fresh round
    const resetVotes: Record<string, number> = {};
    players.forEach((p) => {
      resetVotes[p.id] = 0;
    });
    setVotes(resetVotes);
    setDefenseTimeLeft(30);
    setIsDefenseTimerRunning(false);
    onShowToast(`🏁 Tur ${(currentRound % totalRounds) + 1} Başladı!`);
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

  const categoriesList: { id: MostLikelyCategory; label: string; icon: string }[] = [
    { id: 'all', label: 'Tümü', icon: '✨' },
    { id: 'Gizli Sırlar', label: 'Gizli Sırlar', icon: '🤫' },
    { id: 'Çılgınlık', label: 'Çılgınlık', icon: '⚡' },
    { id: 'Aşk & Flört', label: 'Aşk & Flört', icon: '❤️' },
    { id: 'Sosyal Medya', label: 'Sosyal Medya', icon: '📱' },
    { id: 'Masa Dedikodusu', label: 'Masa Dedikodusu', icon: '☕' },
    { id: 'Para & Kariyer', label: 'Para & Kariyer', icon: '💸' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2 select-none font-body-md text-on-surface antialiased">
      <div className="relative w-full max-w-md h-[94dvh] sm:h-[96vh] max-h-[890px] bg-[#0a0e18] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        {/* ================= FIXED TOP HEADER ================= */}
        <header className="w-full pt-safe bg-[#0a0e18]/90 backdrop-blur-xl border-b border-white/10 shrink-0">
          <div className="h-14 sm:h-16 px-3.5 sm:px-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#571bc1] via-[#f751a1] to-[#bef264] flex items-center justify-center text-xl shadow-[0_0_15px_rgba(247,81,161,0.35)] shrink-0">
                👉
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-base text-white tracking-tight leading-none truncate">
                    Kim Daha Çok?
                  </h1>
                  <span className="w-2 h-2 rounded-full bg-[#bef264] animate-pulse shrink-0" />
                </div>
                <span className="text-[10px] text-[#4cd7f6] tracking-wider uppercase font-mono mt-0.5 truncate">
                  Parmakla Göster &amp; Kürsü
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowInfoModal(true);
                }}
                className="w-9 h-9 rounded-full bg-[#1c1f2a] hover:bg-white/10 flex items-center justify-center text-[#bef264] transition-colors"
                title="Nasıl Oynanır?"
              >
                <HelpCircle className="w-4 h-4" />
              </button>

              <button
                onClick={handleToggleHaptic}
                aria-label="Titreşim"
                className={`w-9 h-9 rounded-full border border-white/10 flex items-center justify-center transition-all ${
                  isHapticOn ? 'bg-[#1c1f2a] text-[#bef264]' : 'bg-[#111827] text-gray-500'
                }`}
              >
                <Vibrate className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  onClose();
                }}
                className="w-9 h-9 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center text-red-300 transition-colors"
                title="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Category Filter Reel (Horizontally Scrollable) */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar px-3 sm:px-4 py-2 border-t border-white/5 bg-[#0a0e18]/80">
            {categoriesList.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedCategory(cat.id);
                    setCardIndex(0);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap transition-all shrink-0 flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#bef264] text-black shadow-[0_0_12px_rgba(190,242,100,0.35)]'
                      : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </header>

        {/* ================= MAIN SCROLLABLE CONTENT ================= */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 py-3 flex flex-col gap-3 no-scrollbar">

          {/* Status Badge & Mode Pills */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 bg-[#1c1f2a] px-3 py-1.5 rounded-full shadow-sm border border-white/5">
              <span className="w-2 h-2 rounded-full bg-[#bef264] animate-ping" />
              <span className="text-xs font-black text-[#bef264] tracking-wider uppercase">
                Tur {String(currentRound).padStart(2, '0')} / {totalRounds}
              </span>
              <span className="text-gray-500 text-xs">•</span>
              <span className="text-xs font-medium text-gray-300">
                Masada {players.length} Kişi
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-[#262a35] px-3 py-1.5 rounded-full border border-white/5">
              <Award className="w-3.5 h-3.5 text-[#4cd7f6]" />
              <span className="text-[11px] font-black text-[#4cd7f6] uppercase tracking-wide">
                Canlı Oylama
              </span>
            </div>
          </div>

          {/* ================= HERO: KIM DAHA OLASI? QUESTION CARD ================= */}
          <section className="relative overflow-hidden bg-gradient-to-br from-[#1E293B] via-[#111827] to-[#1E293B] border-2 border-[#571bc1]/60 rounded-3xl p-4 sm:p-5 shadow-[0_12px_32px_rgba(0,0,0,0.5)] flex flex-col justify-between gap-3">
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#571bc1]/30 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-[#bef264]/15 rounded-full blur-xl pointer-events-none" />

            {/* Top Bar inside Card: Category & Navigation Controls */}
            <div className="flex items-center justify-between z-10 gap-2">
              <div className="flex items-center gap-1.5 bg-[#571bc1]/50 border border-[#d0bcff]/40 px-2.5 py-1 rounded-full shrink-0">
                <span className="text-xs">🎯</span>
                <span className="text-[10px] sm:text-[11px] font-black text-[#d0bcff] tracking-wider uppercase">
                  KİM DAHA OLASI?
                </span>
                <span className="text-[10px] text-gray-300 font-mono">
                  • {(cardIndex % filteredCards.length) + 1}/{filteredCards.length}
                </span>
              </div>

              {/* Prev / Shuffle / Next Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={handlePrevCard}
                  className="w-7 h-7 rounded-full bg-[#0a0e18] border border-white/10 flex items-center justify-center text-gray-300 hover:text-white active:scale-90 transition-all shadow-sm"
                  title="Önceki Soru"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={handleShuffleQuestion}
                  className="h-7 px-2 rounded-full bg-[#1c1f2a] border border-[#bef264]/40 flex items-center gap-1 text-[11px] font-bold text-[#bef264] hover:bg-[#bef264]/15 active:scale-90 transition-all shadow-sm"
                  title="Rastgele Soru Çek"
                >
                  <Shuffle className="w-3 h-3" />
                  <span className="hidden xs:inline">Rastgele</span>
                </button>

                <button
                  onClick={handleNextCardInline}
                  className="w-7 h-7 rounded-full bg-[#0a0e18] border border-white/10 flex items-center justify-center text-gray-300 hover:text-white active:scale-90 transition-all shadow-sm"
                  title="Sonraki Soru"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* The Question Text: Clean, bold, never overflowing */}
            <div className="my-1 sm:my-2 z-10 min-h-[56px] flex items-center">
              <p className="text-base sm:text-lg md:text-xl font-black text-white tracking-tight leading-snug break-words">
                "{currentCard.question}"
              </p>
            </div>

            {/* Card Footer: Responsive wrapping to prevent mobile overflow */}
            <div className="flex items-center justify-between z-10 pt-2 border-t border-white/10 flex-wrap gap-2 text-xs">
              <span className="text-gray-300 flex items-center gap-1 text-[11px] sm:text-xs">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400 shrink-0" />
                <span>3'e kadar sayıp aynı anda parmakla gösterin!</span>
              </span>
              <span className="text-[11px] font-bold text-[#bef264] bg-[#bef264]/10 px-2 py-0.5 rounded-full border border-[#bef264]/30 shrink-0">
                {currentCard.category}
              </span>
            </div>
          </section>

          {/* ================= 3-2-1 PARMAKLA GÖSTER COUNTDOWN ================= */}
          <button
            onClick={handleStartCountdown}
            className="relative group overflow-hidden w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#bef264] to-lime-400 text-black font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(190,242,100,0.35)] active:scale-[0.98] transition-all cursor-pointer"
          >
            <Hand className="w-4 h-4 sm:w-5 sm:h-5 text-black" />
            <span className="text-sm sm:text-base font-extrabold">{countdownLabel}</span>
            <span className="text-base sm:text-lg">👆</span>
          </button>

          {/* ================= PLAYER VOTING REEL & CARDS ================= */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[#d0bcff]" />
                Masa Oylaması (Oyuncuya Dokun &amp; Oy Ver)
              </span>
              <span className="text-xs font-bold text-[#bef264]">
                {totalVotesCount} Oy Kullanıldı
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {players.map((player) => {
                const voteCount = votes[player.id] || 0;
                const isLeader = maxVotes > 0 && voteCount === maxVotes;

                return (
                  <div
                    key={player.id}
                    onClick={() => handleVotePlayer(player.id)}
                    className={`relative rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between gap-2 cursor-pointer transition-all active:scale-[0.97] border ${
                      isLeader
                        ? 'bg-[#1E293B] border-[#f751a1] shadow-[0_0_18px_rgba(247,81,161,0.3)] ring-1 ring-[#f751a1]'
                        : 'bg-[#111827] border-white/5 hover:border-white/20 shadow-md'
                    }`}
                  >
                    {isLeader && (
                      <div className="absolute -top-2 -right-1 bg-gradient-to-r from-[#f751a1] to-pink-600 text-white px-2 py-0.5 rounded-full text-[9px] font-black shadow flex items-center gap-1">
                        <Award className="w-3 h-3 text-amber-300" />
                        Zirvede
                      </div>
                    )}

                    <div className="flex items-center justify-between gap-1.5">
                      <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden ring-2 ring-white/10 shrink-0">
                        {player.avatar ? (
                          <img
                            src={player.avatar}
                            alt={player.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div
                            className="w-full h-full flex items-center justify-center font-black text-xs text-white"
                            style={{
                              background: `linear-gradient(135deg, ${player.color || '#f751a1'}, #571bc1)`
                            }}
                          >
                            {player.name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>

                      <div
                        className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold shadow-sm shrink-0 ${
                          voteCount > 0
                            ? isLeader
                              ? 'bg-[#f751a1] text-white shadow-[0_0_10px_rgba(247,81,161,0.6)]'
                              : 'bg-[#1c1f2a] text-[#bef264] border border-[#bef264]/30'
                            : 'bg-[#1c1f2a] text-gray-400'
                        }`}
                      >
                        <Hand className="w-3 h-3" />
                        <span>{voteCount} Oy</span>
                      </div>
                    </div>

                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs sm:text-sm font-bold text-white truncate">
                          {player.name}
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20 shrink-0" />
                      </div>
                      <span className="text-[10px] text-gray-400 truncate mt-0.5">
                        Dokun +1 Oy Ver
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ================= DEFENSE STAGE: MICROPHONE SPOTLIGHT ================= */}
          <div className="relative overflow-hidden bg-[#1c1f2a] border border-white/10 rounded-2xl p-3 sm:p-3.5 shadow-md flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-[#571bc1] border border-[#d0bcff]/30 flex items-center justify-center text-white shrink-0 shadow-[0_0_14px_rgba(87,27,193,0.5)]">
                <Mic className="w-5 h-5 animate-pulse text-[#d0bcff]" />
              </div>

              <div className="flex flex-col min-w-0 flex-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs font-black text-white">Savunma Kürsüsü:</span>
                  <span className="bg-[#f751a1] text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow truncate max-w-[120px]">
                    {activeDefensePlayer ? activeDefensePlayer.name : 'Seçilen'}
                  </span>
                </div>
                <span className="text-[11px] text-gray-300 truncate mt-0.5">
                  30 saniyede kendini akla veya cezayı iç!
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="flex flex-col items-center justify-center bg-[#111827] border border-white/5 px-2 py-1 rounded-xl">
                <span className="text-sm sm:text-base font-black text-amber-400 font-mono">
                  00:{String(defenseTimeLeft).padStart(2, '0')}
                </span>
                <span className="text-[8px] text-gray-400 uppercase font-bold">Kalan</span>
              </div>

              <button
                onClick={() => {
                  soundEngine.playClick();
                  setIsDefenseTimerRunning(!isDefenseTimerRunning);
                }}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white active:scale-95 transition-all cursor-pointer"
                title={isDefenseTimerRunning ? 'Durdur' : 'Başlat'}
              >
                {isDefenseTimerRunning ? (
                  <span className="font-bold text-xs">II</span>
                ) : (
                  <Play className="w-3.5 h-3.5 fill-white" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* ================= FIXED BOTTOM ACTION BAR ================= */}
        <div className="p-3 bg-[#0a0e18]/95 backdrop-blur-md border-t border-white/10 shrink-0 flex items-center gap-2">
          <button
            onClick={handleRevealVotes}
            className="flex-1 py-3 px-3 rounded-xl bg-[#1E293B] hover:bg-[#262a35] border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <Eye className="w-4 h-4 text-[#4cd7f6]" />
            <span>Oyları Açıkla</span>
          </button>

          <button
            onClick={handleNextRound}
            className="flex-1 py-3 px-3 rounded-xl bg-gradient-to-r from-[#f751a1] to-pink-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-[0_4px_16px_rgba(247,81,161,0.35)] active:scale-95 transition-all cursor-pointer"
          >
            <span>Sıradaki Soru &amp; Tur</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Rules Info Modal */}
      {showInfoModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#111827] border border-white/20 rounded-3xl p-5 flex flex-col gap-3 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-2xl">👉</span>
                <h3 className="font-black text-white text-base">Kim Daha Çok? Nasıl Oynanır?</h3>
              </div>
              <button
                onClick={() => setShowInfoModal(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-gray-300 flex flex-col gap-2 leading-relaxed">
              <p>
                <strong>1. Soru Okunur:</strong> Masadaki soru herkese yüksek sesle okunur (örneğin: "Telefonuna şifre koymadan masada asla bırakamayacak kişi kim?").
              </p>
              <p>
                <strong>2. 3-2-1 Geri Sayım:</strong> Yeşil butona basılarak 3-2-1 sayılır ve herkes aynı anda parmağıyla masadaki en olası kişiyi işaret eder.
              </p>
              <p>
                <strong>3. Oyları Gir &amp; Açıkla:</strong> Masada en çok kime işaret edildiyse oyuncu kartına tıklanarak oyu verilir. "Oyları Açıkla" butonuna basılarak kazanan kürsüye çıkar.
              </p>
              <p>
                <strong>4. Savunma Kürsüsü:</strong> En çok oy alan yarışmacı mikrofon süresi içinde kendini savunur veya masanın cezasını çeker!
              </p>
            </div>

            <button
              onClick={() => setShowInfoModal(false)}
              className="mt-2 w-full py-2.5 rounded-xl bg-[#bef264] text-black font-black text-xs uppercase"
            >
              Anladım, Oyuna Dön
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
