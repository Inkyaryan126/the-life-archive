import { Temporal } from "@js-temporal/polyfill";

export type ScheduleDeliveryDateInput = {
  localDate: string;
  localTime: string;
  timezone: string;
};

const maxTimezoneLength = 100;

export class TimeCapsuleDomainError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "TimeCapsuleDomainError";
    this.code = code;
  }
}

export function parseTimeCapsuleDateParts(localDate: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(localDate.trim());

  if (!match) {
    throw new TimeCapsuleDomainError(
      "invalid_delivery_date",
      "Enter a valid delivery date."
    );
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3])
  };
}

export function parseTimeCapsuleTimeParts(localTime: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(localTime.trim());

  if (!match) {
    throw new TimeCapsuleDomainError(
      "invalid_delivery_time",
      "Enter a valid delivery time."
    );
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  if (hour > 23 || minute > 59) {
    throw new TimeCapsuleDomainError(
      "invalid_delivery_time",
      "Enter a valid delivery time."
    );
  }

  return {
    hour,
    minute
  };
}

export function convertLocalDeliveryDateToUtc(input: ScheduleDeliveryDateInput) {
  const timezone = input.timezone.trim();

  if (!timezone || timezone.length > maxTimezoneLength) {
    throw new TimeCapsuleDomainError(
      "invalid_timezone",
      "Choose a valid timezone."
    );
  }

  try {
    const dateParts = parseTimeCapsuleDateParts(input.localDate);
    const timeParts = parseTimeCapsuleTimeParts(input.localTime);

    const zonedDateTime = Temporal.ZonedDateTime.from(
      {
        timeZone: timezone,
        ...dateParts,
        ...timeParts,
        second: 0,
        millisecond: 0,
        microsecond: 0,
        nanosecond: 0
      },
      { disambiguation: "reject" }
    );
    const instant = zonedDateTime.toInstant();

    if (Temporal.Instant.compare(instant, Temporal.Now.instant()) <= 0) {
      throw new TimeCapsuleDomainError(
        "delivery_date_not_future",
        "Choose a future delivery date and time."
      );
    }

    return {
      scheduledFor: instant.toString(),
      timezone
    };
  } catch (error) {
    if (error instanceof TimeCapsuleDomainError) {
      throw error;
    }

    throw new TimeCapsuleDomainError(
      "invalid_local_delivery_time",
      "Choose a valid delivery date, time, and timezone."
    );
  }
}
