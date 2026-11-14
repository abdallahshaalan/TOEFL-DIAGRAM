import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BookOpen, ChevronRight, Clock, Flame, GraduationCap } from "lucide-react";
import { useI18n } from "@/i18n";
import { useLearningStats } from "@/hooks/useLearningStats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import PageHeader from "@/components/shared/PageHeader";
import IconTile from "@/components/shared/IconTile";
import { TOOLS_CATALOG } from "@/lib/toolsCatalog";
import { CHART_COLORS, formatChartDate } from "@/lib/charts";
import { cn } from "@/lib/cn";

export default function DashboardPage() {
  const { t, lang } = useI18n();
  const { loading, stats } = useLearningStats();

  if (loading || !stats) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  const weekly = stats.activity.slice(-7).map((a) => ({
    date: a.date,
    label: formatChartDate(a.date, lang),
    activity: (a.practiced || 0) + (a.reviews || 0) + (a.quizzes || 0),
  }));
  const hasActivity = weekly.some((a) => a.activity > 0);
  const recentDays = [...stats.activity]
    .reverse()
    .filter((a) => (a.practiced || 0) + (a.reviews || 0) + (a.quizzes || 0) > 0)
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader title={t("dashboard.title")} subtitle={t("dashboard.subtitle")} />

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="space-y-1 p-4 pb-3">
          <CardTitle className="text-base font-semibold tracking-tight">
            {stats.dueCount > 0 ? t("dashboard.heroDue") : t("dashboard.heroPractice")}
          </CardTitle>
          <CardDescription>
            {stats.dueCount > 0
              ? `${stats.dueCount} ${t("common.due").toLowerCase()}`
              : `${t("dashboard.todayPracticed")}: ${stats.todayPracticed}`}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2 px-4 pb-4">
          {stats.dueCount > 0 ? (
            <Button asChild className="min-h-11">
              <Link to="/review">{t("dashboard.startReview")}</Link>
            </Button>
          ) : (
            <Button asChild className="min-h-11">
              <Link to="/practice">{t("dashboard.startPractice")}</Link>
            </Button>
          )}
          <Button asChild variant="outline" className="min-h-11">
            <Link to="/vocab/toefl">{t("dashboard.startToefl")}</Link>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label={t("dashboard.toeflLearned")}
          value={`${stats.toeflPracticed}/${stats.toeflTotal}`}
          icon={GraduationCap}
          progress={stats.toeflTotal ? (stats.toeflPracticed / stats.toeflTotal) * 100 : 0}
          showProgress
        />
        <MetricCard
          label={t("dashboard.generalLearned")}
          value={`${stats.generalPracticed}/${stats.generalTotal}`}
          icon={BookOpen}
          progress={stats.generalTotal ? (stats.generalPracticed / stats.generalTotal) * 100 : 0}
          showProgress
        />
        <MetricCard label={t("dashboard.dueReviews")} value={stats.dueCount} icon={Clock} />
        <MetricCard label={t("dashboard.streak")} value={stats.streak} icon={Flame} />
      </div>

      <section className="space-y-3" aria-labelledby="dashboard-tools-heading">
        <div className="space-y-1">
          <h2 id="dashboard-tools-heading" className="text-section">
            {t("dashboard.toolsTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">{t("dashboard.toolsSubtitle")}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {TOOLS_CATALOG.map((tool) => (
            <Link
              key={tool.id}
              to={tool.to}
              className={cn(
                "group flex h-full gap-3 rounded-lg border bg-card p-3.5 text-start shadow-sm transition-colors",
                "hover:border-primary/30 hover:bg-accent/40",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              )}
            >
              <IconTile icon={tool.icon} size="md" />
              <div className="min-w-0 flex-1 space-y-0.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm font-semibold leading-snug tracking-tight">
                    {t(tool.titleKey)}
                  </div>
                  <ChevronRight
                    className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground opacity-60 transition-opacity group-hover:opacity-100 rtl:rotate-180"
                    aria-hidden
                  />
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground">{t(tool.descKey)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-5">
        <Card className="lg:col-span-3">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base font-semibold tracking-tight">
              {t("dashboard.weekly")}
            </CardTitle>
            <CardDescription>
              {t("dashboard.todayPracticed")}: {stats.todayPracticed}
            </CardDescription>
          </CardHeader>
          <CardContent className="h-64 px-4 pb-4">
            {hasActivity ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekly}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="label" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    formatter={(value) => [value, t("dashboard.activityLabel")]}
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: 8,
                    }}
                  />
                  <Bar dataKey="activity" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                {t("dashboard.emptyCharts")}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-base font-semibold tracking-tight">
              {t("dashboard.recent")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 px-4 pb-4">
            {recentDays.length === 0 ? (
              <p className="text-sm text-muted-foreground">{t("dashboard.noRecent")}</p>
            ) : (
              recentDays.map((day) => (
                <div
                  key={day.date}
                  className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                >
                  <span>{formatChartDate(day.date, lang)}</span>
                  <span className="font-medium tabular-nums">
                    {(day.practiced || 0) + (day.reviews || 0) + (day.quizzes || 0)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, progress = 0, showProgress = false }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
        <CardDescription className="pe-2 leading-snug">{label}</CardDescription>
        <IconTile icon={Icon} size="sm" />
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="text-2xl font-semibold tabular-nums tracking-tight">{value}</div>
        {showProgress && <Progress value={progress} className="mt-3" />}
      </CardContent>
    </Card>
  );
}
