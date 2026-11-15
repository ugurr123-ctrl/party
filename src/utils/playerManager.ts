export interface TablePlayer {
  id: string;
  name: string;
  avatar: string; // URL, or base64 data URL
  score: number;
  color: string;
}

// Self-contained embedded SVG avatars - Zero broken images, works completely offline
export const createSvgAvatar = (bg1: string, bg2: string, emoji: string): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g_${emoji}" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${bg1}"/><stop offset="100%" stop-color="${bg2}"/></linearGradient></defs><rect width="100" height="100" rx="50" fill="url(#g_${emoji})"/><circle cx="50" cy="50" r="46" stroke="rgba(255,255,255,0.25)" stroke-width="2.5" fill="none"/><text x="50%" y="54%" font-size="44" text-anchor="middle" dominant-baseline="middle">${emoji}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

export const PRESET_AVATARS: string[] = [
  createSvgAvatar('#ec4899', '#7c3aed', '🦊'), // Pink-Violet Fox
  createSvgAvatar('#06b6d4', '#1e40af', '🦁'), // Cyan-Blue Lion
  createSvgAvatar('#bef264', '#047857', '⚡'), // Lime-Emerald Lightning
  createSvgAvatar('#f59e0b', '#b45309', '🐯'), // Amber Tiger
  createSvgAvatar('#a855f7', '#4c1d95', '👑'), // Purple Crown
  createSvgAvatar('#3b82f6', '#1e1b4b', '🚀'), // Blue Rocket
  createSvgAvatar('#10b981', '#064e3b', '🐼'), // Emerald Panda
  createSvgAvatar('#f43f5e', '#881337', '🐱')  // Rose Cat
];

export const PLAYER_COLORS = [
  '#f751a1', // Pink
  '#4cd7f6', // Cyan
  '#bef264', // Lime
  '#F59E0B', // Amber
  '#d0bcff', // Purple
  '#10B981', // Emerald
  '#ec4899', // Rose
  '#06b6d4'  // Light blue
];

export const DEFAULT_TABLE_PLAYERS: TablePlayer[] = [
  {
    id: 'p1',
    name: 'Selin Yıldız',
    avatar: PRESET_AVATARS[0],
    score: 0,
    color: PLAYER_COLORS[0]
  },
  {
    id: 'p2',
    name: 'Burak Demir',
    avatar: PRESET_AVATARS[1],
    score: 0,
    color: PLAYER_COLORS[1]
  },
  {
    id: 'p3',
    name: 'Ece Kaya',
    avatar: PRESET_AVATARS[2],
    score: 0,
    color: PLAYER_COLORS[2]
  },
  {
    id: 'p4',
    name: 'Can Arslan',
    avatar: PRESET_AVATARS[3],
    score: 0,
    color: PLAYER_COLORS[3]
  }
];

const STORAGE_KEY = 'parti_kutusu_table_players';

// Resize uploaded user photo to lightweight base64
export function resizeUploadedImage(file: File, maxSize: number = 180): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = Math.round((height * maxSize) / width);
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = Math.round((width * maxSize) / height);
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        } else {
          resolve(e.target?.result as string);
        }
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function loadTablePlayers(): TablePlayer[] {
  if (typeof window === 'undefined') return DEFAULT_TABLE_PLAYERS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load table players from storage:', err);
  }
  return DEFAULT_TABLE_PLAYERS;
}

export function saveTablePlayers(players: TablePlayer[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(players));
    window.dispatchEvent(new CustomEvent('table_players_updated', { detail: players }));
  } catch (err) {
    console.error('Failed to save table players to storage:', err);
  }
}
