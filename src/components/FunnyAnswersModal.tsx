import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Trophy,
  RotateCcw,
  Laugh,
  Send,
  ThumbsUp,
  Flame,
  Award,
  ChevronRight
} from 'lucide-react';
import { soundEngine } from '../utils/audio';
import { TablePlayer, loadTablePlayers } from '../utils/playerManager';

interface FunnyAnswersModalProps {
  isOpen: boolean;
  onClose: () => void;
  players?: TablePlayer[];
  onShowToast: (msg: string) => void;
}

const FUNNY_PROMPTS = [
  'İlk buluşmada hesap gelirken söylenebilecek en fena bahane nedir?',
  'Asansörde 5 kişiyle kalmışken havayı yumuşatmak için ne söylersin?',
  'Patronuna yanlışlıkla attığın en utanç verici WhatsApp mesajı ne olurdu?',
  'Bir uzaylıyla karşılaştığında insanlık adına söyleyeceğin ilk cümle?',
  'Cenazede aniden kahkaha atarsan durumu kurtarmak için ne uydurursun?',
  'Gelecekten gelen torunun sana ilk ne söylese şoktan bayılırsın?',
  'Market kasasında paranın yetmediğini anlayınca kasiyere ne dersin?',
  'Evlilik teklifi ederken yüzüğün yerine cebinden çıkabilecek en absürt şey?'
];

const PRESET_FUNNY_ANSWERS = [
  'Cüzdanımı dün gece rüyamda harcadım...',
  'Gözüme toz kaçtı ama kalbim gülüyor!',
  'Bunu patronuma değil astroloğuma soracaktım!',
  'Bizim gezegende selamlaşma böyle yapılıyor.',
  'Beni kaçırın ama lütfen pazartesi mesaisinden önce değil.',
  'Aslında ben buraya sadece bedava Wi-Fi için gelmiştim.',
  'Yanlış numara ama kader bizi birleştirdi!',
  'Teklif değil bu sadece taksit erteleme bildirimi.'
];

export const FunnyAnswersModal: React.FC<FunnyAnswersModalProps> = ({
  isOpen,
  onClose,
  players = [],
  onShowToast
}) => {
  const activePlayers = players.length > 0 ? players : loadTablePlayers();
  const [soundActive, setSoundActive] = useState<boolean>(true);
  const [promptIdx, setPromptIdx] = useState<number>(0);
  const currentPrompt = FUNNY_PROMPTS[promptIdx];

  // Game Steps: 'writing' -> 'voting' -> 'results'
  const [step, setStep] = useState<'writing' | 'voting' | 'results'>('writing');
  const [customInput, setCustomInput] = useState<string>('');
  const [answersList, setAnswersList] = useState<{ id: string; author: string; text: string; votes: number }[]>([]);
  const [hasVoted, setHasVoted] = useState<boolean>(false);

  // Initialize or reroll prompt
  const handleNextPrompt = () => {
    soundEngine.playClick();
    setPromptIdx((prev) => (prev + 1) % FUNNY_PROMPTS.length);
    setStep('writing');
    setCustomInput('');
    setAnswersList([]);
    setHasVoted(false);
  };

  // Submit Answer
  const handleSubmitAnswer = () => {
    if (!customInput.trim()) {
      onShowToast('Lütfen komik bir cevap yazın veya hazır olanlardan seçin!');
      return;
    }
    soundEngine.playClick();
    soundEngine.triggerHaptic('drop');

    // Build anonymized responses for the table
    const myAnswer = {
      id: 'ans-0',
      author: activePlayers[0]?.name || 'Sen',
      text: customInput.trim(),
      votes: 0
    };

    // Generate random funny answers for other active players
    const otherAnswers = activePlayers.slice(1, 4).map((p, idx) => ({
      id: `ans-${idx + 1}`,
      author: p.name,
      text: PRESET_FUNNY_ANSWERS[(promptIdx + idx * 2) % PRESET_FUNNY_ANSWERS.length],
      votes: 0
    }));

    // Shuffle so author is anonymous during voting
    const combined = [myAnswer, ...otherAnswers].sort(() => Math.random() - 0.5);
    setAnswersList(combined);
    setStep('voting');
    onShowToast('Cevaplar toplandı! En komiğini oylayın!');
  };

  // Vote on an answer
  const handleVote = (answerId: string) => {
    if (hasVoted) return;
    soundEngine.playTone(600, 0.1, 'sine');
    soundEngine.triggerHaptic('touch');
    setHasVoted(true);

    setAnswersList((prev) =>
      prev.map((a) => {
        // Randomly simulate other players voting too
        const extraVotes = a.id === answerId ? 1 : Math.random() < 0.4 ? 1 : 0;
        return { ...a, votes: a.votes + extraVotes };
      })
    );

    setTimeout(() => {
      setStep('results');
      soundEngine.playVictory();
      soundEngine.triggerHaptic('win');
      try {
        confetti({ particleCount: 90, spread: 70, origin: { y: 0.6 } });
      } catch {
        // ignore
      }
    }, 400);
  };

  if (!isOpen) return null;

  const sortedResults = [...answersList].sort((a, b) => b.votes - a.votes);
  const winner = sortedResults[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-2 select-none">
      <div className="relative w-full max-w-md h-[94dvh] sm:h-[96vh] max-h-[890px] bg-[#0a0e18] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl">
        
        {/* ================= FIXED TOP HEADER ================= */}
        <header className="w-full pt-safe bg-[#0a0e18]/90 backdrop-blur-xl border-b border-white/10 shrink-0">
          <div className="h-16 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-10 h-10 rounded-2xl bg-[#1c1f2a] flex items-center justify-center text-amber-400 text-xl shrink-0">
                😂
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="font-bold text-base text-white tracking-tight leading-none truncate">
                    En Komik Cevap
                  </h1>
                  <span className="w-2 h-2 rounded-full bg-[#C4F442] animate-pulse shrink-0" />
                </div>
                <span className="text-[10px] text-[#4cd7f6] tracking-wider uppercase font-mono mt-1 truncate">
                  Masa Kahkaha Oylaması
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  const s = soundEngine.toggleSound();
                  setSoundActive(s);
                }}
                className="w-10 h-10 rounded-full bg-[#1c1f2a] hover:bg-white/10 flex items-center justify-center text-gray-300 transition-colors"
                title="Ses Açık/Kapalı"
              >
                {soundActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-red-500/20 hover:bg-red-500/30 flex items-center justify-center text-red-300 transition-colors"
                title="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </header>

        {/* ================= MAIN SCROLLABLE CONTENT ================= */}
        <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3.5 no-scrollbar">
          
          {/* Prompt Card */}
          <div className="relative rounded-2xl bg-gradient-to-br from-amber-500/15 via-[#111827] to-[#121c2d] border border-amber-500/30 p-4 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                DURUM KARTI #{promptIdx + 1}
              </span>
              <button
                onClick={handleNextPrompt}
                className="text-[11px] text-cyan-400 hover:text-cyan-300 font-bold"
              >
                Yeni Soru &gt;
              </button>
            </div>
            <h2 className="text-base font-black text-white leading-snug">
              "{currentPrompt}"
            </h2>
          </div>

          {/* STEP 1: WRITING */}
          {step === 'writing' && (
            <div className="flex flex-col gap-3 flex-1 justify-between">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-300">
                  En absürt ve komik cevabını yaz:
                </label>
                <textarea
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="Buraya yaz... Masayı kahkahaya boğ!"
                  rows={3}
                  className="w-full bg-[#111827] border border-white/10 rounded-2xl p-3 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                />

                {/* Preset Suggestions */}
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1">
                  Veya hazır ilham al:
                </span>
                <div className="flex flex-col gap-1.5">
                  {PRESET_FUNNY_ANSWERS.slice(0, 3).map((preset, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCustomInput(preset)}
                      className="p-2 rounded-xl bg-white/5 border border-white/10 hover:border-amber-400 text-left text-xs text-gray-300 transition-all"
                    >
                      "{preset}"
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSubmitAnswer}
                className="w-full py-3.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(251,191,36,0.4)] active:scale-95 transition-all"
              >
                <Send className="w-4 h-4" />
                <span>Cevabı Gönder &amp; Oylamaya Geç</span>
              </button>
            </div>
          )}

          {/* STEP 2: VOTING */}
          {step === 'voting' && (
            <div className="flex flex-col gap-3 flex-1">
              <div>
                <h3 className="text-sm font-black text-white">En Komik Cevaba Oy Ver!</h3>
                <p className="text-[11px] text-gray-400">
                  Cevaplar anonimdir, en çok güldüğüne dokun:
                </p>
              </div>

              <div className="flex flex-col gap-2.5 my-auto">
                {answersList.map((ans, idx) => (
                  <button
                    key={ans.id}
                    onClick={() => handleVote(ans.id)}
                    className="p-3.5 rounded-2xl bg-[#111827] border border-white/10 hover:border-amber-400 flex items-center justify-between text-left active:scale-[0.98] transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center font-bold text-xs text-amber-400 group-hover:bg-amber-400 group-hover:text-black transition-colors">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-white">"{ans.text}"</span>
                    </div>
                    <ThumbsUp className="w-4 h-4 text-gray-500 group-hover:text-amber-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: RESULTS */}
          {step === 'results' && winner && (
            <div className="flex flex-col items-center justify-center text-center my-auto gap-4 py-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-[#f751a1] p-0.5 shadow-2xl animate-bounce">
                <div className="w-full h-full bg-[#0a0e18] rounded-[22px] flex items-center justify-center text-2xl">
                  👑
                </div>
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                  MASANIN KAHKAHA ŞAMPİYONU
                </span>
                <h2 className="text-xl font-black text-white mt-1">
                  {winner.author} Kazandı! ({winner.votes} Oy)
                </h2>
                <p className="text-xs text-amber-200 mt-1 font-semibold">
                  "{winner.text}"
                </p>
              </div>

              {/* All results */}
              <div className="w-full flex flex-col gap-1.5 my-2">
                {sortedResults.map((r, idx) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between p-2 rounded-xl bg-white/5 border border-white/10 text-xs"
                  >
                    <span className="font-bold text-white">{r.author}: "{r.text}"</span>
                    <span className="font-mono text-amber-400 font-black">{r.votes} Oy</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2 w-full mt-2">
                <button
                  onClick={handleNextPrompt}
                  className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Sonraki Soru</span>
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 py-3 rounded-xl bg-amber-400 text-black font-black text-xs"
                >
                  Bitir
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
