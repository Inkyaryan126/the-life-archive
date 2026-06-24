"use client";

import { useState } from "react";
import type { VisitorMessage } from "@/lib/types";
import { postVisitorMessageAction, deleteVisitorMessageAction } from "@/app/archive/[slug]/actions";

type GuestbookProps = {
  archiveSlug: string;
  initialMessages: VisitorMessage[];
  isOwner: boolean;
};

export function Guestbook({ archiveSlug, initialMessages, isOwner }: GuestbookProps) {
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

  return (
    <section className="mt-8 rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 shadow-luxury sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        {/* Message board */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
            GUESTBOOK &amp; TRIBUTES
          </p>
          <h2 className="mt-2 font-serif text-3xl text-archive-ivory sm:text-4xl">
            Tributes of Remembrance
          </h2>
          <p className="mt-2 text-sm text-archive-ivory/60">
            Read messages left by friends, family, and future generations.
          </p>

          <div className="mt-8 grid gap-4 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin">
            {messages.length === 0 ? (
              <p className="text-sm italic text-archive-ivory/40">
                No tributes have been recorded yet. Leave the first message to begin.
              </p>
            ) : (
              messages.map((m) => (
                <div
                  key={m.id}
                  className="rounded-2xl border border-white/5 bg-white/[0.015] p-5 relative group"
                >
                  <div className="flex justify-between items-start gap-4">
                    <h4 className="font-serif text-base text-archive-champagne font-semibold">
                      {m.name}
                    </h4>
                    <span className="text-[10px] text-archive-ivory/40">
                      {new Date(m.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-archive-ivory/80 whitespace-pre-line">
                    {m.message}
                  </p>

                  {isOwner && (
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="mt-3 text-[10px] uppercase tracking-wider font-semibold text-archive-clay hover:text-white transition"
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
        <div className="rounded-2xl border border-archive-gold/14 bg-archive-obsidian/60 p-6 flex flex-col justify-between">
          <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
              <h3 className="font-serif text-xl text-archive-gold">Leave a Tribute</h3>
              <p className="text-xs leading-5 text-archive-ivory/50 mt-1">
                Share a story, dynamic lesson, or simple message of remembrance.
              </p>
            </div>

            {error && (
              <p className="rounded-lg border border-archive-clay/20 bg-archive-clay/10 p-3 text-xs text-archive-clay">
                {error}
              </p>
            )}

            {success && (
              <p className="rounded-lg border border-archive-gold/20 bg-archive-gold/10 p-3 text-xs text-archive-gold">
                {success}
              </p>
            )}

            <label className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-archive-gold">
                Your Name / Relationship
              </span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Jane Doe (Grandchild, Sister, Lifelong Friend)"
                disabled={loading}
                className="rounded-lg border border-archive-gold/20 bg-white/[0.03] px-3.5 py-2 text-xs text-archive-ivory outline-none placeholder-archive-ivory/30 focus:border-archive-gold"
              />
            </label>

            <label className="grid gap-1.5">
              <span className="text-xs font-semibold uppercase tracking-wider text-archive-gold">
                Share a Tribute or Story
              </span>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="What story deserves to be remembered? Share a special moment, a piece of advice they gave you, or how they made you laugh..."
                rows={5}
                disabled={loading}
                className="rounded-lg border border-archive-gold/20 bg-white/[0.03] px-3.5 py-2.5 text-xs text-archive-ivory outline-none placeholder-archive-ivory/30 focus:border-archive-gold resize-none leading-relaxed"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-archive-gold py-2.5 text-xs font-bold text-archive-obsidian transition hover:bg-archive-champagne disabled:opacity-50 mt-2"
            >
              {loading ? "Preserving..." : "Preserve Tribute"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
