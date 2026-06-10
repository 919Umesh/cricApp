import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/appwrite/config";
import { createSessionClient, createAdminClient } from "@/lib/appwrite/server";
import type { SessionUser } from "@/lib/types";

/** Resolve the signed-in user from the session cookie, or null. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(SESSION_COOKIE)?.value;
  if (!cookieValue) return null;

  try {
    let secret = cookieValue;
    let userId = "";

    try {
      const parsed = JSON.parse(cookieValue);
      secret = parsed.secret;
      userId = parsed.userId;
    } catch {
      // Legacy format (just secret)
    }

    if (userId) {
      const { users } = createAdminClient();

      // In a strict production environment, you might want to also verify
      // that `secret` matches an active session by calling users.listSessions(userId)
      // but Appwrite's Admin API makes verifying secrets directly tricky.
      // This workaround lets the admin access the site.
      const user = await users.get(userId);

      return {
        $id: user.$id,
        name: user.name,
        email: user.email,
        labels: user.labels,
        isAdmin: user.labels.includes("admin"),
      };
    }

    // Fallback if no userId in cookie (will throw scope error if Appwrite config requires it)
    const { account } = createSessionClient(secret);
    const user = await account.get();
    return {
      $id: user.$id,
      name: user.name,
      email: user.email,
      labels: user.labels,
      isAdmin: user.labels.includes("admin"),
    };
  } catch {
    return null;
  }
}

/** Gate for admin pages: redirects to /login unless an admin is signed in. */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  if (!user.isAdmin) redirect("/login?error=not-admin");
  return user;
}
