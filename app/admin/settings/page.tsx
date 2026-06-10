import { Bot, Database, KeyRound, Users } from "lucide-react";
import type { Metadata } from "next";
import { ActionButton } from "@/components/admin/action-button";
import { Card, CardContent } from "@/components/ui/card";
import { triggerIngestion } from "@/lib/actions/admin";
import { appwriteConfig, hasServerCredentials } from "@/lib/appwrite/config";
import { createAdminClient } from "@/lib/appwrite/server";
import { formatDate } from "@/lib/utils";

export const metadata: Metadata = { title: "Settings" };

interface UserSummary {
  $id: string;
  name: string;
  email: string;
  labels: string[];
  $createdAt: string;
}

async function fetchUsers(): Promise<{ total: number; users: UserSummary[] } | null> {
  if (!hasServerCredentials()) return null;
  try {
    const { users } = createAdminClient();
    const list = await users.list({});
    return {
      total: list.total,
      users: list.users.map((u) => ({
        $id: u.$id,
        name: u.name,
        email: u.email,
        labels: u.labels,
        $createdAt: u.$createdAt,
      })),
    };
  } catch {
    return null;
  }
}

async function UsersList() {
  const list = await fetchUsers();
  if (!list) return null;

  return (
    <Card className="py-0">
      <CardContent className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Users className="size-5 text-primary" />
          <h2 className="font-heading text-lg font-bold">Users ({list.total})</h2>
        </div>
        <div className="divide-y divide-border/60">
          {list.users.map((user) => (
            <div key={user.$id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{user.name || user.email}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user.email} · joined {formatDate(user.$createdAt)}
                </p>
              </div>
              <span className="shrink-0 text-xs font-semibold">
                {user.labels.includes("admin") ? "🛡️ admin" : "visitor"}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  const configured = hasServerCredentials();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="font-heading mb-1 text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Pipeline controls and backend status.
        </p>
      </div>

      <Card className="py-0">
        <CardContent className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <Bot className="size-5 text-primary" />
            <h2 className="font-heading text-lg font-bold">Content pipeline</h2>
          </div>
          <p className="mb-4 text-sm text-muted-foreground">
            Fetches recent Nepal matches, detects ducks/collapses/heartbreaks, generates satire
            posts and fan reactions, updates meme scores and rankings. Runs automatically every 6
            hours via cron (<code>/api/cron/ingest</code>) — or right now, if you can&apos;t wait
            for fresh material.
          </p>
          <ActionButton variant="default" size="default" action={triggerIngestion}>
            Run pipeline now
          </ActionButton>
        </CardContent>
      </Card>

      <Card className="py-0">
        <CardContent className="p-6">
          <div className="mb-3 flex items-center gap-2">
            <Database className="size-5 text-primary" />
            <h2 className="font-heading text-lg font-bold">Backend status</h2>
          </div>
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Appwrite endpoint</dt>
              <dd className="truncate font-mono text-xs">{appwriteConfig.endpoint}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Project</dt>
              <dd className="font-mono text-xs">{appwriteConfig.projectId || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Database</dt>
              <dd className="font-mono text-xs">{appwriteConfig.databaseId}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="flex items-center gap-1.5 text-muted-foreground">
                <KeyRound className="size-3.5" />
                API key
              </dt>
              <dd className={configured ? "text-emerald-600 dark:text-emerald-400" : "text-destructive"}>
                {configured ? "configured" : "missing / placeholder — set APPWRITE_API_KEY"}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <UsersList />
    </div>
  );
}
