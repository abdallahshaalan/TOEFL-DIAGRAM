import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import LibraryCoachPanel from "@/components/vocab/LibraryCoachPanel";
import { searchVocabulary } from "@/lib/search";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import {
  getActivityRange,
  getAllBookmarks,
  getAllProgress,
  getIncludeDrafts,
  libraryReviewsKey,
  rateWord,
  toggleBookmark,
  unsuspendWord,
} from "@/lib/db";
import {
  ensureLibrary,
  getCategoriesSync,
  getCategoryMetaSync,
  getLibraryWordsSync,
} from "@/lib/vocabCatalog";
import { getLibraryMeta } from "@/lib/libraries";
import { buildCategoryStats, summarizeLibraryProgress } from "@/lib/categoryStats";

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
  const [leechOnly, setLeechOnly] = useState("");
  const [includeDrafts, setIncludeDraftsPref] = useState(false);
  const [page, setPage] = useState(0);
  const [progressMap, setProgressMap] = useState(new Map());
  const [bookmarkSet, setBookmarkSet] = useState(new Set());
  const [selected, setSelected] = useState(null);
  const [ready, setReady] = useState(false);
  const [catalogTick, setCatalogTick] = useState(0);
  const [todayCount, setTodayCount] = useState(0);
  const [streak, setStreak] = useState(0);

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
    if (!categoryMeta.length) return [];
    return buildCategoryStats(words, categoryMeta, progressMap, library).filter(
      (c) => c.count > 0
    );
  }, [library, categoryMeta, words, progressMap]);

  const summary = useMemo(
    () => summarizeLibraryProgress(words, progressMap, library),
    [library, words, progressMap]
  );

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

    const activity = await getActivityRange(30);
    const today = activity[activity.length - 1];
    const reviewsKey = libraryReviewsKey(library);
    setTodayCount(reviewsKey ? today?.[reviewsKey] || 0 : 0);
    let nextStreak = 0;
    for (let i = activity.length - 1; i >= 0; i -= 1) {
      const a = activity[i];
      const dayVal = reviewsKey ? a[reviewsKey] || 0 : 0;
      if (dayVal > 0) nextStreak += 1;
      else if (i < activity.length - 1) break;
    }
    setStreak(nextStreak);
  };

  useEffect(() => {
    refreshMeta();
    getIncludeDrafts().then(setIncludeDraftsPref);
    // refreshMeta closes over library; re-run when library changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [library]);

  const filtered = useMemo(
    () =>
      searchVocabulary(words, debouncedQuery, {
        category: category || undefined,
        difficulty: difficulty || undefined,
        masteryBucket: masteryBucket || undefined,
        dueOnly: dueOnly === "1",
        bookmarkedOnly: bookmarkedOnly === "1",
        leechOnly: leechOnly === "1",
        excludeDraft: !includeDrafts,
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
      leechOnly,
      includeDrafts,
      progressMap,
      bookmarkSet,
    ]
  );

  useEffect(() => {
    setPage(0);
  }, [
    debouncedQuery,
    category,
    difficulty,
    masteryBucket,
    dueOnly,
    bookmarkedOnly,
    leechOnly,
    includeDrafts,
    library,
  ]);

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
  if (leechOnly === "1") chips.push({ id: "leech", label: t("common.leechOnly") });

  const clearChip = (id) => {
    if (id === "category") setCategory("");
    if (id === "difficulty") setDifficulty("");
    if (id === "mastery") setMasteryBucket("");
    if (id === "due") setDueOnly("");
    if (id === "bm") setBookmarkedOnly("");
    if (id === "leech") setLeechOnly("");
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
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary">
              {t("vocab.showing")} {filtered.length} / {words.length} {t("common.words")}
            </Badge>
            {(library === "toefl" || library === "business") && (
              <Badge variant="outline">
                {words.filter((w) => w.quality === "ok").length} {t("common.okQuality")} ·{" "}
                {words.filter((w) => w.quality === "draft").length} {t("common.draft")}
              </Badge>
            )}
          </div>
        }
      />

      <LibraryCoachPanel
        library={library}
        todayCount={todayCount}
        streak={streak}
        summary={summary}
        categoryOverview={categoryOverview.slice(0, library === "general" ? 12 : 24)}
        weakAreas={weakAreas}
        activeCategory={category}
        onSelectCategory={setCategory}
        onDifficultyPath={applyDifficultyPath}
        hasDifficulty={difficulties.length > 0}
      />

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
          {
            id: "leech",
            label: t("common.leech"),
            value: leechOnly,
            onChange: setLeechOnly,
            options: [{ value: "1", label: t("common.leechOnly") }],
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
          description={t("common.emptyFiltered")}
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
                progress={progressMap.get(`${library}::${selected.id}`)}
                mastery={progressMap.get(`${library}::${selected.id}`)?.mastery || 0}
                bookmarked={bookmarkSet.has(selected.id)}
                onOpenRelated={openRelated}
                onToggleBookmark={async () => {
                  await toggleBookmark(library, selected.id, selected);
                  refreshMeta();
                }}
                onUnsuspend={async () => {
                  await unsuspendWord(library, selected.id);
                  toast.success(t("review.unsuspended"));
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
