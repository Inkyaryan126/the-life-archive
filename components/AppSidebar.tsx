import Link from "next/link";
import { signOutAction } from "@/app/login/actions";
import { SiteLogo } from "@/components/SiteDesign";

type AppSidebarProps = {
  active:
    | "dashboard"
    | "settings"
    | "member-card"
    | "keepsakes"
    | "time-capsules"
    | "add-memory"
    | "edit"
    | "qr"
    | "legacy-instructions";
  archiveSlug?: string | null;
  archiveName?: string | null;
  archivePersonName?: string | null;
  showArchiveActions?: boolean;
};

function SidebarLink({
  href,
  label,
  active
}: {
  href: string;
  label: string;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`group flex w-full items-center justify-between border-l-2 px-3 py-3 text-left text-sm font-medium transition sm:text-base ${
        active
          ? "border-archive-gold bg-archive-gold/10 text-archive-gold"
          : "border-transparent text-archive-ivory/76 hover:border-archive-gold/28 hover:bg-white/[0.04] hover:text-archive-ivory"
      }`}
    >
      <span>{label}</span>
      <span className={`h-1.5 w-1.5 rounded-full transition ${active ? "bg-archive-gold" : "bg-archive-ivory/20 group-hover:bg-archive-gold/50"}`} />
    </Link>
  );
}

export function AppSidebar({
  active,
  archiveSlug,
  archiveName,
  archivePersonName,
  showArchiveActions = true
}: AppSidebarProps) {
  const hasArchive = Boolean(archiveSlug);
  const archiveHref = archiveSlug ? `/archive/${archiveSlug}` : "/create";

  return (
    <aside className="no-print hidden lg:block lg:self-stretch">
      <div className="sticky top-6 flex min-h-[calc(100vh-3rem)] flex-col border-r border-archive-gold/14 bg-archive-obsidian/96 px-5 py-6 shadow-[inset_-1px_0_0_rgba(255,255,255,0.03)]">
        <Link href="/dashboard" className="inline-flex w-fit">
          <SiteLogo width={228} height={56} />
        </Link>

        {archiveName ? (
          <div className="mt-5 border-l border-archive-gold/16 bg-white/[0.02] px-4 py-3">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-archive-gold/85">
              Active archive
            </p>
            <p className="mt-2 font-serif text-xl leading-tight text-archive-ivory xl:text-[1.7rem]">
              {archiveName}
            </p>
            {archivePersonName ? (
              <p className="mt-1 text-sm text-archive-ivory/56">
                {archivePersonName}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mt-6 grid gap-1.5">
          <p className="px-3 text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-archive-gold/72">
            Main
          </p>
          <SidebarLink href="/dashboard" label="My Archives" active={active === "dashboard"} />
          <SidebarLink href="/dashboard/settings" label="Profile Settings" active={active === "settings"} />
          <SidebarLink href="/dashboard/time-capsules" label="Time Capsules" active={active === "time-capsules"} />
          <SidebarLink href="/member-card" label="Member Card" active={active === "member-card"} />
          <SidebarLink href="/keepsakes" label="Keepsake Store" active={active === "keepsakes"} />
        </div>

        <div className="mt-6 grid gap-1.5 border-t border-archive-gold/12 pt-6">
          <p className="px-3 text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-archive-gold/72">
            Preserve
          </p>
          {showArchiveActions && hasArchive ? (
            <>
              <SidebarLink
                href={`${archiveHref}/add-memory`}
                label="Add Memory"
                active={active === "add-memory"}
              />
              <SidebarLink href={`${archiveHref}/qr`} label="QR Keepsake" active={active === "qr"} />
              <SidebarLink href={`${archiveHref}/legacy-instructions`} label="Legacy Instructions" active={active === "legacy-instructions"} />
              <SidebarLink href={`${archiveHref}/edit`} label="Edit Archive" active={active === "edit"} />
              <SidebarLink href={archiveHref} label="Share Archive" active={false} />
            </>
          ) : (
            <div className="border-l border-archive-gold/14 bg-white/[0.02] px-4 py-3 text-sm leading-7 text-archive-ivory/62">
              Create an archive to unlock memory, QR, and legacy tools.
            </div>
          )}
        </div>

        <div className="mt-auto grid gap-2 border-t border-archive-gold/12 pt-6">
          <Link
            href="/create"
            className="inline-flex w-full items-center justify-center rounded-full bg-archive-gold px-4 py-3 text-sm font-bold text-archive-obsidian transition hover:bg-archive-champagne sm:text-base"
          >
            Create Another Archive
          </Link>
          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full border-l border-archive-gold/16 px-3 py-3 text-left text-sm font-medium text-archive-ivory/74 transition hover:bg-white/[0.04] hover:text-archive-ivory sm:text-base"
            >
              Sign Out
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
