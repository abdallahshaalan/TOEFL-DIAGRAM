import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

export default function PageHeader({
  title,
  subtitle,
  actions,
  library,
  className,
  libraryLabel,
}) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-page-title">{title}</h1>
          {library === "toefl" && (
            <Badge variant="toefl">{libraryLabel || "TOEFL"}</Badge>
          )}
          {library === "business" && (
            <Badge variant="business">{libraryLabel || "Business"}</Badge>
          )}
          {library === "general" && (
            <Badge variant="general">{libraryLabel || "General"}</Badge>
          )}
        </div>
        {subtitle && <p className="max-w-2xl text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
