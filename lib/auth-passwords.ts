const weakPasswords = new Set([
  "password",
  "password1",
  "password123",
  "qwerty123",
  "qwerty1234",
  "1234567890",
  "letmein123",
  "welcome123",
  "iloveyou123",
  "changeme123"
]);

export type PasswordValidationResult =
  | { ok: true; value: string }
  | { ok: false; message: string };

export function validatePassword(value: string): PasswordValidationResult {
  const password = value;

  if (password.length < 10) {
    return {
      ok: false,
      message: "Password must be at least 10 characters long."
    };
  }

  if (password.length > 128) {
    return {
      ok: false,
      message: "Password must be 128 characters or fewer."
    };
  }

  if (!/[a-z]/.test(password)) {
    return {
      ok: false,
      message: "Password must include at least one lowercase letter."
    };
  }

  if (!/[A-Z]/.test(password)) {
    return {
      ok: false,
      message: "Password must include at least one uppercase letter."
    };
  }

  if (!/[0-9]/.test(password)) {
    return {
      ok: false,
      message: "Password must include at least one number."
    };
  }

  if (weakPasswords.has(password.toLowerCase())) {
    return {
      ok: false,
      message: "Choose a less common password."
    };
  }

  return { ok: true, value: password };
}

export function validatePasswordConfirmation(
  password: string,
  confirmation: string
): PasswordValidationResult {
  if (password !== confirmation) {
    return {
      ok: false,
      message: "Passwords do not match."
    };
  }

  return validatePassword(password);
}

export function maskEmailAddress(email: string) {
  const trimmedEmail = email.trim();
  const [localPart, domainPart] = trimmedEmail.split("@");

  if (!localPart || !domainPart) {
    return trimmedEmail;
  }

  const visibleLocalPart =
    localPart.length <= 2
      ? `${localPart[0] ?? ""}*`
      : `${localPart.slice(0, 1)}${"*".repeat(Math.min(6, localPart.length - 1))}`;

  return `${visibleLocalPart}@${domainPart}`;
}
