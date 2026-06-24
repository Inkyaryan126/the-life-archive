import Link from "next/link";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";

export const dynamic = "force-dynamic";

const futureProducts = [
  {
    title: "The Storykeeper Card",
    badge: "Coming Soon",
    tagline: "The physical key to a digital sanctuary.",
    description: "A precision-crafted, heavy matte-finish wallet card etched with your secure, unique legacy QR code. Built to carry close, keep safe, and pass down through generations.",
    scenarios: ["Fits in wallets & purses", "Highly durable waterproof cardstock", "Hand-finished gold detailing"]
  },
  {
    title: "Memorial Cards (Bulk Sets)",
    badge: "Future Offering",
    tagline: "Share their presence at their final gathering.",
    description: "Printed keepsake card packs designed to hand out to relatives, friends, and funeral attendees. Features their portrait, custom monogram, and a direct scan path to listen to voice recordings.",
    scenarios: ["Perfect for celebrations of life", "Sets of 50, 100, or 250", "Elegant ivory parchment textures"]
  },
  {
    title: "The QR Keychain",
    badge: "Interest List",
    tagline: "Keep the story within arm's reach.",
    description: "A beautifully hand-stitched leather or brushed-metal keychain charm embedded with your secure archive QR. A modern digital talisman designed for everyday travel.",
    scenarios: ["Brushed anodized aluminum or full-grain leather", "Scratch-resistant engraving", "Securely linked to random memory reveal"]
  },
  {
    title: "Family Memory Kits",
    badge: "Coming Soon",
    tagline: "Collaborative storytelling, made effortless.",
    description: "A curated physical workbook and set of prompt cards designed to pass around the Thanksgiving table or family reunions. Includes scanning nodes and simple recording triggers.",
    scenarios: ["50 narrative prompt cards", "Grandparent recording journal", "Includes 5 companion Storykeeper Cards"]
  },
  {
    title: "Legacy Preservation Kits",
    badge: "Future Offering",
    tagline: "The complete preservation registry.",
    description: "The ultimate heirloom parcel. Includes a leather-bound legacy binder, recording dictaphone, digital archiving scanning services, and three customized Storykeeper Cards.",
    scenarios: ["Premium presentation box", "Analogue-to-digital scanning voucher", "Dedicated legacy biographer support"]
  }
];

export default function StorykeeperProductsPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-6 text-archive-ivory sm:px-8">
      <DesignBackdrop />

      {/* Header */}
      <nav className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between border-b border-archive-gold/20 pb-5">
        <Link href="/">
          <SiteLogo width={160} height={40} />
        </Link>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="text-sm font-semibold text-archive-champagne underline-offset-4 hover:underline"
          >
            Dashboard
          </Link>
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
            Physical Keepsakes
          </span>
        </div>
      </nav>

      <div className="relative z-10 mx-auto max-w-5xl py-12 sm:py-16">
        {/* Hero */}
        <section className="text-center max-w-3xl mx-auto mb-16">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-archive-gold">
            PHYSICAL HEIRLOOM KEEPSAKES
          </p>
          <h1 className="mt-5 font-serif text-4xl leading-tight sm:text-6xl text-archive-ivory">
            Storykeeper Products
          </h1>
          <p className="mt-6 text-lg leading-8 text-archive-ivory/72 max-w-2xl mx-auto font-serif italic">
            Quietly connecting physical milestones with permanent digital memories.
          </p>
          <p className="mt-4 text-sm leading-7 text-archive-ivory/60 max-w-2xl mx-auto">
            While The Life Archive is built on resilient, secure digital cloud infrastructure, we believe the keys to our digital sanctuaries should be beautiful, tactile, and highly durable. Explore our future portfolio of custom-crafted physical keepsakes designed to keep your family&apos;s stories close.
          </p>
        </section>

        {/* Products Grid */}
        <section className="grid gap-8">
          {futureProducts.map((prod) => (
            <div
              key={prod.title}
              className="rounded-[2.5rem] border border-archive-gold/18 bg-white/[0.035] p-8 sm:p-10 shadow-luxury grid gap-8 md:grid-cols-[1fr_280px] items-center"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="rounded-full bg-archive-gold/10 border border-archive-gold/35 px-3 py-1 text-[10px] font-bold text-archive-gold uppercase tracking-wider">
                    {prod.badge}
                  </span>
                </div>
                <h2 className="font-serif text-3xl text-archive-ivory leading-tight mb-2">
                  {prod.title}
                </h2>
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
                      className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1.5 text-[10px] text-archive-ivory/55"
                    >
                      • {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Interactive Interest List Box */}
              <div className="rounded-2xl border border-archive-gold/14 bg-archive-obsidian/60 p-6 flex flex-col justify-between h-full min-h-[180px]">
                <div>
                  <h4 className="text-xs font-semibold text-archive-gold uppercase tracking-wider mb-2">
                    Join Waitlist
                  </h4>
                  <p className="text-[10px] leading-relaxed text-archive-ivory/50">
                    Get early availability notices and participate in design focus groups.
                  </p>
                </div>
                <div className="mt-4 grid gap-2">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="rounded-lg border border-archive-gold/20 bg-white/[0.03] px-3 py-2 text-xs text-archive-ivory outline-none placeholder-archive-ivory/30 focus:border-archive-gold"
                  />
                  <button
                    type="button"
                    className="rounded-lg bg-archive-gold px-3 py-2 text-xs font-bold text-archive-obsidian transition hover:bg-archive-champagne"
                  >
                    Request Invitation
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>

        {/* Call to Action Footer */}
        <section className="mt-24 text-center border-t border-archive-gold/15 pt-16">
          <h3 className="font-serif text-2xl text-archive-ivory">
            The Digital Foundation Comes First
          </h3>
          <p className="mt-3 text-sm leading-6 text-archive-ivory/55 max-w-xl mx-auto">
            Before physical cards can be etched, they need an archive to point to. Create your secure digital vault today and start building the story.
          </p>
          <div className="mt-8">
            <Link
              href="/login"
              className="rounded-full bg-archive-gold px-8 py-3.5 text-sm font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
            >
              Establish Your Archive
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
