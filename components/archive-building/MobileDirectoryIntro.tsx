"use client";

import Image from "next/image";

export function MobileDirectoryIntro() {
  return (
    <div
      tabIndex={0}
      role="button"
      aria-label="Tap to skip intro animation"
      onClick={(e) => {
        (e.currentTarget as HTMLElement).style.display = "none";
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          (e.currentTarget as HTMLElement).style.display = "none";
        }
      }}
      className="mobile-directory-intro cursor-pointer absolute inset-0 z-30 flex items-start justify-center bg-black pt-[12svh]"
    >
      <div className="px-8 text-center">
        <div className="mobile-directory-crest relative mx-auto mb-5 h-24 w-32">
          <Image
            src="/images/site-design/tree-logo-master.png"
            alt="The Life Archive tree growing from an open book"
            fill
            priority
            sizes="128px"
            className="object-contain drop-shadow-[0_0_28px_rgba(202,164,92,0.28)]"
          />
        </div>

        <h1 className="mobile-directory-title font-serif text-[clamp(1.9rem,9vw,3rem)] uppercase tracking-[0.09em] text-archive-ivory">
          The Life Archive
        </h1>

        <p className="mobile-directory-subtitle mx-auto mt-5 max-w-[18rem] text-xs uppercase leading-6 tracking-[0.18em] text-archive-gold/90">
          Every life has a story worth preserving
        </p>
      </div>
    </div>
  );
}
