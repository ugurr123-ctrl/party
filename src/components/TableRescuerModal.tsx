import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  Coffee,
  Receipt,
  Users,
  EyeOff,
  Lock,
  Radar,
  MessageSquare,
  Cake,
  Volume2,
  VolumeX,
  X,
  Shuffle,
  HelpCircle,
  CheckCircle2,
  Sparkles,
  Flame,
  RotateCw,
  Smartphone
} from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { loadTablePlayers } from '../utils/playerManager';

interface TableRescuerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

// 1. Bill Roulette Rules
const BILL_ROULETTE_RULES = [
  {
    id: 'full',
    title: 'Tamamını Öder',
    desc: 'Bütün adisyonu tek başına öder! Şanssız kişi tek çekim 💳',
    color: 'text-amber-400',
    border: 'border-amber-400/40'
  },
  {
    id: 'dessert',
    title: 'Tatlılar Sende',
    desc: 'Masadaki tüm tatlıları ısmarlar! San Sebastian & Sufle 🍰',
    color: 'text-[#d0bcff]',
    border: 'border-purple-400/40'
  },
  {
    id: 'excuse',
    title: 'Komik Bahaneci',
    desc: 'En komik bahaneyi uyduran hesaptan muaf olur! En ikna edici yırtar 🎭',
    color: 'text-[#bef264]',
    border: 'border-lime-400/40'
  },
  {
    id: 'coffee',
    title: 'Kahveleri Ismarla',
    desc: 'Kahveleri öder, diğerleri tatlıyı bölüşür. Filtre & Flat White ☕',
    color: 'text-cyan-400',
    border: 'border-cyan-400/40'
  }
];

// 2. Silent Coffee Spy Words
const COFFEE_SPY_WORDS = [
  'Flat White',
  'San Sebastian',
  'Wi-Fi Şifresi',
  'Priz Arayan',
  'Sıcak Kruvasan',
  'Barista Önlüğü',
  'Peçetelik',
  'Buzlu Americano',
  'Yulaf Sütü',
  'Tatlı Çatalı',
  'Hesap Adisyonu',
  'Filtre Kahve'
];

// 3. Phone / Notification Tasks
const PHONE_NOTIFICATION_TASKS = [
  'Galerindeki sondan 7. fotoğrafı aç ve masaya göstererek anısını anlat! 📸',
  'Rehberinde aradığın veya seni arayan son kişinin adını söyle! 📞',
  'WhatsApp bildirimlerindeki en son gelen mesajın sadece son kelimesini sesli oku! 💬',
  'Telefonunun ekran süresi menüsünü aç ve bugün en çok hangi uygulamada vakit geçirdiğini göster! ⏳',
  'Kilit ekranı arka plan resminin arkasındaki komik veya gizli nedeni açıkla! 🖼️',
  'Telefonunda yüklü olan ama hiç kullanmadığın en garip uygulamayı masadakilere aç! 📱',
  'Spotify / Apple Music arama geçmişindeki en son dinlediğin 3 şarkıyı itiraf et! 🎵',
  'Bugün çektiğin ilk fotoğrafı masadakilere göster! 🤳'
];

// 4. Observation & Waiter Radar Tasks
const OBSERVATION_RADAR_TASKS = [
  'Garson masaya sipariş getirdiğinde ona teşekkür ederken ilk gözünü kaçıran kişi masanın peçetelerini katlar! 👁️',
  'Yan masadaki grubun ne konuştuğunu dudak okuyarak tahmin et; en komik tahmini yapan kazanır! 🤫',
  '1 dakika boyunca masadakilerle hiç ses çıkarmadan, sadece mimik ve el işaretleriyle sohbet edin! 🎭',
  'Masadaki herkes aynı anda kahve fincanını kaldırsın; fincanı masaya en son bırakan sonraki turda çayları söyler! ☕',
  'Garson sipariş alırken masadaki herkes aynı anda çok kibar bir şekilde aynı cümleyi tekrar etsin! 🤵',
  'Yan masadaki birinin hangi kahveyi veya tatlıyı yediğini tahmin et; yanlış bilen ortaya şeker atar! 🍩'
];

// 5. Deep Coffee Chat Questions
const DEEP_COFFEE_QUESTIONS = [
  'Masadakilerle ilk tanıştığında hakkında düşündüğün ama sonradan tamamen yanıldığın şey neydi? 🤔',
  'Şu an bu masadaki birinin hayatındaki tek bir şeyi değiştirebilecek olsaydın neyi seçerdin? ✨',
  'Hayatında aldığın ve uygulamaktan asla vazgeçmediğin en iyi tavsiye neydi? 💡',
  'Son 1 yıldır kimseye anlatamadığın ama içinde biriken en büyük hayal veya planın nedir? 🚀',
  'Bu masadaki arkadaş grubunun seni en iyi tanımlayan 3 özelliği sence nedir? 🌟',
  'Eğer yarın sabah tüm sorumluluklarını bırakıp dünyanın herhangi bir şehrine uçabilseydin nereye giderdin? ✈️',
  'Hayatında birine yaptığın en saçma veya yüzünü kızartan sakarlık anın neydi? 😂',
  'Geçmişteki 18 yaşındaki haline tek bir cümle söyleme hakkın olsa ne söylerdin? ⏳'
];

// 6. Dessert & Beverage Picker
const DESSERT_SUGGESTIONS = [
  'San Sebastian Cheesecake & Belçika Çikolatası 🍰',
  'Akışkan Sıcak Çikolatalı Sufle & Vanilyalı Dondurma 🍫',
  'Lotus Biscoff & Çilekli Magnolia 🍓',
  'Fıstıklı & Beyaz Çikolatalı Sıcak Kruvasan 🥐',
  'Geleneksel İtalyan Tiramisu & Espresso ☕',
  'Meyveli Çıtır Waffle & Fındık Kreması 🧇',
  'Karamelli Trileçe & Soğuk Süt 🍮',
  'Affogato (Vanilyalı Dondurma Üzerine Sıcak Espresso) 🍨'
];

export const TableRescuerModal: React.FC<TableRescuerModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  // Audio state
  const [isAudioMuted, setIsAudioMuted] = useState(!soundEngine.sfxEnabled);

  // 1. Bill Roulette State
  const [selectedRuleId, setSelectedRuleId] = useState<string>('full');
  const [tablePlayers, setTablePlayers] = useState<string[]>(() => {
    const loaded = loadTablePlayers();
    return loaded.map((p) => p.name);
  });
  const [newPlayerName, setNewPlayerName] = useState('');
  const [billWinner, setBillWinner] = useState<string | null>(null);
  const [billDuty, setBillDuty] = useState<string | null>(null);
  const [isSpinningBill, setIsSpinningBill] = useState(false);

  // Sync when open
  React.useEffect(() => {
    if (isOpen) {
      const loaded = loadTablePlayers();
      setTablePlayers(loaded.map((p) => p.name));
    }
  }, [isOpen]);

  // 2. Silent Coffee Spy State
  const [spyWordIndex, setSpyWordIndex] = useState(0);
  const [isSpyCardOpen, setIsSpyCardOpen] = useState(false);
  const [spyRevealIdx, setSpyRevealIdx] = useState(0);
  const [isShowingSecret, setIsShowingSecret] = useState(false);
  const [assignedSpyIdx, setAssignedSpyIdx] = useState<number>(1);

  // 3. Notification / Phone Task State
  const [currentPhoneTask, setCurrentPhoneTask] = useState(PHONE_NOTIFICATION_TASKS[0]);

  // 4. Observation Radar State
  const [currentObservation, setCurrentObservation] = useState(OBSERVATION_RADAR_TASKS[0]);

  // 5. Deep Coffee Chat State
  const [currentQuestion, setCurrentQuestion] = useState(DEEP_COFFEE_QUESTIONS[0]);

  // 6. Dessert State
  const [currentDessert, setCurrentDessert] = useState(DESSERT_SUGGESTIONS[0]);

  if (!isOpen) return null;

  // Toggle Mute
  const toggleMute = () => {
    const newState = soundEngine.toggleSound();
    setIsAudioMuted(!newState);
  };

  // Run Bill Roulette
  const handleTriggerBillRoulette = () => {
    if (isSpinningBill) return;
    setIsSpinningBill(true);
    soundEngine.playDiceRoll();

    const selectedRule =
      BILL_ROULETTE_RULES.find((r) => r.id === selectedRuleId) || BILL_ROULETTE_RULES[0];

    let counter = 0;
    const interval = setInterval(() => {
      const randomP = tablePlayers[Math.floor(Math.random() * tablePlayers.length)];
      setBillWinner(randomP);
      counter++;

      if (counter > 14) {
        clearInterval(interval);
        const finalWinner = tablePlayers[Math.floor(Math.random() * tablePlayers.length)];
        setBillWinner(finalWinner);
        setBillDuty(selectedRule.desc);
        setIsSpinningBill(false);
        soundEngine.playVictory();

        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch {
          // ignore
        }
      }
    }, 90);
  };

  // Add Table Player
  const handleAddPlayer = () => {
    const trimmed = newPlayerName.trim();
    if (trimmed && !tablePlayers.includes(trimmed)) {
      setTablePlayers([...tablePlayers, trimmed]);
      setNewPlayerName('');
      soundEngine.playClick();
      onShowToast(`${trimmed} masaya eklendi! ☕`);
    }
  };

  // Remove Table Player
  const handleRemovePlayer = (p: string) => {
    if (tablePlayers.length <= 2) {
      onShowToast('Masada en az 2 kişi olmalıdır!');
      return;
    }
    setTablePlayers(tablePlayers.filter((x) => x !== p));
    soundEngine.playClick();
  };

  // Start Coffee Spy Pass
  const handleStartSpy = () => {
    const nextIdx = Math.floor(Math.random() * COFFEE_SPY_WORDS.length);
    setSpyWordIndex(nextIdx);
    setAssignedSpyIdx(Math.floor(Math.random() * tablePlayers.length));
    setSpyRevealIdx(0);
    setIsShowingSecret(false);
    setIsSpyCardOpen(true);
    soundEngine.playClick();
    onShowToast('🤫 Sessiz Casus turu başladı! Telefonu sırayla elden ele gezdirin.');
  };

  // Next Question
  const handleNextQuestion = () => {
    soundEngine.playClick();
    const remaining = DEEP_COFFEE_QUESTIONS.filter((q) => q !== currentQuestion);
    const nextQ = remaining[Math.floor(Math.random() * remaining.length)];
    setCurrentQuestion(nextQ);
  };

  // Next Phone Task
  const handleNextPhoneTask = () => {
    soundEngine.playClick();
    const remaining = PHONE_NOTIFICATION_TASKS.filter((t) => t !== currentPhoneTask);
    const nextT = remaining[Math.floor(Math.random() * remaining.length)];
    setCurrentPhoneTask(nextT);
  };

  // Next Observation
  const handleNextObservation = () => {
    soundEngine.playClick();
    const remaining = OBSERVATION_RADAR_TASKS.filter((o) => o !== currentObservation);
    const nextO = remaining[Math.floor(Math.random() * remaining.length)];
    setCurrentObservation(nextO);
  };

  // Next Dessert
  const handleNextDessert = () => {
    soundEngine.playClick();
    const remaining = DESSERT_SUGGESTIONS.filter((d) => d !== currentDessert);
    const nextD = remaining[Math.floor(Math.random() * remaining.length)];
    setCurrentDessert(nextD);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2 select-none">
      <div className="relative w-full max-w-md h-[88dvh] sm:h-[92vh] max-h-[840px] bg-[#0a0e18] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        {/* ================= FIXED TOP HEADER ================= */}
        <header className="w-full pt-safe bg-[#0a0e18]/90 backdrop-blur-xl border-b border-white/10 shrink-0">
          <div className="h-16 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-[#1c1f2a] flex items-center justify-center text-amber-400 text-xl shrink-0">
                ☕
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-base text-white tracking-tight leading-none truncate">
                    Masa Kurtarıcısı
                  </h1>
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shrink-0" />
                </div>
                <span className="text-[10px] text-[#bef264] tracking-wider uppercase font-mono mt-1 truncate">
                  Kafe &amp; Masa Modu • Fısıltı Güvenli
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={toggleMute}
                className="w-10 h-10 rounded-full bg-[#1c1f2a] hover:bg-white/10 flex items-center justify-center text-gray-300 transition-colors"
                title="Sesi Aç / Kapat"
              >
                {isAudioMuted ? (
                  <VolumeX className="w-4 h-4 text-red-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                )}
              </button>

              <button
                type="button"
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
        <div className="flex-1 overflow-y-auto px-4 py-3 pb-16 flex flex-col gap-3.5 no-scrollbar">

        {/* =========================================================================
            1. HERO: HESAP RULETİ (KAFE ADİSYONU)
        ========================================================================= */}
        <div className="relative overflow-hidden rounded-3xl bg-[#111827] border border-white/10 p-5 shadow-2xl mb-5">
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-pink-500/15 blur-2xl pointer-events-none" />

          <div className="relative flex flex-col space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                <Receipt className="w-3.5 h-3.5" />
                ADİSYON RULETİ
              </span>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1E293B] border border-white/10 text-white/80 text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span>{tablePlayers.length} Kişi Masada</span>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black text-white tracking-tight leading-tight">
                Hesap Ruleti (Kafe Adisyonu)
              </h3>
              <p className="text-xs text-gray-400 mt-1 leading-snug">
                Garson hesabı getirdiğinde panik yok! Kartı kimin uzatacağını veya tatlıları kimin karşılayacağını şansa bırakın.
              </p>
            </div>

            {/* Table Players Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">
                MASADAKİLER:
              </span>
              <div className="flex flex-wrap gap-1.5 items-center">
                {tablePlayers.map((p) => (
                  <span
                    key={p}
                    className="px-2.5 py-1 rounded-full bg-[#1E293B] border border-white/10 text-xs text-white font-bold flex items-center gap-1.5 group"
                  >
                    <span>{p}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePlayer(p)}
                      className="text-gray-400 hover:text-red-400 ml-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Add player quick form */}
              <div className="flex items-center gap-1.5 pt-1">
                <input
                  type="text"
                  value={newPlayerName}
                  onChange={(e) => setNewPlayerName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
                  placeholder="Kişi ekle..."
                  className="flex-1 bg-[#0a0e18] border border-white/10 rounded-xl px-2.5 py-1 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={handleAddPlayer}
                  className="px-3 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
                >
                  + Ekle
                </button>
              </div>
            </div>

            {/* Roulette Winner Display Result */}
            <div
              id="bill-roulette-display"
              className="p-4 rounded-2xl bg-[#0a0e18] border border-white/10 flex flex-col items-center justify-center text-center space-y-1 shadow-inner relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/10 to-transparent pointer-events-none" />
              <span className="text-[10px] text-amber-400 font-black uppercase tracking-widest">
                KADERİN ÇEKİLİŞİ
              </span>
              <div
                className={`text-2xl font-black py-1 transition-all duration-300 ${
                  isSpinningBill ? 'text-amber-300 animate-pulse' : 'text-white'
                }`}
              >
                {billWinner ? `🎯 ${billWinner}` : 'Kura İçin Butona Bas 👇'}
              </div>
              <p className="text-xs text-gray-400 max-w-xs leading-relaxed">
                {billDuty || 'Adisyonu kim tek başına üstlenecek?'}
              </p>
            </div>

            {/* Roulette Rules Grid */}
            <div className="grid grid-cols-2 gap-2" id="roulette-rules-grid">
              {BILL_ROULETTE_RULES.map((rule) => {
                const isSelected = selectedRuleId === rule.id;
                return (
                  <button
                    key={rule.id}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setSelectedRuleId(rule.id);
                    }}
                    className={`text-left p-2.5 rounded-2xl border transition-all flex flex-col active:scale-95 ${
                      isSelected
                        ? `bg-[#1E293B] ${rule.border} shadow-md`
                        : 'bg-[#111827] border-white/5 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <span className={`text-xs font-black ${rule.color}`}>
                      {rule.title}
                    </span>
                    <span className="text-[11px] text-gray-400 line-clamp-1 mt-0.5">
                      {rule.desc}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Roulette Spin Button */}
            <button
              type="button"
              disabled={isSpinningBill}
              onClick={handleTriggerBillRoulette}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 text-black font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <Shuffle className={`w-4 h-4 ${isSpinningBill ? 'animate-spin' : ''}`} />
              <span>Adisyonu Şansa Bırak ☕</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            2. MASA BAŞI ÖZEL OYUNLARI (5 ÖZEL OYUN)
        ========================================================================= */}
        <div className="flex flex-col space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-base text-white font-black">
                Masa Başı Özel Oyunları
              </span>
              <span className="px-2 py-0.5 rounded-full bg-[#bef264]/10 text-[#bef264] text-[10px] font-black border border-[#bef264]/20">
                5 Oyun
              </span>
            </div>
            <span className="text-xs text-gray-400 font-semibold">Sıfır Gürültü</span>
          </div>

          {/* OYUN 1: Sessiz Casus (Kahve Dedektifi) */}
          <div className="p-4 rounded-3xl bg-[#111827] border border-white/10 shadow-lg flex flex-col space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center shrink-0 shadow-inner">
                  <EyeOff className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-white font-black leading-tight">
                    🤫 Sessiz Casus (Kahve Dedektifi)
                  </span>
                  <span className="text-[11px] text-cyan-400 font-bold">
                    Masa İçi Casusluk • Sıfır Ses
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#1E293B] border border-white/5 text-[10px] text-[#10B981] font-bold">
                3-8 Kişi
              </span>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Masadaki herkes ortak kafe kelimesini ekrandan okur, sadece 1 kişi 'Casus'tur! Fısıltıyla ipuçları verilir, garson gelmeden casus yakalanmalıdır.
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleStartSpy}
                className="flex-1 py-2.5 px-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-black text-xs text-center active:scale-95 transition-all shadow-md"
              >
                Gizli Kelimeyi Dağıt ({tablePlayers.length} Kişi)
              </button>
              <button
                type="button"
                onClick={() =>
                  onShowToast('Fısıltıyla tek kelimelik ipucu verin. Casus mekanı bilmez, taklit eder!')
                }
                className="w-10 h-10 rounded-xl bg-[#1E293B] border border-white/10 flex items-center justify-center text-white active:scale-95 shrink-0"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>

            {/* Interactive Spy Card Pass Screen */}
            {isSpyCardOpen && (
              <div className="p-3.5 rounded-2xl bg-[#0a0e18] border border-cyan-500/30 text-center animate-in fade-in space-y-2">
                <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                  <span className="text-[10px] text-cyan-400 font-black uppercase tracking-wider">
                    TELEFONU SIRAYLA MASADA GEZDİRİN
                  </span>
                  <span className="text-xs text-white font-mono">
                    {spyRevealIdx + 1}/{tablePlayers.length}
                  </span>
                </div>

                <div className="py-2">
                  <span className="text-xs text-gray-300 block mb-1">
                    Sıradaki: <strong>{tablePlayers[spyRevealIdx % tablePlayers.length]}</strong>
                  </span>

                  {isShowingSecret ? (
                    <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-400/40">
                      {spyRevealIdx === assignedSpyIdx ? (
                        <div>
                          <span className="text-xs font-black text-red-400 block">
                            🕵️ SEN CASUSSUN!
                          </span>
                          <span className="text-[11px] text-gray-300 mt-1 block">
                            Kelimeyi bilmiyorsun! Masadakileri dinle ve çaktırma.
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-[10px] text-gray-400 uppercase block">GİZLİ KELİME:</span>
                          <span className="text-base font-black text-white block mt-0.5">
                            "{COFFEE_SPY_WORDS[spyWordIndex]}"
                          </span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setIsShowingSecret(true);
                      }}
                      className="px-4 py-2 rounded-xl bg-[#1E293B] border border-white/10 text-cyan-400 font-bold text-xs"
                    >
                      Kartı Gizlice Gör 👁️
                    </button>
                  )}
                </div>

                <div className="flex justify-between items-center pt-1 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => {
                      if (spyRevealIdx < tablePlayers.length - 1) {
                        setSpyRevealIdx(spyRevealIdx + 1);
                        setIsShowingSecret(false);
                        soundEngine.playClick();
                      } else {
                        setIsSpyCardOpen(false);
                        soundEngine.playVictory();
                        onShowToast('Herkes kelimeyi gördü! Şimdi sorgu ve fısıltı turu başlasın! 🤫');
                      }
                    }}
                    className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs"
                  >
                    {spyRevealIdx < tablePlayers.length - 1
                      ? 'Sıradaki Arkadaşına Ver ➡️'
                      : 'Herkes Gördü, Oyunu Başlat! 🚀'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* OYUN 2: Bildirim Ruleti (Ekran Kilidi) */}
          <div className="p-4 rounded-3xl bg-[#111827] border border-white/10 shadow-lg flex flex-col space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-pink-500/15 border border-pink-500/30 text-pink-400 flex items-center justify-center shrink-0 shadow-inner">
                  <Smartphone className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-white font-black leading-tight">
                    📱 Bildirim Ruleti (Ekran Kilidi)
                  </span>
                  <span className="text-[11px] text-pink-400 font-bold">
                    Riskli Masa Oyunu • Fısıltı Seviyesi
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-pink-500/15 border border-pink-500/30 text-[10px] text-pink-400 font-black">
                Popüler
              </span>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Telefonları masaya ters koyun! İlk bildirim gelen veya kurada çıkan kişi telefondaki görevi yapar.
            </p>

            <div className="p-3.5 rounded-2xl bg-[#0a0e18] border border-white/5 flex items-center justify-between gap-2 shadow-inner">
              <div className="flex flex-col min-w-0 pr-1">
                <span className="text-[10px] text-pink-400 font-black uppercase">
                  GALERİ / BİLDİRİM GÖREVİ
                </span>
                <span className="text-xs text-gray-200 font-medium leading-snug line-clamp-2 mt-0.5">
                  "{currentPhoneTask}"
                </span>
              </div>
              <button
                type="button"
                onClick={handleNextPhoneTask}
                className="px-3 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-pink-600 text-white font-black text-xs shadow-md active:scale-95 transition-all shrink-0"
              >
                Görev Çek
              </button>
            </div>
          </div>

          {/* OYUN 3: Çevre & Garson Radarı */}
          <div className="p-4 rounded-3xl bg-[#111827] border border-white/10 shadow-lg flex flex-col space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center shrink-0 shadow-inner">
                  <Radar className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-white font-black leading-tight">
                    👀 Çevre & Garson Radarı
                  </span>
                  <span className="text-[11px] text-purple-400 font-bold">
                    Sosyal Gözlem • Dudak Okuma
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#1E293B] border border-white/5 text-[10px] text-purple-400 font-bold">
                Mekan Modu
              </span>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Çevredekileri rahatsız etmeden kafedeki detayları oyuna dönüştürün. İlk gülen veya yakalanan masanın cezasını üstlenir!
            </p>

            <div className="p-3.5 rounded-2xl bg-[#0a0e18] border border-white/5 flex flex-col space-y-2 shadow-inner">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-purple-400 font-black uppercase tracking-wide">
                  SIRADAKİ ÇEVRE KURALI:
                </span>
                <span className="text-[10px] text-white/50">Rastgele</span>
              </div>
              <p className="text-xs text-white font-medium leading-relaxed italic">
                "{currentObservation}"
              </p>
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleNextObservation}
                  className="px-3 py-1.5 rounded-xl bg-[#1E293B] border border-white/10 text-purple-400 font-bold text-xs flex items-center gap-1 active:scale-95 transition-all"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Yeni Kural Çek</span>
                </button>
              </div>
            </div>
          </div>

          {/* OYUN 4: Derin Sohbet & Sıcak İtiraflar */}
          <div className="p-4 rounded-3xl bg-[#111827] border border-white/10 shadow-lg flex flex-col space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-white font-black leading-tight">
                    💬 Derin Sohbet & Sıcak İtiraflar
                  </span>
                  <span className="text-[11px] text-amber-400 font-bold">
                    Samimi Kahve Muhabbeti • 50+ Soru
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#1E293B] border border-white/5 text-[10px] text-amber-400 font-bold">
                Derin Sohbet
              </span>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Sohbetin durduğu veya herkesin telefona daldığı anlarda masayı birbirine bağlayan dürüst ve derin muhabbet kartları.
            </p>

            <div className="p-3.5 rounded-2xl bg-[#0a0e18] border border-white/5 flex flex-col items-center text-center space-y-2 shadow-inner">
              <span className="text-[10px] text-amber-400 font-black uppercase tracking-wider">
                GÜNÜN İTİRAF KARTI
              </span>
              <p className="text-xs text-white font-medium italic leading-relaxed px-2">
                "{currentQuestion}"
              </p>
              <button
                type="button"
                onClick={handleNextQuestion}
                className="mt-1 px-4 py-2 rounded-xl bg-[#1E293B] border border-white/10 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
              >
                <Shuffle className="w-3.5 h-3.5 text-amber-400" />
                <span>Sonraki Soruyu Getir</span>
              </button>
            </div>
          </div>

          {/* OYUN 5: Günün Tatlısı & İçecek Kararı */}
          <div className="p-4 rounded-3xl bg-[#111827] border border-white/10 shadow-lg flex flex-col space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-lime-500/15 border border-lime-500/30 text-[#bef264] flex items-center justify-center shrink-0 shadow-inner">
                  <Cake className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm text-white font-black leading-tight">
                    🍰 Günün Tatlısı & İçecek Kararı
                  </span>
                  <span className="text-[11px] text-[#bef264] font-bold">
                    Ortaya Ne Alalım? • Kararsız Masalar
                  </span>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#1E293B] border border-white/5 text-[10px] text-[#bef264] font-bold">
                Hızlı Karar
              </span>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed">
              Menüye dakikalarca bakıp karar veremeyen arkadaş grupları için masanın ortak tatlısını anında seçer.
            </p>

            <div className="p-3.5 rounded-2xl bg-[#0a0e18] border border-white/5 flex items-center justify-between shadow-inner">
              <div className="flex flex-col min-w-0 pr-2">
                <span className="text-[10px] text-[#bef264] font-black uppercase">
                  ÖNERİLEN MASALIK TATLI:
                </span>
                <span className="text-xs text-white font-bold truncate mt-0.5">
                  {currentDessert}
                </span>
              </div>
              <button
                type="button"
                onClick={handleNextDessert}
                className="w-9 h-9 rounded-xl bg-[#bef264] text-black flex items-center justify-center font-bold shadow-[0_0_15px_rgba(187,242,70,0.4)] active:scale-90 transition-all shrink-0"
                title="Yeni Tatlı Seç"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Kafe Dostu Rozeti */}
          <div className="p-3.5 rounded-2xl bg-[#111827] border border-white/5 flex items-center gap-3 shadow-md">
            <div className="w-8 h-8 rounded-full bg-[#10B981]/20 text-[#10B981] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs text-white font-bold">
                Kafe Dostu & Fısıltı Korumalı
              </span>
              <span className="text-[11px] text-gray-400 truncate">
                Yan masaları rahatsız etmeden en eğlenceli anlar garanti.
              </span>
            </div>
          </div>

          {/* Bottom clearance spacer */}
          <div className="h-8 w-full shrink-0 pointer-events-none" aria-hidden="true" />
        </div>
        </div>

        {/* ================= FIXED BOTTOM ACTION BAR ================= */}
        <div className="p-3 pb-safe bg-[#0a0e18]/95 backdrop-blur-md border-t border-white/10 shrink-0 flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Masaya Dön ☕</span>
          </button>
        </div>
      </div>
    </div>
  );
};
