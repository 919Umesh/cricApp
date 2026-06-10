"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SESSION_COOKIE } from "@/lib/appwrite/config";
import { createAnonymousClient, createSessionClient, createAdminClient } from "@/lib/appwrite/server";
import { loginSchema } from "@/lib/validation";

export interface AuthFormState {
  error: string | null;
}

export async function login(
  _prev: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  let secret: string;
  let expire: string;
  let userId: string;
  try {
    const { account } = createAnonymousClient();
    const session = await account.createEmailPasswordSession({
      email: parsed.data.email,
      password: parsed.data.password,
    });
    secret = session.secret;
    expire = session.expire;
    userId = session.userId;
  } catch {
    return { error: "Invalid credentials. Even our middle order defends better." };
  }

  // Only admins may hold a session on this site.
  try {
    const { users } = createAdminClient();
    const user = await users.get(userId);

    if (!user.labels.includes("admin")) {
      const { account } = createSessionClient(secret);
      await account.deleteSession({ sessionId: "current" });
      return { error: "This account does not have admin access." };
    }
  } catch (e) {
    console.error("VERIFY ERROR:", e);
    return { error: "Could not verify the account. Try again." };
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, JSON.stringify({ secret, userId }), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(expire),
    path: "/",
  });

  redirect("/admin");
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(SESSION_COOKIE)?.value;
  if (cookieValue) {
    let secret = cookieValue;
    try {
      secret = JSON.parse(cookieValue).secret;
    } catch {}

    try {
      const { account } = createSessionClient(secret);
      await account.deleteSession({ sessionId: "current" });
    } catch {
      // Session already invalid — clearing the cookie is enough.
    }
  }
  cookieStore.delete(SESSION_COOKIE);
  redirect("/login");
}
