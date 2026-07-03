"use client";

import { useState, useTransition } from "react";
import {
  uploadCreditLinks,
  uploadParticipants,
  assignCredits,
  logoutAdmin,
  type UploadResult,
  type AssignResult,
} from "@/app/actions/admin";
import type { AdminStats, RedemptionLogEntry } from "@/app/actions/admin";

type AdminDashboardProps = {
  stats: AdminStats;
  redemptions: RedemptionLogEntry[];
};

export function AdminDashboard({ stats, redemptions }: AdminDashboardProps) {
  const [creditResult, setCreditResult] = useState<UploadResult | null>(null);
  const [participantResult, setParticipantResult] = useState<UploadResult | null>(
    null,
  );
  const [assignResult, setAssignResult] = useState<AssignResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleCreditUpload(formData: FormData) {
    startTransition(async () => {
      const result = await uploadCreditLinks(formData);
      setCreditResult(result);
    });
  }

  function handleParticipantUpload(formData: FormData) {
    startTransition(async () => {
      const result = await uploadParticipants(formData);
      setParticipantResult(result);
    });
  }

  function handleAssign() {
    startTransition(async () => {
      const result = await assignCredits();
      setAssignResult(result);
    });
  }

  return (
    <main className="flex-1 px-6 py-12">
      <div className="mx-auto max-w-3xl space-y-10">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-medium tracking-tight">Admin</h1>
            <p className="mt-1 text-sm text-muted">
              Upload lists, assign credits, view redemptions
            </p>
          </div>
          <form action={logoutAdmin}>
            <button
              type="submit"
              className="rounded-md border border-border px-3 py-1.5 text-sm transition-colors hover:bg-border/50"
            >
              Log out
            </button>
          </form>
        </header>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <StatCard label="Links" value={stats.totalLinks} />
          <StatCard label="Assigned links" value={stats.assignedLinks} />
          <StatCard label="Participants" value={stats.totalParticipants} />
          <StatCard
            label="Assigned participants"
            value={stats.assignedParticipants}
          />
          <StatCard label="Redemptions" value={stats.redemptionCount} />
        </section>

        <section className="grid gap-6 sm:grid-cols-2">
          <UploadCard
            title="Credit links CSV"
            name="file"
            action={handleCreditUpload}
            pending={isPending}
            result={creditResult}
          />
          <UploadCard
            title="Participants CSV"
            name="file"
            action={handleParticipantUpload}
            pending={isPending}
            result={participantResult}
          />
        </section>

        <section className="rounded-md border border-border bg-card p-6">
          <h2 className="text-sm font-medium">Assign credits</h2>
          <p className="mt-1 text-sm text-muted">
            Randomly pair unassigned emails with available links (no repeats).
          </p>
          <button
            type="button"
            onClick={handleAssign}
            disabled={isPending}
            className="mt-4 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-accent-hover disabled:opacity-50"
          >
            {isPending ? "Assigning..." : "Run assignment"}
          </button>
          {assignResult && (
            <div className="mt-4 text-sm space-y-1">
              {assignResult.error ? (
                <p className="text-error">{assignResult.error}</p>
              ) : (
                <>
                  <p className="text-success">
                    Assigned {assignResult.assigned} pair
                    {assignResult.assigned === 1 ? "" : "s"}
                  </p>
                  <p className="text-muted">
                    {assignResult.unassignedEmails} emails waiting,{" "}
                    {assignResult.remainingLinks} links remaining
                  </p>
                </>
              )}
            </div>
          )}
        </section>

        <section className="rounded-md border border-border bg-card p-6">
          <h2 className="text-sm font-medium mb-4">Recent redemptions</h2>
          {redemptions.length === 0 ? (
            <p className="text-sm text-muted">No redemptions yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted">
                    <th className="pb-2 pr-4 font-normal">Email</th>
                    <th className="pb-2 pr-4 font-normal">Link</th>
                    <th className="pb-2 font-normal">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {redemptions.map((entry) => (
                    <tr key={entry.id} className="border-b border-border/50">
                      <td className="py-2 pr-4">{entry.email}</td>
                      <td className="py-2 pr-4 font-mono text-xs truncate max-w-[200px]">
                        {entry.link_url ?? "—"}
                      </td>
                      <td className="py-2 text-muted whitespace-nowrap">
                        {new Date(entry.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-2xl font-medium">{value}</p>
    </div>
  );
}

function UploadCard({
  title,
  name,
  action,
  pending,
  result,
}: {
  title: string;
  name: string;
  action: (formData: FormData) => void;
  pending: boolean;
  result: UploadResult | null;
}) {
  return (
    <div className="rounded-md border border-border bg-card p-6">
      <h2 className="text-sm font-medium">{title}</h2>
      <form
        action={action}
        className="mt-4 space-y-3"
        encType="multipart/form-data"
      >
        <input
          type="file"
          name={name}
          accept=".csv,text/csv"
          required
          className="block w-full text-sm text-muted file:mr-4 file:rounded-md file:border-0 file:bg-accent file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-white hover:file:bg-accent-hover"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-md border border-border px-4 py-2 text-sm transition-colors hover:bg-border/50 disabled:opacity-50"
        >
          {pending ? "Uploading..." : "Upload"}
        </button>
      </form>
      {result && (
        <div className="mt-3 text-sm space-y-1">
          {result.error ? (
            <p className="text-error">{result.error}</p>
          ) : (
            <>
              <p className="text-success">{result.added} added</p>
              {result.skipped > 0 && (
                <p className="text-muted">{result.skipped} duplicates skipped</p>
              )}
              {result.invalid > 0 && (
                <p className="text-muted">{result.invalid} invalid rows</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
