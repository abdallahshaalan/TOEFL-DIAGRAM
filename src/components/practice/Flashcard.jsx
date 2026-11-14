import { useReducedMotion, motion } from "motion/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import MasteryControls from "@/components/shared/MasteryControls";
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
                <p className="word-headword text-center">{word.word}</p>
                <div className="flex justify-center">
                  <Button onClick={onReveal}>{t("common.reveal")}</Button>
                </div>
                <p className="text-center text-xs text-muted-foreground">Space</p>
              </>
            ) : (
              <div className="space-y-4">
                <p className="word-headword text-center">{word.word}</p>
                {word.definitionEn && (
                  <p className="text-center text-sm leading-relaxed">{word.definitionEn}</p>
                )}
                {word.translationAr && (
                  <p dir="rtl" className="text-center text-lg">
                    {word.translationAr}
                  </p>
                )}
                {word.exampleEn && (
                  <p className="rounded-md bg-muted/50 p-3 text-center text-sm italic">
                    {word.exampleEn}
                  </p>
                )}
                {(word.synonyms || []).length > 0 && (
                  <p className="text-center text-xs text-muted-foreground">
                    {t("vocab.synonyms")}: {word.synonyms.slice(0, 4).join(", ")}
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
