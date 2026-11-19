import { useState } from "react";
import { Bookmark } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import MasteryControls from "@/components/shared/MasteryControls";
import SpeakButton from "@/components/shared/SpeakButton";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/cn";

function Field({ label, children, rtl }) {
  if (!children) return null;
  return (
    <div className="space-y-1">
      <div className="text-meta">{label}</div>
      <div dir={rtl ? "rtl" : undefined} className={cn("text-sm leading-relaxed", rtl && "text-base")}>
        {children}
      </div>
    </div>
  );
}

export default function VocabStudyPanel({
  word,
  bookmarked,
  mastery,
  progress,
  onToggleBookmark,
  onRate,
  onUnsuspend,
  onOpenRelated,
  categoryMeta = [],
  showRating = true,
  className,
}) {
  const { t, lang } = useI18n();
  const [now] = useState(() => Date.now());
  if (!word) return null;

  const buryActive = Boolean(progress?.buriedUntil && progress.buriedUntil > now);

  const labelCategory = (id) => {
    const meta = (categoryMeta || []).find((x) => x.id === id);
    if (!meta) return id;
    return lang === "ar" ? meta.labelAr : meta.labelEn;
  };

  return (
    <div className={cn("space-y-5", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-2">
          <h2 className="word-headword">{word.word}</h2>
          <div className="flex flex-wrap gap-1.5">
            {word.pos && <Badge variant="secondary">{word.pos}</Badge>}
            {word.difficulty && <Badge variant="outline">{word.difficulty}</Badge>}
            {word.quality === "draft" && (
              <Badge variant="warning">{t("common.draft")}</Badge>
            )}
            {(word.categories || []).slice(0, 3).map((c) => (
              <Badge key={c} variant="outline">
                {labelCategory(c)}
              </Badge>
            ))}
          </div>
          {word.phonetic ? (
            <p className="text-sm text-muted-foreground">
              {t("vocab.phonetic")}: {word.phonetic}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">{t("vocab.phoneticUnavailable")}</p>
          )}
        </div>
        <div className="flex gap-1">
          <SpeakButton text={word.word} />
          {onToggleBookmark && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-11 w-11"
              aria-label={t("common.bookmark")}
              onClick={onToggleBookmark}
            >
              <Bookmark className={cn("h-4 w-4", bookmarked && "fill-primary text-primary")} />
            </Button>
          )}
        </div>
      </div>

      <Field label={t("vocab.definition")}>{word.definitionEn}</Field>
      <Field label={t("vocab.translation")} rtl>
        {word.translationAr}
      </Field>
      <Field label={t("vocab.explanation")}>
        <span className="text-muted-foreground">{word.explanationEn}</span>
      </Field>
      <Field label={t("vocab.arabicExplanation")} rtl>
        {word.explanationAr}
      </Field>

      {word.exampleEn && (
        <div className="rounded-md border bg-muted/40 p-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-meta">{t("vocab.example")}</div>
            <SpeakButton text={word.exampleEn} labelKey="common.pronounceExample" />
          </div>
          <p className="mt-1 text-sm italic leading-relaxed">{word.exampleEn}</p>
          {word.exampleAr && (
            <p dir="rtl" className="mt-2 text-sm text-muted-foreground">
              {word.exampleAr}
            </p>
          )}
        </div>
      )}

      {(word.synonyms || []).length > 0 && (
        <Field label={t("vocab.synonyms")}>{word.synonyms.join(", ")}</Field>
      )}
      {(word.relatedTerms || []).length > 0 && (
        <Field label={t("vocab.relatedTerms")}>
          <div className="flex flex-wrap gap-1.5">
            {word.relatedTerms.map((term) =>
              onOpenRelated ? (
                <button
                  key={term}
                  type="button"
                  className="rounded-md border px-2 py-1 text-sm text-primary transition-colors hover:bg-primary/10"
                  onClick={() => onOpenRelated(term)}
                >
                  {term}
                </button>
              ) : (
                <span key={term}>{term}</span>
              )
            )}
          </div>
        </Field>
      )}
      {(word.antonyms || []).length > 0 && (
        <Field label={t("vocab.antonyms")}>{word.antonyms.join(", ")}</Field>
      )}
      {(word.collocations || []).length > 0 && (
        <Field label={t("vocab.collocations")}>{word.collocations.join(" · ")}</Field>
      )}
      {(word.wordFamily || []).length > 0 && (
        <Field label={t("vocab.wordFamily")}>{word.wordFamily.join(", ")}</Field>
      )}

      {(progress?.suspended || buryActive) &&
        onUnsuspend && (
          <div className="flex flex-wrap gap-2">
            {progress.suspended && (
              <Badge variant="warning">{t("common.suspend")}</Badge>
            )}
            {buryActive && (
              <Badge variant="outline">{t("common.bury")}</Badge>
            )}
            <Button type="button" variant="outline" className="min-h-11" onClick={onUnsuspend}>
              {t("common.unsuspend")}
            </Button>
          </div>
        )}

      {showRating && onRate && (
        <>
          <Separator />
          <div className="space-y-2">
            <div className="text-meta">{t("vocab.rateOptional")}</div>
            <MasteryControls onRate={onRate} active={mastery} />
          </div>
        </>
      )}
    </div>
  );
}
