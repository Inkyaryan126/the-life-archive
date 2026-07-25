import "server-only";

import { getAccountContext } from "@/lib/account";
import {
  getConfiguredAdminEmails,
  isConfiguredAdminEmail
} from "@/lib/admin-emails";

export async function getAdminAccess() {
  try {
    const account = await getAccountContext();
    const email = account.user?.email ?? null;
    const adminEmails = getConfiguredAdminEmails();

    return {
      account,
      isAdmin: isConfiguredAdminEmail(email),
      adminEmailsConfigured: adminEmails.length > 0
    };
  } catch (error) {
    console.error("Unable to verify admin access:", error);
    return {
      account: {
        isConfigured: false,
        user: null,
        profile: null,
        archives: [],
        defaultArchive: null,
        archive: null,
        archiveLookupFailed: true,
        prologuePart3Eligible: false
      },
      isAdmin: false,
      adminEmailsConfigured: false
    };
  }
}
