"use client";

import { useEffect, useMemo, useState } from "react";
import { useFormState } from "react-dom";
import { Temporal } from "@js-temporal/polyfill";
import { FormButton } from "@/components/auth/FormButton";
import {
  initialTimeCapsuleActionState,
  type TimeCapsuleActionState
} from "@/app/dashboard/time-capsules/state";
import {
  formatTimeCapsuleLocalDate,
  getMemoryOptionLabel,
  type TimeCapsuleArchiveOption
} from "@/app/dashboard/time-capsules/utils";
import { prettifyType } from "@/lib/format";
import type { FormEvent } from "react";

export type TimeCapsuleFormValues = {
  archiveId: string;
  memoryId: string;
  recipientName: string;
  recipientEmail: string;
  personalNote: string;
  timezone: string;
  localDate: string;
};

type TimeCapsuleFormAction = (
  state: TimeCapsuleActionState,
  formData: FormData
) => Promise<TimeCapsuleActionState>;

type TimeCapsuleScheduleFormProps = {
  action: TimeCapsuleFormAction;
  archives: TimeCapsuleArchiveOption[];
  initialValues: TimeCapsuleFormValues;
  deliveryId?: string;
  mode: "create" | "edit";
  submitLabel: string;
  submitPendingLabel: string;
  memorySummary?: {
    date: string | null;
    title: string;
    type: string;
  };
  archiveSummary?: {
    archiveName: string;
    personName: string;
  };
  showArchiveSelector?: boolean;
};

type PreviewState =
  | { kind: "ready"; message: string }
  | { kind: "needs-input"; message: string }
  | { kind: "invalid"; message: string };

const fallbackTimezones = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Australia/Sydney"
];

function getTimezoneOptions(): string[] {
  const supportedValuesOf = (Intl as typeof Intl & {
    supportedValuesOf?: (key: "timeZone") => string[];
  }).supportedValuesOf;

  if (typeof supportedValuesOf === "function") {
    return supportedValuesOf.call(Intl, "timeZone");
  }

  return fallbackTimezones;
}

function parseDateParts(localDate: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(localDate.trim());

  if (!match) {
    return null;
  }

  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3])
  };
}

function getPreview(
  localDate: string,
  timezone: string
): PreviewState {
  if (!localDate || !timezone) {
    return {
      kind: "needs-input",
      message: "Choose a date and timezone to preview the delivery."
    };
  }

  const dateParts = parseDateParts(localDate);

  if (!dateParts) {
    return {
      kind: "invalid",
      message: "Choose a valid delivery date."
    };
  }

  try {
    const zonedDateTime = Temporal.ZonedDateTime.from(
      {
        timeZone: timezone,
        ...dateParts,
        hour: 9,
        minute: 0,
        second: 0,
        millisecond: 0,
        microsecond: 0,
        nanosecond: 0
      },
      { disambiguation: "reject" }
    );
    const display = formatTimeCapsuleLocalDate(
      zonedDateTime.toInstant().toString(),
      timezone
    );

    return {
      kind: "ready",
      message: `Scheduled for ${display}`
    };
  } catch {
    return {
      kind: "invalid",
      message: "Choose a valid delivery date and timezone."
    };
  }
}

function getClientValidationError(
  localDate: string,
  timezone: string
) {
  const dateParts = parseDateParts(localDate);

  if (!dateParts || !timezone) {
    return null;
  }

  try {
    const selectedDate = Temporal.PlainDate.from(dateParts);
    const earliestDeliveryDate = Temporal.Now.zonedDateTimeISO(timezone)
      .toPlainDate()
      .add({ days: 1 });

    if (Temporal.PlainDate.compare(selectedDate, earliestDeliveryDate) < 0) {
      return "Choose a future delivery date.";
    }

    return null;
  } catch {
    return "Choose a valid delivery date and timezone.";
  }
}

function FieldError({ message }: { message?: string | null }) {
  if (!message) {
    return null;
  }

  return <p className="text-sm leading-6 text-red-100">{message}</p>;
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-archive-gold">
      {children}
    </p>
  );
}

export function TimeCapsuleScheduleForm({
  action,
  archives,
  initialValues,
  deliveryId,
  mode,
  submitLabel,
  submitPendingLabel,
  archiveSummary,
  memorySummary,
  showArchiveSelector = true
}: TimeCapsuleScheduleFormProps) {
  const [state, formAction] = useFormState(action, initialTimeCapsuleActionState);
  const [archiveId, setArchiveId] = useState(initialValues.archiveId);
  const [memoryId, setMemoryId] = useState(initialValues.memoryId);
  const [recipientName, setRecipientName] = useState(initialValues.recipientName);
  const [recipientEmail, setRecipientEmail] = useState(initialValues.recipientEmail);
  const [personalNote, setPersonalNote] = useState(initialValues.personalNote);
  const [timezone, setTimezone] = useState(initialValues.timezone);
  const [localDate, setLocalDate] = useState(initialValues.localDate);
  const [clientError, setClientError] = useState("");

  const timezoneOptions = useMemo(() => getTimezoneOptions(), []);
  const selectedArchive = archives.find((archive) => archive.id === archiveId) ?? archives[0] ?? null;
  const archiveHasManyChoices = showArchiveSelector && archives.length > 1;
  const selectedMemory =
    selectedArchive?.memories.find((memory) => memory.id === memoryId) ?? selectedArchive?.memories[0] ?? null;
  const preview = useMemo(
    () => getPreview(localDate, timezone),
    [localDate, timezone]
  );
  const formError = clientError || state.formError;

  useEffect(() => {
    if (!timezone) {
      const browserTimezone =
        typeof window !== "undefined"
          ? window.Intl?.DateTimeFormat?.().resolvedOptions().timeZone ?? ""
          : "";

      if (browserTimezone && timezoneOptions.includes(browserTimezone)) {
        setTimezone(browserTimezone);
      }
    }
  }, [timezone, timezoneOptions]);

  useEffect(() => {
    if (!archiveHasManyChoices || !selectedArchive) {
      return;
    }

    if (!selectedArchive.memories.some((memory) => memory.id === memoryId)) {
      setMemoryId(selectedArchive.memories[0]?.id ?? "");
    }
  }, [archiveHasManyChoices, memoryId, selectedArchive]);

  useEffect(() => {
    setClientError("");
  }, [
    archiveId,
    memoryId,
    recipientName,
    recipientEmail,
    personalNote,
    timezone,
    localDate
  ]);

  const showCreateSelection = mode === "create";
  const hasArchiveOptions = archives.length > 0;
  const hasMemoryOptions = Boolean(selectedArchive?.memories.length);
  const canSubmit = mode === "edit" || Boolean(selectedMemory);
  const recipientStepLabel =
    mode === "create" ? "2. Who should receive it?" : "1. Who should receive it?";
  const scheduleStepLabel =
    mode === "create" ? "3. When should it arrive?" : "2. When should it arrive?";
  const noteStepLabel =
    mode === "create" ? "4. Add a personal note" : "3. Add a personal note";
  const reviewStepLabel =
    mode === "create" ? "5. Review and schedule" : "4. Review and schedule";

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const clientValidationError = getClientValidationError(
      localDate,
      timezone
    );

    if (clientValidationError) {
      event.preventDefault();
      setClientError(clientValidationError);
    }
  }

  return (
    <form
      action={formAction}
      onSubmit={handleSubmit}
      className="grid gap-6 rounded-[2rem] border border-archive-gold/18 bg-white/[0.035] p-6 shadow-luxury sm:p-8"
    >
      {mode === "edit" && deliveryId ? (
        <input type="hidden" name="deliveryId" value={deliveryId} />
      ) : null}

      {formError ? (
        <div
          role="alert"
          className="rounded-2xl border border-red-300/20 bg-red-400/10 px-4 py-4 text-red-100"
        >
          <p className="font-serif text-2xl leading-tight text-red-50">
            {mode === "create"
              ? "We couldn’t schedule this delivery"
              : "We couldn’t save this Time Capsule"}
          </p>
          <p className="mt-2 text-sm leading-6">{formError}</p>
        </div>
      ) : null}

      {mode === "edit" && archiveSummary && memorySummary ? (
        <div className="grid gap-3 rounded-2xl border border-archive-gold/14 bg-archive-obsidian/38 p-4 sm:grid-cols-2">
          <div>
            <SectionLabel>Archive</SectionLabel>
            <p className="mt-2 font-serif text-xl text-archive-ivory">
              {archiveSummary.archiveName}
            </p>
            <p className="mt-1 text-sm text-archive-ivory/60">
              {archiveSummary.personName}
            </p>
          </div>
          <div>
            <SectionLabel>Selected memory</SectionLabel>
            <p className="mt-2 font-serif text-xl text-archive-ivory">
              {memorySummary.title}
            </p>
            <p className="mt-1 text-sm text-archive-ivory/60">
              {prettifyType(memorySummary.type)}{memorySummary.date ? ` · ${memorySummary.date}` : ""}
            </p>
          </div>
        </div>
      ) : null}

      {showCreateSelection ? (
        <section className="grid gap-4">
          <SectionLabel>1. Choose a memory</SectionLabel>
          {hasArchiveOptions ? (
            <>
              {archiveHasManyChoices ? (
                <label className="grid gap-2">
                  <span className="text-sm font-semibold text-archive-ivory">
                    Archive
                  </span>
                  <select
                    name="archiveId"
                    value={archiveId}
                    onChange={(event) => setArchiveId(event.target.value)}
                    className="rounded-2xl border border-archive-gold/20 bg-archive-obsidian px-4 py-3 text-archive-ivory outline-none transition focus:border-archive-gold"
                  >
                    {archives.map((archive) => (
                      <option key={archive.id} value={archive.id} className="bg-archive-obsidian">
                        {archive.archiveName} · {archive.personName}
                      </option>
                    ))}
                  </select>
                  <FieldError message={state.fieldErrors.archiveId} />
                </label>
              ) : (
                <input type="hidden" name="archiveId" value={selectedArchive?.id ?? ""} />
              )}

              <label className="grid gap-2">
                <span className="text-sm font-semibold text-archive-ivory">
                  Memory
                </span>
                {hasMemoryOptions ? (
                  <>
                    <select
                      name="memoryId"
                      value={memoryId}
                      onChange={(event) => setMemoryId(event.target.value)}
                      className="rounded-2xl border border-archive-gold/20 bg-archive-obsidian px-4 py-3 text-archive-ivory outline-none transition focus:border-archive-gold"
                    >
                      {selectedArchive?.memories.map((memory) => (
                        <option key={memory.id} value={memory.id} className="bg-archive-obsidian">
                          {getMemoryOptionLabel(memory)}
                        </option>
                      ))}
                    </select>
                    <FieldError message={state.fieldErrors.memoryId} />
                  </>
                ) : (
                  <>
                    <div className="rounded-2xl border border-archive-gold/14 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-archive-ivory/64">
                      This archive does not have a memory to schedule yet. Add one first, then return here.
                    </div>
                    <FieldError message={state.fieldErrors.memoryId} />
                  </>
                )}
              </label>

              {selectedMemory ? (
                <div className="rounded-2xl border border-archive-gold/12 bg-archive-obsidian/42 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold">
                    Selected
                  </p>
                  <p className="mt-2 text-sm leading-6 text-archive-ivory/72">
                    {getMemoryOptionLabel(selectedMemory)}
                  </p>
                </div>
              ) : null}
            </>
          ) : (
            <div className="rounded-2xl border border-archive-gold/14 bg-white/[0.03] px-4 py-4 text-sm leading-7 text-archive-ivory/64">
              You need at least one archive with at least one memory before you can schedule a Time Capsule.
            </div>
          )}
        </section>
      ) : null}

      <section className="grid gap-4">
        <SectionLabel>{recipientStepLabel}</SectionLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-semibold text-archive-ivory">
              Recipient name
            </span>
            <input
              name="recipientName"
              required
              maxLength={120}
              value={recipientName}
              onChange={(event) => setRecipientName(event.target.value)}
              className="rounded-2xl border border-archive-gold/20 bg-archive-obsidian px-4 py-3 text-archive-ivory outline-none transition placeholder:text-archive-ivory/36 focus:border-archive-gold"
              placeholder="Ava"
            />
            <FieldError message={state.fieldErrors.recipientName} />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-archive-ivory">
              Recipient email
            </span>
            <input
              name="recipientEmail"
              type="email"
              required
              maxLength={320}
              value={recipientEmail}
              onChange={(event) => setRecipientEmail(event.target.value)}
              className="rounded-2xl border border-archive-gold/20 bg-archive-obsidian px-4 py-3 text-archive-ivory outline-none transition placeholder:text-archive-ivory/36 focus:border-archive-gold"
              placeholder="ava@example.com"
            />
            <FieldError message={state.fieldErrors.recipientEmail} />
          </label>
        </div>
      </section>

      <section className="grid gap-4">
        <SectionLabel>{scheduleStepLabel}</SectionLabel>
        <p className="text-sm leading-6 text-archive-ivory/62">
          Choose the day this memory should arrive.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 sm:col-span-1">
            <span className="text-sm font-semibold text-archive-ivory">
              Delivery date
            </span>
            <input
              name="localDate"
              type="date"
              required
              value={localDate}
              onChange={(event) => setLocalDate(event.target.value)}
              className="rounded-2xl border border-archive-gold/20 bg-archive-obsidian px-4 py-3 text-archive-ivory outline-none transition focus:border-archive-gold"
            />
            <FieldError message={state.fieldErrors.localDate} />
            <span className="text-sm leading-6 text-archive-ivory/58">
              We’ll deliver this memory on the selected day.
            </span>
          </label>

          <label className="grid gap-2 sm:col-span-1">
            <span className="text-sm font-semibold text-archive-ivory">
              Timezone
            </span>
            <input
              name="timezone"
              list="timezones"
              required
              maxLength={100}
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
              className="rounded-2xl border border-archive-gold/20 bg-archive-obsidian px-4 py-3 text-archive-ivory outline-none transition placeholder:text-archive-ivory/36 focus:border-archive-gold"
              placeholder="America/New_York"
            />
            <datalist id="timezones">
              {timezoneOptions.map((value: string) => (
                <option key={value} value={value} />
              ))}
            </datalist>
            <FieldError message={state.fieldErrors.timezone} />
          </label>
        </div>
        <p className="text-sm leading-6 text-archive-ivory/60">
          Use an IANA timezone like <span className="text-archive-ivory">America/New_York</span>. We use that timezone to interpret the selected calendar date.
        </p>
      </section>

      <section className="grid gap-4">
        <SectionLabel>{noteStepLabel}</SectionLabel>
        <label className="grid gap-2">
          <span className="text-sm font-semibold text-archive-ivory">
            Optional note
          </span>
          <textarea
            name="personalNote"
            maxLength={500}
            rows={5}
            value={personalNote}
            onChange={(event) => setPersonalNote(event.target.value)}
            className="min-h-[10rem] rounded-2xl border border-archive-gold/20 bg-archive-obsidian px-4 py-3 text-archive-ivory outline-none transition placeholder:text-archive-ivory/36 focus:border-archive-gold"
            placeholder="A short message to include when this memory reaches them."
          />
          <FieldError message={state.fieldErrors.personalNote} />
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-archive-gold/72">
            {personalNote.length}/500
          </span>
        </label>
      </section>

      <section className="grid gap-4">
        <SectionLabel>{reviewStepLabel}</SectionLabel>
        <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-2xl border border-archive-gold/14 bg-archive-obsidian/40 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold">
              Preview
            </p>
            <p className="mt-3 font-serif text-2xl leading-tight text-archive-ivory">
              {preview.message}
            </p>
            {preview.kind === "invalid" ? (
              <p className="mt-3 text-sm leading-6 text-red-100">
                The delivery date will be checked again before we save it.
              </p>
            ) : null}
            {personalNote ? (
              <div className="mt-4 rounded-2xl border border-archive-gold/12 bg-white/[0.03] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-archive-gold">
                  Personal note
                </p>
                <p className="mt-2 whitespace-pre-line text-sm leading-7 text-archive-ivory/70">
                  {personalNote}
                </p>
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-archive-gold/14 bg-white/[0.03] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-archive-gold">
              Ready when you are
            </p>
            <p className="mt-3 text-sm leading-7 text-archive-ivory/66">
              {mode === "create"
                ? "We’ll confirm the archive, memory, details, and delivery date before anything is sent."
                : "We’ll save your changes and keep the delivery pending for the updated date."}
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <FormButton
                pendingText={submitPendingLabel}
                disabled={!canSubmit}
                className="rounded-full bg-archive-gold px-6 py-3 text-sm font-bold text-archive-obsidian transition hover:bg-archive-champagne disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitLabel}
              </FormButton>
            </div>
          </div>
        </div>
      </section>
    </form>
  );
}
