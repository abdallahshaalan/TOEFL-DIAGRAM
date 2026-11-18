import { useEffect, useState } from "react";
import { Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/i18n";
import { cn } from "@/lib/cn";
import {
  isSpeechSupported,
  speakText,
  subscribeSpeaking,
  warmSpeechVoices,
} from "@/lib/speech";

export default function SpeakButton({
  text,
  labelKey = "common.pronounce",
  className,
  size = "icon",
  variant = "ghost",
}) {
  const { t } = useI18n();
  const [supported, setSupported] = useState(true);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    setSupported(isSpeechSupported());
    warmSpeechVoices();
    return subscribeSpeaking(setSpeaking);
  }, []);

  if (!supported || !String(text || "").trim()) return null;

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={cn("h-11 w-11 shrink-0", speaking && "text-primary", className)}
      aria-label={speaking ? t("common.speaking") : t(labelKey)}
      aria-pressed={speaking}
      onClick={(e) => {
        e.stopPropagation();
        speakText(text);
      }}
    >
      <Volume2 className={cn("h-4 w-4", speaking && "animate-pulse")} />
    </Button>
  );
}
