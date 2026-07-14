"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";

type DeleteMemoryActionProps = {
  action: (formData: FormData) => void | Promise<void>;
  archiveSlug: string;
  memoryId: string;
};

function DeleteSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-red-950/80 px-5 py-3 text-sm font-semibold text-red-50 transition hover:bg-red-900 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Deleting..." : "Delete permanently"}
    </button>
  );
}

export function DeleteMemoryAction({
  action,
  archiveSlug,
  memoryId
}: DeleteMemoryActionProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="rounded-[2rem] border border-red-900/30 bg-red-950/10 p-5">
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-full border border-red-900/45 px-4 py-2 text-sm font-semibold text-red-100 transition hover:border-red-600 hover:bg-red-950/30"
      >
        Delete memory
      </button>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-archive-obsidian/80 px-5 py-8 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-memory-heading"
        >
          <div className="w-full max-w-md rounded-[2rem] border border-archive-gold/20 bg-archive-obsidian p-6 shadow-luxury">
            <h2
              id="delete-memory-heading"
              className="font-serif text-3xl text-archive-ivory"
            >
              Delete this memory?
            </h2>
            <p className="mt-4 leading-7 text-archive-ivory/72">
              This permanently removes the memory and any uploaded media
              attached to it. This cannot be undone.
            </p>

            <form action={action} className="mt-6 flex flex-wrap gap-3">
              <input type="hidden" name="archiveSlug" value={archiveSlug} />
              <input type="hidden" name="memoryId" value={memoryId} />
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-archive-gold/25 px-5 py-3 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/10"
              >
                Cancel
              </button>
              <DeleteSubmitButton />
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
