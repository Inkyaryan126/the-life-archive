import { formatMemoryDate, prettifyType } from "@/lib/format";
import type { MemoryType } from "@/lib/types";

export type TimeCapsuleMemoryOption = {
  id: string;
  title: string;
  type: MemoryType;
  date: string | null;
};

export type TimeCapsuleArchiveOption = {
  id: string;
  slug: string;
  archiveName: string;
  personName: string;
  memories: TimeCapsuleMemoryOption[];
};

export function formatTimeCapsuleLocalDate(
  scheduledFor: string,
  timezone: string
) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: timezone
  }).format(new Date(scheduledFor));
}

export function formatTimeCapsuleCreatedAt(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function getTimeCapsuleStatusLabel(status: string) {
  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function getTimeCapsuleStatusTone(status: string) {
  if (status === "delivered") {
    return "border-emerald-300/30 bg-emerald-300/10 text-emerald-100";
  }

  if (status === "processing") {
    return "border-amber-300/30 bg-amber-300/10 text-amber-100";
  }

  if (status === "failed") {
    return "border-red-300/30 bg-red-400/10 text-red-100";
  }

  if (status === "canceled") {
    return "border-white/12 bg-white/[0.03] text-archive-ivory/60";
  }

  return "border-archive-gold/24 bg-archive-gold/10 text-archive-champagne";
}

export function getMemoryOptionLabel(option: TimeCapsuleMemoryOption) {
  const parts = [option.title || `${prettifyType(option.type)} memory`];

  parts.push(prettifyType(option.type));

  if (option.date) {
    parts.push(formatMemoryDate(option.date));
  }

  return parts.join(" · ");
}
