export function getConfiguredAdminEmails() {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

export function isConfiguredAdminEmail(email: string | null | undefined) {
  if (!email) {
    return false;
  }

  return getConfiguredAdminEmails().includes(email.toLowerCase());
}
