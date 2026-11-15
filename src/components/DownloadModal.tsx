import React, { useState } from 'react';
import {
  Download,
  FileCode,
  FolderArchive,
  CheckCircle2,
  ExternalLink,
  X,
  Sparkles,
  Terminal,
  Info,
  Smartphone,
  ShieldCheck,
  Image as ImageIcon
} from 'lucide-react';
import JSZip from 'jszip';
import { soundEngine } from '../utils/audio';
import { PROJECT_SOURCE_BUNDLE } from '../data/projectSourceBundle';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast: (msg: string) => void;
  onOpenPrivacy?: () => void;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
  onOpenPrivacy
}) => {
  const [downloadingZip, setDownloadingZip] = useState(false);
  const [downloadingHtml, setDownloadingHtml] = useState(false);

  if (!isOpen) return null;

  const handleDownloadZip = async () => {
    try {
      soundEngine.playSuccess();
      setDownloadingZip(true);
      onShowToast('📦 Tüm kaynak kodlar (60+ dosya) paketleniyor...');

      const zip = new JSZip();

      // 1. Add all source files and binary icons directly from in-memory bundle
      const filePaths = Object.keys(PROJECT_SOURCE_BUNDLE || {});
      filePaths.forEach((path) => {
        const content = PROJECT_SOURCE_BUNDLE[path];
        if (typeof content === 'string' && content.startsWith('__BASE64__:')) {
          zip.file(path, content.slice(11), { base64: true });
        } else {
          zip.file(path, content);
        }
      });

      // 2. Extract and pack 1024x1024 store logos directly from loaded DOM images
      try {
        const playImg = document.querySelector('img[alt*="Google Play"]') as HTMLImageElement | null;
        if (playImg && playImg.complete) {
          const canvas = document.createElement('canvas');
          canvas.width = playImg.naturalWidth || 1024;
          canvas.height = playImg.naturalHeight || 1024;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(playImg, 0, 0);
            const playBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
            if (playBlob) {
              zip.file('public/assets/icons/logo-google-play.png', playBlob);
              zip.file('public/assets/icons/app-logo.png', playBlob);
              zip.file('public/app-logo.png', playBlob);
            }
          }
        }
      } catch (e) {
        console.warn('Google Play icon capture fallback:', e);
      }

      try {
        const appleImg = document.querySelector('img[alt*="App Store"]') as HTMLImageElement | null;
        if (appleImg && appleImg.complete) {
          const canvas = document.createElement('canvas');
          canvas.width = appleImg.naturalWidth || 1024;
          canvas.height = appleImg.naturalHeight || 1024;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(appleImg, 0, 0);
            const appleBlob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'));
            if (appleBlob) {
              zip.file('public/assets/icons/logo-app-store.png', appleBlob);
            }
          }
        }
      } catch (e) {
        console.warn('App store icon capture fallback:', e);
      }

      // 3. Generate genuine binary ZIP file directly in browser memory
      const zipBlob = await zip.generateAsync({
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: 6 }
      });

      // 4. Download via in-memory blob URL (Bypasses server proxy and cookie check)
      const blobUrl = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'Party-Box-Tam-Kaynak-Kodlari.zip';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 2000);

      const sizeKb = Math.round(zipBlob.size / 1024);
      onShowToast(`✅ Party-Box-Tam-Kaynak-Kodlari.zip (${sizeKb} KB, ${filePaths.length} Dosya) indirildi!`);
    } catch (err) {
      console.error('ZIP generation error:', err);
      onShowToast('ZIP oluşturulurken bir aksaklık oldu.');
    } finally {
      setDownloadingZip(false);
    }
  };

  const handleDownloadIndexHtml = async () => {
    try {
      soundEngine.playClick();
      setDownloadingHtml(true);
      onShowToast('📄 index.html hazırlanıyor...');

      let content = '<!DOCTYPE html><html><head><title>Party Box</title></head><body><h1>Party Box</h1></body></html>';
      try {
        const res = await fetch('/index.html');
        if (res.ok) {
          content = await res.text();
        }
      } catch {
        // fallback
      }

      const blob = new Blob([content], { type: 'text/html;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'index.html';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      onShowToast('✅ index.html başarıyla indirildi!');
    } catch (err) {
      console.error(err);
      onShowToast('index.html indirilirken hata oluştu.');
    } finally {
      setDownloadingHtml(false);
    }
  };

  const handleDownloadLogo = (filename: string, storeName: string) => {
    soundEngine.playSuccess();
    const link = document.createElement('a');
    link.href = `/assets/icons/${filename}`;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    onShowToast(`🎯 1024x1024 ${storeName} logo dosyası indirildi!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#111827] border border-white/10 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col gap-4 overflow-hidden max-h-[92vh]">
        {/* Glow accent */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#bef264]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#f751a1]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5 relative z-10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#bef264] to-emerald-400 flex items-center justify-center text-black shadow-[0_0_15px_rgba(190,242,100,0.35)] shrink-0">
              <Download className="w-5 h-5 text-black stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#bef264] animate-pulse" />
                <span className="text-[10px] font-black text-[#bef264] tracking-widest uppercase">
                  PARTY BOX & MAĞAZA KİTİ
                </span>
              </div>
              <h3 className="text-lg font-black text-white tracking-tight">
                Dosyaları ve Mağaza Varlıklarını İndir
              </h3>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all active:scale-95"
            aria-label="Kapat"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="overflow-y-auto space-y-4 pr-1 no-scrollbar">
          {/* Info Card */}
          <div className="p-3.5 rounded-2xl bg-[#1e293b]/70 border border-white/5 flex items-start gap-2.5 text-xs text-gray-300">
            <Info className="w-4 h-4 text-[#4cd7f6] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-white">Party Box</strong> projesini Google Play ve App Store'a yüklemek için gereken <strong className="text-[#bef264]">1024x1024 resmi logoları</strong>, tam kaynak kod paketini (.ZIP) veya tek dosya index.html'i aşağıdan indirebilirsiniz.
            </p>
          </div>

          {/* STORE LOGOS SECTION (Requirement 1 & 2) */}
          <div className="p-4 rounded-3xl bg-black/40 border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-[#bef264]" />
                <span className="text-xs font-black uppercase tracking-wider text-white">
                  Resmi 1024x1024 Mağaza Logoları
                </span>
              </div>
              <span className="text-[10px] text-lime-400 font-bold px-2 py-0.5 rounded-full bg-lime-400/10 border border-lime-400/20">
                1024x1024 PNG
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Google Play Logo Card (Attachment 3) */}
              <div className="p-3 rounded-2xl bg-[#111827] border border-white/10 flex flex-col items-center gap-2.5 text-center group hover:border-[#bef264]/40 transition-all">
                <div className="relative">
                  <img
                    src="/assets/icons/logo-google-play.png"
                    alt="Party Box Google Play Logo"
                    className="w-16 h-16 rounded-2xl shadow-lg border border-white/10 object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-[#00875a] text-white text-[8px] font-black rounded-md shadow">
                    PLAY
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">Google Play Store</h4>
                  <p className="text-[10px] text-gray-400">1024x1024 • Safe-zone uyumlu</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadLogo('logo-google-play.png', 'Google Play')}
                  className="w-full py-1.5 px-2.5 rounded-xl bg-white/10 hover:bg-[#bef264] hover:text-black text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>İndir (PNG)</span>
                </button>
              </div>

              {/* App Store Logo Card (Attachment 4) */}
              <div className="p-3 rounded-2xl bg-[#111827] border border-white/10 flex flex-col items-center gap-2.5 text-center group hover:border-cyan-400/40 transition-all">
                <div className="relative">
                  <img
                    src="/assets/icons/logo-app-store.png"
                    alt="Party Box Apple App Store Logo"
                    className="w-16 h-16 rounded-2xl shadow-lg border border-white/10 object-cover group-hover:scale-105 transition-transform"
                  />
                  <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 bg-[#0071e3] text-white text-[8px] font-black rounded-md shadow">
                    APPLE
                  </span>
                </div>
                <div>
                  <h4 className="text-xs font-black text-white">Apple App Store</h4>
                  <p className="text-[10px] text-gray-400">1024x1024 • iOS App Store</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleDownloadLogo('logo-app-store.png', 'App Store')}
                  className="w-full py-1.5 px-2.5 rounded-xl bg-white/10 hover:bg-cyan-400 hover:text-black text-white text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>İndir (PNG)</span>
                </button>
              </div>
            </div>
          </div>

          {/* Download Options */}
          <div className="flex flex-col gap-2.5">
            {/* Main Option: Complete ZIP */}
            <button
              onClick={handleDownloadZip}
              disabled={downloadingZip}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#bef264] via-lime-400 to-[#a3e635] text-black font-extrabold flex items-center justify-between shadow-[0_0_24px_rgba(190,242,100,0.4)] hover:brightness-105 active:scale-[0.98] transition-all group cursor-pointer"
              type="button"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black/15 flex items-center justify-center shrink-0">
                  <FolderArchive className="w-5 h-5 text-black" />
                </div>
                <div className="text-left">
                  <div className="text-sm font-black flex items-center gap-1.5">
                    Party Box Proje Paketini İndir (.ZIP)
                    <Sparkles className="w-3.5 h-3.5 text-black" />
                  </div>
                  <div className="text-[11px] font-semibold text-black/75">
                    Tüm Kaynak Kodlar + Logolar + Capacitor Ayarları
                  </div>
                </div>
              </div>
              <Download className={`w-5 h-5 text-black group-hover:translate-y-0.5 transition-transform ${downloadingZip ? 'animate-bounce' : ''}`} />
            </button>

            {/* Secondary Option: index.html standalone */}
            <button
              onClick={handleDownloadIndexHtml}
              disabled={downloadingHtml}
              className="w-full p-3 rounded-2xl bg-[#1e293b] hover:bg-[#283548] border border-white/10 text-white font-bold flex items-center justify-between active:scale-[0.98] transition-all group cursor-pointer"
              type="button"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
                  <FileCode className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <div className="text-xs font-black text-white">
                    Yalnızca index.html İndir
                  </div>
                  <div className="text-[10px] text-gray-400">
                    Tek dosya web giriş belgesi
                  </div>
                </div>
              </div>
              <Download className={`w-4 h-4 text-purple-400 group-hover:translate-y-0.5 transition-transform ${downloadingHtml ? 'animate-bounce' : ''}`} />
            </button>
          </div>

          {/* Windows / Mac ZIP Hatası İpucu */}
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
            <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Sıkıştırılmış Klasör Hatası Alırsanız:</strong> Windows Gezgini bazen doğrudan çift tıklamayı engelleyebilir. İndirdiğiniz ZIP dosyasına <strong>sağ tıklayıp &quot;Tümünü Ayıkla&quot; (Extract All)</strong> deyin veya <strong>WinRAR / 7-Zip</strong> ile açın.
            </p>
          </div>

          {/* Quick Store Deployment Steps */}
          <div className="p-3.5 rounded-2xl bg-[#0a0e17] border border-white/5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-white text-[11px]">
                <Smartphone className="w-3.5 h-3.5 text-[#bef264]" />
                <span>Google Play & App Store Yükleme Komutları:</span>
              </div>
              <span className="text-[10px] text-cyan-400 font-mono">Capacitor Native</span>
            </div>
            <div className="font-mono text-[10px] bg-[#111827] p-2.5 rounded-xl text-emerald-400 border border-white/5 space-y-1 select-all">
              <div>npm install && npm run build</div>
              <div>npx cap add android &amp;&amp; npx cap add ios</div>
              <div>npx cap open android &amp;&amp; npx cap open ios</div>
            </div>
            <p className="text-[10px] text-gray-400">
              Uygulama kimliği: <code className="text-[#bef264]">com.partybox.app</code> | Ad: <code className="text-white">Party Box</code>
            </p>
          </div>

          {/* Privacy Policy Link Trigger */}
          {onOpenPrivacy && (
            <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-white block">Mağaza İncelemesi İçin Gizlilik Politikası</span>
                  <span className="text-[10px] text-gray-300">Google Play & App Store formlarına ekleyin</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  soundEngine.playClick();
                  onOpenPrivacy();
                }}
                className="px-3 py-1.5 rounded-xl bg-cyan-400 text-black font-extrabold text-[11px] active:scale-95 transition-all cursor-pointer"
              >
                Görüntüle
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
