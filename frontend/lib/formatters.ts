export function formatIsoDateLabel(value: string) {
  return value.length >= 10 ? value.slice(0, 10) : value;
}

export function formatMonthDayLabel(value: string) {
  return value.length >= 10 ? value.slice(5, 10) : value;
}

export function formatYearLabel(value: string) {
  return value.length >= 4 ? value.slice(0, 4) : value;
}

export function formatReadTimeLabel(value: number) {
  const minutes = Number.isFinite(value) ? Math.max(1, Math.trunc(value)) : 1;
  return `${minutes} min read`;
}
