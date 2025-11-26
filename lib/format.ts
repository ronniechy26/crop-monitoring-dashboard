export function formatMonthLabel(key: string) {
  if (!key) return "";
  const [year, month] = key.split("-");
  const date = new Date(Number(year), Number(month) - 1);
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

export function formatPercentage(value: number) {
  return `${(value * 100).toFixed(0)}%`;
}

export function formatYield(value: number) {
  return `${value.toFixed(1)} t/ha`;
}

export function formatRelativeTime(date?: Date | null) {
  if (!date) return "—";
  const diffMs = Date.now() - date.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  if (Math.abs(diffMinutes) < 60) {
    return `${Math.max(diffMinutes, 0)}m ago`;
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return `${Math.max(diffHours, 0)}h ago`;
  }
  const diffDays = Math.round(diffHours / 24);
  return `${Math.max(diffDays, 0)}d ago`;
}
