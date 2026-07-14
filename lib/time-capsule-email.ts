import "server-only";

import { sendEmail } from "@/lib/resend-email";
import type { PreparedTimeCapsuleDelivery } from "@/lib/time-capsules";

type TimeCapsuleEmailInput = {
  delivery: PreparedTimeCapsuleDelivery;
  deliveryUrl: string;
};

type TimeCapsuleEmailSuccess = {
  accepted: true;
  resendEmailId: string;
};

type TimeCapsuleEmailFailure = {
  accepted: false;
  errorCode: string;
  errorMessage: string;
};

export type TimeCapsuleEmailResult =
  | TimeCapsuleEmailSuccess
  | TimeCapsuleEmailFailure;

const fallbackSenderName = "The Life Archive";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeDisplayValue(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() || "";
}

function getSenderName(delivery: PreparedTimeCapsuleDelivery) {
  return (
    normalizeDisplayValue(delivery.ownerDisplayName) ||
    normalizeDisplayValue(delivery.archive.personName) ||
    normalizeDisplayValue(delivery.archive.name) ||
    fallbackSenderName
  );
}

function getArchiveIdentity(delivery: PreparedTimeCapsuleDelivery) {
  const archiveName = normalizeDisplayValue(delivery.archive.name);
  const personName = normalizeDisplayValue(delivery.archive.personName);

  if (archiveName && personName && archiveName !== personName) {
    return `${archiveName} - ${personName}`;
  }

  return archiveName || personName || fallbackSenderName;
}

function safeSubjectName(value: string) {
  return value.replace(/[\r\n]+/g, " ").slice(0, 120);
}

function formatNoteHtml(value: string) {
  return escapeHtml(value).replace(/\r\n|\r|\n/g, "<br>");
}

function sanitizeErrorMessage(error: unknown) {
  const message =
    error instanceof Error ? error.message : "Time capsule email was rejected.";

  return message
    .replace(/https?:\/\/\S+/g, "[url]")
    .replace(/[A-Za-z0-9+/=_-]{48,}/g, "[redacted]")
    .slice(0, 300);
}

function getEmailErrorCode(error: unknown) {
  if (error instanceof DOMException && error.name === "AbortError") {
    return "resend_timeout";
  }

  return "resend_rejected";
}

export function buildTimeCapsuleDeliveryEmail(input: TimeCapsuleEmailInput) {
  const senderName = getSenderName(input.delivery);
  const archiveIdentity = getArchiveIdentity(input.delivery);
  const memoryTitle =
    normalizeDisplayValue(input.delivery.memory.title) || "Untitled memory";
  const personalNote = input.delivery.personalNote?.trim() || "";
  const subject = `A memory from ${safeSubjectName(senderName)} is waiting for you`;
  const escapedSenderName = escapeHtml(senderName);
  const escapedArchiveIdentity = escapeHtml(archiveIdentity);
  const escapedMemoryTitle = escapeHtml(memoryTitle);
  const escapedDeliveryUrl = escapeHtml(input.deliveryUrl);
  const noteHtml = personalNote
    ? `
      <tr>
        <td style="padding:18px 0 0;">
          <p style="margin:0 0 8px;color:#9f8555;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">A note for you</p>
          <p style="margin:0;color:#eee5d2;font-size:15px;line-height:1.7;">${formatNoteHtml(personalNote)}</p>
        </td>
      </tr>`
    : "";

  const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeHtml(subject)}</title>
  </head>
  <body style="margin:0;background:#11100e;color:#eee5d2;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#11100e;padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;border:1px solid rgba(198,161,91,0.28);background:#171511;border-radius:18px;">
            <tr>
              <td style="padding:30px 28px;">
                <p style="margin:0 0 18px;color:#c6a15b;font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;">The Life Archive</p>
                <h1 style="margin:0;color:#f5eddc;font-family:Georgia,Times,serif;font-size:32px;line-height:1.18;font-weight:400;">A memory has been scheduled for you</h1>
                <p style="margin:18px 0 0;color:#cfc4ad;font-size:16px;line-height:1.7;">${escapedSenderName} prepared a memory for you through The Life Archive.</p>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:22px;border-top:1px solid rgba(198,161,91,0.22);border-bottom:1px solid rgba(198,161,91,0.22);">
                  <tr>
                    <td style="padding:18px 0;">
                      <p style="margin:0 0 8px;color:#9f8555;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">From</p>
                      <p style="margin:0;color:#eee5d2;font-size:16px;line-height:1.6;">${escapedArchiveIdentity}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:0 0 18px;">
                      <p style="margin:0 0 8px;color:#9f8555;font-size:12px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;">Memory</p>
                      <p style="margin:0;color:#eee5d2;font-size:18px;line-height:1.5;">${escapedMemoryTitle}</p>
                    </td>
                  </tr>
                </table>
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">${noteHtml}</table>

                <p style="margin:28px 0 0;">
                  <a href="${escapedDeliveryUrl}" style="display:inline-block;border-radius:999px;background:#c6a15b;color:#11100e;font-size:14px;font-weight:700;line-height:1;text-decoration:none;padding:14px 22px;">View the memory</a>
                </p>
                <p style="margin:22px 0 0;color:#a89f8c;font-size:13px;line-height:1.7;">This memory was prepared in advance through The Life Archive.</p>
                <p style="margin:18px 0 0;color:#7f7668;font-size:12px;line-height:1.6;">thelifearchive.vip</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

  const textLines = [
    "The Life Archive",
    "",
    "A memory has been scheduled for you",
    "",
    `${senderName} prepared a memory for you through The Life Archive.`,
    "",
    `From: ${archiveIdentity}`,
    `Memory: ${memoryTitle}`,
    ...(personalNote ? ["", "A note for you:", personalNote] : []),
    "",
    `View the memory: ${input.deliveryUrl}`,
    "",
    "This memory was prepared in advance through The Life Archive.",
    "thelifearchive.vip"
  ];

  return {
    subject,
    html,
    text: textLines.join("\n")
  };
}

export async function sendTimeCapsuleDeliveryEmail(
  input: TimeCapsuleEmailInput
): Promise<TimeCapsuleEmailResult> {
  const email = buildTimeCapsuleDeliveryEmail(input);

  try {
    const result = await sendEmail({
      to: input.delivery.recipientEmail,
      ...email
    });

    return {
      accepted: true,
      resendEmailId: result.id
    };
  } catch (error) {
    return {
      accepted: false,
      errorCode: getEmailErrorCode(error),
      errorMessage: sanitizeErrorMessage(error)
    };
  }
}
