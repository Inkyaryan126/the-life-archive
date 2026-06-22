"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";

const TEMPLATE_WIDTH = 1577;
const TEMPLATE_HEIGHT = 997;

export const NAME_X = 638;
export const NAME_Y = 421;
export const NAME_WIDTH = 820;
export const NAME_HEIGHT = 122;

const asPercent = (value: number, total: number) => `${(value / total) * 100}%`;

type MemberCardProps = {
  hasArchive: boolean;
  memberName: string;
  qrSrc: string;
};

export function MemberCard({
  hasArchive,
  memberName,
  qrSrc
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
      const maxFontSize = nameBox.clientHeight * 0.5;
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
      aria-label="Printable Life Archive member card"
    >
      <article className="member-card-face member-card-front relative aspect-[1.588/1] overflow-hidden rounded-[1.35rem] bg-archive-obsidian shadow-luxury">
        <Image
          src="/images/member-card/member-card-front.png"
          alt="The Life Archive Member Card front, honoring every life as worthy of preservation"
          fill
          priority
          sizes="(min-width: 544px) 544px, 100vw"
          className="object-cover"
        />
        <div
          ref={nameBoxRef}
          className="absolute flex items-center justify-center overflow-hidden px-[2.5%] text-center"
          style={{
            left: asPercent(NAME_X, TEMPLATE_WIDTH),
            top: asPercent(NAME_Y, TEMPLATE_HEIGHT),
            width: asPercent(NAME_WIDTH, TEMPLATE_WIDTH),
            height: asPercent(NAME_HEIGHT, TEMPLATE_HEIGHT)
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
      </article>

      <article className="member-card-face member-card-back relative aspect-[1.588/1] overflow-hidden rounded-[1.35rem] bg-archive-ivory shadow-luxury">
        <Image
          src="/images/member-card/member-card-back.png"
          alt="The Life Archive Member Card back, explaining that the card can lead loved ones to the member's preserved story"
          fill
          sizes="(min-width: 544px) 544px, 100vw"
          className="object-cover"
        />
        <div className="member-card-qr-overlay absolute left-[64.25%] top-[37.1%] aspect-square w-[19%] overflow-hidden bg-white p-1">
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
      </article>
    </section>
  );
}
