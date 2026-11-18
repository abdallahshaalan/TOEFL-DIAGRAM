import { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, ChevronUp } from "lucide-react";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { LIBRARY_DAILY_GOAL } from "@/lib/db";
import { buildPracticeUrl, buildReviewUrl } from "@/lib/practiceUrl";
import { getExamPacks } from "@/lib/examPacks";
import { cn } from "@/lib/cn";

export default function LibraryCoachPanel({
  library,
  todayCount = 0,
  streak = 0,
  summary,
  categoryOverview = [],
  weakAreas = [],
  activeCategory = "",
  onSelectCategory,
  onDifficultyPath,
  hasDifficulty = false,
}) {
  const { t, lang } = useI18n();
  const [toolsOpen, setToolsOpen] = useState(false);
  const packs = getExamPacks(library);
  const goalPct = Math.min(100, Math.round((todayCount / LIBRARY_DAILY_GOAL) * 100));
  const isBusiness = library === "business";
  const overviewTitle = isBusiness
    ? t("vocab.categoryOverviewBusiness")
    : t("vocab.categoryOverview");
  const overviewHint = isBusiness
    ? t("vocab.categoryOverviewHintBusiness")
    : t("vocab.categoryOverviewHint");

  if (!summary) return null;

  return (
    <div className="space-y-3">
      <section className="space-y-3 rounded-xl border bg-card p-4">
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="text-meta">{t("vocab.dailyGoal")}</div>
            <div className="text-lg font-semibold tabular-nums">
              {todayCount} {t("vocab.goalOf")} {LIBRARY_DAILY_GOAL}
            </div>
            <Progress value={goalPct} className="mt-2 h-1.5" />
          </div>
          <div>
            <div className="text-meta">
              {isBusiness ? t("vocab.businessStreakLabel") : t("vocab.streakLabel")}
            </div>
            <div className="text-lg font-semibold tabular-nums">{streak}</div>
          </div>
          <div>
            <div className="text-meta">{t("vocab.dueSummary")}</div>
            <div className="text-lg font-semibold tabular-nums">{summary.due}</div>
          </div>
          <div>
            <div className="text-meta">{t("vocab.strugglingSummary")}</div>
            <div className="text-lg font-semibold tabular-nums">{summary.struggling}</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild className="min-h-11" size="sm">
            <Link
              to={buildPracticeUrl({
                library,
                mode: "flashcards",
                count: 12,
                category: activeCategory || undefined,
                autostart: true,
              })}
            >
              {t("vocab.practiceAll")}
            </Link>
          </Button>
          <Button asChild variant="outline" className="min-h-11" size="sm">
            <Link
              to={buildPracticeUrl({
                library,
                mode: "flashcards",
                focus: "struggling",
                count: 10,
                autostart: true,
              })}
            >
              {t("vocab.practiceStruggling")}
            </Link>
          </Button>
          <Button asChild variant="outline" className="min-h-11" size="sm">
            <Link
              to={buildPracticeUrl({
                library,
                mode: "flashcards",
                focus: "due",
                count: 10,
                autostart: true,
              })}
            >
              {t("vocab.practiceDue")}
            </Link>
          </Button>
          <Button asChild variant="outline" className="min-h-11" size="sm">
            <Link
              to={buildPracticeUrl({
                library,
                mode: "flashcards",
                focus: "bookmarked",
                count: 10,
                autostart: true,
              })}
            >
              {t("vocab.practiceBookmarked")}
            </Link>
          </Button>
          <Button asChild variant="outline" className="min-h-11" size="sm">
            <Link to={buildReviewUrl({ library })}>
              {isBusiness ? t("vocab.reviewBusiness") : t("vocab.reviewDue")}
            </Link>
          </Button>
        </div>

        {weakAreas.length > 0 && (
          <div className="rounded-lg border border-warning/30 bg-warning/5 px-3 py-2 text-sm">
            {weakAreas.map((w) => {
              const label = lang === "ar" ? w.labelAr : w.labelEn;
              return (
                <div
                  key={w.id}
                  className="flex flex-wrap items-center justify-between gap-2 py-1"
                >
                  <span>
                    {label} {t("vocab.weakAlert")}
                  </span>
                  <Button asChild size="sm" variant="outline" className="min-h-11">
                    <Link
                      to={buildPracticeUrl({
                        library,
                        category: w.id,
                        focus: "struggling",
                        mode: "flashcards",
                        count: 10,
                        autostart: true,
                      })}
                    >
                      {t("vocab.studyDiscipline")}
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>
        )}

        <div className="md:hidden">
          <Button
            type="button"
            variant="ghost"
            className="min-h-11 w-full justify-between px-2"
            onClick={() => setToolsOpen((o) => !o)}
          >
            <span className="text-sm font-medium">{t("vocab.studyTools")}</span>
            {toolsOpen ? (
              <ChevronUp className="h-4 w-4" aria-hidden />
            ) : (
              <ChevronDown className="h-4 w-4" aria-hidden />
            )}
          </Button>
        </div>

        <div className={cn("space-y-3", !toolsOpen && "hidden md:block")}>
          {hasDifficulty && (
            <div className="space-y-1.5">
              <div className="text-meta">{t("vocab.difficultyPath")}</div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="min-h-11"
                  onClick={() => onDifficultyPath?.("beginner")}
                >
                  {t("vocab.pathBeginner")}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="min-h-11"
                  onClick={() => onDifficultyPath?.("intermediate")}
                >
                  {t("vocab.pathIntermediate")}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="min-h-11"
                  onClick={() => onDifficultyPath?.("advanced")}
                >
                  {t("vocab.pathAdvanced")}
                </Button>
              </div>
            </div>
          )}

          {packs.length > 0 && (
            <div className="space-y-1.5">
              <div className="text-meta">{t("vocab.examPacks")}</div>
              <div className="flex flex-wrap gap-2">
                {packs.map((pack) => (
                  <Button key={pack.id} asChild variant="outline" className="min-h-11" size="sm">
                    <Link
                      to={buildPracticeUrl({
                        library,
                        pack: pack.id,
                        autostart: true,
                      })}
                    >
                      {t(pack.titleKey)}
                    </Link>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {categoryOverview.length > 0 && (
        <section className="space-y-2" aria-label={overviewTitle}>
          <div>
            <h2 className="text-sm font-semibold tracking-tight">{overviewTitle}</h2>
            <p className="text-xs text-muted-foreground">{overviewHint}</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categoryOverview.map((c) => {
              const active = activeCategory === c.id;
              const label = lang === "ar" ? c.labelAr : c.labelEn;
              return (
                <div
                  key={c.id}
                  className={cn(
                    "min-h-11 w-[11.5rem] shrink-0 rounded-lg border p-2.5",
                    active
                      ? "border-primary bg-primary/10"
                      : "bg-card hover:border-primary/30"
                  )}
                >
                  <button
                    type="button"
                    className="w-full text-start"
                    onClick={() => onSelectCategory?.(active ? "" : c.id)}
                  >
                    <div className="text-xs font-medium leading-tight">{label}</div>
                    <div className="mt-1 text-[11px] text-muted-foreground">
                      {c.practiced}/{c.count} · {t("vocab.dueSummary")} {c.due}
                      {c.weak ? ` · ${t("vocab.weakCategory")}` : ""}
                    </div>
                    <Progress value={c.progressPct} className="mt-2 h-1" />
                  </button>
                  <Button asChild size="sm" variant="ghost" className="mt-1 h-9 w-full">
                    <Link
                      to={buildPracticeUrl({
                        library,
                        category: c.id,
                        mode: "flashcards",
                        count: 12,
                        autostart: true,
                      })}
                    >
                      {t("vocab.studyDiscipline")}
                    </Link>
                  </Button>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
