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
const BACK_WIDTH = 1536;
const BACK_HEIGHT = 1024;

const QR_X = 989;
const QR_Y = 335;
const QR_WIDTH = 343;
const QR_HEIGHT = 334;

const CODE_X = 959;
const CODE_Y = 776;
const CODE_WIDTH = 403;
const CODE_HEIGHT = 68;

const asPercent = (value: number, total: number) => `${(value / total) * 100}%`;

type MemberCardProps = {
  hasArchive: boolean;
  memberName: string;
  qrSrc: string;
  accessCode: string;
  createdYear: number;
};

export function MemberCard({
  hasArchive,
  memberName,
  qrSrc,
  accessCode,
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
      aria-label="Printable Life Archive Storykeeper Card"
    >
      {/* FRONT OF THE CARD */}
      <article className="member-card-face member-card-front relative aspect-[1.591/1] overflow-hidden rounded-[1.35rem] bg-archive-obsidian shadow-luxury">
        <Image
          src="/images/member-card/member-card-front.png"
          alt="The Life Archive Storykeeper Card front, honoring every life as worthy of preservation"
          fill
          priority
          sizes="(min-width: 544px) 544px, 100vw"
          className="object-cover"
        />

        {/* Dynamic Name Cover Panel (Hides the green box) */}
        <div
          className="absolute bg-archive-obsidian"
          style={{
            left: asPercent(NAME_X, FRONT_WIDTH),
            top: asPercent(NAME_Y, FRONT_HEIGHT),
            width: asPercent(NAME_WIDTH, FRONT_WIDTH),
            height: asPercent(NAME_HEIGHT, FRONT_HEIGHT)
          }}
        />

        {/* Dynamic Name Box */}
        <div
          ref={nameBoxRef}
          className="absolute flex items-center justify-center overflow-hidden px-[2.5%] text-center"
          style={{
            left: asPercent(NAME_X, FRONT_WIDTH),
            top: asPercent(NAME_Y, FRONT_HEIGHT),
            width: asPercent(NAME_WIDTH, FRONT_WIDTH),
            height: asPercent(NAME_HEIGHT, FRONT_HEIGHT)
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

        {/* Dynamic Member Since Year Cover Panel (Hides the green box) */}
        <div
          className="absolute bg-archive-obsidian"
          style={{
            left: asPercent(YEAR_X, FRONT_WIDTH),
            top: asPercent(YEAR_Y, FRONT_HEIGHT),
            width: asPercent(YEAR_WIDTH, FRONT_WIDTH),
            height: asPercent(YEAR_HEIGHT, FRONT_HEIGHT)
          }}
        />

        {/* Dynamic Member Since Year Box */}
        <div
          className="absolute flex items-center justify-center text-center font-serif leading-none text-[#d5a84e]"
          style={{
            left: asPercent(YEAR_X, FRONT_WIDTH),
            top: asPercent(YEAR_Y, FRONT_HEIGHT),
            width: asPercent(YEAR_WIDTH, FRONT_WIDTH),
            height: asPercent(YEAR_HEIGHT, FRONT_HEIGHT)
          }}
          aria-label={`Member since: ${createdYear}`}
        >
          <span className="font-serif font-bold text-sm sm:text-base md:text-lg lg:text-xl tracking-widest text-[#d5a84e] [text-shadow:0_1px_0_#f4d58d,0_2px_3px_rgba(0,0,0,0.8)]">
            {createdYear}
          </span>
        </div>
      </article>

      {/* BACK OF THE CARD */}
      <article className="member-card-face member-card-back relative aspect-[1.5/1] overflow-hidden rounded-[1.35rem] bg-archive-ivory shadow-luxury">
        <Image
          src="/images/member-card/member-card-back.png"
          alt="The Life Archive Storykeeper Card back, explaining that the card can lead loved ones to the member's preserved story"
          fill
          sizes="(min-width: 544px) 544px, 100vw"
          className="object-cover"
        />

        {/* QR Code Cover Panel & Container (Hides the green box) */}
        <div
          className="absolute bg-white rounded-lg flex items-center justify-center p-[1%]"
          style={{
            left: asPercent(QR_X, BACK_WIDTH),
            top: asPercent(QR_Y, BACK_HEIGHT),
            width: asPercent(QR_WIDTH, BACK_WIDTH),
            height: asPercent(QR_HEIGHT, BACK_HEIGHT)
          }}
        >
          <div className="relative w-full h-full">
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

        {/* Access Code Cover Panel (Hides the green box) */}
        <div
          className="absolute bg-archive-obsidian"
          style={{
            left: asPercent(CODE_X, BACK_WIDTH),
            top: asPercent(CODE_Y, BACK_HEIGHT),
            width: asPercent(CODE_WIDTH, BACK_WIDTH),
            height: asPercent(CODE_HEIGHT, BACK_HEIGHT)
          }}
        />

        {/* Access Code Box */}
        <div
          className="absolute flex items-center justify-center text-center"
          style={{
            left: asPercent(CODE_X, BACK_WIDTH),
            top: asPercent(CODE_Y, BACK_HEIGHT),
            width: asPercent(CODE_WIDTH, BACK_WIDTH),
            height: asPercent(CODE_HEIGHT, BACK_HEIGHT)
          }}
          aria-label={`Archive Access Code: ${accessCode}`}
        >
          <span className="font-mono font-bold tracking-[0.2em] text-[#d5a84e] text-xs sm:text-sm md:text-base leading-none">
            {accessCode}
          </span>
        </div>
      </article>
    </section>
  );
}
