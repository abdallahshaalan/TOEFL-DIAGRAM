import { useEffect, useMemo, useState } from "react";
import vocab from "../data/studyVocabularies";
import { Heart, Volume2, X } from "lucide-react";
import { useI18n } from "@/i18n";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import FilterBar from "@/components/shared/FilterBar";
import EmptyState from "@/components/shared/EmptyState";
import { speakText } from "@/lib/speech";
import { cn } from "@/lib/cn";

function formatTpl(str, vars) {
  return String(str).replace(/\{\{(\w+)\}\}/g, (_, k) => String(vars[k] ?? ""));
}

function TopicVocabCard({ item, isLoved, onToggleLove, onSpeak, t }) {
  return (
    <Card className="transition-colors hover:border-primary/30 hover:bg-muted/30">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-lg font-semibold tracking-tight">{item.word}</p>
          <div className="flex shrink-0 gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn("h-9 w-9", isLoved && "text-destructive")}
              onClick={() => onToggleLove(item)}
              aria-label={isLoved ? t("tools.removeSaved") : t("tools.addSaved")}
            >
              <Heart className="h-4 w-4" fill={isLoved ? "currentColor" : "none"} aria-hidden />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9"
              onClick={() => onSpeak(item.word)}
              aria-label={t("common.pronounce")}
            >
              <Volume2 className="h-4 w-4" aria-hidden />
            </Button>
          </div>
        </div>
        <p className="text-base font-medium text-foreground" dir="rtl" lang="ar">
          {item.arabic}
        </p>
        <div className="flex items-start justify-between gap-2 border-t pt-2">
          <p className="text-sm text-muted-foreground">{item.english}</p>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => onSpeak(item.english)}
            aria-label={t("common.pronounceSentence")}
          >
            <Volume2 className="h-3.5 w-3.5" aria-hidden />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function VocabTopics() {
  const { t } = useI18n();
  const [activeTopic, setActiveTopic] = useState("");
  const [lovedVocabs, setLovedVocabs] = useState([]);
  const [savedOpen, setSavedOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const topics = useMemo(() => Object.keys(vocab), []);
  const totalWords = useMemo(() => Object.values(vocab).flat().length, []);

  const allDisplayed = useMemo(
    () => (activeTopic ? vocab[activeTopic] || [] : Object.values(vocab).flat()),
    [activeTopic]
  );

  const displayedWords = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return allDisplayed;
    return allDisplayed.filter(
      (w) =>
        w.word.toLowerCase().includes(q) ||
        (w.english && w.english.toLowerCase().includes(q)) ||
        (w.arabic && w.arabic.includes(searchQuery.trim()))
    );
  }, [allDisplayed, searchQuery]);

  useEffect(() => {
    let cancelled = false;
    import("@/lib/toolStorage").then(({ loadToolState }) => {
      loadToolState("lovedVocabs2", []).then((saved) => {
        if (!cancelled && Array.isArray(saved)) setLovedVocabs(saved);
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    import("@/lib/toolStorage").then(({ saveToolState }) => {
      saveToolState("lovedVocabs2", lovedVocabs);
    });
  }, [lovedVocabs]);

  const toggleLove = (wordObj) => {
    const alreadyLoved = lovedVocabs.find((w) => w.word === wordObj.word);
    setLovedVocabs(
      alreadyLoved ? lovedVocabs.filter((w) => w.word !== wordObj.word) : [...lovedVocabs, wordObj]
    );
  };

  const topicFilters = [
    {
      id: "topic",
      label: t("common.category"),
      value: activeTopic,
      onChange: setActiveTopic,
      options: topics.map((topic) => ({ value: topic, label: topic.replace(/_/g, " ") })),
    },
  ];

  const chips = activeTopic
    ? [{ id: "topic", label: activeTopic.replace(/_/g, " ") }]
  : [];

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">{t("tools.topicsIntro")}</p>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">
          {totalWords} {t("common.words")}
        </Badge>
        <Badge variant="outline">
          {topics.length} {t("tools.topicsStatsTopics")}
        </Badge>
        <Badge variant="outline">
          {lovedVocabs.length} {t("tools.topicsStatsSaved")}
        </Badge>
        <Button type="button" variant="outline" size="sm" className="ms-auto gap-2" onClick={() => setSavedOpen(true)}>
          <Heart className="h-4 w-4" aria-hidden />
          {t("tools.openSaved")} ({lovedVocabs.length})
        </Button>
      </div>

      <FilterBar
        query={searchQuery}
        onQueryChange={setSearchQuery}
        searchPlaceholder={t("common.search")}
        filters={topicFilters}
        activeChips={chips}
        onClearChip={() => setActiveTopic("")}
        onClearAll={() => {
          setActiveTopic("");
          setSearchQuery("");
        }}
      />

      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-medium text-muted-foreground">
          {activeTopic ? activeTopic.replace(/_/g, " ") : t("tools.topicsAll")}
        </p>
        <Badge variant="secondary">{formatTpl(t("tools.countWords"), { count: displayedWords.length })}</Badge>
      </div>

      {displayedWords.length === 0 ? (
        <EmptyState
          title={t("tools.noResults")}
          description={t("tools.noResultsHint")}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {displayedWords.map((item) => (
            <TopicVocabCard
              key={`${item.word}-${item.arabic}`}
              item={item}
              isLoved={lovedVocabs.some((w) => w.word === item.word)}
              onToggleLove={toggleLove}
              onSpeak={speakText}
              t={t}
            />
          ))}
        </div>
      )}

      <Sheet open={savedOpen} onOpenChange={setSavedOpen}>
        <SheetContent side="end" className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{t("tools.savedTitle")}</SheetTitle>
            <SheetDescription>
              {formatTpl(t("tools.savedSubtitle"), { count: lovedVocabs.length })}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 space-y-2 overflow-y-auto py-2">
            {lovedVocabs.length === 0 ? (
              <EmptyState
                icon={Heart}
                title={t("tools.savedEmpty")}
                description={t("tools.savedEmptyHint")}
                className="border-0 shadow-none"
              />
            ) : (
              lovedVocabs.map((word) => (
                <Card key={word.word}>
                  <CardContent className="flex items-center gap-3 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{word.word}</p>
                      <p className="text-sm text-muted-foreground" dir="rtl" lang="ar">
                        {word.arabic}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => speakText(word.word)}
                      aria-label={t("common.pronounce")}
                    >
                      <Volume2 className="h-4 w-4" aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-destructive"
                      onClick={() => toggleLove(word)}
                      aria-label={t("tools.removeSaved")}
                    >
                      <X className="h-4 w-4" aria-hidden />
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}