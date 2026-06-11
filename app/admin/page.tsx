import {
  Flag,
  ImageIcon,
  Mail,
  MessageSquare,
  Newspaper,
  Zap,
  Trophy,
  Users,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { PipelineTrigger } from "@/components/admin/pipeline-trigger";
import { getAdminStats } from "@/lib/services/admin-stats";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();

  const cards = [
    { label: "Players", value: stats.players, icon: Users, href: "/admin/players" },
    {
      label: "Posts",
      value: stats.posts,
      sub: `${stats.publishedPosts} published · ${stats.pendingPosts} pending`,
      icon: Newspaper,
      href: "/admin/posts",
    },
    {
      label: "Memes",
      value: stats.memes,
      sub: `${stats.pendingMemes} awaiting moderation`,
      icon: ImageIcon,
      href: "/admin/moderation",
    },
    {
      label: "Fan Reactions",
      value: stats.reactions,
      sub: `${stats.pendingReactions} awaiting moderation`,
      icon: MessageSquare,
      href: "/admin/moderation",
    },
    { label: "Matches", value: stats.matches, icon: Trophy, href: "/admin/settings" },
    { label: "Subscribers", value: stats.subscribers, icon: Mail, href: "/admin" },
  ];

  const pendingTotal = stats.pendingMemes + stats.pendingReactions + stats.pendingPosts;

  return (
    <div>
      <h1 className="font-heading mb-1 text-2xl font-bold">Dashboard</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Mission control for the meme economy.
      </p>

      <div className="mb-6 space-y-3">
        <PipelineTrigger />
        {pendingTotal > 0 ? (
          <Link
            href="/admin/moderation"
            className="flex items-center gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-500/20 dark:text-amber-400"
          >
            <Flag className="size-4" />
            {pendingTotal} item{pendingTotal === 1 ? "" : "s"} waiting for moderation — the queue
            grows restless.
          </Link>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(({ label, value, sub, icon: Icon, href }) => (
          <Link key={label} href={href}>
            <Card className="py-0 transition-all hover:-translate-y-0.5 hover:shadow-md">
              <CardContent className="flex items-start justify-between p-5">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="font-heading mt-1 text-3xl font-bold">{value}</p>
                  {sub ? <p className="mt-1 text-xs text-muted-foreground">{sub}</p> : null}
                </div>
                <div className="grid size-10 place-items-center rounded-xl bg-accent text-accent-foreground">
                  <Icon className="size-5" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
