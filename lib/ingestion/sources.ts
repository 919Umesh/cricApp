/**
 * External data sources for the content pipeline.
 *
 * Priority:
 *  1. CricketData.org (cricapi) — structured live/recent match data (free key)
 *  2. ESPNcricinfo public RSS — headline-level live scores, no key required
 *
 * Both are filtered to matches involving Nepal. Failures degrade silently so
 * the pipeline can still generate content from matches already in the
 * database.
 */

export interface NormalizedBatting {
  player: string;
  runs: number;
  balls: number;
  dismissal: string;
}

export interface NormalizedMatch {
  externalId: string;
  opponent: string;
  date: string; // ISO
  format: "T20I" | "ODI" | "Test" | "List-A";
  venue: string | null;
  result: "won" | "lost" | "tied" | "no-result" | "live" | "upcoming";
  nepalScore: string | null;
  opponentScore: string | null;
  summary: string | null;
  batting: NormalizedBatting[];
}

const CRICAPI_BASE = "https://api.cricapi.com/v1";

interface CricApiMatch {
  id: string;
  name: string;
  matchType?: string;
  status?: string;
  venue?: string;
  date?: string;
  dateTimeGMT?: string;
  teams?: string[];
  score?: { r?: number; w?: number; o?: number; inning?: string }[];
  matchWinner?: string;
  matchStarted?: boolean;
  matchEnded?: boolean;
}

function mapFormat(matchType: string | undefined): NormalizedMatch["format"] {
  switch ((matchType ?? "").toLowerCase()) {
    case "t20":
      return "T20I";
    case "test":
      return "Test";
    case "odi":
    default:
      return "ODI";
  }
}

function scoreFor(match: CricApiMatch, team: "nepal" | "other"): string | null {
  const entry = match.score?.find((s) => {
    const inning = (s.inning ?? "").toLowerCase();
    return team === "nepal" ? inning.includes("nepal") : !inning.includes("nepal");
  });
  if (!entry || entry.r === undefined) return null;
  return `${entry.r}/${entry.w ?? 0} (${entry.o ?? "?"} ov)`;
}

function mapResult(match: CricApiMatch): NormalizedMatch["result"] {
  if (!match.matchStarted) return "upcoming";
  if (!match.matchEnded) return "live";
  const status = (match.status ?? "").toLowerCase();
  if (status.includes("no result") || status.includes("abandoned")) return "no-result";
  if (status.includes("tie")) return "tied";
  const winner = (match.matchWinner ?? "").toLowerCase();
  if (winner.includes("nepal")) return "won";
  if (winner) return "lost";
  return "no-result";
}

export async function fetchFromCricketDataApi(apiKey: string): Promise<NormalizedMatch[]> {
  try {
    const res = await fetch(
      `${CRICAPI_BASE}/currentMatches?apikey=${encodeURIComponent(apiKey)}&offset=0`,
      { signal: AbortSignal.timeout(15_000) },
    );
    if (!res.ok) return [];
    const body = (await res.json()) as { status?: string; data?: CricApiMatch[] };
    if (body.status !== "success" || !Array.isArray(body.data)) return [];

    return body.data
      .filter((m) => m.teams?.some((t) => t.toLowerCase().includes("nepal")))
      .map((m) => {
        const opponent =
          m.teams?.find((t) => !t.toLowerCase().includes("nepal")) ?? "Unknown XI";
        return {
          externalId: m.id,
          opponent,
          date: m.dateTimeGMT ?? m.date ?? new Date().toISOString(),
          format: mapFormat(m.matchType),
          venue: m.venue ?? null,
          result: mapResult(m),
          nepalScore: scoreFor(m, "nepal"),
          opponentScore: scoreFor(m, "other"),
          summary: m.status ?? null,
          batting: [], // ball-by-ball detail needs the paid fantasy endpoints
        } satisfies NormalizedMatch;
      });
  } catch (err) {
    console.error("[ingest] cricketdata fetch failed:", (err as Error).message);
    return [];
  }
}

const CRICINFO_RSS = "https://static.cricinfo.com/rss/livescores.xml";

export async function fetchCricinfoRss(): Promise<NormalizedMatch[]> {
  try {
    const res = await fetch(CRICINFO_RSS, {
      signal: AbortSignal.timeout(15_000),
      headers: { "user-agent": "cric-satire-bot/1.0" },
    });
    if (!res.ok) return [];
    const xml = await res.text();

    const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => m[1]);
    const nepalItems = items.filter((item) => /nepal/i.test(item));

    return nepalItems.map((item, index) => {
      const title =
        /<title>\s*(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?\s*<\/title>/.exec(item)?.[1]?.trim() ??
        "Nepal match";
      const guid = /<guid[^>]*>([\s\S]*?)<\/guid>/.exec(item)?.[1]?.trim();
      // Titles look like: "Nepal 97 v United Arab Emirates 98/3 *"
      const opponent =
        title
          .split(/\sv\s/i)[1]
          ?.replace(/[\d/*()]+/g, "")
          .trim() || "Unknown XI";
      return {
        externalId: guid ?? `rss-${index}-${title.slice(0, 20)}`,
        opponent,
        date: new Date().toISOString(),
        format: "ODI",
        venue: null,
        result: "live",
        nepalScore: null,
        opponentScore: null,
        summary: title,
        batting: [],
      } satisfies NormalizedMatch;
    });
  } catch (err) {
    console.error("[ingest] cricinfo rss fetch failed:", (err as Error).message);
    return [];
  }
}

export async function fetchExternalMatches(): Promise<NormalizedMatch[]> {
  const apiKey = process.env.CRICKET_API_KEY;
  if (apiKey) {
    const fromApi = await fetchFromCricketDataApi(apiKey);
    if (fromApi.length > 0) return fromApi;
  }
  return fetchCricinfoRss();
}
