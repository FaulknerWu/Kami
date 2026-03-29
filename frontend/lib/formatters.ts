function normalizeText(value: string) {
  return value
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]*`/g, " ")
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/[#>*_\-\r\n]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function formatIsoDateLabel(value: string) {
  return value.length >= 10 ? value.slice(0, 10) : value;
}

export function formatMonthDayLabel(value: string) {
  return value.length >= 10 ? value.slice(5, 10) : value;
}

export function formatYearLabel(value: string) {
  return value.length >= 4 ? value.slice(0, 4) : value;
}

export function estimateReadTimeLabel(value: string) {
  const normalizedText = normalizeText(value);
  const minutes = Math.max(1, Math.ceil(normalizedText.length / 55));

  return `${minutes} min read`;
}
