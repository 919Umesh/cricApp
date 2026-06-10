import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { Skeleton } from "@/components/ui/skeleton";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="container-page flex justify-center py-24">
      <Suspense fallback={<Skeleton className="h-105 w-full max-w-md rounded-xl" />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
