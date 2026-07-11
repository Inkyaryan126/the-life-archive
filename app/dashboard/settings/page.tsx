import Link from "next/link";
import { redirect } from "next/navigation";
import { DesignBackdrop, SiteLogo } from "@/components/SiteDesign";
import { AppSidebar } from "@/components/AppSidebar";
import { SuccessMessage } from "@/components/SuccessMessage";
import {
  changePasswordAction,
  saveProfileAction
} from "@/app/dashboard/settings/actions";
import { getAccountContext } from "@/lib/account";
import { FormButton } from "@/components/auth/FormButton";
import { PasswordFields } from "@/components/auth/PasswordFields";
import { signOutAction } from "@/app/login/actions";

export const dynamic = "force-dynamic";

function formatInitials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "A";
}

export default async function DashboardSettingsPage({
  searchParams
}: {
  searchParams?: Promise<{ error?: string; success?: string }>;
}) {
  const params = await searchParams;
  const account = await getAccountContext();

  if (!account.user) {
    redirect("/login?next=%2Fdashboard%2Fsettings");
  }

  const profile = account.profile;
  const displayNameValue = profile?.displayName ?? "";
  const bioValue = profile?.bio ?? "";
  const avatarLabel = account.user.displayName || "Archive Member";
  const initials = formatInitials(avatarLabel);

  return (
    <main className="relative min-h-screen overflow-hidden bg-archive-obsidian px-5 py-6 text-archive-ivory sm:px-8 sm:py-8">
      <DesignBackdrop />

      <div className="relative z-10 mx-auto w-full max-w-[96rem] lg:grid lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-8">
        <AppSidebar
          active="settings"
          archiveSlug={account.defaultArchive?.slug ?? null}
          archiveName={account.defaultArchive?.archiveName ?? null}
          archivePersonName={account.defaultArchive?.personName ?? null}
          showArchiveActions={Boolean(account.defaultArchive?.slug)}
        />

        <div className="min-w-0">
          <nav className="relative z-10 flex flex-col gap-4 border-b border-archive-gold/20 pb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6 lg:hidden">
            <Link href="/" className="block">
              <SiteLogo width={240} height={60} />
            </Link>
            <div className="flex flex-wrap items-center gap-4 sm:justify-end sm:gap-6">
              <Link href="/dashboard" className="text-sm font-semibold text-archive-ivory/80 transition hover:text-archive-gold sm:text-base">
                My Archives
              </Link>
              <Link href="/dashboard/settings" className="text-sm font-semibold text-archive-gold sm:text-base">
                Profile Settings
              </Link>
            </div>
          </nav>

          <div className="pb-20 pt-10 sm:pt-14">
            {params?.success === "saved" ? (
              <SuccessMessage
                eyebrow="Profile saved"
                message="Your display name and bio are up to date."
              />
            ) : null}
            {params?.success === "password-updated" ? (
              <SuccessMessage
                eyebrow="Password updated"
                message="Your new password is active now."
              />
            ) : null}

            {params?.error ? (
              <p className="mb-8 rounded-2xl border border-red-300/20 bg-red-400/10 p-4 text-sm leading-6 text-red-100">
                {params.error}
              </p>
            ) : null}

            <header className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-archive-gold">
                  Account
                </p>
                <h1 className="mt-4 font-serif text-4xl font-bold leading-tight text-archive-ivory sm:text-6xl">
                  Profile Settings
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-archive-ivory/64 sm:text-lg sm:leading-8">
                  Add the name and short bio you want to use inside The Life Archive. This does not block your archives or your starter archive.
                </p>
              </div>
              <div className="rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 shadow-luxury sm:p-7">
                <div className="flex items-center gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border border-archive-gold/22 bg-archive-gold/10 font-serif text-2xl text-archive-gold">
                    {initials}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-archive-gold">
                      Signed in as
                    </p>
                    <p className="mt-2 font-serif text-2xl text-archive-ivory">
                      {account.user.displayName}
                    </p>
                    <p className="mt-1 text-sm text-archive-ivory/60">
                      {account.user.email}
                    </p>
                  </div>
                </div>
              </div>
            </header>

            <section className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 shadow-luxury sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-archive-gold">
                  Account snapshot
                </p>
                <div className="mt-5 grid gap-4">
                  <div className="rounded-2xl border border-archive-gold/12 bg-archive-obsidian/40 px-5 py-4">
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-archive-gold/85">
                      Email
                    </p>
                    <p className="mt-2 break-all text-sm leading-6 text-archive-ivory/78">
                      {account.user.email}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-archive-gold/12 bg-archive-obsidian/40 px-5 py-4">
                    <p className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-archive-gold/85">
                      Avatar
                    </p>
                    <p className="mt-2 text-sm leading-6 text-archive-ivory/64">
                      Avatar uploads are not enabled yet. Your initials are used for now.
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href="/dashboard"
                    className="rounded-full border border-archive-gold/28 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08]"
                  >
                    Back to My Archives
                  </Link>
                </div>
              </div>

              <form
                action={saveProfileAction}
                className="rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 shadow-luxury sm:p-8"
              >
                <input type="hidden" name="next" value="/dashboard/settings" />
                <div className="grid gap-5">
                  <label className="grid gap-2">
                    <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-archive-gold">
                      Display name
                    </span>
                    <input
                      name="displayName"
                      defaultValue={displayNameValue}
                      maxLength={60}
                      placeholder="What should we call you?"
                      className="rounded-2xl border border-archive-gold/20 bg-archive-obsidian px-4 py-3 text-base text-archive-ivory outline-none transition placeholder:text-archive-ivory/36 focus:border-archive-gold"
                    />
                  </label>

                  <label className="grid gap-2">
                    <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-archive-gold">
                      Short bio
                    </span>
                    <textarea
                      name="bio"
                      defaultValue={bioValue}
                      maxLength={300}
                      rows={5}
                      placeholder="A short note that helps your archive feel like yours."
                      className="min-h-[9rem] rounded-2xl border border-archive-gold/20 bg-archive-obsidian px-4 py-3 text-base leading-7 text-archive-ivory outline-none transition placeholder:text-archive-ivory/36 focus:border-archive-gold"
                    />
                  </label>

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <FormButton
                      pendingText="Saving profile..."
                      className="rounded-full bg-archive-gold px-6 py-3 text-sm font-bold text-archive-obsidian transition hover:bg-archive-champagne disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      Save Profile
                    </FormButton>
                    <Link
                      href="/dashboard"
                      className="text-sm font-semibold text-archive-champagne underline-offset-4 hover:underline"
                    >
                      Cancel
                    </Link>
                  </div>
                </div>
              </form>
            </section>

            <section className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 shadow-luxury sm:p-8">
                <p className="text-sm font-semibold uppercase tracking-[0.22em] text-archive-gold">
                  Sign out
                </p>
                <p className="mt-4 text-sm leading-6 text-archive-ivory/64">
                  Sign out from this device when you are finished.
                </p>
                <form action={signOutAction} className="mt-5">
                  <FormButton
                    pendingText="Signing out..."
                    className="rounded-full border border-archive-gold/28 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-archive-ivory transition hover:border-archive-gold hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Sign Out
                  </FormButton>
                </form>
              </div>

              <form
                action={changePasswordAction}
                className="rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 shadow-luxury sm:p-8"
              >
                <input type="hidden" name="next" value="/dashboard/settings" />
                <div className="grid gap-5">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-archive-gold">
                      Password
                    </p>
                    <p className="mt-2 text-sm leading-6 text-archive-ivory/64">
                      Change your password while you are signed in.
                    </p>
                  </div>
                  <PasswordFields
                    passwordName="newPassword"
                    confirmName="confirmPassword"
                    passwordLabel="New password"
                    confirmLabel="Confirm new password"
                    passwordPlaceholder="Create a new password"
                    confirmPlaceholder="Confirm your new password"
                    autoComplete="new-password"
                    confirmAutoComplete="new-password"
                  />
                  <FormButton
                    pendingText="Updating password..."
                    className="rounded-full bg-archive-gold px-6 py-3 text-sm font-bold text-archive-obsidian transition hover:bg-archive-champagne disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Change Password
                  </FormButton>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
