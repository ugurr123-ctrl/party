import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Shuffle,
  Heart,
  Volume2,
  Users,
  Check,
  RotateCcw,
  Sparkles,
  Mic,
  MessageCircle,
  ThumbsDown,
  Eye,
  Coffee,
  AlertTriangle,
  Info,
  HelpCircle
} from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { TablePlayer, loadTablePlayers } from '../utils/playerManager';

export interface ConfessionLogItem {
  id: string;
  playerName: string;
  timeAgo: string;
  avatar?: string;
  color?: string;
}

export interface NeverHaveICardItem {
  id: string;
  number: number;
  statement: string;
  category: 'Aşk & Flört' | 'Arkadaşlık' | 'Absürt & Komik' | 'Kafe Masası';
}

export const NEVER_HAVE_I_CARDS: NeverHaveICardItem[] = [
  // Aşk & Flört
  {
    id: 'c-1',
    number: 101,
    statement: 'Eski sevgilimin yeni sevgilisini sahte hesaptan sabaha kadar stalklamadım!',
    category: 'Aşk & Flört'
  },
  {
    id: 'c-2',
    number: 102,
    statement: 'Hoşlandığım kişinin story\'sine yanlışlıkla kalp atıp hemen panikle hesabı dondurmadım!',
    category: 'Aşk & Flört'
  },
  {
    id: 'c-3',
    number: 103,
    statement: 'Aynı anda birden fazla kişiyle flört edip isimlerini birbirine karıştırmadım!',
    category: 'Aşk & Flört'
  },
  {
    id: 'c-4',
    number: 104,
    statement: 'Sırf biriyle buluşmamak için "annem rahatsızlandı" veya "acil işim çıktı" yalanına sığınmadım!',
    category: 'Aşk & Flört'
  },
  {
    id: 'c-5',
    number: 105,
    statement: 'Flörtümün burç uyumunu gizlice doğum haritasına kadar incelemedim!',
    category: 'Aşk & Flört'
  },
  {
    id: 'c-6',
    number: 106,
    statement: 'İlk buluşmada karşındakini beğenmeyip tuvaletten arkadaşıma "beni acil ara" mesajı atmadım!',
    category: 'Aşk & Flört'
  },
  {
    id: 'c-7',
    number: 107,
    statement: 'Sırf kıskandırmak için tek başıma gittiğim kafede masaya iki kahve sipariş edip story atmadım!',
    category: 'Aşk & Flört'
  },
  {
    id: 'c-8',
    number: 108,
    statement: 'Mesajıma saatlerce bilerek cevap vermeyip "yoğundum" yalanını uydurmadım!',
    category: 'Aşk & Flört'
  },
  {
    id: 'c-9',
    number: 109,
    statement: 'Ayrıldıktan sonra eski sevgilimin WhatsApp "Çevrimiçi" takibini saatlerce yapmadım!',
    category: 'Aşk & Flört'
  },
  {
    id: 'c-10',
    number: 110,
    statement: 'Masadaki birinin sevgilisini veya eski flörtünü içten içe hiç yakıştırmamazlık etmedim!',
    category: 'Aşk & Flört'
  },

  // Arkadaşlık
  {
    id: 'c-11',
    number: 201,
    statement: 'Arkadaşımın bana aldığı doğum günü hediyesini gizlice başka birine hediye etmedim!',
    category: 'Arkadaşlık'
  },
  {
    id: 'c-12',
    number: 202,
    statement: 'Gruptan gizli buluşup arkadaşıma "evde uyuyorum" yalanı söylemedim!',
    category: 'Arkadaşlık'
  },
  {
    id: 'c-13',
    number: 203,
    statement: 'Arkadaşımın arkasından konuşurken mesajı yanlışlıkla tam da onun olduğu gruba atmadım!',
    category: 'Arkadaşlık'
  },
  {
    id: 'c-14',
    number: 204,
    statement: 'Arkadaşımın telefon şifresini gizlice göz ucuyla ezberleyip merakla galerisine bakmadım!',
    category: 'Arkadaşlık'
  },
  {
    id: 'c-15',
    number: 205,
    statement: 'Arkadaşımın yeni kıyafetini beğenmediğim halde kırılmasın diye "efsane olmuş" demedim!',
    category: 'Arkadaşlık'
  },
  {
    id: 'c-16',
    number: 206,
    statement: 'Grup fotoğrafında sadece kendim güzel çıktım diye herkesin çirkin olduğu kareyi paylaşmadım!',
    category: 'Arkadaşlık'
  },
  {
    id: 'c-17',
    number: 207,
    statement: 'Arkadaşımın ödünç verdiği kıyafeti veya eşyayı aylarca unutup kendi malım gibi sahiplenmedim!',
    category: 'Arkadaşlık'
  },
  {
    id: 'c-18',
    number: 208,
    statement: 'Buluşmaya gelmemek için "yoldayım trafik felç" deyip aslında yataktan yeni çıkmadım!',
    category: 'Arkadaşlık'
  },
  {
    id: 'c-19',
    number: 209,
    statement: 'Grupta birinin esprisine komik olmadığı halde ortam bozulmasın diye sahte kahkaha patlatmadım!',
    category: 'Arkadaşlık'
  },
  {
    id: 'c-20',
    number: 210,
    statement: 'Arkadaşımın en büyük sırrını "aramızda kalsın" diyerek başka bir yakın arkadaşıma anlatmadım!',
    category: 'Arkadaşlık'
  },

  // Absürt & Komik
  {
    id: 'c-21',
    number: 301,
    statement: 'Toplu taşımada biriyle yanlışlıkla göz göze gelince telefonum çalıyormuş gibi yapmadım!',
    category: 'Absürt & Komik'
  },
  {
    id: 'c-22',
    number: 302,
    statement: 'Sokakta tek başıma yürürken aklıma gelen komik bir şeye deli gibi sesli gülmedim!',
    category: 'Absürt & Komik'
  },
  {
    id: 'c-23',
    number: 303,
    statement: 'Aynanın karşısında şarkı söylerken veya dans ederken odaya biri aniden dalmadı!',
    category: 'Absürt & Komik'
  },
  {
    id: 'c-24',
    number: 304,
    statement: 'Telefonun kamerasını açıp dişime bir şey takılmış mı diye bakarken birine yakalanmadım!',
    category: 'Absürt & Komik'
  },
  {
    id: 'c-25',
    number: 305,
    statement: 'Sokakta bana el salladığını sandığım kişiye coşkuyla el sallayıp arkasındakine baktığını fark etmedim!',
    category: 'Absürt & Komik'
  },
  {
    id: 'c-26',
    number: 306,
    statement: 'Cam kapıyı açık sanıp kafamı küt diye cama çarpmadım!',
    category: 'Absürt & Komik'
  },
  {
    id: 'c-27',
    number: 307,
    statement: 'Kendi kendime İngilizce röportaj veriyormuş gibi banyoda sesli konuşmadım!',
    category: 'Absürt & Komik'
  },
  {
    id: 'c-28',
    number: 308,
    statement: 'Yere düşen yiyeceği 5 saniye kuralı uydurarak üfleyip ağzıma atmadım!',
    category: 'Absürt & Komik'
  },
  {
    id: 'c-29',
    number: 309,
    statement: 'Telefonum elimdeyken evde deli gibi "telefonum nerede" diye aramadım!',
    category: 'Absürt & Komik'
  },
  {
    id: 'c-30',
    number: 310,
    statement: 'Korku filmi izledikten sonra gece tuvalete koşarak gidip yatağa zıplamadım!',
    category: 'Absürt & Komik'
  },

  // Kafe Masası
  {
    id: 'c-31',
    number: 401,
    statement: 'Hesap gelirken lavaboya kaçıp süreyi uzatmaya çalışmadım!',
    category: 'Kafe Masası'
  },
  {
    id: 'c-32',
    number: 402,
    statement: 'Kafede garson "Afiyet olsun" dediğinde refleks olarak "Size de" demedim!',
    category: 'Kafe Masası'
  },
  {
    id: 'c-33',
    number: 403,
    statement: 'Arkadaşımın sipariş ettiği tatlıdan "sadece bir çatal" deyip yarısını yemedim!',
    category: 'Kafe Masası'
  },
  {
    id: 'c-34',
    number: 404,
    statement: 'Kafede priz bulamadığım için başka masadakilere masum ve yalvaran bakışlar atmadım!',
    category: 'Kafe Masası'
  },
  {
    id: 'c-35',
    number: 405,
    statement: 'Yan masanın dedikodusunu dinlemek için konuşuyormuş gibi yapıp sessizce kulak kabartmadım!',
    category: 'Kafe Masası'
  },
  {
    id: 'c-36',
    number: 406,
    statement: 'Sırf kafede uzun oturabilmek için bitmiş çay bardağıyla 1 saat oyalanmadım!',
    category: 'Kafe Masası'
  },
  {
    id: 'c-37',
    number: 407,
    statement: 'Garson hesabı getirdiğinde kart limitim yetersiz uyarısı verip ter dökmedim!',
    category: 'Kafe Masası'
  },
  {
    id: 'c-38',
    number: 408,
    statement: 'Yemek masasında fotoğraf çektirmeden kimsenin çatal vurmasına izin vermeyen o kişi olmadım!',
    category: 'Kafe Masası'
  },
  {
    id: 'c-39',
    number: 409,
    statement: 'Kafede Wi-Fi şifresini sormaya utanıp internetimden yemeye razı olmadım!',
    category: 'Kafe Masası'
  },
  {
    id: 'c-40',
    number: 410,
    statement: 'Masadaki şekeri veya ıslak mendilleri çantama hatıra diye gizlice doldurmadım!',
    category: 'Kafe Masası'
  }
];

interface NeverHaveIModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const NeverHaveIModal: React.FC<NeverHaveIModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const [players, setPlayers] = useState<TablePlayer[]>(() => loadTablePlayers());
  const [playerFingers, setPlayerFingers] = useState<Record<string, number>>({});
  const [selectedPlayerId, setSelectedPlayerId] = useState<string>('p1');
  const [currentRound, setCurrentRound] = useState(4);
  const totalRounds = 15;
  const [selectedCategory, setSelectedCategory] = useState<string>('Aşk & Flört');
  const [cardIndex, setCardIndex] = useState(0);

  // Live log of confessions
  const [logs, setLogs] = useState<ConfessionLogItem[]>([
    { id: 'l1', playerName: 'Ece', timeAgo: '12 sn önce' },
    { id: 'l2', playerName: 'Selin', timeAgo: '5 sn önce' }
  ]);

  // Story modal state
  const [isStoryModalOpen, setIsStoryModalOpen] = useState(false);
  const [confessedThisRound, setConfessedThisRound] = useState<string[]>(['Ece', 'Selin']);
  const [showRulesModal, setShowRulesModal] = useState(false);

  // Load players on open
  useEffect(() => {
    if (isOpen) {
      const p = loadTablePlayers();
      setPlayers(p);
      if (p.length > 0) setSelectedPlayerId(p[0].id);

      // Prepopulate lives: default 5, but for fun demo let's keep realistic 4/5, 2/5, 5/5, 1/5
      const initLives: Record<string, number> = {};
      p.forEach((pl, idx) => {
        if (idx === 0) initLives[pl.id] = 4;
        else if (idx === 1) initLives[pl.id] = 2;
        else if (idx === 2) initLives[pl.id] = 5;
        else if (idx === 3) initLives[pl.id] = 1; // KRİTİK!
        else initLives[pl.id] = 5;
      });
      setPlayerFingers(initLives);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredCards = NEVER_HAVE_I_CARDS.filter(
    (c) => selectedCategory === 'all' || c.category === selectedCategory
  );
  const currentCard = filteredCards[cardIndex % filteredCards.length] || NEVER_HAVE_I_CARDS[0];

  const fallbackSelectedPlayer: TablePlayer = {
    id: 'p-default',
    name: 'Sen',
    avatar: '',
    score: 0,
    color: '#bef264'
  };
  const selectedPlayer = (players.find((p) => p.id === selectedPlayerId) || players[0]) || fallbackSelectedPlayer;

  // Drop a finger for a specific player
  const handleDropFinger = (targetPlayerId: string) => {
    soundEngine.playClick();
    soundEngine.triggerHaptic('drop');

    const targetPlayer = players.find((p) => p.id === targetPlayerId);
    const targetName = targetPlayer ? targetPlayer.name : 'Oyuncu';

    setPlayerFingers((prev) => {
      const cur = prev[targetPlayerId] ?? 5;
      if (cur <= 0) {
        onShowToast(`${targetName} zaten elendi! Canı 0/5.`);
        return prev;
      }
      const nextVal = cur - 1;

      // Add to log
      setLogs((prevLogs) => [
        {
          id: `log-${Date.now()}`,
          playerName: targetName,
          timeAgo: 'Az önce',
          avatar: targetPlayer?.avatar,
          color: targetPlayer?.color
        },
        ...prevLogs.slice(0, 3)
      ]);

      // Add to this round's confessions
      setConfessedThisRound((prevList) => {
        if (!prevList.includes(targetName)) return [...prevList, targetName];
        return prevList;
      });

      if (nextVal === 0) {
        soundEngine.playBuzzer();
        soundEngine.triggerHaptic('alert');
        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        } catch {
          // ignore
        }
        onShowToast(`🚨 ${targetName} ELENDİ! Masaya hesap ısmarlıyor veya cezayı içiyor!`);
      } else if (nextVal === 1) {
        onShowToast(`⚠️ DİKKAT: ${targetName} için KRİTİK can seviyesi (1/5)!`);
      } else {
        onShowToast(`👋 ${targetName} parmağını indirdi (${nextVal}/5 Can kaldı)`);
      }

      return { ...prev, [targetPlayerId]: nextVal };
    });
  };

  // Next Card
  const handleNextCard = () => {
    soundEngine.playClick();
    setCardIndex((prev) => (prev + 1) % filteredCards.length);
    setCurrentRound((prev) => (prev >= totalRounds ? 1 : prev + 1));
    setConfessedThisRound([]);
  };

  // Reset all fingers to 5/5
  const handleResetFingers = () => {
    soundEngine.playClick();
    const reset: Record<string, number> = {};
    players.forEach((p) => {
      reset[p.id] = 5;
    });
    setPlayerFingers(reset);
    setLogs([]);
    setConfessedThisRound([]);
    onShowToast('🔄 Tüm oyuncuların parmakları (5/5 Can) yenilendi!');
  };

  const categories = [
    { id: 'Aşk & Flört', icon: '❤️', label: 'Aşk & Flört', short: 'Aşk' },
    { id: 'Arkadaşlık', icon: '👥', label: 'Arkadaşlık', short: 'Arkadaş' },
    { id: 'Absürt & Komik', icon: '😂', label: 'Absürt & Komik', short: 'Komik' },
    { id: 'Kafe Masası', icon: '☕', label: 'Kafe Masası', short: 'Kafe' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2 select-none">
      <div className="relative w-full max-w-md h-[94dvh] sm:h-[96vh] max-h-[890px] bg-[#0a0e18] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        {/* ================= FIXED TOP HEADER ================= */}
        <header className="w-full pt-safe bg-[#0a0e18]/90 backdrop-blur-xl border-b border-white/10 shrink-0">
          <div className="h-16 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-[#1c1f2a] flex items-center justify-center text-xl shrink-0">
                🙈
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-base text-white tracking-tight leading-none truncate">
                    Ben Hiç Yapmadım
                  </h1>
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shrink-0" />
                </div>
                <span className="text-[10px] text-[#bef264] tracking-wider uppercase font-mono mt-1 truncate">
                  5 Parmak Kuralı • Canlı Masa
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowRulesModal(true);
                }}
                className="h-9 px-2.5 rounded-xl bg-[#1c1f2a] hover:bg-white/10 border border-[#bef264]/30 text-[#bef264] flex items-center gap-1 text-xs font-bold shadow-sm active:scale-95 transition-all"
                title="5 Parmak Kuralı Nedir?"
              >
                <span className="text-sm">🖐️</span>
                <span>Kural</span>
              </button>

              <button
                onClick={handleResetFingers}
                className="w-9 h-9 rounded-full bg-[#1c1f2a] hover:bg-white/10 flex items-center justify-center text-gray-300 transition-colors"
                title="Canları Sıfırla (5/5)"
              >
                <RotateCcw className="w-4 h-4" />
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
        </header>

        {/* ================= MAIN SCROLLABLE CONTENT ================= */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-4 py-3 flex flex-col gap-3 no-scrollbar">

        {/* ================= 5 PARMAK KURALI HERO GAUGE ================= */}
        <section className="bg-gradient-to-br from-[#1E293B] via-[#111827] to-[#1E293B] border-2 border-[#bef264]/50 rounded-2xl p-3.5 shadow-[0_0_24px_rgba(190,242,100,0.15)] flex flex-col gap-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-bounce">🖐️</span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-black text-white leading-none">
                    5 Parmak Kuralı
                  </h2>
                  <span className="bg-[#bef264] text-black text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">
                    CANLI
                  </span>
                </div>
                <span className="text-[11px] text-[#bef264] font-bold mt-0.5 block">
                  {selectedPlayer.id === players[0]?.id ? 'Senin Parmakların' : `${selectedPlayer.name} - Parmakları`}: {(playerFingers[selectedPlayer.id] ?? 5)}/5 Açık
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                soundEngine.playClick();
                setShowRulesModal(true);
              }}
              className="px-2.5 py-1 rounded-xl bg-[#bef264]/15 hover:bg-[#bef264]/25 border border-[#bef264]/40 text-[#bef264] text-[11px] font-black flex items-center gap-1 active:scale-95 transition-all"
            >
              <Info className="w-3.5 h-3.5" />
              <span>Kural</span>
            </button>
          </div>

          {/* 5 Büyük İnteraktif Parmak Butonu (☝️ Açık / ✊ İndi) */}
          <div className="grid grid-cols-5 gap-1.5">
            {[1, 2, 3, 4, 5].map((fingerNum) => {
              const currentLives = playerFingers[selectedPlayer.id] ?? 5;
              const isFingerUp = fingerNum <= currentLives;
              return (
                <button
                  key={fingerNum}
                  type="button"
                  onClick={() => {
                    if (isFingerUp) {
                      handleDropFinger(selectedPlayer.id);
                    }
                  }}
                  className={`py-2.5 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 transition-all active:scale-90 cursor-pointer ${
                    isFingerUp
                      ? 'bg-gradient-to-b from-[#bef264]/25 to-[#bef264]/10 border-2 border-[#bef264] text-[#bef264] shadow-[0_0_12px_rgba(190,242,100,0.3)] hover:brightness-110'
                      : 'bg-white/5 border border-white/5 text-gray-500 opacity-30 line-through'
                  }`}
                  title={isFingerUp ? `${fingerNum}. Parmağını İndir` : 'Bu parmak indi'}
                >
                  <span className="text-2xl sm:text-3xl leading-none">{isFingerUp ? '☝️' : '✊'}</span>
                  <span className="text-[10px] font-black tracking-tight">{fingerNum}. Parmak</span>
                  <span className="text-[8px] font-black uppercase">
                    {isFingerUp ? 'AÇIK' : 'İNDİ'}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[10px] text-gray-400 px-1 pt-1 border-t border-white/5">
            <span className="text-gray-300">
              Kural: İtiraf eden parmağını indirir (tıkla veya alttan bas).
            </span>
            <span className="text-[#f751a1] font-black">5'i de inen elenir!</span>
          </div>
        </section>

        {/* Masa Oyuncuları Parmak Listesi */}
        <section className="bg-[#111827] border border-white/10 rounded-2xl p-2.5 flex flex-col gap-1.5 shadow-md">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
              MASA OYUNCULARI VE PARMAKLARI
            </span>
            <span className="text-[10px] font-bold text-[#bef264]">
              (Oyuncuya dokunup parmağını gör)
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 no-scrollbar">
            {players.map((pl, idx) => {
              const lives = playerFingers[pl.id] ?? 5;
              const isCritical = lives === 1;
              const isEliminated = lives === 0;
              const isSelected = selectedPlayerId === pl.id;
              const displayName = idx === 0 ? 'Sen' : pl.name.split(' ')[0];

              return (
                <button
                  key={pl.id}
                  onClick={() => {
                    soundEngine.playClick();
                    setSelectedPlayerId(pl.id);
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all cursor-pointer shrink-0 border ${
                    isSelected
                      ? 'bg-[#1E293B] border-[#bef264] shadow-[0_0_12px_rgba(190,242,100,0.3)]'
                      : 'bg-[#171b26] border-white/5 hover:border-white/20'
                  }`}
                >
                  <div className="w-7 h-7 rounded-full bg-[#111827] flex items-center justify-center font-bold text-xs text-white overflow-hidden shrink-0">
                    {pl.avatar ? (
                      <img src={pl.avatar} alt={pl.name} className="w-full h-full object-cover" />
                    ) : (
                      pl.name.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <span className="text-xs font-bold text-white">
                    {displayName}
                  </span>
                  <span className={`text-xs font-mono font-black ${
                    isCritical ? 'text-[#f751a1]' : isEliminated ? 'text-red-400' : 'text-[#bef264]'
                  }`}>
                    ✋ {lives}/5
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Kategori Filtreleri */}
        <section className="grid grid-cols-4 gap-1.5 p-1 bg-[#111827] border border-white/10 rounded-2xl shrink-0">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  soundEngine.playClick();
                  setSelectedCategory(cat.id);
                  setCardIndex(0);
                }}
                className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center gap-0.5 active:scale-95 transition-all min-w-0 ${
                  isActive
                    ? 'bg-[#bbf246] text-[#0f131d] shadow-[0_0_12px_rgba(187,242,70,0.35)] font-black'
                    : 'bg-[#1c1f2a]/60 hover:bg-[#1c1f2a] text-gray-300 font-semibold'
                }`}
                title={cat.label}
              >
                <span className="text-xs sm:text-sm leading-none">{cat.icon}</span>
                <span className="text-[11px] truncate font-bold w-full text-center leading-tight">
                  {cat.short}
                </span>
              </button>
            );
          })}
        </section>

        {/* Ana İtiraf Kartı (Glassmorphic Hero) */}
        <section className="relative bg-[#111827] border border-white/10 rounded-3xl p-5 shadow-[0_12px_36px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col justify-between min-h-[290px]">
          {/* Arka Plan Neon Işık Parıltıları */}
          <div className="absolute -top-16 -left-16 w-52 h-52 bg-[#f751a1]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -right-16 w-52 h-52 bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none" />

          {/* Kart Üst Başlık & Badge */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-[#f751a1]/20 text-[#f751a1] flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-xs font-black text-[#f751a1] tracking-widest uppercase">
                İtiraf Kartı #{currentCard.number}
              </span>
            </div>

            <div className="flex items-center gap-1 text-gray-400 text-xs font-medium">
              <Eye className="w-3.5 h-3.5 text-[#bbf246]" />
              <span>Herkes Görüyor</span>
            </div>
          </div>

          {/* İtiraf Metni */}
          <div className="relative z-10 my-4 flex flex-col gap-1.5 text-center px-1">
            <span className="text-xs font-extrabold text-[#bbf246] tracking-wider uppercase">
              Ben Hiç...
            </span>
            <p className="text-lg sm:text-xl font-black text-white leading-snug tracking-tight">
              "{currentCard.statement}"
            </p>
            <span className="text-xs text-gray-400 mt-1">
              Eğer yaptıysan şimdi bir parmağını indirmen gerekiyor 👀
            </span>
          </div>

          {/* Kart Alt Butonları & Sayaç */}
          <div className="relative z-10 flex items-center justify-between pt-2 border-t border-white/5">
            <button
              onClick={handleNextCard}
              className="px-3.5 py-2 rounded-full bg-[#1E293B] border border-white/10 text-gray-200 font-bold text-xs flex items-center gap-1.5 hover:text-[#bbf246] active:scale-95 transition-all shadow"
              id="next-card-btn"
            >
              <Shuffle className="w-3.5 h-3.5" />
              <span>Sıradaki Kart</span>
            </button>

            {/* Hikaye Anlat Rozeti */}
            <button
              onClick={() => {
                soundEngine.playClick();
                setIsStoryModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-full bg-[#f751a1]/15 border border-[#f751a1]/30 text-[#ffb0cd] font-bold text-xs flex items-center gap-1.5 shadow-[0_0_12px_rgba(255,176,205,0.2)] hover:bg-[#f751a1]/25 active:scale-95 transition-all"
            >
              <span>Kim yaptıysa hikaye anlatsın</span>
              <span className="text-sm">☕</span>
            </button>
          </div>
        </section>

        {/* Aksiyon Bölgesi: 1 Parmak İndir (-1 Can) */}
        <section className="flex flex-col gap-2">
          <button
            onClick={() => handleDropFinger(selectedPlayer.id)}
            className="w-full py-4 px-4 rounded-full bg-gradient-to-r from-[#f751a1] via-pink-600 to-[#571bc1] text-white font-black text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-[0_0_28px_rgba(247,81,161,0.45)] active:scale-95 transition-all relative overflow-hidden group cursor-pointer"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 pointer-events-none" />
            <span className="text-xl">✋</span>
            <span>
              {selectedPlayer.id === players[0]?.id ? 'İtiraf Ediyorum, Yaptım!' : `${selectedPlayer.name} Yaptı!`}{' '}
              (1 Parmak İndir 👇)
            </span>
          </button>

          <div className="flex items-center justify-center gap-2 text-center text-gray-400 text-xs px-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
            <span>Dürüst ol! Gözler senin üzerinde, yalan söyleyen masaya hesap ısmarlar.</span>
          </div>
        </section>

        {/* Masada Yapılanlar Bildirim Alanı (Canlı Log) */}
        <section className="bg-[#111827] border border-white/5 rounded-2xl p-4 flex flex-col gap-2 shadow-lg">
          <div className="flex items-center justify-between pb-1 border-b border-white/5">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-[#10B981]" />
              <span className="text-xs font-bold text-white">Masa İtirafları</span>
            </div>
            <span className="text-[11px] font-semibold text-gray-400">
              Bu tur {confessedThisRound.length} kişi yaptı
            </span>
          </div>

          <div className="flex flex-col gap-2">
            {logs.map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#1c1f2a] border border-white/5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#f751a1]/20 text-[#f751a1] flex items-center justify-center font-bold text-xs overflow-hidden">
                    {log.avatar ? (
                      <img src={log.avatar} alt={log.playerName} className="w-full h-full object-cover" />
                    ) : (
                      log.playerName.charAt(0)
                    )}
                  </div>
                  <span className="text-xs text-gray-200">
                    <strong className="font-bold text-white">{log.playerName}</strong> parmağını indirdi (-1 Can)
                  </span>
                </div>
                <span className="text-[11px] font-semibold text-[#10B981]">{log.timeAgo}</span>
              </div>
            ))}
          </div>
        </section>

        {/* İnteraktif Kahve & Hikaye Modalı (Dedikodu Saati) */}
        {isStoryModalOpen && (
          <div className="fixed inset-0 z-50 bg-[#0f131d]/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="w-full max-w-sm bg-[#111827] border border-white/10 rounded-3xl p-6 shadow-[0_16px_40px_rgba(0,0,0,0.8)] flex flex-col items-center text-center gap-3 relative animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-[#f751a1]/20 border border-[#f751a1]/30 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(255,176,205,0.4)]">
                ☕
              </div>
              <h3 className="text-lg font-black text-white mt-1">Dedikodu Saati!</h3>
              <p className="text-xs text-gray-300 leading-relaxed">
                {confessedThisRound.length > 0
                  ? `${confessedThisRound.join(' ve ')} az önce parmağını indirdi!`
                  : 'Masadan birileri az önce parmağını indirdi!'}{' '}
                Masanın kuralına göre şimdi olayın tüm detaylarını anlatmak zorundalar.
              </p>

              <div className="w-full bg-[#1c1f2a] border border-white/5 p-3 rounded-2xl flex items-center justify-center gap-2 text-[#bbf246] text-xs font-bold">
                <Mic className="w-4 h-4 animate-pulse text-[#bbf246]" />
                <span>Masa mikrofonu açık: Dinlemedeyiz!</span>
              </div>

              <button
                onClick={() => {
                  soundEngine.playVictory();
                  setIsStoryModalOpen(false);
                  try {
                    confetti({ particleCount: 60, spread: 50, origin: { y: 0.6 } });
                  } catch {
                    // ignore
                  }
                  onShowToast('🎉 Hikaye dinlendi, tura devam ediliyor!');
                }}
                className="w-full py-3.5 rounded-full bg-[#bbf246] hover:bg-lime-400 text-[#0f131d] font-black text-xs uppercase tracking-wider mt-2 shadow-[0_0_16px_rgba(187,242,70,0.3)] active:scale-95 transition-all"
              >
                Hikayeyi Dinledik, Devam Et!
              </button>
            </div>
          </div>
        )}

        {/* ================= 5 PARMAK KURALI AÇIKLAMA MODALI ================= */}
        {showRulesModal && (
          <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in zoom-in-95">
            <div className="bg-[#111827] border-2 border-[#bef264]/40 p-5 sm:p-6 rounded-3xl max-w-sm w-full shadow-2xl flex flex-col gap-3.5 text-left relative">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🖐️</span>
                  <div>
                    <h3 className="text-base font-black text-white leading-tight">5 Parmak Kuralı</h3>
                    <span className="text-[10px] text-[#bef264] font-bold">Nasıl Oynanır?</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowRulesModal(false)}
                  className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-300 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs text-gray-300 leading-relaxed">
                <div className="p-2.5 rounded-2xl bg-[#1c1f2a] border border-white/5 flex items-start gap-2.5">
                  <span className="text-lg">🖐️</span>
                  <div>
                    <strong className="text-white block font-bold">1. Herkes 5 Parmak Başlar:</strong>
                    Tüm oyuncular 5 parmağı havada başlar (5 Can).
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-[#1c1f2a] border border-white/5 flex items-start gap-2.5">
                  <span className="text-lg">👇</span>
                  <div>
                    <strong className="text-white block font-bold">2. İtiraf Eden İndirir:</strong>
                    Karttaki "Ben hiç..." durumunu daha önce yaptıysan ekrandaki 1 parmağını indirirsin (☝️ ➔ ✊).
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-[#1c1f2a] border border-white/5 flex items-start gap-2.5">
                  <span className="text-lg">☠️</span>
                  <div>
                    <strong className="text-white block font-bold">3. İlk İnen Elenir:</strong>
                    5 parmağı da ilk inen oyuncu kaybeder ve masaya ceza çeker veya dedikodu anlatır!
                  </div>
                </div>
              </div>

              <button
                onClick={() => setShowRulesModal(false)}
                className="w-full py-3.5 bg-[#bef264] text-black font-black text-xs uppercase tracking-wider rounded-full shadow-md active:scale-95 transition-all mt-1 cursor-pointer"
              >
                Anladım, Oyuna Devam Et! 🎮
              </button>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
