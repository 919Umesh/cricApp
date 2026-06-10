/**
 * Seed script — creates the admin user, uploads generated artwork to storage
 * and fills every table with sample content. Idempotent: re-runs skip
 * anything that already exists.
 *
 *   npm run seed
 */
import "dotenv/config";
import { Client, ID, Query, Storage, TablesDB, Users } from "node-appwrite";

const endpoint = process.env.APPWRITE_ENDPOINT ?? "https://fra.cloud.appwrite.io/v1";
const projectId = process.env.APPWRITE_PROJECT_ID ?? "";
const apiKey = process.env.APPWRITE_API_KEY ?? "";
const databaseId = process.env.APPWRITE_DATABASE_ID ?? "cric-satire";
const adminEmail = process.env.ADMIN_EMAIL ?? "admin@cricsatire.com";
const adminPassword = process.env.ADMIN_PASSWORD ?? "";
const adminName = process.env.ADMIN_NAME ?? "Satire Admin";

if (!projectId || !apiKey || apiKey.startsWith("YOUR_")) {
  console.error("✖ Configure APPWRITE_API_KEY in .env before seeding (see README).");
  process.exit(1);
}

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const tables = new TablesDB(client);
const storage = new Storage(client);
const users = new Users(client);

type AppwriteError = { code?: number; message?: string };

async function tolerate<T>(label: string, fn: () => Promise<T>): Promise<T | null> {
  try {
    const result = await fn();
    console.log(`  ✔ ${label}`);
    return result;
  } catch (err) {
    const e = err as AppwriteError;
    if (e.code === 409) {
      console.log(`  • ${label} (already exists)`);
      return null;
    }
    throw err;
  }
}

// ── Generated artwork ────────────────────────────────────────────────────────

const palettes = [
  ["#dc2645", "#7c1d2f"],
  ["#2563eb", "#1e3a8a"],
  ["#059669", "#064e3b"],
  ["#d97706", "#7c2d12"],
  ["#7c3aed", "#4c1d95"],
  ["#0891b2", "#164e63"],
];

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function avatarSvg(name: string, index: number): string {
  const [from, to] = palettes[index % palettes.length];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="${from}"/><stop offset="100%" stop-color="${to}"/>
  </linearGradient></defs>
  <rect width="400" height="400" fill="url(#g)"/>
  <circle cx="200" cy="150" r="64" fill="rgba(255,255,255,0.22)"/>
  <rect x="110" y="230" width="180" height="120" rx="60" fill="rgba(255,255,255,0.22)"/>
  <text x="200" y="172" font-family="Arial, sans-serif" font-size="56" font-weight="700"
    fill="#ffffff" text-anchor="middle">${initials(name)}</text>
</svg>`;
}

function cardSvg(title: string, emoji: string, index: number): string {
  const [from, to] = palettes[index % palettes.length];
  const safe = title.replace(/&/g, "&amp;").replace(/</g, "&lt;").slice(0, 38);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="450" viewBox="0 0 800 450">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="${from}"/><stop offset="100%" stop-color="${to}"/>
  </linearGradient></defs>
  <rect width="800" height="450" fill="url(#g)"/>
  <circle cx="700" cy="80" r="140" fill="rgba(255,255,255,0.08)"/>
  <circle cx="80" cy="400" r="100" fill="rgba(0,0,0,0.12)"/>
  <text x="60" y="220" font-family="Arial, sans-serif" font-size="96">${emoji}</text>
  <text x="60" y="320" font-family="Arial, sans-serif" font-size="34" font-weight="700"
    fill="#ffffff">${safe}</text>
  <text x="60" y="380" font-family="Arial, sans-serif" font-size="20"
    fill="rgba(255,255,255,0.75)">cric-satire • nepali cricket, lovingly roasted</text>
</svg>`;
}

async function uploadSvg(bucketId: string, fileId: string, svg: string): Promise<string> {
  await tolerate(`file ${bucketId}/${fileId}.svg`, () =>
    storage.createFile({
      bucketId,
      fileId,
      file: new File([svg], `${fileId}.svg`, { type: "image/svg+xml" }),
    }),
  );
  return `${bucketId}:${fileId}`;
}

// ── Sample data ──────────────────────────────────────────────────────────────

const players = [
  {
    slug: "rohit-paudel",
    name: "Rohit Paudel",
    role: "Batter",
    battingStyle: "Right-hand bat",
    bowlingStyle: "Right-arm medium",
    bio: "Captain, motivator, and part-time philosopher whose post-match interviews contain more twists than the batting order. Carries the weight of a nation and occasionally the strike rate of a sleepy tortoise.",
    memeScore: 72,
    fanScore: 88,
    trending: true,
    currentForm: "Three gritty thirties in a row — the forties remain theoretical.",
    stats: { matches: 142, runs: 3120, average: 27.4, strikeRate: 78.2, wickets: 4, economy: 6.1, ducks: 9, catchesDropped: 6, highestScore: 95 },
  },
  {
    slug: "kushal-bhurtel",
    name: "Kushal Bhurtel",
    role: "Batter",
    battingStyle: "Right-hand bat",
    bowlingStyle: "Right-arm leg break",
    bio: "Opens the innings with the enthusiasm of a man who has somewhere else to be. Either hits the first ball for four or invents a brand-new way to get out — there is no third option.",
    memeScore: 81,
    fanScore: 79,
    trending: true,
    currentForm: "Boom or bust, currently alternating with impressive discipline.",
    stats: { matches: 98, runs: 2456, average: 26.8, strikeRate: 112.4, wickets: 11, economy: 7.8, ducks: 11, catchesDropped: 4, highestScore: 99 },
  },
  {
    slug: "aasif-sheikh",
    name: "Aasif Sheikh",
    role: "Wicket-Keeper",
    battingStyle: "Right-hand bat",
    bowlingStyle: "—",
    bio: "The gentleman wicket-keeper who once refused a run-out for the spirit of cricket and has been apologising to bowlers ever since. Gloves softer than his cover drive.",
    memeScore: 58,
    fanScore: 92,
    trending: false,
    currentForm: "Keeping tidily; batting in the polite zone between 20 and 35.",
    stats: { matches: 104, runs: 2210, average: 25.1, strikeRate: 74.9, wickets: 0, economy: 0, ducks: 7, catchesDropped: 3, highestScore: 81 },
  },
  {
    slug: "dipendra-singh-airee",
    name: "Dipendra Singh Airee",
    role: "All-Rounder",
    battingStyle: "Right-hand bat",
    bowlingStyle: "Right-arm off break",
    bio: "Hit six sixes in an over once, and the nation has demanded it every over since. Scientists are still studying how the same bat produces 32 runs one day and a leading edge the next.",
    memeScore: 86,
    fanScore: 95,
    trending: true,
    currentForm: "One cameo away from another world record, or a golden duck. Coin flip.",
    stats: { matches: 121, runs: 2890, average: 29.2, strikeRate: 118.7, wickets: 38, economy: 7.2, ducks: 8, catchesDropped: 5, highestScore: 105 },
  },
  {
    slug: "sompal-kami",
    name: "Sompal Kami",
    role: "All-Rounder",
    battingStyle: "Left-hand bat",
    bowlingStyle: "Right-arm medium fast",
    bio: "Nepal's workhorse. Bowls the hard overs, bats the hopeless overs, and fields wherever the captain feels guilty about sending anyone else. Yorkers on demand, except when demanded.",
    memeScore: 64,
    fanScore: 84,
    trending: false,
    currentForm: "Death overs going length-ball wandering; lower-order biffing reliable.",
    stats: { matches: 133, runs: 1450, average: 17.2, strikeRate: 96.3, wickets: 152, economy: 5.9, ducks: 12, catchesDropped: 7, highestScore: 64 },
  },
  {
    slug: "karan-kc",
    name: "Karan KC",
    role: "Bowler",
    battingStyle: "Right-hand bat",
    bowlingStyle: "Right-arm medium fast",
    bio: "Folk hero with a slower ball so slow it has its own time zone. Famous for last-over heists with the bat that cardiologists across Nepal have formally protested.",
    memeScore: 77,
    fanScore: 90,
    trending: false,
    currentForm: "Swinging the new ball and the match, in both directions.",
    stats: { matches: 109, runs: 720, average: 12.6, strikeRate: 104.0, wickets: 138, economy: 6.4, ducks: 14, catchesDropped: 5, highestScore: 42 },
  },
  {
    slug: "lalit-rajbanshi",
    name: "Lalit Rajbanshi",
    role: "Bowler",
    battingStyle: "Left-hand bat",
    bowlingStyle: "Slow left-arm orthodox",
    bio: "Left-arm spin that turns square on Tuesdays. Batting position: eleven. Batting ambition: ten. The scorer keeps his duck stamp warmed up, just in case.",
    memeScore: 69,
    fanScore: 71,
    trending: false,
    currentForm: "Economy under five and rising appeal-per-over numbers.",
    stats: { matches: 87, runs: 156, average: 6.5, strikeRate: 48.0, wickets: 121, economy: 4.7, ducks: 16, catchesDropped: 2, highestScore: 17 },
  },
  {
    slug: "kushal-malla",
    name: "Kushal Malla",
    role: "All-Rounder",
    battingStyle: "Left-hand bat",
    bowlingStyle: "Right-arm off break",
    bio: "Fastest T20I fifty in history, occasionally followed by the fastest walk back in history. The kid has more gears than the team bus and uses approximately two of them.",
    memeScore: 83,
    fanScore: 87,
    trending: true,
    currentForm: "Hundred-or-nothing mode engaged since the Asian Games.",
    stats: { matches: 76, runs: 1620, average: 25.3, strikeRate: 124.6, wickets: 22, economy: 7.5, ducks: 10, catchesDropped: 4, highestScore: 137 },
  },
];

const matches = [
  {
    id: "match-uae-collapse",
    opponent: "UAE",
    daysAgo: 3,
    result: "lost",
    format: "T20I",
    venue: "Tribhuvan University Ground, Kirtipur",
    nepalScore: "97 all out (17.3 ov)",
    opponentScore: "98/3 (14.2 ov)",
    summary: "Nepal chose to bat, briefly looked comfortable at 52/1, then lost nine wickets for 45 runs in a collapse so coordinated it deserved choreography credits.",
    funnyAnalysis: "The middle order arrived, saw, and departed — mostly in the same over. Our experts counted four identical dismissals and one that defied physics, geometry, and the team talk.",
    scorecard: {
      nepal: {
        total: "97 all out", overs: "17.3",
        batting: [
          { player: "Kushal Bhurtel", runs: 31, balls: 19, dismissal: "c deep mid-wicket, attempting fourth consecutive slog" },
          { player: "Aasif Sheikh", runs: 14, balls: 22, dismissal: "lbw, padding up to a straight one" },
          { player: "Rohit Paudel", runs: 22, balls: 28, dismissal: "run out, calling for a single that existed only in theory" },
          { player: "Kushal Malla", runs: 0, balls: 1, dismissal: "b, golden duck, bat still in backlift" },
          { player: "Dipendra Singh Airee", runs: 12, balls: 9, dismissal: "c long-on, six attempt downgraded mid-air" },
          { player: "Sompal Kami", runs: 8, balls: 11, dismissal: "c keeper, gloving a slower ball" },
          { player: "Karan KC", runs: 6, balls: 7, dismissal: "b, yorked attempting a reverse" },
          { player: "Lalit Rajbanshi", runs: 0, balls: 3, dismissal: "b, duck #16, scorer didn't even look up" },
        ],
      },
      opponent: { total: "98/3", overs: "14.2" },
    },
  },
  {
    id: "match-oman-thriller",
    opponent: "Oman",
    daysAgo: 9,
    result: "won",
    format: "ODI",
    venue: "Al Amerat Cricket Ground, Muscat",
    nepalScore: "243/8 (50 ov)",
    opponentScore: "241 all out (49.5 ov)",
    summary: "Karan KC defended three off the last over and celebrated like a man who knew exactly how close the comments section came to combusting.",
    funnyAnalysis: "Won by 2 runs. Nepal's death bowling: terrifying. Nepal's death batting earlier that innings: also terrifying, different reason.",
    scorecard: {
      nepal: {
        total: "243/8", overs: "50",
        batting: [
          { player: "Kushal Bhurtel", runs: 4, balls: 9, dismissal: "c slip, nicking the warm-up delivery" },
          { player: "Aasif Sheikh", runs: 68, balls: 91, dismissal: "c cover, the polite fifty" },
          { player: "Rohit Paudel", runs: 71, balls: 88, dismissal: "b, heaving at the wrong yorker" },
          { player: "Dipendra Singh Airee", runs: 45, balls: 38, dismissal: "not out, finishing things like a grown-up" },
          { player: "Kushal Malla", runs: 19, balls: 14, dismissal: "st, dancing past one" },
        ],
      },
      opponent: { total: "241 all out", overs: "49.5" },
    },
  },
  {
    id: "match-canada-rain",
    opponent: "Canada",
    daysAgo: 16,
    result: "no-result",
    format: "ODI",
    venue: "Tribhuvan University Ground, Kirtipur",
    nepalScore: "112/4 (23 ov)",
    opponentScore: "—",
    summary: "Rain arrived at the exact moment Nepal's run rate did. Meteorologists deny match-fixing allegations from fans.",
    funnyAnalysis: "DLS: Didn't Let (us) See. The covers got more game time than the twelfth man this season.",
    scorecard: null,
  },
  {
    id: "match-png-dropfest",
    opponent: "PNG",
    daysAgo: 24,
    result: "won",
    format: "T20I",
    venue: "Mulpani Cricket Ground, Kathmandu",
    nepalScore: "152/6 (20 ov)",
    opponentScore: "139/9 (20 ov)",
    summary: "Nepal won by 13 runs despite a fielding display that featured four dropped catches, two of which were dropped by the same fielder off the same bowler.",
    funnyAnalysis: "Catches win matches, but apparently so does dropping them confidently enough that the batter feels guilty and holes out anyway.",
    scorecard: {
      nepal: {
        total: "152/6", overs: "20",
        batting: [
          { player: "Kushal Bhurtel", runs: 47, balls: 31, dismissal: "c deep square, three short of orbit" },
          { player: "Rohit Paudel", runs: 38, balls: 35, dismissal: "run out, geometry dispute with non-striker" },
          { player: "Dipendra Singh Airee", runs: 33, balls: 18, dismissal: "not out, two sixes into the car park" },
        ],
      },
      opponent: { total: "139/9", overs: "20" },
    },
  },
  {
    id: "match-netherlands-upcoming",
    opponent: "Netherlands",
    daysAgo: -6,
    result: "upcoming",
    format: "ODI",
    venue: "Tribhuvan University Ground, Kirtipur",
    nepalScore: null,
    opponentScore: null,
    summary: "Tri-series opener. The Dutch arrive with spreadsheets; Nepal arrives with 25,000 fans and a marching band.",
    funnyAnalysis: "Forecast: 40% chance of rain, 100% chance of a top-order wobble being described as 'a learning.'",
    scorecard: null,
  },
  {
    id: "match-scotland-upcoming",
    opponent: "Scotland",
    daysAgo: -12,
    result: "upcoming",
    format: "ODI",
    venue: "Tribhuvan University Ground, Kirtipur",
    nepalScore: null,
    opponentScore: null,
    summary: "Second game of the tri-series. Bagpipes vs madal. Neutral observers advised to bring earplugs and snacks.",
    funnyAnalysis: "Scotland's seamers vs Nepal's openers: a horror franchise with annual sequels.",
    scorecard: null,
  },
];

const posts = [
  {
    slug: "golden-duck-club-inducts-newest-lifetime-member",
    title: "Golden Duck Club Inducts Newest Lifetime Member After One-Ball Masterpiece",
    category: "golden-duck-club",
    playerSlug: "kushal-malla",
    emoji: "🦆",
    excerpt: "The committee praised the purity of the dismissal: no footwork, no contact, no regrets.",
    content: `The Golden Duck Club held an emergency induction ceremony on Tuesday after Kushal Malla completed what historians are calling "a flawless zero" — out first ball with a shot selection that surprised everyone, including the shot itself.\n\n"Most players need two or three balls to truly disappoint," said the Club's honorary chairperson, polishing a trophy shaped like a startled duck. "He did it in one. That's efficiency. That's professionalism."\n\nWitnesses report the bat was still in its backlift when the bails departed for the boundary. The scorers, who had pre-filled the dot ball out of habit, simply added a small artistic 'W'.\n\nMalla, to his credit, reviewed the dismissal — not with DRS, which had no doubts whatsoever, but spiritually, on the long walk back. Sources close to the dressing room confirm the walk featured "exceptional pace and follow-through, the kind we'd love to see in his running between the wickets."\n\nThe Club reminded fans that membership is prestigious and, at the current rate, increasingly crowded. Lalit Rajbanshi, a sixteen-time honoree, reportedly welcomed the newcomer with a pamphlet titled "Zero: A Love Story."\n\nNepal's next fixture is Friday. The duck stamp has already been inked.`,
  },
  {
    slug: "middle-order-discovers-teleportation",
    title: "BREAKING: Nepal's Middle Order Discovers Teleportation, Travels Pavilion-to-Pavilion in Minutes",
    category: "collapse-of-the-week",
    playerSlug: "rohit-paudel",
    emoji: "🫠",
    excerpt: "Nine wickets for 45 runs — scientists baffled, bowlers grateful, fans medicated.",
    content: `Physicists at Tribhuvan University are investigating Nepal's middle order after Sunday's innings against the UAE, during which six batters appeared to teleport from the crease back to the pavilion without meaningfully visiting the pitch.\n\nThe collapse — nine wickets for 45 runs — unfolded with such rhythm that the stadium DJ gave up changing songs and just left "Walking Back to Happiness" on loop.\n\n"We practiced this exact scenario," admitted one team insider. "Unfortunately we practiced causing it, not preventing it."\n\nCaptain Rohit Paudel's run out deserves special mention: a single that existed only in his imagination, called with the confidence of a man who had personally measured the pitch and found it shorter than everyone else did.\n\nThe UAE bowlers, asked for comment, requested anonymity because "it feels wrong to take credit."\n\nAt press time, the team analyst had labeled the collapse "a high-information event," which is analyst for "I have to present this to the coach and I'm scared."`,
  },
  {
    slug: "fielder-drops-catch-blames-sun-at-night-match",
    title: "Fielder Drops Sitter, Blames Sun. Match Was Under Floodlights.",
    category: "catch-drop-legends",
    playerSlug: "sompal-kami",
    emoji: "🧤",
    excerpt: "The sun, contacted for comment, confirmed it had set four hours before the incident.",
    content: `A routine top edge hung in the Kathmandu night sky for approximately six seconds on Saturday — long enough for two fielders to call for it, three fans to finish their chiya, and one commentator to say "simple chance" with fatal overconfidence.\n\nThe ball was eventually dropped by a fielder who shall remain named (it was in the scorecard, we can't help it), who immediately pointed skyward at a sun that had, by all astronomical accounts, set at 6:14 PM.\n\n"Classic technique," said our fielding analyst. "Eyes on the ball, hands in position, heart absolutely elsewhere."\n\nThe drop proved expensive for exactly four balls, after which the reprieved batter — overcome with guilt, or possibly disbelief — holed out to the same fielder, who took the catch like a man settling a personal vendetta with gravity.\n\nThe Catch Drop Legends committee has awarded the incident 9.2 points, with a 0.8 deduction because "blaming the sun at a night match shows ambition, but blaming the moon would have been braver."`,
  },
  {
    slug: "captain-wins-toss-loses-everything-else",
    title: "Captaincy Masterclass: Win the Toss, Bat First, Question Everything",
    category: "captaincy-masterclass",
    playerSlug: "rohit-paudel",
    emoji: "🧠",
    excerpt: "A tactical deep-dive into the decision that aged like milk in the Terai summer.",
    content: `Today's Captaincy Masterclass examines a bold strategic sequence: win the toss, elect to bat on a green pitch under heavy cloud, and then watch the plan develop the structural integrity of a momo wrapper in the rain.\n\nThe decision, our sources confirm, was driven by data. Unfortunately the data was about a different pitch, from a different decade.\n\n"The wicket looked dry from the dressing room," explained a team official, apparently describing a dressing room located in another city.\n\nBy the tenth over, with the score reading 34/5, the masterclass entered its second module: Defensive Field Placement For When Everything Is On Fire. Nepal deployed a field so spread out that two fielders required separate weather systems.\n\nThe third module — post-match interview management — was executed flawlessly. "We take the positives," the captain said, naming zero positives, taking none of them.\n\nNext week's masterclass: how to review an LBW that hit middle stump, with special guest appearance from the team's last remaining review.`,
  },
  {
    slug: "run-machine-averages-eleven-this-quarter",
    title: "Local Run Machine Produces Eleven Runs This Quarter, Shareholders Concerned",
    category: "run-machine",
    playerSlug: "kushal-bhurtel",
    emoji: "📉",
    excerpt: "Quarterly earnings call reveals strong boundary percentage on an extremely small sample size.",
    content: `Nepal Cricket Inc. held its quarterly earnings call on Monday, where the opening batter described his output of eleven runs across four innings as "a strategic consolidation phase."\n\nInvestors noted that the run machine's boundary percentage remains elite: of the eleven runs produced, eight came from boundaries. "The efficiency is there," argued one analyst. "He's eliminated the inefficient part of batting, which is staying in."\n\nThe machine's defenders point to supply chain issues: a shortage of patience, delayed deliveries (specifically, an inability to leave them), and inflation in expectations following last year's record output.\n\nA technical review found no mechanical faults. The bat swing remains gorgeous, the trigger movement crisp, the highlight reel immaculate. The only missing component, engineers confirmed, is "prolonged contact with the cricket ball."\n\nGuidance for next quarter remains optimistic. The machine has reportedly been seen in the nets "leaving balls outside off stump," a feature users have requested since 2021.\n\nThe stock closed up 4%, because fans, like the rest of us, are not rational actors.`,
  },
  {
    slug: "six-sixes-man-asked-to-do-it-again-every-single-game",
    title: "Man Who Hit Six Sixes Politely Asked To Do It Again Every Single Game Forever",
    category: "meme-hall-of-fame",
    playerSlug: "dipendra-singh-airee",
    emoji: "🚀",
    excerpt: "Fans clarify they are not demanding, merely expecting, which is worse.",
    content: `Dipendra Singh Airee, who once hit six sixes in an over, has been formally notified by the Federation of Nepali Cricket Fans that this is now the minimum acceptable standard for every over he faces, in perpetuity, including warm-ups.\n\n"We're reasonable people," said the Federation's spokesperson. "We don't expect six sixes every over. Five and a four is fine."\n\nThe notification, delivered via 40,000 simultaneous tweets, comes with a grace clause: singles are permitted during national emergencies, and a dot ball may be excused with a doctor's note.\n\nAiree, who also bowls, fields at the hardest position, and occasionally finishes chases like a tax deadline, was reportedly seen reading the demands and nodding wearily — the nod of a man who knows the next golden duck will trend for nine hours.\n\nThe Meme Hall of Fame has pre-approved both outcomes: another world record gets the 'HE'S HIM' template, and a first-ball duck gets the 'he's still him but please' template.\n\nThis is the deal. He didn't sign it. None of them did.`,
  },
  {
    slug: "polite-keeper-apologizes-to-batter-after-stumping",
    title: "Nation's Politest Keeper Apologizes To Batter Mid-Stumping, Completes It Anyway",
    category: "meme-hall-of-fame",
    playerSlug: "aasif-sheikh",
    emoji: "🤝",
    excerpt: "Spirit of cricket intact; bails, less so.",
    content: `Aasif Sheikh, Nepal's gentleman wicket-keeper and recipient of an actual fair play award, reportedly whispered "sorry, dai" to a batter on Saturday while removing the bails with surgical politeness.\n\nThe stumping, completed in 0.3 seconds, was followed by a respectful nod, a hand on the departing batter's shoulder, and what lip readers confirm was a restaurant recommendation for the batter's evening in Kathmandu.\n\n"He's too pure," said a teammate. "He keeps a list of every batter he's dismissed so he can wish them happy birthday."\n\nCritics argue this politeness is a competitive tactic — that being stumped by Sheikh produces a unique shame, like being told off by your favorite teacher. The numbers support this: batters stumped by Sheikh average 40% worse in their next innings, presumably from emotional damage sustained via kindness.\n\nThe ICC is reviewing whether an apology delivered during the act of dismissal constitutes unfair sportsmanship of the highest order.`,
  },
  {
    slug: "last-over-heist-cardiologists-issue-statement",
    title: "Karan KC Wins Another Last-Over Thriller; Cardiologists Issue Formal Complaint",
    category: "collapse-of-the-week",
    playerSlug: "karan-kc",
    emoji: "❤️‍🔥",
    excerpt: "The Nepal Heart Foundation requests all future matches be decided by the 40th over.",
    content: `The Nepal Medical Association has issued its third formal complaint of the season after Karan KC defended three runs off the final over against Oman, a finish that registered on seismographs as "minor tremor, emotional origin."\n\nThe over contained: one wide that wasn't, one yorker from the gods, one dropped catch immediately redeemed by a run out, and four million simultaneous prayers.\n\n"We won by two runs," said captain Rohit Paudel afterwards, his voice carrying the serenity of a man who had aged a decade in six deliveries. "We always believed."\n\nFootage from the dressing room contradicts this statement extensively.\n\nKaran KC, asked about his calmness under pressure, explained his technique: "I just pretend it's practice." Asked what he pretends during practice, he said "the last over," confirming that the man lives in a permanent state of last over, which explains both everything and nothing.\n\nThe Heart Foundation's proposal — that Nepal simply win earlier — was reviewed by the team and rejected as "unrealistic."`,
  },
];

const memes = [
  { id: "meme-duck-season", title: "Duck Season Opens Early This Year", playerSlug: "kushal-malla", emoji: "🦆", likes: 412, shares: 167 },
  { id: "meme-collapse-speedrun", title: "Middle Order Speedrun (Any%) — New World Record", playerSlug: "rohit-paudel", emoji: "⏱️", likes: 389, shares: 201 },
  { id: "meme-drop-it-like-its-hot", title: "Drop It Like It's a Match-Winning Catch", playerSlug: "sompal-kami", emoji: "🧤", likes: 256, shares: 98 },
  { id: "meme-six-six-six", title: "POV: You Bowl To Airee In The 14th Over", playerSlug: "dipendra-singh-airee", emoji: "🚀", likes: 534, shares: 310 },
  { id: "meme-polite-stumping", title: "Sorry Dai — The Stumping", playerSlug: "aasif-sheikh", emoji: "🙏", likes: 298, shares: 122 },
  { id: "meme-dls-rain", title: "DLS = Didn't Let (us) See", playerSlug: null, emoji: "🌧️", likes: 187, shares: 76 },
  { id: "meme-slower-ball-timezone", title: "Karan's Slower Ball Has Its Own Time Zone", playerSlug: "karan-kc", emoji: "🐢", likes: 142, shares: 58 },
  { id: "meme-leave-outside-off", title: "Leaving Balls Outside Off (Colorized, Rare Footage)", playerSlug: "kushal-bhurtel", emoji: "🎞️", likes: 224, shares: 91 },
];

const reactions = [
  { username: "GorkhaliGabbar", reaction: "Our top order treats the powerplay like a fire drill — everyone leaves the building immediately.", playerSlug: "kushal-bhurtel" },
  { username: "MomoOverMatch", reaction: "I've started watching the first 10 overs through my fingers like a horror movie. Cheaper than therapy.", playerSlug: null },
  { username: "EverestEdge", reaction: "Airee hits six sixes once and now my dad thinks every over without 36 runs is a personal betrayal.", playerSlug: "dipendra-singh-airee" },
  { username: "KirtipurKing", reaction: "Aasif would apologize to the ball for keeping it too gently. National treasure.", playerSlug: "aasif-sheikh" },
  { username: "RaniPokhariRocket", reaction: "Karan KC's last overs have done more for Nepali cardiology than any awareness campaign.", playerSlug: "karan-kc" },
  { username: "SagarmathasSon", reaction: "Rohit's running between wickets is the only place where he shows no patience whatsoever.", playerSlug: "rohit-paudel" },
  { username: "LumbiniLefty", reaction: "Rajbanshi's batting average is lower than the temperature in Jumla but his arm ball deserves a statue.", playerSlug: "lalit-rajbanshi" },
  { username: "ChitwanChauka", reaction: "We don't lose matches, we just win the post-match memes. Undefeated there since 2014.", playerSlug: null },
  { username: "PokharaPull", reaction: "Malla in form is the most beautiful sight in cricket. Malla out of form is also educational.", playerSlug: "kushal-malla" },
  { username: "TerraiThunder", reaction: "Sompal has bowled more 'hard overs' than I've had hard days. Respect the workhorse.", playerSlug: "sompal-kami" },
];

const rankingsData = [
  { category: "biggest-collapse", title: "9/45 vs UAE — The Kirtipur Avalanche", playerSlug: "rohit-paudel", score: 97.5, reason: "Nine wickets for 45 in 8.4 overs. Choreography-level coordination." },
  { category: "unluckiest-player", title: "Mr. 99 Not Out*", playerSlug: "kushal-bhurtel", score: 91.0, reason: "Out for 99, dropped four times on 0 in the same season. Cosmic balance." },
  { category: "fan-favorite", title: "The People's Keeper", playerSlug: "aasif-sheikh", score: 95.5, reason: "Fair play award winner; apologizes during stumpings." },
  { category: "meme-king", title: "Six Sixes, Infinite Templates", playerSlug: "dipendra-singh-airee", score: 98.0, reason: "One over in 2023 still generating 40% of all Nepali cricket memes." },
  { category: "redemption-arc", title: "Duck Today, Daddy Hundred Tomorrow", playerSlug: "kushal-malla", score: 88.5, reason: "Golden duck against UAE; fastest fifty narrative loading…" },
];

const polls = [
  {
    id: "poll-next-collapse",
    question: "What's the most reliable thing in Nepali cricket?",
    options: [
      { id: "opt-1", label: "Top-order wobble in the powerplay", votes: 423 },
      { id: "opt-2", label: "Karan KC last-over heart attack", votes: 387 },
      { id: "opt-3", label: "Rain at Kirtipur on finals day", votes: 298 },
      { id: "opt-4", label: "The memes afterwards", votes: 612 },
    ],
  },
  {
    id: "poll-batting-position",
    question: "Where should the next golden duck bat?",
    options: [
      { id: "opt-1", label: "Opener — get it done early", votes: 215 },
      { id: "opt-2", label: "No. 11 — protect the duck", votes: 174 },
      { id: "opt-3", label: "Retired out preemptively", votes: 351 },
    ],
  },
];

// ── Seeding ──────────────────────────────────────────────────────────────────

async function rowExists(tableId: string, rowId: string): Promise<boolean> {
  try {
    await tables.getRow({ databaseId, tableId, rowId });
    return true;
  } catch {
    return false;
  }
}

async function seedAdmin(): Promise<void> {
  console.log("\nAdmin user:");
  if (!adminPassword || adminPassword.length < 8) {
    console.log("  • ADMIN_PASSWORD not set (min 8 chars) — skipping admin creation.");
    return;
  }
  const existing = await users.list({ queries: [Query.equal("email", adminEmail)] });
  let userId: string;
  if (existing.total > 0) {
    userId = existing.users[0].$id;
    console.log(`  • ${adminEmail} (already exists)`);
  } else {
    const created = await users.create({
      userId: ID.unique(),
      email: adminEmail,
      password: adminPassword,
      name: adminName,
    });
    userId = created.$id;
    console.log(`  ✔ created ${adminEmail}`);
  }
  await users.updateLabels({ userId, labels: ["admin"] });
  console.log("  ✔ admin label applied");
}

async function main(): Promise<void> {
  console.log(`\nSeeding ${databaseId} on project ${projectId}\n`);

  await seedAdmin();

  console.log("\nPlayers:");
  const playerIds = new Map<string, string>();
  for (const [i, p] of players.entries()) {
    const image = await uploadSvg("player-images", p.slug, avatarSvg(p.name, i));
    playerIds.set(p.slug, p.slug);
    if (await rowExists("players", p.slug)) {
      console.log(`  • player ${p.slug} (already exists)`);
      continue;
    }
    await tables.createRow({
      databaseId,
      tableId: "players",
      rowId: p.slug,
      data: {
        name: p.name,
        slug: p.slug,
        image,
        role: p.role,
        battingStyle: p.battingStyle,
        bowlingStyle: p.bowlingStyle,
        team: "Nepal",
        bio: p.bio,
        stats: JSON.stringify(p.stats),
        memeScore: p.memeScore,
        fanScore: p.fanScore,
        trending: p.trending,
        currentForm: p.currentForm,
      },
    });
    console.log(`  ✔ player ${p.slug}`);
  }

  console.log("\nMatches:");
  for (const m of matches) {
    if (await rowExists("matches", m.id)) {
      console.log(`  • match ${m.id} (already exists)`);
      continue;
    }
    const date = new Date(Date.now() - m.daysAgo * 24 * 60 * 60 * 1000).toISOString();
    await tables.createRow({
      databaseId,
      tableId: "matches",
      rowId: m.id,
      data: {
        opponent: m.opponent,
        date,
        result: m.result,
        format: m.format,
        venue: m.venue,
        nepalScore: m.nepalScore,
        opponentScore: m.opponentScore,
        scorecard: m.scorecard ? JSON.stringify(m.scorecard) : null,
        summary: m.summary,
        funnyAnalysis: m.funnyAnalysis,
      },
    });
    console.log(`  ✔ match vs ${m.opponent}`);
  }

  console.log("\nSatire posts:");
  for (const [i, post] of posts.entries()) {
    const image = await uploadSvg("post-images", post.slug.slice(0, 36), cardSvg(post.title, post.emoji, i));
    if (await rowExists("satire_posts", post.slug.slice(0, 36))) {
      console.log(`  • post ${post.slug} (already exists)`);
      continue;
    }
    await tables.createRow({
      databaseId,
      tableId: "satire_posts",
      rowId: post.slug.slice(0, 36),
      data: {
        title: post.title,
        slug: post.slug,
        content: post.content,
        excerpt: post.excerpt,
        playerId: post.playerSlug,
        matchId: null,
        category: post.category,
        image,
        status: "published",
        featured: i < 3,
        views: 800 + Math.floor(Math.random() * 4200),
        likes: 50 + Math.floor(Math.random() * 450),
        source: "manual",
      },
    });
    console.log(`  ✔ post ${post.slug.slice(0, 40)}…`);
  }

  console.log("\nMemes:");
  for (const [i, meme] of memes.entries()) {
    const image = await uploadSvg("meme-images", meme.id, cardSvg(meme.title, meme.emoji, i + 2));
    if (await rowExists("memes", meme.id)) {
      console.log(`  • meme ${meme.id} (already exists)`);
      continue;
    }
    await tables.createRow({
      databaseId,
      tableId: "memes",
      rowId: meme.id,
      data: {
        title: meme.title,
        image,
        type: "image",
        videoUrl: null,
        playerId: meme.playerSlug,
        likes: typeof meme.likes === "number" ? meme.likes : 142,
        shares: typeof meme.shares === "number" ? meme.shares : 58,
        status: "published",
        submittedBy: "CricSatire Editorial",
      },
    });
    console.log(`  ✔ meme ${meme.id}`);
  }

  console.log("\nFan reactions:");
  for (const [i, r] of reactions.entries()) {
    const id = `reaction-${i + 1}`;
    if (await rowExists("fan_reactions", id)) {
      console.log(`  • ${id} (already exists)`);
      continue;
    }
    await tables.createRow({
      databaseId,
      tableId: "fan_reactions",
      rowId: id,
      data: {
        username: r.username,
        reaction: r.reaction,
        playerId: r.playerSlug,
        postId: null,
        likes: 10 + Math.floor(Math.random() * 240),
        status: "published",
      },
    });
    console.log(`  ✔ ${id} (${r.username})`);
  }

  console.log("\nRankings:");
  const period = new Date().toISOString().slice(0, 7);
  for (const r of rankingsData) {
    const id = `rank-${r.category}-${period}`;
    if (await rowExists("rankings", id)) {
      console.log(`  • ${id} (already exists)`);
      continue;
    }
    await tables.createRow({
      databaseId,
      tableId: "rankings",
      rowId: id,
      data: {
        title: r.title,
        category: r.category,
        playerId: r.playerSlug,
        score: r.score,
        reason: r.reason,
        period,
      },
    });
    console.log(`  ✔ ${id}`);
  }

  console.log("\nPolls:");
  for (const poll of polls) {
    if (await rowExists("polls", poll.id)) {
      console.log(`  • ${poll.id} (already exists)`);
      continue;
    }
    await tables.createRow({
      databaseId,
      tableId: "polls",
      rowId: poll.id,
      data: {
        question: poll.question,
        options: JSON.stringify(poll.options),
        active: true,
        totalVotes: poll.options.reduce((sum, o) => sum + o.votes, 0),
      },
    });
    console.log(`  ✔ ${poll.id}`);
  }

  console.log("\n✔ Seed complete. Start the app with: npm run dev\n");
}

main().catch((err) => {
  console.error("\nSeed failed:", err);
  process.exit(1);
});
