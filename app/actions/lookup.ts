"use server";

import { headers } from "next/headers";
import { createServiceClient } from "@/lib/supabase/server";
import { normalizeEmail, isValidEmail } from "@/lib/csv";

export type LookupResult =
  | { status: "not_found" }
  | { status: "pending" }
  | { status: "found"; link: string }
  | { status: "error"; message: string }
  | { status: "rate_limited" };

const RATE_LIMIT_MS = 30_000;

export async function lookupCredit(email: string): Promise<LookupResult> {
  const normalized = normalizeEmail(email);

  if (!normalized || !isValidEmail(normalized)) {
    return { status: "error", message: "Please enter a valid email address." };
  }

  try {
    const supabase = createServiceClient();

    const rateLimitCutoff = new Date(Date.now() - RATE_LIMIT_MS).toISOString();
    const { data: recentLogs } = await supabase
      .from("redemption_logs")
      .select("id")
      .eq("email", normalized)
      .gte("created_at", rateLimitCutoff)
      .limit(1);

    if (recentLogs && recentLogs.length > 0) {
      return { status: "rate_limited" };
    }

    const { data: participant, error } = await supabase
      .from("participants")
      .select(
        `
        id,
        email,
        credit_link_id,
        credit_links (
          id,
          url
        )
      `,
      )
      .eq("email", normalized)
      .maybeSingle();

    if (error) {
      console.error("Lookup error:", error);
      return { status: "error", message: "Something went wrong. Try again." };
    }

    if (!participant) {
      return { status: "not_found" };
    }

    const creditLink = participant.credit_links as
      | { id: string; url: string }
      | { id: string; url: string }[]
      | null;

    const linkData = Array.isArray(creditLink) ? creditLink[0] : creditLink;

    if (!linkData?.url) {
      return { status: "pending" };
    }

    const headersList = await headers();
    const ipAddress =
      headersList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headersList.get("x-real-ip") ??
      null;
    const userAgent = headersList.get("user-agent");

    await supabase.from("redemption_logs").insert({
      email: normalized,
      credit_link_id: linkData.id,
      link_url: linkData.url,
      ip_address: ipAddress,
      user_agent: userAgent,
    });

    return { status: "found", link: linkData.url };
  } catch (err) {
    console.error("Lookup failed:", err);
    return { status: "error", message: "Something went wrong. Try again." };
  }
}
