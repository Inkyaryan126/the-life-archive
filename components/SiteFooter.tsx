import Link from "next/link";
import { HeartbeatLogoDivider, SiteLogo } from "@/components/SiteDesign";
import { getNavGroupedItems } from "@/components/archive-building/navigation";
import { publicSupportEmail } from "@/lib/site-config";

type SiteFooterProps = {
  archiveSlug?: string | null;
  signedIn?: boolean;
  className?: string;
};

export function SiteFooter({
  archiveSlug,
  signedIn = false,
  className = ""
}: SiteFooterProps) {
  const sections = getNavGroupedItems(archiveSlug, signedIn);

  return (
    <footer className={`border-t border-archive-gold/15 bg-[#080706] px-4 py-14 text-archive-ivory sm:px-6 lg:px-10 lg:py-20 ${className}`}>
      <div className="mx-auto w-full max-w-[1280px]">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_2fr] lg:gap-16">
          <div>
            <Link
              href="/"
              className="inline-flex rounded-xl focus:outline-none focus:ring-2 focus:ring-archive-gold/70"
              aria-label="The Life Archive Home"
            >
              <SiteLogo width={240} height={58} />
            </Link>

            <p className="mt-5 max-w-md font-serif text-lg italic leading-relaxed text-archive-champagne/90">
              “Preserve the life. Extend the life. The Life Archive preserves who we are while humanity works toward preserving that we are.”
            </p>

            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold/75">
              Sanctuary for Memory, Identity &amp; Human Continuity
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {sections.map((section) => (
              <div key={section.category}>
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-archive-gold">
                  {section.category}
                </p>
                <ul className="mt-4 grid gap-2.5 text-sm text-archive-ivory/72">
                  {section.items.map((item) => (
                    <li key={item.label}>
                      <Link
                        href={item.href}
                        className="transition hover:text-archive-gold focus:outline-none focus:ring-2 focus:ring-archive-gold/50"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <HeartbeatLogoDivider className="my-10" />

        <div className="flex flex-col gap-6 pt-2 text-xs text-archive-ivory/54 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 The Life Archive. All rights reserved.</p>

          <nav aria-label="Legal & Support" className="flex flex-wrap gap-x-6 gap-y-2 font-semibold">
            <Link href="/privacy" className="hover:text-archive-gold focus:outline-none focus:ring-2 focus:ring-archive-gold/50">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-archive-gold focus:outline-none focus:ring-2 focus:ring-archive-gold/50">
              Terms of Service
            </Link>
            <Link href="/faq" className="hover:text-archive-gold focus:outline-none focus:ring-2 focus:ring-archive-gold/50">
              FAQ
            </Link>
            <a
              href={`mailto:${publicSupportEmail}`}
              className="hover:text-archive-gold focus:outline-none focus:ring-2 focus:ring-archive-gold/50"
            >
              Contact Support
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
