import { useEffect, useMemo, useState } from "react";
import { prefixes, suffixes } from "../data/prefixesAndSuffixes";
import { Heart, Search, Volume2, X } from "lucide-react";
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

export default function PrefixesAndSuffixes() {
  const { t } = useI18n();
  const [typeFilter, setTypeFilter] = useState("");
  const [lovedItems, setLovedItems] = useState([]);
  const [savedOpen, setSavedOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const allItems = useMemo(() => [...prefixes, ...suffixes], []);

  useEffect(() => {
    let cancelled = false;
    import("@/lib/toolStorage").then(({ loadToolState }) => {
      loadToolState("lovedAffixes_v2", []).then((saved) => {
        if (!cancelled && Array.isArray(saved)) setLovedItems(saved);
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    import("@/lib/toolStorage").then(({ saveToolState }) => {
      saveToolState("lovedAffixes_v2", lovedItems);
    });
  }, [lovedItems]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allItems
      .filter((item) => {
        if (typeFilter === "prefix") return item.type === "Prefix";
        if (typeFilter === "suffix") return item.type === "Suffix";
        return true;
      })
      .filter((item) => {
        if (!q) return true;
        return (
          item.word.toLowerCase().includes(q) ||
          item.root.toLowerCase().includes(q) ||
          item.rootMeaning.toLowerCase().includes(q) ||
          item.example.toLowerCase().includes(q)
        );
      });
  }, [allItems, typeFilter, searchQuery]);

  const toggleLove = (item) => {
    const exists = lovedItems.find((w) => w.word === item.word);
    if (exists) {
      setLovedItems(lovedItems.filter((w) => w.word !== item.word));
    } else {
      setLovedItems([...lovedItems, item]);
    }
  };

  const isLoved = (word) => lovedItems.some((w) => w.word === word);

  const typeLabel = (type) => (type === "Prefix" ? t("tools.affixesPrefixes") : t("tools.affixesSuffixes"));

  const sectionTitle =
    typeFilter === "prefix"
      ? t("tools.affixesPrefixes")
      : typeFilter === "suffix"
        ? t("tools.affixesSuffixes")
        : t("tools.affixesSectionAll");

  const chips = typeFilter
    ? [
        {
          id: "type",
          label:
            typeFilter === "prefix" ? t("tools.affixesPrefixes") : t("tools.affixesSuffixes"),
        },
      ]
    : [];

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">{t("tools.affixesIntro")}</p>

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">
          {allItems.length} {t("tools.affixesTotal")}
        </Badge>
        <Badge variant="outline">
          {prefixes.length} {t("tools.affixesPrefixes")}
        </Badge>
        <Badge variant="outline">
          {suffixes.length} {t("tools.affixesSuffixes")}
        </Badge>
        <Badge variant="outline">
          {lovedItems.length} {t("tools.affixesLoved")}
        </Badge>
        <Button type="button" variant="outline" size="sm" className="ms-auto gap-2" onClick={() => setSavedOpen(true)}>
          <Heart className="h-4 w-4" aria-hidden />
          {t("tools.openSaved")} ({lovedItems.length})
        </Button>
      </div>

      <FilterBar
        query={searchQuery}
        onQueryChange={setSearchQuery}
        searchPlaceholder={t("tools.affixesSearch")}
        filters={[
          {
            id: "type",
            label: t("common.filter"),
            value: typeFilter,
            onChange: setTypeFilter,
            options: [
              { value: "prefix", label: t("tools.affixesPrefixes") },
              { value: "suffix", label: t("tools.affixesSuffixes") },
            ],
          },
        ]}
        activeChips={chips}
        onClearChip={() => setTypeFilter("")}
        onClearAll={() => {
          setTypeFilter("");
          setSearchQuery("");
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">{sectionTitle}</h2>
        <Badge variant="secondary">{formatTpl(t("tools.countItems"), { count: filteredItems.length })}</Badge>
      </div>

      {filteredItems.length === 0 ? (
        <EmptyState icon={Search} title={t("tools.noResults")} description={t("tools.noResultsHint")} />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filteredItems.map((item) => {
            const loved = isLoved(item.word);
            return (
              <Card
                key={item.word}
                className={cn("border-s-4 border-s-primary/80", loved && "border-primary")}
              >
                <CardContent className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-lg font-bold tracking-tight">{item.word}</p>
                      <Badge variant="secondary" className="mt-1 text-[10px] uppercase">
                        {typeLabel(item.type)}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn("h-9 w-9", loved && "text-destructive")}
                        onClick={() => toggleLove(item)}
                        aria-label={loved ? t("tools.removeSaved") : t("tools.addSaved")}
                      >
                        <Heart className="h-4 w-4" fill={loved ? "currentColor" : "none"} aria-hidden />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => speakText(item.example)}
                        aria-label={t("common.pronounceExample")}
                      >
                        <Volume2 className="h-4 w-4" aria-hidden />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm">
                    <span className="font-semibold text-primary">{t("tools.affixesArabicName")}: </span>
                    <span dir="rtl" lang="ar">
                      {item.affixNameArabic}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-primary">{t("tools.affixesRoot")}: </span>
                    {item.root} — <em>{item.rootMeaning}</em>
                  </p>
                  <div className="rounded-md bg-muted/60 p-2">
                    <p className="text-sm italic text-primary">{item.example}</p>
                  </div>
                  <p className="rounded-md bg-muted/40 p-2 text-sm" dir="rtl" lang="ar">
                    {item.arabicExample}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Sheet open={savedOpen} onOpenChange={setSavedOpen}>
        <SheetContent side="end" className="flex w-full flex-col sm:max-w-md">
          <SheetHeader>
            <SheetTitle>{t("tools.savedTitle")}</SheetTitle>
            <SheetDescription>
              {formatTpl(t("tools.savedSubtitle"), { count: lovedItems.length })}
            </SheetDescription>
          </SheetHeader>
          <div className="flex-1 space-y-2 overflow-y-auto py-2">
            {lovedItems.length === 0 ? (
              <EmptyState
                icon={Heart}
                title={t("tools.savedEmpty")}
                description={t("tools.savedEmptyHint")}
                className="border-0 shadow-none"
              />
            ) : (
              lovedItems.map((item) => (
                <Card key={item.word}>
                  <CardContent className="flex items-center gap-3 p-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold">{item.word}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.root} — {item.rootMeaning}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => speakText(item.word)}
                      aria-label={t("common.pronounce")}
                    >
                      <Volume2 className="h-4 w-4" aria-hidden />
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9 text-destructive"
                      onClick={() => toggleLove(item)}
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