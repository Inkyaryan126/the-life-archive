"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";
import { MEMBER_CARD_SPEC } from "@/lib/member-card-spec";

export type MemberCardFrontProps = {
  memberName: string;
  createdYear: number;
  className?: string;
};

export type MemberCardBackProps = {
  hasArchive: boolean;
  qrSrc: string;
  legacyActivationCode: string;
  className?: string;
};

export type MemberCardProps = {
  hasArchive: boolean;
  memberName: string;
  qrSrc: string;
  legacyActivationCode: string;
  createdYear: number;
  side?: "front" | "back" | "both";
  className?: string;
};

/**
 * Shared Canonical Member Card Front Renderer
 */
export function MemberCardFront({
  memberName,
  createdYear,
  className = ""
}: MemberCardFrontProps) {
  const nameBoxRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLSpanElement>(null);
  const [nameFontSize, setNameFontSize] = useState<number | null>(null);

  const yearBoxRef = useRef<HTMLDivElement>(null);
  const yearRef = useRef<HTMLSpanElement>(null);
  const [yearFontSize, setYearFontSize] = useState<number | null>(null);

  // Auto-fit Member Name within nameBox
  useLayoutEffect(() => {
    const nameBox = nameBoxRef.current;
    const name = nameRef.current;
    if (!nameBox || !name) return;

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
    const observer = new ResizeObserver(fitName);
    observer.observe(nameBox);
    return () => observer.disconnect();
  }, [memberName]);

  // Auto-fit Member Since Year within yearBox (constrained so it never dominates)
  useLayoutEffect(() => {
    const yearBox = yearBoxRef.current;
    const year = yearRef.current;
    if (!yearBox || !year) return;

    const fitYear = () => {
      const maxFontSize = Math.min(yearBox.clientHeight * 0.55, yearBox.clientWidth * 0.35);
      let low = 1;
      let high = maxFontSize;

      year.style.fontSize = `${high}px`;
      if (year.scrollWidth <= yearBox.clientWidth) {
        setYearFontSize(high);
        return;
      }

      while (high - low > 0.25) {
        const candidate = (low + high) / 2;
        year.style.fontSize = `${candidate}px`;
        if (year.scrollWidth <= yearBox.clientWidth) {
          low = candidate;
        } else {
          high = candidate;
        }
      }
      setYearFontSize(low);
    };

    fitYear();
    const observer = new ResizeObserver(fitYear);
    observer.observe(yearBox);
    return () => observer.disconnect();
  }, [createdYear]);

  return (
    <article
      className={`member-card-face member-card-front relative aspect-[1.58577/1] overflow-hidden rounded-[1.35rem] bg-archive-obsidian shadow-luxury ${className}`}
      data-card-side="front"
    >
      <Image
        src="/images/member-card/member-card-front.png"
        alt="The Life Archive Memory Card front, honoring every life as worthy of preservation"
        fill
        priority
        sizes="(min-width: 544px) 544px, 100vw"
        className="object-cover"
      />

      {/* Dynamic Name Cover Panel */}
      <div
        className="absolute bg-archive-obsidian"
        style={{
          left: MEMBER_CARD_SPEC.frontNameBox.left,
          top: MEMBER_CARD_SPEC.frontNameBox.top,
          width: MEMBER_CARD_SPEC.frontNameBox.width,
          height: MEMBER_CARD_SPEC.frontNameBox.height
        }}
      />

      {/* Dynamic Name Box */}
      <div
        ref={nameBoxRef}
        className="absolute flex items-center justify-center overflow-hidden px-[2.5%] text-center"
        style={{
          left: MEMBER_CARD_SPEC.frontNameBox.left,
          top: MEMBER_CARD_SPEC.frontNameBox.top,
          width: MEMBER_CARD_SPEC.frontNameBox.width,
          height: MEMBER_CARD_SPEC.frontNameBox.height
        }}
        aria-label={`Member name: ${memberName}`}
      >
        <span
          ref={nameRef}
          className="inline-block whitespace-nowrap font-serif uppercase leading-none tracking-[0.08em] text-[#d5a84e] [text-shadow:0_1px_0_#f4d58d,0_2px_3px_rgba(0,0,0,0.8)]"
          style={nameFontSize ? { fontSize: nameFontSize } : undefined}
        >
          {memberName}
        </span>
      </div>

      {/* Dynamic Member Since Cover Panel */}
      <div
        className="absolute bg-archive-obsidian"
        style={{
          left: MEMBER_CARD_SPEC.memberSinceBox.left,
          top: MEMBER_CARD_SPEC.memberSinceBox.top,
          width: MEMBER_CARD_SPEC.memberSinceBox.width,
          height: MEMBER_CARD_SPEC.memberSinceBox.height
        }}
      />

      {/* Dynamic Member Since Box */}
      <div
        ref={yearBoxRef}
        className="absolute flex items-center justify-center overflow-hidden text-center"
        style={{
          left: MEMBER_CARD_SPEC.memberSinceBox.left,
          top: MEMBER_CARD_SPEC.memberSinceBox.top,
          width: MEMBER_CARD_SPEC.memberSinceBox.width,
          height: MEMBER_CARD_SPEC.memberSinceBox.height
        }}
        aria-label={`Member since: ${createdYear}`}
      >
        <span
          ref={yearRef}
          className="inline-block whitespace-nowrap font-serif font-bold text-[clamp(0.4rem,2cqw,0.85rem)] tracking-widest text-[#d5a84e] [text-shadow:0_1px_0_#f4d58d,0_2px_3px_rgba(0,0,0,0.8)] leading-none"
          style={yearFontSize ? { fontSize: yearFontSize } : undefined}
        >
          {createdYear}
        </span>
      </div>
    </article>
  );
}

/**
 * Shared Canonical Member Card Back Renderer
 */
export function MemberCardBack({
  hasArchive,
  qrSrc,
  legacyActivationCode,
  className = ""
}: MemberCardBackProps) {
  const codeBoxRef = useRef<HTMLDivElement>(null);
  const codeRef = useRef<HTMLParagraphElement>(null);
  const [codeFontSize, setCodeFontSize] = useState<number | null>(null);

  // Auto-fit Legacy Activation Code within activationCodeBox (never clips or overflows)
  useLayoutEffect(() => {
    const codeBox = codeBoxRef.current;
    const code = codeRef.current;
    if (!codeBox || !code) return;

    const fitCode = () => {
      const maxFontSize = codeBox.clientHeight * 0.45;
      let low = 1;
      let high = maxFontSize;

      code.style.fontSize = `${high}px`;
      if (code.scrollWidth <= codeBox.clientWidth) {
        setCodeFontSize(high);
        return;
      }

      while (high - low > 0.25) {
        const candidate = (low + high) / 2;
        code.style.fontSize = `${candidate}px`;
        if (code.scrollWidth <= codeBox.clientWidth) {
          low = candidate;
        } else {
          high = candidate;
        }
      }
      setCodeFontSize(low);
    };

    fitCode();
    const observer = new ResizeObserver(fitCode);
    observer.observe(codeBox);
    return () => observer.disconnect();
  }, [legacyActivationCode]);

  return (
    <article
      className={`member-card-face member-card-back relative aspect-[1.58577/1] overflow-hidden rounded-[1.35rem] bg-archive-ivory shadow-luxury ${className}`}
      data-card-side="back"
    >
      <Image
        src="/images/member-card/member-card-back.png"
        alt="The Life Archive Memory Card back, explaining that the card can lead loved ones to the member's preserved story"
        fill
        sizes="(min-width: 544px) 544px, 100vw"
        className="object-cover"
      />

      {/* QR Code Container with Protective Padding */}
      <div
        className="absolute flex items-center justify-center p-[4%]"
        style={{
          left: MEMBER_CARD_SPEC.qrBox.left,
          top: MEMBER_CARD_SPEC.qrBox.top,
          width: MEMBER_CARD_SPEC.qrBox.width,
          height: MEMBER_CARD_SPEC.qrBox.height
        }}
      >
        <div
          className="relative h-full w-full"
          style={{ aspectRatio: "1 / 1" }}
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

      {/* Dynamic Legacy Activation Code Box */}
      <div
        ref={codeBoxRef}
        className="absolute flex items-center justify-center overflow-hidden px-[2%] text-center"
        style={{
          left: MEMBER_CARD_SPEC.activationCodeBox.left,
          top: MEMBER_CARD_SPEC.activationCodeBox.top,
          width: MEMBER_CARD_SPEC.activationCodeBox.width,
          height: MEMBER_CARD_SPEC.activationCodeBox.height
        }}
        aria-label={`Legacy Activation Code: ${legacyActivationCode}`}
      >
        <p
          ref={codeRef}
          className="font-mono whitespace-nowrap text-[clamp(0.35rem,1.8cqw,0.72rem)] font-bold uppercase tracking-[0.08em] text-[#d5a84e] leading-none"
          style={codeFontSize ? { fontSize: codeFontSize } : undefined}
        >
          {legacyActivationCode}
        </p>
      </div>
    </article>
  );
}

/**
 * Shared Canonical Member Card Composition Component
 */
export function MemberCard({
  hasArchive,
  memberName,
  qrSrc,
  legacyActivationCode,
  createdYear,
  side = "both",
  className = ""
}: MemberCardProps) {
  if (side === "front") {
    return (
      <MemberCardFront
        memberName={memberName}
        createdYear={createdYear}
        className={className}
      />
    );
  }

  if (side === "back") {
    return (
      <MemberCardBack
        hasArchive={hasArchive}
        qrSrc={qrSrc}
        legacyActivationCode={legacyActivationCode}
        className={className}
      />
    );
  }

  return (
    <section
      className={`member-card-print-area grid gap-6 ${className}`}
      aria-label="Printable The Life Archive Memory Card"
    >
      <MemberCardFront
        memberName={memberName}
        createdYear={createdYear}
      />
      <MemberCardBack
        hasArchive={hasArchive}
        qrSrc={qrSrc}
        legacyActivationCode={legacyActivationCode}
      />
    </section>
  );
}
