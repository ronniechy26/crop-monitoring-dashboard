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
