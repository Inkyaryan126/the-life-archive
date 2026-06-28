import Link from "next/link";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";

export default function KeepsakeThankYouPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-8 text-archive-ivory sm:px-8">
      <DesignBackdrop />

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-4rem)] max-w-4xl flex-col">
        <nav className="flex items-center justify-between border-b border-archive-gold/18 pb-5">
          <Link href="/">
            <SiteLogo width={160} height={40} />
          </Link>
          <Link
            href="/keepsakes"
            className="text-sm font-semibold text-archive-champagne underline-offset-4 hover:underline"
          >
            Keepsake Store
          </Link>
        </nav>

        <section className="grid flex-1 place-items-center py-16">
          <div className="w-full max-w-3xl rounded-[2.5rem] border border-archive-gold/22 bg-archive-obsidian/88 p-8 text-center shadow-luxury sm:p-12">
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-archive-gold">
              Order Received
            </p>
            <h1 className="mx-auto mt-5 max-w-2xl font-serif text-4xl leading-tight text-archive-ivory sm:text-6xl">
              Thank you for your order.
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-8 text-archive-ivory/72">
              Your order was received. Next, create a new Life Archive or choose
              the archive this keepsake should connect to.
            </p>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-archive-ivory/60">
              Watch your email for personalization instructions before
              production begins.
            </p>
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              <Link
                href="/dashboard"
                className="rounded-full bg-archive-gold px-7 py-3 text-sm font-bold text-archive-obsidian shadow-luxury transition hover:bg-archive-champagne"
              >
                Go to My Archives
              </Link>
              <Link
                href="/create"
                className="rounded-full border border-archive-gold/30 bg-white/[0.04] px-7 py-3 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]"
              >
                Create a Life Archive
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
