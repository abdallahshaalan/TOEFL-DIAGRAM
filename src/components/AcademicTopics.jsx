import { useMemo } from "react";
import { useI18n } from "@/i18n";
import en from "@/i18n/en";
import ar from "@/i18n/ar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ToeflTopics() {
  const { t, lang } = useI18n();
  const cards = useMemo(
    () => (lang === "ar" ? ar.tools.academicTopics.cards : en.tools.academicTopics.cards),
    [lang]
  );

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">{t("tools.academicIntro")}</p>
      <p className="text-xs text-muted-foreground">{t("tools.academicDisclaimer")}</p>

      <div className="grid gap-4 sm:grid-cols-2">
        {cards.map((topic, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <Badge variant="secondary" className="w-fit">
                {topic.badge}
              </Badge>
              <CardTitle className="text-base leading-snug">{topic.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc space-y-1 ps-5 text-sm text-muted-foreground">
                {topic.details.map((d, index) => (
                  <li key={index}>{d}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}