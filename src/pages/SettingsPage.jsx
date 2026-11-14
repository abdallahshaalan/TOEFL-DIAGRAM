import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Download, Languages, Upload } from "lucide-react";
import { useI18n } from "@/i18n";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PageHeader from "@/components/shared/PageHeader";
import IconTile from "@/components/shared/IconTile";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  exportLearningData,
  getAllBookmarks,
  getAllProgress,
  importLearningData,
} from "@/lib/db";

export default function SettingsPage() {
  const { t, lang, setLang } = useI18n();
  const fileRef = useRef(null);
  const [importMode, setImportMode] = useState(null);
  const [counts, setCounts] = useState({ progress: 0, bookmarks: 0 });

  useEffect(() => {
    Promise.all([getAllProgress(), getAllBookmarks()]).then(([p, b]) => {
      setCounts({ progress: p.length, bookmarks: b.length });
    });
  }, []);

  const onExport = async () => {
    const data = await exportLearningData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `toefl-companion-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(t("settings.exported"));
  };

  const onImportFile = async (file, overwrite) => {
    try {
      const text = await file.text();
      const payload = JSON.parse(text);
      if (!payload || (!payload.progress && !payload.bookmarks)) {
        throw new Error("invalid");
      }
      await importLearningData(payload, { overwrite });
      const [p, b] = await Promise.all([getAllProgress(), getAllBookmarks()]);
      setCounts({ progress: p.length, bookmarks: b.length });
      toast.success(t("settings.imported"));
    } catch {
      toast.error(t("errors.importInvalid"));
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <PageHeader title={t("settings.title")} subtitle={t("settings.subtitle")} />

      <Card>
        <CardHeader className="flex flex-row items-center gap-3 space-y-0 p-4">
          <IconTile icon={Languages} size="sm" />
          <CardTitle className="text-base font-semibold tracking-tight">
            {t("common.language")}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2 px-4 pb-4">
          <Button
            className="min-h-11"
            variant={lang === "en" ? "default" : "outline"}
            onClick={() => setLang("en")}
          >
            English
          </Button>
          <Button
            className="min-h-11"
            variant={lang === "ar" ? "default" : "outline"}
            onClick={() => setLang("ar")}
          >
            العربية
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start gap-3 space-y-0 p-4">
          <IconTile icon={Download} size="sm" />
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-base font-semibold tracking-tight">
              {t("settings.backup")}
            </CardTitle>
            <CardDescription>{t("settings.offlineNote")}</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 px-4 pb-4">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-lg border p-3">
              <div className="text-muted-foreground">{t("settings.progressRecords")}</div>
              <div className="text-xl font-semibold tabular-nums">{counts.progress}</div>
            </div>
            <div className="rounded-lg border p-3">
              <div className="text-muted-foreground">{t("settings.bookmarks")}</div>
              <div className="text-xl font-semibold tabular-nums">{counts.bookmarks}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button className="min-h-11 gap-2" onClick={onExport}>
              <Download className="h-4 w-4" aria-hidden />
              {t("common.export")}
            </Button>
            <Button
              className="min-h-11 gap-2"
              variant="secondary"
              onClick={() => setImportMode("merge")}
            >
              <Upload className="h-4 w-4" aria-hidden />
              {t("common.import")}
            </Button>
            <Button
              className="min-h-11"
              variant="destructive"
              onClick={() => setImportMode("overwrite")}
            >
              {t("settings.importOverwrite")}
            </Button>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              onImportFile(file, importMode === "overwrite");
              setImportMode(null);
              e.target.value = "";
            }}
          />
        </CardContent>
      </Card>

      <AlertDialog open={!!importMode} onOpenChange={(o) => !o && setImportMode(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {importMode === "overwrite" ? t("settings.overwriteTitle") : t("settings.mergeTitle")}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {importMode === "overwrite"
                ? t("settings.overwriteConfirm")
                : t("settings.importConfirm")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t("common.cancel")}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                fileRef.current?.click();
              }}
            >
              {t("common.confirm")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
