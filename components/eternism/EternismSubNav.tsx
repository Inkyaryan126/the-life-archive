"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/eternism", label: "Overview" },
  { href: "/eternism/observatory", label: "Observatory" },
  { href: "/eternism/manifesto", label: "Manifesto" },
  { href: "/eternism/faq", label: "FAQ" }
];

export function EternismSubNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Eternism Navigation"
      className="sticky top-0 z-30 mb-8 rounded-2xl border border-archive-gold/20 bg-archive-obsidian/90 p-2 backdrop-blur-md"
    >
      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
        {navItems.map((item) => {
          const isActive =
            item.href === "/eternism"
              ? pathname === "/eternism"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition focus:outline-none focus:ring-2 focus:ring-archive-gold/60 ${
                isActive
                  ? "border border-archive-gold/40 bg-archive-gold/18 text-archive-gold shadow-luxury"
                  : "text-archive-ivory/70 hover:bg-white/[0.05] hover:text-archive-ivory"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
