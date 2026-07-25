import assert from "node:assert/strict";
import { verifyCronAuthorization } from "../lib/time-capsule-cron-auth";

const testSecret = "secret_1234567890abcdef";

{
  // 1. Missing CRON_SECRET
  const req = new Request("https://example.com/api/cron/time-capsules", {
    headers: { authorization: `Bearer ${testSecret}` }
  });
  const res = verifyCronAuthorization(req, {});
  assert.equal(res.status, "missing_secret");
  assert.equal(res.httpStatus, 500);
  assert.equal(res.logEvent.event, "time_capsule_cron_missing_secret");
  assert.equal(res.logEvent.stage, "auth");
  assert.equal(res.logEvent.status, 500);
  assert.ok(res.logEvent.timestamp);
}

{
  // 2. Empty CRON_SECRET
  const req = new Request("https://example.com/api/cron/time-capsules", {
    headers: { authorization: `Bearer ${testSecret}` }
  });
  const res = verifyCronAuthorization(req, { CRON_SECRET: "" });
  assert.equal(res.status, "missing_secret");
  assert.equal(res.httpStatus, 500);
}

{
  // 3. Whitespace-only CRON_SECRET
  const req = new Request("https://example.com/api/cron/time-capsules", {
    headers: { authorization: `Bearer ${testSecret}` }
  });
  const res = verifyCronAuthorization(req, { CRON_SECRET: "   \t\n  " });
  assert.equal(res.status, "missing_secret");
  assert.equal(res.httpStatus, 500);
}

{
  // 4. Missing Authorization header
  const req = new Request("https://example.com/api/cron/time-capsules");
  const res = verifyCronAuthorization(req, { CRON_SECRET: testSecret });
  assert.equal(res.status, "unauthorized");
  assert.equal(res.httpStatus, 401);
  assert.equal(res.logEvent.event, "time_capsule_cron_unauthorized");
  assert.equal(res.logEvent.stage, "auth");
  assert.equal(res.logEvent.status, 401);
}

{
  // 5. Malformed authorization schemes
  for (const header of ["Basic 12345", "Token 12345", "Bearer", "bearer " + testSecret]) {
    const req = new Request("https://example.com/api/cron/time-capsules", {
      headers: { authorization: header }
    });
    const res = verifyCronAuthorization(req, { CRON_SECRET: testSecret });
    assert.equal(res.status, "unauthorized");
    assert.equal(res.httpStatus, 401);
  }
}

{
  // 6. Empty Bearer token
  const req = new Request("https://example.com/api/cron/time-capsules", {
    headers: { authorization: "Bearer " }
  });
  const res = verifyCronAuthorization(req, { CRON_SECRET: testSecret });
  assert.equal(res.status, "unauthorized");
  assert.equal(res.httpStatus, 401);
}

{
  // 7. Incorrect same-length token
  const wrongToken = "secret_1234567890abcdeg";
  const req = new Request("https://example.com/api/cron/time-capsules", {
    headers: { authorization: `Bearer ${wrongToken}` }
  });
  const res = verifyCronAuthorization(req, { CRON_SECRET: testSecret });
  assert.equal(res.status, "unauthorized");
  assert.equal(res.httpStatus, 401);
}

{
  // 8. Incorrect different-length token without throwing
  const wrongShortToken = "short";
  const req = new Request("https://example.com/api/cron/time-capsules", {
    headers: { authorization: `Bearer ${wrongShortToken}` }
  });
  assert.doesNotThrow(() => {
    const res = verifyCronAuthorization(req, { CRON_SECRET: testSecret });
    assert.equal(res.status, "unauthorized");
    assert.equal(res.httpStatus, 401);
  });
}

{
  // 9. Valid authorization
  const req = new Request("https://example.com/api/cron/time-capsules", {
    headers: { authorization: `Bearer ${testSecret}` }
  });
  const res = verifyCronAuthorization(req, { CRON_SECRET: testSecret });
  assert.equal(res.status, "authorized");
}

{
  // 10. Log safety verification: verify log objects exclude sensitive tokens or secrets
  const req = new Request("https://example.com/api/cron/time-capsules", {
    headers: { authorization: `Bearer wrong_token` }
  });
  const res = verifyCronAuthorization(req, { CRON_SECRET: testSecret });
  if (res.status === "unauthorized") {
    const logStr = JSON.stringify(res.logEvent);
    assert.doesNotMatch(logStr, new RegExp(testSecret));
    assert.doesNotMatch(logStr, /wrong_token/);
    assert.doesNotMatch(logStr, /authorization/i);
  }
}

console.log("time-capsule-cron-health tests passed cleanly!");
