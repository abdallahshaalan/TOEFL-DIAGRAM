import { useMemo, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  Clock,
  Headphones,
  MessageCircle,
  Mic,
  PenLine,
  Target,
} from "lucide-react";
import { useI18n } from "@/i18n";
import en from "@/i18n/en";
import ar from "@/i18n/ar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import FilterBar from "@/components/shared/FilterBar";
import EmptyState from "@/components/shared/EmptyState";
import { cn } from "@/lib/cn";

const SECTION_META = [
  {
    id: "reading",
    icon: BookOpen,
    bars: [
      { key: "vocab", v: 25 },
      { key: "inference", v: 20 },
      { key: "mainIdea", v: 30 },
      { key: "detail", v: 25 },
    ],
  },
  {
    id: "listening",
    icon: Headphones,
    bars: [
      { key: "mainIdea", v: 28 },
      { key: "function", v: 22 },
      { key: "inference", v: 30 },
      { key: "organization", v: 20 },
    ],
  },
  {
    id: "speaking",
    icon: Mic,
    bars: [
      { key: "independent", v: 25 },
      { key: "rl", v: 28 },
      { key: "ls", v: 28 },
      { key: "campus", v: 19 },
    ],
  },
  {
    id: "writing",
    icon: PenLine,
    bars: [
      { key: "integrated", v: 50 },
      { key: "independent", v: 50 },
    ],
  },
];

const ADVICE_ICONS = [Target, Clock, BookOpen, MessageCircle];

function bandKey(total) {
  if (total >= 100) return "advanced";
  if (total >= 80) return "upperIntermediate";
  if (total >= 60) return "intermediate";
  return "foundation";
}

export default function TOEFLGuide() {
  const { t, lang } = useI18n();
  const guide = useMemo(() => (lang === "ar" ? ar.tools.guide : en.tools.guide), [lang]);

  const [query, setQuery] = useState("");
  const [openSection, setOpenSection] = useState(null);
  const [openQuestion, setOpenQuestion] = useState({});
  const [scores, setScores] = useState({ r: 22, l: 20, s: 18, w: 19 });

  const total = scores.r + scores.l + scores.s + scores.w;
  const band = t(`tools.guide.bands.${bandKey(total)}`);

  const sections = useMemo(
    () =>
      SECTION_META.map((meta) => {
        const copy = guide.sections[meta.id] || {};
        return {
          ...copy,
          id: meta.id,
          icon: meta.icon,
          barDefs: meta.bars,
          barLabels: copy.bars || {},
        };
      }),
    [guide]
  );

  const filteredSections = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sections;
    return sections.filter(
      (s) =>
        s.title?.toLowerCase().includes(q) ||
        s.desc?.toLowerCase().includes(q) ||
        s.types?.some((qt) => qt.name.toLowerCase().includes(q) || qt.exp.toLowerCase().includes(q))
    );
  }, [sections, query]);

  const toggleSection = (id) => {
    setOpenSection(openSection === id ? null : id);
    setOpenQuestion({});
  };

  const toggleQuestion = (sectionId, index) => {
    setOpenQuestion((prev) => ({
      ...prev,
      [sectionId]: prev[sectionId] === index ? null : index,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <Badge variant="secondary">{t("tools.guide.heroBadge")}</Badge>
        <p className="mx-auto max-w-xl text-sm text-muted-foreground">{t("tools.guide.disclaimer")}</p>
      </div>

      <FilterBar query={query} onQueryChange={setQuery} searchPlaceholder={t("tools.guide.searchPlaceholder")} />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{t("tools.guide.estimatorTitle")}</CardTitle>
          <p className="text-sm text-muted-foreground">{t("tools.guide.estimatorSub")}</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { key: "r", id: "reading" },
              { key: "l", id: "listening" },
              { key: "s", id: "speaking" },
              { key: "w", id: "writing" },
            ].map(({ key, id }) => {
              const label = guide.sections[id]?.title || id;
              return (
              <div key={key} className="space-y-2">
                <Label className="text-xs text-primary">{label} (0–30)</Label>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={scores[key]}
                  onChange={(e) => setScores((prev) => ({ ...prev, [key]: +e.target.value }))}
                  className="w-full accent-primary"
                />
                <p className="text-xl font-bold">{scores[key]}</p>
              </div>
              );
            })}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-primary/5 p-4">
            <div>
              <p className="text-sm font-medium">{t("tools.guide.totalLabel")}</p>
              <p className="text-xs text-muted-foreground">{t("tools.guide.totalHint")}</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-3xl font-extrabold text-primary">{total}</span>
              <Badge variant="outline">{band}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-section">{t("tools.guide.sectionsHeading")}</h2>
        <p className="text-sm text-muted-foreground">{t("tools.guide.sectionsSub")}</p>
      </div>

      {filteredSections.length === 0 ? (
        <EmptyState title={t("tools.guide.noSections")} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {filteredSections.map((s) => {
            const SectionIcon = s.icon;
            return (
              <Card key={s.id} className="overflow-hidden">
                <div className="h-1 bg-primary" />
                <CardHeader className="pb-2">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <SectionIcon className="h-5 w-5" aria-hidden />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">{s.time}</Badge>
                    <Badge variant="secondary">{s.questions}</Badge>
                  </div>
                  <CardTitle className="text-base">{s.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {s.barDefs?.map((b) => (
                    <div key={b.key} className="flex items-center gap-2 text-xs">
                      <span className="w-20 shrink-0 font-medium">{s.barLabels[b.key]}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${b.v}%` }} />
                      </div>
                      <span className="w-8 text-end font-semibold text-primary">{b.v}%</span>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    onClick={() => toggleSection(s.id)}
                  >
                    {openSection === s.id ? t("tools.guide.hideTypes") : t("tools.guide.showTypes")}
                  </Button>

                  {openSection === s.id && (
                    <div className="space-y-2">
                      {s.types?.map((qt, i) => (
                        <div key={i} className="rounded-lg border bg-muted/30">
                          <button
                            type="button"
                            className="flex w-full items-center justify-between gap-2 p-3 text-start text-sm font-medium"
                            onClick={() => toggleQuestion(s.id, i)}
                          >
                            <span>{qt.name}</span>
                            <ChevronDown
                              className={cn(
                                "h-4 w-4 shrink-0 transition-transform",
                                openQuestion[s.id] === i && "rotate-180"
                              )}
                              aria-hidden
                            />
                          </button>
                          {openQuestion[s.id] === i && (
                            <p className="border-t px-3 pb-3 pt-2 text-xs leading-relaxed text-muted-foreground">
                              {qt.exp}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="rounded-md border-s-4 border-primary bg-primary/5 p-3 text-xs text-primary">
                    <span className="font-bold">{t("tools.guide.tipLabel")}</span> {s.tips}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <div>
        <h2 className="text-section">{t("tools.guide.motivationHeading")}</h2>
        <p className="text-sm text-muted-foreground">{t("tools.guide.motivationSub")}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {guide.motivations.map((m, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <p className="text-sm italic leading-relaxed text-foreground">&ldquo;{m.quote}&rdquo;</p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-primary">— {m.author}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-section">{t("tools.guide.adviceHeading")}</h2>
        <p className="text-sm text-muted-foreground">{t("tools.guide.adviceSub")}</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {guide.advices.map((a, i) => {
          const AdviceIcon = ADVICE_ICONS[i] || Target;
          return (
            <Card key={i}>
              <CardContent className="space-y-2 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <AdviceIcon className="h-5 w-5" aria-hidden />
                </div>
                <p className="font-semibold">{a.title}</p>
                <p className="text-sm text-muted-foreground">{a.msg}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}