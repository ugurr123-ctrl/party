import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Crown,
  Check,
  Sparkles,
  Zap,
  Gift,
  Flame,
  Award,
  Users,
  ShieldCheck,
  ArrowRight,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { soundEngine } from '../utils/audio';
import {
  vipManager,
  VIPStatus,
  VIPPlanType,
  VIP_PERKS_LIST,
  VALID_PROMO_CODES
} from '../utils/vipManager';
import { inAppPurchaseService, STORE_PRODUCTS } from '../services/inAppPurchaseService';
import { GAME_CATALOG } from '../data/partyData';

interface VIPModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
  onLaunchGame?: (gameId: string) => void;
}

export const VIPModal: React.FC<VIPModalProps> = ({ isOpen, onClose, onShowToast, onLaunchGame }) => {
  const [vipStatus, setVipStatus] = useState<VIPStatus>(() => vipManager.getStatus());
  const [selectedPlan, setSelectedPlan] = useState<VIPPlanType>('lifetime');
  const [promoInput, setPromoInput] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [promoSuccess, setPromoSuccess] = useState<string | null>(null);
  const [isActivating, setIsActivating] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [showPlanManager, setShowPlanManager] = useState(false);

  // Sync VIP status on open & listen to changes
  useEffect(() => {
    if (isOpen) {
      setVipStatus(vipManager.getStatus());
      setPromoError(null);
      setPromoSuccess(null);
    }
    const unsub = vipManager.subscribe((newStatus) => {
      setVipStatus(newStatus);
    });
    return unsub;
  }, [isOpen]);

  if (!isOpen) return null;

  // Real StoreKit & Google Play In-App Purchase Flow
  const handleActivatePlan = async (plan: VIPPlanType) => {
    setIsActivating(true);
    soundEngine.playClick();
    soundEngine.triggerHaptic('touch');

    const productMap: Partial<Record<VIPPlanType, string>> = {
      weekly: 'com.partybox.app.vip.weekly',
      monthly: 'com.partybox.app.vip.monthly',
      yearly: 'com.partybox.app.vip.monthly',
      lifetime: 'com.partybox.app.vip.lifetime'
    };
    const productId = productMap[plan] || 'com.partybox.app.vip.lifetime';

    try {
      const res = await inAppPurchaseService.purchase(productId);
      if (res.success) {
        const activated = vipManager.getStatus();
        setVipStatus(activated);
        soundEngine.playVictory();
        soundEngine.triggerHaptic('win');

        try {
          confetti({
            particleCount: 140,
            spread: 85,
            origin: { y: 0.5 },
            colors: ['#f59e0b', '#bef264', '#ffffff', '#ec4899']
          });
        } catch {
          // ignore
        }

        onShowToast(`👑 ${activated.planName} Satın Alındı! (Sipariş: ${res.orderId})`);
      } else {
        soundEngine.playBuzzer();
        onShowToast(res.errorMessage || 'Satın alma tamamlanamadı.');
      }
    } catch (err) {
      console.error(err);
      soundEngine.playBuzzer();
      onShowToast('Ödeme işlemi sırasında bir hata oluştu.');
    } finally {
      setIsActivating(false);
    }
  };

  // Restore Purchases (Mandatory Store Requirement)
  const handleRestorePurchases = async () => {
    setIsRestoring(true);
    soundEngine.playClick();
    onShowToast('⏳ Önceki satın alımlar mağazadan sorgulanıyor...');

    try {
      const res = await inAppPurchaseService.restorePurchases();
      if (res.restored) {
        soundEngine.playVictory();
        setVipStatus(vipManager.getStatus());
        onShowToast(res.message);
      } else {
        soundEngine.playBuzzer();
        onShowToast(res.message);
      }
    } catch {
      onShowToast('Satın alımlar sorgulanırken hata oluştu.');
    } finally {
      setIsRestoring(false);
    }
  };

  // Promo Code Handler
  const handleApplyPromo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setPromoError(null);
    setPromoSuccess(null);

    if (!promoInput.trim()) {
      setPromoError('Lütfen bir promosyon kodu girin.');
      return;
    }

    const res = vipManager.redeemCode(promoInput);
    if (res.success && res.status) {
      setPromoSuccess(res.message);
      setVipStatus(res.status);
      setPromoInput('');
      soundEngine.playVictory();
      soundEngine.triggerHaptic('win');

      try {
        confetti({
          particleCount: 140,
          spread: 90,
          origin: { y: 0.5 },
          colors: ['#bef264', '#f59e0b', '#d946ef']
        });
      } catch {
        // ignore
      }

      onShowToast(res.message);
    } else {
      setPromoError(res.message);
      soundEngine.playBuzzer();
      soundEngine.triggerHaptic('alert');
    }
  };

  // Reset VIP (Test mode)
  const handleResetVIP = () => {
    soundEngine.playClick();
    const standard = vipManager.reset();
    setVipStatus(standard);
    setPromoSuccess(null);
    setPromoError(null);
    onShowToast('VIP Üyeliği sıfırlandı (Standart moda geçildi).');
  };

  const isVIP = vipStatus.isVIP;
  const vipGames = GAME_CATALOG.filter((g) => g.isVIP);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2 select-none font-body-md text-on-surface antialiased">
      <div className="relative w-full max-w-md h-[88dvh] sm:h-[92vh] max-h-[840px] bg-[#0a0e18] border-2 border-amber-500/40 rounded-3xl overflow-hidden flex flex-col shadow-[0_0_50px_rgba(245,158,11,0.25)]">
        
        {/* ================= FIXED TOP HEADER ================= */}
        <header className="w-full pt-safe bg-[#0a0e18]/95 backdrop-blur-xl border-b border-amber-500/20 shrink-0">
          <div className="h-16 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-200 text-black flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.5)] shrink-0 animate-pulse">
                <Crown className="w-5 h-5 fill-black" />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-black text-base text-white tracking-tight leading-none truncate">
                    VIP Parti Kulübü
                  </h1>
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                </div>
                <span className="text-[10px] text-amber-300 tracking-wider uppercase font-mono mt-1 truncate font-bold">
                  Sınırsız Parti Gücü &amp; Özel Deste
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  onClose();
                }}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
                title="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* ================= MAIN SCROLLABLE CONTENT ================= */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3.5 sm:px-4 py-3 pb-16 flex flex-col gap-3.5 no-scrollbar">
          
          {/* ================= LIVE STATUS CARD ================= */}
          {isVIP ? (
            <div className="shrink-0 relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500/25 via-[#1a150c] to-[#0f1422] border-2 border-amber-400 p-4 sm:p-5 shadow-[0_0_35px_rgba(245,158,11,0.35)] flex flex-col gap-3">
              <div className="absolute -top-12 -right-12 w-44 h-44 bg-amber-400/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-yellow-500/15 rounded-full blur-2xl pointer-events-none" />

              {/* Status Header Row */}
              <div className="flex items-center justify-between gap-2 z-10 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap min-w-0">
                  <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black text-xs font-black uppercase tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.5)] shrink-0 flex items-center gap-1.5">
                    <Crown className="w-3.5 h-3.5 fill-black" />
                    <span>AKTİF VIP ÜYE</span>
                  </span>
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1 shrink-0 bg-amber-500/15 border border-amber-400/40 px-2.5 py-0.5 rounded-full shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span>Tam Yetki Açık</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleResetVIP}
                  className="text-[11px] text-gray-400 hover:text-red-400 underline shrink-0 cursor-pointer transition-colors"
                  title="Test amaçlı üyeliği sıfırla"
                >
                  Üyeliği Sıfırla
                </button>
              </div>

              {/* VIP Plan Title & Details */}
              <div className="z-10 my-0.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                    <span>{vipStatus.planName}</span>
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-mono font-bold flex items-center gap-1 shrink-0">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Aktif &amp; Sınırsız</span>
                  </span>
                </div>
                <p className="text-xs text-amber-100/90 mt-1 leading-relaxed">
                  Tüm VIP oyun modları, +100 ateşli soru/ceza kartı, turnuva şampiyonası ve neon efektler hesabınızda tam yetkiyle açık!
                </p>
              </div>

              {/* 4-Item Unlocked Perks Bento Grid */}
              <div className="grid grid-cols-2 gap-2 z-10">
                <div className="p-2.5 rounded-2xl bg-black/50 border border-amber-500/30 flex items-center gap-2 shadow-inner">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 text-base">
                    🎮
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-mono text-gray-400 uppercase">VIP Oyunlar</span>
                    <span className="text-xs font-black text-white truncate">13 Oyun Açık ✅</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-black/50 border border-amber-500/30 flex items-center gap-2 shadow-inner">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 text-base">
                    🔥
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-mono text-gray-400 uppercase">Özel Deste</span>
                    <span className="text-xs font-black text-white truncate">+100 Kart Açık ✅</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-black/50 border border-amber-500/30 flex items-center gap-2 shadow-inner">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 text-base">
                    🏆
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-mono text-gray-400 uppercase">Şampiyona</span>
                    <span className="text-xs font-black text-white truncate">5 Tur Turnuva ✅</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-2xl bg-black/50 border border-amber-500/30 flex items-center gap-2 shadow-inner">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 text-base">
                    👥
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-[10px] font-mono text-gray-400 uppercase">Masa Limiti</span>
                    <span className="text-xs font-black text-white truncate">Sınırsız Oyuncu ✅</span>
                  </div>
                </div>
              </div>

              {/* Promo Code Info (if used) */}
              {vipStatus.promoCodeUsed && (
                <div className="z-10 flex items-center gap-2 text-xs text-gray-200 bg-black/60 px-3 py-2 rounded-2xl w-fit border border-amber-400/30">
                  <Gift className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Kullanılan Hediye Kodu: <strong className="text-amber-300 font-mono tracking-wider font-black">{vipStatus.promoCodeUsed}</strong></span>
                </div>
              )}
            </div>
          ) : (
            <div className="shrink-0 relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1E293B] via-[#111827] to-[#1c1810] border border-amber-500/30 p-4 shadow-xl flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-gray-300 text-[10px] font-bold uppercase tracking-wider">
                  Mevcut Plan: Standart
                </span>
                <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 fill-amber-400" />
                  VIP Kilidi Bekleniyor
                </span>
              </div>

              <div>
                <h2 className="text-lg font-black text-white">Partiyi VIP Seviyeye Taşı!</h2>
                <p className="text-xs text-gray-300 mt-0.5 leading-relaxed">
                  Aşağıdaki planlardan birini seç veya ücretsiz hediye kodunu girerek tüm özel modları ve kartları aç!
                </p>
              </div>
            </div>
          )}

          {/* ================= MEMBERSHIP PLANS & PROMO ENGINE ================= */}
          {(!isVIP || showPlanManager) && (
            <div className="flex flex-col gap-3.5 shrink-0 animate-in fade-in zoom-in-95 duration-200">
              {/* Membership Plans Picker */}
              <div className="flex flex-col gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5 px-1">
                  <Crown className="w-3.5 h-3.5 fill-amber-400" />
                  {isVIP ? 'Planı Değiştir / Süre Güncelle' : 'Üyelik Planını Seç'}
                </span>

                <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                  {/* Plan 1: 1 Aylık */}
                  <button
                    type="button"
                    onClick={() => setSelectedPlan('monthly')}
                    className={`p-2 sm:p-2.5 rounded-2xl border text-center transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between gap-1 relative ${
                      selectedPlan === 'monthly'
                        ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                        : 'bg-[#111827] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className="text-[10px] sm:text-[11px] font-bold text-gray-300 truncate">1 Aylık</span>
                    <div className="my-0.5">
                      <span className="text-xs sm:text-base font-black text-white font-mono block">49,99 ₺</span>
                      <span className="text-[8px] sm:text-[9px] text-gray-400 block truncate">30 Gün</span>
                    </div>
                    <span className="text-[8px] sm:text-[9px] text-gray-400 truncate">Standart</span>
                  </button>

                  {/* Plan 2: 1 Yıllık (Popüler) */}
                  <button
                    type="button"
                    onClick={() => setSelectedPlan('yearly')}
                    className={`p-2 sm:p-2.5 rounded-2xl border text-center transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between gap-1 relative overflow-hidden ${
                      selectedPlan === 'yearly'
                        ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.35)] ring-1 ring-amber-400'
                        : 'bg-[#111827] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-400 to-yellow-500 text-black px-1 py-0.2 text-[7px] font-black uppercase tracking-wider rounded-bl shadow">
                      %50 ⭐
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-bold text-amber-300 truncate">1 Yıllık</span>
                    <div className="my-0.5">
                      <span className="text-xs sm:text-base font-black text-white font-mono block">299,99 ₺</span>
                      <span className="text-[8px] sm:text-[9px] text-amber-200 block truncate">365 Gün</span>
                    </div>
                    <span className="text-[8px] sm:text-[9px] text-amber-400 font-bold truncate">En Çok Tercih</span>
                  </button>

                  {/* Plan 3: Ömür Boyu */}
                  <button
                    type="button"
                    onClick={() => setSelectedPlan('lifetime')}
                    className={`p-2 sm:p-2.5 rounded-2xl border text-center transition-all active:scale-[0.98] cursor-pointer flex flex-col justify-between gap-1 relative ${
                      selectedPlan === 'lifetime'
                        ? 'bg-amber-500/15 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.25)]'
                        : 'bg-[#111827] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className="text-[10px] sm:text-[11px] font-bold text-gray-300 truncate">Ömür Boyu</span>
                    <div className="my-0.5">
                      <span className="text-xs sm:text-base font-black text-white font-mono block">499,99 ₺</span>
                      <span className="text-[8px] sm:text-[9px] text-gray-400 block truncate">Sınırsız</span>
                    </div>
                    <span className="text-[8px] sm:text-[9px] text-gray-400 truncate">Ebedi Pass</span>
                  </button>
                </div>

                {/* Store Payment Status Notice */}
                <div className={`p-2.5 rounded-xl text-[11px] leading-relaxed border ${
                  inAppPurchaseService.isNativeDevice()
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                }`}>
                  {inAppPurchaseService.isNativeDevice() ? (
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Resmi Mağaza Faturalandırması: Ödeme doğrudan Google Play veya Apple App Store hesabınızdan tahsil edilir.</span>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <span><strong>Web Önizlemesi:</strong> Google Play &amp; App Store ödemeleri sadece gerçek Android ve iOS cihazlarda aktiftir. Web ortamında test etmek için aşağıdaki <strong>Ücretsiz Promosyon Kodu</strong> alanına dokunun.</span>
                    </div>
                  )}
                </div>

                {/* Real Store Billing Activation Button */}
                <button
                  type="button"
                  disabled={isActivating}
                  onClick={() => handleActivatePlan(selectedPlan)}
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:brightness-110 active:scale-95 text-black font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(245,158,11,0.4)] transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 fill-black" />
                  <span>
                    {isActivating
                      ? 'Mağazaya Bağlanılıyor...'
                      : inAppPurchaseService.isNativeDevice()
                      ? `Google Play / App Store ile Satın Al (${selectedPlan === 'lifetime' ? '149,99 ₺' : selectedPlan === 'yearly' ? '299,99 ₺' : '49,99 ₺'})`
                      : `Mağaza Satın Alımı Başlat (${selectedPlan === 'lifetime' ? 'Ömür Boyu' : selectedPlan === 'yearly' ? 'Yıllık' : 'Aylık'})`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                {/* Restore Purchases Button (Mandatory for App Store & Google Play) */}
                <button
                  type="button"
                  disabled={isRestoring}
                  onClick={handleRestorePurchases}
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-white/5"
                >
                  <RotateCcw className={`w-3.5 h-3.5 text-amber-400 ${isRestoring ? 'animate-spin' : ''}`} />
                  <span>{isRestoring ? 'Mağaza Sorgulanıyor...' : 'Satın Alımları Geri Yükle (Restore Purchases)'}</span>
                </button>

                {/* Official Store Subscription Disclosure (Apple Guideline 3.1.2) */}
                <p className="text-[10px] text-gray-400 text-center leading-relaxed px-1">
                  Ödemeler Google Play & App Store hesabınız üzerinden güvenle tahsil edilir. Abonelikler dönem bitiminden en az 24 saat önce iptal edilmediği sürece otomatik yenilenir; dilediğiniz an mağaza abonelik ayarlarınızdan iptal edebilirsiniz.
                </p>
              </div>

              {/* Promo Code Redeem Section */}
              <div className="bg-[#111827] border border-white/10 rounded-2xl p-3.5 flex flex-col gap-2.5 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-gray-200 flex items-center gap-1.5">
                    <Gift className="w-4 h-4 text-amber-400" />
                    Ücretsiz Promosyon Kodu
                  </span>
                  <span className="text-[10px] text-[#bef264] font-bold">Hediye Pass</span>
                </div>

                <form onSubmit={handleApplyPromo} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                    placeholder="Örn: PARTIVIP veya NEON2026"
                    className="flex-1 bg-[#0a0e18] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 font-mono font-bold focus:outline-none focus:border-amber-400 tracking-wider"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-white/10 hover:bg-amber-400 hover:text-black text-white text-xs font-black transition-all active:scale-95"
                  >
                    Uygula
                  </button>
                </form>

                {promoError && (
                  <p className="text-[11px] text-red-400 font-medium">{promoError}</p>
                )}
                {promoSuccess && (
                  <p className="text-[11px] text-[#bef264] font-bold">{promoSuccess}</p>
                )}

                {/* Quick Test Code Chips */}
                <div className="pt-1 border-t border-white/5 flex flex-col gap-1">
                  <span className="text-[10px] text-gray-400">
                    Hemen test etmek için koda dokunun:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {['PARTIVIP', 'NEON2026', 'MASA100', 'BEYZA'].map((code) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => {
                          setPromoInput(code);
                          soundEngine.playClick();
                        }}
                        className="px-2 py-0.5 rounded-lg bg-black/40 border border-amber-500/30 text-[10px] font-mono font-bold text-amber-300 hover:border-amber-400 active:scale-95 transition-all"
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* If already VIP, a clean toggle button to open plan manager */}
          {isVIP && !showPlanManager && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setShowPlanManager(true);
              }}
              className="p-3 rounded-2xl bg-[#111827] border border-amber-500/20 hover:border-amber-400/40 text-amber-300 text-xs font-bold flex items-center justify-between transition-all active:scale-[0.99] cursor-pointer shrink-0"
            >
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                <span>Üyelik Planını Değiştir veya Yeni Hediye Kodu Gir</span>
              </div>
              <span className="text-[10px] text-gray-400 uppercase font-mono">Planları Gör ▼</span>
            </button>
          )}

          {isVIP && showPlanManager && (
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setShowPlanManager(false);
              }}
              className="py-2 px-3 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-[11px] font-bold text-center transition-colors cursor-pointer shrink-0"
            >
              Plan Değiştirme Bölümünü Gizle ▲
            </button>
          )}

          {/* ================= 11+ VIP PARTY GAMES SHOWCASE ================= */}
          <div className="flex flex-col gap-2.5 shrink-0">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
                <Crown className="w-3.5 h-3.5 fill-amber-400" />
                Özel VIP Oyun Vitrini ({vipGames.length} Oyun)
              </span>
              <span className="text-[10px] text-gray-400 font-mono">
                {isVIP ? 'Tümü Açık ✅' : 'VIP Kulübüne Özel'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {vipGames.map((game) => (
                <div
                  key={game.id}
                  onClick={() => {
                    soundEngine.playClick();
                    if (!isVIP) {
                      onShowToast(`👑 ${game.title} VIP Kulübüne Özeldir!`);
                      return;
                    }
                    if (onLaunchGame) {
                      onLaunchGame(game.id);
                    }
                  }}
                  className={`p-3 rounded-2xl border transition-all active:scale-[0.99] flex items-center justify-between gap-2.5 cursor-pointer shadow-md ${
                    isVIP
                      ? 'bg-gradient-to-r from-amber-500/10 via-[#171b26] to-[#111827] border-amber-400/40 hover:border-amber-400'
                      : 'bg-[#111827] border-white/10 hover:border-amber-500/30'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border"
                      style={{
                        backgroundColor: `${game.color || '#f59e0b'}20`,
                        borderColor: `${game.color || '#f59e0b'}40`
                      }}
                    >
                      {game.icon}
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-white truncate">
                          {game.title}
                        </span>
                      </div>
                      <span className="text-[10px] text-amber-400 font-bold font-mono truncate">
                        {game.badge || 'VIP ÖZEL'}
                      </span>
                      <p className="text-[10px] text-gray-400 truncate mt-0.5">
                        {game.desc}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={`px-2.5 py-1.5 rounded-xl text-[10px] font-black uppercase shrink-0 transition-all ${
                      isVIP
                        ? 'bg-[#bef264] text-black shadow-[0_0_10px_rgba(190,242,100,0.3)] hover:brightness-105'
                        : 'bg-white/10 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {isVIP ? 'Oyna ➔' : 'VIP 👑'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ================= VIP PERKS LIST ================= */}
          <div className="flex flex-col gap-2 shrink-0">
            <span className="text-xs font-black uppercase tracking-wider text-gray-300 flex items-center gap-1.5 px-1">
              <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              VIP Kulüp Ayrıcalıkları ({VIP_PERKS_LIST.length})
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {VIP_PERKS_LIST.map((perk) => (
                <div
                  key={perk.id}
                  className="p-3 rounded-2xl bg-[#111827] border border-white/5 flex items-start gap-2.5 shadow-sm"
                >
                  <span className="text-xl shrink-0 mt-0.5">{perk.icon}</span>
                  <div className="flex flex-col min-w-0">
                    <h3 className="text-xs font-bold text-white leading-tight">
                      {perk.title}
                    </h3>
                    <p className="text-[11px] text-gray-400 leading-snug mt-0.5">
                      {perk.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security & Guarantee Note */}
          <div className="flex items-center justify-center gap-2 py-2 text-[11px] text-gray-400 shrink-0">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Tüm oyunlar çevrimdışı ve cihaz üzerinde güvenle çalışır.</span>
          </div>

          {/* Bottom clearance spacer */}
          <div className="h-10 w-full shrink-0 pointer-events-none" aria-hidden="true" />
        </div>

        {/* ================= FIXED BOTTOM ACTION BAR ================= */}
        <div className="p-3 pb-safe bg-[#0a0e18]/95 backdrop-blur-md border-t border-amber-500/20 shrink-0 flex items-center gap-2">
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="w-full py-3 px-4 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{isVIP ? 'Ayrıcalıklarla Partiye Dön 🚀' : 'Kapat & Standart Oyna'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
