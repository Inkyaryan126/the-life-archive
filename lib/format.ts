export function formatMemoryDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${value}T00:00:00`));
}

export function prettifyType(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
