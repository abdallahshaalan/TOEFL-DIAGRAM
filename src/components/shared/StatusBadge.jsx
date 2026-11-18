import { Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/cn";

export default function StatusBadge({ online }) {
  const { t } = useI18n();
  const Icon = online ? Wifi : WifiOff;
  return (
    <Badge
      variant={online ? "success" : "warning"}
      role="status"
      aria-live="polite"
      className="inline-flex items-center gap-1.5 leading-none"
    >
      <span
        className={cn(
          "inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center leading-none"
        )}
        aria-hidden
      >
        <Icon className="block h-3.5 w-3.5 shrink-0" strokeWidth={2} />
      </span>
      <span className="leading-none">{online ? t("common.online") : t("common.offline")}</span>
    </Badge>
  );
}
