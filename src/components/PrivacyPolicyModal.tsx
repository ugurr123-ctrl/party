import React, { useState } from 'react';
import {
  ShieldCheck,
  X,
  Lock,
  Smartphone,
  CheckCircle2,
  ExternalLink,
  Copy,
  Trash2,
  FileText,
  AlertTriangle,
  Info
} from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  onShowToast
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms' | 'deletion'>('privacy');
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen) return null;

  const handleCopyPolicyUrl = () => {
    soundEngine.playSuccess();
    const url = window.location.origin + '/privacy-policy.html';
    navigator.clipboard.writeText(url);
    onShowToast('📋 Gizlilik & Şartlar bağlantısı panoya kopyalandı!');
  };

  const handleResetAllData = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      soundEngine.playBuzzer();
      return;
    }

    try {
      localStorage.clear();
      soundEngine.playVictory();
      onShowToast('🗑️ Tüm yerel veriler, oyuncu listeleri ve önbellek başarıyla sıfırlandı!');
      setConfirmDelete(false);
      setTimeout(() => {
        window.location.reload();
      }, 900);
    } catch {
      onShowToast('Veriler sıfırlanırken bir hata oluştu.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#111827] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[92vh] overflow-hidden">
        {/* Glow Accent */}
        <div className="absolute -top-14 -right-14 w-32 h-32 bg-[#bef264]/20 rounded-full blur-2xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5 relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#bef264] to-emerald-400 flex items-center justify-center text-black shadow-[0_0_15px_rgba(190,242,100,0.35)] shrink-0">
              <ShieldCheck className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#bef264] animate-pulse" />
                <span className="text-[10px] font-black text-[#bef264] tracking-widest uppercase">
                  MAĞAZA UYUMLULUK MERKEZİ
                </span>
              </div>
              <h3 className="text-lg font-black text-white tracking-tight">
                Gizlilik, Şartlar &amp; Veri Silme
              </h3>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-95 cursor-pointer"
            aria-label="Kapat"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 3-Tab Segment Selector */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/5 text-xs font-bold shrink-0">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('privacy');
            }}
            className={`py-2 px-1.5 rounded-xl transition-all cursor-pointer text-center truncate ${
              activeTab === 'privacy'
                ? 'bg-[#bef264] text-black shadow-[0_0_10px_rgba(190,242,100,0.3)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Gizlilik Politikası
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('terms');
            }}
            className={`py-2 px-1.5 rounded-xl transition-all cursor-pointer text-center truncate ${
              activeTab === 'terms'
                ? 'bg-[#bef264] text-black shadow-[0_0_10px_rgba(190,242,100,0.3)]'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Kullanım Şartları
          </button>
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setActiveTab('deletion');
            }}
            className={`py-2 px-1.5 rounded-xl transition-all cursor-pointer text-center truncate ${
              activeTab === 'deletion'
                ? 'bg-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.3)]'
                : 'text-gray-400 hover:text-rose-300'
            }`}
          >
            Hesap / Veri Sil
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto space-y-3.5 pr-1 text-xs text-gray-300 leading-relaxed no-scrollbar">
          {/* TAB 1: GİZLİLİK POLİTİKASI */}
          {activeTab === 'privacy' && (
            <>
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 to-lime-500/10 border border-emerald-500/30 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#bef264] shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block text-[11px]">
                    Google Play &amp; App Store Güvenlik Standardı
                  </span>
                  <p className="text-[11px] text-gray-300 mt-0.5">
                    Party Box, mağaza gereksinimlerine (%100 kullanıcı veri gizliliği, sıfır uzaktan izleme, cihaz içi yerel çalışma) tam uyumludur.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-[11px] font-black text-[#bef264] uppercase tracking-wider">
                  1. Veri Güvenliği ve İzinler (Data Safety)
                </h4>
                <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Lock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>%100 Cihaz İçi (Local) Depolama</span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Girdiğiniz oyuncu isimleri, özel kart desteleri ve çark dilimleri yalnızca telefonunuzun kendi yerel hafızasında saklanır. Sunuculara aktarılmaz.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1.5">
                  <div className="flex items-center gap-2 text-white font-bold">
                    <Smartphone className="w-3.5 h-3.5 text-pink-400" />
                    <span>Hassas İzin Talebi Yoktur</span>
                  </div>
                  <p className="text-[11px] text-gray-400">
                    Kamera, mikrofon, rehber veya konum izni istenmez. Sadece oyun içi haptik titreşim ve Web Audio sentezleyici kullanılır.
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-[11px] font-black text-[#bef264] uppercase tracking-wider">
                  2. Çocuk &amp; Aile Güvenliği (COPPA)
                </h4>
                <p className="text-[11px] text-gray-400">
                  Party Box hiçbir yaş grubundan kimlik bilgisi toplamaz. Zararlı yazılım veya üçüncü taraf reklam izleyicileri içermez.
                </p>
              </div>
            </>
          )}

          {/* TAB 2: KULLANIM ŞARTLARI & EULA */}
          {activeTab === 'terms' && (
            <>
              <div className="p-3.5 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block text-[11px]">
                    Son Kullanıcı Lisans Sözleşmesi (EULA)
                  </span>
                  <p className="text-[11px] text-gray-300 mt-0.5">
                    Party Box, sosyal ortamlarda arkadaş ve aile ile eğlenmek amacıyla geliştirilmiştir.
                  </p>
                </div>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                  <h5 className="font-bold text-white">Güvenlik ve Sorumluluk Reddi:</h5>
                  <p className="text-gray-400">
                    Oyun içi görevler veya cesaret soruları tamamen eğlence amaçlıdır. Oyuncular kendi sağlık ve güvenliklerini tehlikeye atacak hiçbir davranışı yapmak zorunda değildir; her soruyu 'Pas Geçme' hakkı saklıdır.
                  </p>
                </div>

                <div className="p-3 rounded-2xl bg-black/40 border border-white/5 space-y-1">
                  <h5 className="font-bold text-white">VIP İçerik &amp; Promosyon Kodları:</h5>
                  <p className="text-gray-400">
                    VIP üyelik ve özel desteler cihaz içi kilit açma mantığıyla çalışır. Lisans hakları saklıdır.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* TAB 3: HESAP & VERİ SİLME */}
          {activeTab === 'deletion' && (
            <>
              <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold text-white block text-[11px]">
                    Hesap Silme Gereksinimi Açıklaması
                  </span>
                  <p className="text-[11px] text-gray-300 mt-0.5">
                    Apple &amp; Google kuralları gereği uzaktan hesap silme zorunluluğu, yalnızca sunucuda kullanıcı hesabı açtıran uygulamalar içindir. <strong>Party Box sunucuda hesap tutmaz.</strong>
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-black/50 border border-rose-500/20 space-y-3">
                <div className="flex items-center gap-2 text-rose-400 font-bold text-xs">
                  <Trash2 className="w-4 h-4" />
                  <span>Cihaz Verilerini ve Ayarları Sıfırla (GDPR / KVKK)</span>
                </div>
                <p className="text-[11px] text-gray-400 leading-relaxed">
                  Cihazınızda kayıtlı tüm masa oyuncularını, skorları, özel oluşturduğunuz desteleri ve VIP durumunu tek bir tıkla anında ve kalıcı olarak silebilirsiniz.
                </p>

                <button
                  type="button"
                  onClick={handleResetAllData}
                  className={`w-full py-3 px-4 rounded-2xl font-black text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg ${
                    confirmDelete
                      ? 'bg-rose-600 text-white animate-pulse shadow-rose-600/40'
                      : 'bg-white/10 hover:bg-rose-500 hover:text-white text-gray-200'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                  <span>
                    {confirmDelete
                      ? 'Emin misiniz? Onaylamak İçin Tekrar Basın!'
                      : 'Cihazdaki Tüm Verileri Kalıcı Sil'}
                  </span>
                </button>
              </div>
            </>
          )}

          {/* Store Console Link Copy Card */}
          <div className="p-3.5 rounded-2xl bg-[#1e293b] border border-white/10 space-y-2 mt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block">
              Google Play Console / App Store Connect İçin Gizlilik URL'si
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value="/privacy-policy.html"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-2.5 py-1.5 font-mono text-[11px] text-cyan-300 select-all"
              />
              <button
                type="button"
                onClick={handleCopyPolicyUrl}
                className="px-3 py-1.5 rounded-xl bg-[#bef264] hover:brightness-105 active:scale-95 text-black font-extrabold text-xs flex items-center gap-1.5 shrink-0 transition-all cursor-pointer shadow-[0_0_12px_rgba(190,242,100,0.3)]"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Kopyala</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-white/5 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="w-full py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-extrabold text-xs transition-all active:scale-95 text-center cursor-pointer"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
};
