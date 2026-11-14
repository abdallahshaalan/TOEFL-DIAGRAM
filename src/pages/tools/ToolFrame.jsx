import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/shared/PageHeader";
import { useI18n } from "@/i18n";

export default function ToolFrame({ titleKey, children }) {
  const { t } = useI18n();
  return (
    <div className="space-y-4">
      <PageHeader
        title={t(titleKey)}
        actions={
          <Button asChild variant="outline" size="sm" className="min-h-9 gap-2">
            <Link to="/">
              <ArrowLeft className="h-4 w-4 rtl:rotate-180" aria-hidden />
              {t("home")}
            </Link>
          </Button>
        }
      />
      <div className="legacy-tool-root overflow-x-auto overflow-y-hidden rounded-lg border border-border bg-card shadow-sm [&_h1:first-of-type]:sr-only">
        {children}
      </div>
    </div>
  );
}
