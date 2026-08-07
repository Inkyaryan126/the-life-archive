import React from "react";
import Link from "next/link";

type KeepsakeErrorStateProps = {
  error: string;
};

export function KeepsakeErrorState({ error }: KeepsakeErrorStateProps) {
  let title = "Keepsake Not Linked Yet";
  let message = "This physical keepsake has not been connected to a message collection yet.";

  if (error === "KEEPSAKE_INACTIVE_OR_REVOKED") {
    title = "Keepsake Unavailable";
    message = "This physical keepsake is currently inactive or has been replaced.";
  } else if (error === "INVALID_KEEPSAKE_CODE") {
    title = "Unrecognized QR Code";
    message = "The scanned code is invalid or unrecognized.";
  }

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col items-center justify-center px-4 text-center text-[#fdfbf7]">
      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-[#c5a059]/30 bg-white/[0.04] text-3xl shadow-luxury backdrop-blur-md">
        🔒
      </div>

      <h1 className="mt-6 font-serif text-3xl font-normal text-[#fdfbf7]">
        {title}
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-[#fdfbf7]/70">
        {message}
      </p>

      <div className="mt-8 flex flex-col gap-3 w-full">
        <Link
          href="/"
          className="inline-flex min-h-12 w-full items-center justify-center rounded-full bg-[#c5a059] px-6 text-sm font-bold text-[#0a0806] shadow-luxury transition hover:bg-[#d4af37]"
        >
          Return Home
        </Link>
      </div>

      <footer className="mt-12 text-xs text-[#fdfbf7]/40">
        <p>The Life Archive &bull; Physical Keepsake Resolver</p>
      </footer>
    </div>
  );
}
