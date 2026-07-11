import "server-only";

type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

function getFromEmail() {
  const from = process.env.TLA_FROM_EMAIL?.trim();

  if (!from) {
    throw new Error("TLA_FROM_EMAIL is not configured.");
  }

  return from;
}

function getResendApiKey() {
  const apiKey = process.env.RESEND_API_KEY?.trim();

  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured.");
  }

  return apiKey;
}

export async function sendEmail(input: SendEmailInput) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getResendApiKey()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: getFromEmail(),
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text
    })
  });

  let body: { id?: string; message?: string; name?: string };

  try {
    body = (await response.json()) as {
      id?: string;
      message?: string;
      name?: string;
    };
  } catch {
    body = {};
  }

  if (!response.ok) {
    let message = `Resend email failed with status ${response.status}.`;

    message = body.message || body.name || message;

    throw new Error(message);
  }

  if (!body.id) {
    throw new Error("Resend did not return a message id.");
  }

  return {
    id: body.id
  };
}
