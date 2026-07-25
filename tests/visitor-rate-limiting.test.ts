import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  buildRateLimitCheckItems,
  computeAudioDigest,
  computeDuplicateFingerprint,
  computeHmac,
  determineSignalType,
  evaluateLegacyQuestionRateLimits,
  extractClientIp,
  normalizeTextContent
} from "../lib/rate-limit";

const secret = "test_rate_limit_hash_secret_12345";

{
  // 1. computeHmac determinism & normalization
  const hash1 = computeHmac("User@Example.com ", secret);
  const hash2 = computeHmac("user@example.com", secret);
  assert.equal(hash1, hash2);
  assert.equal(hash1.length, 64);
}

{
  // 2. normalizeTextContent whitespace & case compression
  const text1 = "  Hello   World!\nThis is   a test.  ";
  const text2 = "hello world! this is a test.";
  assert.equal(normalizeTextContent(text1), text2);
}

{
  // 3. Audio byte hashing vs filename independence
  const audioContent = Buffer.from("RIFF1234WAVEfmt 16bit pcm audio sample bytes...");
  const audioFileA = new File([audioContent], "recording-1.webm", { type: "audio/webm" });
  const audioFileB = new File([audioContent], "different-name.webm", { type: "audio/webm" });

  const differentAudioContent = Buffer.from("RIFF5678WAVEfmt DIFFERENT audio sample bytes!");
  const audioFileC = new File([differentAudioContent], "recording-1.webm", { type: "audio/webm" });

  Promise.all([
    computeAudioDigest(audioFileA),
    computeAudioDigest(audioFileB),
    computeAudioDigest(audioFileC),
    computeDuplicateFingerprint({ email: "test@example.com", entryType: "voice", audioFile: audioFileA, secret }),
    computeDuplicateFingerprint({ email: "test@example.com", entryType: "voice", audioFile: audioFileB, secret }),
    computeDuplicateFingerprint({ email: "test@example.com", entryType: "voice", audioFile: audioFileC, secret })
  ]).then(([digestA, digestB, digestC, dupA, dupB, dupC]) => {
    // Identical audio bytes with different filenames produce identical digests & duplicate fingerprints
    assert.equal(digestA, digestB);
    assert.equal(dupA, dupB);

    // Different audio bytes with identical filenames produce different digests & different fingerprints
    assert.notEqual(digestA, digestC);
    assert.notEqual(dupA, dupC);
  });
}

{
  // 4. Equivalent normalized text submissions produce identical duplicate fingerprints
  const input1 = {
    email: "User@Example.com ",
    entryType: "text",
    textContent: "  Remembering   our summer trips to the   mountains.  ",
    secret
  };
  const input2 = {
    email: "user@example.com",
    entryType: "text",
    textContent: "remembering our summer trips to the mountains.",
    secret
  };

  Promise.all([
    computeDuplicateFingerprint(input1),
    computeDuplicateFingerprint(input2)
  ]).then(([fp1, fp2]) => {
    assert.equal(fp1, fp2);
  });
}

{
  // 5. extractClientIp header parsing
  const headersForwarded = new Headers({ "x-forwarded-for": "203.0.113.195, 70.41.3.18" });
  assert.equal(extractClientIp(headersForwarded), "203.0.113.195");

  const headersReal = new Headers({ "x-real-ip": "198.51.100.42" });
  assert.equal(extractClientIp(headersReal), "198.51.100.42");

  const headersEmpty = new Headers({});
  assert.equal(extractClientIp(headersEmpty), "127.0.0.1");
}

{
  // 6. buildRateLimitCheckItems threshold structure without card batch
  const input = {
    clientIp: "203.0.113.195",
    visitorId: "vis_12345",
    email: "user@example.com",
    cardBatch: null,
    entryType: "text",
    textContent: "A memorable story shared here.",
    audioFile: null
  };

  buildRateLimitCheckItems(input, secret).then(({ checks }) => {
    assert.equal(checks.length, 7);

    const visBurst = checks.find((c) => c.action_type === "burst" && c.rate_key.startsWith("vis:"));
    assert.equal(visBurst?.max_requests, 3);
    assert.equal(visBurst?.window_seconds, 60);

    const ipBurst = checks.find((c) => c.action_type === "burst" && c.rate_key.startsWith("ip:"));
    assert.equal(ipBurst?.max_requests, 12);
    assert.equal(ipBurst?.window_seconds, 60);

    const visDaily = checks.find((c) => c.action_type === "daily" && c.rate_key.startsWith("vis:"));
    assert.equal(visDaily?.max_requests, 10);
    assert.equal(visDaily?.window_seconds, 86400);

    const ipDaily = checks.find((c) => c.action_type === "daily" && c.rate_key.startsWith("ip:"));
    assert.equal(ipDaily?.max_requests, 75);
    assert.equal(ipDaily?.window_seconds, 86400);

    const emailSentQuota = checks.find((c) => c.action_type === "email_sent");
    assert.equal(emailSentQuota?.max_requests, 3);
    assert.equal(emailSentQuota?.window_seconds, 86400);

    const rejectedAttempts = checks.find((c) => c.action_type === "rejected");
    assert.equal(rejectedAttempts?.max_requests, 30);
    assert.equal(rejectedAttempts?.window_seconds, 600);

    const duplicateCheck = checks.find((c) => c.action_type === "duplicate");
    assert.equal(duplicateCheck?.max_requests, 1);
    assert.equal(duplicateCheck?.window_seconds, 300);
  });
}

{
  // 7. buildRateLimitCheckItems with card batch
  const input = {
    clientIp: "203.0.113.195",
    visitorId: "vis_12345",
    email: "user@example.com",
    cardBatch: "CARD-BATCH-999",
    entryType: "text",
    textContent: "A memorable story shared here.",
    audioFile: null
  };

  buildRateLimitCheckItems(input, secret).then(({ checks }) => {
    assert.equal(checks.length, 9);

    const card1h = checks.find((c) => c.action_type === "card_1h");
    assert.equal(card1h?.max_requests, 50);
    assert.equal(card1h?.window_seconds, 3600);

    const card24h = checks.find((c) => c.action_type === "card_24h");
    assert.equal(card24h?.max_requests, 150);
    assert.equal(card24h?.window_seconds, 86400);
  });
}

{
  // 8. Fail-closed when RATE_LIMIT_HASH_SECRET is missing
  const originalEnv = process.env.RATE_LIMIT_HASH_SECRET;
  delete process.env.RATE_LIMIT_HASH_SECRET;

  evaluateLegacyQuestionRateLimits({
    clientIp: "127.0.0.1",
    visitorId: null,
    email: "test@example.com",
    cardBatch: null,
    entryType: "text",
    textContent: "Hello world",
    audioFile: null
  }).then((res) => {
    assert.equal(res.allowed, false);
    assert.equal(res.reason, "Server misconfigured");
    process.env.RATE_LIMIT_HASH_SECRET = originalEnv;
  });
}

{
  // 9. determineSignalType key mapping
  assert.equal(determineSignalType("vis:12345"), "visitor_id");
  assert.equal(determineSignalType("ip:12345"), "ip_hash");
  assert.equal(determineSignalType("email:12345"), "email_hash");
  assert.equal(determineSignalType("card:12345"), "card_batch");
  assert.equal(determineSignalType("dup:12345"), "duplicate_submission");
  assert.equal(determineSignalType(null), "unknown");
}

{
  // 10. Migration SQL security and 7-day retention assertions
  const sql = readFileSync(
    "supabase/migrations/20260725180000_create_visitor_rate_limits.sql",
    "utf8"
  );
  assert.match(sql, /create table if not exists public\.visitor_rate_limit_events/);
  assert.match(sql, /create or replace function public\.check_and_record_visitor_rate_limits/);
  assert.match(sql, /security definer/);
  assert.match(sql, /set search_path = public, pg_temp/);
  assert.match(sql, /interval '7 days'/);
  assert.match(sql, /revoke all on function public\.check_and_record_visitor_rate_limits\(jsonb\) from public, anon, authenticated/);
  assert.match(sql, /grant execute on function public\.check_and_record_visitor_rate_limits\(jsonb\) to service_role/);
}

console.log("visitor-rate-limiting verification tests passed cleanly!");
