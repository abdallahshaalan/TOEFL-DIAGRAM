/** Business vocabulary category metadata for filters and UI labels. */
const businessCategoryMeta = [
  {
    id: "fundamentals",
    labelEn: "Business Fundamentals",
    labelAr: "أساسيات الأعمال",
    icon: "Building2",
  },
  {
    id: "management",
    labelEn: "Management & Leadership",
    labelAr: "الإدارة والقيادة",
    icon: "Users",
  },
  {
    id: "accounting",
    labelEn: "Financial Accounting",
    labelAr: "المحاسبة المالية",
    icon: "Calculator",
  },
  {
    id: "finance",
    labelEn: "Finance & Investment",
    labelAr: "التمويل والاستثمار",
    icon: "LineChart",
  },
  {
    id: "marketing",
    labelEn: "Marketing",
    labelAr: "التسويق",
    icon: "Megaphone",
  },
  {
    id: "economics",
    labelEn: "Economics",
    labelAr: "الاقتصاد",
    icon: "Globe2",
  },
  {
    id: "entrepreneurship",
    labelEn: "Entrepreneurship & Startups",
    labelAr: "ريادة الأعمال والشركات الناشئة",
    icon: "Rocket",
  },
  {
    id: "communication",
    labelEn: "Business Communication",
    labelAr: "التواصل التجاري",
    icon: "MessagesSquare",
  },
  {
    id: "operations",
    labelEn: "Operations & Supply Chain",
    labelAr: "العمليات وسلسلة التوريد",
    icon: "Truck",
  },
  {
    id: "law-ethics",
    labelEn: "Business Law & Ethics",
    labelAr: "القانون وأخلاقيات الأعمال",
    icon: "Scale",
  },
  {
    id: "analytics",
    labelEn: "Business Analytics & IS",
    labelAr: "تحليلات الأعمال ونظم المعلومات",
    icon: "BarChart3",
  },
  {
    id: "international",
    labelEn: "International Business",
    labelAr: "الأعمال الدولية",
    icon: "Plane",
  },
];

export default businessCategoryMeta;
export const BUSINESS_CATEGORY_IDS = businessCategoryMeta.map((c) => c.id);
