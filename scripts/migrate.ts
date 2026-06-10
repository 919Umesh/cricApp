/**
 * Appwrite migration script — creates the database, tables (TablesDB),
 * columns, indexes and storage buckets. Idempotent: safe to re-run.
 *
 *   npm run migrate
 */
import "dotenv/config";
import {
  Client,
  Compression,
  TablesDBIndexType,
  Permission,
  Role,
  Storage,
  TablesDB,
} from "node-appwrite";

const endpoint = process.env.APPWRITE_ENDPOINT ?? "https://fra.cloud.appwrite.io/v1";
const projectId = process.env.APPWRITE_PROJECT_ID ?? "";
const apiKey = process.env.APPWRITE_API_KEY ?? "";
const databaseId = process.env.APPWRITE_DATABASE_ID ?? "cric-satire";

if (!projectId || !apiKey || apiKey.startsWith("YOUR_")) {
  console.error(
    "✖ APPWRITE_PROJECT_ID / APPWRITE_API_KEY missing or placeholder in .env.\n" +
      "  Create an API key in the Appwrite console (scopes: databases, tables,\n" +
      "  storage, users) and update .env before running migrations.",
  );
  process.exit(1);
}

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const tables = new TablesDB(client);
const storage = new Storage(client);

type AppwriteError = { code?: number; type?: string; message?: string };

/** Run an Appwrite call, tolerating 409 (already exists). */
async function ensure<T>(label: string, fn: () => Promise<T>): Promise<void> {
  try {
    await fn();
    console.log(`  ✔ ${label}`);
  } catch (err) {
    const e = err as AppwriteError;
    if (e.code === 409) {
      console.log(`  • ${label} (already exists)`);
    } else {
      console.error(`  ✖ ${label}: ${e.message ?? err}`);
      throw err;
    }
  }
}

const publicRead = [Permission.read(Role.any())];

interface ColumnDef {
  kind: "string" | "longtext" | "integer" | "float" | "boolean" | "datetime" | "enum" | "email" | "url";
  key: string;
  size?: number;
  required?: boolean;
  xdefault?: string | number | boolean;
  elements?: string[];
}

interface IndexDef {
  key: string;
  type: TablesDBIndexType;
  columns: string[];
}

interface TableDef {
  id: string;
  name: string;
  columns: ColumnDef[];
  indexes: IndexDef[];
}

const tableDefs: TableDef[] = [
  {
    id: "players",
    name: "Players",
    columns: [
      { kind: "string", key: "name", size: 120, required: true },
      { kind: "string", key: "slug", size: 120, required: true },
      { kind: "string", key: "image", size: 512 },
      {
        kind: "enum",
        key: "role",
        elements: ["Batter", "Bowler", "All-Rounder", "Wicket-Keeper"],
        required: true,
      },
      { kind: "string", key: "battingStyle", size: 60 },
      { kind: "string", key: "bowlingStyle", size: 60 },
      { kind: "string", key: "team", size: 60, xdefault: "Nepal" },
      { kind: "longtext", key: "bio" },
      { kind: "longtext", key: "stats" },
      { kind: "integer", key: "memeScore", xdefault: 50 },
      { kind: "integer", key: "fanScore", xdefault: 50 },
      { kind: "boolean", key: "trending", xdefault: false },
      { kind: "string", key: "currentForm", size: 200 },
    ],
    indexes: [
      { key: "idx_slug", type: TablesDBIndexType.Unique, columns: ["slug"] },
      { key: "idx_trending", type: TablesDBIndexType.Key, columns: ["trending"] },
      { key: "idx_meme_score", type: TablesDBIndexType.Key, columns: ["memeScore"] },
      { key: "ft_name", type: TablesDBIndexType.Fulltext, columns: ["name"] },
    ],
  },
  {
    id: "matches",
    name: "Matches",
    columns: [
      { kind: "string", key: "opponent", size: 100, required: true },
      { kind: "datetime", key: "date", required: true },
      {
        kind: "enum",
        key: "result",
        elements: ["won", "lost", "tied", "no-result", "upcoming", "live"],
        required: true,
      },
      {
        kind: "enum",
        key: "format",
        elements: ["T20I", "ODI", "Test", "List-A"],
        required: true,
      },
      { kind: "string", key: "venue", size: 200 },
      { kind: "string", key: "nepalScore", size: 40 },
      { kind: "string", key: "opponentScore", size: 40 },
      { kind: "longtext", key: "scorecard" },
      { kind: "longtext", key: "summary" },
      { kind: "longtext", key: "funnyAnalysis" },
    ],
    indexes: [
      { key: "idx_date", type: TablesDBIndexType.Key, columns: ["date"] },
      { key: "idx_result", type: TablesDBIndexType.Key, columns: ["result"] },
    ],
  },
  {
    id: "satire_posts",
    name: "Satire Posts",
    columns: [
      { kind: "string", key: "title", size: 250, required: true },
      { kind: "string", key: "slug", size: 250, required: true },
      { kind: "longtext", key: "content", required: true },
      { kind: "string", key: "excerpt", size: 500 },
      { kind: "string", key: "playerId", size: 64 },
      { kind: "string", key: "matchId", size: 64 },
      {
        kind: "enum",
        key: "category",
        elements: [
          "golden-duck-club",
          "run-machine",
          "catch-drop-legends",
          "captaincy-masterclass",
          "collapse-of-the-week",
          "meme-hall-of-fame",
        ],
        required: true,
      },
      { kind: "string", key: "image", size: 512 },
      {
        kind: "enum",
        key: "status",
        elements: ["draft", "pending", "published", "rejected"],
        xdefault: "draft",
      },
      { kind: "boolean", key: "featured", xdefault: false },
      { kind: "integer", key: "views", xdefault: 0 },
      { kind: "integer", key: "likes", xdefault: 0 },
      { kind: "enum", key: "source", elements: ["manual", "auto"], xdefault: "manual" },
    ],
    indexes: [
      { key: "idx_slug", type: TablesDBIndexType.Unique, columns: ["slug"] },
      { key: "idx_status", type: TablesDBIndexType.Key, columns: ["status"] },
      { key: "idx_category", type: TablesDBIndexType.Key, columns: ["category"] },
      { key: "idx_player", type: TablesDBIndexType.Key, columns: ["playerId"] },
      { key: "idx_featured", type: TablesDBIndexType.Key, columns: ["featured"] },
      { key: "ft_title", type: TablesDBIndexType.Fulltext, columns: ["title"] },
    ],
  },
  {
    id: "memes",
    name: "Memes",
    columns: [
      { kind: "string", key: "title", size: 200, required: true },
      { kind: "string", key: "image", size: 512, required: true },
      { kind: "enum", key: "type", elements: ["image", "video"], xdefault: "image" },
      { kind: "string", key: "videoUrl", size: 512 },
      { kind: "string", key: "playerId", size: 64 },
      { kind: "integer", key: "likes", xdefault: 0 },
      { kind: "integer", key: "shares", xdefault: 0 },
      {
        kind: "enum",
        key: "status",
        elements: ["pending", "published", "rejected"],
        xdefault: "pending",
      },
      { kind: "string", key: "submittedBy", size: 80 },
    ],
    indexes: [
      { key: "idx_status", type: TablesDBIndexType.Key, columns: ["status"] },
      { key: "idx_likes", type: TablesDBIndexType.Key, columns: ["likes"] },
      { key: "idx_player", type: TablesDBIndexType.Key, columns: ["playerId"] },
      { key: "ft_title", type: TablesDBIndexType.Fulltext, columns: ["title"] },
    ],
  },
  {
    id: "fan_reactions",
    name: "Fan Reactions",
    columns: [
      { kind: "string", key: "username", size: 80, required: true },
      { kind: "string", key: "reaction", size: 600, required: true },
      { kind: "string", key: "playerId", size: 64 },
      { kind: "string", key: "postId", size: 64 },
      { kind: "integer", key: "likes", xdefault: 0 },
      {
        kind: "enum",
        key: "status",
        elements: ["pending", "published"],
        xdefault: "pending",
      },
    ],
    indexes: [
      { key: "idx_status", type: TablesDBIndexType.Key, columns: ["status"] },
      { key: "idx_player", type: TablesDBIndexType.Key, columns: ["playerId"] },
    ],
  },
  {
    id: "rankings",
    name: "Rankings",
    columns: [
      { kind: "string", key: "title", size: 150, required: true },
      {
        kind: "enum",
        key: "category",
        elements: [
          "biggest-collapse",
          "unluckiest-player",
          "fan-favorite",
          "meme-king",
          "redemption-arc",
        ],
        required: true,
      },
      { kind: "string", key: "playerId", size: 64, required: true },
      { kind: "float", key: "score", required: true },
      { kind: "string", key: "reason", size: 300 },
      { kind: "string", key: "period", size: 7, required: true },
    ],
    indexes: [
      { key: "idx_category", type: TablesDBIndexType.Key, columns: ["category"] },
      { key: "idx_period", type: TablesDBIndexType.Key, columns: ["period"] },
      { key: "idx_score", type: TablesDBIndexType.Key, columns: ["score"] },
    ],
  },
  {
    id: "polls",
    name: "Polls",
    columns: [
      { kind: "string", key: "question", size: 300, required: true },
      { kind: "longtext", key: "options", required: true },
      { kind: "boolean", key: "active", xdefault: true },
      { kind: "integer", key: "totalVotes", xdefault: 0 },
    ],
    indexes: [{ key: "idx_active", type: TablesDBIndexType.Key, columns: ["active"] }],
  },
  {
    id: "subscribers",
    name: "Newsletter Subscribers",
    columns: [{ kind: "email", key: "email", required: true }],
    indexes: [{ key: "idx_email", type: TablesDBIndexType.Unique, columns: ["email"] }],
  },
];

async function createColumn(tableId: string, col: ColumnDef): Promise<void> {
  const base = { databaseId, tableId, key: col.key, required: col.required ?? false };
  switch (col.kind) {
    case "string":
      await tables.createStringColumn({
        ...base,
        size: col.size ?? 255,
        xdefault: col.required ? undefined : (col.xdefault as string | undefined),
      });
      break;
    case "longtext":
      await tables.createStringColumn({ ...base, size: 65535 });
      break;
    case "integer":
      await tables.createIntegerColumn({
        ...base,
        xdefault: col.required ? undefined : (col.xdefault as number | undefined),
      });
      break;
    case "float":
      await tables.createFloatColumn({
        ...base,
        xdefault: col.required ? undefined : (col.xdefault as number | undefined),
      });
      break;
    case "boolean":
      await tables.createBooleanColumn({
        ...base,
        xdefault: col.required ? undefined : (col.xdefault as boolean | undefined),
      });
      break;
    case "datetime":
      await tables.createDatetimeColumn(base);
      break;
    case "enum":
      await tables.createEnumColumn({
        ...base,
        elements: col.elements ?? [],
        xdefault: col.required ? undefined : (col.xdefault as string | undefined),
      });
      break;
    case "email":
      await tables.createEmailColumn(base);
      break;
    case "url":
      await tables.createUrlColumn(base);
      break;
  }
}

const buckets = [
  { id: "player-images", name: "Player Images" },
  { id: "post-images", name: "Post Images" },
  { id: "meme-images", name: "Meme Images" },
  { id: "uploads", name: "Uploads" },
];

async function main(): Promise<void> {
  console.log(`\nMigrating Appwrite project ${projectId} @ ${endpoint}\n`);

  console.log("Database:");
  await ensure(`database "${databaseId}"`, () =>
    tables.create({ databaseId, name: "Cric Satire" }),
  );

  for (const def of tableDefs) {
    console.log(`\nTable: ${def.name} (${def.id})`);
    await ensure(`table "${def.id}"`, () =>
      tables.createTable({
        databaseId,
        tableId: def.id,
        name: def.name,
        permissions: publicRead,
        rowSecurity: false,
      }),
    );
    for (const col of def.columns) {
      await ensure(`column ${def.id}.${col.key}`, () => createColumn(def.id, col));
    }
  }

  // Columns are created asynchronously; wait briefly so indexes don't race.
  console.log("\nWaiting for columns to become available before indexing…");
  await new Promise((resolve) => setTimeout(resolve, 4000));

  for (const def of tableDefs) {
    for (const idx of def.indexes) {
      await ensure(`index ${def.id}.${idx.key}`, () =>
        tables.createIndex({
          databaseId,
          tableId: def.id,
          key: idx.key,
          type: idx.type,
          columns: idx.columns,
        }),
      );
    }
  }

  console.log("\nStorage buckets:");
  for (const bucket of buckets) {
    await ensure(`bucket "${bucket.id}"`, () =>
      storage.createBucket({
        bucketId: bucket.id,
        name: bucket.name,
        permissions: publicRead,
        fileSecurity: false,
        maximumFileSize: 10 * 1024 * 1024,
        allowedFileExtensions: ["jpg", "jpeg", "png", "gif", "webp", "svg", "mp4", "webm"],
        compression: Compression.Gzip,
      }),
    );
  }

  console.log("\n✔ Migration complete.\n");
}

main().catch((err) => {
  console.error("\nMigration failed:", err);
  process.exit(1);
});
