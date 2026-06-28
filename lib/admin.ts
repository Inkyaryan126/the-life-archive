import "server-only";

import { getAccountContext } from "@/lib/account";

function getAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export async function getAdminAccess() {
  const account = await getAccountContext();
  const email = account.user?.email.toLowerCase() ?? null;
  const adminEmails = getAdminEmails();

  return {
    account,
    isAdmin: Boolean(email && adminEmails.includes(email)),
    adminEmailsConfigured: adminEmails.length > 0
  };
}
