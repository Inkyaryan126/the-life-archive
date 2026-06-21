import Image from "next/image";

type MemberCardProps = {
  hasArchive: boolean;
  memberSince: string;
  qrSrc: string;
};

export function MemberCard({
  hasArchive,
  memberSince,
  qrSrc
}: MemberCardProps) {
  return (
    <section
      className="member-card-print-area grid gap-6"
      aria-label="Printable Life Archive member card"
    >
      <article className="member-card-face member-card-front relative aspect-[1.588/1] overflow-hidden rounded-[1.35rem] border border-archive-gold/55 bg-archive-obsidian p-6 text-archive-ivory shadow-luxury sm:p-8">
        <div className="absolute inset-2 rounded-[1rem] border border-archive-gold/20" />
        <div className="absolute -right-16 -top-20 size-48 rounded-full border border-archive-gold/20" />
        <div className="absolute -bottom-24 -left-16 size-52 rounded-full border border-archive-gold/15" />

        <div className="relative flex h-full flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-8 bg-archive-gold" aria-hidden="true" />
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.27em] text-archive-gold sm:text-xs">
                The Life Archive
              </p>
            </div>
            <h2 className="mt-4 font-serif text-3xl leading-none sm:text-4xl">
              Official Member
            </h2>
            <p className="mt-2 font-serif text-sm italic text-archive-champagne sm:text-base">
              Every life. Preserved.
            </p>
          </div>

          <div className="flex items-end justify-between gap-4 border-t border-archive-gold/25 pt-3">
            <div>
              <p className="text-[0.58rem] uppercase tracking-[0.22em] text-archive-gold/80 sm:text-[0.65rem]">
                Member Since
              </p>
              <p className="mt-1 font-serif text-lg text-archive-ivory">
                {memberSince}
              </p>
            </div>
            <p className="max-w-[11rem] text-right font-serif text-[0.68rem] italic leading-4 text-archive-ivory/75 sm:text-xs">
              Life isn&apos;t lost. It&apos;s archived.
            </p>
          </div>
        </div>
      </article>

      <article className="member-card-face member-card-back relative aspect-[1.588/1] overflow-hidden rounded-[1.35rem] border border-archive-gold/60 bg-archive-ivory p-5 text-archive-obsidian shadow-luxury sm:p-6">
        <div className="absolute inset-2 rounded-[1rem] border border-archive-gold/35" />
        <div className="relative flex h-full flex-col">
          <div className="member-card-back-layout grid min-h-0 flex-1 grid-cols-[1fr_5.4rem] gap-4 sm:grid-cols-[1fr_6.2rem] sm:gap-5">
            <div>
              <h2 className="member-card-back-title font-serif text-lg font-bold tracking-wide text-archive-obsidian sm:text-xl">
                THIS CARD MATTERS
              </h2>
              <div className="member-card-back-rule mt-2 h-px w-12 bg-archive-gold" />
              <div className="member-card-back-copy mt-3 space-y-2 text-[0.57rem] leading-[1.35] text-archive-obsidian/75 sm:text-[0.65rem]">
                <p>
                  If you find this card, please know the person who carried it
                  is a member of The Life Archive.
                </p>
                <p>
                  In the event that they have passed away, this card may help
                  you learn more about their life, their story, and the memories
                  they left behind.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <p className="member-card-qr-label mb-2 text-center text-[0.48rem] font-bold uppercase leading-tight tracking-[0.12em] text-archive-obsidian/65 sm:text-[0.55rem]">
                {hasArchive ? (
                  <>
                    Scan to visit
                    <br />
                    their archive:
                  </>
                ) : (
                  <>Create your archive to activate this QR code.</>
                )}
              </p>
              <div className="rounded-lg border border-archive-gold/45 bg-white p-1.5 shadow-sm">
                <Image
                  src={qrSrc}
                  alt={
                    hasArchive
                      ? "QR code to visit the member's Life Archive"
                      : "QR code to create a Life Archive"
                  }
                  width={88}
                  height={88}
                  unoptimized
                  className="member-card-qr-image size-[4.6rem] sm:size-[5.25rem]"
                />
              </div>
            </div>
          </div>

          <p className="member-card-back-footer mt-2 border-t border-archive-gold/35 pt-2 text-center font-serif text-[0.58rem] italic tracking-wide text-archive-obsidian/70 sm:text-[0.65rem]">
            Every story deserves to live on.
          </p>
        </div>
      </article>
    </section>
  );
}
