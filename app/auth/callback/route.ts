import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const defaultNextPath = "/dashboard?welcome=starter";

function getSafeNextPath(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//")
    ? value
    : defaultNextPath;
}

function getLoginRedirect(origin: string, next: string, message: string) {
  const url = new URL("/login", origin);
  url.searchParams.set("error", message);
  url.searchParams.set("link", "expired");
  url.searchParams.set("next", next);

  return url;
}

function logCallbackFailure(input: {
  reason: string;
  error?: { message?: string; code?: string; status?: number } | null;
  hasCode: boolean;
  hasTokenHash: boolean;
  type: string | null;
}) {
  console.error("auth_callback_failed", {
    reason: input.reason,
    errorCode: input.error?.code ?? null,
    errorStatus: input.error?.status ?? null,
    errorMessage: input.error?.message ?? null,
    hasCode: input.hasCode,
    hasTokenHash: input.hasTokenHash,
    type: input.type
  });
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash =
    searchParams.get("token_hash") || searchParams.get("token");
  const type = searchParams.get("type");
  const next = getSafeNextPath(searchParams.get("next"));
  const supabase = await createClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    logCallbackFailure({
      reason: "code_exchange_failed",
      error,
      hasCode: true,
      hasTokenHash: Boolean(tokenHash),
      type
    });
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as "signup" | "invite" | "magiclink" | "recovery" | "email"
    });

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }

    logCallbackFailure({
      reason: "token_hash_verify_failed",
      error,
      hasCode: Boolean(code),
      hasTokenHash: true,
      type
    });
  } else {
    logCallbackFailure({
      reason: "missing_supported_auth_params",
      hasCode: Boolean(code),
      hasTokenHash: Boolean(tokenHash),
      type
    });
  }

  return NextResponse.redirect(
    getLoginRedirect(
      origin,
      next,
      "That secure link expired or was already used. Enter your email to request a fresh sign-in link."
    )
  );
}
