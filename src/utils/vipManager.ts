// VIP Membership Manager & Promo Engine for Party Box
// Persists membership status in localStorage and emits real-time updates across the app

export type VIPPlanType = 'none' | 'weekly' | 'monthly' | 'yearly' | 'lifetime';

export interface VIPStatus {
  isVIP: boolean;
  plan: VIPPlanType;
  planName: string;
  activatedAt: string | null;
  expiresAt: string | null;
  promoCodeUsed?: string | null;
  perksCount: number;
}

const STORAGE_KEY = 'parti_kutusu_vip_status_v1';
export const VIP_UPDATED_EVENT = 'parti_vip_status_changed';

// Default standard status
const DEFAULT_STATUS: VIPStatus = {
  isVIP: false,
  plan: 'none',
  planName: 'Standart Üye',
  activatedAt: null,
  expiresAt: null,
  promoCodeUsed: null,
  perksCount: 0
};

// Known valid promo codes that grant free VIP access
export const VALID_PROMO_CODES: Record<string, { plan: VIPPlanType; name: string; label: string }> = {
  PARTIVIP: { plan: 'lifetime', name: 'Ömür Boyu VIP', label: 'Parti VIP Özel Lansman Hediyesi' },
  NEON2026: { plan: 'yearly', name: '1 Yıllık VIP Pass', label: 'Neon Kulüp Yıllık Erişim' },
  MASA100: { plan: 'lifetime', name: 'Ömür Boyu VIP', label: 'Masa Şampiyonu Özel Kodu' },
  SUPERVIP: { plan: 'lifetime', name: 'Ömür Boyu VIP', label: 'Süper VIP Ebedi Pass' },
  VIP: { plan: 'lifetime', name: 'Ömür Boyu VIP', label: 'Hızlı Test VIP Pass' },
  BEYZA: { plan: 'lifetime', name: 'Ömür Boyu VIP Özel', label: 'VIP Onur Üyeliği' },
  AI: { plan: 'lifetime', name: 'Ömür Boyu VIP', label: 'Geliştirici & Test Kodu' }
};

export const VIP_PERKS_LIST = [
  {
    id: 'perk-games',
    icon: '👑',
    title: '11 Özel VIP Parti Oyunu',
    desc: 'Sesli İtiraf & Yalan Dedektörü, Kör Çizim, Kaos Ruleti, Mafya Masası, Galeri Ruleti, VIP Telepati, Rehin Telefon, Masa Dedektifi, Akortsuz Karaoke, Hesap Ruleti ve Kaos Tabusu.'
  },
  {
    id: 'perk-tournament',
    icon: '🏆',
    title: '5 Turluk Canlı Parti Şampiyonası',
    desc: 'Tüm masanın katıldığı 5 rauntluk şampiyonluk tablosu, özel kupa, altın rozet ve puanlama sistemi.'
  },
  {
    id: 'perk-deck',
    icon: '🔥',
    title: '+100 Özel Ateşli & Kaotik Kart',
    desc: 'Doğruluk mu Cesaret mi, Ben Hiç Yapmadım ve Kim Daha Çok oyunlarında VIP özel deste kilidi anında açılır.'
  },
  {
    id: 'perk-custom',
    icon: '🎴',
    title: 'Sınırsız Özel Deste & Kart Yazma',
    desc: 'Arkadaş grubunuza özel sınırsız sayıda soru ve ceza kartı ekleme, masaya kaydetme ve dışa aktarma.'
  },
  {
    id: 'perk-theme',
    icon: '✨',
    title: 'Altın VIP Neon Rozeti & Efektler',
    desc: 'Profilinde, masada ve oda başlığında parıldayan özel altın VIP tacı ve neon animasyonları.'
  },
  {
    id: 'perk-table',
    icon: '👥',
    title: 'Genişletilmiş 15+ Oyuncu Masası',
    desc: 'Kalabalık partilerde donma veya limit olmadan sınırsız masa katılımcısı ve özel fotoğraf desteği.'
  }
];

export const vipManager = {
  // Read current VIP status from localStorage
  getStatus(): VIPStatus {
    if (typeof window === 'undefined') return DEFAULT_STATUS;
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return DEFAULT_STATUS;
      const parsed = JSON.parse(data);

      // Check if temporary plan has expired
      if (parsed.expiresAt && parsed.expiresAt !== 'never') {
        const expTime = new Date(parsed.expiresAt).getTime();
        if (Date.now() > expTime) {
          this.reset();
          return DEFAULT_STATUS;
        }
      }

      return {
        ...DEFAULT_STATUS,
        ...parsed
      };
    } catch {
      return DEFAULT_STATUS;
    }
  },

  // Activate VIP membership directly
  activate(plan: VIPPlanType, promoCodeUsed?: string): VIPStatus {
    const now = new Date();
    let expiresAt: string | null = null;
    let planName = 'Ömür Boyu VIP Pass';

    if (plan === 'weekly') {
      const exp = new Date(now);
      exp.setDate(exp.getDate() + 7);
      expiresAt = exp.toISOString();
      planName = '1 Haftalık VIP Pass';
    } else if (plan === 'monthly') {
      const exp = new Date(now);
      exp.setDate(exp.getDate() + 30);
      expiresAt = exp.toISOString();
      planName = '1 Aylık VIP Pass';
    } else if (plan === 'yearly') {
      const exp = new Date(now);
      exp.setDate(exp.getDate() + 365);
      expiresAt = exp.toISOString();
      planName = '1 Yıllık VIP Pass';
    } else {
      expiresAt = 'never';
      planName = 'Ömür Boyu VIP Pass';
    }

    const newStatus: VIPStatus = {
      isVIP: true,
      plan,
      planName,
      activatedAt: now.toISOString(),
      expiresAt,
      promoCodeUsed: promoCodeUsed || null,
      perksCount: VIP_PERKS_LIST.length
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newStatus));
      window.dispatchEvent(new CustomEvent(VIP_UPDATED_EVENT, { detail: newStatus }));
    } catch {
      // storage quota protection
    }

    return newStatus;
  },

  // Redeem Promo Code
  redeemCode(code: string): { success: boolean; message: string; status?: VIPStatus } {
    const clean = code.trim().toUpperCase();
    if (!clean) {
      return { success: false, message: 'Lütfen geçerli bir kod girin.' };
    }

    const promo = VALID_PROMO_CODES[clean];
    if (promo) {
      const activated = this.activate(promo.plan, clean);
      return {
        success: true,
        message: `Tebrikler! "${promo.label}" başarıyla uygulandı ve ${promo.name} hesabınıza tanımlandı! 🎉`,
        status: activated
      };
    }

    return {
      success: false,
      message: 'Geçersiz veya süresi dolmuş promosyon kodu. (İpucu: PARTIVIP veya NEON2026 kodunu deneyin!)'
    };
  },

  // Reset VIP to free standard
  reset(): VIPStatus {
    try {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(new CustomEvent(VIP_UPDATED_EVENT, { detail: DEFAULT_STATUS }));
    } catch {
      // ignore
    }
    return DEFAULT_STATUS;
  },

  // Subscribe to VIP state updates
  subscribe(callback: (status: VIPStatus) => void): () => void {
    if (typeof window === 'undefined') return () => {};

    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<VIPStatus>;
      if (customEvent.detail) {
        callback(customEvent.detail);
      } else {
        callback(this.getStatus());
      }
    };

    window.addEventListener(VIP_UPDATED_EVENT, handler);
    return () => window.removeEventListener(VIP_UPDATED_EVENT, handler);
  }
};
