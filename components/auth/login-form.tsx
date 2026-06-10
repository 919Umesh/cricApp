"use client";

import { Lock } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { login, type AuthFormState } from "@/lib/actions/auth";

const initialState: AuthFormState = { error: null };

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);
  const searchParams = useSearchParams();
  const notAdmin = searchParams.get("error") === "not-admin";

  return (
    <Card className="w-full max-w-md py-0">
      <CardContent className="p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 grid size-12 place-items-center rounded-2xl bg-primary text-xl text-primary-foreground">
            <Lock className="size-5" />
          </div>
          <h1 className="font-heading text-2xl font-bold">Admin Pavilion</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Members only. The duck stamp is kept here.
          </p>
        </div>

        <form action={formAction} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="admin@cricsatire.com"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••••••"
            />
          </div>
          <Button type="submit" disabled={pending} className="mt-2">
            {pending ? "Checking the team sheet…" : "Sign in"}
          </Button>
          {state.error ? (
            <p className="text-sm text-destructive" role="alert">
              {state.error}
            </p>
          ) : null}
          {notAdmin && !state.error ? (
            <p className="text-sm text-destructive" role="alert">
              That account exists but is not on the admin team sheet.
            </p>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
