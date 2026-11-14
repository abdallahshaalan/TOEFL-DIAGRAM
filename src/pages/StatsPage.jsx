import { Link } from "react-router-dom";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useI18n } from "@/i18n";
import { useLearningStats } from "@/hooks/useLearningStats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { CHART_COLORS, formatChartDate } from "@/lib/charts";

export default function StatsPage() {
  const { t, lang } = useI18n();
  const { loading, stats } = useLearningStats();

  if (loading || !stats) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const hasData =
    stats.progress.length > 0 ||
    stats.activity.some((a) => a.reviews + a.practiced + a.quizzes > 0);

  if (!hasData) {
    return (
      <div className="space-y-5">
        <PageHeader title={t("stats.title")} subtitle={t("stats.subtitle")} />
        <EmptyState
          title={t("stats.empty")}
          primaryAction={{ label: t("dashboard.startPractice"), href: "/practice" }}
          secondaryAction={{ label: t("dashboard.startReview"), href: "/review" }}
        />
      </div>
    );
  }

  const activity = stats.activity.map((a) => ({
    ...a,
    label: formatChartDate(a.date, lang),
  }));

  const masteryDist = stats.masteryDist.map((row) => ({
    ...row,
    label:
      row.level === "0"
        ? t("common.new")
        : row.level === "1"
          ? t("ratings.again")
          : row.level === "2"
            ? t("ratings.hard")
            : row.level === "3"
              ? t("ratings.good")
              : t("ratings.easy"),
  }));

  const libraryCompare = [
    {
      name: t("vocab.libraryToefl"),
      [t("stats.practiced")]: stats.toeflPracticed,
      [t("stats.total")]: stats.toeflTotal,
    },
    {
      name: t("vocab.libraryGeneral"),
      [t("stats.practiced")]: stats.generalPracticed,
      [t("stats.total")]: stats.generalTotal,
    },
  ];

  const tipStyle = {
    background: "hsl(var(--card))",
    border: "1px solid hsl(var(--border))",
    borderRadius: 8,
  };

  return (
    <div className="space-y-6">
      <PageHeader title={t("stats.title")} subtitle={t("stats.subtitle")} />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatPill label={t("common.difficult")} value={stats.difficultCount} />
        <StatPill label={t("common.mastered")} value={stats.masteredCount} />
        <StatPill label={t("common.due")} value={stats.dueCount} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold tracking-tight">{t("dashboard.weekly")}</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={activity}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" fontSize={11} tickLine={false} />
                <YAxis allowDecimals={false} fontSize={11} tickLine={false} />
                <Tooltip contentStyle={tipStyle} />
                <Legend />
                <Line type="monotone" dataKey="reviews" stroke={CHART_COLORS[1]} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="practiced" stroke={CHART_COLORS[2]} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="quizzes" stroke={CHART_COLORS[3]} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold tracking-tight">{t("dashboard.masteryDist")}</CardTitle>
            <CardDescription>{t("stats.masteryLegend")}</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={masteryDist}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="label" fontSize={11} tickLine={false} />
                <YAxis allowDecimals={false} fontSize={11} tickLine={false} />
                <Tooltip contentStyle={tipStyle} />
                <Bar dataKey="count" fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base font-semibold tracking-tight">{t("stats.libraryCompare")}</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={libraryCompare}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip contentStyle={tipStyle} />
                <Legend />
                <Bar dataKey={t("stats.practiced")} fill={CHART_COLORS[1]} radius={[4, 4, 0, 0]} />
                <Bar dataKey={t("stats.total")} fill={CHART_COLORS[5]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-2">
        <ButtonLink to="/review" label={t("dashboard.startReview")} />
        <ButtonLink to="/practice" label={t("dashboard.startPractice")} />
      </div>
    </div>
  );
}

function StatPill({ label, value }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between p-4">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-xl font-semibold tabular-nums">{value}</span>
      </CardContent>
    </Card>
  );
}

function ButtonLink({ to, label }) {
  return (
    <Link
      to={to}
      className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-card px-4 text-sm font-medium hover:bg-accent"
    >
      {label}
    </Link>
  );
}
