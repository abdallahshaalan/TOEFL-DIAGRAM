import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import DashboardPage from "@/pages/DashboardPage";

const VocabLibraryPage = lazy(() => import("@/pages/VocabLibraryPage"));
const PracticePage = lazy(() => import("@/pages/PracticePage"));
const ReviewPage = lazy(() => import("@/pages/ReviewPage"));
const StatsPage = lazy(() => import("@/pages/StatsPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const ToolFrame = lazy(() => import("@/pages/tools/ToolFrame"));
const LegacyGuide = lazy(() => import("@/components/TOEFLGuide"));
const LegacyStudyPlan = lazy(() => import("@/components/studyPlan"));
const LegacyTopics = lazy(() => import("@/components/Topics"));
const LegacyAffixes = lazy(() => import("@/components/pre-suf"));
const LegacyAcademic = lazy(() => import("@/components/AcademicTopics"));

function Fallback() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-40 w-full" />
    </div>
  );
}

function Tool({ titleKey, children }) {
  return <ToolFrame titleKey={titleKey}>{children}</ToolFrame>;
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<Fallback />}>
        <Routes>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="vocab/toefl" element={<VocabLibraryPage library="toefl" />} />
            <Route path="vocab/general" element={<VocabLibraryPage library="general" />} />
            <Route path="practice" element={<PracticePage />} />
            <Route path="review" element={<ReviewPage />} />
            <Route path="stats" element={<StatsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route
              path="tools/guide"
              element={
                <Tool titleKey="nav.guide">
                  <LegacyGuide />
                </Tool>
              }
            />
            <Route
              path="tools/study-plan"
              element={
                <Tool titleKey="nav.studyPlan">
                  <LegacyStudyPlan />
                </Tool>
              }
            />
            <Route
              path="tools/topics"
              element={
                <Tool titleKey="nav.topics">
                  <LegacyTopics />
                </Tool>
              }
            />
            <Route
              path="tools/affixes"
              element={
                <Tool titleKey="nav.affixes">
                  <LegacyAffixes />
                </Tool>
              }
            />
            <Route
              path="tools/academic-topics"
              element={
                <Tool titleKey="nav.academicTopics">
                  <LegacyAcademic />
                </Tool>
              }
            />
            <Route path="Vocabs" element={<Navigate to="/vocab/general" replace />} />
            <Route path="vocabs" element={<Navigate to="/vocab/general" replace />} />
            <Route path="Topics" element={<Navigate to="/tools/topics" replace />} />
            <Route path="TOEFLGuide" element={<Navigate to="/tools/guide" replace />} />
            <Route path="studyPlan" element={<Navigate to="/tools/study-plan" replace />} />
            <Route path="pre-suf" element={<Navigate to="/tools/affixes" replace />} />
            <Route path="AcademicTopics" element={<Navigate to="/tools/academic-topics" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
