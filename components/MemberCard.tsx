"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";

// Front Template Dimensions
const FRONT_WIDTH = 1582;
const FRONT_HEIGHT = 994;

const NAME_X = 634;
const NAME_Y = 396;
const NAME_WIDTH = 854;
const NAME_HEIGHT = 179;

const YEAR_X = 732;
const YEAR_Y = 769;
const YEAR_WIDTH = 262;
const YEAR_HEIGHT = 101;

// Back Template Dimensions
const BACK_WIDTH = 1578;
const BACK_HEIGHT = 997;

const QR_X = 936;
const QR_Y = 293;
const QR_WIDTH = 439;
const QR_HEIGHT = 364;

const CODE_X = 907;
const CODE_Y = 770;
const CODE_WIDTH = 486;
const CODE_HEIGHT = 97;

const asPercent = (value: number, total: number) => `${(value / total) * 100}%`;

type MemberCardProps = {
  hasArchive: boolean;
  memberName: string;
  qrSrc: string;
  legacyActivationCode: string;
  createdYear: number;
};

export function MemberCard({
  hasArchive,
  memberName,
  qrSrc,
  legacyActivationCode,
  createdYear
}: MemberCardProps) {
  const nameBoxRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const [nameFontSize, setNameFontSize] = useState(16);

  useLayoutEffect(() => {
    const nameBox = nameBoxRef.current;
    const name = nameRef.current;

    if (!nameBox || !name) {
      return;
    }

    const fitName = () => {
      const maxFontSize = nameBox.clientHeight * 0.45;
      let low = 1;
      let high = maxFontSize;

      name.style.fontSize = `${high}px`;

      if (name.scrollWidth <= nameBox.clientWidth) {
        setNameFontSize(high);
        return;
      }

      while (high - low > 0.25) {
        const candidate = (low + high) / 2;
        name.style.fontSize = `${candidate}px`;

        if (name.scrollWidth <= nameBox.clientWidth) {
          low = candidate;
        } else {
          high = candidate;
        }
      }

      setNameFontSize(low);
    };

    fitName();

    const resizeObserver = new ResizeObserver(fitName);
    resizeObserver.observe(nameBox);

    return () => resizeObserver.disconnect();
  }, [memberName]);

  return (
    <section
      className="member-card-print-area grid gap-6"
      aria-label="Printable The Life Archive Memory Card"
    >
      {/* FRONT OF THE CARD */}
      <article className="member-card-face member-card-front relative aspect-[1.591/1] overflow-hidden rounded-[1.35rem] bg-archive-obsidian shadow-luxury">
        <Image
          src="/images/member-card/member-card-front.png"
          alt="The Life Archive Memory Card front, honoring every life as worthy of preservation"
          fill
          priority
          sizes="(min-width: 544px) 544px, 100vw"
          className="object-cover"
        />

        {/* Dynamic Name Cover Panel (Hides the green box - Inflated 4px to cover subpixels) */}
        <div
          className="absolute bg-archive-obsidian"
          style={{
            left: asPercent(NAME_X - 4, FRONT_WIDTH),
            top: asPercent(NAME_Y - 4, FRONT_HEIGHT),
            width: asPercent(NAME_WIDTH + 8, FRONT_WIDTH),
            height: asPercent(NAME_HEIGHT + 8, FRONT_HEIGHT)
          }}
        />

        {/* Dynamic Name Box */}
        <div
          ref={nameBoxRef}
          className="absolute flex items-center justify-center overflow-hidden px-[2.5%] text-center"
          style={{
            left: asPercent(NAME_X - 4, FRONT_WIDTH),
            top: asPercent(NAME_Y - 4, FRONT_HEIGHT),
            width: asPercent(NAME_WIDTH + 8, FRONT_WIDTH),
            height: asPercent(NAME_HEIGHT + 8, FRONT_HEIGHT)
          }}
          aria-label={`Member name: ${memberName}`}
        >
          <span
            ref={nameRef}
            className="inline-block whitespace-nowrap font-serif uppercase leading-none tracking-[0.08em] text-[#d5a84e] [text-shadow:0_1px_0_#f4d58d,0_2px_3px_rgba(0,0,0,0.8)]"
            style={{ fontSize: nameFontSize }}
          >
            {memberName}
          </span>
        </div>

        {/* Dynamic Member Since Year Cover Panel (Hides the green box - Inflated 4px to cover subpixels) */}
        <div
          className="absolute bg-archive-obsidian"
          style={{
            left: asPercent(YEAR_X - 4, FRONT_WIDTH),
            top: asPercent(YEAR_Y - 4, FRONT_HEIGHT),
            width: asPercent(YEAR_WIDTH + 8, FRONT_WIDTH),
            height: asPercent(YEAR_HEIGHT + 8, FRONT_HEIGHT)
          }}
        />

        {/* Dynamic Member Since Year Box */}
        <div
          className="absolute flex items-center justify-center text-center font-serif leading-none text-[#d5a84e]"
          style={{
            left: asPercent(YEAR_X - 4, FRONT_WIDTH),
            top: asPercent(YEAR_Y - 4, FRONT_HEIGHT),
            width: asPercent(YEAR_WIDTH + 8, FRONT_WIDTH),
            height: asPercent(YEAR_HEIGHT + 8, FRONT_HEIGHT)
          }}
          aria-label={`Member since: ${createdYear}`}
        >
          <span className="font-serif font-bold text-sm sm:text-base md:text-lg lg:text-xl tracking-widest text-[#d5a84e] [text-shadow:0_1px_0_#f4d58d,0_2px_3px_rgba(0,0,0,0.8)]">
            {createdYear}
          </span>
        </div>
      </article>

      {/* BACK OF THE CARD */}
      <article
        className="member-card-face member-card-back relative overflow-hidden rounded-[1.35rem] bg-archive-ivory shadow-luxury"
        style={{ aspectRatio: "1578 / 997" }}
      >
        <Image
          src="/images/member-card/member-card-back.png"
          alt="The Life Archive Memory Card back, explaining that the card can lead loved ones to the member's preserved story"
          fill
          sizes="(min-width: 544px) 544px, 100vw"
          className="object-cover"
        />

        <div
          className="absolute flex items-center justify-center"
          style={{
            left: asPercent(QR_X, BACK_WIDTH),
            top: asPercent(QR_Y, BACK_HEIGHT),
            width: asPercent(QR_WIDTH, BACK_WIDTH),
            height: asPercent(QR_HEIGHT, BACK_HEIGHT)
          }}
        >
          <div
            className="relative"
            style={{ height: "88%", aspectRatio: "1 / 1" }}
          >
            <Image
              src={qrSrc}
              alt={
                hasArchive
                  ? "QR code to visit the member's Life Archive"
                  : "QR code to create a Life Archive"
              }
              fill
              unoptimized
              className="member-card-qr-image object-contain"
            />
          </div>
        </div>

        <div
          className="absolute flex items-center justify-center text-center"
          style={{
            left: asPercent(CODE_X, BACK_WIDTH),
            top: asPercent(CODE_Y, BACK_HEIGHT),
            width: asPercent(CODE_WIDTH, BACK_WIDTH),
            height: asPercent(CODE_HEIGHT, BACK_HEIGHT)
          }}
          aria-label={`Legacy Activation Code: ${legacyActivationCode}`}
        >
          <p className="font-mono whitespace-nowrap text-[0.5rem] font-bold uppercase tracking-[0.12em] text-[#d5a84e] sm:text-[0.65rem] md:text-[0.78rem] lg:text-[0.92rem] leading-none">
            {legacyActivationCode}
          </p>
        </div>
      </article>
    </section>
  );
}
