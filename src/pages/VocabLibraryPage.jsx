import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import PageHeader from "@/components/shared/PageHeader";
import FilterBar from "@/components/shared/FilterBar";
import { Search } from "lucide-react";
import EmptyState from "@/components/shared/EmptyState";
import VocabListItem from "@/components/vocab/VocabListItem";
import VocabStudyPanel from "@/components/vocab/VocabStudyPanel";
import { searchVocabulary } from "@/lib/search";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  BUSINESS_DAILY_GOAL,
  getActivityRange,
  getAllBookmarks,
  getAllProgress,
  rateWord,
  toggleBookmark,
} from "@/lib/db";
import {
  ensureLibrary,
  getCategoriesSync,
  getCategoryMetaSync,
  getLibraryWordsSync,
} from "@/lib/vocabCatalog";
import { getLibraryMeta } from "@/lib/libraries";
import {
  buildBusinessCategoryStats,
  summarizeBusinessProgress,
} from "@/lib/businessCategoryStats";
import { buildPracticeUrl, buildReviewUrl } from "@/lib/practiceUrl";
import businessExamPacks from "@/data/businessExamPacks";
import { cn } from "@/lib/cn";

const PAGE_SIZE = 30;

export default function VocabLibraryPage({ library }) {
  const { t, lang } = useI18n();
  const libMeta = getLibraryMeta(library);
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 200);
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [masteryBucket, setMasteryBucket] = useState("");
  const [dueOnly, setDueOnly] = useState("");
  const [bookmarkedOnly, setBookmarkedOnly] = useState("");
  const [page, setPage] = useState(0);
  const [progressMap, setProgressMap] = useState(new Map());
  const [bookmarkSet, setBookmarkSet] = useState(new Set());
  const [selected, setSelected] = useState(null);
  const [ready, setReady] = useState(false);
  const [catalogTick, setCatalogTick] = useState(0);
  const [businessToday, setBusinessToday] = useState(0);
  const [businessStreak, setBusinessStreak] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    setSelected(null);
    setPage(0);
    ensureLibrary(library).then(() => {
      if (!cancelled) {
        setReady(true);
        setCatalogTick((n) => n + 1);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [library]);

  const words = useMemo(() => {
    void catalogTick;
    return getLibraryWordsSync(library) || [];
  }, [library, catalogTick]);

  const wordByNorm = useMemo(() => {
    const map = new Map();
    for (const w of words) {
      map.set(
        String(w.word || "")
          .toLowerCase()
          .trim()
          .replace(/\s+/g, " "),
        w
      );
    }
    return map;
  }, [words]);

  const categories = useMemo(() => {
    void catalogTick;
    return getCategoriesSync(library);
  }, [library, catalogTick]);

  const categoryMeta = useMemo(() => {
    void catalogTick;
    return getCategoryMetaSync(library);
  }, [library, catalogTick]);

  const difficulties = useMemo(() => {
    const set = new Set(words.map((w) => w.difficulty).filter(Boolean));
    return Array.from(set).sort();
  }, [words]);

  const categoryOverview = useMemo(() => {
    if (library !== "business" || !categoryMeta.length) return [];
    return buildBusinessCategoryStats(words, categoryMeta, progressMap, library);
  }, [library, categoryMeta, words, progressMap]);

  const summary = useMemo(() => {
    if (library !== "business") return null;
    return summarizeBusinessProgress(words, progressMap, library);
  }, [library, words, progressMap]);

  const weakAreas = useMemo(
    () => categoryOverview.filter((c) => c.weak).slice(0, 2),
    [categoryOverview]
  );

  const refreshMeta = async () => {
    const [progress, bookmarks] = await Promise.all([
      getAllProgress(library),
      getAllBookmarks(library),
    ]);
    setProgressMap(new Map(progress.map((p) => [`${p.library}::${p.wordId}`, p])));
    setBookmarkSet(new Set(bookmarks.map((b) => b.wordId)));

    if (library === "business") {
      const activity = await getActivityRange(30);
      const today = activity[activity.length - 1];
      setBusinessToday(today?.businessPracticed || 0);
      let streak = 0;
      for (let i = activity.length - 1; i >= 0; i -= 1) {
        const a = activity[i];
        if ((a.businessPracticed || 0) + (a.businessReviews || 0) > 0) streak += 1;
        else if (i < activity.length - 1) break;
      }
      setBusinessStreak(streak);
    }
  };

  useEffect(() => {
    refreshMeta();
  }, [library]);

  const filtered = useMemo(
    () =>
      searchVocabulary(words, debouncedQuery, {
        category: category || undefined,
        difficulty: difficulty || undefined,
        masteryBucket: masteryBucket || undefined,
        dueOnly: dueOnly === "1",
        bookmarkedOnly: bookmarkedOnly === "1",
        masteryMap: progressMap,
        bookmarkSet,
      }),
    [
      words,
      debouncedQuery,
      category,
      difficulty,
      masteryBucket,
      dueOnly,
      bookmarkedOnly,
      progressMap,
      bookmarkSet,
    ]
  );

  useEffect(() => {
    setPage(0);
  }, [debouncedQuery, category, difficulty, masteryBucket, dueOnly, bookmarkedOnly, library]);

  const pageItems = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const chips = [];
  if (category) {
    const meta = categoryMeta.find((x) => x.id === category);
    const label = meta ? (lang === "ar" ? meta.labelAr : meta.labelEn) : category;
    chips.push({ id: "category", label: `${t("common.category")}: ${label}` });
  }
  if (difficulty) chips.push({ id: "difficulty", label: difficulty });
  if (masteryBucket) {
    const masteryLabels = {
      new: t("common.new"),
      struggling: t("common.struggling"),
      good: t("ratings.good"),
      easy: t("ratings.easy"),
    };
    chips.push({ id: "mastery", label: masteryLabels[masteryBucket] || masteryBucket });
  }
  if (dueOnly === "1") chips.push({ id: "due", label: t("common.dueOnly") });
  if (bookmarkedOnly === "1") chips.push({ id: "bm", label: t("common.bookmarkedOnly") });

  const clearChip = (id) => {
    if (id === "category") setCategory("");
    if (id === "difficulty") setDifficulty("");
    if (id === "mastery") setMasteryBucket("");
    if (id === "due") setDueOnly("");
    if (id === "bm") setBookmarkedOnly("");
  };

  const applyDifficultyPath = (path) => {
    if (path === "beginner") setDifficulty("B1");
    if (path === "intermediate") setDifficulty("B2");
    if (path === "advanced") setDifficulty("C1");
    setMasteryBucket("");
    setDueOnly("");
  };

  const openRelated = (term) => {
    const key = String(term || "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");
    const hit = wordByNorm.get(key);
    if (hit) setSelected(hit);
  };

  const title = libMeta ? t(libMeta.titleKey) : library;
  const subtitle = libMeta ? t(libMeta.subtitleKey) : "";
  const libraryLabel = libMeta ? t(libMeta.labelKey) : library;
  const goalPct = Math.min(100, Math.round((businessToday / BUSINESS_DAILY_GOAL) * 100));

  if (!ready) {
    return <p className="text-muted-foreground">{t("common.loading")}</p>;
  }

  return (
    <div className="space-y-5">
      <PageHeader
        title={title}
        subtitle={subtitle}
        library={library}
        libraryLabel={libraryLabel}
        actions={
          <Badge variant="secondary">
            {t("vocab.showing")} {filtered.length} / {words.length} {t("common.words")}
          </Badge>
        }
      />

      {library === "business" && summary && (
        <section className="space-y-3 rounded-xl border bg-card p-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="text-meta">{t("vocab.dailyGoal")}</div>
              <div className="text-lg font-semibold tabular-nums">
                {businessToday} {t("vocab.goalOf")} {BUSINESS_DAILY_GOAL}
              </div>
              <Progress value={goalPct} className="mt-2 h-1.5" />
            </div>
            <div>
              <div className="text-meta">{t("vocab.businessStreakLabel")}</div>
              <div className="text-lg font-semibold tabular-nums">{businessStreak}</div>
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
                  library: "business",
                  mode: "flashcards",
                  count: 12,
                  category: category || undefined,
                  autostart: true,
                })}
              >
                {t("vocab.practiceAll")}
              </Link>
            </Button>
            <Button asChild variant="outline" className="min-h-11" size="sm">
              <Link
                to={buildPracticeUrl({
                  library: "business",
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
                  library: "business",
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
                  library: "business",
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
              <Link to={buildReviewUrl({ library: "business" })}>
                {t("vocab.reviewBusiness")}
              </Link>
            </Button>
          </div>

          <div className="space-y-1.5">
            <div className="text-meta">{t("vocab.difficultyPath")}</div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="min-h-11"
                onClick={() => applyDifficultyPath("beginner")}
              >
                {t("vocab.pathBeginner")}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="min-h-11"
                onClick={() => applyDifficultyPath("intermediate")}
              >
                {t("vocab.pathIntermediate")}
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="min-h-11"
                onClick={() => applyDifficultyPath("advanced")}
              >
                {t("vocab.pathAdvanced")}
              </Button>
            </div>
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
                          library: "business",
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
        </section>
      )}

      {library === "business" && categoryOverview.length > 0 && (
        <section className="space-y-2" aria-label={t("vocab.categoryOverview")}>
          <div>
            <h2 className="text-sm font-semibold tracking-tight">{t("vocab.categoryOverview")}</h2>
            <p className="text-xs text-muted-foreground">{t("vocab.categoryOverviewHint")}</p>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {categoryOverview.map((c) => {
              const active = category === c.id;
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
                    onClick={() => setCategory(active ? "" : c.id)}
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
                        library: "business",
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

      {library === "business" && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold tracking-tight">{t("vocab.examPacks")}</h2>
          <div className="flex flex-wrap gap-2">
            {businessExamPacks.map((pack) => (
              <Button key={pack.id} asChild variant="outline" className="min-h-11" size="sm">
                <Link
                  to={buildPracticeUrl({
                    library: "business",
                    pack: pack.id,
                    autostart: true,
                  })}
                >
                  {t(pack.titleKey)}
                </Link>
              </Button>
            ))}
          </div>
        </section>
      )}

      <FilterBar
        query={query}
        onQueryChange={setQuery}
        filters={[
          {
            id: "category",
            label: t("common.category"),
            value: category,
            onChange: setCategory,
            options: categories.map((c) => {
              const meta = categoryMeta.find((x) => x.id === c);
              return {
                value: c,
                label: meta ? (lang === "ar" ? meta.labelAr : meta.labelEn) : c,
              };
            }),
          },
          {
            id: "difficulty",
            label: t("common.difficulty"),
            value: difficulty,
            onChange: setDifficulty,
            options: difficulties.map((d) => ({ value: d, label: d })),
          },
          {
            id: "mastery",
            label: t("common.mastery"),
            value: masteryBucket,
            onChange: setMasteryBucket,
            options: [
              { value: "new", label: t("common.new") },
              { value: "struggling", label: t("common.struggling") },
              { value: "good", label: t("ratings.good") },
              { value: "easy", label: t("ratings.easy") },
            ],
          },
          {
            id: "due",
            label: t("common.due"),
            value: dueOnly,
            onChange: setDueOnly,
            options: [{ value: "1", label: t("common.dueOnly") }],
          },
          {
            id: "bookmarks",
            label: t("common.bookmarks"),
            value: bookmarkedOnly,
            onChange: setBookmarkedOnly,
            options: [{ value: "1", label: t("common.bookmarkedOnly") }],
          },
        ]}
        activeChips={chips}
        onClearChip={clearChip}
        onClearAll={() => {
          setCategory("");
          setDifficulty("");
          setMasteryBucket("");
          setDueOnly("");
          setBookmarkedOnly("");
          setQuery("");
        }}
      />

      {pageItems.length === 0 ? (
        <EmptyState
          icon={Search}
          title={t("common.empty")}
          description={t("common.clearFilters")}
        />
      ) : (
        <div className="divide-y rounded-xl border bg-card">
          {pageItems.map((word) => {
            const progress = progressMap.get(`${library}::${word.id}`);
            return (
              <VocabListItem
                key={word.id}
                word={word}
                mastery={progress?.mastery || 0}
                bookmarked={bookmarkSet.has(word.id)}
                onSelect={() => setSelected(word)}
                onToggleBookmark={async () => {
                  await toggleBookmark(library, word.id, word);
                  refreshMeta();
                }}
              />
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {t("common.page")} {page + 1} {t("common.of")} {pageCount}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="min-h-11"
            disabled={page === 0}
            onClick={() => setPage((p) => p - 1)}
          >
            {t("common.previous")}
          </Button>
          <Button
            variant="outline"
            className="min-h-11"
            disabled={page >= pageCount - 1}
            onClick={() => setPage((p) => p + 1)}
          >
            {t("common.next")}
          </Button>
        </div>
      </div>

      <Sheet open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="sr-only">{selected?.word}</SheetTitle>
            <SheetDescription className="sr-only">{t("common.details")}</SheetDescription>
          </SheetHeader>
          <div className="p-6">
            {selected && (
              <VocabStudyPanel
                word={selected}
                categoryMeta={categoryMeta}
                mastery={progressMap.get(`${library}::${selected.id}`)?.mastery || 0}
                bookmarked={bookmarkSet.has(selected.id)}
                onOpenRelated={openRelated}
                onToggleBookmark={async () => {
                  await toggleBookmark(library, selected.id, selected);
                  refreshMeta();
                }}
                onRate={async (rating) => {
                  await rateWord(library, selected.id, rating);
                  toast.success(t("vocab.ratingSaved"));
                  refreshMeta();
                }}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
