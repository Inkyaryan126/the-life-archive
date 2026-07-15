import assert from "node:assert/strict";
import { Temporal } from "@js-temporal/polyfill";
import {
  convertLocalDeliveryDateToUtc,
  parseTimeCapsuleTimeParts,
  TimeCapsuleDomainError
} from "../lib/time-capsule-scheduling";

function assertDomainError(error: unknown, code: string) {
  assert.ok(error instanceof TimeCapsuleDomainError);
  assert.equal(error.code, code);
}

function getFutureDateParts(timezone: string) {
  const future = Temporal.Now.zonedDateTimeISO(timezone).add({ days: 2 });

  return {
    localDate: future.toPlainDate().toString(),
    localTime: "09:30",
    timezone
  };
}

{
  const result = convertLocalDeliveryDateToUtc(
    getFutureDateParts("America/New_York")
  );

  assert.equal(result.timezone, "America/New_York");
  assert.ok(result.scheduledFor.endsWith("Z"));
  assert.equal(
    Temporal.Instant.compare(
      Temporal.Instant.from(result.scheduledFor),
      Temporal.Now.instant()
    ),
    1
  );
}

{
  const timezone = "UTC";
  const past = Temporal.Now.zonedDateTimeISO(timezone).subtract({ minutes: 5 });

  assert.throws(
    () =>
      convertLocalDeliveryDateToUtc({
        localDate: past.toPlainDate().toString(),
        localTime: past.toPlainTime().toString({ smallestUnit: "minute" }),
        timezone
      }),
    (error) => {
      assertDomainError(error, "delivery_date_not_future");
      return true;
    }
  );
}

{
  assert.deepEqual(parseTimeCapsuleTimeParts("23:59"), {
    hour: 23,
    minute: 59
  });

  assert.throws(
    () => parseTimeCapsuleTimeParts("24:00"),
    (error) => {
      assertDomainError(error, "invalid_delivery_time");
      return true;
    }
  );
}

console.log("time-capsule-scheduling tests passed");
