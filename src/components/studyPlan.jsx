import { useEffect, useMemo, useState } from "react";
import { Check, Circle } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/cn";
import { useI18n } from "@/i18n";
import en from "@/i18n/en";
import ar from "@/i18n/ar";
import EmptyState from "@/components/shared/EmptyState";

function formatTpl(str, vars) {
  return String(str).replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? ""));
}

function generatePlan(topicsCatalog, locale) {
  const today = new Date();
  return Array.from({ length: 8 }, (_, w) => ({
    weekNumber: w + 1,
    days: Array.from({ length: 7 }, (_, d) => {
      const topic = topicsCatalog[d % topicsCatalog.length];
      const date = new Date(today);
      date.setDate(today.getDate() + w * 7 + d);
      return {
        id: `w${w + 1}d${d + 1}`,
        week: w + 1,
        topicIndex: d % topicsCatalog.length,
        dayOfWeek: date.toLocaleDateString(locale, { weekday: "short" }),
        dateString: date.toLocaleDateString(locale, { month: "short", day: "numeric" }),
        title: topic.label,
        tasks: topic.tasks,
        completed: false,
      };
    }),
  }));
}

function resolveDayLabels(day, topicsCatalog) {
  const topic = topicsCatalog[day.topicIndex ?? 0];
  if (!topic) return day;
  return { ...day, title: topic.label, tasks: topic.tasks };
}

export default function StudyPlan() {
  const { t, lang } = useI18n();
  const locale = lang === "ar" ? "ar" : "en-US";

  const topicsCatalog = useMemo(
    () => (lang === "ar" ? ar.studyPlanTool.topics : en.studyPlanTool.topics),
    [lang]
  );

  const [plan, setPlan] = useState([]);
  const [planReady, setPlanReady] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [filter, setFilter] = useState("all");
  const [resetOpen, setResetOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    import("@/lib/toolStorage").then(({ loadToolState }) => {
      loadToolState("toeflPlan_v3", null).then((saved) => {
        if (cancelled) return;
        if (saved && Array.isArray(saved)) {
          setPlan(
            saved.map((w) => ({
              ...w,
              days: w.days.map((d) => resolveDayLabels(d, topicsCatalog)),
            }))
          );
        } else {
          setPlan(generatePlan(topicsCatalog, locale));
        }
        setPlanReady(true);
      });
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only
  }, []);

  useEffect(() => {
    if (!planReady) return;
    setPlan((prev) =>
      prev.map((w) => ({
        ...w,
        days: w.days.map((d) => resolveDayLabels(d, topicsCatalog)),
      }))
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh labels when language changes
  }, [lang, topicsCatalog]);

  useEffect(() => {
    if (!planReady || !plan.length) return;
    import("@/lib/toolStorage").then(({ saveToolState }) => {
      saveToolState("toeflPlan_v3", plan);
    });
  }, [plan, planReady]);

  if (!planReady) {
    return <p className="text-sm text-muted-foreground">{t("common.loading")}</p>;
  }

  const allDays = plan.flatMap((w) => w.days);
  const doneDays = allDays.filter((d) => d.completed).length;
  const totalDays = allDays.length;
  const pct = Math.round((doneDays / totalDays) * 100);

  const computeStreak = () => {
    let streak = 0;
    for (let i = allDays.length - 1; i >= 0; i--) {
      if (allDays[i].completed) streak++;
      else break;
    }
    return streak;
  };

  const currentWeek = plan.find((w) => w.weekNumber === selectedWeek) || plan[0];

  const filteredDays = currentWeek.days.filter((d) => {
    if (filter === "done") return d.completed;
    if (filter === "pending") return !d.completed;
    return true;
  });

  const toggleDay = (id) => {
    setPlan(
      plan.map((w) => ({
        ...w,
        days: w.days.map((d) => (d.id === id ? { ...d, completed: !d.completed } : d)),
      }))
    );
  };

  const markWeekDone = () => {
    setPlan(
      plan.map((w) =>
        w.weekNumber === selectedWeek
          ? { ...w, days: w.days.map((d) => ({ ...d, completed: true })) }
          : w
      )
    );
  };

  const confirmReset = () => {
    setPlan(generatePlan(topicsCatalog, locale));
    setResetOpen(false);
  };

  const exportJSON = () => {
    const a = document.createElement("a");
    a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(plan, null, 2));
    a.download = `toefl-plan-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const filters = [
    { key: "all", label: t("studyPlanTool.filterAll") },
    { key: "pending", label: t("studyPlanTool.filterPending") },
    { key: "done", label: t("studyPlanTool.filterDone") },
  ];

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">{t("studyPlanTool.intro")}</p>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {[
          { value: doneDays, label: t("studyPlanTool.daysDone") },
          { value: `${pct}%`, label: t("studyPlanTool.progress") },
          { value: computeStreak(), label: t("studyPlanTool.dayStreak") },
          { value: totalDays - doneDays, label: t("studyPlanTool.daysLeft") },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-muted-foreground">{t("studyPlanTool.week")}:</span>
        <Select value={String(selectedWeek)} onValueChange={(v) => setSelectedWeek(Number(v))}>
          <SelectTrigger className="h-10 w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {plan.map((w) => (
              <SelectItem key={w.weekNumber} value={String(w.weekNumber)}>
                {formatTpl(t("studyPlanTool.weekN"), { n: w.weekNumber })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button type="button" className="min-h-10" onClick={markWeekDone}>
          {t("studyPlanTool.markWeekDone")}
        </Button>
        <Button type="button" variant="secondary" className="min-h-10" onClick={exportJSON}>
          {t("studyPlanTool.exportJson")}
        </Button>
        <Button type="button" variant="outline" className="min-h-10" onClick={() => setResetOpen(true)}>
          {t("studyPlanTool.reset")}
        </Button>
      </div>

      <div className="flex flex-col gap-4 lg:flex-row">
        <aside className="shrink-0 space-y-2 lg:w-52">
          <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">
            {t("studyPlanTool.weeksSidebar")}
          </p>
          <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {plan.map((w) => {
              const done = w.days.filter((d) => d.completed).length;
              const p = Math.round((done / w.days.length) * 100);
              return (
                <button
                  key={w.weekNumber}
                  type="button"
                  className={cn(
                    "min-w-[110px] rounded-lg border p-3 text-start transition-colors lg:min-w-0",
                    w.weekNumber === selectedWeek
                      ? "border-primary/40 bg-primary/5"
                      : "border-border hover:bg-muted/50"
                  )}
                  onClick={() => setSelectedWeek(w.weekNumber)}
                >
                  <p className="text-sm font-bold text-primary">
                    {formatTpl(t("studyPlanTool.weekN"), { n: w.weekNumber })}
                  </p>
                  <div className="mt-2 h-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary" style={{ width: `${p}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {done}/{w.days.length}
                  </p>
                </button>
              );
            })}
          </div>
        </aside>

        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <h2 className="text-lg font-semibold">
              {formatTpl(t("studyPlanTool.weekDailyTitle"), { n: currentWeek.weekNumber })}
            </h2>
            <p className="text-sm text-muted-foreground">
              {formatTpl(t("studyPlanTool.weekDailySub"), {
                done: currentWeek.days.filter((d) => d.completed).length,
                total: currentWeek.days.length,
              })}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map(({ key, label }) => (
              <Button
                key={key}
                type="button"
                size="sm"
                variant={filter === key ? "default" : "outline"}
                onClick={() => setFilter(key)}
              >
                {label}
              </Button>
            ))}
          </div>

          {filteredDays.length === 0 ? (
            <EmptyState title={t("studyPlanTool.emptyTitle")} description={t("studyPlanTool.emptyFilter")} />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {filteredDays.map((d) => (
                <Card
                  key={d.id}
                  className={cn("overflow-hidden", d.completed && "border-green-300/80 bg-green-50/50 dark:bg-green-950/20")}
                >
                  <div className="h-1 bg-primary" />
                  <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
                    <div className="min-w-0">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                        {d.dayOfWeek} · {d.dateString}
                      </p>
                      <CardTitle className="text-sm leading-snug">{d.title}</CardTitle>
                      <p className="mt-1 font-mono text-[10px] text-muted-foreground/70">{d.id}</p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className={cn("h-9 w-9 shrink-0 rounded-full", d.completed && "border-green-400 bg-green-100 text-green-800")}
                      onClick={() => toggleDay(d.id)}
                      aria-label={d.completed ? t("studyPlanTool.markIncomplete") : t("studyPlanTool.markComplete")}
                    >
                      {d.completed ? <Check className="h-4 w-4" aria-hidden /> : <Circle className="h-4 w-4" aria-hidden />}
                    </Button>
                  </CardHeader>
                  <CardContent className="space-y-2 pb-4">
                    {d.tasks.map((task, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-muted-foreground">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        <span>{task}</span>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="text-center text-xs text-muted-foreground">{t("studyPlanTool.footerNote")}</p>

      <AlertDialog open={resetOpen} onOpenChange={setResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("studyPlanTool.resetTitle")}</AlertDialogTitle>
            <AlertDialogDescription>{t("studyPlanTool.resetDescription")}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmReset}>{t("studyPlanTool.resetConfirm")}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}