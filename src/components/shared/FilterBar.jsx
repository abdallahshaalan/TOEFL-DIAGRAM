import { useState } from "react";
import { ChevronDown, Search, SlidersHorizontal, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/cn";

export default function FilterBar({
  query,
  onQueryChange,
  searchPlaceholder,
  filters = [],
  activeChips = [],
  onClearChip,
  onClearAll,
}) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const activeCount = activeChips.length;

  return (
    <div className="space-y-3 rounded-lg border bg-card p-3 shadow-sm md:p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="h-10 ps-9"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            placeholder={searchPlaceholder || t("common.search")}
            aria-label={t("common.search")}
          />
        </div>
        {filters.length > 0 && (
          <Button
            type="button"
            variant="outline"
            className="h-10 shrink-0 gap-2 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
          >
            <SlidersHorizontal className="h-4 w-4" />
            {t("common.filters")}
            {activeCount > 0 && (
              <Badge variant="secondary" className="ms-1">
                {activeCount}
              </Badge>
            )}
            <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
          </Button>
        )}
      </div>

      {filters.length > 0 && (
        <div
          className={cn(
            "grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
            !open && "hidden md:grid"
          )}
        >
          {filters.map((f) => (
            <div key={f.id} className="space-y-1">
              <Label htmlFor={f.id} className="text-xs text-muted-foreground">
                {f.label}
              </Label>
              <Select
                value={f.value || "__all__"}
                onValueChange={(v) => f.onChange(v === "__all__" ? "" : v)}
              >
                <SelectTrigger id={f.id} className="h-10">
                  <SelectValue placeholder={f.label} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">{t("common.all")}</SelectItem>
                  {f.options.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}

      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          {activeChips.map((chip) => (
            <Badge key={chip.id} variant="secondary" className="gap-1 pe-1">
              {chip.label}
              <button
                type="button"
                className="rounded p-0.5 hover:bg-muted"
                aria-label={`${t("common.cancel")} ${chip.label}`}
                onClick={() => onClearChip?.(chip.id)}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button type="button" variant="ghost" size="sm" onClick={onClearAll}>
            {t("common.clearFilters")}
          </Button>
        </div>
      )}
    </div>
  );
}
