"use client";

export default function GlobalErrorPage({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main className="flex min-h-screen items-center bg-[#171612] px-5 py-16 text-[#f7f0df]">
          <section className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[#c6a15b]">
              The Life Archive
            </p>
            <h1 className="mt-5 font-serif text-4xl leading-tight sm:text-6xl">
              We need a moment to gather the story.
            </h1>
            <p className="mx-auto mt-5 max-w-xl leading-8 text-[#f7f0df]/70">
              Please try once more. The memories and legacy you came to preserve
              still matter.
            </p>
            <button
              type="button"
              onClick={reset}
              className="mt-8 rounded-full bg-[#c6a15b] px-6 py-3 text-sm font-bold text-[#171612]"
            >
              Try Again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
