import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { getAccountContext } from "@/lib/account";

export const dynamic = "force-dynamic";

type Keepsake = {
  name: string;
  price: string;
  stripeProductId?: string;
  eyebrow: string;
  headline: string;
  story: string;
  craftsmanship: string;
  materials: string[];
  personalization: string[];
  included: string[];
  bestFor: string;
  visual: "card" | "keychain" | "tag" | "pendant" | "plaque" | "urn" | "frame" | "bench" | "nfc";
  checkoutType?: CheckoutType;
  image?: {
    src: string;
    alt: string;
  };
};

type CheckoutType = "card" | "keychain" | "plaque";

const checkoutUrls: Record<CheckoutType, string | undefined> = {
  card:
    process.env.NEXT_PUBLIC_CHECKOUT_MEMORY_CARD ||
    process.env.NEXT_PUBLIC_CHECKOUT_STORYKEEPER_CARD,
  keychain: process.env.NEXT_PUBLIC_CHECKOUT_MEMORIAL_KEYCHAIN,
  plaque: process.env.NEXT_PUBLIC_CHECKOUT_QR_PLAQUE
};

function getCheckoutUrl(
  product: Pick<Keepsake, "checkoutType">,
  archiveSlug?: string | null
) {
  if (!product.checkoutType) {
    return undefined;
  }

  return (
    checkoutUrls[product.checkoutType] ||
    `/api/keepsakes/checkout?type=${product.checkoutType}${
      archiveSlug ? `&archive=${encodeURIComponent(archiveSlug)}` : ""
    }`
  );
}

function CheckoutLink({
  checkoutUrl,
  children,
  className
}: {
  checkoutUrl?: string;
  children: ReactNode;
  className: string;
}) {
  if (checkoutUrl) {
    return (
      <a
        href={checkoutUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {children}
      </a>
    );
  }

  return (
    <span aria-disabled="true" className={className}>
      Coming Soon
    </span>
  );
}

const keepsakes: Keepsake[] = [
  {
    name: "The Life Archive Memory Card",
    price: "$19",
    stripeProductId: "prod_Umoxxb4aF5MuPL",
    eyebrow: "QR Card",
    headline: "A quiet card that keeps their story within reach.",
    story:
      "Designed for wallets, desk drawers, family files, and final-wishes folders, this card gives loved ones a clear path back to the archive when it matters.",
    craftsmanship:
      "Each order is prepared as a personalized proof with the archive QR, front-facing name treatment, and a restrained finish that feels archival rather than promotional.",
    materials: ["Heavy matte card stock", "Archive QR code", "Ivory and gold print treatment"],
    personalization: ["Archive name", "Front-facing name", "Short message or date"],
    included: ["Personalized card proof", "Archive QR placement", "Production confirmation before printing"],
    bestFor: "Everyday carrying, wallet storage, and final wishes backup.",
    visual: "card",
    checkoutType: "card",
    image: {
      src: "/images/keepsakes/member-card-dustin-sigley-preview.png",
      alt: "Personalized Life Archive wallet member card preview"
    }
  },
  {
    name: "The Life Archive Memorial Keychain",
    price: "$24",
    stripeProductId: "prod_Umopvhs6gAemhj",
    eyebrow: "Daily Carry",
    headline: "A small physical key for an archive that should not be forgotten.",
    story:
      "A keychain is the keepsake people actually carry. It turns a private archive into something that can travel through everyday routines without feeling ornamental.",
    craftsmanship:
      "Prepared as a custom proof with QR placement, name treatment, and material direction selected around durability and quiet presence.",
    materials: ["Leather or brushed metal direction", "Engraved or printed QR", "Compact carry format"],
    personalization: ["Name or initials", "Archive QR", "Material preference"],
    included: ["Custom proof", "QR placement review", "Follow-up for finish selection"],
    bestFor: "Daily keys, active remembrance, and family distribution.",
    visual: "keychain",
    checkoutType: "keychain",
    image: {
      src: "/images/keepsakes/leatherkeychain.png",
      alt: "Leather keychain keepsake with archive QR"
    }
  },
  {
    name: "Rugged Dog Tag",
    price: "$29",
    eyebrow: "Rugged Tribute",
    headline: "A stronger format for lives marked by service, grit, and movement.",
    story:
      "The dog tag format is direct and durable. It is suited for families who want the archive to feel carried, not displayed.",
    craftsmanship:
      "Each order starts with a proof for QR scale, name placement, and a finish direction appropriate for a more rugged object.",
    materials: ["Stainless steel or matte black direction", "Scratch-resistant QR treatment", "Chain-ready tag format"],
    personalization: ["Name", "Dates or short line", "Finish preference"],
    included: ["Tag layout proof", "Archive QR setup", "Personalization review"],
    bestFor: "Veterans, bikers, first responders, and active lifestyles.",
    visual: "tag",
    image: {
      src: "/images/keepsakes/dogchain.png",
      alt: "Dog tag chain keepsake with archive QR"
    }
  },
  {
    name: "Necklace Charm / Pendant",
    price: "$39",
    eyebrow: "Worn Close",
    headline: "A discreet charm for the story someone wants near the heart.",
    story:
      "The pendant format is intentionally small and personal. It is for families who want the archive to be present without announcing itself.",
    craftsmanship:
      "The proofing process focuses on restrained QR placement, legibility, and a finish that suits jewelry rather than signage.",
    materials: ["Silver or gold-tone direction", "Micro QR placement", "Charm or pendant form"],
    personalization: ["Initials or name", "Short dedication", "Finish preference"],
    included: ["Pendant layout proof", "QR legibility review", "Production confirmation"],
    bestFor: "Parents, partners, and close descendants.",
    visual: "pendant",
    image: {
      src: "/images/keepsakes/memorialpendant.png",
      alt: "Memorial pendant keepsake with archive QR"
    }
  },
  {
    name: "The Life Archive Memorial Plaque",
    price: "$79",
    stripeProductId: "prod_Ump23cb9KHhhNQ",
    eyebrow: "Placed With Care",
    headline: "A permanent signpost for a life remembered in more than dates.",
    story:
      "A plaque can sit near a grave marker, home altar, shadow box, or family wall. It gives the archive a stable physical address.",
    craftsmanship:
      "Proofing centers on proportion, material tone, and QR placement so the piece reads as a memorial object first and a scan point second.",
    materials: ["Brass, bronze, or dark plaque direction", "Engraved or inset QR", "Indoor or outdoor placement review"],
    personalization: ["Name", "Dates", "Short dedication"],
    included: ["Plaque proof", "Placement consultation by email", "Archive QR setup"],
    bestFor: "Grave markers, home altars, shadow boxes, or wall displays.",
    visual: "plaque",
    checkoutType: "plaque",
    image: {
      src: "/images/keepsakes/memorialplaque.png",
      alt: "Memorial plaque keepsake with archive QR"
    }
  },
  {
    name: "Urn / Keepsake Box Tag",
    price: "$49",
    eyebrow: "Archive Tag",
    headline: "A small marker for the objects families already protect.",
    story:
      "Some keepsakes belong on the box, urn, or drawer that already holds memory. This format keeps the archive connected to the physical place families return to.",
    craftsmanship:
      "Each order is reviewed for object type, surface shape, and a tag treatment that should feel subtle rather than added-on.",
    materials: ["Curved or flat tag direction", "Bronze or brass-tone option", "Adhesive-backed placement concept"],
    personalization: ["Archive name", "Short inscription", "Surface type"],
    included: ["Tag proof", "Surface-fit follow-up", "QR placement review"],
    bestFor: "Urns, heirloom boxes, keepsake vaults, and drawers.",
    visual: "urn",
    image: {
      src: "/images/keepsakes/urn.png",
      alt: "Urn keepsake tag with archive QR"
    }
  },
  {
    name: "Photo Frame QR Key",
    price: "$59",
    eyebrow: "Memorial Photo QR",
    headline: "A frame that lets one photograph open into a fuller life.",
    story:
      "A portrait already asks people to pause. Adding a quiet QR key lets that moment continue into voice notes, lessons, photos, and memories.",
    craftsmanship:
      "The proofing process considers frame edge, QR scale, and how the code sits beside the photograph without competing with it.",
    materials: ["Wood-frame direction", "Inset QR plate concept", "Gold or dark accent direction"],
    personalization: ["Name", "Frame message", "Photo context"],
    included: ["Frame QR concept", "Archive QR placement", "Personalization proof"],
    bestFor: "Mantels, display tables, shelves, and home picture walls.",
    visual: "frame",
    image: {
      src: "/images/keepsakes/photoframekey.png",
      alt: "Photo frame keepsake with archive QR key"
    }
  },
  {
    name: "Bench / Dedication Plaque",
    price: "Custom Quote",
    eyebrow: "Custom Dedication",
    headline: "A public marker that can hold more than a short inscription.",
    story:
      "For benches, gardens, dedications, and public memorials, the archive becomes a deeper layer behind a simple physical marker.",
    craftsmanship:
      "Custom orders are reviewed by placement, exposure, material direction, QR scale, and the tone of the dedication.",
    materials: ["Weather-aware plaque direction", "Bronze or dark metal concept", "Custom sizing discussion"],
    personalization: ["Name", "Dedication", "Installation context"],
    included: ["Custom order discussion", "QR placement concept", "Follow-up quote process"],
    bestFor: "Public memorial benches, parks, dedication plaques, and gardens.",
    visual: "bench",
    image: {
      src: "/images/keepsakes/dedicationplaque.png",
      alt: "Dedication plaque keepsake with archive QR"
    }
  },
  {
    name: "Smart NFC Keepsake",
    price: "$39",
    eyebrow: "Tap Access Option",
    headline: "A modern option for families who want scan and tap access.",
    story:
      "The NFC option is for families who want the archive to open by camera scan or phone tap, while keeping the same quiet physical language.",
    craftsmanship:
      "Orders are reviewed for form factor, QR backup placement, and whether NFC is appropriate for the intended use.",
    materials: ["Ceramic token or brushed card direction", "NFC tap option", "QR backup path"],
    personalization: ["Name", "Material preference", "Use context"],
    included: ["NFC layout review", "QR backup placement", "Production confirmation"],
    bestFor: "Instant tap-to-reveal access and tech-forward families.",
    visual: "nfc",
    image: {
      src: "/images/keepsakes/smartnfc.png",
      alt: "Smart NFC keepsake with QR backup"
    }
  },
  {
    name: "Remembrance Bracelet / Bracelet Plate",
    price: "$39",
    eyebrow: "Worn Reminder",
    headline: "A bracelet plate for memory that can stay close through ordinary days.",
    story:
      "This format is for families who want the archive attached to something wearable, simple, and easy to keep nearby.",
    craftsmanship:
      "Orders focus on QR legibility, plate size, and a restrained name or initials treatment that does not overwhelm the bracelet.",
    materials: ["Bracelet plate direction", "Archive QR placement", "Dark or metal-tone finish"],
    personalization: ["Name or initials", "Short date or phrase", "Finish preference"],
    included: ["Bracelet plate proof", "QR placement review", "Production confirmation"],
    bestFor: "Daily remembrance, close family members, and discreet wearable access.",
    visual: "plaque",
    image: {
      src: "/images/keepsakes/braceletplate.png",
      alt: "Bracelet plate keepsake with archive QR"
    }
  },
  {
    name: "Car Vent Keepsake",
    price: "$34",
    eyebrow: "Travel Companion",
    headline: "A small keepsake for the places where songs, stories, and drives return.",
    story:
      "Some memories live in the car: errands, road trips, favorite songs, and quiet conversations. This keepsake gives that space a path back to the archive.",
    craftsmanship:
      "Each order is reviewed around size, QR access, and a low-profile format that belongs in a vehicle without feeling distracting.",
    materials: ["Vent-friendly form factor", "Archive QR code", "Dark or metal-tone direction"],
    personalization: ["Name", "Short phrase", "Vehicle placement context"],
    included: ["Car vent concept proof", "QR placement review", "Follow-up for fit details"],
    bestFor: "Cars, road trips, and families who connect memory with movement.",
    visual: "nfc",
    image: {
      src: "/images/keepsakes/carvent.png",
      alt: "Car vent keepsake with archive QR"
    }
  },
  {
    name: "Money Clip Card",
    price: "$49",
    eyebrow: "Pocket Archive",
    headline: "A refined pocket piece for the archive someone wants close at hand.",
    story:
      "The money clip format keeps the archive attached to a practical object, suitable for someone who prefers a sturdier daily carry piece.",
    craftsmanship:
      "Proofing centers on QR placement, engraved name treatment, and keeping the object understated enough for everyday use.",
    materials: ["Money clip card direction", "Engraved or printed QR", "Metal-tone finish"],
    personalization: ["Name or initials", "Short message", "Finish preference"],
    included: ["Money clip proof", "Archive QR setup", "Personalization review"],
    bestFor: "Daily carry, wallets, and practical personal keepsakes.",
    visual: "card",
    image: {
      src: "/images/keepsakes/moneyclip.png",
      alt: "Money clip card keepsake with archive QR"
    }
  }
];

const launchProductNames = [
  "The Life Archive Memorial Keychain",
  "The Life Archive Memory Card",
  "The Life Archive Memorial Plaque"
];

const activeKeepsakes = launchProductNames
  .map((name) => keepsakes.find((keepsake) => keepsake.name === name))
  .filter((keepsake): keepsake is Keepsake => Boolean(keepsake));

const comingSoonKeepsakes = keepsakes.filter(
  (keepsake) => !launchProductNames.includes(keepsake.name)
);

const storeSteps = [
  "Choose a keepsake",
  "Connect it to an archive",
  "Personalize name, message, or material",
  "Complete secure checkout",
  "We confirm details before production"
];

const trustPillars = [
  {
    title: "Lifetime keepsake philosophy",
    copy:
      "These objects are meant to live beside records, portraits, urns, drawers, and daily keys. The goal is not a seasonal product drop. It is a physical path back to a life story."
  },
  {
    title: "Secure archive activation",
    copy:
      "Each order is connected to a specific Life Archive QR path. We confirm the archive and personalization details before production decisions move forward."
  },
  {
    title: "Designed to last generations",
    copy:
      "Material choices favor legibility, restraint, and durability. The keepsake should still make sense to someone finding it years from now."
  },
  {
    title: "Private by design",
    copy:
      "The keepsake is only a physical key. Archive privacy and access remain controlled by the archive experience, not by public product pages."
  }
];

function ProductVisual({
  image,
  name,
  type
}: {
  image?: Keepsake["image"];
  name: string;
  type: Keepsake["visual"];
}) {
  const shapeClasses: Record<Keepsake["visual"], string> = {
    card: "h-40 w-64 rounded-[1.4rem]",
    keychain: "h-48 w-24 rounded-[2.5rem]",
    tag: "h-52 w-32 rounded-[4rem]",
    pendant: "h-40 w-40 rounded-full",
    plaque: "h-44 w-72 rounded-xl",
    urn: "h-36 w-64 rounded-[999px]",
    frame: "h-64 w-52 rounded-xl",
    bench: "h-32 w-72 rounded-lg",
    nfc: "h-44 w-44 rounded-[2rem]"
  };

  if (image) {
    return (
      <div className="relative aspect-[4/3] overflow-hidden rounded-[2.25rem] border border-archive-gold/15 bg-archive-obsidian shadow-luxury">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          className="object-cover transition duration-500"
          sizes="(min-width: 1024px) 44rem, (min-width: 768px) 50vw, 100vw"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-archive-obsidian/82 via-archive-obsidian/24 to-transparent" />
        <p className="absolute bottom-6 left-6 right-6 text-[10px] font-semibold uppercase tracking-[0.24em] text-archive-ivory/68">
          {name}
        </p>
      </div>
    );
  }

  return (
    <div className="relative min-h-[22rem] overflow-hidden rounded-[2.25rem] border border-archive-gold/15 bg-[radial-gradient(circle_at_50%_22%,rgba(198,161,91,0.2),transparent_18rem),linear-gradient(145deg,rgba(255,255,255,0.08),rgba(255,255,255,0.01))] shadow-luxury">
      <div className="absolute inset-x-10 bottom-10 h-16 rounded-full bg-black/45 blur-2xl" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(13,13,14,0),rgba(13,13,14,0.36))]" />
      <div
        className={`absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-1/2 place-items-center border border-archive-gold/35 bg-gradient-to-br from-archive-ivory/18 via-archive-gold/12 to-black/20 shadow-[0_36px_90px_rgba(0,0,0,0.48)] ${shapeClasses[type]}`}
      >
        <div className="grid h-20 w-20 place-items-center rounded-xl border border-archive-gold/35 bg-archive-obsidian/70">
          <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-archive-gold">
            QR
          </span>
        </div>
      </div>
      <p className="absolute bottom-6 left-6 right-6 text-[10px] font-semibold uppercase tracking-[0.24em] text-archive-ivory/45">
        {name}
      </p>
    </div>
  );
}

function DetailList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h4 className="text-[10px] font-bold uppercase tracking-[0.24em] text-archive-gold">
        {title}
      </h4>
      <ul className="mt-4 grid gap-3 text-xs leading-5 text-archive-ivory/68">
        {items.map((item) => (
          <li key={item} className="flex gap-3">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-archive-gold" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ProductShowcase({
  archiveSlug,
  product,
  badge,
  isComingSoon = false,
  reverse = false
}: {
  archiveSlug?: string | null;
  product: Keepsake;
  badge?: string;
  isComingSoon?: boolean;
  reverse?: boolean;
}) {
  const checkoutUrl = getCheckoutUrl(product, archiveSlug);

  return (
    <section className="grid gap-10 border-t border-archive-gold/15 py-16 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-24">
      <div className={reverse ? "lg:order-last" : ""}>
        <ProductVisual image={product.image} type={product.visual} name={product.name} />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.26em] text-archive-gold">
          {product.eyebrow}
        </p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
          <h2 className="max-w-xl font-serif text-3xl leading-tight text-archive-ivory sm:text-5xl">
            {product.headline}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {badge ? (
              <span className="rounded-full bg-archive-gold px-4 py-1 text-xs font-bold uppercase tracking-[0.16em] text-archive-obsidian">
                {badge}
              </span>
            ) : null}
            {isComingSoon ? (
              <span className="rounded-full border border-archive-gold/30 px-4 py-1 text-xs font-bold uppercase tracking-[0.16em] text-archive-gold">
                Coming Soon
              </span>
            ) : null}
            <span className="rounded-full border border-archive-gold/30 px-4 py-1 text-xs font-bold text-archive-gold">
              {product.price}
            </span>
          </div>
        </div>
        <p className="mt-6 max-w-2xl text-sm leading-7 text-archive-ivory/76">
          {product.story}
        </p>
        <div className="mt-8 rounded-[1.5rem] border border-archive-gold/12 bg-white/[0.025] p-5">
          <h3 className="font-serif text-xl text-archive-champagne">
            Craftsmanship
          </h3>
          <p className="mt-3 text-sm leading-7 text-archive-ivory/66">
            {product.craftsmanship}
          </p>
        </div>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          <DetailList title="Materials" items={product.materials} />
          <DetailList title="Personalization" items={product.personalization} />
          <DetailList title="What's included" items={product.included} />
        </div>
        <p className="mt-8 text-xs italic leading-6 text-archive-ivory/58">
          Best for: {product.bestFor}
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <CheckoutLink
            checkoutUrl={isComingSoon ? undefined : checkoutUrl}
            className="rounded-full bg-archive-gold px-7 py-3 text-xs font-bold uppercase tracking-[0.18em] text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
          >
            Order Now
          </CheckoutLink>
          {!isComingSoon && checkoutUrl ? (
            <CheckoutLink
              checkoutUrl={checkoutUrl}
              className="rounded-full border border-archive-gold/30 bg-white/[0.035] px-7 py-3 text-xs font-bold uppercase tracking-[0.18em] text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.07]"
            >
              Choose This Keepsake
            </CheckoutLink>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function ProductCard({
  archiveSlug,
  product,
  badge
}: {
  archiveSlug?: string | null;
  product: Keepsake;
  badge?: string;
}) {
  const checkoutUrl = getCheckoutUrl(product, archiveSlug);
  const cardContent = (
    <>
      <ProductVisual image={product.image} type={product.visual} name={product.name} />
      <div className="p-2 pt-5">
        <div className="flex flex-wrap items-center gap-2">
          {badge ? (
            <span className="rounded-full bg-archive-gold px-3 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-archive-obsidian">
              {badge}
            </span>
          ) : null}
          {!checkoutUrl ? (
            <span className="rounded-full border border-archive-gold/30 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.16em] text-archive-gold">
              Coming Soon
            </span>
          ) : null}
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-archive-gold">
            {product.eyebrow}
          </p>
        </div>
        <h3 className="mt-3 font-serif text-2xl text-archive-ivory">
          {product.name}
        </h3>
        <p className="mt-3 text-xs leading-6 text-archive-ivory/60">
          {product.bestFor}
        </p>
        <p className="mt-3 text-xs leading-6 text-archive-ivory/54">
          {product.story}
        </p>
        <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-archive-champagne">
          {checkoutUrl ? "Order Now" : "Coming Soon"}
        </p>
      </div>
    </>
  );

  if (!checkoutUrl) {
    return (
      <div className="rounded-[2rem] border border-archive-gold/14 bg-white/[0.02] p-4 opacity-80 shadow-luxury">
        {cardContent}
      </div>
    );
  }

  return (
    <a
      href={checkoutUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group rounded-[2rem] border border-archive-gold/14 bg-white/[0.02] p-4 shadow-luxury transition hover:border-archive-gold/35 hover:bg-white/[0.04]"
    >
      {cardContent}
    </a>
  );
}

function TrustPillar({ title, copy }: { title: string; copy: string }) {
  return (
    <div className="border-t border-archive-gold/18 pt-6">
      <h3 className="font-serif text-2xl text-archive-ivory">{title}</h3>
      <p className="mt-4 text-sm leading-7 text-archive-ivory/64">{copy}</p>
    </div>
  );
}

export default async function KeepsakesPage() {
  const account = await getAccountContext();
  const isSignedIn = Boolean(account.user);
  const dashboardHref = isSignedIn ? "/dashboard" : "/login";
  const dashboardLabel = isSignedIn ? "Dashboard" : "Sign In";
  const checkoutArchiveSlug =
    account.defaultArchive?.slug || account.archives[0]?.slug || null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-6 text-archive-ivory sm:px-8">
      <DesignBackdrop />

      <nav className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-4 border-b border-archive-gold/20 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/">
          <SiteLogo width={160} height={40} />
        </Link>
        <div className="flex w-full items-center justify-between gap-4 sm:w-auto sm:justify-end">
          <Link
            href={dashboardHref}
            className="text-sm font-semibold text-archive-champagne underline-offset-4 hover:underline"
          >
            {dashboardLabel}
          </Link>
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-archive-gold">
            Keepsake Store
          </span>
        </div>
      </nav>

      <div className="relative z-10 mx-auto max-w-7xl">
        <header className="grid gap-12 py-16 sm:py-24 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:items-center lg:py-28">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-archive-gold">
              Keepsake Store
            </p>
            <h1 className="mt-5 max-w-4xl font-serif text-5xl leading-[1.02] text-archive-ivory sm:text-7xl">
              Physical keys for the stories worth finding again.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-archive-ivory/72">
              Choose the form that belongs with the archive, complete checkout, and we help align the QR, name, message, and material direction before production.
            </p>
            <p className="mt-3 text-sm font-semibold text-archive-gold">
              Secure checkout opens in a new tab.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#collection"
                className="rounded-full bg-archive-gold px-8 py-4 text-sm font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
              >
                Choose a Keepsake
              </a>
              <Link
                href={dashboardHref}
                className="rounded-full border border-archive-gold/30 bg-white/[0.04] px-8 py-4 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]"
              >
                {isSignedIn ? "Return to Dashboard" : "Sign In to Your Archive"}
              </Link>
            </div>
          </div>
          <div className="rounded-[2.5rem] border border-archive-gold/16 bg-white/[0.025] p-4 shadow-luxury">
            <ProductVisual
              image={activeKeepsakes[0]?.image}
              type={activeKeepsakes[0]?.visual || "keychain"}
              name={activeKeepsakes[0]?.name || "The Life Archive Memorial Keychain"}
            />
          </div>
        </header>

        <section className="border-t border-archive-gold/15 py-14">
          <div className="grid gap-6 md:grid-cols-5">
            {storeSteps.map((step, index) => (
              <div key={step} className="border-t border-archive-gold/20 pt-5">
                <span className="font-serif text-3xl text-archive-gold/45">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-4 text-sm leading-6 text-archive-ivory/72">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="py-16" id="collection">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-archive-gold">
              Featured Collection
            </p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-archive-ivory sm:text-5xl">
              Start with the form the family will actually keep.
            </h2>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {activeKeepsakes.map((product, index) => (
              <ProductCard
                key={product.name}
                archiveSlug={checkoutArchiveSlug}
                product={product}
                badge={index === 0 ? "Featured / Best Seller" : undefined}
              />
            ))}
          </div>
        </section>

        {activeKeepsakes.map((product, index) => (
          <ProductShowcase
            key={product.name}
            archiveSlug={checkoutArchiveSlug}
            product={product}
            badge={index === 0 ? "Featured / Best Seller" : undefined}
            reverse={index % 2 === 1}
          />
        ))}

        <section className="border-t border-archive-gold/15 py-16 sm:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-archive-gold">
              Coming Soon
            </p>
            <h2 className="mt-4 font-serif text-4xl leading-tight text-archive-ivory sm:text-5xl">
              Future keepsakes in development.
            </h2>
            <p className="mt-5 text-sm leading-7 text-archive-ivory/66">
              These formats remain part of the catalog, but they are not available for checkout yet.
            </p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {comingSoonKeepsakes.map((product) => (
              <ProductCard
                key={product.name}
                product={product}
              />
            ))}
          </div>
        </section>

        <section className="border-t border-archive-gold/15 py-20 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.26em] text-archive-gold">
                Built For Memory
              </p>
              <h2 className="mt-4 font-serif text-4xl leading-tight text-archive-ivory sm:text-5xl">
                A keepsake should feel worthy before anyone scans it.
              </h2>
            </div>
            <div className="grid gap-8 md:grid-cols-2">
              {trustPillars.map((pillar) => (
                <TrustPillar key={pillar.title} {...pillar} />
              ))}
            </div>
          </div>
        </section>

        <section className="mb-16 rounded-[2.5rem] border border-archive-gold/22 bg-archive-obsidian/92 p-8 text-center shadow-luxury sm:p-12">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
            The Life Archive Keepsakes
          </p>
          <h2 className="mx-auto mt-4 max-w-3xl font-serif text-4xl leading-tight text-archive-ivory sm:text-5xl">
            Order the launch keepsake that fits your archive.
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-sm leading-7 text-archive-ivory/68">
            Start with the memorial keychain, memory card, or memorial plaque. After checkout, you will personalize the keepsake around the Life Archive it belongs to.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-4">
            <a
              href="#collection"
              className="rounded-full bg-archive-gold px-8 py-4 text-sm font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
            >
              Choose a Keepsake
            </a>
            <Link
              href={dashboardHref}
              className="rounded-full border border-archive-gold/20 px-8 py-4 text-sm font-semibold text-archive-champagne transition hover:border-archive-gold hover:text-archive-ivory"
            >
              {isSignedIn ? "Return to Dashboard" : "Sign In to Your Archive"}
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
