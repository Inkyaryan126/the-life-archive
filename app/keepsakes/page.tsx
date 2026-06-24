import Link from "next/link";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { getAccountContext } from "@/lib/account";

export const dynamic = "force-dynamic";

const keepsakes = [
  {
    name: "Wallet Member Card",
    price: "$19",
    bestFor: "Everyday pocket carrying, wallet storage, and final wishes backup.",
    desc: "A precision-crafted, heavy matte-finish horizontal wallet card etched with your secure, unique archive QR code on the back and your profile name on the front.",
    scenarios: "Account owners & guardians"
  },
  {
    name: "Memorial Keychain",
    price: "$24",
    bestFor: "Daily keys, active remembrance, and family distribution.",
    desc: "A beautifully hand-stitched full-grain leather or brushed-metal keychain charm embedded with your secure archive QR. A durable daily companion.",
    scenarios: "Children, spouses, & relatives"
  },
  {
    name: "Rugged Dog Tag",
    price: "$29",
    bestFor: "Veterans, bikers, first responders, and active lifestyles.",
    desc: "A heavy-gauge, tactical-style stainless steel or matte black anodized dog tag featuring a scratch-resistant laser-engraved QR code.",
    scenarios: "Veterans & rugged tributes"
  },
  {
    name: "Necklace Charm / Pendant",
    price: "$39",
    bestFor: "Wearing close to the heart, elegant memorial jewelry.",
    desc: "A refined, high-purity sterling silver or gold-plated pendant charm featuring a micro-engraved QR leading to their archive.",
    scenarios: "Parents, partners, & close descendants"
  },
  {
    name: "Memorial Plaque",
    price: "$79",
    bestFor: "Grave markers, home altars, shadow boxes, or wall displays.",
    desc: "A thick, weathered brass or obsidian-finish stone plaque designed for indoor or outdoor final resting places.",
    scenarios: "Resting sites & home memorials"
  },
  {
    name: "Urn / Keepsake Box Tag",
    price: "$49",
    bestFor: "Urn placement, dynamic ashes keepsake boxes, and drawers.",
    desc: "A slim, adhesive-backed curved bronze or brass plate engineered to conform perfectly to cylindrical urns or wood boxes.",
    scenarios: "Urns & heirloom keepsake vaults"
  },
  {
    name: "Photo Frame QR Key",
    price: "$59",
    bestFor: "Mantels, display tables, shelves, and home picture walls.",
    desc: "A premium solid-wood portrait frame accompanied by a subtle, beautifully inset gold QR plate on the border's lower edge.",
    scenarios: "Living room mantels & shelf displays"
  },
  {
    name: "Bench / Dedication Plaque",
    price: "Custom Quote",
    bestFor: "Public memorial benches, parks, dedication plaques, and gardens.",
    desc: "A highly-durable, weather-proof commercial grade bronze plaque etched with deep channels to survive centuries in public parks.",
    scenarios: "Dedications & public park benches"
  },
  {
    name: "Smart NFC Keepsake",
    price: "$39",
    bestFor: "Instant tap-to-reveal access, tech-forward families.",
    desc: "A ceramic token or brushed card embedded with an active NFC microchip. Tap any modern smartphone to instantly slide open the archive.",
    scenarios: "Frictionless modern sharing"
  }
];

export default async function KeepsakesPage() {
  const account = await getAccountContext();
  const isSignedIn = Boolean(account.user);
  const dashboardHref = isSignedIn ? "/dashboard" : "/login";

  const mailtoUrl = "mailto:keepsakes@thelifearchive.vip?subject=Life%20Archive%20Keepsake%20Request&body=Hello%20Life%20Archive%20Team%2C%0A%0AI%20am%20interested%20in%20requesting%20a%20premium%20physical%20keepsake%20connected%20to%20my%20archive.%0A%0AKeepsake%20Type%3A%20%5BPlease%20specify%3A%20Member%20Card%2C%20Keychain%2C%20Dog%20Tag%2C%20Pendant%2C%20Plaque%2C%20Urn%20Tag%2C%20etc.%5D%0AMy%20Archive%20Slug%3A%20%5BPlease%20enter%20slug%2C%20e.g.%20sari-rae%5D%0A%0AThank%20you!";

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
            href={dashboardHref}
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
        <section className="text-center max-w-3xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-archive-gold">
            PREMIUM STORYKEEPER KEEPSAKES
          </p>
          <h1 className="mt-5 font-serif text-4xl leading-tight sm:text-6xl text-archive-ivory">
            Storykeeper Keepsakes
          </h1>
          <p className="mt-4 font-serif text-xl italic text-archive-champagne sm:text-2xl">
            Connect a life story to something real.
          </p>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-7 text-archive-ivory/68">
            A Life Archive does not have to live only on a screen. Turn any archive into a physical keepsake that can be carried, worn, displayed, or placed where memories are honored.
          </p>
        </section>

        {/* Brand Concept Core Explanation */}
        <section className="mt-16 rounded-[2rem] border border-archive-gold/18 bg-white/[0.03] p-8 shadow-luxury max-w-4xl mx-auto">
          <div className="grid gap-8 md:grid-cols-2 text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-archive-gold/20">
            <div className="pb-6 md:pb-0 md:pr-8">
              <h3 className="font-serif text-2xl text-archive-gold mb-3">The Digital Home</h3>
              <p className="text-sm leading-7 text-archive-ivory/70">
                Every Life Archive includes a <strong className="text-archive-ivory">free QR code</strong>. You can print, download, or share this code anytime with no subscription, account, or login barriers for your visitors.
              </p>
            </div>
            <div className="pt-6 md:pt-0 md:pl-8">
              <h3 className="font-serif text-2xl text-archive-champagne mb-3">The Physical Key</h3>
              <p className="text-sm leading-7 text-archive-ivory/70">
                Premium keepsakes are physical, hand-crafted objects that carry your secure QR code. Multiple keepsakes can be linked to the same archive, giving every child, parent, or partner a key to their presence.
              </p>
            </div>
          </div>
          <div className="mt-8 border-t border-archive-gold/15 pt-6 text-center">
            <p className="font-serif text-lg text-archive-gold italic">
              &ldquo;The archive is the digital home. The keepsake is the physical key.&rdquo;
            </p>
          </div>
        </section>

        {/* Product Portfolio Grid */}
        <section className="mt-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-archive-gold">
              THE KEEPSAKE REGISTRY
            </p>
            <h2 className="mt-3 font-serif text-3xl sm:text-4xl text-archive-ivory">
              Physical Keepsake Registry
            </h2>
            <p className="mt-3 text-xs leading-5 text-archive-ivory/50">
              Each product is custom-etched and configured with your archive keys. No purchase is required; request a keepsake below whenever you are ready.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {keepsakes.map((prod) => (
              <div
                key={prod.name}
                className="rounded-[2rem] border border-archive-gold/14 bg-white/[0.015] p-6 flex flex-col justify-between shadow-luxury transition hover:border-archive-gold/30 hover:bg-white/[0.035]"
              >
                <div>
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <h3 className="font-serif text-lg text-archive-ivory leading-tight">
                      {prod.name}
                    </h3>
                    <span className="rounded-full bg-archive-gold/10 border border-archive-gold/25 px-2.5 py-0.5 text-[10px] font-bold text-archive-gold">
                      {prod.price}
                    </span>
                  </div>
                  <p className="text-xs leading-5 text-archive-ivory/65 mb-4">
                    {prod.desc}
                  </p>
                </div>

                <div className="border-t border-white/5 pt-4 mt-2">
                  <p className="text-[10px] uppercase tracking-wider text-archive-gold font-semibold mb-1">
                    Best For:
                  </p>
                  <p className="text-xs italic text-archive-ivory/55">
                    {prod.bestFor}
                  </p>
                  <a
                    href={mailtoUrl}
                    className="mt-4 block w-full rounded-xl bg-archive-gold/10 border border-archive-gold/20 py-2 text-center text-[10px] uppercase tracking-wider font-bold text-archive-gold transition hover:bg-archive-gold hover:text-archive-obsidian"
                  >
                    Request Keepsake
                  </a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA Form Section */}
        <section className="mt-24 rounded-[2.5rem] border border-archive-gold/22 bg-archive-obsidian p-8 sm:p-12 shadow-luxury text-center max-w-4xl mx-auto">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold mb-3">
            CUSTOM MANUFACTURING
          </p>
          <h2 className="font-serif text-3xl sm:text-4xl text-archive-ivory mb-4">
            How to Request a Physical Keepsake
          </h2>
          <p className="text-sm leading-7 text-archive-ivory/68 max-w-2xl mx-auto mb-8">
            Each physical key is custom hand-finished with premium materials and engraved with a permanent micro-QR scanner tag. Since we do not charge automated subscriptions, simply click the request link below, specify your desired heirloom type, and our legacy counselors will email you a custom preview and production proof.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href={mailtoUrl}
              className="rounded-full bg-archive-gold px-8 py-4 text-sm font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
            >
              Request a Keepsake Proof (via Email)
            </a>
            <Link
              href={dashboardHref}
              className="rounded-full border border-archive-gold/30 bg-white/[0.04] px-8 py-4 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]"
            >
              Return to Dashboard
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
