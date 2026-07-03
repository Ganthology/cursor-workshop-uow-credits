"use server";

import { redirect } from "next/navigation";
import { createServiceClient } from "@/lib/supabase/server";
import {
  isAdminAuthenticated,
  setAdminSession,
  clearAdminSession,
  verifyPassword,
} from "@/lib/admin-auth";
import {
  parseSingleColumnCsv,
  normalizeEmail,
  isValidEmail,
} from "@/lib/csv";
import { buildAssignmentPairs } from "@/lib/assignment";

async function requireAdmin(): Promise<void> {
  const authed = await isAdminAuthenticated();
  if (!authed) redirect("/admin/login");
}

export async function loginAdmin(
  _prev: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const password = formData.get("password")?.toString() ?? "";

  if (!verifyPassword(password)) {
    return { error: "Invalid password." };
  }

  await setAdminSession();
  redirect("/admin");
}

export async function logoutAdmin(): Promise<void> {
  await clearAdminSession();
  redirect("/admin/login");
}

export type UploadResult = {
  added: number;
  skipped: number;
  invalid: number;
  error?: string;
};

export async function uploadCreditLinks(
  formData: FormData,
): Promise<UploadResult> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { added: 0, skipped: 0, invalid: 0, error: "No file provided." };
  }

  const content = await file.text();
  const urls = parseSingleColumnCsv(content);

  if (urls.length === 0) {
    return { added: 0, skipped: 0, invalid: 0, error: "CSV is empty." };
  }

  const supabase = createServiceClient();
  let added = 0;
  let skipped = 0;
  let invalid = 0;

  for (const url of urls) {
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      invalid++;
      continue;
    }

    const { error } = await supabase
      .from("credit_links")
      .insert({ url })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        skipped++;
      } else {
        console.error("Insert credit link error:", error);
        invalid++;
      }
    } else {
      added++;
    }
  }

  return { added, skipped, invalid };
}

export async function uploadParticipants(
  formData: FormData,
): Promise<UploadResult> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { added: 0, skipped: 0, invalid: 0, error: "No file provided." };
  }

  const content = await file.text();
  const rawEmails = parseSingleColumnCsv(content);

  if (rawEmails.length === 0) {
    return { added: 0, skipped: 0, invalid: 0, error: "CSV is empty." };
  }

  const supabase = createServiceClient();
  let added = 0;
  let skipped = 0;
  let invalid = 0;

  for (const raw of rawEmails) {
    const email = normalizeEmail(raw);

    if (!isValidEmail(email)) {
      invalid++;
      continue;
    }

    const { error } = await supabase
      .from("participants")
      .insert({ email })
      .select("id")
      .single();

    if (error) {
      if (error.code === "23505") {
        skipped++;
      } else {
        console.error("Insert participant error:", error);
        invalid++;
      }
    } else {
      added++;
    }
  }

  return { added, skipped, invalid };
}

export type AssignResult = {
  assigned: number;
  unassignedEmails: number;
  remainingLinks: number;
  error?: string;
};

export async function assignCredits(): Promise<AssignResult> {
  await requireAdmin();

  const supabase = createServiceClient();

  const { data: participants, error: pError } = await supabase
    .from("participants")
    .select("id")
    .is("credit_link_id", null);

  if (pError) {
    return {
      assigned: 0,
      unassignedEmails: 0,
      remainingLinks: 0,
      error: pError.message,
    };
  }

  const { data: links, error: lError } = await supabase
    .from("credit_links")
    .select("id")
    .eq("is_assigned", false);

  if (lError) {
    return {
      assigned: 0,
      unassignedEmails: 0,
      remainingLinks: 0,
      error: lError.message,
    };
  }

  const unassignedParticipants = participants ?? [];
  const availableLinks = links ?? [];

  const pairs = buildAssignmentPairs(unassignedParticipants, availableLinks);

  if ("error" in pairs) {
    return {
      assigned: 0,
      unassignedEmails: unassignedParticipants.length,
      remainingLinks: availableLinks.length,
      error: pairs.error,
    };
  }

  const now = new Date().toISOString();
  let assigned = 0;

  for (const pair of pairs) {
    const { error: updateParticipantError } = await supabase
      .from("participants")
      .update({ credit_link_id: pair.creditLinkId, assigned_at: now })
      .eq("id", pair.participantId)
      .is("credit_link_id", null);

    if (updateParticipantError) {
      console.error("Assign participant error:", updateParticipantError);
      continue;
    }

    const { error: updateLinkError } = await supabase
      .from("credit_links")
      .update({ is_assigned: true })
      .eq("id", pair.creditLinkId)
      .eq("is_assigned", false);

    if (updateLinkError) {
      console.error("Mark link assigned error:", updateLinkError);
      continue;
    }

    assigned++;
  }

  const { count: unassignedCount } = await supabase
    .from("participants")
    .select("id", { count: "exact", head: true })
    .is("credit_link_id", null);

  const { count: remainingCount } = await supabase
    .from("credit_links")
    .select("id", { count: "exact", head: true })
    .eq("is_assigned", false);

  return {
    assigned,
    unassignedEmails: unassignedCount ?? 0,
    remainingLinks: remainingCount ?? 0,
  };
}

export type AdminStats = {
  totalLinks: number;
  assignedLinks: number;
  totalParticipants: number;
  assignedParticipants: number;
  redemptionCount: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  await requireAdmin();

  const supabase = createServiceClient();

  const [
    { count: totalLinks },
    { count: assignedLinks },
    { count: totalParticipants },
    { count: assignedParticipants },
    { count: redemptionCount },
  ] = await Promise.all([
    supabase.from("credit_links").select("id", { count: "exact", head: true }),
    supabase
      .from("credit_links")
      .select("id", { count: "exact", head: true })
      .eq("is_assigned", true),
    supabase.from("participants").select("id", { count: "exact", head: true }),
    supabase
      .from("participants")
      .select("id", { count: "exact", head: true })
      .not("credit_link_id", "is", null),
    supabase
      .from("redemption_logs")
      .select("id", { count: "exact", head: true }),
  ]);

  return {
    totalLinks: totalLinks ?? 0,
    assignedLinks: assignedLinks ?? 0,
    totalParticipants: totalParticipants ?? 0,
    assignedParticipants: assignedParticipants ?? 0,
    redemptionCount: redemptionCount ?? 0,
  };
}

export type RedemptionLogEntry = {
  id: string;
  email: string;
  link_url: string | null;
  created_at: string;
};

export async function getRecentRedemptions(): Promise<RedemptionLogEntry[]> {
  await requireAdmin();

  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("redemption_logs")
    .select("id, email, link_url, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Fetch redemptions error:", error);
    return [];
  }

  return data ?? [];
}
