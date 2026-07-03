"use client";

import { useActionState, useState } from "react";
import { lookupCredit, type LookupResult } from "@/app/actions/lookup";

const initialState: LookupResult | null = null;

export function LookupForm() {
  const [state, formAction, pending] = useActionState(
    async (_prev: LookupResult | null, formData: FormData) => {
      const email = formData.get("email")?.toString() ?? "";
      return lookupCredit(email);
    },
    initialState,
  );

  const [copied, setCopied] = useState(false);

  async function handleCopy(link: string) {
    await navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="w-full max-w-[420px]">
      <form action={formAction} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm text-muted mb-2">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full rounded-md border border-border bg-card px-4 py-3 text-foreground placeholder:text-muted/60"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-md bg-accent px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
        >
          {pending ? "Checking..." : "Check"}
        </button>
      </form>

      {state && (
        <div className="mt-6">
          <ResultMessage state={state} copied={copied} onCopy={handleCopy} />
        </div>
      )}
    </div>
  );
}

function ResultMessage({
  state,
  copied,
  onCopy,
}: {
  state: LookupResult;
  copied: boolean;
  onCopy: (link: string) => void;
}) {
  switch (state.status) {
    case "found":
      return (
        <div className="rounded-md border border-border bg-card p-4 space-y-3">
          <p className="text-sm text-success">Your redeem link</p>
          <div className="flex gap-2">
            <input
              readOnly
              value={state.link}
              className="flex-1 rounded-md border border-border bg-background px-3 py-2 font-mono text-xs text-foreground"
            />
            <button
              type="button"
              onClick={() => onCopy(state.link)}
              className="shrink-0 rounded-md border border-border px-3 py-2 text-sm transition-colors hover:bg-border/50"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      );
    case "pending":
      return (
        <p className="text-sm text-muted text-center">
          Your credit is being prepared. Check back soon.
        </p>
      );
    case "not_found":
      return (
        <p className="text-sm text-muted text-center">
          Email not found. Make sure you entered the address you registered
          with.
        </p>
      );
    case "rate_limited":
      return (
        <p className="text-sm text-muted text-center">
          Please wait a moment before checking again.
        </p>
      );
    case "error":
      return (
        <p className="text-sm text-error text-center">{state.message}</p>
      );
    default: {
      const _exhaustive: never = state;
      return _exhaustive;
    }
  }
}
