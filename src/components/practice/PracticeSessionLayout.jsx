import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n";

export default function PracticeSessionLayout({
  title,
  library,
  index,
  total,
  onExit,
  children,
  hint,
}) {
  const { t } = useI18n();
  const progress = total ? ((index + 1) / total) * 100 : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-section">{title}</h1>
            {library && (
              <Badge
                variant={
                  library === "toefl" ? "toefl" : library === "business" ? "business" : "general"
                }
              >
                {library === "toefl"
                  ? t("vocab.libraryToefl")
                  : library === "business"
                    ? t("vocab.libraryBusiness")
                    : t("vocab.libraryGeneral")}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {index + 1} {t("common.of")} {total} · {t("common.remaining")}: {Math.max(0, total - index - 1)}
          </p>
        </div>
        <Button type="button" variant="ghost" size="icon" aria-label={t("common.exit")} onClick={onExit}>
          <X className="h-5 w-5" />
        </Button>
      </div>
      <Progress value={progress} />
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}
