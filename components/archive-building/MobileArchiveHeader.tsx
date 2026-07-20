"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { signOutAction } from "@/app/login/actions";
import { SiteLogo } from "@/components/SiteDesign";
import {
  getNavGroupedItems,
  type ArchiveBuildingNavActive
} from "@/components/archive-building/navigation";

type MobileArchiveHeaderProps = {
  active?: ArchiveBuildingNavActive | string;
  archiveSlug?: string | null;
  signedIn?: boolean;
  className?: string;
};

export function MobileArchiveHeader({
  active,
  archiveSlug,
  signedIn = true,
  className = ""
}: MobileArchiveHeaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
    buttonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!isOpen) {
      document.body.style.overflow = "";
      return;
    }

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeMenu, isOpen]);

  const sections = getNavGroupedItems(archiveSlug, signedIn);

  return (
    <header className={`relative z-40 lg:hidden ${className}`}>
      <nav
        aria-label="Mobile Archive Navigation"
        className="flex items-center justify-between rounded-2xl border border-archive-gold/22 bg-[#090807]/92 px-4 py-3 shadow-[0_16px_50px_rgba(0,0,0,0.58)] backdrop-blur-xl"
      >
        <Link
          href="/"
          className="inline-flex rounded-xl focus:outline-none focus:ring-2 focus:ring-archive-gold/70"
          aria-label="Return to The Life Archive Grand Hall"
        >
          <SiteLogo width={180} height={44} />
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="inline-flex min-h-[38px] items-center rounded-full border border-archive-gold/30 bg-white/[0.04] px-3.5 text-xs font-semibold uppercase tracking-[0.14em] text-archive-champagne transition hover:border-archive-gold hover:text-archive-gold focus:outline-none focus:ring-2 focus:ring-archive-gold/70"
          >
            Grand Hall
          </Link>

          <button
            ref={buttonRef}
            type="button"
            aria-expanded={isOpen}
            aria-controls="mobile-archive-menu-drawer"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setIsOpen((prev) => !prev)}
            className="inline-flex min-h-[38px] items-center gap-2 rounded-full border border-archive-gold/35 bg-archive-gold/10 px-4 text-xs font-bold uppercase tracking-[0.16em] text-archive-gold transition hover:bg-archive-gold/20 focus:outline-none focus:ring-2 focus:ring-archive-gold/70"
          >
            <span>{isOpen ? "Close" : "Menu"}</span>
            <span
              aria-hidden="true"
              className={`inline-block text-[0.65rem] transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            >
              ▼
            </span>
          </button>
        </div>
      </nav>

      {/* Drawer backdrop */}
      {isOpen ? (
        <div
          aria-hidden="true"
          onClick={closeMenu}
          className="fixed inset-0 z-40 bg-black/72 backdrop-blur-sm transition-opacity"
        />
      ) : null}

      {/* Drawer menu content */}
      <div
        id="mobile-archive-menu-drawer"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
        className={`fixed inset-x-3 top-[calc(env(safe-area-inset-top)+4.2rem)] z-50 max-h-[82vh] overflow-y-auto rounded-3xl border border-archive-gold/28 bg-[#090807]/98 p-5 text-archive-ivory shadow-[0_28px_90px_rgba(0,0,0,0.92)] backdrop-blur-2xl transition-all duration-300 custom-scrollbar ${
          isOpen
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "-translate-y-4 opacity-0 pointer-events-none hidden"
        }`}
      >
        <div className="grid gap-6">
          {sections.map((section) => (
            <div key={section.category} className="grid gap-2">
              <p className="px-3 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-archive-gold">
                {section.category}
              </p>
              <div className="grid gap-1">
                {section.items.map((item) => {
                  const isActive = active === item.active;

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={closeMenu}
                      aria-current={isActive ? "page" : undefined}
                      className={`flex min-h-[44px] items-center justify-between rounded-xl px-4 text-sm font-semibold transition ${
                        isActive
                          ? "bg-archive-gold/16 text-archive-gold shadow-[inset_0_0_0_1px_rgba(202,164,92,0.3)]"
                          : "text-archive-ivory/84 hover:bg-white/[0.05] hover:text-archive-gold"
                      }`}
                    >
                      <span>{item.label}</span>
                      <span
                        aria-hidden="true"
                        className={`h-1.5 w-1.5 rounded-full ${
                          isActive ? "bg-archive-gold" : "bg-archive-ivory/24"
                        }`}
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="border-t border-archive-gold/16 pt-4">
            {signedIn ? (
              <form action={signOutAction}>
                <button
                  type="submit"
                  onClick={closeMenu}
                  className="flex min-h-[44px] w-full items-center justify-between rounded-xl border border-archive-gold/20 bg-white/[0.03] px-4 text-left text-sm font-semibold text-archive-ivory/84 transition hover:bg-white/[0.07] hover:text-archive-gold"
                >
                  <span>Sign Out</span>
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-archive-ivory/24"
                  />
                </button>
              </form>
            ) : (
              <Link
                href="/login"
                onClick={closeMenu}
                className="flex min-h-[44px] w-full items-center justify-center rounded-xl bg-archive-gold px-4 text-sm font-bold text-archive-obsidian shadow-sm transition hover:bg-archive-champagne"
              >
                Sign In to Archive
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
