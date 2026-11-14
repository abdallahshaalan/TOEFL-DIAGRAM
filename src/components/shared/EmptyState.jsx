import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import IconTile from "@/components/shared/IconTile";
import { cn } from "@/lib/cn";

function ActionButton({ action, variant = "default" }) {
  if (!action) return null;
  if (action.href) {
    return (
      <Button asChild variant={variant} className="min-h-11">
        <Link to={action.href}>{action.label}</Link>
      </Button>
    );
  }
  return (
    <Button variant={variant} className="min-h-11" onClick={action.onClick}>
      {action.label}
    </Button>
  );
}

export default function EmptyState({
  title,
  description,
  primaryAction,
  secondaryAction,
  className,
  icon: Icon,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border bg-card px-6 py-12 text-center shadow-sm",
        className
      )}
    >
      {Icon && <IconTile icon={Icon} size="md" className="mb-3" />}
      {title && <h2 className="text-section">{title}</h2>}
      {description && (
        <p className="mt-1 max-w-md text-sm text-muted-foreground">{description}</p>
      )}
      {(primaryAction || secondaryAction) && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <ActionButton action={primaryAction} />
          <ActionButton action={secondaryAction} variant="outline" />
        </div>
      )}
    </div>
  );
}
