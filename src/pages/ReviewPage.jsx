import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Clock } from "lucide-react";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import PracticeSessionLayout from "@/components/practice/PracticeSessionLayout";
import Flashcard from "@/components/practice/Flashcard";
import {
  buryWord,
  getActivityRange,
  libraryReviewsKey,
  maybeCelebrateLibraryGoal,
  rateWord,
  suspendWord,
  undoLastRating,
  unsuspendWord,
} from "@/lib/db";
import { shouldRequeueInSession } from "@/lib/srs";
import { ensureAllLibraries, findWordById } from "@/lib/vocabCatalog";
import { buildPracticeUrl } from "@/lib/practiceUrl";
import { buildReviewQueue } from "@/lib/reviewQueue";

const EMPTY_BY_FILTER = {
  all: {
    titleKey: "review.empty",
    browseLabelKey: "dashboard.startPractice",
    browseHref: "/practice",
    practiceHref: "/practice",
  },
  toefl: {
    titleKey: "review.emptyToefl",
    browseLabelKey: "dashboard.startToefl",
    browseHref: "/vocab/toefl",
    practiceHref: buildPracticeUrl({ library: "toefl", mode: "flashcards", count: 12 }),
  },
  business: {
    titleKey: "review.emptyBusiness",
    browseLabelKey: "dashboard.startBusiness",
    browseHref: "/vocab/business",
    practiceHref: buildPracticeUrl({ library: "business", mode: "flashcards", count: 12 }),
  },
  general: {
    titleKey: "review.emptyGeneral",
    browseLabelKey: "dashboard.startGeneral",
    browseHref: "/vocab/general",
    practiceHref: buildPracticeUrl({ library: "general", mode: "flashcards", count: 12 }),
  },
};

async function celebrateLibraryGoal(library, t) {
  const days = await getActivityRange(1);
  const today = days[days.length - 1];
  const key = libraryReviewsKey(library);
  const celebrated = await maybeCelebrateLibraryGoal(library, today?.[key] || 0);
  if (celebrated) toast.success(t("vocab.goalComplete"));
}

export default function ReviewPage() {
  const { t } = useI18n();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialLib = searchParams.get("library") || "all";
  const [libraryFilter, setLibraryFilter] = useState(
    ["toefl", "business", "general"].includes(initialLib) ? initialLib : "all"
  );
  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [rated, setRated] = useState(0);
  const [canUndo, setCanUndo] = useState(false);
  const [exitOpen, setExitOpen] = useState(false);

  const load = async (filter = libraryFilter) => {
    setLoading(true);
    await ensureAllLibraries();
    const { queue: built } = await buildReviewQueue(filter);
    const withWords = built
      .map((p) => ({
        ...p,
        word: p.word || findWordById(p.library, p.wordId),
      }))
      .filter((p) => p.word);
    setQueue(withWords);
    setIndex(0);
    setRevealed(false);
    setRated(0);
    setSummary(null);
    setCanUndo(false);
    setLoading(false);
  };

  useEffect(() => {
    load(libraryFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [libraryFilter]);

  useEffect(() => {
    if (summary || !queue[index]) return undefined;
    const onKey = (e) => {
      if (!revealed && e.code === "Space") {
        e.preventDefault();
        setRevealed(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [revealed, queue, index, summary]);

  const onFilterChange = (v) => {
    setLibraryFilter(v);
    if (v === "all") {
      searchParams.delete("library");
      setSearchParams(searchParams, { replace: true });
    } else {
      setSearchParams({ library: v }, { replace: true });
    }
  };

  const advanceAfterRate = (updated, currentCard, nextRated) => {
    setCanUndo(true);
    setRated(nextRated);
    const requeue = shouldRequeueInSession(updated);
    if (requeue) {
      setQueue((q) => {
        const rest = [...q.slice(0, index), ...q.slice(index + 1)];
        rest.push({
          ...currentCard,
          ...updated,
          word: currentCard.word,
          isNewCard: false,
        });
        return rest;
      });
      setRevealed(false);
      return;
    }
    if (index >= queue.length - 1) {
      toast.success(t("practice.sessionComplete"));
      setSummary({ rated: nextRated });
    } else {
      setIndex((i) => i + 1);
      setRevealed(false);
    }
  };

  const onUndo = async () => {
    const snap = await undoLastRating();
    if (!snap) {
      toast.error(t("review.undoEmpty"));
      return;
    }
    setCanUndo(false);
    setRated((r) => Math.max(0, r - 1));
    toast.success(t("review.undoDone"));
    await load(libraryFilter);
  };

  const onBury = async () => {
    const current = queue[index];
    if (!current) return;
    await buryWord(current.library, current.wordId);
    toast.success(t("review.buried"));
    setCanUndo(false);
    if (index >= queue.length - 1) {
      setSummary({ rated });
    } else {
      setQueue((q) => q.filter((_, i) => i !== index));
      setRevealed(false);
    }
  };

  const onSuspend = async () => {
    const current = queue[index];
    if (!current) return;
    await suspendWord(current.library, current.wordId);
    toast.success(t("review.suspended"));
    setCanUndo(false);
    if (index >= queue.length - 1) {
      setSummary({ rated });
    } else {
      setQueue((q) => q.filter((_, i) => i !== index));
      setRevealed(false);
    }
  };

  const onUnsuspend = async () => {
    const current = queue[index];
    if (!current) return;
    await unsuspendWord(current.library, current.wordId);
    toast.success(t("review.unsuspended"));
  };

  if (loading) {
    return <p className="text-muted-foreground">{t("common.loading")}</p>;
  }

  if (summary) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle>{t("review.summary")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            {t("review.rated")}: {summary.rated}
          </p>
          <div className="flex gap-2">
            <Button onClick={() => load(libraryFilter)}>{t("common.back")}</Button>
            <Button asChild variant="outline">
              <Link to="/practice">{t("dashboard.startPractice")}</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const current = queue[index];

  if (!current) {
    const empty = EMPTY_BY_FILTER[libraryFilter] || EMPTY_BY_FILTER.all;
    return (
      <div className="space-y-5">
        <PageHeader title={t("review.title")} subtitle={t("review.subtitle")} />
        <div className="max-w-xs space-y-1.5">
          <Label>{t("review.filterLibrary")}</Label>
          <Select value={libraryFilter} onValueChange={onFilterChange}>
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t("review.allLibraries")}</SelectItem>
              <SelectItem value="toefl">{t("vocab.libraryToefl")}</SelectItem>
              <SelectItem value="business">{t("vocab.libraryBusiness")}</SelectItem>
              <SelectItem value="general">{t("vocab.libraryGeneral")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <EmptyState
          icon={Clock}
          title={t(empty.titleKey)}
          primaryAction={{
            label: t(empty.browseLabelKey),
            href: empty.browseHref,
          }}
          secondaryAction={{
            label: t("dashboard.startPractice"),
            href: empty.practiceHref,
          }}
        />
      </div>
    );
  }

  const dueRemaining = queue.slice(index).filter((c) => !c.isNewCard).length;

  return (
    <div className="space-y-2">
      <div className="mb-2 max-w-xs space-y-1.5 px-1">
        <Label>{t("review.filterLibrary")}</Label>
        <Select value={libraryFilter} onValueChange={onFilterChange}>
          <SelectTrigger className="h-10">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("review.allLibraries")}</SelectItem>
            <SelectItem value="toefl">{t("vocab.libraryToefl")}</SelectItem>
            <SelectItem value="business">{t("vocab.libraryBusiness")}</SelectItem>
            <SelectItem value="general">{t("vocab.libraryGeneral")}</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <PracticeSessionLayout
        title={t("review.title")}
        library={current.library}
        index={index}
        total={queue.length}
        onExit={() => setExitOpen(true)}
        hint={`${t("review.dueCount")}: ${dueRemaining} · ${t("common.remaining")}: ${queue.length - index}`}
      >
        <div className="mb-2 flex flex-wrap gap-1.5">
          <Badge
            variant={
              current.library === "toefl"
                ? "toefl"
                : current.library === "business"
                  ? "business"
                  : "general"
            }
          >
            {current.library === "toefl"
              ? t("vocab.libraryToefl")
              : current.library === "business"
                ? t("vocab.libraryBusiness")
                : t("vocab.libraryGeneral")}
          </Badge>
          {current.isNewCard && <Badge variant="secondary">{t("common.new")}</Badge>}
        </div>
        <Flashcard
          word={current.word}
          revealed={revealed}
          onReveal={() => setRevealed(true)}
          onRate={async (rating) => {
            const updated = await rateWord(current.library, current.wordId, rating);
            await celebrateLibraryGoal(current.library, t);
            toast.success(t("vocab.ratingSaved"));
            advanceAfterRate(updated, current, rated + 1);
          }}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className="min-h-11"
            disabled={!canUndo}
            onClick={onUndo}
          >
            {t("common.undo")}
          </Button>
          <Button type="button" variant="outline" className="min-h-11" onClick={onBury}>
            {t("common.bury")}
          </Button>
          <Button type="button" variant="outline" className="min-h-11" onClick={onSuspend}>
            {t("common.suspend")}
          </Button>
          {(current.suspended ||
            (current.buriedUntil && current.buriedUntil > Date.now())) && (
            <Button type="button" variant="outline" className="min-h-11" onClick={onUnsuspend}>
              {t("common.unsuspend")}
            </Button>
          )}
        </div>
      </PracticeSessionLayout>

      <AlertDialog open={exitOpen} onOpenChange={setExitOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("practice.exitConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("practice.exitConfirmDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => setSummary({ rated })}>
              {t("common.exit")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
