import {
  BookOpenCheck,
  CalendarDays,
  Layers,
  Library,
  WholeWord,
} from "lucide-react";

/** Shared study-tools catalog for sidebar + dashboard */
export const TOOLS_CATALOG = [
  {
    id: "guide",
    to: "/tools/guide",
    icon: BookOpenCheck,
    titleKey: "nav.guide",
    descKey: "tools.guideDesc",
  },
  {
    id: "studyPlan",
    to: "/tools/study-plan",
    icon: CalendarDays,
    titleKey: "nav.studyPlan",
    descKey: "tools.studyPlanDesc",
  },
  {
    id: "topics",
    to: "/tools/topics",
    icon: Layers,
    titleKey: "nav.topics",
    descKey: "tools.topicsDesc",
  },
  {
    id: "affixes",
    to: "/tools/affixes",
    icon: WholeWord,
    titleKey: "nav.affixes",
    descKey: "tools.affixesDesc",
  },
  {
    id: "academicTopics",
    to: "/tools/academic-topics",
    icon: Library,
    titleKey: "nav.academicTopics",
    descKey: "tools.academicTopicsDesc",
  },
];
