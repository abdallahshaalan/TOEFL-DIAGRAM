import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  BookOpen,
  Brain,
  Briefcase,
  ChartNoAxesCombined,
  ChevronDown,
  Clock,
  GraduationCap,
  Languages,
  LayoutDashboard,
  Menu,
  Settings,
  Wrench,
} from "lucide-react";
import { useI18n } from "@/i18n";
import { useOnlineStatus } from "@/hooks/useOnlineStatus";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { TooltipProvider } from "@/components/ui/tooltip";
import PageMotion from "@/components/layout/PageMotion";
import StatusBadge from "@/components/shared/StatusBadge";
import { TOOLS_CATALOG } from "@/lib/toolsCatalog";
import { getRouteTitleKey } from "@/lib/routes";
import { cn } from "@/lib/cn";

const mainNav = [
  { to: "/", icon: LayoutDashboard, key: "dashboard", end: true },
  { to: "/vocab/toefl", icon: GraduationCap, key: "toeflVocab" },
  { to: "/vocab/business", icon: Briefcase, key: "businessVocab" },
  { to: "/vocab/general", icon: BookOpen, key: "generalVocab" },
  { to: "/practice", icon: Brain, key: "practice" },
  { to: "/review", icon: Clock, key: "review" },
  { to: "/stats", icon: ChartNoAxesCombined, key: "stats" },
  { to: "/settings", icon: Settings, key: "settings" },
];

function NavItems({ onNavigate, toolsOpen, setToolsOpen, t }) {
  const linkClass = ({ isActive }) =>
    cn(
      "flex min-h-11 w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
      isActive
        ? "bg-primary/10 text-primary"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    );

  return (
    <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label={t("appName")}>
      {mainNav.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={linkClass}
          onClick={onNavigate}
        >
          <item.icon className="h-4 w-4 shrink-0" aria-hidden strokeWidth={1.75} />
          <span className="truncate">{t(`nav.${item.key}`)}</span>
        </NavLink>
      ))}

      <button
        type="button"
        className="mt-3 flex min-h-10 w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        onClick={() => setToolsOpen((v) => !v)}
        aria-expanded={toolsOpen}
      >
        <span className="inline-flex items-center gap-2">
          <Wrench className="h-3.5 w-3.5" aria-hidden strokeWidth={1.75} />
          {t("nav.tools")}
        </span>
        <ChevronDown
          className={cn("h-4 w-4 transition-transform", toolsOpen && "rotate-180")}
          aria-hidden
        />
      </button>

      {toolsOpen && (
        <div className="ms-1 space-y-1 border-s border-border ps-2">
          {TOOLS_CATALOG.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={linkClass}
              onClick={onNavigate}
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden strokeWidth={1.75} />
              <span className="truncate">{t(item.titleKey)}</span>
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  );
}

function Brand({ t }) {
  return (
    <div className="flex items-center gap-2.5 border-b px-4 py-3.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-xs font-bold text-primary-foreground">
        A
      </div>
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold leading-none tracking-tight">{t("brand")}</div>
        <div className="mt-0.5 truncate text-[11px] text-muted-foreground">{t("appName")}</div>
      </div>
    </div>
  );
}

export default function AppShell() {
  const { t, lang, setLang } = useI18n();
  const online = useOnlineStatus();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(true);
  const pageTitle = t(getRouteTitleKey(location.pathname));

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const sidebarBody = (
    <>
      <Brand t={t} />
      <NavItems
        t={t}
        toolsOpen={toolsOpen}
        setToolsOpen={setToolsOpen}
        onNavigate={() => setOpen(false)}
      />
    </>
  );

  return (
    <TooltipProvider delayDuration={300}>
      <div className="min-h-screen bg-background">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-card focus:px-3 focus:py-2 focus:shadow"
        >
          {t("skipToContent")}
        </a>

        <div className="flex min-h-screen">
          <aside className="sticky top-0 hidden h-screen w-sidebar shrink-0 flex-col border-e bg-card lg:flex">
            {sidebarBody}
          </aside>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent side="left" className="w-sidebar p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>{t("appName")}</SheetTitle>
              </SheetHeader>
              <div className="flex h-full flex-col">{sidebarBody}</div>
            </SheetContent>
          </Sheet>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-black/5 bg-white/80 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-white/70">
              <div className="flex min-w-0 items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="lg:hidden"
                  onClick={() => setOpen(true)}
                  aria-label={t("openMenu")}
                >
                  <Menu className="h-5 w-5" aria-hidden />
                </Button>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold">{pageTitle}</div>
                  <div className="hidden truncate text-xs text-muted-foreground sm:block">
                    {t("appName")}
                  </div>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <StatusBadge online={online} />
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-9"
                  onClick={() => setLang(lang === "en" ? "ar" : "en")}
                  aria-label={t("common.language")}
                >
                  <Languages className="h-4 w-4" aria-hidden />
                  <span className="hidden sm:inline">{lang === "en" ? "العربية" : "English"}</span>
                </Button>
              </div>
            </header>

            <main id="main-content" className="flex-1 p-4 md:p-6">
              <div className="mx-auto w-full max-w-6xl">
                <PageMotion>
                  <Outlet />
                </PageMotion>
              </div>
            </main>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
