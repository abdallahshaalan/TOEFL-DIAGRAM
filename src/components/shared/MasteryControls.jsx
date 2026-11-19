import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/cn";

const RATINGS = [
  { key: "again", value: 1, className: "border-destructive/40 text-destructive hover:bg-destructive/10" },
  { key: "hard", value: 2, className: "border-warning/40 text-warning hover:bg-warning/10" },
  { key: "good", value: 3, className: "border-primary/40 text-primary hover:bg-accent" },
  { key: "easy", value: 4, className: "border-success/40 text-success hover:bg-success/10" },
];

export default function MasteryControls({ onRate, active, className, disabled }) {
  const { t } = useI18n();

  return (
    <div className={cn("grid grid-cols-2 gap-2 sm:grid-cols-4", className)}>
      {RATINGS.map((r) => (
        <Button
          key={r.key}
          type="button"
          variant={active === r.value ? "default" : "outline"}
          size="sm"
          disabled={disabled}
          className={cn("min-h-11", active !== r.value && r.className)}
          title={t(`ratings.${r.key}Hint`)}
          onClick={() => onRate?.(r.value)}
        >
          <span className="me-1 hidden text-[10px] opacity-60 sm:inline">{r.value}</span>
          {t(`ratings.${r.key}`)}
        </Button>
      ))}
    </div>
  );
}

export function masteryStatusKey(mastery) {
  if (!mastery) return "new";
  if (mastery <= 2) return "difficult";
  if (mastery === 3) return "good";
  return "easy";
}
