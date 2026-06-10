export interface RowBase {
  $id: string;
  $createdAt: string;
  $updatedAt: string;
}

export type PlayerRole = "Batter" | "Bowler" | "All-Rounder" | "Wicket-Keeper";

export interface PlayerStats {
  matches: number;
  runs: number;
  average: number;
  strikeRate: number;
  wickets: number;
  economy: number;
  ducks: number;
  catchesDropped: number;
  highestScore: number;
}

export interface Player extends RowBase {
  name: string;
  slug: string;
  image: string | null;
  role: PlayerRole;
  battingStyle: string | null;
  bowlingStyle: string | null;
  team: string;
  bio: string | null;
  stats: string; // JSON-encoded PlayerStats
  memeScore: number;
  fanScore: number;
  trending: boolean;
  currentForm: string | null;
}

export type MatchResult =
  | "won"
  | "lost"
  | "tied"
  | "no-result"
  | "upcoming"
  | "live";

export type MatchFormat = "T20I" | "ODI" | "Test" | "List-A";

export interface InningsEntry {
  player: string;
  runs: number;
  balls: number;
  dismissal: string;
}

export interface Scorecard {
  nepal: { total: string; overs: string; batting: InningsEntry[] };
  opponent: { total: string; overs: string };
}

export interface Match extends RowBase {
  opponent: string;
  date: string;
  result: MatchResult;
  format: MatchFormat;
  venue: string | null;
  nepalScore: string | null;
  opponentScore: string | null;
  scorecard: string | null; // JSON-encoded Scorecard
  summary: string | null;
  funnyAnalysis: string | null;
}

export const SATIRE_CATEGORIES = [
  "golden-duck-club",
  "run-machine",
  "catch-drop-legends",
  "captaincy-masterclass",
  "collapse-of-the-week",
  "meme-hall-of-fame",
] as const;

export type SatireCategory = (typeof SATIRE_CATEGORIES)[number];

export const SATIRE_CATEGORY_LABELS: Record<SatireCategory, string> = {
  "golden-duck-club": "Golden Duck Club",
  "run-machine": "Run Machine (Ironically)",
  "catch-drop-legends": "Catch Drop Legends",
  "captaincy-masterclass": "Captaincy Masterclass",
  "collapse-of-the-week": "Collapse of the Week",
  "meme-hall-of-fame": "Meme Hall of Fame",
};

export type PostStatus = "draft" | "pending" | "published" | "rejected";

export interface SatirePost extends RowBase {
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  playerId: string | null;
  matchId: string | null;
  category: SatireCategory;
  image: string | null;
  status: PostStatus;
  featured: boolean;
  views: number;
  likes: number;
  source: "manual" | "auto";
}

export type MemeStatus = "pending" | "published" | "rejected";

export interface Meme extends RowBase {
  title: string;
  image: string;
  type: "image" | "video";
  videoUrl: string | null;
  playerId: string | null;
  likes: number;
  shares: number;
  status: MemeStatus;
  submittedBy: string | null;
}

export interface FanReaction extends RowBase {
  username: string;
  reaction: string;
  playerId: string | null;
  postId: string | null;
  likes: number;
  status: "pending" | "published";
}

export const RANKING_CATEGORIES = [
  "biggest-collapse",
  "unluckiest-player",
  "fan-favorite",
  "meme-king",
  "redemption-arc",
] as const;

export type RankingCategory = (typeof RANKING_CATEGORIES)[number];

export const RANKING_CATEGORY_LABELS: Record<RankingCategory, string> = {
  "biggest-collapse": "Biggest Collapse",
  "unluckiest-player": "Unluckiest Player",
  "fan-favorite": "Fan Favorite",
  "meme-king": "Meme King",
  "redemption-arc": "Redemption Arc",
};

export interface Ranking extends RowBase {
  title: string;
  category: RankingCategory;
  playerId: string;
  score: number;
  reason: string | null;
  period: string;
}

export interface PollOption {
  id: string;
  label: string;
  votes: number;
}

export interface Poll extends RowBase {
  question: string;
  options: string; // JSON-encoded PollOption[]
  active: boolean;
  totalVotes: number;
}

export interface Subscriber extends RowBase {
  email: string;
}

export interface SessionUser {
  $id: string;
  name: string;
  email: string;
  labels: string[];
  isAdmin: boolean;
}

export function parsePlayerStats(raw: string | null | undefined): PlayerStats {
  const fallback: PlayerStats = {
    matches: 0,
    runs: 0,
    average: 0,
    strikeRate: 0,
    wickets: 0,
    economy: 0,
    ducks: 0,
    catchesDropped: 0,
    highestScore: 0,
  };
  if (!raw) return fallback;
  try {
    return { ...fallback, ...(JSON.parse(raw) as Partial<PlayerStats>) };
  } catch {
    return fallback;
  }
}

export function parseScorecard(raw: string | null | undefined): Scorecard | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Scorecard;
  } catch {
    return null;
  }
}

export function parsePollOptions(raw: string | null | undefined): PollOption[] {
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PollOption[];
  } catch {
    return [];
  }
}
