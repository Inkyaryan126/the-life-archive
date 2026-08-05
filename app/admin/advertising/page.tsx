import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminNav } from "@/components/AdminNav";
import { AdminTrackableLinksView } from "@/components/AdminTrackableLinksView";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { getAdminAccess } from "@/lib/admin";
import {
  listCampaigns,
  listTrackableLinksJoined,
  listQrCodes,
  listConversions,
  createCampaign,
  createTrackableLink,
  type AdvertisingCampaign,
  type AdvertisingConversion
} from "@/lib/advertising-campaigns";
import { getSiteUrl } from "@/lib/qr";

export const dynamic = "force-dynamic";

async function createCampaignAction(formData: FormData) {
  "use server";
  const name = formData.get("name")?.toString().trim();
  const slug = formData.get("slug")?.toString().trim();
  const platform = formData.get("platform")?.toString().trim();
  const destinationUrl = formData.get("destinationUrl")?.toString().trim() || "/legacy-prologue";
  const budget = formData.get("budget") ? Number(formData.get("budget")) : null;

  if (!name || !slug || !platform) return;

  await createCampaign({
    name,
    slug,
    platform,
    destinationUrl,
    budget
  });

  redirect("/admin/advertising?success=campaign_created");
}

async function createTrackableLinkAction(formData: FormData) {
  "use server";
  const linkName = formData.get("linkName")?.toString().trim();
  const slug = formData.get("slug")?.toString().trim();
  const campaignId = formData.get("campaignId")?.toString().trim() || null;
  const destinationPath = formData.get("destinationPath")?.toString().trim() || "/legacy-prologue";
  const utmSource = formData.get("utmSource")?.toString().trim() || "direct";
  const utmMedium = formData.get("utmMedium")?.toString().trim() || "qr";
  const utmCampaign = formData.get("utmCampaign")?.toString().trim() || "general";
  const tlaMaterial = formData.get("tlaMaterial")?.toString().trim() || null;

  if (!linkName || !slug) return;

  await createTrackableLink({
    campaignId,
    linkName,
    slug,
    destinationPath,
    utmSource,
    utmMedium,
    utmCampaign,
    tlaMaterial
  });

  redirect("/admin/advertising?tab=links&success=link_created");
}

export default async function AdminAdvertisingPage({
  searchParams
}: {
  searchParams?: Promise<{ tab?: string; success?: string }>;
}) {
  const { account, isAdmin, adminEmailsConfigured } = await getAdminAccess();
  const resolvedSearchParams = await searchParams;
  const currentTab = resolvedSearchParams?.tab || "overview";

  if (!account.user) {
    redirect("/login?next=%2Fadmin%2Fadvertising");
  }

  if (!adminEmailsConfigured || !isAdmin) {
    return (
      <main className="relative min-h-screen bg-archive-obsidian px-5 py-8 text-archive-ivory">
        <DesignBackdrop />
        <div className="relative z-10 mx-auto max-w-3xl">
          <Link href="/"><SiteLogo width={160} height={40} /></Link>
          <section className="mt-16 rounded-3xl border border-archive-gold/20 bg-white/[0.035] p-8 shadow-luxury">
            <h1 className="font-serif text-4xl text-archive-ivory">Access Not Available</h1>
            <p className="mt-4 text-sm text-archive-ivory/68">Limited to ADMIN_EMAILS.</p>
          </section>
        </div>
      </main>
    );
  }

  const [campaigns, linksJoined, qrs, conversions] = await Promise.all([
    listCampaigns(),
    listTrackableLinksJoined(),
    listQrCodes(),
    listConversions()
  ]);

  const activeCampaigns = campaigns.filter((c) => c.status === "active");
  const totalBudget = campaigns.reduce((acc, c) => acc + (c.budget || 0), 0);
  const totalClicks = linksJoined.reduce((acc, l) => acc + l.clickCount, 0);
  const siteUrl = getSiteUrl();

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-8 text-archive-ivory sm:px-8">
      <DesignBackdrop />
      <div className="relative z-10 mx-auto max-w-7xl">
        <AdminNav currentPath="/admin/advertising" todayVisitsCount={0} />

        <header className="py-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.28em] text-archive-gold">
                Executive Advertising Command Center
              </p>
              <h1 className="mt-2 font-serif text-4xl leading-tight text-archive-ivory sm:text-5xl">
                Attribution &amp; Campaign Intelligence
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-archive-ivory/70">
                Track ad channels, physical QR code scans, conversion funnels, and marketing performance across Facebook, TikTok, business cards, flyers, and partner channels.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full border border-archive-gold/30 bg-archive-gold/10 px-4 py-2 text-xs font-bold text-archive-gold">
                {activeCampaigns.length} Active Campaigns
              </span>
              <span className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-xs font-bold text-emerald-200">
                {linksJoined.length} Trackable Links
              </span>
            </div>
          </div>
        </header>

        {/* Sub-Navigation Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-archive-gold/15 pb-4">
          {[
            { id: "overview", label: "📊 Overview" },
            { id: "campaigns", label: "📢 Campaigns" },
            { id: "links", label: "🔗 Trackable Links & QRs" },
            { id: "conversions", label: "🎯 Conversions" },
            { id: "comparison", label: "⚖️ Comparison Mode" }
          ].map((tab) => (
            <Link
              key={tab.id}
              href={`/admin/advertising?tab=${tab.id}`}
              className={`rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                currentTab === tab.id
                  ? "bg-archive-gold text-archive-obsidian shadow-soft"
                  : "border border-archive-gold/20 bg-white/[0.03] text-archive-ivory/80 hover:bg-white/[0.08]"
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Overview Tab */}
        {currentTab === "overview" ? (
          <div className="mt-8 grid gap-6">
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-archive-gold/18 bg-[#171511]/80 p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-archive-gold">Active Campaigns</p>
                <p className="mt-2 font-serif text-3xl text-archive-ivory">{activeCampaigns.length}</p>
                <p className="mt-1 text-xs text-archive-ivory/50">Out of {campaigns.length} total campaigns</p>
              </div>
              <div className="rounded-2xl border border-archive-gold/18 bg-[#171511]/80 p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-archive-gold">Tracked Redirect Clicks</p>
                <p className="mt-2 font-serif text-3xl text-archive-ivory">{totalClicks.toLocaleString("en-US")}</p>
                <p className="mt-1 text-xs text-archive-ivory/50">Across {linksJoined.length} trackable links</p>
              </div>
              <div className="rounded-2xl border border-archive-gold/18 bg-[#171511]/80 p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-archive-gold">Generated QR Codes</p>
                <p className="mt-2 font-serif text-3xl text-archive-ivory">{qrs.length}</p>
                <p className="mt-1 text-xs text-archive-ivory/50">Print &amp; engraving ready</p>
              </div>
              <div className="rounded-2xl border border-archive-gold/18 bg-[#171511]/80 p-5">
                <p className="text-[11px] font-bold uppercase tracking-wider text-archive-gold">Total Allocated Budget</p>
                <p className="mt-2 font-serif text-3xl text-archive-ivory">${totalBudget.toLocaleString("en-US")}</p>
                <p className="mt-1 text-xs text-archive-ivory/50">Combined campaign budgets</p>
              </div>
            </section>

            {/* Recent Campaigns Overview */}
            <section className="rounded-3xl border border-archive-gold/18 bg-[#171511]/90 p-6 shadow-luxury">
              <h2 className="font-serif text-2xl text-archive-ivory">Active Campaign Portfolio</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-archive-gold/20 text-archive-gold">
                      <th className="pb-3">CAMPAIGN</th>
                      <th className="pb-3">PLATFORM</th>
                      <th className="pb-3">STATUS</th>
                      <th className="pb-3">BUDGET</th>
                      <th className="pb-3">TYPE</th>
                      <th className="pb-3">DESTINATION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-archive-gold/10 text-archive-ivory/80">
                    {campaigns.map((c) => (
                      <tr key={c.id}>
                        <td className="py-3 font-semibold text-archive-ivory">{c.name}</td>
                        <td className="py-3">{c.platform}</td>
                        <td className="py-3">
                          <span className="rounded-full bg-archive-gold/15 px-2.5 py-0.5 font-bold uppercase tracking-wider text-archive-gold">
                            {c.status}
                          </span>
                        </td>
                        <td className="py-3 font-mono">{c.budget ? `$${c.budget.toLocaleString()}` : "—"}</td>
                        <td className="py-3">{c.isPhysical ? "📦 Physical" : "💻 Digital"}</td>
                        <td className="py-3 font-mono text-archive-champagne">{c.destinationUrl}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : null}

        {/* Campaigns Tab */}
        {currentTab === "campaigns" ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <section className="rounded-3xl border border-archive-gold/20 bg-[#171511]/90 p-6 shadow-luxury lg:col-span-2">
              <h2 className="font-serif text-2xl text-archive-ivory">Advertising Campaigns ({campaigns.length})</h2>
              <div className="mt-4 divide-y divide-archive-gold/10">
                {campaigns.map((c) => (
                  <div key={c.id} className="py-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h3 className="font-serif text-lg text-archive-ivory">{c.name}</h3>
                      <p className="text-xs text-archive-ivory/60">
                        {c.platform} · {c.isPhysical ? "Physical Media" : "Digital Ad"} · Slug: <span className="font-mono text-archive-champagne">/go/{c.slug}</span>
                      </p>
                    </div>
                    <span className="rounded-full border border-archive-gold/30 bg-archive-gold/15 px-3 py-1 font-mono text-xs font-bold text-archive-gold">
                      {c.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Create Campaign Form */}
            <section className="rounded-3xl border border-archive-gold/20 bg-[#171511]/90 p-6 shadow-luxury">
              <h2 className="font-serif text-xl text-archive-ivory">Create New Campaign</h2>
              <form action={createCampaignAction} className="mt-4 grid gap-4 text-xs">
                <label className="grid gap-1">
                  <span className="text-archive-gold">Campaign Name</span>
                  <input name="name" required placeholder="e.g. Facebook Legacy Question Launch" className="rounded-xl border border-archive-gold/25 bg-archive-obsidian px-3 py-2 text-archive-ivory outline-none" />
                </label>
                <label className="grid gap-1">
                  <span className="text-archive-gold">URL Slug</span>
                  <input name="slug" required placeholder="e.g. fb-legacy-launch" className="rounded-xl border border-archive-gold/25 bg-archive-obsidian px-3 py-2 text-archive-ivory outline-none" />
                </label>
                <label className="grid gap-1">
                  <span className="text-archive-gold">Platform</span>
                  <input name="platform" required placeholder="e.g. Facebook, TikTok, Business Card" className="rounded-xl border border-archive-gold/25 bg-archive-obsidian px-3 py-2 text-archive-ivory outline-none" />
                </label>
                <label className="grid gap-1">
                  <span className="text-archive-gold">Destination Path</span>
                  <input name="destinationUrl" defaultValue="/legacy-prologue" className="rounded-xl border border-archive-gold/25 bg-archive-obsidian px-3 py-2 text-archive-ivory outline-none" />
                </label>
                <label className="grid gap-1">
                  <span className="text-archive-gold">Budget ($)</span>
                  <input name="budget" type="number" placeholder="500" className="rounded-xl border border-archive-gold/25 bg-archive-obsidian px-3 py-2 text-archive-ivory outline-none" />
                </label>
                <button type="submit" className="mt-2 rounded-xl bg-archive-gold px-4 py-3 font-bold text-archive-obsidian hover:bg-archive-champagne transition">
                  Create Campaign
                </button>
              </form>
            </section>
          </div>
        ) : null}

        {/* Links & QR Codes Tab */}
        {currentTab === "links" ? (
          <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] items-start">
            <section className="min-w-0">
              <AdminTrackableLinksView
                links={linksJoined}
                campaigns={campaigns}
                siteUrl={siteUrl}
              />
            </section>

            {/* Trackable Link & QR Builder Form */}
            <section className="rounded-3xl border border-archive-gold/20 bg-[#14120e]/95 p-6 shadow-luxury h-fit sticky top-8">
              <h2 className="font-serif text-xl font-semibold text-archive-ivory">Build Trackable Link &amp; QR</h2>
              <p className="mt-1 text-xs text-archive-ivory/60">Generate first-party short URLs (`/go/slug`) and crisp vector QR assets.</p>

              <form action={createTrackableLinkAction} className="mt-4 grid gap-4 text-xs">
                <label className="grid gap-1">
                  <span className="text-archive-gold font-bold">Assign to Campaign</span>
                  <select
                    name="campaignId"
                    className="rounded-xl border border-archive-gold/25 bg-archive-obsidian px-3 py-2.5 text-archive-ivory outline-none focus:border-archive-gold"
                  >
                    <option value="">-- Select Campaign (Optional) --</option>
                    {campaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.platform})
                      </option>
                    ))}
                  </select>
                </label>

                <label className="grid gap-1">
                  <span className="text-archive-gold font-bold">Link Name</span>
                  <input name="linkName" required placeholder="e.g. Canton Funeral Home Flyer QR" className="rounded-xl border border-archive-gold/25 bg-archive-obsidian px-3 py-2.5 text-archive-ivory outline-none focus:border-archive-gold" />
                </label>

                <label className="grid gap-1">
                  <span className="text-archive-gold font-bold">Short URL Slug (/go/slug)</span>
                  <input name="slug" required placeholder="e.g. canton-fh-flyer" className="rounded-xl border border-archive-gold/25 bg-archive-obsidian px-3 py-2.5 text-archive-ivory outline-none focus:border-archive-gold" />
                </label>

                <label className="grid gap-1">
                  <span className="text-archive-gold font-bold">Destination Path</span>
                  <input name="destinationPath" defaultValue="/legacy-prologue" className="rounded-xl border border-archive-gold/25 bg-archive-obsidian px-3 py-2.5 text-archive-ivory outline-none focus:border-archive-gold" />
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <label className="grid gap-1">
                    <span className="text-archive-gold font-bold">UTM Source</span>
                    <input name="utmSource" defaultValue="business_card" className="rounded-xl border border-archive-gold/25 bg-archive-obsidian px-3 py-2.5 text-archive-ivory outline-none focus:border-archive-gold" />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-archive-gold font-bold">UTM Medium</span>
                    <input name="utmMedium" defaultValue="card_qr" className="rounded-xl border border-archive-gold/25 bg-archive-obsidian px-3 py-2.5 text-archive-ivory outline-none focus:border-archive-gold" />
                  </label>
                </div>

                <label className="grid gap-1">
                  <span className="text-archive-gold font-bold">Physical Material Target</span>
                  <input name="tlaMaterial" placeholder="e.g. Black Metal Business Card, Paper Flyer" className="rounded-xl border border-archive-gold/25 bg-archive-obsidian px-3 py-2.5 text-archive-ivory outline-none focus:border-archive-gold" />
                </label>

                <button type="submit" className="mt-2 rounded-xl bg-archive-gold px-4 py-3 font-bold text-archive-obsidian hover:bg-archive-champagne transition shadow-luxury">
                  Generate Short Link &amp; Vector QR
                </button>
              </form>
            </section>
          </div>
        ) : null}

        {/* Conversions Tab */}
        {currentTab === "conversions" ? (
          <div className="mt-8 rounded-3xl border border-archive-gold/20 bg-[#171511]/90 p-6 shadow-luxury">
            <h2 className="font-serif text-2xl text-archive-ivory">Conversion Events ({conversions.length})</h2>
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-archive-gold/20 text-archive-gold">
                    <th className="pb-3">TIMESTAMP</th>
                    <th className="pb-3">CONVERSION TYPE</th>
                    <th className="pb-3">VISITOR ID</th>
                    <th className="pb-3">VALUE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-archive-gold/10 text-archive-ivory/80">
                  {conversions.length > 0 ? (
                    conversions.map((conv) => (
                      <tr key={conv.id}>
                        <td className="py-3 font-mono text-archive-ivory/60">{new Date(conv.createdAt).toLocaleString()}</td>
                        <td className="py-3 font-bold text-emerald-300 uppercase tracking-wider">{conv.conversionType}</td>
                        <td className="py-3 font-mono text-archive-champagne">{conv.visitorId.slice(0, 16)}</td>
                        <td className="py-3 font-mono">{conv.conversionValue ? `$${conv.conversionValue}` : "—"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-6 text-center text-archive-ivory/50">
                        No conversion events recorded yet. Conversions automatically register as visitors complete actions.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {/* Comparison Tab */}
        {currentTab === "comparison" ? (
          <div className="mt-8 rounded-3xl border border-archive-gold/20 bg-[#171511]/90 p-6 shadow-luxury">
            <h2 className="font-serif text-2xl text-archive-ivory">Campaign Comparison Matrix</h2>
            <p className="mt-1 text-xs text-archive-ivory/60">Compare performance metrics across active channels and physical marketing assets.</p>
            <div className="mt-6 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-archive-gold/20 text-archive-gold">
                    <th className="pb-3">CAMPAIGN</th>
                    <th className="pb-3">PLATFORM</th>
                    <th className="pb-3">BUDGET</th>
                    <th className="pb-3">CLICKS</th>
                    <th className="pb-3">TYPE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-archive-gold/10 text-archive-ivory/80">
                  {campaigns.map((c) => (
                    <tr key={c.id}>
                      <td className="py-3 font-bold text-archive-ivory">{c.name}</td>
                      <td className="py-3">{c.platform}</td>
                      <td className="py-3 font-mono">{c.budget ? `$${c.budget.toLocaleString()}` : "Not provided"}</td>
                      <td className="py-3 font-mono text-emerald-300">{c.platformClicks.toLocaleString()}</td>
                      <td className="py-3">{c.isPhysical ? "📦 Physical" : "💻 Digital"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>
    </main>
  );
}
