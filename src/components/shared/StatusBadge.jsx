import { Wifi, WifiOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/i18n";

export default function StatusBadge({ online }) {
  const { t } = useI18n();
  return (
    <Badge
      variant={online ? "success" : "warning"}
      role="status"
      aria-live="polite"
      className="gap-1"
    >
      {online ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
      {online ? t("common.online") : t("common.offline")}
    </Badge>
  );
}
