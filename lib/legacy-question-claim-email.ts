import "server-only";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildLegacyQuestionClaimEmail(input: {
  archiveName: string;
  displayName: string;
  claimUrl: string;
  expiresAt: string;
}) {
  const subject = "Your Life Archive starter archive is ready";
  const greeting = input.displayName === "Your" ? "Hello" : `Hello ${input.displayName}`;
  const escapedGreeting = escapeHtml(greeting);
  const escapedArchiveName = escapeHtml(input.archiveName);
  const escapedClaimUrl = escapeHtml(input.claimUrl);
  const escapedExpiresAt = escapeHtml(input.expiresAt);

  const text = `${greeting},

Your first memory has been preserved in The Life Archive.

Your starter archive, ${input.archiveName}, is waiting for you. Use the local claim link below to finish signing in and continue building it with more stories, photos, songs, lessons, videos, and voice notes.

${input.claimUrl}

This claim link expires on ${input.expiresAt}.

This is a starter archive, not a finished archive. You can keep adding to it over time.

The Life Archive`;

  const html = `<!doctype html>
<html>
  <body style="margin:0;background:#11100e;color:#211912;font-family:Georgia,'Times New Roman',serif;">
    <div style="max-width:640px;margin:0 auto;background:#f8f1e7;padding:36px 28px;">
      <p style="margin:0 0 14px;color:#8e6b2f;font:700 12px Arial,sans-serif;letter-spacing:0.16em;text-transform:uppercase;">The Life Archive</p>
      <h1 style="margin:0 0 18px;color:#211912;font-size:34px;line-height:1.1;">Your starter archive is ready.</h1>
      <p style="margin:0 0 18px;color:#5f554a;font:16px/1.7 Arial,sans-serif;">${escapedGreeting},</p>
      <p style="margin:0 0 18px;color:#5f554a;font:16px/1.7 Arial,sans-serif;">Your starter archive, <strong>${escapedArchiveName}</strong>, is waiting for you. Use the local claim link below to finish signing in and continue building it with more stories, photos, songs, lessons, videos, and voice notes.</p>
      <p style="margin:28px 0;">
        <a href="${escapedClaimUrl}" style="display:inline-block;background:#c9a45c;color:#11100e;text-decoration:none;border-radius:999px;padding:14px 22px;font:700 15px Arial,sans-serif;">Claim My Archive</a>
      </p>
      <p style="margin:0 0 18px;color:#5f554a;font:14px/1.7 Arial,sans-serif;">This claim link expires on ${escapedExpiresAt}.</p>
      <p style="margin:0 0 18px;color:#5f554a;font:14px/1.7 Arial,sans-serif;">This is a starter archive, not a finished archive. You can keep adding to it over time.</p>
      <p style="margin:28px 0 0;color:#8e6b2f;font:700 12px Arial,sans-serif;letter-spacing:0.16em;text-transform:uppercase;">Preserve the voice, stories, and memories that should not disappear.</p>
    </div>
  </body>
</html>`;

  return { subject, text, html };
}
