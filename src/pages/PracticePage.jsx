import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  Layers,
  ListChecks,
  Mail,
  PenLine,
  ScanSearch,
  SpellCheck,
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
  getCategoryMetaSync,
  getLibraryWordsSync,
} from "@/lib/vocabCatalog";
import {
  bumpActivity,
  getAllBookmarks,
  getAllProgress,
  maybeCelebrateBusinessGoal,
  rateWord,
} from "@/lib/db";
import { isDue, RATING } from "@/lib/srs";
import { normalizeHeadword, parsePracticeSearch } from "@/lib/practiceUrl";
import businessExamPacks from "@/data/businessExamPacks";
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

function blankExample(word) {
  const ex = word.exampleEn || "";
  if (!ex) return null;
  try {
    return ex.replace(new RegExp(word.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), "_____");
  } catch {
    return null;
  }
}

async function pickPool(library, category, count, { focus, difficulties, mode } = {}) {
  let pool = getPool(library);
  if (category) pool = pool.filter((w) => (w.categories || []).includes(category));
  if (difficulties?.length) {
    pool = pool.filter((w) => difficulties.includes(w.difficulty));
  }

  if (focus === "bookmarked") {
    const bms = await getAllBookmarks(library);
    const ids = new Set(bms.map((b) => b.wordId));
    pool = pool.filter((w) => ids.has(w.id));
  } else if (focus === "struggling" || focus === "due") {
    const progress = await getAllProgress(library);
    const map = new Map(progress.map((p) => [p.wordId, p]));
    if (focus === "struggling") {
      pool = pool.filter((w) => {
        const p = map.get(w.id);
        return p && (p.mastery || 0) > 0 && (p.mastery || 0) <= 2;
      });
    } else {
      pool = pool.filter((w) => {
        const p = map.get(w.id);
        return p && isDue(p);
      });
    }
  }

  if (mode === "cloze" || mode === "scenario") {
    pool = pool.filter((w) => blankExample(w));
  }
  if (mode === "spelling") {
    const hard = pool.filter(
      (w) =>
        ["B2", "C1"].includes(w.difficulty) || String(w.word || "").includes(" ")
    );
    if (hard.length >= Math.min(count, 5)) pool = hard;
  }

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

function arabicExplainScore(typed, word) {
  const source = `${word.explanationAr || ""} ${word.translationAr || ""}`.trim();
  if (!typed.trim() || !source) return null;
  const tokens = typed
    .trim()
    .split(/\s+/)
    .filter((t) => t.length >= 2);
  if (!tokens.length) return 0;
  const hits = tokens.filter((t) => source.includes(t)).length;
  return hits / tokens.length;
}

const MODES = [
  { id: "flashcards", titleKey: "flashcards", descKey: "flashcardsDesc", icon: Layers },
  { id: "quiz", titleKey: "quiz", descKey: "quizDesc", icon: ListChecks },
  { id: "cloze", titleKey: "cloze", descKey: "clozeDesc", icon: TextCursorInput },
  { id: "recognition", titleKey: "recognition", descKey: "recognitionDesc", icon: ScanSearch },
  { id: "writing", titleKey: "writing", descKey: "writingDesc", icon: PenLine },
  { id: "scenario", titleKey: "scenario", descKey: "scenarioDesc", icon: Mail },
  { id: "spelling", titleKey: "spelling", descKey: "spellingDesc", icon: SpellCheck },
];

export default function PracticePage() {
  const { t, lang } = useI18n();
  const [searchParams] = useSearchParams();
  const [mode, setMode] = useState("flashcards");
  const [library, setLibrary] = useState("toefl");
  const [count, setCount] = useState("10");
  const [category, setCategory] = useState("");
  const [focus, setFocus] = useState("");
  const [difficulties, setDifficulties] = useState([]);
  const [session, setSession] = useState(null);
  const [ready, setReady] = useState(false);
  const [catalogTick, setCatalogTick] = useState(0);
  const [queryHydrated, setQueryHydrated] = useState(false);
  const autostartDone = useRef(false);

  useEffect(() => {
    const parsed = parsePracticeSearch(searchParams);
    if (parsed.pack) {
      const pack = businessExamPacks.find((p) => p.id === parsed.pack);
      if (pack) {
        setLibrary("business");
        setMode(pack.mode || "flashcards");
        setCategory(pack.category || "");
        setCount(String(pack.count || 12));
        setDifficulties(pack.difficulties || []);
        setFocus("");
        setQueryHydrated(true);
        return;
      }
    }
    if (parsed.library) setLibrary(parsed.library);
    if (parsed.mode) setMode(parsed.mode);
    if (parsed.category) setCategory(parsed.category);
    if (parsed.count) setCount(parsed.count);
    if (parsed.focus) setFocus(parsed.focus);
    if (parsed.difficulties?.length) setDifficulties(parsed.difficulties);
    setQueryHydrated(true);
  }, [searchParams]);

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

  const categoryMeta = useMemo(() => {
    void catalogTick;
    return getCategoryMetaSync(library);
  }, [library, catalogTick]);

  const labelCategory = (id) => {
    const meta = categoryMeta.find((x) => x.id === id);
    if (!meta) return id;
    return lang === "ar" ? meta.labelAr : meta.labelEn;
  };

  const start = async () => {
    if (!ready) return;
    const n = Number(count) || 10;
    const words = await pickPool(library, category, n, {
      focus,
      difficulties,
      mode,
    });
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
      arabicExplain: "",
      showArabicCheck: false,
      done: false,
      rated: 0,
    });
  };

  useEffect(() => {
    if (!queryHydrated || !ready || autostartDone.current) return;
    const parsed = parsePracticeSearch(searchParams);
    if (!parsed.autostart && !parsed.pack) return;
    autostartDone.current = true;
    start();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryHydrated, ready, searchParams, library, mode, category, count, focus]);

  const advance = async (nextScore = session.score) => {
    if (session.index >= session.words.length - 1) {
      await bumpActivity({
        practiced: session.words.length,
        quizzes: session.mode !== "flashcards" ? 1 : 0,
      });
      if (session.library === "business") {
        const { getActivityRange } = await import("@/lib/db");
        const days = await getActivityRange(1);
        const today = days[days.length - 1];
        const celebrated = await maybeCelebrateBusinessGoal(today?.businessPracticed || 0);
        if (celebrated) toast.success(t("vocab.goalComplete"));
      }
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
      arabicExplain: "",
      showArabicCheck: false,
      score: nextScore,
    });
  };

  const handleRate = async (rating) => {
    const word = session.words[session.index];
    await rateWord(session.library, word.id, rating);
    if (session.library === "business") {
      const { getActivityRange } = await import("@/lib/db");
      const days = await getActivityRange(1);
      const today = days[days.length - 1];
      const celebrated = await maybeCelebrateBusinessGoal(today?.businessPracticed || 0);
      if (celebrated) toast.success(t("vocab.goalComplete"));
    }
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
                  <SelectItem value="toefl">{t("vocab.libraryToefl")}</SelectItem>
                  <SelectItem value="business">{t("vocab.libraryBusiness")}</SelectItem>
                  <SelectItem value="general">{t("vocab.libraryGeneral")}</SelectItem>
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
                      {labelCategory(c)}
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
            {library === "business" && (
              <div className="space-y-1.5 sm:col-span-3">
                <Label>{t("practice.focus")}</Label>
                <Select
                  value={focus || "__none__"}
                  onValueChange={(v) => setFocus(v === "__none__" ? "" : v)}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__none__">{t("common.all")}</SelectItem>
                    <SelectItem value="struggling">{t("common.struggling")}</SelectItem>
                    <SelectItem value="due">{t("common.due")}</SelectItem>
                    <SelectItem value="bookmarked">{t("common.bookmarks")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="sm:col-span-3">
              <Button onClick={start} disabled={!ready} className="min-h-11">
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
  const modeTitle = t(
    `practice.${MODES.find((m) => m.id === session.mode)?.titleKey || "flashcards"}`
  );
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

      {session.mode === "scenario" && (
        <ChoiceBlock
          key={word.id}
          prompt={
            <div className="space-y-2">
              <p className="text-meta">{t("practice.scenarioHint")}</p>
              <p className="text-base leading-relaxed">{blankExample(word)}</p>
            </div>
          }
          options={distractors(pool, word).map((o) => ({
            id: o.id,
            label: o.word,
          }))}
          correctId={word.id}
          onAnswer={async (ok) => {
            await rateWord(session.library, word.id, ok ? RATING.GOOD : RATING.AGAIN);
            setTimeout(() => advance(session.score + (ok ? 1 : 0)), 400);
          }}
        />
      )}

      {(session.mode === "cloze" || session.mode === "spelling") && (
        <Card>
          <CardContent className="space-y-4 pt-6">
            {session.mode === "cloze" ? (
              <p className="text-base leading-relaxed">{blankExample(word)}</p>
            ) : (
              <div className="space-y-2">
                <p dir="rtl" className="text-base font-medium">
                  {word.translationAr}
                </p>
                <p className="text-sm text-muted-foreground">{word.definitionEn}</p>
                <p className="text-meta">{t("practice.spellingHint")}</p>
              </div>
            )}
            <Input
              value={session.typed}
              onChange={(e) => setSession({ ...session, typed: e.target.value })}
              placeholder={t("practice.typeAnswer")}
              autoFocus
            />
            <Button
              className="min-h-11"
              onClick={async () => {
                const ok =
                  normalizeHeadword(session.typed) === normalizeHeadword(word.word);
                toast[ok ? "success" : "error"](
                  ok ? t("common.correct") : `${t("common.incorrect")}: ${word.word}`
                );
                await rateWord(session.library, word.id, ok ? RATING.GOOD : RATING.AGAIN);
                if (session.mode === "spelling" && word.explanationAr) {
                  setSession({ ...session, showArabicCheck: true, revealed: true });
                } else {
                  advance(session.score + (ok ? 1 : 0));
                }
              }}
            >
              {t("common.submit")}
            </Button>
            {session.showArabicCheck && (
              <div className="space-y-2 rounded-lg border bg-muted/40 p-3">
                <p className="text-sm font-medium">{t("practice.arabicExplainPrompt")}</p>
                <Textarea
                  dir="rtl"
                  rows={3}
                  value={session.arabicExplain}
                  onChange={(e) => setSession({ ...session, arabicExplain: e.target.value })}
                />
                <Button
                  variant="outline"
                  className="min-h-11"
                  onClick={() => {
                    const score = arabicExplainScore(session.arabicExplain, word);
                    if (score == null) {
                      advance(session.score + 1);
                      return;
                    }
                    toast.message(
                      score >= 0.4
                        ? t("practice.arabicExplainOk")
                        : t("practice.arabicExplainWeak")
                    );
                    advance(session.score + 1);
                  }}
                >
                  {t("common.next")}
                </Button>
              </div>
            )}
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
                className="min-h-11"
                disabled={!session.writing.trim()}
                onClick={async () => {
                  await rateWord(session.library, word.id, RATING.GOOD);
                  await bumpActivity({
                    practiced: 1,
                    ...(session.library === "business" ? { businessPracticed: 1 } : {}),
                  });
                  advance(session.score + 1);
                }}
              >
                {t("practice.markGood")}
              </Button>
              <Button
                variant="outline"
                className="min-h-11"
                disabled={!session.writing.trim()}
                onClick={async () => {
                  await rateWord(session.library, word.id, RATING.HARD);
                  await bumpActivity({
                    practiced: 1,
                    ...(session.library === "business" ? { businessPracticed: 1 } : {}),
                  });
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
