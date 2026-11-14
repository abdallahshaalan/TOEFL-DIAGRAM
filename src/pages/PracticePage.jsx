import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Layers,
  ListChecks,
  PenLine,
  ScanSearch,
  TextCursorInput,
} from "lucide-react";
import { useI18n } from "@/i18n";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageHeader from "@/components/shared/PageHeader";
import IconTile from "@/components/shared/IconTile";
import PracticeSessionLayout from "@/components/practice/PracticeSessionLayout";
import Flashcard from "@/components/practice/Flashcard";
import {
  ensureLibrary,
  getCategoriesSync,
  getLibraryWordsSync,
} from "@/lib/vocabCatalog";
import { bumpActivity, rateWord } from "@/lib/db";
import { RATING } from "@/lib/srs";
import { cn } from "@/lib/cn";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getPool(library) {
  return getLibraryWordsSync(library) || [];
}

function pickPool(library, category, count) {
  let pool = getPool(library);
  if (category) pool = pool.filter((w) => (w.categories || []).includes(category));
  return shuffle(pool).slice(0, count);
}

function distractors(pool, correct, n = 3) {
  const others = shuffle(pool.filter((w) => w.id !== correct.id)).slice(0, n);
  while (others.length < n) {
    const extra = shuffle(
      pool.filter((w) => w.id !== correct.id && !others.find((o) => o.id === w.id))
    )[0];
    if (!extra) break;
    others.push(extra);
  }
  return shuffle([correct, ...others]);
}

const MODES = [
  { id: "flashcards", titleKey: "flashcards", descKey: "flashcardsDesc", icon: Layers },
  { id: "quiz", titleKey: "quiz", descKey: "quizDesc", icon: ListChecks },
  { id: "cloze", titleKey: "cloze", descKey: "clozeDesc", icon: TextCursorInput },
  { id: "recognition", titleKey: "recognition", descKey: "recognitionDesc", icon: ScanSearch },
  { id: "writing", titleKey: "writing", descKey: "writingDesc", icon: PenLine },
];

export default function PracticePage() {
  const { t } = useI18n();
  const [mode, setMode] = useState("flashcards");
  const [library, setLibrary] = useState("toefl");
  const [count, setCount] = useState("10");
  const [category, setCategory] = useState("");
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [catalogTick, setCatalogTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
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

  const categories = useMemo(() => {
    void catalogTick;
    return getCategoriesSync(library).slice(0, 40);
  }, [library, catalogTick]);

  const start = () => {
    if (!ready) return;
    let words = pickPool(library, category, Number(count) || 10);
    if (mode === "cloze") {
      words = words.filter((w) => w.exampleEn && new RegExp(w.word, "i").test(w.exampleEn));
      if (!words.length) {
        toast.error(t("common.empty"));
        return;
      }
    }
    if (!words.length) {
      toast.error(t("common.empty"));
      return;
    }
    setSession({
      mode,
      library,
      words,
      index: 0,
      revealed: false,
      score: 0,
      choice: null,
      typed: "",
      writing: "",
      done: false,
      rated: 0,
    });
  };

  const advance = async (nextScore = session.score) => {
    if (session.index >= session.words.length - 1) {
      await bumpActivity({
        practiced: session.words.length,
        quizzes: session.mode !== "flashcards" ? 1 : 0,
      });
      toast.success(t("practice.sessionComplete"));
      setSession({ ...session, score: nextScore, done: true });
      return;
    }
    setSession({
      ...session,
      index: session.index + 1,
      revealed: false,
      choice: null,
      typed: "",
      writing: "",
      score: nextScore,
    });
  };

  const handleRate = async (rating) => {
    const word = session.words[session.index];
    await rateWord(session.library, word.id, rating);
    await bumpActivity({ practiced: 1, reviews: 1 });
    await advance(session.score + (rating >= 3 ? 1 : 0));
  };

  useEffect(() => {
    if (!session || session.done) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") {
        if (window.confirm(t("practice.exitConfirm"))) setSession(null);
      }
      if (session.mode === "flashcards" && !session.revealed && e.code === "Space") {
        e.preventDefault();
        setSession((s) => ({ ...s, revealed: true }));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [session, t]);

  if (!session) {
    return (
      <div className="space-y-6">
        <PageHeader title={t("practice.title")} subtitle={t("practice.subtitle")} />
        <div className="grid gap-3 sm:grid-cols-2">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMode(m.id)}
              className={cn(
                "flex min-h-[5.5rem] gap-3 rounded-lg border bg-card p-4 text-start transition-colors hover:border-primary/30 hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                mode === m.id && "border-primary bg-accent/50"
              )}
            >
              <IconTile icon={m.icon} size="md" />
              <div className="min-w-0">
                <div className="text-sm font-semibold tracking-tight">
                  {t(`practice.${m.titleKey}`)}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {t(`practice.${m.descKey}`)}
                </p>
              </div>
            </button>
          ))}
        </div>
        <Card>
          <CardContent className="grid gap-4 p-4 sm:grid-cols-3">
            <div className="space-y-1.5">
              <Label>{t("practice.library")}</Label>
              <Select value={library} onValueChange={setLibrary}>
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="toefl">TOEFL</SelectItem>
                  <SelectItem value="general">General</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("common.category")}</Label>
              <Select
                value={category || "__all__"}
                onValueChange={(v) => setCategory(v === "__all__" ? "" : v)}
                disabled={!ready}
              >
                <SelectTrigger className="h-10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">{t("common.all")}</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>{t("practice.count")}</Label>
              <Input
                className="h-10"
                type="number"
                min={5}
                max={50}
                value={count}
                onChange={(e) => setCount(e.target.value)}
              />
            </div>
            <div className="sm:col-span-3">
              <Button onClick={start} disabled={!ready}>
                {ready ? t("common.start") : t("common.loading")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (session.done) {
    return (
      <Card className="mx-auto max-w-lg">
        <CardHeader>
          <CardTitle>{t("practice.sessionComplete")}</CardTitle>
          <CardDescription>
            {t("practice.score")}: {session.score} / {session.words.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setSession(null)}>{t("common.back")}</Button>
        </CardContent>
      </Card>
    );
  }

  const word = session.words[session.index];
  const modeTitle = t(`practice.${MODES.find((m) => m.id === session.mode)?.titleKey || "flashcards"}`);
  const pool = getPool(session.library);

  return (
    <PracticeSessionLayout
      title={modeTitle}
      library={session.library}
      index={session.index}
      total={session.words.length}
      onExit={() => {
        if (window.confirm(t("practice.exitConfirm"))) setSession(null);
      }}
    >
      {session.mode === "flashcards" && (
        <Flashcard
          word={word}
          revealed={session.revealed}
          onReveal={() => setSession({ ...session, revealed: true })}
          onRate={handleRate}
        />
      )}

      {session.mode === "quiz" && (
        <ChoiceBlock
          key={word.id}
          prompt={<span className="word-headword">{word.word}</span>}
          hint={t("practice.chooseArabic")}
          options={distractors(pool, word).map((o) => ({
            id: o.id,
            label: o.translationAr || o.definitionEn || o.word,
            rtl: !!o.translationAr,
          }))}
          correctId={word.id}
          onAnswer={async (ok) => {
            await rateWord(session.library, word.id, ok ? RATING.GOOD : RATING.AGAIN);
            setTimeout(() => advance(session.score + (ok ? 1 : 0)), 400);
          }}
        />
      )}

      {session.mode === "recognition" && (
        <ChoiceBlock
          key={word.id}
          prompt={word.definitionEn || word.exampleEn || word.translationAr}
          options={distractors(pool, word).map((o) => ({
            id: o.id,
            label: o.word,
          }))}
          correctId={word.id}
          onAnswer={async (ok) => {
            await rateWord(session.library, word.id, ok ? RATING.GOOD : RATING.HARD);
            setTimeout(() => advance(session.score + (ok ? 1 : 0)), 400);
          }}
        />
      )}

      {session.mode === "cloze" && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <p className="text-base leading-relaxed">
              {(word.exampleEn || "").replace(new RegExp(word.word, "i"), "_____")}
            </p>
            <Input
              value={session.typed}
              onChange={(e) => setSession({ ...session, typed: e.target.value })}
              placeholder={t("practice.typeAnswer")}
              autoFocus
            />
            <Button
              onClick={async () => {
                const ok = session.typed.trim().toLowerCase() === word.word.toLowerCase();
                toast[ok ? "success" : "error"](
                  ok ? t("common.correct") : `${t("common.incorrect")}: ${word.word}`
                );
                await rateWord(session.library, word.id, ok ? RATING.GOOD : RATING.AGAIN);
                advance(session.score + (ok ? 1 : 0));
              }}
            >
              {t("common.submit")}
            </Button>
          </CardContent>
        </Card>
      )}

      {session.mode === "writing" && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            <p className="word-headword">{word.word}</p>
            <p className="text-sm text-muted-foreground">
              {t("practice.writingPrompt")}{" "}
              <span dir="rtl">{word.translationAr}</span>
            </p>
            <Textarea
              value={session.writing}
              onChange={(e) => setSession({ ...session, writing: e.target.value })}
              rows={4}
            />
            <p className="text-sm font-medium">{t("practice.selfCheck")}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                disabled={!session.writing.trim()}
                onClick={async () => {
                  await rateWord(session.library, word.id, RATING.GOOD);
                  await bumpActivity({ practiced: 1 });
                  advance(session.score + 1);
                }}
              >
                {t("practice.markGood")}
              </Button>
              <Button
                variant="outline"
                disabled={!session.writing.trim()}
                onClick={async () => {
                  await rateWord(session.library, word.id, RATING.HARD);
                  await bumpActivity({ practiced: 1 });
                  advance(session.score);
                }}
              >
                {t("practice.markHard")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </PracticeSessionLayout>
  );
}

function ChoiceBlock({ prompt, hint, options, correctId, onAnswer }) {
  const [picked, setPicked] = useState(null);
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base font-medium leading-relaxed">{prompt}</CardTitle>
        {hint && <CardDescription>{hint}</CardDescription>}
      </CardHeader>
      <CardContent className="grid gap-2">
        {options.map((opt) => {
          const selected = picked === opt.id;
          const correct = opt.id === correctId;
          return (
            <Button
              key={opt.id}
              variant="outline"
              className={cn(
                "h-auto min-h-11 justify-start whitespace-normal py-3 text-start",
                selected && correct && "border-success bg-success/10",
                selected && !correct && "border-destructive bg-destructive/10"
              )}
              disabled={!!picked}
              onClick={() => {
                setPicked(opt.id);
                onAnswer(opt.id === correctId);
              }}
            >
              <span dir={opt.rtl ? "rtl" : undefined}>{opt.label}</span>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}
