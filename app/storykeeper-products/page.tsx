import Link from "next/link";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { getAccountContext } from "@/lib/account";

export const dynamic = "force-dynamic";

const futureProducts = [
  {
    title: "The Storykeeper Card",
    badge: "Coming Soon",
    tagline: "The physical key to a digital sanctuary.",
    description: "A precision-crafted, heavy matte-finish wallet card etched with your secure, unique legacy QR code. Built to carry close, keep safe, and pass down through generations.",
    scenarios: ["Fits in wallets & purses", "Highly durable waterproof cardstock", "Hand-finished gold detailing"],
    alternate: false
  },
  {
    title: "Memorial Cards (Bulk Sets)",
    badge: "Future Offering",
    tagline: "Share their presence at their final gathering.",
    description: "Printed keepsake card packs designed to hand out to relatives, friends, and memorial attendees. Features their portrait, custom monogram, and a direct scan path to listen to voice recordings.",
    scenarios: ["Perfect for celebrations of life", "Sets of 50, 100, or 250", "Elegant ivory parchment textures"],
    alternate: true
  },
  {
    title: "The QR Keychain",
    badge: "Interest List",
    tagline: "Keep the story within arm's reach.",
    description: "A beautifully hand-stitched leather or brushed-metal keychain charm embedded with your secure archive QR. A modern digital talisman designed for everyday travel.",
    scenarios: ["Brushed anodized aluminum or full-grain leather", "Scratch-resistant engraving", "Securely linked to random memory reveal"],
    alternate: false
  },
  {
    title: "Family Memory Kits",
    badge: "Coming Soon",
    tagline: "Collaborative storytelling, made effortless.",
    description: "A curated physical workbook and set of prompt cards designed to pass around the Thanksgiving table or family reunions. Includes scanning nodes and simple recording triggers.",
    scenarios: ["50 narrative prompt cards", "Grandparent recording journal", "Includes 5 companion Storykeeper Cards"],
    alternate: true
  },
  {
    title: "Legacy Preservation Kits",
    badge: "Future Offering",
    tagline: "The complete preservation registry.",
    description: "The ultimate heirloom parcel. Includes a leather-bound legacy binder, recording dictaphone, digital archiving scanning services, and three customized Storykeeper Cards.",
    scenarios: ["Premium presentation box", "Analogue-to-digital scanning voucher", "Dedicated legacy biographer support"],
    alternate: false
  }
];

const faqs = [
  {
    q: "Can I link multiple physical keepsakes to a single archive?",
    a: "Yes. You can link as many physical keys—cards, keychains, or plaques—to a single digital archive as you wish. This allows family members across different homes or countries to hold their own physical portal to the shared family heritage."
  },
  {
    q: "How does the QR waitlist and ordering process work?",
    a: "While our physical keepsakes are currently in the final prototyping and waitlist phases, your digital archive is fully active today. Establishing your digital vault is the essential first step; once your stories, audio, and photos are safely uploaded, you can link them to any Storykeeper product immediately upon release."
  },
  {
    q: "What happens if a physical keepsake is lost or damaged?",
    a: "Since your family's stories and voice recordings are preserved securely on our cloud infrastructure, losing a physical card never compromises your data. You can easily deactivate a lost keepsake from your dashboard and link your existing archive to a replacement product."
  }
];

export default async function StorykeeperProductsPage() {
  const account = await getAccountContext();
  const isSignedIn = Boolean(account.user);
  const primaryHref = isSignedIn ? "/dashboard" : "/login";
  const primaryLabel = isSignedIn ? "Enter Dashboard" : "Begin Your Archive";

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian text-archive-ivory flex flex-col justify-between">
      <DesignBackdrop />

      <div className="relative z-10 flex flex-col flex-grow">
        {/* Navigation Bar with Glass Blur */}
        <nav className="sticky top-0 z-50 mx-auto w-full border-b border-archive-gold/10 bg-archive-obsidian/45 backdrop-blur-md px-5 py-5 sm:px-8">
          <div className="mx-auto flex max-w-7xl items-center justify-between">
            <Link href="/" className="transition opacity-90 hover:opacity-100">
              <SiteLogo width={420} height={120} />
            </Link>
            <div className="flex items-center gap-4">
              <Link
                href="/keepsakes"
                className="text-xs font-semibold uppercase tracking-wider text-archive-ivory/80 transition hover:text-archive-gold"
              >
                Keepsakes
              </Link>
              {isSignedIn && (
                <Link
                  href="/member-card"
                  className="text-xs font-semibold uppercase tracking-wider text-archive-ivory/80 transition hover:text-archive-gold"
                >
                  Storykeeper Card
                </Link>
              )}
              <Link
                href={primaryHref}
                className="rounded-full border border-archive-gold/40 px-5 py-2 text-xs font-semibold uppercase tracking-wider text-archive-ivory transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:border-archive-gold hover:bg-white/5"
              >
                {primaryLabel}
              </Link>
            </div>
          </div>
        </nav>

        {/* HERO: Showcase Header with Centered Gold Quote Frame */}
        <header className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 sm:py-32 text-center">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs font-semibold uppercase tracking-[0.32em] text-archive-gold/90 mb-4">
              PHYSICAL HEIRLOOM KEEPSAKES
            </p>
            <h1 className="font-serif text-5xl leading-tight sm:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-archive-ivory via-archive-champagne to-archive-gold/90">
              Storykeeper Products
            </h1>
            
            {/* Elegant Framed Quote Box */}
            <div className="mt-10 mb-8 border border-archive-gold/30 rounded-2xl p-6 bg-white/[0.01] inline-block max-w-2xl">
              <p className="text-lg leading-8 text-archive-ivory/80 font-serif italic">
                &ldquo;A digital sanctuary is a safe haven. A physical keepsake is the key that opens it.&rdquo;
              </p>
            </div>

            <p className="max-w-2xl mx-auto text-sm leading-7 text-archive-ivory/60">
              While your archive is preserved on resilient, long-term digital infrastructure, we believe the keys to our digital vaults should be beautiful, tactile, and designed to outlast. Explore our planned portfolio of custom-crafted physical keepsakes designed to bridge touch and memory.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <a
                href="#products"
                className="rounded-full bg-archive-gold px-8 py-4 text-sm font-bold text-archive-obsidian shadow-luxury transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:bg-archive-champagne hover:shadow-lg hover:shadow-archive-gold/10"
              >
                View Collection
              </a>
            </div>
          </div>
        </header>

        {/* Emotional Introduction Section */}
        <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 border-t border-archive-gold/15">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
              THE PHYSICAL ANCHOR
            </p>
            <h2 className="mt-4 font-serif text-3xl sm:text-4xl text-archive-ivory leading-tight">
              Bringing Memory Back to the Physical World
            </h2>
            <p className="mt-6 text-sm leading-7 text-archive-ivory/70">
              Digital accounts have a way of drifting into background clouds, easily misplaced or forgotten. We believe that family memories deserve to be anchored to the spaces we inhabit—placed on tables, carried in wallets, or kept alongside everyday house keys.
            </p>
            <p className="mt-4 text-sm leading-7 text-archive-ivory/70">
              By etching custom-forged, weather-proof codes into tactile materials like heavy metal, full-grain leather, and hand-finished parchment, we create portals to your secure vault. You are not just sliding a code across a scanner—you are holding the physical key to your family&apos;s living heritage.
            </p>
          </div>
        </section>

        {/* Why Tactile Artifacts Matter Section */}
        <section className="mx-auto w-full max-w-7xl px-5 py-20 sm:px-8 border-t border-archive-gold/15">
          <div className="grid gap-10 lg:grid-cols-3">
            <div className="rounded-[2rem] border border-archive-gold/15 bg-gradient-to-b from-white/[0.03] to-transparent p-8 shadow-luxury">
              <div className="text-archive-gold font-serif text-3xl mb-4">◆</div>
              <h3 className="font-serif text-lg text-archive-champagne mb-3">Honest Materials</h3>
              <p className="text-xs leading-6 text-archive-ivory/60">
                No plastic, no flimsy adhesives. We prototype our products using weighted brass, brushed aluminum, top-tier leather, and heavy linen paper to make sure they feel premium to the touch.
              </p>
            </div>
            <div className="rounded-[2rem] border border-archive-gold/15 bg-gradient-to-b from-white/[0.03] to-transparent p-8 shadow-luxury">
              <div className="text-archive-gold font-serif text-3xl mb-4">◆</div>
              <h3 className="font-serif text-lg text-archive-champagne mb-3">Seamless Interaction</h3>
              <p className="text-xs leading-6 text-archive-ivory/60">
                A single smartphone camera scan unlocks their complete, secure history instantly. No confusing passwords, logins, or search boxes stand between grandchildren and grandparent voice recordings.
              </p>
            </div>
            <div className="rounded-[2rem] border border-archive-gold/15 bg-gradient-to-b from-white/[0.03] to-transparent p-8 shadow-luxury">
              <div className="text-archive-gold font-serif text-3xl mb-4">◆</div>
              <h3 className="font-serif text-lg text-archive-champagne mb-3">Quiet Visibility</h3>
              <p className="text-xs leading-6 text-archive-ivory/60">
                Keeping a physical Storykeeper card on a bookshelf or framed in a family photo frame ensures the memories remain an active, visible part of daily home life.
              </p>
            </div>
          </div>
        </section>

        {/* PRODUCTS GRID: Alternating Layout Split with Distinct tactile waitlist frames */}
        <section id="products" className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 border-t border-archive-gold/15 scroll-mt-20">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
              DESIGN PORTFOLIO
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-archive-ivory">
              The Keepsake Collection
            </h2>
            <p className="mt-3 text-sm text-archive-ivory/55">
              Explore our current blueprints and waitlists for upcoming physical keys.
            </p>
          </div>

          <div className="grid gap-12">
            {futureProducts.map((prod) => (
              <div
                key={prod.title}
                className="group rounded-[2.5rem] border border-archive-gold/15 bg-gradient-to-b from-white/[0.02] to-transparent p-8 sm:p-12 shadow-luxury relative overflow-hidden backdrop-blur-[2px] grid gap-12 lg:grid-cols-[1fr_360px] items-center"
              >
                <div className={`${prod.alternate ? "lg:order-last" : ""}`}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="rounded-full border border-archive-gold/40 px-4 py-1 text-[9px] font-bold text-archive-gold uppercase tracking-widest">
                      {prod.badge}
                    </span>
                  </div>
                  <h3 className="font-serif text-3xl text-archive-ivory leading-tight mb-2 group-hover:text-archive-gold transition-colors duration-300">
                    {prod.title}
                  </h3>
                  <p className="font-serif text-sm italic text-archive-champagne mb-4">
                    {prod.tagline}
                  </p>
                  <p className="text-xs leading-6 text-archive-ivory/68 max-w-xl mb-6">
                    {prod.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {prod.scenarios.map((s) => (
                      <span
                        key={s}
                        className="rounded-full border border-white/10 bg-white/[0.02] px-3.5 py-2 text-[10px] text-archive-ivory/55"
                      >
                        <span className="text-archive-gold mr-1">◆</span> {s}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Hand-crafted museum registry waitlist label */}
                <div className="rounded-2xl border-2 border-archive-gold/20 bg-archive-obsidian/85 p-6 flex flex-col justify-between h-full min-h-[200px]">
                  <div>
                    <h4 className="text-xs font-semibold text-archive-gold uppercase tracking-wider mb-2 font-mono">
                      WAITLIST REGISTRY
                    </h4>
                    <p className="text-[10px] leading-relaxed text-archive-ivory/50">
                      Be notified of early releases and focus group testing.
                    </p>
                  </div>
                  <div className="mt-4 grid gap-2">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="rounded-lg border border-archive-gold/30 bg-white/[0.03] px-3 py-2.5 text-xs text-archive-ivory outline-none placeholder-archive-ivory/20 focus:border-archive-gold transition-colors duration-200"
                    />
                    <button
                      type="button"
                      className="rounded-lg bg-archive-gold px-3 py-2.5 text-xs font-bold text-archive-obsidian transition-all duration-300 hover:bg-archive-champagne hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Request Invite
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Frequently Asked Questions Section */}
        <section className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 border-t border-archive-gold/15">
          <div className="grid gap-12 lg:grid-cols-[300px_1fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
                COMMON INQUIRIES
              </p>
              <h2 className="mt-4 font-serif text-3xl text-archive-ivory leading-tight">
                Keepsake Products FAQ
              </h2>
              <p className="mt-4 text-xs text-archive-ivory/55 leading-relaxed">
                Learn more about our design philosophy, timelines, and physical security.
              </p>
            </div>
            <div className="grid gap-8">
              {faqs.map((faq) => (
                <div key={faq.q} className="border-b border-archive-gold/10 pb-6">
                  <h3 className="font-serif text-lg text-archive-champagne mb-2">
                    {faq.q}
                  </h3>
                  <p className="text-xs leading-6 text-archive-ivory/60">
                    {faq.a}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final Call to Action Section */}
        <section className="mx-auto w-full max-w-7xl px-5 py-24 sm:px-8 border-t border-archive-gold/15">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl sm:text-4xl text-archive-ivory leading-tight">
              The Digital Foundation Comes First
            </h2>
            <p className="mt-4 text-sm leading-6 text-archive-ivory/55">
              Before physical cards can be etched, they need an archive to point to. Establish your digital vault today and begin organizing your heritage.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link
                href={primaryHref}
                className="rounded-full bg-archive-gold px-8 py-4 text-sm font-bold text-archive-obsidian shadow-luxury transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:bg-archive-champagne hover:shadow-lg hover:shadow-archive-gold/10"
              >
                {primaryLabel}
              </Link>
              <Link
                href="/build-your-legacy"
                className="rounded-full border border-archive-gold/30 bg-white/[0.04] px-8 py-4 text-sm font-semibold text-archive-ivory transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] hover:border-archive-gold hover:bg-white/[0.08]"
              >
                Explore Legacy Pillars
              </Link>
            </div>
          </div>
        </section>

        {/* Editorial Legacy Footer */}
        <footer className="relative z-10 border-t border-archive-gold/20 bg-archive-obsidian/40 backdrop-blur-md mt-auto py-16 text-xs text-archive-ivory/60">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 grid gap-8 md:grid-cols-4">
            <div>
              <SiteLogo width={360} height={110} className="mb-8 opacity-100" />
              <p className="leading-6 max-w-xs text-[11px]">
                The Life Archive is a quiet, permanent digital sanctuary helping you intentionally decide what survives you. Preserve your voice, identity, and life lessons for generations to come.
              </p>
            </div>
            <div>
              <h4 className="text-archive-gold font-semibold uppercase tracking-wider mb-4">Legacy Hub</h4>
              <ul className="grid gap-3">
                <li>
                  <Link href="/build-your-legacy" className="hover:text-archive-champagne hover:underline transition">
                    Build Your Legacy
                  </Link>
                </li>
                <li>
                  <Link href="/preserve-their-voice" className="hover:text-archive-champagne hover:underline transition">
                    Preserve Their Voice
                  </Link>
                </li>
                <li>
                  <Link href="/storykeeper-products" className="hover:text-archive-champagne hover:underline transition">
                    Storykeeper Products
                  </Link>
                </li>
                <li>
                  <Link href="/help-for-families" className="hover:text-archive-champagne hover:underline transition">
                    Help for Families (After Loss)
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-archive-gold font-semibold uppercase tracking-wider mb-4">Partner Ecosystem</h4>
              <ul className="grid gap-3">
                <li>
                  <Link href="/partners/funeral-homes" className="hover:text-archive-champagne hover:underline transition">
                    Funeral Homes
                  </Link>
                </li>
                <li>
                  <Link href="/partners/cemeteries" className="hover:text-archive-champagne hover:underline transition">
                    Cemeteries &amp; Parks
                  </Link>
                </li>
                <li>
                  <Link href="/partners/monuments" className="hover:text-archive-champagne hover:underline transition">
                    Monument Builders
                  </Link>
                </li>
                <li>
                  <Link href="/partners/hospice" className="hover:text-archive-champagne hover:underline transition">
                    Hospice Care Providers
                  </Link>
                </li>
                <li>
                  <Link href="/partners/estate-planners" className="hover:text-archive-champagne hover:underline transition">
                    Estate Planners
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-archive-gold font-semibold uppercase tracking-wider mb-4 font-serif italic">Every Legacy Begins...</h4>
              <p className="leading-5 max-w-xs text-[11px] mb-4">
                &ldquo;What story deserves to be remembered? What mistake taught you the most? What do you hope they remember when you are gone?&rdquo;
              </p>
              <p className="text-[10px] text-archive-gold/60">
                © 2026 The Life Archive. All rights preserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </main>
  );
}
