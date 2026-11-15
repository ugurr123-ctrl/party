import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Lock,
  Plus,
  Layers,
  FolderKanban,
  ShieldCheck,
  Brain,
  Flame,
  Smile,
  Zap,
  Edit3,
  Trash2,
  Clock,
  CheckCircle2,
  QrCode,
  RotateCcw,
  X,
  Share2,
  Copy,
  Download
} from 'lucide-react';
import { CustomCard, CustomCardType, SpicinessLevel } from '../types';
import { DEFAULT_CUSTOM_DECK } from '../data/partyData';
import { soundEngine } from '../utils/audio';

interface CustomDeckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const CustomDeckModal: React.FC<CustomDeckModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  // Load custom deck from localStorage or defaults
  const [deck, setDeck] = useState<CustomCard[]>(() => {
    try {
      const saved = localStorage.getItem('parti_kutusu_custom_deck');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // Fallback
    }
    return DEFAULT_CUSTOM_DECK;
  });

  // Creator state
  const [cardType, setCardType] = useState<CustomCardType>('truth');
  const [spiciness, setSpiciness] = useState<SpicinessLevel>('mild');
  const [cardText, setCardText] = useState('');
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [isAddingEffect, setIsAddingEffect] = useState(false);

  // Filter state
  const [activeFilter, setActiveFilter] = useState<'all' | 'truth' | 'dare' | 'funny'>('all');

  // Share / Import Modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [importText, setImportText] = useState('');

  // Persist deck to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('parti_kutusu_custom_deck', JSON.stringify(deck));
    } catch {
      // Ignore
    }
  }, [deck]);

  if (!isOpen) return null;

  // Filtered Cards
  const filteredCards = deck.filter((c) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'truth') return c.type === 'truth';
    if (activeFilter === 'dare') return c.type === 'dare' || c.type === 'task';
    if (activeFilter === 'funny') return c.type === 'funny';
    return true;
  });

  // Dynamic counts
  const totalCount = deck.length;
  const truthCount = deck.filter((c) => c.type === 'truth').length;
  const dareCount = deck.filter((c) => c.type === 'dare' || c.type === 'task').length;
  const funnyCount = deck.filter((c) => c.type === 'funny').length;

  // Type details for preview
  const getTypeInfo = (t: CustomCardType) => {
    switch (t) {
      case 'truth':
        return {
          title: 'Doğruluk',
          badgeText: 'Doğruluk (Soru)',
          colorClass: 'text-cyan-400',
          bgClass: 'bg-cyan-500/20',
          icon: <Brain className="w-4 h-4 text-cyan-400" />
        };
      case 'dare':
        return {
          title: 'Cesaret',
          badgeText: 'Cesaret (Meydan Okuma)',
          colorClass: 'text-[#f751a1]',
          bgClass: 'bg-pink-500/20',
          icon: <Flame className="w-4 h-4 text-[#f751a1]" />
        };
      case 'funny':
        return {
          title: 'Komik Cevap',
          badgeText: 'Komik Cevap',
          colorClass: 'text-[#bef264]',
          bgClass: 'bg-lime-500/20',
          icon: <Smile className="w-4 h-4 text-[#bef264]" />
        };
      case 'task':
        return {
          title: 'Hızlı Görev',
          badgeText: 'Hızlı Görev ⚡',
          colorClass: 'text-purple-400',
          bgClass: 'bg-purple-500/20',
          icon: <Zap className="w-4 h-4 text-purple-400" />
        };
    }
  };

  const getSpicyLabel = (lvl: SpicinessLevel) => {
    switch (lvl) {
      case 'mild':
        return { label: 'Herkes İçin 🟢', badge: 'Samimi 💬', color: 'text-[#bef264]' };
      case 'medium':
        return { label: 'Hafif Çılgın 🟡', badge: 'Çılgın 🟡', color: 'text-amber-400' };
      case 'hot':
        return { label: 'Cesur (+18) 🔥', badge: 'Cesur 🔥', color: 'text-[#f751a1]' };
    }
  };

  // Add or Update Card
  const handleSaveCard = () => {
    if (!cardText.trim()) {
      soundEngine.playBuzzer();
      onShowToast('Lütfen kart içeriğini boş bırakmayın!');
      return;
    }

    soundEngine.playVictory();
    soundEngine.triggerHaptic('success');
    setIsAddingEffect(true);

    if (editingCardId) {
      // Edit existing
      setDeck((prev) =>
        prev.map((c) =>
          c.id === editingCardId
            ? {
                ...c,
                type: cardType,
                spiciness,
                text: cardText.trim(),
                timestamp: 'Şimdi güncellendi'
              }
            : c
        )
      );
      onShowToast('Kart başarıyla güncellendi! ✨');
      setEditingCardId(null);
    } else {
      // Add new card
      const newCard: CustomCard = {
        id: `cd-${Date.now()}`,
        type: cardType,
        spiciness,
        text: cardText.trim(),
        timestamp: 'Yeni eklendi',
        addedBy: 'Sen',
        isActive: true
      };
      setDeck((prev) => [newCard, ...prev]);
      onShowToast('Yeni kart desteye eklendi! 🎉');
    }

    setTimeout(() => {
      setIsAddingEffect(false);
      setCardText('');
    }, 1000);
  };

  // Delete Card
  const handleDeleteCard = (id: string) => {
    soundEngine.playClick();
    soundEngine.triggerHaptic('tap');
    setDeck((prev) => prev.filter((c) => c.id !== id));
    onShowToast('Kart desteden çıkarıldı.');
  };

  // Start Editing Card
  const handleEditCard = (card: CustomCard) => {
    soundEngine.playClick();
    setEditingCardId(card.id);
    setCardType(card.type);
    setSpiciness(card.spiciness);
    setCardText(card.text);
    // Scroll smoothly to top
    const topEl = document.getElementById('card-creator-box');
    if (topEl) topEl.scrollIntoView({ behavior: 'smooth' });
  };

  // Reset all to curated defaults
  const handleResetDeck = () => {
    soundEngine.playClick();
    if (window.confirm('Tüm özel kartlar varsayılan 32 kartlık orijinal desteye sıfırlansın mı?')) {
      setDeck(DEFAULT_CUSTOM_DECK);
      localStorage.setItem('parti_kutusu_custom_deck', JSON.stringify(DEFAULT_CUSTOM_DECK));
      soundEngine.playSuccess();
      onShowToast('Özel deste varsayılan haline sıfırlandı! 🔄');
    }
  };

  // Copy deck as JSON
  const handleCopyDeck = () => {
    soundEngine.playClick();
    const dataStr = JSON.stringify(deck, null, 2);
    navigator.clipboard.writeText(dataStr).then(() => {
      onShowToast('Tüm kartlar panoya kopyalandı! 📋');
    });
  };

  // Import cards from text/JSON
  const handleImportDeck = () => {
    if (!importText.trim()) return;
    try {
      const parsed = JSON.parse(importText);
      if (Array.isArray(parsed) && parsed.length > 0) {
        setDeck(parsed);
        setIsShareModalOpen(false);
        setImportText('');
        soundEngine.playVictory();
        onShowToast(`${parsed.length} adet kart başarıyla içe aktarıldı! ✨`);
        return;
      }
    } catch {
      // If it's plain text with lines
      const lines = importText
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 3);
      if (lines.length > 0) {
        const newCards: CustomCard[] = lines.map((line, idx) => ({
          id: `imp-${Date.now()}-${idx}`,
          type: line.includes('?') ? 'truth' : 'dare',
          spiciness: 'medium',
          text: line,
          timestamp: 'İçe aktarıldı',
          addedBy: 'Arkadaş Paketi',
          isActive: true
        }));
        setDeck((prev) => [...newCards, ...prev]);
        setIsShareModalOpen(false);
        setImportText('');
        soundEngine.playVictory();
        onShowToast(`${newCards.length} kart desteye eklendi! ✨`);
        return;
      }
    }
    soundEngine.playBuzzer();
    onShowToast('Geçersiz kart formatı!');
  };

  const currentTypeInfo = getTypeInfo(cardType);
  const currentSpicyInfo = getSpicyLabel(spiciness);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2 select-none">
      <div className="relative w-full max-w-md h-[88dvh] sm:h-[92vh] max-h-[840px] bg-[#0a0e18] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        {/* ================= FIXED TOP HEADER ================= */}
        <header className="w-full pt-safe bg-[#0a0e18]/90 backdrop-blur-xl border-b border-white/10 shrink-0">
          <div className="h-16 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#f751a1] to-purple-600 flex items-center justify-center text-white shadow-[0_0_12px_rgba(247,81,161,0.5)] shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-base text-white tracking-tight leading-none truncate">
                    Özel Parti Destesi
                  </h1>
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shrink-0" />
                </div>
                <span className="text-[10px] text-[#f751a1] tracking-wider uppercase font-mono mt-1 truncate">
                  {deck.length} Özel Kart • Cihazda Saklanır
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
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
        <div className="flex-1 overflow-y-auto px-4 py-3 pb-16 flex flex-col gap-3.5 no-scrollbar">

        {/* Brand Banner */}
        <div className="flex flex-col gap-1 mb-4">
          <div className="flex items-center justify-between gap-1 flex-wrap">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#571bc1]/30 text-[#d0bcff]">
              <Sparkles className="w-3.5 h-3.5" />
              <span className="text-[10px] font-black tracking-widest uppercase">
                ÖZEL DESTE YÖNETİCİSİ
              </span>
            </div>
            <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1E293B] text-gray-300">
              <Lock className="w-3 h-3 text-[#10B981]" />
              <span className="text-[11px] font-bold">Cihazda Saklanır • Gizli</span>
            </div>
          </div>
          <h1 className="text-2xl font-black text-white mt-1 flex items-center gap-2">
            Kendi Kurallarını Yaz! ✍️
          </h1>
          <p className="text-xs text-gray-400 leading-snug">
            Grubunuzun özel şakalarını, cesaret görevlerini ve sorularını desteye ekleyin.
          </p>
        </div>

        {/* Quick Stats Row (Card Bento) */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="flex flex-col p-3 rounded-2xl bg-[#111827] border border-white/5 shadow-lg shadow-black/40 relative overflow-hidden group">
            <div className="absolute -right-3 -top-3 w-12 h-12 bg-pink-500/10 rounded-full blur-md" />
            <div className="flex items-center gap-1 text-[#f751a1] mb-1">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-xl text-white leading-none font-black">{totalCount}</span>
            <span className="text-[11px] font-bold text-gray-400 mt-1 truncate">Özel Kart</span>
          </div>

          <div className="flex flex-col p-3 rounded-2xl bg-[#111827] border border-white/5 shadow-lg shadow-black/40 relative overflow-hidden">
            <div className="absolute -right-3 -top-3 w-12 h-12 bg-purple-500/10 rounded-full blur-md" />
            <div className="flex items-center gap-1 text-[#d0bcff] mb-1">
              <FolderKanban className="w-4 h-4" />
            </div>
            <span className="text-xl text-white leading-none font-black">3</span>
            <span className="text-[11px] font-bold text-gray-400 mt-1 truncate">Kategori</span>
          </div>

          <div className="flex flex-col p-3 rounded-2xl bg-[#111827] border border-white/5 shadow-lg shadow-black/40 relative overflow-hidden">
            <div className="absolute -right-3 -top-3 w-12 h-12 bg-lime-500/10 rounded-full blur-md" />
            <div className="flex items-center gap-1 text-[#bef264] mb-1">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <span className="text-xs text-white font-black leading-tight line-clamp-1">Hesapsız</span>
            <span className="text-[11px] text-[#10B981] font-bold mt-1 truncate flex items-center gap-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" /> Yerel Kasa
            </span>
          </div>
        </div>

        {/* Interactive Card Creator Section */}
        <div
          id="card-creator-box"
          className="flex flex-col p-4 rounded-3xl bg-[#111827] border border-white/10 shadow-xl shadow-black/60 relative overflow-hidden mb-4"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Plus className="w-5 h-5 text-[#f751a1]" />
              <span className="text-sm font-black text-white">
                {editingCardId ? 'Kartı Düzenle' : 'Yeni Kart Oluştur'}
              </span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#1E293B] text-gray-300">
              Önizleme Canlı
            </span>
          </div>

          {/* Type Selector Segment */}
          <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[#0a0e18] mb-3">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setCardType('truth');
              }}
              className={`py-2 px-1 rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition-all ${
                cardType === 'truth'
                  ? 'bg-[#1E293B] text-cyan-400 shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Brain className="w-4 h-4" />
              <span className="truncate">Doğruluk</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setCardType('dare');
              }}
              className={`py-2 px-1 rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition-all ${
                cardType === 'dare'
                  ? 'bg-[#1E293B] text-[#f751a1] shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Flame className="w-4 h-4" />
              <span className="truncate">Cesaret</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setCardType('funny');
              }}
              className={`py-2 px-1 rounded-xl font-bold text-xs flex flex-col items-center gap-1 transition-all ${
                cardType === 'funny'
                  ? 'bg-[#1E293B] text-[#bef264] shadow-sm'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Smile className="w-4 h-4" />
              <span className="truncate">Komik Cevap</span>
            </button>
          </div>

          {/* Glowing Live Card Preview Box */}
          <div className="relative rounded-2xl p-4 bg-gradient-to-br from-[#1E293B] via-[#111827] to-[#262a35] border border-white/10 shadow-inner overflow-hidden mb-3">
            <div className="absolute -right-10 -bottom-10 w-32 h-32 rounded-full bg-pink-500/10 blur-xl pointer-events-none" />
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${currentTypeInfo.bgClass} ${currentTypeInfo.colorClass}`}
              >
                {currentTypeInfo.icon}
                <span>{currentTypeInfo.badgeText}</span>
              </span>
              <span className={`text-[11px] font-black ${currentSpicyInfo.color}`}>
                {currentSpicyInfo.label}
              </span>
            </div>

            {/* Live Editable Text Area */}
            <div className="relative w-full">
              <textarea
                value={cardText}
                maxLength={140}
                onChange={(e) => setCardText(e.target.value)}
                placeholder="Kart içeriğini buraya yazın... Örnek: 'Gruptan birinin taklidini 30 saniye boyunca yap!'"
                rows={3}
                className="w-full bg-[#0a0e18]/80 focus:bg-[#0a0e18] text-white placeholder-gray-500 rounded-xl p-3 text-xs leading-relaxed outline-none resize-none transition-colors border border-transparent focus:border-white/20"
              />
            </div>

            <div className="flex items-center justify-between mt-2 pt-1 text-gray-400 text-[11px]">
              <span className="flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" /> Canlı Kart Görünümü
              </span>
              <span className="font-mono">{cardText.length}/140</span>
            </div>
          </div>

          {/* Spiciness / Rating Selection */}
          <div className="flex flex-col gap-1.5 mb-4">
            <span className="text-[10px] text-gray-400 uppercase font-black tracking-wider">
              ACILIK & ZORLUK SEVİYESİ
            </span>
            <div className="grid grid-cols-3 gap-2">
              {[
                { lvl: 'mild' as SpicinessLevel, label: 'Herkes İçin 🟢', color: 'text-[#bef264]' },
                { lvl: 'medium' as SpicinessLevel, label: 'Hafif Çılgın 🟡', color: 'text-amber-400' },
                { lvl: 'hot' as SpicinessLevel, label: 'Cesur (+18) 🔥', color: 'text-[#f751a1]' }
              ].map((s) => {
                const isSelected = spiciness === s.lvl;
                return (
                  <button
                    key={s.lvl}
                    type="button"
                    onClick={() => {
                      soundEngine.playClick();
                      setSpiciness(s.lvl);
                    }}
                    className={`py-2 px-1 rounded-full text-[11px] font-bold flex items-center justify-center gap-1 transition-all ${
                      isSelected
                        ? `bg-[#1E293B] border border-white/20 ${s.color} shadow`
                        : 'bg-[#0a0e18] text-gray-400 hover:text-white'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* CTA Add Card with Neon Pop */}
          <button
            type="button"
            onClick={handleSaveCard}
            className={`w-full h-12 rounded-full text-white font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg ${
              isAddingEffect
                ? 'bg-[#10B981] shadow-[0_0_24px_rgba(16,185,129,0.5)]'
                : 'bg-gradient-to-r from-[#f751a1] via-pink-600 to-[#f751a1] shadow-[0_0_24px_rgba(247,81,161,0.45)] hover:brightness-105'
            }`}
          >
            {isAddingEffect ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-white animate-bounce" />
                <span>Kaydedildi! ✨</span>
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                <span>{editingCardId ? 'Güncelle & Kaydet' : '+ Desteye Ekle'}</span>
              </>
            )}
          </button>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-col gap-2 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-black text-white">Kayıtlı Özel Kartlar</span>
            <span className="text-[11px] font-bold text-cyan-400 font-mono">
              {filteredCards.length} Kart Hazır
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setActiveFilter('all');
              }}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeFilter === 'all'
                  ? 'bg-[#f751a1] text-white shadow-[0_0_12px_rgba(247,81,161,0.4)]'
                  : 'bg-[#111827] text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              Tümü ({totalCount})
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setActiveFilter('truth');
              }}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeFilter === 'truth'
                  ? 'bg-cyan-500 text-neutral-950 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                  : 'bg-[#111827] text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              Doğruluk ({truthCount})
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setActiveFilter('dare');
              }}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeFilter === 'dare'
                  ? 'bg-[#f751a1] text-white shadow-[0_0_12px_rgba(247,81,161,0.4)]'
                  : 'bg-[#111827] text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              Cesaret & Görev ({dareCount})
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setActiveFilter('funny');
              }}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                activeFilter === 'funny'
                  ? 'bg-[#bef264] text-neutral-950 shadow-[0_0_12px_rgba(190,242,100,0.4)]'
                  : 'bg-[#111827] text-gray-400 hover:text-white border border-white/5'
              }`}
            >
              Komik Başlangıç ({funnyCount})
            </button>
          </div>
        </div>

        {/* Saved Custom Cards List */}
        <div className="flex flex-col gap-2.5 mb-5">
          {filteredCards.length === 0 ? (
            <div className="p-8 rounded-2xl bg-[#111827] border border-white/5 text-center text-gray-400 text-xs">
              Bu kategoride henüz özel kart bulunmuyor. Yukarıdan kolayca yeni kart ekleyebilirsiniz!
            </div>
          ) : (
            filteredCards.map((card) => {
              const tInfo = getTypeInfo(card.type);
              const sInfo = getSpicyLabel(card.spiciness);
              return (
                <div
                  key={card.id}
                  className="flex flex-col p-4 rounded-2xl bg-[#111827] border border-white/10 shadow-md relative group overflow-hidden transition-all duration-200 hover:border-white/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1 ${tInfo.bgClass} ${tInfo.colorClass}`}
                      >
                        {tInfo.icon} {tInfo.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-[#1E293B] text-gray-200 font-bold text-[11px]">
                        {sInfo.badge}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleEditCard(card)}
                        className="w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-cyan-400 active:scale-90"
                        title="Düzenle"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteCard(card.id)}
                        className="w-8 h-8 rounded-full hover:bg-red-500/20 flex items-center justify-center transition-colors text-red-400 active:scale-90"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-white font-medium pr-2 leading-relaxed">
                    "{card.text}"
                  </p>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5 text-gray-400 text-[10px]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      {card.timestamp || 'Kayıtlı'}
                    </span>
                    <span className="text-[#bef264] flex items-center gap-0.5 font-bold">
                      <CheckCircle2 className="w-3 h-3 text-[#bef264]" /> Aktif
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Deck Management Action Cards */}
        <div className="flex flex-col gap-2.5 mt-auto">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setIsShareModalOpen(true);
            }}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#1E293B]/80 hover:bg-[#1E293B] active:scale-[0.99] text-white text-xs font-bold flex items-center justify-between transition-all border border-white/10"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                <QrCode className="w-5 h-5" />
              </div>
              <div className="flex flex-col text-left">
                <span className="font-bold text-white text-xs">Toplu Paket İçe Aktar & Paylaş</span>
                <span className="text-[11px] text-gray-400">
                  Arkadaşının kodunu yapıştır veya desteni paylaş
                </span>
              </div>
            </div>
            <Share2 className="w-4 h-4 text-gray-400" />
          </button>

          <button
            type="button"
            onClick={handleResetDeck}
            className="w-full py-3 px-4 rounded-2xl bg-[#111827] hover:bg-red-950/40 border border-white/5 hover:border-red-500/30 active:scale-[0.99] text-red-400 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Tüm Özel Kartları Sıfırla (32 Varsayılan)</span>
          </button>
        </div>

        {/* Share & Import Sub-Modal */}
        {isShareModalOpen && (
          <div className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-[#111827] border border-white/20 rounded-3xl p-5 w-full max-w-sm shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-sm font-black text-white">Deste Paylaş & İçe Aktar</h3>
                </div>
                <button
                  onClick={() => setIsShareModalOpen(false)}
                  className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-[11px] text-gray-300 font-bold block">
                  1. Arkadaşlarınla Paylaş (Deste JSON):
                </span>
                <button
                  type="button"
                  onClick={handleCopyDeck}
                  className="w-full py-2.5 px-3 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 active:scale-95 transition-all"
                >
                  <Copy className="w-4 h-4" />
                  <span>Tüm Desteyi Kopyala ({deck.length} Kart)</span>
                </button>
              </div>

              <div className="space-y-1.5 pt-2 border-t border-white/10">
                <span className="text-[11px] text-gray-300 font-bold block">
                  2. Arkadaşının Kartlarını Yapıştır:
                </span>
                <textarea
                  value={importText}
                  onChange={(e) => setImportText(e.target.value)}
                  placeholder="Kopyalanan JSON kodunu veya her satıra bir kart gelecek şekilde metin yapıştırın..."
                  rows={4}
                  className="w-full bg-[#0a0e18] border border-white/10 rounded-xl p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 resize-none font-mono"
                />
                <button
                  type="button"
                  onClick={handleImportDeck}
                  disabled={!importText.trim()}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#bef264] text-neutral-950 text-xs font-black flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-40"
                >
                  <Download className="w-4 h-4" />
                  <span>Desteye Aktar</span>
                </button>
              </div>
            </div>
          </div>
        )}

          {/* Bottom clearance spacer */}
          <div className="h-8 w-full shrink-0 pointer-events-none" aria-hidden="true" />
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
            <span>Kaydet & Kapat</span>
          </button>
        </div>
      </div>
    </div>
  );
};
