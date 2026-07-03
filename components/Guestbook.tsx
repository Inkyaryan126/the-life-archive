"use client";

import { useState } from "react";
import type { VisitorMessage } from "@/lib/types";
import { postVisitorMessageAction, deleteVisitorMessageAction } from "@/app/archive/[slug]/actions";

type GuestbookProps = {
  archiveSlug: string;
  initialMessages: VisitorMessage[];
  isOwner: boolean;
  archiveMode?: "memorial" | "living";
};

export function Guestbook({
  archiveSlug,
  initialMessages,
  isOwner,
  archiveMode = "memorial"
}: GuestbookProps) {
  const [messages, setMessages] = useState<VisitorMessage[]>(initialMessages);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setError("Please provide both your name and a tribute message.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    const formData = new FormData();
    formData.append("name", name);
    formData.append("message", message);

    const result = await postVisitorMessageAction(archiveSlug, formData);

    if (result.error) {
      setError(result.error);
    } else {
      setSuccess("Your tribute has been preserved in the guestbook.");
      const newMessage: VisitorMessage = {
        id: Math.random().toString(),
        archiveSlug,
        name,
        message,
        createdAt: new Date().toISOString()
      };
      setMessages([newMessage, ...messages]);
      setName("");
      setMessage("");
    }
    setLoading(false);
  };

  const handleDelete = async (messageId: string) => {
    if (!confirm("Are you sure you want to delete this tribute message?")) {
      return;
    }

    const result = await deleteVisitorMessageAction(archiveSlug, messageId);
    if (result.error) {
      alert(result.error);
    } else {
      setMessages(messages.filter((m) => m.id !== messageId));
    }
  };

  const isMemorialArchive = archiveMode === "memorial";

  return (
    <section className="mt-8 rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 shadow-luxury sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1.08fr)_400px]">
        {/* Message board */}
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-archive-gold">
            {isMemorialArchive ? "GUESTBOOK &amp; TRIBUTES" : "LIVING ARCHIVE"}
          </p>
          <h2 className="mt-2 font-serif text-3xl text-archive-ivory sm:text-4xl">
            {isMemorialArchive ? "Tributes of Remembrance" : "Continue Building This Archive"}
          </h2>
          <p className="mt-2 text-base leading-7 text-archive-ivory/62">
            {isMemorialArchive
              ? "Read messages left by friends, family, and future generations."
              : "This archive is being built while life is still being lived. Add memories, voice notes, lessons, songs, and instructions that can become a lasting legacy when the time comes."}
          </p>

          <div className="mt-8 grid max-h-[500px] gap-4 overflow-y-auto pr-2 scrollbar-thin">
            {isMemorialArchive && messages.length === 0 ? (
              <p className="text-base italic text-archive-ivory/40">
                No tributes have been recorded yet. Leave the first message to begin.
              </p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className="group relative rounded-2xl border border-white/5 bg-white/[0.015] p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <h4 className="font-serif text-lg font-semibold text-archive-champagne">
                      {m.name}
                    </h4>
                    <span className="text-sm text-archive-ivory/40">
                      {new Date(m.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </span>
                  </div>
                  <p className="mt-2 whitespace-pre-line text-base leading-7 text-archive-ivory/78">
                    {m.message}
                  </p>

                  {isOwner && (
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="mt-3 text-sm font-semibold uppercase tracking-[0.16em] text-archive-clay transition hover:text-white"
                    >
                      Delete Tribute
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Leave a tribute form */}
        <div className="flex flex-col justify-between rounded-2xl border border-archive-gold/14 bg-archive-obsidian/60 p-6">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
              <h3 className="font-serif text-2xl text-archive-gold">
                {isMemorialArchive ? "Leave a Tribute" : "Add to the Living Archive"}
              </h3>
              <p className="mt-1 text-sm leading-6 text-archive-ivory/55">
                {isMemorialArchive
                  ? "Share a story, lesson, or simple message of remembrance."
                  : "Add a memory, voice note, song, or practical instruction that can grow into a lasting legacy."}
              </p>
            </div>

            {error && (
              <p className="rounded-lg border border-archive-clay/20 bg-archive-clay/10 p-3 text-sm text-archive-clay">
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-lg border border-archive-gold/20 bg-archive-gold/10 p-3 text-sm text-archive-gold">
                {success}
              </p>
            )}

            <label className="grid gap-1.5">
              <span className="text-sm font-semibold uppercase tracking-[0.16em] text-archive-gold">
                {isMemorialArchive ? "Your Name / Relationship" : "Your Name / Relationship"}
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  isMemorialArchive
                    ? "Jane Doe (Grandchild, Sister, Lifelong Friend)"
                    : "Jane Doe (Self, Child, Partner, Friend)"
                }
                disabled={loading}
                className="rounded-lg border border-archive-gold/20 bg-white/[0.03] px-3.5 py-2.5 text-sm text-archive-ivory outline-none placeholder-archive-ivory/30 focus:border-archive-gold"
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-sm font-semibold uppercase tracking-[0.16em] text-archive-gold">
                {isMemorialArchive ? "Share a Tribute or Story" : "Share a Memory or Note"}
              </span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={
                  isMemorialArchive
                    ? "What story deserves to be remembered? Share a special moment, a piece of advice they gave you, or how they made you laugh..."
                    : "Share a story, lesson, voice note, or future instruction that belongs in this archive."
                }
                rows={5}
                disabled={loading}
                className="resize-none rounded-lg border border-archive-gold/20 bg-white/[0.03] px-3.5 py-2.5 text-sm leading-relaxed text-archive-ivory outline-none placeholder-archive-ivory/30 focus:border-archive-gold"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-lg bg-archive-gold py-2.5 text-sm font-bold text-archive-obsidian transition hover:bg-archive-champagne disabled:opacity-50"
            >
              {loading
                ? isMemorialArchive
                  ? "Preserving..."
                  : "Saving..."
                : isMemorialArchive
                  ? "Preserve Tribute"
                  : "Save to Archive"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
