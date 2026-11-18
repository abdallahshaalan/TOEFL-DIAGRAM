import { Bookmark, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import SpeakButton from "@/components/shared/SpeakButton";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/cn";

function masteryVariant(mastery) {
  if (!mastery) return "outline";
  if (mastery <= 2) return "warning";
  if (mastery === 3) return "secondary";
  return "success";
}

function masteryLabel(mastery, t) {
  if (!mastery) return t("common.new");
  if (mastery <= 2) return t("common.struggling");
  if (mastery === 3) return t("ratings.good");
  return t("common.mastered");
}

export default function VocabListItem({
  word,
  bookmarked,
  mastery,
  onSelect,
  onToggleBookmark,
}) {
  const { t } = useI18n();

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect?.();
        }
      }}
      className={cn(
        "group flex items-center gap-3 px-3 py-2.5 text-start transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <span dir="ltr" className="word-headword !text-lg md:!text-xl">
            {word.word}
          </span>
          {word.pos && (
            <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
              {word.pos}
            </Badge>
          )}
          {word.difficulty && (
            <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
              {word.difficulty}
            </Badge>
          )}
          <Badge variant={masteryVariant(mastery)} className="h-5 px-1.5 text-[10px]">
            {masteryLabel(mastery, t)}
          </Badge>
          {word.quality === "draft" && (
            <Badge variant="warning" className="h-5 px-1.5 text-[10px]">
              {t("common.draft")}
            </Badge>
          )}
        </div>
        <p className="mt-0.5 truncate text-sm text-muted-foreground">
          {word.definitionEn || word.exampleEn || word.translationAr}
        </p>
        {word.translationAr && (
          <p dir="rtl" className="truncate text-sm text-foreground/80">
            {word.translationAr}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
        <SpeakButton text={word.word} className="h-10 w-10" />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          aria-label={t("common.bookmark")}
          onClick={onToggleBookmark}
        >
          <Bookmark className={cn("h-4 w-4", bookmarked && "fill-primary text-primary")} />
        </Button>
        <ChevronRight className="h-4 w-4 text-muted-foreground rtl:rotate-180" aria-hidden />
      </div>
    </div>
  );
}
