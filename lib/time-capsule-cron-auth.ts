import { timingSafeEqual } from "crypto";

export type CronAuthResult =
  | { status: "authorized" }
  | {
      status: "missing_secret";
      httpStatus: 500;
      errorResponse: { error: "Server misconfigured" };
      logEvent: {
        event: "time_capsule_cron_missing_secret";
        stage: "auth";
        status: 500;
        timestamp: string;
      };
    }
  | {
      status: "unauthorized";
      httpStatus: 401;
      errorResponse: { error: "Unauthorized" };
      logEvent: {
        event: "time_capsule_cron_unauthorized";
        stage: "auth";
        status: 401;
        timestamp: string;
      };
    };

export function verifyCronAuthorization(
  request: Request,
  env: Record<string, string | undefined> = process.env,
  now = new Date()
): CronAuthResult {
  const cronSecret = env.CRON_SECRET;
  const timestamp = now.toISOString();

  if (!cronSecret || !cronSecret.trim()) {
    return {
      status: "missing_secret",
      httpStatus: 500,
      errorResponse: { error: "Server misconfigured" },
      logEvent: {
        event: "time_capsule_cron_missing_secret",
        stage: "auth",
        status: 500,
        timestamp
      }
    };
  }

  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      status: "unauthorized",
      httpStatus: 401,
      errorResponse: { error: "Unauthorized" },
      logEvent: {
        event: "time_capsule_cron_unauthorized",
        stage: "auth",
        status: 401,
        timestamp
      }
    };
  }

  const token = authHeader.slice(7);
  const tokenBuffer = Buffer.from(token);
  const secretBuffer = Buffer.from(cronSecret);

  if (
    tokenBuffer.length !== secretBuffer.length ||
    !timingSafeEqual(tokenBuffer, secretBuffer)
  ) {
    return {
      status: "unauthorized",
      httpStatus: 401,
      errorResponse: { error: "Unauthorized" },
      logEvent: {
        event: "time_capsule_cron_unauthorized",
        stage: "auth",
        status: 401,
        timestamp
      }
    };
  }

  return { status: "authorized" };
}
