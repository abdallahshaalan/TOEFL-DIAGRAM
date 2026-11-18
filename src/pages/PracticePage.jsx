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
  getActivityRange,
  getAllBookmarks,
  getAllProgress,
  getIncludeDrafts,
  libraryReviewsKey,
  maybeCelebrateLibraryGoal,
  rateWord,
  undoLastRating,
} from "@/lib/db";
import { isDue, RATING, shouldRequeueInSession } from "@/lib/srs";
import { normalizeHeadword, parsePracticeSearch } from "@/lib/practiceUrl";
import { findExamPack } from "@/lib/examPacks";
import {
  arabicChoiceLabel,
  arabicChoiceRtl,
  hitsTemplatePhrase,
  isArabicAnswerSafe,
  isStudyQualityOk,
} from "@/lib/vocabQuality";
import { filterExamPackWords } from "@/lib/examPacks";
import SpeakButton from "@/components/shared/SpeakButton";
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
import { cn } from "@/lib/cn";

async function celebrateLibraryGoal(library, t) {
  const days = await getActivityRange(1);
  const today = days[days.length - 1];
  const key = libraryReviewsKey(library);
  const celebrated = await maybeCelebrateLibraryGoal(library, today?.[key] || 0);
  if (celebrated) toast.success(t("vocab.goalComplete"));
}

function modeCopyKeys(modeId, library) {
  if (modeId === "scenario" && library === "business") {
    return { titleKey: "scenarioBusiness", descKey: "scenarioBusinessDesc" };
  }
  const base = MODES.find((m) => m.id === modeId);
  return { titleKey: base?.titleKey || modeId, descKey: base?.descKey || `${modeId}Desc` };
}

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

async function pickPool(
  library,
  category,
  count,
  { focus, difficulties, mode, includeDrafts, examPackOkOnly } = {}
) {
  let pool = getPool(library);
  if (category) pool = pool.filter((w) => (w.categories || []).includes(category));
  if (difficulties?.length) {
    pool = pool.filter((w) => difficulties.includes(w.difficulty));
  }
  if (examPackOkOnly) {
    pool = filterExamPackWords(pool);
  } else if (!includeDrafts) {
    pool = pool.filter((w) => w.quality !== "draft" && w.quality !== "legacy");
  } else {
    pool = pool.filter((w) => w.quality !== "legacy");
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

  if (mode === "quiz") {
    const arabicSafe = pool.filter(isArabicAnswerSafe);
    if (arabicSafe.length >= Math.min(count, 4)) pool = arabicSafe;
  }
  if (mode === "cloze" || mode === "scenario") {
    pool = pool.filter(
      (w) => blankExample(w) && isStudyQualityOk(w) && !hitsTemplatePhrase(w)
    );
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
  const rest = pool.filter((w) => w.id !== correct.id);
  const sameDiff = rest.filter(
    (w) => w.difficulty && correct.difficulty && w.difficulty === correct.difficulty
  );
  const samePos = rest.filter((w) => w.pos && w.pos === correct.pos);
  const sameCat = rest.filter((w) =>
    (w.categories || []).some((c) => (correct.categories || []).includes(c))
  );
  const preferred = shuffle([
    ...sameDiff,
    ...sameCat.filter((w) => !sameDiff.includes(w)),
    ...samePos.filter((w) => !sameDiff.includes(w) && !sameCat.includes(w)),
  ]);
  const fallback = shuffle(rest.filter((w) => !preferred.includes(w)));
  const others = [...preferred, ...fallback].slice(0, n);
  while (others.length < n) {
    const extra = rest.find((w) => !others.find((o) => o.id === w.id));
    if (!extra) break;
    others.push(extra);
  }
  return shuffle([correct, ...others]);
}

function normalizeTyped(a, b, gentle) {
  const left = normalizeHeadword(a);
  const right = normalizeHeadword(b);
  if (left === right) return true;
  if (!gentle) return false;
  if (Math.abs(left.length - right.length) > 2) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < left.length && j < right.length) {
    if (left[i] === right[j]) {
      i += 1;
      j += 1;
      continue;
    }
    edits += 1;
    if (edits > 2) return false;
    if (left.length > right.length) i += 1;
    else if (right.length > left.length) j += 1;
    else {
      i += 1;
      j += 1;
    }
  }
  edits += left.length - i + (right.length - j);
  return edits <= 2;
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
  const [exitOpen, setExitOpen] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const undoSessionSnap = useRef(null);
  const gentleSpelling = true;
  const autostartDone = useRef(false);

  useEffect(() => {
    const parsed = parsePracticeSearch(searchParams);
    if (parsed.pack) {
      const pack = findExamPack(parsed.pack);
      if (pack) {
        setLibrary(pack.library);
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
    const includeDrafts = await getIncludeDrafts();
    const parsed = parsePracticeSearch(searchParams);
    const examPackOkOnly = Boolean(parsed.pack);
    const words = await pickPool(library, category, n, {
      focus,
      difficulties,
      mode,
      includeDrafts,
      examPackOkOnly,
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
      // Cards already called rateWord (ratings/reviews). Only count a quiz completion once.
      if (session.mode !== "flashcards") {
        await bumpActivity({ quizzes: 1 });
      }
      await celebrateLibraryGoal(session.library, t);
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
    undoSessionSnap.current = {
      index: session.index,
      score: session.score,
      words: session.words,
      revealed: session.revealed,
    };
    const updated = await rateWord(session.library, word.id, rating);
    setCanUndo(true);
    await celebrateLibraryGoal(session.library, t);
    const nextScore = session.score + (rating >= 3 ? 1 : 0);

    if (session.mode === "flashcards" && shouldRequeueInSession(updated)) {
      const rest = [
        ...session.words.slice(0, session.index),
        ...session.words.slice(session.index + 1),
      ];
      rest.push(word);
      if (rest.length === 0) {
        setSession({ ...session, words: [word], index: 0, revealed: false, score: nextScore });
        return;
      }
      setSession({
        ...session,
        words: rest,
        index: Math.min(session.index, rest.length - 1),
        revealed: false,
        score: nextScore,
        choice: null,
        typed: "",
      });
      return;
    }

    await advance(nextScore);
  };

  const handleUndo = async () => {
    const snap = await undoLastRating();
    if (!snap) {
      toast.error(t("review.undoEmpty"));
      return;
    }
    const prev = undoSessionSnap.current;
    if (prev && session) {
      setSession({
        ...session,
        index: prev.index,
        score: prev.score,
        words: prev.words,
        revealed: false,
        done: false,
        choice: null,
        typed: "",
      });
    }
    undoSessionSnap.current = null;
    setCanUndo(false);
    toast.success(t("review.undoDone"));
  };

  useEffect(() => {
    if (!session || session.done) return undefined;
    const onKey = (e) => {
      if (e.key === "Escape") {
        setExitOpen(true);
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
          {MODES.map((m) => {
            const copy = modeCopyKeys(m.id, library);
            return (
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
                  {t(`practice.${copy.titleKey}`)}
                </div>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {t(`practice.${copy.descKey}`)}
                </p>
              </div>
            </button>
            );
          })}
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
  const modeTitle = t(`practice.${modeCopyKeys(session.mode, session.library).titleKey}`);
  const pool = getPool(session.library);
  const scenarioHint =
    session.library === "business"
      ? t("practice.scenarioBusinessHint")
      : t("practice.scenarioHint");

  return (
    <PracticeSessionLayout
      title={modeTitle}
      library={session.library}
      index={session.index}
      total={session.words.length}
      onExit={() => setExitOpen(true)}
    >
      <AlertDialog open={exitOpen} onOpenChange={setExitOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("practice.exitConfirmTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("practice.exitConfirmDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={() => setSession(null)}>{t("common.exit")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {session.mode === "flashcards" && (
        <>
          <Flashcard
            word={word}
            revealed={session.revealed}
            onReveal={() => setSession({ ...session, revealed: true })}
            onRate={handleRate}
          />
          <div className="mt-3">
            <Button
              type="button"
              variant="outline"
              className="min-h-11"
              disabled={!canUndo}
              onClick={handleUndo}
            >
              {t("common.undo")}
            </Button>
          </div>
        </>
      )}

      {session.mode === "quiz" && (
        <ChoiceBlock
          key={word.id}
          prompt={<span className="word-headword">{word.word}</span>}
          hint={t("practice.chooseArabic")}
          options={distractors(
            pool.filter((w) => w.id === word.id || isArabicAnswerSafe(w)),
            word
          ).map((o) => ({
            id: o.id,
            label: arabicChoiceLabel(o),
            rtl: arabicChoiceRtl(o),
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
              <div className="flex items-center justify-between gap-2">
                <p className="text-meta">{scenarioHint}</p>
                <SpeakButton text={word.exampleEn} labelKey="common.pronounceSentence" />
              </div>
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
              <div className="space-y-2">
                <div className="flex justify-end">
                  <SpeakButton text={word.exampleEn} labelKey="common.pronounceSentence" />
                </div>
                <p className="text-base leading-relaxed">{blankExample(word)}</p>
              </div>
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
                const ok = normalizeTyped(session.typed, word.word, gentleSpelling);
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
                  // rateWord already bumps practiced + library-scoped counters
                  await rateWord(session.library, word.id, RATING.GOOD);
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
