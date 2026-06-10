/**
 * Satire generator — turns analyzer incidents into ready-to-publish content.
 * Template driven so the pipeline needs no external AI service; tone is
 * lighthearted and performance-focused, never personal.
 */
import type { SatireCategory } from "@/lib/types";
import type { Incident, IncidentType } from "./analyzer";

const headlineTemplates: Record<IncidentType, string[]> = {
  "golden-duck": [
    "Golden Duck Club Welcomes {player} With Full Honors and Zero Runs",
    "{player} Completes Fastest Innings in History, Experts Applaud Efficiency",
    "BREAKING: {player} Saves Energy for Fielding With One-Ball Special",
  ],
  duck: [
    "{player} Crafts Artisanal, Small-Batch Duck Against {opponent}",
    "Scorers Confirm {player}'s Innings Did Technically Happen",
    "{player} Spends Quality Time at Crease, Forgets Souvenir Runs",
  ],
  collapse: [
    "Nepal's Middle Order Reschedules Batting for a More Convenient Date",
    "Physics Department Investigates Nepal's Synchronized Pavilion Return vs {opponent}",
    "Collapse of the Week: Nepal Discovers Express Lane Back to Dressing Room",
  ],
  "slow-crawl": [
    "{player} Bats Through Three Geological Eras Against {opponent}",
    "Run Machine Update: {player} Produces Artisanal Runs at Heritage Pace",
    "Strike Rotation Declared Optional as {player} Settles In for the Winter",
  ],
  "heartbreak-loss": [
    "Nation Performs Collective Deep Breathing After {opponent} Result",
    "Nepal Loses Match, Wins Meme Production Numbers vs {opponent}",
    "Official Report: Defeat to {opponent} 'Builds Character,' Says Everyone, Unconvincingly",
  ],
  "nervous-nineties": [
    "{player} Donates Wicket to the Nervous Nineties Preservation Society",
    "So Close: {player} Discovers the Hundred Is a Social Construct",
  ],
  "heist-win": [
    "Nepal Wins; Cardiologists Request Earlier Finishes in Formal Letter",
    "Victory Achieved vs {opponent}, Fans' Heart Rates Pending Review",
  ],
};

const bodyTemplates: Record<IncidentType, string[]> = {
  "golden-duck": [
    `The Golden Duck Club convened an emergency session after {details}\n\n"Most batters need several deliveries to disappoint at this level," the Club's chairperson noted. "This was instant. This was art."\n\nThe walk back was described by onlookers as "brisk and professional, with excellent follow-through" — qualities scouts wish applied to the batting itself.\n\nClub membership comes with a commemorative duck stamp and the eternal love of meme pages nationwide. The next fixture approaches, and with it, redemption — or renewal of membership. Both make great content.`,
  ],
  duck: [
    `{details}\n\nUnlike the vulgar golden duck, this innings showed patience: balls were faced, leaves were executed, and at no point did a run threaten to occur.\n\n"It's about occupying the crease," explained our batting analyst, "which he did, like furniture."\n\nFans have responded with their trademark warmth: four memes per minute, sustained.`,
  ],
  collapse: [
    `Seismologists confirmed unusual activity in Kathmandu on match day. It wasn't an earthquake — just the sound of {details}\n\nThe collapse followed Nepal's traditional choreography: a promising start, one soft dismissal, and then a procession so orderly it could be used to teach queueing theory.\n\n"We've practiced this scenario," a team insider said, before clarifying nobody had intended to practice causing it.\n\nThe analytics team has labeled the event "a high-information innings," which is analyst-speak for "the coach has questions."\n\nOn the bright side, the memes arrived faster than the recovery: production was up 340% within the hour. The content economy thanks you, boys.`,
  ],
  "slow-crawl": [
    `{details}\n\nAt one stage, observers checked whether the scoreboard had frozen. It had not. It was simply being respected.\n\n"Strike rotation is a modern fad," our resident traditionalist argued. "This was classical batting: dot, dot, dot, leave, polite single declined."\n\nThe opposition reportedly considered a drinks break per over, purely out of sympathy.`,
  ],
  "heartbreak-loss": [
    `{details}\n\nThe post-match press conference featured the word "positives" four times, the word "learnings" three times, and one long pause that said more than both.\n\nFans processed the result through the five stages of grief, completing all five within ninety minutes — a national record — before pivoting to meme production, where Nepal remains undefeated.\n\nThe next match is around the corner. Hope, as always, has already bought tickets.`,
  ],
  "nervous-nineties": [
    `{details}\n\nThe nineties remain undefeated. Scientists describe the zone between 90 and 99 as "cricket's Bermuda Triangle" — bats get heavier, singles get riskier, and perfectly sensible humans attempt shots last seen in beach cricket.\n\nThe innings was still magnificent. The memes will be kind-ish. The hundred will come — probably when nobody is filming, which would be very on-brand.`,
  ],
  "heist-win": [
    `{details}\n\nVictory was eventually secured through Nepal's signature methodology: make it terrifying first.\n\nThe Nepal Heart Foundation has renewed its request that matches be won "with at least two overs to spare, for public health reasons." The team is reviewing the proposal and is expected to reject it as unrealistic.\n\nCelebrations continued late into the night, fueled by relief, chiya, and the quiet knowledge that next time will be exactly the same.`,
  ],
};

const categoryByType: Record<IncidentType, SatireCategory> = {
  "golden-duck": "golden-duck-club",
  duck: "golden-duck-club",
  collapse: "collapse-of-the-week",
  "slow-crawl": "run-machine",
  "heartbreak-loss": "collapse-of-the-week",
  "nervous-nineties": "meme-hall-of-fame",
  "heist-win": "captaincy-masterclass",
};

const reactionTemplates = [
  "I watched that innings live and I still don't believe it happened. {opponent} can't either.",
  "My grandmother saw the scorecard and asked if it was a phone number. Valid question honestly.",
  "We don't lose matches, we farm engagement. Genius long-term strategy.",
  "That's it, I'm only watching the highlights from now on. Both of them.",
  "Somewhere a scriptwriter is taking notes. Nobody would believe this plot.",
  "The boys gave 100%. Unfortunately the match required about 140%.",
  "Cancelled my evening plans to watch this. The team also cancelled theirs, apparently.",
  "Strike rate? In this economy?",
];

const usernamePool = [
  "GorkhaliGabbar",
  "MomoOverMatch",
  "EverestEdge",
  "KirtipurKing",
  "SagarmathasSon",
  "LumbiniLefty",
  "ChitwanChauka",
  "PokharaPull",
  "TerraiThunder",
  "MustangMaiden",
];

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

/** djb2 — stable seeds/ids without a crypto dependency. */
export function hashString(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return hash >>> 0;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 180);
}

export interface GeneratedPost {
  id: string; // deterministic — re-runs don't duplicate
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category: SatireCategory;
  playerName: string | null;
  matchId: string;
}

export function generatePost(incident: Incident, dateKey: string): GeneratedPost {
  const seed = hashString(`${incident.matchId}-${incident.type}-${incident.playerName ?? "team"}`);
  const fill = (template: string): string =>
    template
      .replace(/\{player\}/g, incident.playerName ?? "The Middle Order")
      .replace(/\{opponent\}/g, incident.opponent)
      .replace(/\{details\}/g, incident.details);

  const title = fill(pick(headlineTemplates[incident.type], seed));
  const content = fill(pick(bodyTemplates[incident.type], seed >> 3));
  const excerpt = content.split("\n")[0].slice(0, 280);

  return {
    id: `auto-${(seed % 1_000_000_000).toString(36)}-${dateKey.replace(/-/g, "")}`.slice(0, 36),
    title,
    slug: `${slugify(title)}-${dateKey}`,
    content,
    excerpt,
    category: categoryByType[incident.type],
    playerName: incident.playerName,
    matchId: incident.matchId,
  };
}

export interface GeneratedReaction {
  id: string;
  username: string;
  reaction: string;
}

export function generateReactions(incident: Incident, count = 2): GeneratedReaction[] {
  const out: GeneratedReaction[] = [];
  for (let i = 0; i < count; i++) {
    const seed = hashString(`${incident.matchId}-${incident.type}-r${i}`);
    out.push({
      id: `auto-r-${(seed % 1_000_000_000).toString(36)}`.slice(0, 36),
      username: pick(usernamePool, seed),
      reaction: pick(reactionTemplates, seed >> 2).replace(/\{opponent\}/g, incident.opponent),
    });
  }
  return out;
}

/** Meme-score bump per incident type, applied to involved players. */
export function memeScoreDelta(type: IncidentType): number {
  switch (type) {
    case "collapse":
      return 8;
    case "golden-duck":
      return 6;
    case "nervous-nineties":
      return 5;
    case "heartbreak-loss":
      return 4;
    case "duck":
      return 3;
    case "slow-crawl":
      return 2;
    case "heist-win":
      return 2;
  }
}
