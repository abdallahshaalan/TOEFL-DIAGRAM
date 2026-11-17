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
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import PracticeSessionLayout from "@/components/practice/PracticeSessionLayout";
import Flashcard from "@/components/practice/Flashcard";
import { getAllProgress, maybeCelebrateBusinessGoal, rateWord } from "@/lib/db";
import { isDue } from "@/lib/srs";
import { ensureAllLibraries, findWordById } from "@/lib/vocabCatalog";
import { buildPracticeUrl } from "@/lib/practiceUrl";

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

  const load = async (filter = libraryFilter) => {
    setLoading(true);
    await ensureAllLibraries();
    let progress = await getAllProgress();
    if (filter && filter !== "all") {
      progress = progress.filter((p) => p.library === filter);
    }
    const due = progress
      .filter((p) => isDue(p))
      .map((p) => ({ ...p, word: findWordById(p.library, p.wordId) }))
      .filter((p) => p.word)
      .sort((a, b) => (a.nextReviewAt || 0) - (b.nextReviewAt || 0));
    setQueue(due);
    setIndex(0);
    setRevealed(false);
    setRated(0);
    setSummary(null);
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
    const isBusiness = libraryFilter === "business";
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
          title={isBusiness ? t("review.emptyBusiness") : t("review.empty")}
          primaryAction={{
            label: isBusiness ? t("dashboard.startBusiness") : t("dashboard.startToefl"),
            href: isBusiness ? "/vocab/business" : "/vocab/toefl",
          }}
          secondaryAction={{
            label: t("dashboard.startPractice"),
            href: isBusiness
              ? buildPracticeUrl({ library: "business", mode: "flashcards", count: 12 })
              : "/practice",
          }}
        />
      </div>
    );
  }

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
        onExit={() => setSummary({ rated })}
        hint={`${t("review.dueCount")}: ${queue.length - index}`}
      >
        <div className="mb-2">
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
        </div>
        <Flashcard
          word={current.word}
          revealed={revealed}
          onReveal={() => setRevealed(true)}
          onRate={async (rating) => {
            await rateWord(current.library, current.wordId, rating);
            if (current.library === "business") {
              const { getActivityRange } = await import("@/lib/db");
              const days = await getActivityRange(1);
              const today = days[days.length - 1];
              const celebrated = await maybeCelebrateBusinessGoal(today?.businessPracticed || 0);
              if (celebrated) toast.success(t("vocab.goalComplete"));
            }
            toast.success(t("vocab.ratingSaved"));
            const nextRated = rated + 1;
            setRated(nextRated);
            if (index >= queue.length - 1) {
              toast.success(t("practice.sessionComplete"));
              setSummary({ rated: nextRated });
            } else {
              setIndex((i) => i + 1);
              setRevealed(false);
            }
          }}
        />
      </PracticeSessionLayout>
    </div>
  );
}
