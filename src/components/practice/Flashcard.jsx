import { useReducedMotion, motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MasteryControls from "@/components/shared/MasteryControls";
import SpeakButton from "@/components/shared/SpeakButton";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/cn";

export default function Flashcard({ word, revealed, onReveal, onRate }) {
  const { t } = useI18n();
  const reduce = useReducedMotion();

  return (
    <div className="space-y-4">
      <motion.div
        key={revealed ? "back" : "front"}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: reduce ? 0 : 0.15 }}
      >
        <Card className={cn("min-h-[220px]", revealed && "border-primary/30")}>
          <CardContent className="flex min-h-[220px] flex-col justify-center gap-4 p-6">
            {!revealed ? (
              <>
                <div className="flex items-center justify-center gap-1">
                  <p className="word-headword text-center">{word.word}</p>
                  <SpeakButton text={word.word} />
                </div>
                {word.quality === "draft" && (
                  <div className="flex justify-center">
                    <Badge variant="warning">{t("common.draft")}</Badge>
                  </div>
                )}
                {word.phonetic ? (
                  <p className="text-center text-sm text-muted-foreground">{word.phonetic}</p>
                ) : (
                  <p className="text-center text-xs text-muted-foreground">
                    {t("vocab.phoneticUnavailable")}
                  </p>
                )}
                <div className="flex justify-center">
                  <Button onClick={onReveal} className="min-h-11">
                    {t("common.reveal")}
                  </Button>
                </div>
                <p className="text-center text-xs text-muted-foreground">
                  {t("common.spaceHint")}
                </p>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-1">
                  <p className="word-headword text-center">{word.word}</p>
                  <SpeakButton text={word.word} />
                </div>
                {word.quality === "draft" && (
                  <div className="flex justify-center">
                    <Badge variant="warning">{t("common.draft")}</Badge>
                  </div>
                )}
                {word.definitionEn && (
                  <p className="text-center text-sm leading-relaxed">{word.definitionEn}</p>
                )}
                {word.translationAr && (
                  <p dir="rtl" className="text-center text-lg">
                    {word.translationAr}
                  </p>
                )}
                {word.exampleEn && (
                  <div className="rounded-md bg-muted/50 p-3">
                    <div className="flex items-start justify-center gap-1">
                      <p className="text-center text-sm italic leading-relaxed">{word.exampleEn}</p>
                      <SpeakButton text={word.exampleEn} labelKey="common.pronounceExample" />
                    </div>
                    {word.exampleAr && (
                      <p dir="rtl" className="mt-2 text-center text-sm text-muted-foreground">
                        {word.exampleAr}
                      </p>
                    )}
                  </div>
                )}
                {(word.synonyms || []).length > 0 && (
                  <p className="text-center text-xs text-muted-foreground">
                    {t("vocab.synonyms")}: {word.synonyms.slice(0, 4).join(", ")}
                  </p>
                )}
                {(word.collocations || []).length > 0 && (
                  <p className="text-center text-xs text-muted-foreground">
                    {t("vocab.collocations")}: {word.collocations.slice(0, 4).join(" · ")}
                  </p>
                )}
                {(word.wordFamily || []).length > 0 && (
                  <p className="text-center text-xs text-muted-foreground">
                    {t("vocab.wordFamily")}: {word.wordFamily.slice(0, 5).join(", ")}
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {revealed && <MasteryControls onRate={onRate} />}
    </div>
  );
}
