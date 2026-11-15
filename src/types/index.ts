export type TabType = 'games' | 'finger' | 'wheel' | 'name' | 'team' | 'plan';

export interface GameItem {
  id: string;
  title: string;
  tag: string;
  desc: string;
  cat: 'quick' | 'party' | 'role' | 'dare' | 'all';
  icon: string;
  badge?: string;
  minPlayers?: string;
  color?: string;
  gradient?: string;
  playTime?: string;
  featured?: boolean;
  isVIP?: boolean;
}

export type CustomCardType = 'truth' | 'dare' | 'funny' | 'task';
export type SpicinessLevel = 'mild' | 'medium' | 'hot';

export interface CustomCard {
  id: string;
  type: CustomCardType;
  text: string;
  spiciness: SpicinessLevel;
  timestamp?: string;
  addedBy?: string;
  isActive?: boolean;
}

// 5 Turluk Şampiyona
export interface TournamentPlayer {
  id: string;
  name: string;
  score: number;
}

export interface TournamentRound {
  roundNumber: number;
  title: string;
  sub: string;
  instructions: string;
  gameId: string;
  points: number;
}

// Parti Planlayıcı Veri Tipleri
export interface PartyPlan {
  title: string;
  date: string;
  time: string;
  location: string;
  hostName: string;
  description: string;
  theme: string;
}

export interface PollOption {
  id: string;
  text: string;
  votes: number;
}

export interface GroupPoll {
  id: string;
  question: string;
  options: PollOption[];
  userVotedId?: string;
}

export interface PotluckItem {
  id: string;
  item: string;
  assignee: string;
  completed: boolean;
  category: 'drink' | 'food' | 'snack' | 'equipment';
}

export interface SongRequest {
  id: string;
  title: string;
  artist: string;
  requestedBy: string;
  votes: number;
}

export interface ExpenseItem {
  id: string;
  description: string;
  amount: number;
  paidBy: string;
}

export interface NoticeNote {
  id: string;
  content: string;
  author: string;
  timestamp: string;
  pinned: boolean;
}
