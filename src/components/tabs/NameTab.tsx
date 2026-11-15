import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../../utils/audio';
import {
  Shuffle,
  Wand2,
  UserPlus,
  Plus,
  X,
  Sliders,
  User,
  Users,
  UserMinus,
  Dices,
  Copy,
  SkipForward,
  Check,
  History,
  CheckCircle2,
  Trash2
} from 'lucide-react';

interface NameTabProps {
  onShowToast: (msg: string) => void;
}

interface HistoryItem {
  id: string;
  names: string[];
  time: string;
}

const DEFAULT_PARTICIPANTS = ['Can', 'Zeynep', 'Ahmet', 'Melis', 'Uğur', 'Elif'];

const PARTY_TASKS = [
  'Solundaki kişinin ses tonuyla bir fıkra anlat!',
  'Sağındaki kişiye iltifat et ya da 10 şınav çek!',
  'Telefonundaki en son çektiğin fotoğrafı herkese göster!',
  'Bir dakika boyunca sessizce heykel gibi dur!',
  'En utandığın anını 30 saniyede özetle!',
  'Odada en güvendiğin kişiyle göz teması kurup 20 saniye gülmeden dur!',
  'Masadaki herkes sana komik bir soru sorsun, hemen cevapla!',
  'Gruptan birini seç ve onun taklidini yap!'
];

export const NameTab: React.FC<NameTabProps> = ({ onShowToast }) => {
  // State
  const [participants, setParticipants] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('parti_kutusu_name_participants');
      return saved ? JSON.parse(saved) : DEFAULT_PARTICIPANTS;
    } catch {
      return DEFAULT_PARTICIPANTS;
    }
  });

  const [inputText, setInputText] = useState('');
  const [drawCount, setDrawCount] = useState<1 | 2>(1);
  const [removeWinner, setRemoveWinner] = useState(false);
  const [countdownDuration, setCountdownDuration] = useState<number>(3000);
  const [isDrawing, setIsDrawing] = useState(false);

  // Drawing Display State
  const [displayText, setDisplayText] = useState<string>('Hazır mısın?');
  const [displaySubtext, setDisplaySubtext] = useState<string>('Kura çekmek için butona bas');
  const [isWinnerRevealed, setIsWinnerRevealed] = useState(false);
  const [partyTask, setPartyTask] = useState<string>(PARTY_TASKS[0]);
  const [isCopied, setIsCopied] = useState(false);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Persist participants
  useEffect(() => {
    try {
      localStorage.setItem('parti_kutusu_name_participants', JSON.stringify(participants));
    } catch {
      // ignore
    }
  }, [participants]);

  // Add Participant
  const handleAddName = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const val = inputText.trim();
    if (!val) return;

    if (participants.includes(val)) {
      onShowToast('Bu isim zaten havuzda var!');
      return;
    }

    setParticipants((prev) => [...prev, val]);
    setInputText('');
    soundEngine.playClick();
    onShowToast(`"${val}" havuza eklendi.`);
  };

  // Remove Participant
  const handleRemoveName = (index: number) => {
    soundEngine.playClick();
    setParticipants((prev) => prev.filter((_, i) => i !== index));
  };

  // Load Preset List
  const handleLoadPreset = () => {
    soundEngine.playSuccess();
    const sample = ['Can', 'Zeynep', 'Ahmet', 'Melis', 'Uğur', 'Elif', 'Burak', 'Selin'];
    setParticipants(sample);
    onShowToast('8 kişilik örnek liste yüklendi.');
  };

  // Clear All
  const handleClearAll = () => {
    soundEngine.playClick();
    setParticipants([]);
    onShowToast('Katılımcı havuzu temizlendi.');
  };

  // Trigger Draw (Slot Drum Animation)
  const handleTriggerDraw = () => {
    if (isDrawing) return;

    if (participants.length < drawCount) {
      soundEngine.playTone(250, 0.2, 'sawtooth');
      setDisplayText(`En az ${drawCount} kişi ekle!`);
      setTimeout(() => {
        setDisplayText('Hazır mısın?');
      }, 1500);
      onShowToast(`Kura için en az ${drawCount} kişi gerekli!`);
      return;
    }

    setIsDrawing(true);
    setIsWinnerRevealed(false);
    setDisplaySubtext('Kader belirleniyor...');
    soundEngine.playClick();

    let counter = 0;
    const shuffleInterval = setInterval(() => {
      soundEngine.playTone(380 + (counter % 8) * 30, 0.03, 'sine', 0.1);
      const rand = participants[Math.floor(Math.random() * participants.length)];
      setDisplayText(rand);
      counter++;
    }, 75);

    // End draw after countdown duration
    setTimeout(() => {
      clearInterval(shuffleInterval);

      // Pick winners
      const pool = [...participants];
      const chosen: string[] = [];
      for (let i = 0; i < drawCount; i++) {
        if (pool.length === 0) break;
        const idx = Math.floor(Math.random() * pool.length);
        chosen.push(pool[idx]);
        pool.splice(idx, 1);
      }

      const winnerTitle = chosen.length === 1 ? `🎉 ${chosen[0]}!` : `🔥 ${chosen.join(' vs ')}!`;
      const subTitle = chosen.length === 1 ? 'Şanslı Kişi Seçildi!' : 'Düello Başlıyor!';

      setDisplayText(winnerTitle);
      setDisplaySubtext(subTitle);

      // Random task
      const randTask = PARTY_TASKS[Math.floor(Math.random() * PARTY_TASKS.length)];
      setPartyTask(randTask);
      setIsWinnerRevealed(true);
      setIsDrawing(false);

      soundEngine.playVictory();

      // Confetti burst
      try {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {
        // fallback
      }

      // Add to history
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setHistory((prev) => [
        { id: `hist-${Date.now()}`, names: chosen, time: timeStr },
        ...prev.slice(0, 9)
      ]);

      onShowToast(chosen.length === 1 ? `Şanslı Kişi: ${chosen[0]}` : `Düello: ${chosen.join(' vs ')}`);

      // If removeWinner toggle is active
      if (removeWinner) {
        setParticipants((prev) => prev.filter((p) => !chosen.includes(p)));
      }
    }, countdownDuration);
  };

  // Copy Result & Task
  const handleCopyResult = () => {
    const text = `${displayText} - Görev: "${partyTask}"`;
    navigator.clipboard.writeText(`Party Box İsim Çekilişi: ${text}`);
    setIsCopied(true);
    soundEngine.playClick();
    onShowToast('Kura sonucu panoya kopyalandı!');
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Pass Task (Get New Task)
  const handlePassTask = () => {
    soundEngine.playClick();
    const randTask = PARTY_TASKS[Math.floor(Math.random() * PARTY_TASKS.length)];
    setPartyTask(randTask);
    onShowToast('Yeni parti görevi atandı! 🎭');
  };

  return (
    <div className="flex-1 flex flex-col w-full pb-8 space-y-4 select-none">
      {/* Page Banner / Subheader */}
      <div className="relative overflow-hidden rounded-3xl bg-[#111827] border border-white/10 p-5 shadow-xl">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-pink-500/20 blur-2xl pointer-events-none" />
        <div className="absolute -left-6 -bottom-6 w-28 h-28 rounded-full bg-cyan-500/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex items-start justify-between">
          <div className="flex flex-col pr-3">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[11px] font-black uppercase tracking-wider">
                <Shuffle className="w-3 h-3 mr-1" />
                Kura Modu
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-[#bef264]">
                {participants.length} Kişi Hazır
              </span>
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight">İsimden Seç</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              İsimleri ekle, seçimi şansa bırak. Pas geçmek serbest!
            </p>
          </div>

          <button
            type="button"
            onClick={handleLoadPreset}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 text-cyan-400 text-xs font-bold shadow-md active:scale-95 transition-all"
            title="Hızlı Örnek Liste"
          >
            <Wand2 className="w-4 h-4 text-cyan-400" />
            <span>Örnek</span>
          </button>
        </div>
      </div>

      {/* Interactive Participant Input Well */}
      <div className="rounded-3xl bg-[#111827] border border-white/10 p-4 shadow-xl flex flex-col gap-3.5">
        <form onSubmit={handleAddName} className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-gray-500">
              <UserPlus className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              maxLength={20}
              placeholder="Katılımcı adı yaz..."
              className="w-full bg-black/40 text-white text-xs placeholder:text-gray-500 rounded-full pl-11 pr-4 py-3 outline-none border border-white/10 focus:border-cyan-400 focus:shadow-[0_0_16px_rgba(76,215,246,0.25)] transition-all shadow-inner"
            />
          </div>
          <button
            type="submit"
            className="w-12 h-12 rounded-full bg-[#f751a1] text-white flex items-center justify-center shrink-0 shadow-[0_0_18px_rgba(247,81,161,0.4)] active:scale-90 transition-transform hover:brightness-110"
          >
            <Plus className="w-5 h-5" />
          </button>
        </form>

        {/* Active Name Chips */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-gray-400 text-xs font-bold">
            <span className="uppercase tracking-wider text-[10px]">
              Havuzdaki İsimler ({participants.length})
            </span>
            {participants.length > 0 && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-pink-400 hover:text-pink-300 text-[11px] font-bold hover:underline transition-all flex items-center gap-1"
              >
                <Trash2 className="w-3 h-3" />
                Temizle
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2 min-h-[44px] max-h-36 overflow-y-auto p-1 items-center">
            {participants.map((name, index) => (
              <div
                key={index}
                className="group inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-black/40 border border-white/5 text-gray-200 text-xs font-bold shadow-sm transition-all duration-200 hover:scale-105"
              >
                <span className="w-2 h-2 rounded-full bg-[#06b6d4]" />
                <span className="select-none">{name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveName(index)}
                  className="w-4 h-4 rounded-full flex items-center justify-center text-gray-400 hover:text-red-400 hover:bg-white/10 transition-colors ml-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {participants.length === 0 && (
              <span className="text-xs text-gray-500 italic py-2">
                Liste boş. Yukarıdan isim ekleyin veya Örnek butonuna tıklayın.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Drawing Rules Bento Card (Kura Kuralları) */}
      <div className="rounded-3xl bg-[#111827] border border-white/10 p-4 shadow-xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-white flex items-center gap-1.5">
            <Sliders className="w-4 h-4 text-[#ec4899]" />
            Kura Kuralları
          </span>
          <span className="text-[10px] text-gray-400 font-bold uppercase">Canlı Ayarlar</span>
        </div>

        {/* Option Tiles: Draw Count */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-gray-400 font-bold">Seçilecek Kişi Sayısı</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setDrawCount(1);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-full text-xs font-extrabold transition-all ${
                drawCount === 1
                  ? 'bg-[#f751a1] text-white shadow-[0_0_12px_rgba(247,81,161,0.4)] glow-pink'
                  : 'bg-black/30 border border-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              <span>1 Kişi (Tekli)</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setDrawCount(2);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-full text-xs font-extrabold transition-all ${
                drawCount === 2
                  ? 'bg-[#f751a1] text-white shadow-[0_0_12px_rgba(247,81,161,0.4)] glow-pink'
                  : 'bg-black/30 border border-white/5 text-gray-400 hover:text-white'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>2 Kişi (Düello)</span>
            </button>
          </div>
        </div>

        {/* Toggle: Remove Winner from pool */}
        <div className="flex items-center justify-between py-2 px-3.5 rounded-2xl bg-black/35 border border-white/5">
          <div className="flex items-center gap-2.5">
            <UserMinus className="w-5 h-5 text-cyan-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-white leading-tight">Tekrarsız Mod</span>
              <span className="text-[10px] text-gray-400">Seçilen kişi havuzdan çıksın</span>
            </div>
          </div>

          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={removeWinner}
              onChange={(e) => {
                soundEngine.playClick();
                setRemoveWinner(e.target.checked);
              }}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#06b6d4]" />
          </label>
        </div>

        {/* Speed Presets */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] text-gray-400 font-bold">Geri Sayım Hızı</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: '⚡ Hızlı (2s)', duration: 2000 },
              { label: '✨ Standart (3s)', duration: 3000 },
              { label: '🔥 Gerilimli (5s)', duration: 5000 }
            ].map((speed) => {
              const isSelected = countdownDuration === speed.duration;
              return (
                <button
                  key={speed.duration}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setCountdownDuration(speed.duration);
                  }}
                  className={`py-2 px-1 rounded-full text-[11px] font-bold text-center transition-all ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-black/30 border border-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {speed.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Big Interactive Drawing Stage Area */}
      <div className="relative rounded-3xl bg-[#111827] border border-white/10 p-6 shadow-2xl overflow-hidden flex flex-col items-center justify-center min-h-[290px] text-center">
        {/* Neon back glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-pink-500/10 via-transparent to-purple-500/10 pointer-events-none" />

        <div className="relative z-10 w-full flex flex-col items-center">
          {/* Slot Drum / Shuffling Display */}
          <div className="w-full h-24 mb-4 flex items-center justify-center rounded-2xl bg-black/50 border border-white/10 shadow-inner px-4 relative overflow-hidden">
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />

            <div className="flex flex-col items-center justify-center">
              <span
                className={`text-2xl font-black tracking-tight transition-all duration-150 drop-shadow-[0_0_12px_rgba(196,244,66,0.6)] ${
                  isDrawing ? 'text-white scale-110' : 'text-[#bef264]'
                }`}
              >
                {displayText}
              </span>
              <span className="text-[11px] text-gray-400 uppercase tracking-wider mt-1 font-bold">
                {displaySubtext}
              </span>
            </div>
          </div>

          {/* Action Trigger Button */}
          <button
            type="button"
            onClick={handleTriggerDraw}
            disabled={isDrawing || participants.length === 0}
            className="w-full py-4 px-6 rounded-full bg-gradient-to-r from-[#f751a1] via-[#ec4899] to-[#f751a1] hover:brightness-110 active:scale-95 text-white text-base font-black shadow-[0_0_24px_rgba(247,81,161,0.5)] flex items-center justify-center gap-3 transition-transform glow-pink disabled:opacity-50"
          >
            <Dices className={`w-6 h-6 ${isDrawing ? 'animate-spin' : ''}`} />
            <span>
              {isDrawing
                ? 'Karıştırılıyor...'
                : isWinnerRevealed
                ? 'Yeniden Çek!'
                : drawCount === 1
                ? 'Birini Seç!'
                : 'Düelloyu Başlat!'}
            </span>
          </button>

          {/* Winner Actions / Party Dares (Revealed upon draw!) */}
          {isWinnerRevealed && (
            <div className="w-full mt-4 flex flex-col gap-2.5 animate-in zoom-in-95 duration-200">
              <div className="p-3.5 rounded-2xl bg-black/40 border border-amber-500/20 flex items-start gap-3 text-left">
                <div className="w-8 h-8 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 text-base">
                  🎭
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-amber-400 uppercase font-black tracking-wider block">
                    Parti Görevi
                  </span>
                  <p className="text-xs text-gray-200 mt-0.5 leading-snug font-medium italic">
                    "{partyTask}"
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopyResult}
                  className="py-2.5 px-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-transform"
                >
                  {isCopied ? <Check className="w-4 h-4 text-lime-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
                  <span>{isCopied ? 'Kopyalandı!' : 'Kopyala'}</span>
                </button>

                <button
                  type="button"
                  onClick={handlePassTask}
                  className="py-2.5 px-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 active:scale-95 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-transform"
                >
                  <SkipForward className="w-4 h-4 text-pink-400" />
                  <span>Pas Geç</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent History Log (Çekilenler Geçmişi) */}
      <div className="rounded-3xl bg-[#111827] border border-white/10 p-4 shadow-md flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-white flex items-center gap-1.5">
            <History className="w-4 h-4 text-purple-400" />
            Çekilenler Geçmişi
          </span>
          <span className="text-[10px] text-gray-400 font-bold">{history.length} kayıt</span>
        </div>

        <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
          {history.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2.5 rounded-2xl bg-black/30 border border-white/5 text-xs animate-in fade-in"
            >
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#bef264]" />
                <span className="font-black text-[#bef264]">{item.names.join(' & ')}</span>
              </div>
              <span className="text-[11px] text-gray-400 font-mono">{item.time}</span>
            </div>
          ))}

          {history.length === 0 && (
            <div className="py-4 text-center text-gray-500 text-xs italic">
              Henüz kura çekilmedi.
            </div>
          )}
        </div>
      </div>

      {/* Dedicated bottom clearance spacer */}
      <div className="h-20 sm:h-24 w-full shrink-0 pointer-events-none" aria-hidden="true" />
    </div>
  );
};
