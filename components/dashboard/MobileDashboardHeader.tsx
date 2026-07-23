"use client";

import Link from "next/link";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { signOutAction } from "@/app/login/actions";
import {
  getNavGroupedItems,
  type ArchiveBuildingNavActive
} from "@/components/archive-building/navigation";

type MobileDashboardHeaderProps = {
  active?: ArchiveBuildingNavActive | string;
  archiveSlug?: string | null;
  signedIn?: boolean;
};

export function MobileDashboardHeader({
  active = "dashboard",
  archiveSlug,
  signedIn = true
}: MobileDashboardHeaderProps) {
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
    <header className="relative z-40 w-full max-w-full box-border lg:hidden">
      <nav
        aria-label="Mobile Archive Navigation"
        className="flex items-center justify-between rounded-2xl border border-[#c9a45c]/30 bg-[#0a0908]/85 px-3.5 py-2.5 shadow-[0_16px_50px_rgba(0,0,0,0.7)] backdrop-blur-xl box-border"
      >
        {/* Brand Logo & Title */}
        <Link
          href="/"
          className="flex items-center gap-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#c9a45c]/70 min-w-0"
          aria-label="Return to The Life Archive Grand Hall"
        >
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[#c9a45c]/40 bg-[#161310] p-1 shadow-md">
            <Image
              src="/images/site-design/book-logo.png"
              alt="The Life Archive"
              width={32}
              height={32}
              className="h-full w-full object-contain"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-serif text-sm font-medium leading-tight text-[#f7f1e5] tracking-wide truncate">
              The Life Archive
            </span>
          </div>
        </Link>

        {/* Action Buttons */}
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href="/"
            className="inline-flex min-h-[36px] items-center rounded-full border border-[#c9a45c]/40 bg-[#0a0908]/60 px-3.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#e8cf88] transition hover:border-[#c9a45c] hover:bg-[#c9a45c]/10 focus:outline-none focus:ring-2 focus:ring-[#c9a45c]/70"
          >
            Grand Hall
          </Link>

          <button
            ref={buttonRef}
            type="button"
            aria-expanded={isOpen}
            aria-controls="mobile-dashboard-menu-drawer"
            aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
            onClick={() => setIsOpen((prev) => !prev)}
            className="inline-flex min-h-[36px] items-center gap-1.5 rounded-full border border-[#c9a45c]/40 bg-[#0a0908]/60 px-3.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#e8cf88] transition hover:border-[#c9a45c] hover:bg-[#c9a45c]/10 focus:outline-none focus:ring-2 focus:ring-[#c9a45c]/70"
          >
            <span>{isOpen ? "Close" : "Menu"}</span>
            <span
              aria-hidden="true"
              className={`inline-block text-[0.6rem] transition-transform duration-200 ${
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
          className="fixed inset-0 z-40 bg-black/75 backdrop-blur-sm transition-opacity"
        />
      ) : null}

      {/* Drawer menu content */}
      <div
        id="mobile-dashboard-menu-drawer"
        ref={menuRef}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
        className={`fixed inset-x-3 top-[calc(env(safe-area-inset-top,0px)+4.2rem)] z-50 max-h-[80vh] overflow-y-auto rounded-3xl border border-[#c9a45c]/35 bg-[#0a0908]/98 p-5 text-[#f7f1e5] shadow-[0_28px_90px_rgba(0,0,0,0.95)] backdrop-blur-2xl transition-all duration-300 custom-scrollbar ${
          isOpen
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "-translate-y-4 opacity-0 pointer-events-none hidden"
        }`}
      >
        <div className="grid gap-5">
          {sections.map((section) => (
            <div key={section.category} className="grid gap-2">
              <p className="px-3 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-[#c9a45c]">
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
                          ? "bg-[#c9a45c]/16 text-[#e8cf88] shadow-[inset_0_0_0_1px_rgba(202,164,92,0.3)]"
                          : "text-[#f7f1e5]/85 hover:bg-white/[0.05] hover:text-[#e8cf88]"
                      }`}
                    >
                      <span>{item.label}</span>
                      <span
                        aria-hidden="true"
                        className={`h-1.5 w-1.5 rounded-full ${
                          isActive ? "bg-[#c9a45c]" : "bg-white/25"
                        }`}
                      />
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="border-t border-[#c9a45c]/20 pt-4">
            {signedIn ? (
              <form action={signOutAction}>
                <button
                  type="submit"
                  onClick={closeMenu}
                  className="flex min-h-[44px] w-full items-center justify-between rounded-xl border border-[#c9a45c]/25 bg-white/[0.03] px-4 text-left text-sm font-semibold text-[#f7f1e5]/85 transition hover:bg-white/[0.07] hover:text-[#e8cf88]"
                >
                  <span>Sign Out</span>
                  <span
                    aria-hidden="true"
                    className="h-1.5 w-1.5 rounded-full bg-white/25"
                  />
                </button>
              </form>
            ) : (
              <Link
                href="/login"
                onClick={closeMenu}
                className="flex min-h-[44px] w-full items-center justify-center rounded-xl bg-[#c9a45c] px-4 text-sm font-bold text-[#0a0908] shadow-sm transition hover:bg-[#e8cf88]"
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
