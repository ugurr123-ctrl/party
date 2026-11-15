import React from 'react';
import { UserPlus, Users, Dices, Crown, Sparkles, Settings, Layers, FolderDown, ShieldCheck } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface HeaderProps {
  title: string;
  isAudioOn: boolean;
  volumePercent: number;
  playersCount?: number;
  onOpenPlayerManager?: () => void;
  onOpenAudioSettings: () => void;
  onOpenCustomDeck?: () => void;
  onOpenDownload?: () => void;
  onOpenQuickTools: () => void;
  onOpenVIP: () => void;
  onOpenPrivacy?: () => void;
  isVIP?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  isAudioOn,
  volumePercent,
  playersCount = 4,
  onOpenPlayerManager,
  onOpenAudioSettings,
  onOpenCustomDeck,
  onOpenDownload,
  onOpenQuickTools,
  onOpenVIP,
  onOpenPrivacy,
  isVIP = false
}) => {
  return (
    <header className="flex items-center justify-between gap-1.5 py-2 sm:py-3 mb-2 sm:mb-4 border-b border-white/5 min-w-0">
      {/* Brand logo & active title */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <img
          src="/assets/icons/app-logo.png"
          alt="Party Box Logo"
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl object-cover shadow-[0_0_16px_rgba(190,242,100,0.35)] shrink-0 border border-white/10 ring-1 ring-lime-400/30"
        />
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] sm:text-[10px] tracking-widest uppercase font-black text-[#bef264] block -mb-0.5 truncate">
              PARTY BOX
            </span>
            <span className="w-1 h-1 rounded-full bg-[#f751a1] shrink-0" />
            <span className="text-[8px] sm:text-[9px] font-bold text-gray-400 uppercase tracking-wider hidden xs:inline truncate">
              ARCADE
            </span>
          </div>
          <h1 className="text-base sm:text-xl font-black text-white tracking-tight truncate">
            {title}
          </h1>
        </div>
      </div>

      {/* Action buttons: Player Add Pill (replaced sound box), Settings, Dice, VIP */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* Oyuncu Ekleme Alanı (Ses kutucuğu yerine) */}
        {onOpenPlayerManager && (
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenPlayerManager();
            }}
            className="h-8 px-2 sm:px-3 rounded-full bg-gradient-to-r from-[#bef264] to-lime-400 hover:brightness-105 active:scale-95 text-black font-extrabold text-xs flex items-center gap-1 shadow-[0_0_14px_rgba(190,242,100,0.45)] transition-all shrink-0 cursor-pointer"
            title="Masa Oyuncularını Yönet & Ekle"
            type="button"
          >
            <UserPlus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="text-[11px] font-black tracking-tight whitespace-nowrap hidden xs:inline">
              + Oyuncu ({playersCount})
            </span>
            <span className="text-[11px] font-black tracking-tight whitespace-nowrap xs:hidden">
              +{playersCount}
            </span>
          </button>
        )}

        {/* Settings Gear Button */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenAudioSettings();
          }}
          className="w-8 h-8 rounded-full bg-[#1e293b]/80 hover:bg-[#1e293b] border border-white/10 flex items-center justify-center text-gray-300 hover:text-white transition-all active:scale-95 shrink-0"
          title="Ses ve Titreşim Ayarları"
          aria-label="Ses ve Titreşim Ayarları"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* Özel Deste Yöneticisi Butonu */}
        {onOpenCustomDeck && (
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenCustomDeck();
            }}
            className="hidden sm:flex w-8 h-8 rounded-full bg-[#1e293b]/80 hover:bg-[#1e293b] border border-white/10 items-center justify-center text-purple-400 hover:text-purple-300 transition-all active:scale-95 shrink-0"
            title="Özel Deste Yöneticisi"
            aria-label="Özel Deste Yöneticisi"
          >
            <Layers className="w-4 h-4" />
          </button>
        )}

        {/* Dosyaları & Projeyi İndir Butonu */}
        {onOpenDownload && (
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenDownload();
            }}
            className="hidden md:flex w-8 h-8 rounded-full bg-[#1e293b]/80 hover:bg-[#1e293b] border border-emerald-500/30 items-center justify-center text-[#bef264] hover:brightness-110 shadow-[0_0_10px_rgba(190,242,100,0.2)] transition-all active:scale-95 shrink-0"
            title="Dosyaları ve Projeyi İndir (.ZIP & index.html)"
            aria-label="Dosyaları ve Projeyi İndir"
          >
            <FolderDown className="w-4 h-4" />
          </button>
        )}

        {/* Gizlilik & Mağaza Standartları Butonu */}
        {onOpenPrivacy && (
          <button
            onClick={() => {
              soundEngine.playClick();
              onOpenPrivacy();
            }}
            className="hidden lg:flex w-8 h-8 rounded-full bg-[#1e293b]/80 hover:bg-[#1e293b] border border-cyan-500/30 items-center justify-center text-cyan-400 hover:text-cyan-300 transition-all active:scale-95 shrink-0"
            title="Gizlilik Politikası & Mağaza Standartları"
            aria-label="Gizlilik Politikası"
          >
            <ShieldCheck className="w-4 h-4" />
          </button>
        )}

        {/* Hızlı Zar / Yazı Tura Butonu */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenQuickTools();
          }}
          className="w-8 h-8 rounded-full bg-[#111827] border border-white/10 flex items-center justify-center hover:border-white/30 text-gray-200 hover:text-white transition-all active:scale-95 shrink-0"
          title="Hızlı Karar: Zar & Yazı-Tura"
          aria-label="Hızlı Karar: Zar ve Yazı Tura"
        >
          <Dices className="w-4 h-4 text-[#bef264]" />
        </button>

        {/* VIP Rozeti */}
        <button
          onClick={() => {
            soundEngine.playClick();
            onOpenVIP();
          }}
          className={`h-8 px-2.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow active:scale-95 transition-all flex items-center gap-1 cursor-pointer shrink-0 ${
            isVIP
              ? 'bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.6)] animate-pulse'
              : 'bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-200 text-black hover:brightness-110'
          }`}
          title={isVIP ? '👑 Aktif VIP Kulübü' : 'VIP Parti Ayrıcalıkları'}
        >
          <Crown className={`w-3 h-3 ${isVIP ? 'text-black fill-black' : 'text-amber-900 fill-amber-900'}`} />
          <span>VIP</span>
        </button>
      </div>
    </header>
  );
};

