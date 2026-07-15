export type TimeCapsuleFieldName =
  | "archiveId"
  | "memoryId"
  | "recipientName"
  | "recipientEmail"
  | "personalNote"
  | "timezone"
  | "localDate"
  | "localTime";

export type TimeCapsuleActionState = {
  fieldErrors: Partial<Record<TimeCapsuleFieldName, string>>;
  formError: string | null;
};

export const initialTimeCapsuleActionState: TimeCapsuleActionState = {
  fieldErrors: {},
  formError: null
};
