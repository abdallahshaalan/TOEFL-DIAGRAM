export const ROUTE_META = [
  { path: "/", end: true, titleKey: "nav.dashboard" },
  { path: "/vocab/toefl", titleKey: "nav.toeflVocab" },
  { path: "/vocab/business", titleKey: "nav.businessVocab" },
  { path: "/vocab/general", titleKey: "nav.generalVocab" },
  { path: "/practice", titleKey: "nav.practice" },
  { path: "/review", titleKey: "nav.review" },
  { path: "/stats", titleKey: "nav.stats" },
  { path: "/settings", titleKey: "nav.settings" },
  { path: "/tools/guide", titleKey: "nav.guide" },
  { path: "/tools/study-plan", titleKey: "nav.studyPlan" },
  { path: "/tools/topics", titleKey: "nav.topics" },
  { path: "/tools/affixes", titleKey: "nav.affixes" },
  { path: "/tools/academic-topics", titleKey: "nav.academicTopics" },
];

export function getRouteTitleKey(pathname) {
  if (pathname === "/") return "nav.dashboard";
  const match = ROUTE_META.filter((r) => !r.end && pathname.startsWith(r.path)).sort(
    (a, b) => b.path.length - a.path.length
  )[0];
  return match?.titleKey || "appName";
}
