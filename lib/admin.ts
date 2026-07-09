import "server-only";

import { getAccountContext } from "@/lib/account";
import {
  getConfiguredAdminEmails,
  isConfiguredAdminEmail
} from "@/lib/admin-emails";

export async function getAdminAccess() {
  const account = await getAccountContext();
  const email = account.user?.email ?? null;
  const adminEmails = getConfiguredAdminEmails();

  return {
    account,
    isAdmin: isConfiguredAdminEmail(email),
    adminEmailsConfigured: adminEmails.length > 0
  };
}
