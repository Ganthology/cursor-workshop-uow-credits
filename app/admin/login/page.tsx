"use client";

import { useActionState } from "react";
import { loginAdmin } from "@/app/actions/admin";

export default function AdminLoginPage() {
  const [state, formAction, pending] = useActionState(loginAdmin, undefined);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-[420px]">
        <div className="mb-8 text-center">
          <h1 className="text-xl font-medium tracking-tight">Admin</h1>
          <p className="mt-2 text-sm text-muted">Enter password to continue</p>
        </div>

        <form action={formAction} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm text-muted mb-2">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-border bg-card px-4 py-3 text-foreground"
            />
          </div>

          {state?.error && (
            <p className="text-sm text-error text-center">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-md bg-accent px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {pending ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
