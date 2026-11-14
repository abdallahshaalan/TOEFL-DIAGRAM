export const CHART_COLORS = {
  1: "hsl(var(--chart-1))",
  2: "hsl(var(--chart-2))",
  3: "hsl(var(--chart-3))",
  4: "hsl(var(--chart-4))",
  5: "hsl(var(--chart-5))",
};

export function formatChartDate(isoDate, lang = "en") {
  try {
    const d = new Date(`${isoDate}T12:00:00`);
    return new Intl.DateTimeFormat(lang === "ar" ? "ar" : "en", {
      month: "short",
      day: "numeric",
    }).format(d);
  } catch {
    return isoDate?.slice(5) || isoDate;
  }
}
