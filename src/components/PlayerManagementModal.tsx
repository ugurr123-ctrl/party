import React, { useState, useRef } from 'react';
import {
  X,
  UserPlus,
  Users,
  Camera,
  Upload,
  Trash2,
  RotateCcw,
  Sparkles,
  Trophy,
  Check,
  Plus
} from 'lucide-react';
import { soundEngine } from '../utils/audio';
import {
  TablePlayer,
  PRESET_AVATARS,
  PLAYER_COLORS,
  resizeUploadedImage
} from '../utils/playerManager';

interface PlayerManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  players: TablePlayer[];
  onUpdatePlayers: (players: TablePlayer[]) => void;
  onShowToast: (msg: string) => void;
}

export const PlayerManagementModal: React.FC<PlayerManagementModalProps> = ({
  isOpen,
  onClose,
  players,
  onUpdatePlayers,
  onShowToast
}) => {
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState<string>(PRESET_AVATARS[0]);
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Handle image upload from camera or gallery
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const compressedDataUrl = await resizeUploadedImage(file, 200);
      setCustomPhoto(compressedDataUrl);
      setSelectedAvatar(compressedDataUrl);
      soundEngine.playClick();
      onShowToast('📸 Fotoğraf başarıyla yüklendi!');
    } catch (err) {
      console.error(err);
      onShowToast('Fotoğraf yüklenirken hata oluştu.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Add new player
  const handleAddPlayer = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      onShowToast('Lütfen oyuncu adı girin!');
      return;
    }

    soundEngine.playSuccess();
    const newPlayer: TablePlayer = {
      id: 'p_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: trimmed,
      avatar: customPhoto || selectedAvatar,
      score: 0,
      color: PLAYER_COLORS[players.length % PLAYER_COLORS.length]
    };

    const updated = [...players, newPlayer];
    onUpdatePlayers(updated);
    setName('');
    setCustomPhoto(null);
    setSelectedAvatar(PRESET_AVATARS[(players.length + 1) % PRESET_AVATARS.length]);
    onShowToast(`🎉 ${newPlayer.name} masaya eklendi!`);
  };

  // Remove player
  const handleRemovePlayer = (id: string, playerName: string) => {
    soundEngine.playClick();
    if (players.length <= 1) {
      onShowToast('Masada en az 1 oyuncu bulunmalıdır!');
      return;
    }
    const updated = players.filter((p) => p.id !== id);
    onUpdatePlayers(updated);
    onShowToast(`${playerName} masadan çıkarıldı.`);
  };

  // Reset scores
  const handleResetScores = () => {
    soundEngine.playClick();
    const updated = players.map((p) => ({ ...p, score: 0 }));
    onUpdatePlayers(updated);
    onShowToast('Tüm oyuncu skorları sıfırlandı.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3.5 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-white/15 rounded-3xl w-full max-w-md md:max-w-xl shadow-2xl flex flex-col h-[88dvh] sm:h-[90vh] max-h-[820px] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-[#151a27]">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#bef264] to-lime-500 text-black flex items-center justify-center shadow-[0_0_15px_rgba(190,242,100,0.4)] shrink-0">
              <Users className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-1.5">
                Masa Oyuncuları
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#bef264]/20 text-[#bef264] font-mono">
                  {players.length} Kişi
                </span>
              </h2>
              <p className="text-[11px] text-gray-400">
                Oyunlar bu oyuncular arasında döner
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              soundEngine.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 flex items-center justify-center text-gray-300 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-4 pb-12 overflow-y-auto space-y-4 no-scrollbar">
          {/* Add Player Box */}
          <form
            onSubmit={handleAddPlayer}
            className="p-4 rounded-2xl bg-[#0a0e18] border border-white/10 space-y-3.5 shadow-inner"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-[#bef264] flex items-center gap-1.5">
                <UserPlus className="w-4 h-4" /> Yeni Oyuncu Ekle
              </span>
              <span className="text-[10px] text-gray-400">İsteğe Bağlı Fotoğraf</span>
            </div>

            {/* Avatar & Photo Picker */}
            <div className="flex items-center gap-3">
              <div className="relative group shrink-0">
                <img
                  src={customPhoto || selectedAvatar}
                  alt="Önizleme"
                  className="w-14 h-14 rounded-2xl object-cover ring-2 ring-[#bef264]/60 shadow-md"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#bef264] text-black flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                  title="Fotoğraf Yükle"
                >
                  <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
                </button>
              </div>

              <div className="flex-1 space-y-1">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Oyuncunun Adı..."
                  maxLength={25}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-500 text-sm font-semibold focus:outline-none focus:border-[#bef264] transition-colors"
                />

                <div className="flex items-center gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 text-[11px] font-semibold flex items-center gap-1 active:scale-95 transition-all"
                  >
                    <Upload className="w-3 h-3 text-[#bef264]" />
                    {isUploading ? 'Yükleniyor...' : 'Kamera / Fotoğraf'}
                  </button>

                  {customPhoto && (
                    <button
                      type="button"
                      onClick={() => setCustomPhoto(null)}
                      className="text-[10px] text-red-400 hover:text-red-300 underline"
                    >
                      Kaldır
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Preset Avatars Row */}
            <div className="space-y-1 pt-1">
              <span className="text-[10px] text-gray-400 block font-bold">Veya hazır avatar seç:</span>
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {PRESET_AVATARS.map((av, idx) => {
                  const isSelected = !customPhoto && selectedAvatar === av;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        soundEngine.playClick();
                        setCustomPhoto(null);
                        setSelectedAvatar(av);
                      }}
                      className={`shrink-0 w-8 h-8 rounded-xl overflow-hidden ring-2 transition-all ${
                        isSelected
                          ? 'ring-[#bef264] scale-105 shadow-[0_0_10px_rgba(190,242,100,0.5)]'
                          : 'ring-white/10 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={av} alt="Avatar" className="w-full h-full object-cover" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#bef264] to-lime-400 text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(190,242,100,0.3)] active:scale-95 hover:brightness-105 transition-all"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              Masaya Ekle
            </button>
          </form>

          {/* Active Players List */}
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-black uppercase tracking-wider text-white flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-gray-400" /> Masadaki Oyuncular ({players.length})
              </span>
              <button
                type="button"
                onClick={handleResetScores}
                className="text-[10px] text-gray-400 hover:text-white flex items-center gap-1 transition-colors"
                title="Puanları Sıfırla"
              >
                <RotateCcw className="w-3 h-3" /> Puanları Sıfırla
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {players.map((player, idx) => (
                <div
                  key={player.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#171b26] border border-white/5 hover:border-white/15 transition-all"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-4 text-center font-black text-xs text-gray-500">
                      #{idx + 1}
                    </span>
                    <img
                      src={player.avatar}
                      alt={player.name}
                      className="w-9 h-9 rounded-xl object-cover ring-1 ring-white/20 shadow-sm"
                    />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-white flex items-center gap-1">
                        {player.name}
                      </span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Trophy className="w-2.5 h-2.5 text-amber-400" />
                        {player.score} Puan
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleRemovePlayer(player.id, player.name)}
                      className="w-7 h-7 rounded-lg bg-white/5 hover:bg-rose-500/20 text-gray-400 hover:text-rose-400 flex items-center justify-center transition-colors"
                      title="Masadan Kaldır"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom clearance spacer */}
          <div className="h-6 w-full shrink-0 pointer-events-none" aria-hidden="true" />
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 pb-safe border-t border-white/10 bg-[#151a27] flex items-center justify-between">
          <span className="text-[11px] text-gray-400 flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-[#bef264]" />
            Değişiklikler otomatik kaydedilir
          </span>
          <button
            type="button"
            onClick={() => {
              soundEngine.playSuccess();
              onClose();
            }}
            className="px-5 py-2 rounded-xl bg-[#bef264] text-black font-black text-xs active:scale-95 transition-all shadow"
          >
            Tamam, Oyuna Dön
          </button>
        </div>
      </div>
    </div>
  );
};
