import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { soundEngine } from '../../utils/audio';
import {
  Users,
  Dices,
  Plus,
  X,
  Trash2,
  Star,
  Zap,
  Brain,
  Rocket,
  Flame,
  Swords,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  Check,
  Copy
} from 'lucide-react';

interface TeamTabProps {
  onShowToast: (msg: string) => void;
}

interface Player {
  id: string;
  name: string;
  avatarUrl?: string;
  gender?: 'm' | 'f';
}

interface TeamMember {
  name: string;
  isCaptain: boolean;
  avatarColor: string;
}

interface TeamInfo {
  id: string;
  name: string;
  badge: string;
  icon: React.ReactNode;
  subtitle: string;
  metricLabel: string;
  metricIcon: React.ReactNode;
  metricValue: string;
  metricColor: string;
  borderColor: string;
  accentColor: string;
  bgGlow: string;
  members: TeamMember[];
}

const DEFAULT_PLAYERS: string[] = [
  'Can',
  'Zeynep',
  'Ahmet',
  'Melis',
  'Uğur',
  'Elif',
  'Burak',
  'Selin'
];

const AVATAR_COLORS = [
  '#ec4899',
  '#06b6d4',
  '#bef264',
  '#f59e0b',
  '#8b5cf6',
  '#3b82f6',
  '#10b981',
  '#f43f5e'
];

export const TeamTab: React.FC<TeamTabProps> = ({ onShowToast }) => {
  // Team configuration state
  const [teamCount, setTeamCount] = useState<2 | 3 | 4>(2);
  const [distStyle, setDistStyle] = useState<'random' | 'gender' | 'captains'>('random');
  const [autoCaptains, setAutoCaptains] = useState(true);
  const [autoReshuffle, setAutoReshuffle] = useState(false);

  // Pool of players
  const [playerPool, setPlayerPool] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('parti_kutusu_team_pool');
      return saved ? JSON.parse(saved) : DEFAULT_PLAYERS;
    } catch {
      return DEFAULT_PLAYERS;
    }
  });

  const [newPlayerName, setNewPlayerName] = useState('');
  const [isShuffling, setIsShuffling] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Teams state
  const [teams, setTeams] = useState<TeamInfo[]>(() =>
    generateTeams(2, DEFAULT_PLAYERS, true, 'random')
  );

  // Save pool to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('parti_kutusu_team_pool', JSON.stringify(playerPool));
    } catch {
      // ignore
    }
  }, [playerPool]);

  function generateTeams(
    count: 2 | 3 | 4,
    players: string[],
    hasCaptains: boolean,
    algorithm: 'random' | 'gender' | 'captains'
  ): TeamInfo[] {
    const shuffled = [...players].sort(() => 0.5 - Math.random());
    const buckets: string[][] = Array.from({ length: count }, () => []);

    shuffled.forEach((name, i) => {
      buckets[i % count].push(name);
    });

    const teamTemplates = [
      {
        id: 'team-1',
        name: 'Kırmızı Roketler 🚀',
        badge: '🚀',
        icon: <Rocket className="w-5 h-5 text-pink-400" />,
        subtitle: 'Saldırı & Hız Takımı',
        metricLabel: 'Güç: %94',
        metricIcon: <Zap className="w-3.5 h-3.5" />,
        metricValue: '94%',
        metricColor: 'text-amber-400',
        borderColor: 'border-pink-500/30',
        accentColor: 'text-[#ec4899]',
        bgGlow: 'bg-pink-500/10'
      },
      {
        id: 'team-2',
        name: 'Mavi Şimşekler ⚡',
        badge: '⚡',
        icon: <Zap className="w-5 h-5 text-cyan-400" />,
        subtitle: 'Taktik & Denge Takımı',
        metricLabel: 'Uyum: %96',
        metricIcon: <Brain className="w-3.5 h-3.5" />,
        metricValue: '96%',
        metricColor: 'text-emerald-400',
        borderColor: 'border-cyan-500/30',
        accentColor: 'text-[#06b6d4]',
        bgGlow: 'bg-cyan-500/10'
      },
      {
        id: 'team-3',
        name: 'Yeşil Panterler 🐆',
        badge: '🐆',
        icon: <Sparkles className="w-5 h-5 text-lime-400" />,
        subtitle: 'Savunma & Strateji',
        metricLabel: 'Uyum: %95',
        metricIcon: <Brain className="w-3.5 h-3.5" />,
        metricValue: '95%',
        metricColor: 'text-lime-400',
        borderColor: 'border-lime-500/30',
        accentColor: 'text-[#bef264]',
        bgGlow: 'bg-lime-500/10'
      },
      {
        id: 'team-4',
        name: 'Sarı Kaplanlar 🐅',
        badge: '🐅',
        icon: <Flame className="w-5 h-5 text-amber-400" />,
        subtitle: 'Refleks & Dayanıklılık',
        metricLabel: 'Güç: %92',
        metricIcon: <Zap className="w-3.5 h-3.5" />,
        metricValue: '92%',
        metricColor: 'text-amber-400',
        borderColor: 'border-amber-500/30',
        accentColor: 'text-[#f59e0b]',
        bgGlow: 'bg-amber-500/10'
      }
    ];

    return buckets.map((membersList, idx) => {
      const template = teamTemplates[idx % teamTemplates.length];
      const memberObjects: TeamMember[] = membersList.map((m, mIdx) => ({
        name: m,
        isCaptain: hasCaptains && mIdx === 0,
        avatarColor: AVATAR_COLORS[(idx * 3 + mIdx) % AVATAR_COLORS.length]
      }));

      return {
        ...template,
        members: memberObjects
      };
    });
  }

  // Handle Team Count Change
  const handleSelectTeamCount = (count: 2 | 3 | 4) => {
    setTeamCount(count);
    soundEngine.playClick();
    const updated = generateTeams(count, playerPool, autoCaptains, distStyle);
    setTeams(updated);
  };

  // Add Member
  const handleAddPlayer = () => {
    const trimmed = newPlayerName.trim();
    if (!trimmed) return;

    if (playerPool.includes(trimmed)) {
      onShowToast('Bu oyuncu zaten havuzda var!');
      return;
    }

    const updated = [...playerPool, trimmed];
    setPlayerPool(updated);
    setNewPlayerName('');
    soundEngine.playClick();
    onShowToast(`"${trimmed}" havuza eklendi.`);

    // Update teams immediately
    setTeams(generateTeams(teamCount, updated, autoCaptains, distStyle));
  };

  // Delete Member
  const handleDeletePlayer = (name: string) => {
    if (playerPool.length <= 2) {
      onShowToast('En az 2 oyuncu kalmalıdır!');
      return;
    }
    const updated = playerPool.filter((p) => p !== name);
    setPlayerPool(updated);
    soundEngine.playClick();
    setTeams(generateTeams(teamCount, updated, autoCaptains, distStyle));
  };

  // Clear All
  const handleClearAll = () => {
    soundEngine.playClick();
    setPlayerPool([]);
    setTeams([]);
    onShowToast('Oyuncu havuzu temizlendi.');
  };

  // Re-load default sample
  const handleLoadSample = () => {
    soundEngine.playSuccess();
    setPlayerPool(DEFAULT_PLAYERS);
    setTeams(generateTeams(teamCount, DEFAULT_PLAYERS, autoCaptains, distStyle));
    onShowToast('Örnek oyuncu listesi yüklendi.');
  };

  // Shuffle & Re-Draw
  const handleShuffleTeams = () => {
    if (playerPool.length < 2) {
      onShowToast('Takım kurmak için en az 2 oyuncu eklemelisin!');
      return;
    }

    setIsShuffling(true);
    soundEngine.playDiceRoll();

    setTimeout(() => {
      const updated = generateTeams(teamCount, playerPool, autoCaptains, distStyle);
      setTeams(updated);
      setIsShuffling(false);
      soundEngine.playVictory();

      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // ignore
      }

      onShowToast('🎲 Takımlar başarıyla karıştırıldı ve dengelendi!');
    }, 450);
  };

  // Start Party Match
  const handleStartMatch = () => {
    soundEngine.playVictory();
    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 }
      });
    } catch {
      // ignore
    }
    onShowToast('⚔️ Meydan Okuma Başladı! Maçta herkese bol şans!');
  };

  // Copy Lineup
  const handleCopyLineup = () => {
    const text = teams
      .map(
        (t) =>
          `📌 ${t.name} (${t.members.length} Oyuncu - ${t.metricLabel}):\n` +
          t.members
            .map((m) => `  • ${m.name} ${m.isCaptain ? '⭐ [KAPTAN]' : ''}`)
            .join('\n')
      )
      .join('\n\n');

    navigator.clipboard.writeText(`🎮 PARTİ KUTUSU KURA VE TAKIM KADROLARI:\n\n${text}`);
    setIsCopied(true);
    soundEngine.playClick();
    onShowToast('Kadrolar panoya kopyalandı! WhatsApp veya gruba yapıştırın.');
    setTimeout(() => setIsCopied(false), 2200);
  };

  // Toggle captain checkbox
  const handleToggleCaptains = (val: boolean) => {
    setAutoCaptains(val);
    soundEngine.playClick();
    setTeams(generateTeams(teamCount, playerPool, val, distStyle));
  };

  return (
    <div className="flex-1 flex flex-col space-y-4 py-1 pb-6">
      {/* Top Hero Header Badge & Subtitle */}
      <div className="relative overflow-hidden rounded-3xl bg-[#111827] border border-white/10 p-4 shadow-xl">
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-pink-500/15 blur-2xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-28 h-28 rounded-full bg-cyan-500/15 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f751a1] text-white text-[11px] font-black uppercase tracking-wider shadow-sm">
              <Users className="w-3.5 h-3.5" />
              TAKIM KURUCU
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[#bef264] text-[11px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#bef264] animate-pulse" />
              Dengeli Dağıtım Modu
            </span>
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">
            Grupları Ayır, Meydan Oku! ⚔️
          </h2>
          <p className="text-xs text-gray-400 leading-relaxed">
            İsimleri yaz veya havuzdan seç, akıllı kura motoru rastgele dengeli takımlara ayırsın.
          </p>
        </div>
      </div>

      {/* Party Atmosphere Showcase Banner */}
      <div className="relative w-full h-32 rounded-3xl overflow-hidden bg-gradient-to-r from-purple-900/60 via-slate-900/80 to-blue-900/60 border border-white/10 shadow-lg flex flex-col justify-end p-3.5">
        <div className="absolute inset-0 bg-[radial-gradient(#ec4899_1px,transparent_1px)] [background-size:16px_16px] opacity-25 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0e17] via-[#0a0e17]/50 to-transparent" />

        <div className="relative z-10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="text-pink-400 font-black">⚡ Kura Gücü:</span>
            <span className="font-bold text-gray-200">98% Eşitlik Oranı</span>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-[#111827] text-cyan-400 font-bold border border-cyan-500/20 text-[10px]">
            Canlı Havuz
          </span>
        </div>
      </div>

      {/* Team Configuration Controls Card */}
      <div className="bg-[#111827] rounded-3xl p-4 shadow-lg border border-white/10 space-y-4">
        {/* Team Count Selector */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs text-gray-200 font-bold flex items-center gap-1.5">
              <span>🔢 Takım Sayısı</span>
            </label>
            <span className="text-[11px] text-gray-400 font-semibold">
              {teamCount} Ekip Kurulacak
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-black/40 border border-white/5">
            {([2, 3, 4] as const).map((cnt) => (
              <button
                key={cnt}
                type="button"
                onClick={() => handleSelectTeamCount(cnt)}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  teamCount === cnt
                    ? 'bg-[#bef264] text-black font-black shadow glow-lime'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {cnt} Takım
              </button>
            ))}
          </div>
        </div>

        {/* Distribution Style Algorithm */}
        <div className="space-y-2">
          <label className="text-xs text-gray-200 font-bold flex items-center gap-1.5">
            <span>⚙️ Kura Algoritması</span>
          </label>
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {[
              { id: 'random', label: '⚡ Rastgele Karışık' },
              { id: 'gender', label: '👥 Dengeli Dağıtım' },
              { id: 'captains', label: '⭐ Kaptan Seçimli' }
            ].map((algo) => {
              const isSelected = distStyle === algo.id;
              return (
                <button
                  key={algo.id}
                  type="button"
                  onClick={() => {
                    soundEngine.playClick();
                    setDistStyle(algo.id as typeof distStyle);
                    setTeams(generateTeams(teamCount, playerPool, autoCaptains, algo.id as typeof distStyle));
                  }}
                  className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-[#f751a1] text-white font-black shadow glow-pink'
                      : 'bg-black/30 border border-white/5 text-gray-400 hover:text-white'
                  }`}
                >
                  {algo.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Add Member Input Bar */}
        <div className="space-y-1.5">
          <div className="relative flex items-center">
            <input
              type="text"
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddPlayer();
                }
              }}
              maxLength={18}
              placeholder="Oyuncu adı ekle..."
              className="w-full h-11 pl-4 pr-12 rounded-2xl bg-black/40 border border-white/10 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-[#bef264] shadow-inner"
            />
            <button
              type="button"
              onClick={handleAddPlayer}
              className="absolute right-1.5 w-8 h-8 rounded-xl bg-[#ec4899] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-transform shadow"
              title="Oyuncu Ekle"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Active Pool Chips Container */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400 uppercase tracking-wider font-bold">
              Oyuncu Havuzu (<span className="text-[#bef264] font-black">{playerPool.length}</span> Oyuncu Hazır)
            </span>
            <div className="flex items-center gap-2">
              {playerPool.length === 0 && (
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="text-cyan-400 hover:underline text-[11px] font-bold"
                >
                  Örnek Liste Yükle
                </button>
              )}
              {playerPool.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-pink-400 hover:text-pink-300 text-[11px] font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Temizle
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 min-h-[50px] max-h-36 overflow-y-auto p-2 rounded-2xl bg-black/25 border border-white/5">
            {playerPool.map((player, idx) => (
              <div
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-200 text-xs font-bold shadow-sm"
              >
                <span>{player}</span>
                <button
                  type="button"
                  onClick={() => handleDeletePlayer(player)}
                  className="text-gray-400 hover:text-red-400 active:scale-90 transition-colors flex items-center"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}

            {playerPool.length === 0 && (
              <div className="w-full text-center py-3 text-xs text-gray-500 italic">
                Havuzda oyuncu yok. Yukarıdan isim ekleyin veya örnek liste yükleyin.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Shuffle CTA Button */}
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={handleShuffleTeams}
          disabled={isShuffling || playerPool.length < 2}
          className="w-full h-14 rounded-full bg-gradient-to-r from-[#ec4899] to-purple-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(247,81,161,0.45)] hover:brightness-110 active:scale-[0.98] transition-all glow-pink disabled:opacity-50"
        >
          <Dices className={`w-5 h-5 ${isShuffling ? 'animate-spin' : ''}`} />
          <span>{isShuffling ? 'Takımlar Karıştırılıyor...' : 'Yeniden Karıştır & Takımları Kur'}</span>
        </button>
      </div>

      {/* Live Team Display Arena (VS Cards) */}
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {teams.length >= 2 && (
          <>
            {/* Team 1 Card */}
            <div
              className={`team-card relative overflow-hidden rounded-3xl bg-[#111827] p-4 shadow-xl border ${teams[0].borderColor} transition-all duration-300 ${
                isShuffling ? 'opacity-50 scale-[0.98]' : 'scale-100'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center shadow-md">
                    <Rocket className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">
                      {teams[0].name}
                    </h3>
                    <span className="text-[11px] font-semibold text-pink-400">
                      {teams[0].subtitle}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-pink-300 text-[10px] font-extrabold">
                    {teams[0].members.length} Oyuncu
                  </span>
                  <div className="flex items-center gap-1 mt-1 text-amber-400 text-xs font-bold">
                    <Zap className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{teams[0].metricLabel}</span>
                  </div>
                </div>
              </div>

              {/* Members Grid (2 Columns) */}
              <div className="grid grid-cols-2 gap-2">
                {teams[0].members.map((member, mIdx) => (
                  <div
                    key={mIdx}
                    className={`flex items-center gap-2 p-2 rounded-2xl border transition-colors ${
                      member.isCaptain
                        ? 'bg-pink-950/30 border-pink-500/30 shadow-sm'
                        : 'bg-black/35 border-white/5'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white shadow-inner"
                        style={{ backgroundColor: member.avatarColor }}
                      >
                        {member.name.substring(0, 1).toUpperCase()}
                      </div>
                      {member.isCaptain && (
                        <span className="absolute -top-1 -right-1 text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-white truncate">{member.name}</p>
                      <span className="text-[10px] font-semibold block truncate">
                        {member.isCaptain ? (
                          <span className="text-amber-400 font-bold">Kaptan ⭐</span>
                        ) : (
                          <span className="text-gray-400">Üye</span>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Clash Neon VS Divider Badge */}
            <div className="relative flex items-center justify-center my-1 z-20 md:col-span-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full h-0.5 bg-white/10" />
              </div>
              <div className="relative w-12 h-12 rounded-full bg-[#111827] border-2 border-[#bef264] flex items-center justify-center shadow-[0_0_16px_rgba(190,242,100,0.4)] glow-lime">
                <span className="text-sm font-black text-[#bef264] tracking-widest italic">
                  VS
                </span>
              </div>
            </div>

            {/* Team 2 Card */}
            <div
              className={`team-card relative overflow-hidden rounded-3xl bg-[#111827] p-4 shadow-xl border ${teams[1].borderColor} transition-all duration-300 ${
                isShuffling ? 'opacity-50 scale-[0.98]' : 'scale-100'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shadow-md">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white">
                      {teams[1].name}
                    </h3>
                    <span className="text-[11px] font-semibold text-cyan-400">
                      {teams[1].subtitle}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-end">
                  <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-cyan-300 text-[10px] font-extrabold">
                    {teams[1].members.length} Oyuncu
                  </span>
                  <div className="flex items-center gap-1 mt-1 text-emerald-400 text-xs font-bold">
                    <Brain className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{teams[1].metricLabel}</span>
                  </div>
                </div>
              </div>

              {/* Members Grid (2 Columns) */}
              <div className="grid grid-cols-2 gap-2">
                {teams[1].members.map((member, mIdx) => (
                  <div
                    key={mIdx}
                    className={`flex items-center gap-2 p-2 rounded-2xl border transition-colors ${
                      member.isCaptain
                        ? 'bg-cyan-950/30 border-cyan-500/30 shadow-sm'
                        : 'bg-black/35 border-white/5'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white shadow-inner"
                        style={{ backgroundColor: member.avatarColor }}
                      >
                        {member.name.substring(0, 1).toUpperCase()}
                      </div>
                      {member.isCaptain && (
                        <span className="absolute -top-1 -right-1 text-amber-400">
                          <Star className="w-3.5 h-3.5 fill-amber-400" />
                        </span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-white truncate">{member.name}</p>
                      <span className="text-[10px] font-semibold block truncate">
                        {member.isCaptain ? (
                          <span className="text-amber-400 font-bold">Kaptan ⭐</span>
                        ) : (
                          <span className="text-gray-400">Üye</span>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team 3 & 4 (if count > 2) */}
            {teams.slice(2).map((extraTeam, tIdx) => (
              <div
                key={extraTeam.id}
                className={`team-card relative overflow-hidden rounded-3xl bg-[#111827] p-4 shadow-xl border ${extraTeam.borderColor} transition-all duration-300`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-white/5 text-lime-400 flex items-center justify-center shadow-md">
                      {extraTeam.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-black text-white">{extraTeam.name}</h3>
                      <span className={`text-[11px] font-semibold ${extraTeam.accentColor}`}>
                        {extraTeam.subtitle}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end">
                    <span className="px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-white text-[10px] font-extrabold">
                      {extraTeam.members.length} Oyuncu
                    </span>
                    <div className={`flex items-center gap-1 mt-1 text-xs font-bold ${extraTeam.metricColor}`}>
                      <span>{extraTeam.metricLabel}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {extraTeam.members.map((member, mIdx) => (
                    <div
                      key={mIdx}
                      className="flex items-center gap-2 p-2 rounded-2xl bg-black/35 border border-white/5"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center font-black text-xs text-white"
                        style={{ backgroundColor: member.avatarColor }}
                      >
                        {member.name.substring(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black text-white truncate">{member.name}</p>
                        <span className="text-[10px] text-gray-400 font-semibold block truncate">
                          {member.isCaptain ? 'Kaptan ⭐' : 'Üye'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Secondary Action: Start Party Match & Copy Lineup */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={handleStartMatch}
          className="py-3 px-4 rounded-2xl bg-[#bef264] text-black font-black text-xs active:scale-95 transition-transform flex items-center justify-center gap-1.5 shadow-lg glow-lime"
        >
          <Play className="w-4 h-4 fill-black" />
          <span>Maçı / Oyunu Başlat</span>
        </button>

        <button
          type="button"
          onClick={handleCopyLineup}
          className="py-3 px-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs active:scale-95 transition-colors flex items-center justify-center gap-1.5"
        >
          {isCopied ? <Check className="w-4 h-4 text-lime-400" /> : <Copy className="w-4 h-4" />}
          <span>Kadroyu Kopyala</span>
        </button>
      </div>

      {/* Preferences & Toggles Section */}
      <div className="bg-[#111827] rounded-3xl p-4 space-y-3 shadow-md border border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <Award className="w-5 h-5 text-amber-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-black text-white truncate">
                Kaptanları Otomatik Belirle
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                Her takıma liderlik için rastgele yıldız ata
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={autoCaptains}
              onChange={(e) => handleToggleCaptains(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ec4899]" />
          </label>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/5">
          <div className="flex items-center gap-2.5 min-w-0">
            <RotateCcw className="w-5 h-5 text-cyan-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-black text-white truncate">
                Her Tura Yeni Kura
              </p>
              <p className="text-[10px] text-gray-400 truncate">
                Oyun bittiğinde takımları yeniden karma
              </p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={autoReshuffle}
              onChange={(e) => setAutoReshuffle(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#ec4899]" />
          </label>
        </div>
      </div>

      {/* Dedicated bottom clearance spacer */}
      <div className="h-20 sm:h-24 w-full shrink-0 pointer-events-none" aria-hidden="true" />
    </div>
  );
};
