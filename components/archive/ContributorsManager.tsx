"use client";

import { useTransition, useState } from "react";

export type ContributorItem = {
  id: string;
  email: string;
  userId: string | null;
  role: string;
  status: "pending" | "accepted" | "declined" | "revoked" | "expired";
  createdAt: string;
  expiresAt: string;
  acceptedAt: string | null;
  declinedAt: string | null;
  revokedAt: string | null;
  displayName: string | null;
};

type ContributorsManagerProps = {
  archiveSlug: string;
  archiveName: string;
  contributors: ContributorItem[];
  sendAction: (formData: FormData) => Promise<{ success: boolean; message: string }>;
  resendAction: (invitationId: string) => Promise<{ success: boolean; message: string }>;
  revokeAction: (invitationId: string) => Promise<{ success: boolean; message: string }>;
};

export function ContributorsManager({
  archiveSlug,
  archiveName,
  contributors,
  sendAction,
  resendAction,
  revokeAction
}: ContributorsManagerProps) {
  const [isPending, startTransition] = useTransition();
  const [emailInput, setEmailInput] = useState("");
  const [feedback, setFeedback] = useState<{ success?: boolean; message?: string } | null>(null);

  const pendingList = contributors.filter((c) => c.status === "pending");
  const acceptedList = contributors.filter((c) => c.status === "accepted");

  const formatDate = (isoString: string) => {
    if (!isoString) return "";
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(new Date(isoString));
  };

  const handleSendInvite = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFeedback(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await sendAction(formData);
      setFeedback(res);
      if (res.success) {
        setEmailInput("");
      }
    });
  };

  const handleResend = (id: string) => {
    setFeedback(null);
    startTransition(async () => {
      const res = await resendAction(id);
      setFeedback(res);
    });
  };

  const handleRevoke = (id: string) => {
    if (!confirm("Are you sure you want to revoke access for this contributor? Previously added memories will remain, but they will not be able to add or edit memories.")) {
      return;
    }
    setFeedback(null);
    startTransition(async () => {
      const res = await revokeAction(id);
      setFeedback(res);
    });
  };

  return (
    <div className="mx-auto w-full max-w-4xl min-w-0 grid gap-8">
      {/* Header section */}
      <div className="rounded-2xl border border-archive-gold/20 bg-black/40 p-6 sm:p-8 backdrop-blur-md">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-archive-gold">
          Archive Management
        </p>
        <h1 className="mt-2 font-serif text-3xl sm:text-4xl text-archive-ivory leading-tight">
          Contributors
        </h1>
        <p className="mt-2 text-base text-archive-ivory/70 max-w-2xl leading-relaxed">
          Invite trusted people to help add memories to this archive.
        </p>
      </div>

      {/* Invite Form Section */}
      <div className="rounded-2xl border border-archive-gold/20 bg-white/[0.03] p-6 sm:p-8">
        <h2 className="font-serif text-xl text-archive-ivory">Invite a Contributor</h2>
        <p className="mt-1 text-sm text-archive-ivory/60">
          They will receive an email with a secure link to join &ldquo;{archiveName}&rdquo;.
        </p>

        {feedback ? (
          <div
            className={`mt-4 rounded-xl border px-4 py-3 text-sm font-semibold transition ${
              feedback.success
                ? "border-archive-gold/40 bg-archive-gold/14 text-archive-gold"
                : "border-red-400/30 bg-red-400/10 text-red-200"
            }`}
          >
            {feedback.message}
          </div>
        ) : null}

        <form onSubmit={handleSendInvite} className="mt-6 grid gap-4 sm:grid-cols-[1fr_auto]">
          <div>
            <label htmlFor="contributor-email" className="block text-xs font-semibold uppercase tracking-wider text-archive-gold mb-2">
              Contributor email
            </label>
            <input
              id="contributor-email"
              name="email"
              type="email"
              required
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="friend@example.com"
              className="w-full box-border rounded-xl border border-archive-gold/24 bg-archive-obsidian px-4 py-3 text-base text-archive-ivory outline-none placeholder:text-archive-ivory/40 focus:border-archive-gold focus:ring-2 focus:ring-archive-gold/30"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              disabled={isPending}
              className="w-full sm:w-auto h-12 rounded-full bg-archive-gold px-6 text-sm font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-archive-gold"
            >
              {isPending ? "Sending..." : "Send Invitation"}
            </button>
          </div>
        </form>
      </div>

      {/* Pending Invitations Section */}
      <div className="rounded-2xl border border-archive-gold/18 bg-white/[0.02] p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-archive-ivory">Pending Invitations</h2>
          <span className="rounded-full bg-archive-gold/10 border border-archive-gold/20 px-3 py-1 text-xs font-semibold text-archive-gold">
            {pendingList.length}
          </span>
        </div>

        {pendingList.length === 0 ? (
          <p className="mt-4 text-sm text-archive-ivory/50 italic">
            No pending invitations.
          </p>
        ) : (
          <div className="mt-4 grid gap-3">
            {pendingList.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-archive-gold/14 bg-black/20 p-4 transition hover:bg-black/35"
              >
                <div>
                  <p className="font-medium text-archive-ivory text-base">{item.email}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-archive-ivory/60">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-archive-gold">
                      <span className="h-2 w-2 rounded-full bg-archive-gold animate-pulse" />
                      Invitation pending
                    </span>
                    <span>Sent: {formatDate(item.createdAt)}</span>
                    <span>Expires: {formatDate(item.expiresAt)}</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => handleResend(item.id)}
                    disabled={isPending}
                    className="rounded-full border border-archive-gold/30 px-3 py-1.5 text-xs font-semibold text-archive-champagne transition hover:border-archive-gold hover:bg-white/5"
                  >
                    Resend
                  </button>
                  <button
                    onClick={() => handleRevoke(item.id)}
                    disabled={isPending}
                    className="rounded-full border border-red-400/30 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:border-red-400 hover:bg-red-400/10"
                  >
                    Revoke
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Accepted Contributors Section */}
      <div className="rounded-2xl border border-archive-gold/18 bg-white/[0.02] p-6 sm:p-8">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-xl text-archive-ivory">Accepted Contributors</h2>
          <span className="rounded-full bg-archive-gold/10 border border-archive-gold/20 px-3 py-1 text-xs font-semibold text-archive-gold">
            {acceptedList.length}
          </span>
        </div>

        {acceptedList.length === 0 ? (
          <p className="mt-4 text-sm text-archive-ivory/50 italic">
            No accepted contributors yet.
          </p>
        ) : (
          <div className="mt-4 grid gap-3">
            {acceptedList.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-archive-gold/14 bg-black/20 p-4 transition hover:bg-black/35"
              >
                <div>
                  <p className="font-medium text-archive-ivory text-base">
                    {item.displayName ? `${item.displayName} (${item.email})` : item.email}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-archive-ivory/60">
                    <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-400">
                      <span className="h-2 w-2 rounded-full bg-emerald-400" />
                      Contributor
                    </span>
                    {item.acceptedAt ? <span>Accepted: {formatDate(item.acceptedAt)}</span> : null}
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => handleRevoke(item.id)}
                    disabled={isPending}
                    className="rounded-full border border-red-400/30 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:border-red-400 hover:bg-red-400/10"
                  >
                    Revoke Access
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
