import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Share2,
  Plus,
  CheckCircle2,
  Circle,
  ThumbsUp,
  DollarSign,
  Music,
  Vote,
  ListTodo,
  Sparkles,
  Edit2,
  Check,
  User,
  StickyNote
} from 'lucide-react';
import { soundEngine } from '../../utils/audio';
import confetti from 'canvas-confetti';
import {
  PartyPlan,
  GroupPoll,
  PotluckItem,
  SongRequest,
  ExpenseItem,
  NoticeNote
} from '../../types';

interface PlanTabProps {
  onShowToast: (msg: string) => void;
}

const DEFAULT_PARTY_PLAN: PartyPlan = {
  title: 'Neon Arcade & Parti Gecesi 🔥',
  date: '2026-10-31',
  time: '20:00',
  location: "Burak'ın Evi (Kadıköy / Moda)",
  hostName: 'Burak & Cansu',
  description: 'Party Box oyunları, pizza ziyafeti, neon arcade turnuvası ve sabahlamaca!',
  theme: 'Neon Arcade & 90lar Nostalji'
};

const DEFAULT_POLLS: GroupPoll[] = [
  {
    id: 'poll-1',
    question: '🍕 Akşam ne sipariş veriyoruz?',
    options: [
      { id: 'opt-1', text: 'Büyük Boy Gurme Pizza', votes: 5 },
      { id: 'opt-2', text: 'Smash Burger & Patates', votes: 3 },
      { id: 'opt-3', text: 'Sushi & Noodle', votes: 1 },
      { id: 'opt-4', text: 'Ev Yemeği / Ortak Pişirme', votes: 2 }
    ]
  },
  {
    id: 'poll-2',
    question: '⏰ Toplanma saati kaç olsun?',
    options: [
      { id: 'opt-5', text: '19:30 (Erken Sohbet)', votes: 2 },
      { id: 'opt-6', text: '20:30 (Tam Zamanında)', votes: 6 },
      { id: 'opt-7', text: '21:30 (Gececiler)', votes: 1 }
    ]
  }
];

const DEFAULT_POTLUCK: PotluckItem[] = [
  { id: 'pot-1', item: '2 Büyük Şişe Asitsiz / Soğuk İçecek', assignee: 'Burak', completed: true, category: 'drink' },
  { id: 'pot-2', item: 'Acılı & Baharatlı Cipsler ve Avokado Sos', assignee: 'Cansu', completed: true, category: 'snack' },
  { id: 'pot-3', item: 'Buz Torbası ve Plastik Bardaklar', assignee: 'Efe', completed: false, category: 'equipment' },
  { id: 'pot-4', item: 'Kutu Oyunları & Bluetooth Hoparlör', assignee: 'Deniz', completed: true, category: 'equipment' },
  { id: 'pot-5', item: 'Çikolatalı Sufle veya Tatlı Kutusu', assignee: 'Selin', completed: false, category: 'food' }
];

const DEFAULT_PLAYLIST: SongRequest[] = [
  { id: 'song-1', title: 'One More Time', artist: 'Daft Punk', requestedBy: 'Efe', votes: 7 },
  { id: 'song-2', title: 'Kuzu Kuzu', artist: 'Tarkan', requestedBy: 'Cansu', votes: 9 },
  { id: 'song-3', title: 'Blinding Lights', artist: 'The Weeknd', requestedBy: 'Burak', votes: 6 },
  { id: 'song-4', title: 'Aşkın Olayım', artist: 'Simge', requestedBy: 'Deniz', votes: 8 }
];

const DEFAULT_EXPENSES: ExpenseItem[] = [
  { id: 'exp-1', description: 'Pizzalar (3 Büyük Boy)', amount: 680, paidBy: 'Burak' },
  { id: 'exp-2', description: 'İçecekler & Atıştırmalıklar', amount: 320, paidBy: 'Cansu' },
  { id: 'exp-3', description: 'Buz & Bardak / Servis', amount: 150, paidBy: 'Efe' }
];

const DEFAULT_NOTICES: NoticeNote[] = [
  {
    id: 'not-1',
    content: '📶 Wi-Fi: NeonParty2026 | Şifre: partygecesi123',
    author: 'Burak',
    timestamp: 'Dün',
    pinned: true
  },
  {
    id: 'not-2',
    content: '🚪 Kapı Şifresi: #4021 - Zile basmadan direkt girebilirsiniz!',
    author: 'Cansu',
    timestamp: 'Bugün',
    pinned: true
  }
];

export const PlanTab: React.FC<PlanTabProps> = ({ onShowToast }) => {
  // Plan details
  const [plan, setPlan] = useState<PartyPlan>(() => {
    try {
      const saved = localStorage.getItem('parti_kutusu_plan');
      return saved ? JSON.parse(saved) : DEFAULT_PARTY_PLAN;
    } catch {
      return DEFAULT_PARTY_PLAN;
    }
  });

  const [isEditingPlan, setIsEditingPlan] = useState(false);
  const [editedPlan, setEditedPlan] = useState<PartyPlan>(plan);

  // Sub-tabs in planner: 'all' | 'polls' | 'potluck' | 'music' | 'expense' | 'notes'
  const [planSection, setPlanSection] = useState<'overview' | 'polls' | 'potluck' | 'music' | 'expense'>('overview');

  // Polls
  const [polls, setPolls] = useState<GroupPoll[]>(() => {
    try {
      const saved = localStorage.getItem('parti_kutusu_polls');
      return saved ? JSON.parse(saved) : DEFAULT_POLLS;
    } catch {
      return DEFAULT_POLLS;
    }
  });
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [newPollOptions, setNewPollOptions] = useState('');
  const [showAddPollModal, setShowAddPollModal] = useState(false);

  // Potluck items
  const [potluck, setPotluck] = useState<PotluckItem[]>(() => {
    try {
      const saved = localStorage.getItem('parti_kutusu_potluck');
      return saved ? JSON.parse(saved) : DEFAULT_POTLUCK;
    } catch {
      return DEFAULT_POTLUCK;
    }
  });
  const [newPotluckItem, setNewPotluckItem] = useState('');
  const [newPotluckAssignee, setNewPotluckAssignee] = useState('');

  // Playlist
  const [playlist, setPlaylist] = useState<SongRequest[]>(() => {
    try {
      const saved = localStorage.getItem('parti_kutusu_playlist');
      return saved ? JSON.parse(saved) : DEFAULT_PLAYLIST;
    } catch {
      return DEFAULT_PLAYLIST;
    }
  });
  const [newSongTitle, setNewSongTitle] = useState('');
  const [newSongArtist, setNewSongArtist] = useState('');

  // Expenses
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => {
    try {
      const saved = localStorage.getItem('parti_kutusu_expenses');
      return saved ? JSON.parse(saved) : DEFAULT_EXPENSES;
    } catch {
      return DEFAULT_EXPENSES;
    }
  });
  const [newExpenseDesc, setNewExpenseDesc] = useState('');
  const [newExpenseAmount, setNewExpenseAmount] = useState('');
  const [newExpensePayer, setNewExpensePayer] = useState('');

  // Notices
  const [notices, setNotices] = useState<NoticeNote[]>(() => {
    try {
      const saved = localStorage.getItem('parti_kutusu_notices');
      return saved ? JSON.parse(saved) : DEFAULT_NOTICES;
    } catch {
      return DEFAULT_NOTICES;
    }
  });
  const [newNoticeContent, setNewNoticeContent] = useState('');

  // Save to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem('parti_kutusu_plan', JSON.stringify(plan));
      localStorage.setItem('parti_kutusu_polls', JSON.stringify(polls));
      localStorage.setItem('parti_kutusu_potluck', JSON.stringify(potluck));
      localStorage.setItem('parti_kutusu_playlist', JSON.stringify(playlist));
      localStorage.setItem('parti_kutusu_expenses', JSON.stringify(expenses));
      localStorage.setItem('parti_kutusu_notices', JSON.stringify(notices));
    } catch {
      // safe ignore
    }
  }, [plan, polls, potluck, playlist, expenses, notices]);

  // Save edited plan
  const handleSavePlan = () => {
    setPlan(editedPlan);
    setIsEditingPlan(false);
    soundEngine.playSuccess();
    onShowToast('Parti detayları güncellendi!');
  };

  // Vote on poll option
  const handleVotePoll = (pollId: string, optionId: string) => {
    soundEngine.playClick();
    setPolls((prev) =>
      prev.map((poll) => {
        if (poll.id !== pollId) return poll;
        const currentVoted = poll.userVotedId;
        const updatedOptions = poll.options.map((opt) => {
          if (opt.id === optionId) {
            return { ...opt, votes: opt.votes + (currentVoted === optionId ? -1 : 1) };
          }
          if (opt.id === currentVoted) {
            return { ...opt, votes: Math.max(0, opt.votes - 1) };
          }
          return opt;
        });

        return {
          ...poll,
          options: updatedOptions,
          userVotedId: currentVoted === optionId ? undefined : optionId
        };
      })
    );
    onShowToast('Oyunuz kaydedildi!');
  };

  // Add new custom poll
  const handleCreatePoll = () => {
    const q = newPollQuestion.trim();
    const opts = newPollOptions
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (q && opts.length >= 2) {
      const newPoll: GroupPoll = {
        id: `poll-${Date.now()}`,
        question: q,
        options: opts.map((opt, idx) => ({
          id: `opt-${Date.now()}-${idx}`,
          text: opt,
          votes: 0
        }))
      };
      setPolls((prev) => [newPoll, ...prev]);
      setNewPollQuestion('');
      setNewPollOptions('');
      setShowAddPollModal(false);
      soundEngine.playSuccess();
      onShowToast('Yeni anket yayında!');
    } else {
      onShowToast('Lütfen soru ve en az 2 seçenek girin (virgülle ayırın)!');
    }
  };

  // Toggle potluck completed
  const handleTogglePotluck = (id: string) => {
    soundEngine.playClick();
    setPotluck((prev) =>
      prev.map((p) => (p.id === id ? { ...p, completed: !p.completed } : p))
    );
  };

  // Add potluck item
  const handleAddPotluck = () => {
    const itm = newPotluckItem.trim();
    const asg = newPotluckAssignee.trim() || 'Gruptan Biri';
    if (itm) {
      const newEntry: PotluckItem = {
        id: `pot-${Date.now()}`,
        item: itm,
        assignee: asg,
        completed: false,
        category: 'snack'
      };
      setPotluck((prev) => [...prev, newEntry]);
      setNewPotluckItem('');
      setNewPotluckAssignee('');
      soundEngine.playSuccess();
      onShowToast(`"${itm}" listeye eklendi!`);
    }
  };

  // Upvote song
  const handleUpvoteSong = (id: string) => {
    soundEngine.playClick();
    setPlaylist((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, votes: s.votes + 1 } : s));
      return updated.sort((a, b) => b.votes - a.votes);
    });
    onShowToast('Şarkıya oy verildi! 🎶');
  };

  // Add song
  const handleAddSong = () => {
    const t = newSongTitle.trim();
    const a = newSongArtist.trim() || 'Bilinmiyor';
    if (t) {
      const newSong: SongRequest = {
        id: `song-${Date.now()}`,
        title: t,
        artist: a,
        requestedBy: 'Sen',
        votes: 1
      };
      setPlaylist((prev) => [...prev, newSong].sort((x, y) => y.votes - x.votes));
      setNewSongTitle('');
      setNewSongArtist('');
      soundEngine.playSuccess();
      onShowToast(`"${t}" şarkı listesine eklendi!`);
    }
  };

  // Add expense
  const handleAddExpense = () => {
    const d = newExpenseDesc.trim();
    const amt = parseFloat(newExpenseAmount);
    const p = newExpensePayer.trim() || 'Biri';

    if (d && !isNaN(amt) && amt > 0) {
      const newExp: ExpenseItem = {
        id: `exp-${Date.now()}`,
        description: d,
        amount: amt,
        paidBy: p
      };
      setExpenses((prev) => [...prev, newExp]);
      setNewExpenseDesc('');
      setNewExpenseAmount('');
      setNewExpensePayer('');
      soundEngine.playSuccess();
      onShowToast(`${amt}₺ masraf kaydedildi!`);
    }
  };

  // Add Notice
  const handleAddNotice = () => {
    const c = newNoticeContent.trim();
    if (c) {
      const newNotice: NoticeNote = {
        id: `not-${Date.now()}`,
        content: c,
        author: 'Sen',
        timestamp: 'Az önce',
        pinned: true
      };
      setNotices((prev) => [newNotice, ...prev]);
      setNewNoticeContent('');
      soundEngine.playSuccess();
      onShowToast('Sabit not eklendi!');
    }
  };

  // Share formatted invite text to WhatsApp / Clipboard
  const handleShareInvite = () => {
    soundEngine.playSuccess();
    const text = `🎉 PARTİ DAVETİ: ${plan.title} 🎉\n\n` +
      `📅 Tarih: ${plan.date}\n` +
      `⏰ Saat: ${plan.time}\n` +
      `📍 Mekan: ${plan.location}\n` +
      `👑 Ev Sahibi: ${plan.hostName}\n` +
      `🎭 Tema: ${plan.theme}\n\n` +
      `📝 Not: ${plan.description}\n\n` +
      `✨ Getirilecekler & Şarkı Önerileri için Party Box'ta planımız hazır! Geliyor musun?`;

    navigator.clipboard.writeText(text);

    try {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // fallback
    }

    onShowToast('Parti davet metni kopyalandı! WhatsApp veya gruba yapıştırın.');
  };

  // Financial calculations
  const totalExpense = expenses.reduce((sum, item) => sum + item.amount, 0);
  const estimatedPersons = 6;
  const perPersonCost = Math.round(totalExpense / estimatedPersons);

  return (
    <div className="flex-1 flex flex-col space-y-4 py-1 pb-4">
      {/* Title */}
      <div className="text-center py-1">
        <span className="text-[10px] tracking-wider uppercase font-bold text-[#bef264] bg-lime-500/10 px-3 py-0.5 rounded-full border border-lime-500/20">
          ARKADAŞ GRUBU PLANLAMA MERKEZİ
        </span>
        <h2 className="text-2xl font-black text-white mt-1">Partiyi Birlikte Planla</h2>
        <p className="text-xs text-gray-400">
          Anket yap, getirilecekleri bölüş, şarkıları oyla ve hesabı dengele!
        </p>
      </div>

      {/* HERO EVENT CARD */}
      <div className="bg-gradient-to-br from-purple-950/40 via-[#111827] to-lime-950/20 border border-white/10 rounded-3xl p-4 shadow-xl relative overflow-hidden">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1">
            <span className="text-[10px] uppercase font-black text-[#bef264] tracking-wider block">
              GELECEK PARTİ
            </span>
            <h3 className="text-xl font-black text-white leading-tight">
              {plan.title}
            </h3>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => {
                setEditedPlan(plan);
                setIsEditingPlan(true);
              }}
              className="p-2 rounded-xl bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white transition-colors"
              title="Planı Düzenle"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleShareInvite}
              className="px-3 py-1.5 rounded-xl bg-[#bef264] text-black font-extrabold text-xs active:scale-95 transition-transform flex items-center gap-1.5 shadow glow-lime"
            >
              <Share2 className="w-3.5 h-3.5" />
              Davet Et
            </button>
          </div>
        </div>

        {/* Quick Meta Grid */}
        <div className="grid grid-cols-2 gap-2 my-2 text-xs">
          <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-xl border border-white/5">
            <Calendar className="w-4 h-4 text-pink-400 shrink-0" />
            <span className="font-semibold text-gray-200 truncate">{plan.date}</span>
          </div>
          <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-xl border border-white/5">
            <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="font-semibold text-gray-200 truncate">{plan.time}</span>
          </div>
          <div className="flex items-center gap-2 bg-black/40 px-3 py-2 rounded-xl border border-white/5 col-span-2">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-semibold text-gray-200 truncate">{plan.location}</span>
          </div>
        </div>

        <p className="text-xs text-gray-300 bg-white/5 p-2.5 rounded-xl border border-white/5 mt-2 italic leading-relaxed">
          "{plan.description}"
        </p>
      </div>

      {/* PLANNER SECTION FILTER TABS */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'overview', label: 'Tüm Özet', icon: <Sparkles className="w-3.5 h-3.5" /> },
          { id: 'polls', label: `Anketler (${polls.length})`, icon: <Vote className="w-3.5 h-3.5" /> },
          { id: 'potluck', label: `Getirilecekler (${potluck.length})`, icon: <ListTodo className="w-3.5 h-3.5" /> },
          { id: 'music', label: `Şarkılar (${playlist.length})`, icon: <Music className="w-3.5 h-3.5" /> },
          { id: 'expense', label: `Hesap (${totalExpense}₺)`, icon: <DollarSign className="w-3.5 h-3.5" /> }
        ].map((tab) => {
          const isActive = planSection === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                soundEngine.playClick();
                setPlanSection(tab.id as typeof planSection);
              }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                isActive
                  ? 'bg-[#bef264] text-black shadow glow-lime'
                  : 'bg-[#111827] border border-white/10 text-gray-400 hover:text-white'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* 1. SECTION: POLLS (ANKETLER) */}
      {(planSection === 'overview' || planSection === 'polls') && (
        <div className="bg-[#111827] rounded-3xl p-4 border border-white/10 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Vote className="w-4 h-4 text-[#ec4899]" />
              <h4 className="text-sm font-black text-white">Grup Anketleri & Oylama</h4>
            </div>
            <button
              onClick={() => setShowAddPollModal(true)}
              className="text-xs font-bold text-[#ec4899] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Yeni Anket
            </button>
          </div>

          <div className="space-y-3">
            {polls.map((poll) => {
              const totalVotes = poll.options.reduce((sum, o) => sum + o.votes, 0);
              return (
                <div
                  key={poll.id}
                  className="bg-black/35 border border-white/5 rounded-2xl p-3.5 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white">{poll.question}</span>
                    <span className="text-[10px] text-gray-400 font-semibold">
                      {totalVotes} Oy
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {poll.options.map((option) => {
                      const isVoted = poll.userVotedId === option.id;
                      const percentage =
                        totalVotes > 0 ? Math.round((option.votes / totalVotes) * 100) : 0;

                      return (
                        <button
                          key={option.id}
                          onClick={() => handleVotePoll(poll.id, option.id)}
                          className={`w-full relative overflow-hidden rounded-xl border p-2 text-left transition-all active:scale-[0.99] flex items-center justify-between ${
                            isVoted
                              ? 'border-[#ec4899] bg-pink-950/20'
                              : 'border-white/5 bg-white/5 hover:border-white/15'
                          }`}
                        >
                          {/* Progress fill */}
                          <div
                            className={`absolute top-0 bottom-0 left-0 transition-all duration-300 ${
                              isVoted ? 'bg-[#ec4899]/30' : 'bg-white/10'
                            }`}
                            style={{ width: `${percentage}%` }}
                          />

                          <div className="relative z-10 flex items-center gap-2">
                            <span
                              className={`w-4 h-4 rounded-full border flex items-center justify-center text-[10px] ${
                                isVoted
                                  ? 'border-[#ec4899] bg-[#ec4899] text-white'
                                  : 'border-gray-500 text-transparent'
                              }`}
                            >
                              ✓
                            </span>
                            <span
                              className={`text-xs font-bold ${
                                isVoted ? 'text-white' : 'text-gray-200'
                              }`}
                            >
                              {option.text}
                            </span>
                          </div>

                          <div className="relative z-10 flex items-center gap-1.5 text-xs font-bold">
                            <span className="text-gray-400">%{percentage}</span>
                            <span className="text-[10px] text-gray-500 font-normal">
                              ({option.votes})
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. SECTION: POTLUCK / GETİRİLECEKLER */}
      {(planSection === 'overview' || planSection === 'potluck') && (
        <div className="bg-[#111827] rounded-3xl p-4 border border-white/10 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-[#06b6d4]" />
              <h4 className="text-sm font-black text-white">Getirilecekler & İmece</h4>
            </div>
            <span className="text-xs text-gray-400 font-semibold">
              {potluck.filter((p) => p.completed).length}/{potluck.length} Hazır
            </span>
          </div>

          {/* New Item Quick Add */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newPotluckItem}
              onChange={(e) => setNewPotluckItem(e.target.value)}
              placeholder="Ne getirilecek? (Örn: 2L Kola)..."
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#06b6d4]"
            />
            <input
              type="text"
              value={newPotluckAssignee}
              onChange={(e) => setNewPotluckAssignee(e.target.value)}
              placeholder="Kim? (İsim)"
              className="w-24 bg-black/40 border border-white/10 rounded-xl px-2 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#06b6d4]"
            />
            <button
              onClick={handleAddPotluck}
              className="px-3.5 py-2 rounded-xl bg-[#06b6d4] text-black font-extrabold text-xs active:scale-95 transition-transform flex items-center gap-1 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Checklist */}
          <div className="space-y-1.5 max-h-56 overflow-y-auto">
            {potluck.map((p) => (
              <div
                key={p.id}
                onClick={() => handleTogglePotluck(p.id)}
                className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] ${
                  p.completed
                    ? 'bg-black/20 border-white/5 opacity-60'
                    : 'bg-black/40 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  {p.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-gray-500 shrink-0" />
                  )}
                  <span
                    className={`text-xs font-bold ${
                      p.completed ? 'line-through text-gray-400' : 'text-gray-100'
                    }`}
                  >
                    {p.item}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-white/5 text-[#06b6d4] border border-cyan-500/20">
                    {p.assignee}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. SECTION: PLAYLIST & JUKEBOX */}
      {(planSection === 'overview' || planSection === 'music') && (
        <div className="bg-[#111827] rounded-3xl p-4 border border-white/10 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-[#bef264]" />
              <h4 className="text-sm font-black text-white">Ortak Şarkı Kutusu (Jukebox)</h4>
            </div>
            <span className="text-xs text-[#bef264] font-bold">
              En Çok Oylanan Çalar
            </span>
          </div>

          {/* Add Song Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newSongTitle}
              onChange={(e) => setNewSongTitle(e.target.value)}
              placeholder="Şarkı Adı..."
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#bef264]"
            />
            <input
              type="text"
              value={newSongArtist}
              onChange={(e) => setNewSongArtist(e.target.value)}
              placeholder="Sanatçı..."
              className="w-28 bg-black/40 border border-white/10 rounded-xl px-2 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-[#bef264]"
            />
            <button
              onClick={handleAddSong}
              className="px-3.5 py-2 rounded-xl bg-[#bef264] text-black font-extrabold text-xs active:scale-95 transition-transform flex items-center gap-1 shadow"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Song list with upvote */}
          <div className="space-y-1.5 max-h-56 overflow-y-auto">
            {playlist.map((song, idx) => (
              <div
                key={song.id}
                className="p-2.5 rounded-xl bg-black/35 border border-white/5 flex items-center justify-between hover:border-white/15 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-black text-gray-500 w-4">#{idx + 1}</span>
                  <div>
                    <h5 className="text-xs font-black text-white leading-tight">
                      {song.title}
                    </h5>
                    <p className="text-[10px] text-gray-400">
                      {song.artist} · <span className="text-gray-500">{song.requestedBy}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleUpvoteSong(song.id)}
                  className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-lime-400/20 border border-white/10 text-xs font-extrabold text-lime-400 flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>{song.votes}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. SECTION: EXPENSES / HESAP BÖLÜŞÜCÜ */}
      {(planSection === 'overview' || planSection === 'expense') && (
        <div className="bg-[#111827] rounded-3xl p-4 border border-white/10 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              <h4 className="text-sm font-black text-white">Masraf Paylaşımı & Hesap</h4>
            </div>
            <span className="text-xs font-extrabold text-amber-400">
              Toplam: {totalExpense} ₺
            </span>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-2 bg-black/40 p-3 rounded-2xl border border-white/5 text-center">
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold block">
                Toplam Harcama
              </span>
              <span className="text-lg font-black text-white">{totalExpense} ₺</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 uppercase font-bold block">
                Kişi Başı Düşen (~6 Kişi)
              </span>
              <span className="text-lg font-black text-[#bef264]">{perPersonCost} ₺</span>
            </div>
          </div>

          {/* Add expense input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newExpenseDesc}
              onChange={(e) => setNewExpenseDesc(e.target.value)}
              placeholder="Açıklama (Örn: Pizza)..."
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
            />
            <input
              type="number"
              value={newExpenseAmount}
              onChange={(e) => setNewExpenseAmount(e.target.value)}
              placeholder="₺ Tutar"
              className="w-20 bg-black/40 border border-white/10 rounded-xl px-2 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 font-mono"
            />
            <input
              type="text"
              value={newExpensePayer}
              onChange={(e) => setNewExpensePayer(e.target.value)}
              placeholder="Kim Ödedi?"
              className="w-24 bg-black/40 border border-white/10 rounded-xl px-2 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
            />
            <button
              onClick={handleAddExpense}
              className="px-3 py-2 rounded-xl bg-amber-400 text-black font-extrabold text-xs active:scale-95 transition-transform flex items-center shadow"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Expense breakdown list */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {expenses.map((exp) => (
              <div
                key={exp.id}
                className="p-2.5 rounded-xl bg-black/30 border border-white/5 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-gray-200 block">{exp.description}</span>
                  <span className="text-[10px] text-gray-400">
                    Ödeyen: <span className="text-amber-400 font-bold">{exp.paidBy}</span>
                  </span>
                </div>
                <span className="font-black font-mono text-white text-sm">
                  {exp.amount} ₺
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. SECTION: NOTICES / SABİT NOTLAR */}
      {(planSection === 'overview' || planSection === 'polls') && (
        <div className="bg-[#111827] rounded-3xl p-4 border border-white/10 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-yellow-400" />
              <h4 className="text-sm font-black text-white">Sabit Bilgi & Not Panosu</h4>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newNoticeContent}
              onChange={(e) => setNewNoticeContent(e.target.value)}
              placeholder="Yeni not ekle (Örn: Giriş kapı şifresi)..."
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-yellow-400"
            />
            <button
              onClick={handleAddNotice}
              className="px-3.5 py-2 rounded-xl bg-yellow-400 text-black font-extrabold text-xs active:scale-95 transition-transform flex items-center shadow"
            >
              Ekle
            </button>
          </div>

          <div className="space-y-2">
            {notices.map((n) => (
              <div
                key={n.id}
                className="p-3 rounded-2xl bg-yellow-950/20 border border-yellow-500/20 text-xs text-yellow-200 font-medium flex items-center justify-between"
              >
                <span>{n.content}</span>
                <span className="text-[10px] text-yellow-500 shrink-0 ml-2">
                  {n.author}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Dedicated bottom clearance spacer */}
      <div className="h-20 sm:h-24 w-full shrink-0 pointer-events-none" aria-hidden="true" />

      {/* MODAL: EDIT PARTY PLAN */}
      {isEditingPlan && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-white/20 rounded-3xl p-5 w-full max-w-sm shadow-2xl space-y-3">
            <h3 className="text-base font-black text-white pb-2 border-b border-white/10">
              Parti Detaylarını Düzenle
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-gray-400 block mb-1 font-bold">Parti Başlığı</label>
                <input
                  type="text"
                  value={editedPlan.title}
                  onChange={(e) => setEditedPlan({ ...editedPlan, title: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#bef264]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-gray-400 block mb-1 font-bold">Tarih</label>
                  <input
                    type="date"
                    value={editedPlan.date}
                    onChange={(e) => setEditedPlan({ ...editedPlan, date: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-[#bef264]"
                  />
                </div>
                <div>
                  <label className="text-gray-400 block mb-1 font-bold">Saat</label>
                  <input
                    type="time"
                    value={editedPlan.time}
                    onChange={(e) => setEditedPlan({ ...editedPlan, time: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-2.5 py-2 text-white focus:outline-none focus:border-[#bef264]"
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-bold">Mekan / Adres</label>
                <input
                  type="text"
                  value={editedPlan.location}
                  onChange={(e) => setEditedPlan({ ...editedPlan, location: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#bef264]"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-bold">Ev Sahibi</label>
                <input
                  type="text"
                  value={editedPlan.hostName}
                  onChange={(e) => setEditedPlan({ ...editedPlan, hostName: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#bef264]"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-bold">Parti Teması</label>
                <input
                  type="text"
                  value={editedPlan.theme}
                  onChange={(e) => setEditedPlan({ ...editedPlan, theme: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#bef264]"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-bold">Açıklama / Not</label>
                <textarea
                  rows={2}
                  value={editedPlan.description}
                  onChange={(e) => setEditedPlan({ ...editedPlan, description: e.target.value })}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#bef264]"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleSavePlan}
                className="flex-1 py-2.5 rounded-xl bg-[#bef264] text-black font-black text-xs active:scale-95 transition-transform flex items-center justify-center gap-1 shadow"
              >
                <Check className="w-4 h-4" />
                Kaydet
              </button>
              <button
                onClick={() => setIsEditingPlan(false)}
                className="px-4 py-2.5 rounded-xl bg-white/10 text-gray-300 font-bold text-xs hover:text-white"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW POLL */}
      {showAddPollModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111827] border border-white/20 rounded-3xl p-5 w-full max-w-sm shadow-2xl space-y-3">
            <h3 className="text-base font-black text-white pb-2 border-b border-white/10">
              Yeni Anket Başlat
            </h3>

            <div className="space-y-2 text-xs">
              <div>
                <label className="text-gray-400 block mb-1 font-bold">Soru</label>
                <input
                  type="text"
                  value={newPollQuestion}
                  onChange={(e) => setNewPollQuestion(e.target.value)}
                  placeholder="Örn: Akşam hangi oyunu oynayalım?"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#ec4899]"
                />
              </div>

              <div>
                <label className="text-gray-400 block mb-1 font-bold">
                  Seçenekler (Virgülle ayırın)
                </label>
                <textarea
                  rows={3}
                  value={newPollOptions}
                  onChange={(e) => setNewPollOptions(e.target.value)}
                  placeholder="Casus Kim, Tabu, Sessiz Sinema, Beş Saniye"
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#ec4899]"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleCreatePoll}
                className="flex-1 py-2.5 rounded-xl bg-[#ec4899] text-white font-black text-xs active:scale-95 transition-transform flex items-center justify-center gap-1 shadow"
              >
                <Check className="w-4 h-4" />
                Anketi Yayınla
              </button>
              <button
                onClick={() => setShowAddPollModal(false)}
                className="px-4 py-2.5 rounded-xl bg-white/10 text-gray-300 font-bold text-xs hover:text-white"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
