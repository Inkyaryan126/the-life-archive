import Image from "next/image";
import type { ReactNode } from "react";

const archiveLogo = "/images/site-design/tree-logo-master.png";

type ArrivalProps = {
  title: string;
  subtitle?: string;
};

type ArchiveRoomArrivalProps = ArrivalProps & {
  children: ReactNode;
};

function ArrivalLogo({ className }: { className: string }) {
  return (
    <div className={`relative mx-auto ${className}`}>
      <Image
        src={archiveLogo}
        alt=""
        fill
        priority
        sizes="176px"
        className="object-contain drop-shadow-[0_0_34px_rgba(202,164,92,0.26)]"
      />
    </div>
  );
}

export function ArchiveRoomArrival({
  title,
  subtitle,
  children
}: ArchiveRoomArrivalProps) {
  return (
    <>
      <div className="desktop-room-interface absolute inset-0">
        {children}
      </div>

      <div
        aria-hidden="true"
        className="desktop-room-intro pointer-events-none absolute inset-0 z-[200] hidden items-center justify-center bg-black px-10 text-center lg:flex"
      >
        <div className="max-w-3xl">
          <ArrivalLogo className="desktop-room-logo mb-5 h-24 w-36" />

          <h1 className="desktop-room-title font-serif text-[clamp(2.8rem,4.6vw,5.7rem)] uppercase leading-none tracking-[0.12em] text-archive-ivory">
            {title}
          </h1>

          {subtitle ? (
            <p className="desktop-room-subtitle mx-auto mt-5 max-w-2xl text-[clamp(0.85rem,1.05vw,1.12rem)] leading-7 tracking-[0.11em] text-archive-champagne">
              {subtitle}
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}

export function GrandHallArrival({
  title,
  subtitle
}: ArrivalProps) {
  return (
    <div
      aria-hidden="true"
      className="desktop-grandhall-intro pointer-events-none absolute inset-0 z-[250] hidden items-center justify-center bg-black px-10 text-center md:flex"
    >
      <div className="max-w-4xl">
        <ArrivalLogo className="desktop-grandhall-logo mb-7 h-32 w-48" />

        <h1 className="desktop-grandhall-title font-serif text-[clamp(3.4rem,5.5vw,6.8rem)] uppercase leading-none tracking-[0.13em] text-archive-ivory">
          {title}
        </h1>

        {subtitle ? (
          <p className="desktop-grandhall-subtitle mx-auto mt-7 max-w-2xl text-[clamp(0.92rem,1.2vw,1.25rem)] leading-8 tracking-[0.13em] text-archive-champagne">
            {subtitle}
          </p>
        ) : null}
      </div>
    </div>
  );
}
