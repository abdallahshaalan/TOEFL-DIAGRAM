import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Clock } from "lucide-react";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import PracticeSessionLayout from "@/components/practice/PracticeSessionLayout";
import Flashcard from "@/components/practice/Flashcard";
import { getAllProgress, rateWord } from "@/lib/db";
import { isDue } from "@/lib/srs";
import { ensureAllLibraries, findWordById } from "@/lib/vocabCatalog";

export default function ReviewPage() {
  const { t } = useI18n();
  const [queue, setQueue] = useState([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [rated, setRated] = useState(0);

  const load = async () => {
    setLoading(true);
    await ensureAllLibraries();
    const progress = await getAllProgress();
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
    load();
  }, []);

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
            <Button onClick={load}>{t("common.back")}</Button>
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
    return (
      <div className="space-y-5">
        <PageHeader title={t("review.title")} subtitle={t("review.subtitle")} />
        <EmptyState
          icon={Clock}
          title={t("review.empty")}
          primaryAction={{ label: t("dashboard.startToefl"), href: "/vocab/toefl" }}
          secondaryAction={{ label: t("dashboard.startPractice"), href: "/practice" }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <PracticeSessionLayout
        title={t("review.title")}
        library={current.library}
        index={index}
        total={queue.length}
        onExit={() => setSummary({ rated })}
        hint={`${t("review.dueCount")}: ${queue.length - index}`}
      >
        <div className="mb-2">
          <Badge variant={current.library === "toefl" ? "toefl" : "general"}>
            {current.library === "toefl" ? t("vocab.libraryToefl") : t("vocab.libraryGeneral")}
          </Badge>
        </div>
        <Flashcard
          word={current.word}
          revealed={revealed}
          onReveal={() => setRevealed(true)}
          onRate={async (rating) => {
            await rateWord(current.library, current.wordId, rating);
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
