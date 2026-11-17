/**
 * Generates curated-rest.mjs and category-hints.mjs.
 * Run: node scripts/vocab/business/build-curated-rest.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import vocabs from "../../../src/data/vocabs.js";
import { CATEGORY_SEEDS, DEFINITIONS } from "./rest-seeds.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const SKIP = new Set(
  [
    "startup",
    "revenue",
    "profit",
    "gdp",
    "inflation",
    "entrepreneur",
    "mvp",
    "churn",
    "retention",
    "scalability",
    "company",
    "firm",
    "asset",
    "liability",
    "depreciation",
    "equity",
    "accounts payable",
    "accounts receivable",
  ].map((w) => w.toLowerCase())
);

const CURATED_EXISTING = new Set(
  fs
    .readFileSync(path.join(__dirname, "curated-banks.mjs"), "utf8")
    .matchAll(/e\("([^"]+)"/g)
    .map((m) => m[1].toLowerCase())
);

function norm(w) {
  return String(w || "")
    .toLowerCase()
    .trim()
    .replace(/\s+/g, " ");
}

function guessPos(word) {
  const w = norm(word);
  if (/(ing|ment|tion|ship|ance|ence|ity|ness|ism|ics|sis|ure|ary|ory)$/.test(w.replace(/\s+/g, ""))) return "noun";
  if (/^(allocate|maximize|minimize|negotiate|forecast|speculate|integrate|automate)/.test(w)) return "verb";
  if (/^(strategic|financial|regulatory|competitive|organic|digital)/.test(w)) return "adjective";
  return "noun";
}

function levelAdjust(level, word) {
  const map = { A2: "A2", B1: "B1", B2: "B2", C1: "C1", C2: "C1" };
  const base = map[level] || "B2";
  if (word.length > 22 || /^(deferred|contingent|amortization)/.test(norm(word))) return "C1";
  return base;
}

const CATEGORY_RULES = [
  {
    id: "entrepreneurship",
    re: /startup|founder|pivot|bootstrapp|runway|pitch|venture|angel|seed|prototype|traction|incubat|accelerat|freemium|saas|mvp|product-market|burn rate|funding|valuation|roadmap|iteration|onboarding|activation|north star|cohort|freelanc|network effect|disruption|market validation|lean startup|pitch deck|cap table|series|term sheet|unicorn|scale-up|exit|dilution|vesting|sweat equity|demo day|business plan|co-founder|beachhead|tam|unit economics|growth hack|product strategy|feature priorit|user feedback|solution-oriented|founder mindset|minimum viable/i,
  },
  {
    id: "marketing",
    re: /market(ing|ing\s)|brand|seo|cta|funnel|lead|ads|campaign|content|copywrit|headline|engagement|organic growth|paid ads|keyword|audience|persona|positioning|loyalty|conversion|traffic|awareness|viral|social proof|testimonial|case study|retarget|remarket|influencer|affiliate|nps|cac|ltv|crm|cold outreach|sales call|closing|upsell|cross-sell|monetiz|pricing strategy|target audience|competitive advantage|market share|a\/b|landing page|copywriting|content strategy|personal branding|authority|growth hacking|blue ocean|pain point|customer journey|referral|impression|click-through|share of voice|go-to-market|promotion mix|public relations|omnichannel|touchpoint|storytelling|white paper|lead magnet|remarketing|geotarget/i,
  },
  {
    id: "finance",
    re: /cash flow|capital|fund|invest|stock|bond|loan|credit|dividend|portfolio|bank|interest|finance|treasury|liquidity|working capital|operating (expense|profit)|net profit|gross revenue|break-even|burn rate|budget|forecast|valuation|warrant|speculate|leverage|collateral|amortiz|depreciat|payroll|invoice|receipt|tax|fiscal|yield|mutual fund|hedge|derivative|ipo|equity crowd|convertible|preferred stock|syndicated|refinanc|coupon|maturity|principal|credit rating|default|bankruptcy|foreclosure|mezzanine|factoring|leasing|free cash|cost of capital|ebitda|p\/e|earnings per|book value|bear market|bull market|volatility|sovereign|green bond|esg invest|diversific|sharpe|beta|alpha|buyback|stock split|secondary offering|underwriting|securitization|covenant|line of credit|angel investor|venture capital|annual recurring|arr |irr |npv |payback|capital structure|wacc/i,
  },
  {
    id: "accounting",
    re: /accounts|ledger|balance sheet|income statement|accrual|fifo|lifo|goodwill|audit|journal|debit|credit note|amortization|impairment|carrying amount|depreciation|retained earnings|accounts payable|accounts receivable|taxable|deferred tax|petty cash|reconciliation|materiality|going concern|controller|bookkeep/i,
  },
  {
    id: "economics",
    re: /economics|gdp|inflation|deflation|macro|micro|supply|demand|elasticity|equilibrium|tariff|quota|subsidy|externality|monopoly|oligopoly|recession|unemployment|fiscal|monetary|exchange rate|trade (surplus|deficit)|comparative advantage|purchasing power|consumer price|producer price|stagflation|aggregate|business cycle|gini|per capita|protectionism|free trade|customs union|keynes|phillips|multiplier|crowding|austerity|stimulus|cartel|game theory|moral hazard|adverse selection|price ceiling|price floor|economies of scale|sunk cost|human capital|development economics|nominal gdp|real gdp|balance of payments|current account|capital account/i,
  },
  {
    id: "operations",
    re: /supply chain|logistics|procurement|warehouse|inventory|fulfillment|freight|customs|incoterm|reorder|safety stock|kanban|lean|six sigma|quality control|quality assurance|throughput|bottleneck|cycle time|lead time|takt|bill of materials|mrp|erp|3pl|wms|tms|cross-dock|pick and pack|reverse logistics|vendor-managed|make-or-buy|offshor|nearshor|reshor|demand forecast|s\/op|capacity plan|overall equipment|total productive|5s|value stream|poka-yoke|andon|pull system|push system|just-in-time|abc analysis|economic order|assembly line|batch production|good manufacturing|hazard analysis|ergonomic|standard work|visual management|downtime|mean time|service level agreement|spare parts|contract manufacturing|outsourcing|distribution center|last-mile|bill of lading|purchase order/i,
  },
  {
    id: "communication",
    re: /negotiat|presentation|memo|briefing|meeting|email|correspondence|agenda|minutes|conference call|elevator pitch|rapport|feedback|stakeholder communication|crisis communication|press release|media kit|tone of voice|active listening|assertiveness|mediation|grievance|facilitat|paraphras|summariz|clarifying|open question|closed question|complimentary close|salutation|out-of-office|escalation email|delegation message|performance conversation|constructive criticism|quorum|consensus|diplomatic|hedging language|formality level|asynchronous communication|synchronous communication|status report|stand-up meeting|town hall|internal newsletter|change communication|proposal writing|technical writing|persuasive writing|report writing|rfp|briefing note|executive summary|business etiquette|nonverbal|body language|cultural sensitivity|high-context|low-context|networking|account management|alignment|accountability|batna|compromise|dispute/i,
  },
  {
    id: "law-ethics",
    re: /contract law|breach|force majeure|indemnity|arbitration|jurisdiction|trademark|copyright|patent|antitrust|insider trading|fiduciary|whistleblower|data protection|gdpr|privacy|anti-bribery|money laundering|know your customer|sanctions|export control|wrongful termination|non-compete|confidentiality agreement|harassment|discrimination|product liability|negligence|litigation|subpoena|tort|defamation|corporate veil|bylaws|articles of incorporation|proxy vote|greenwashing|ethics code|conflict of interest|gift policy|consumer protection|warranty|class action|settlement agreement|regulatory|compliance|governance|sole proprietorship|limited liability|llc|stakeholder|board of directors|audit|entity|terminate|provision|regulatory policies|entity|nonprofit|capitalism|compromise/i,
  },
  {
    id: "analytics",
    re: /analytics|dashboard|kpi|metric|data-driven|data warehouse|data lake|etl|pipeline|visualization|regression|correlation|hypothesis|cohort|funnel analysis|forecasting|machine learning|classification|recommendation|sentiment|text mining|web analytics|event tracking|attribution|marketing mix modeling|scenario planning|monte carlo|sensitivity analysis|balanced scorecard|okrs?|drill-down|data storyt|feature engineering|model drift|statistical significance|confidence interval|p-value|sample size|net promoter|customer effort|operational dashboard|executive dashboard|business intelligence|olap|sql|descriptive analytics|diagnostic|predictive|prescriptive|master data|metadata|data governance|data quality|data cleansing|anomaly detection|time series|moving average|rfm|a\/b testing|api|automation|workflow|integration|accessibility|usability|ui |ux |feature |user experience|user acquisition|retention rate|engagement rate|retention cohort|churn rate|north star metric|analytics dashboard|customer journey|pain point/i,
  },
  {
    id: "international",
    re: /global|multinational|transnational|foreign direct|export|import|trade agreement|wto|foreign exchange|hedging currency|translation risk|transaction risk|political risk|country risk|emerging market|expatriate|localization|glocal|cultural distance|international marketing|global sourcing|transfer pricing|tax treaty|double taxation|customs duty|free trade zone|letter of credit|documentary collection|cross-border|correspondent bank|swift|remittance|repatriation|anti-dumping|countervailing|safeguard measure|export processing|maquiladora|global mobility|work permit|business visa|time zone|virtual global team|international arbitration|uncitral|beps|oecd|carbon border|geopolitical|tariff|cargo|segment|enterprise|acquisition|merger|subsidiary|joint venture|franchise|licensing|international|cross.?functional/i,
  },
  {
    id: "management",
    re: /management|leadership|supervisor|executive|employee engagement|team dynamic|high-performing|succession|remote work|hybrid work|staff|workforce|workplace|delegate|motivation|coaching|mentor|okr|alignment|accountability|grievance|disciplinary|promotion|demotion|layoff|resignation|talent|recruit|onboarding flow|hybrid|briefing|chairperson|board|stakeholder|governance|strategy|tactic|objective|kpi|benchmark|performance|productivity|planning|organizing|controlling|directing|staffing|swot|matrix structure|flat organization|line manager|middle management|top management|change management|crisis management|time management|project management|span of control|organizational culture|job rotation|job enrichment|workforce planning|management by objectives|agenda|minutes|quorum/i,
  },
  {
    id: "fundamentals",
    re: /commerce|industry|sector|headquarters|branch|department|division|subsidiary|partnership|holding|parent company|joint venture|conglomerate|small business|private company|public company|goods|services|product line|merchandise|wholesale|retail|transaction|receipt|price|cost|expense|income|loss|competitor|brand|objective|goal|policy|procedure|growth|expansion|downsizing|restructuring|takeover|divestment|spin-off|business model|value chain|owner|partner|employer|customer|supplier|consumer|marketplace|outlet|franchise|turnover|overhead|markup|quota|niche|core competency|profit center|cost center|annual report|corporate identity|hierarchy|chain of command|bottom line/i,
  },
];

function scoreCategory(word, english, arabic) {
  const blob = `${word} ${english} ${arabic}`.toLowerCase();
  const scores = {};
  for (const rule of CATEGORY_RULES) {
    if (rule.re.test(blob)) scores[rule.id] = (scores[rule.id] || 0) + 2;
  }
  return scores;
}

function pickCategory(word, english, arabic) {
  const scores = scoreCategory(word, english, arabic);
  let best = "fundamentals";
  let bestScore = -1;
  for (const [cat, sc] of Object.entries(scores)) {
    if (["fundamentals", "management", "accounting"].includes(cat)) continue;
    if (sc > bestScore) {
      bestScore = sc;
      best = cat;
    }
  }
  return best;
}

const EXPLAIN_FRAMES = {
  finance: [
    (ar) => `${ar} مصطلح مالي يُستخدم لقياس السيولة أو العائد أو تمويل المنشأة؛ فهمه يوضح قرارات الاستثمار والتمويل.`,
    (ar) => `في التمويل، ${ar} يربط المصادر والاستخدامات ويساعد على تفسير القوائم ومخاطر السوق.`,
    (ar) => `${ar} يظهر في تخطيط رأس المال وعروض البنوك عندما تقارن الإدارة البدائل طويلة الأجل.`,
  ],
  marketing: [
    (ar) => `${ar} مفهوم تسويقي يصف كيف تصل المنشأة إلى العملاء وتحوّل الاهتمام إلى شراء.`,
    (ar) => `يُقاس ${ar} في الحملات والقنوات لمعرفة ما يعمل مع الجمهور المستهدف.`,
    (ar) => `${ar} جزء من خليط التسويق ويؤثر على الوعي والولاء والتحويل.`,
  ],
  economics: [
    (ar) => `${ar} أداة اقتصادية لفهم أسواق السلع والعمالة والسياسات العامة.`,
    (ar) => `يشرح ${ar} كيف تتفاعل العرض والطلب والأسعار في الاقتصاد الكلي أو الجزئي.`,
    (ar) => `${ar} يساعد على قراءة التضخم والنمو والبطالة والتجارة الدولية.`,
  ],
  entrepreneurship: [
    (ar) => `${ar} شائع في الشركات الناشئة عند اختبار الفكرة وجمع التمويل وتوسيع النمو.`,
    (ar) => `يُستخدم ${ar} لتقييم الجدوى والجذب السوقي قبل الإنفاق الكبير.`,
    (ar) => `${ar} يربط الابتكار بالتمويل والفريق وملاءمة السوق.`,
  ],
  communication: [
    (ar) => `${ar} مهارة تواصل مهنية تدعم الاجتماعات والمراسلات والتفاوض داخل المنشأة.`,
    (ar) => `إتقان ${ar} يقلل سوء الفهم ويرفع وضوح القرارات بين الأطراف.`,
    (ar) => `${ar} يظهر في المراسلات الرسمية والعروض والحوارات مع أصحاب المصلحة.`,
  ],
  operations: [
    (ar) => `${ar} مفهوم تشغيلي يمس التوريد والإنتاج والجودة وتسليم العميل.`,
    (ar) => `في العمليات، ${ar} يربط التخطيط بالتنفيذ وقياس الأداء التشغيلي.`,
    (ar) => `${ar} يساعد على تقليل الهدر وتحسين زمن التسليم وتكلفة الوحدة.`,
  ],
  "law-ethics": [
    (ar) => `${ar} مصطلح قانوني أو أخلاقي يحدد حقوق والتزامات الأطراف في الأعمال.`,
    (ar) => `يساعد ${ar} على تقليل النزاعات والامتثال للأنظمة وحماية السمعة.`,
    (ar) => `${ar} يُنظر إليه في العقود والسياسات الداخلية ومراجعات الامتثال.`,
  ],
  analytics: [
    (ar) => `${ar} أداة تحليلية لتحويل البيانات إلى مؤشرات تدعم القرار التجاري.`,
    (ar) => `يُستخدم ${ar} في لوحات المتابعة والتجارب لقياس الأداء والتنبؤ.`,
    (ar) => `${ar} يربط جمع البيانات بجودتها ثم بعرضها للإدارة.`,
  ],
  international: [
    (ar) => `${ar} يظهر في التجارة عبر الحدود وتمويل الصرف والمخاطر السياسية.`,
    (ar) => `يساعد ${ar} على دخول أسواق أجنبية وإدارة العملات والامتثال الجمركي.`,
    (ar) => `${ar} جزء من استراتيجية التوسع الدولي والتوريد العالمي.`,
  ],
};

function hashStr(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

function mkExplain(category, ar, word) {
  const frames = EXPLAIN_FRAMES[category] || EXPLAIN_FRAMES.finance;
  return frames[hashStr(word) % frames.length](ar);
}

function toDefinition(english, word) {
  const e = String(english || "").trim();
  if (/^[A-Z]{2,6}\s+(is|stands for)/i.test(e)) return e;
  if (/^(A|An|The)\s+/i.test(e) && e.length > 40) return e;
  if (e.length > 15) return e.endsWith(".") ? e : `${e}.`;
  return `Business term: ${word}. ${e || "Used in professional contexts."}`.replace(/\.\.$/, ".");
}

function mkRelated(word, category) {
  const rel = {
    finance: ["cash flow", "budget", "investment"],
    marketing: ["brand", "customer", "conversion rate"],
    economics: ["supply", "demand", "market"],
    entrepreneurship: ["funding", "prototype", "traction"],
    communication: ["meeting", "negotiation", "agenda"],
    operations: ["supply chain", "quality control", "logistics"],
    "law-ethics": ["contract", "compliance", "governance"],
    analytics: ["KPI", "dashboard", "data-driven"],
    international: ["export", "tariff", "foreign exchange"],
  };
  return (rel[category] || rel.finance).filter((t) => norm(t) !== norm(word)).slice(0, 2);
}

function makeEntry(word, source, category) {
  const w = String(word).trim();
  const defPack = DEFINITIONS[norm(w)];
  const merged = defPack
    ? {
        ...source,
        arabic: defPack.ar || source.arabic,
        english: defPack.en || source.english,
        level: defPack.level || source.level,
        exampleEn: defPack.exampleEn,
        exampleAr: defPack.exampleAr,
        synonyms: defPack.synonyms,
        related: defPack.related,
        explanationAr: defPack.explanationAr,
      }
    : source;
  const ar = merged.arabic || merged.translationAr || w;
  const english = merged.english || merged.definitionEn || "";
  const difficulty = levelAdjust(merged.level, w);
  const pos = guessPos(w);
  const definitionEn = toDefinition(english, w);
  const explanationAr = merged.explanationAr || mkExplain(category, ar.split("/")[0].trim(), w);
  const exampleEn = merged.exampleEn || mkExampleEn(w, category);
  const exampleAr = merged.exampleAr || mkExampleAr(w, ar, category);
  const synonyms = merged.synonyms?.length ? merged.synonyms : mkSynonyms(w);
  const related = merged.related?.length ? merged.related : mkRelated(w, category);
  return { word: w, pos, difficulty, translationAr: ar, definitionEn, explanationAr, exampleEn, exampleAr, synonyms, related, phonetic: null };
}

const EXAMPLE_EN = {
  finance: [
    "The treasurer reported {word} in the monthly liquidity pack.",
    "Analysts compared {word} across the last four quarters.",
    "The loan committee asked for detail on {word} before approval.",
    "Our forecast assumes stable {word} through year-end.",
    "Investors questioned how {word} affects dividend policy.",
    "The CFO highlighted {word} during the earnings call.",
  ],
  marketing: [
    "The brand team measured {word} after the relaunch.",
    "A/B tests showed how {word} lifted conversions.",
    "The agency brief focused on improving {word}.",
    "Campaign results linked {word} to higher qualified leads.",
    "Retail partners asked for clarity on {word}.",
    "We updated the playbook section on {word}.",
  ],
  economics: [
    "The briefing used {word} to explain price pressure.",
    "Policy makers debated {word} at the summit.",
    "Students modeled {word} with last year's trade data.",
    "The report tied {word} to slower hiring in services.",
    "Analysts linked {word} to the currency move.",
    "The forecast chapter opens with {word}.",
  ],
  entrepreneurship: [
    "Founders reviewed {word} before the seed meeting.",
    "Mentors pressed the team on evidence for {word}.",
    "The incubator worksheet tracks {word} weekly.",
    "Advisors said {word} must improve before a Series A.",
    "The deck slide on {word} drew most questions.",
    "Early users helped validate {word}.",
  ],
  communication: [
    "Please state {word} plainly in the opening paragraph.",
    "The facilitator summarized {word} before the vote.",
    "Attendees noted {word} in the written minutes.",
    "The client email should define {word} once.",
    "Training covered {word} for cross-cultural calls.",
    "The chair reminded everyone about {word}.",
  ],
  operations: [
    "The plant manager posted {word} on the shift board.",
    "Buyers renegotiated after {word} slipped last month.",
    "QA tied {word} to two late customer shipments.",
    "The ERP report flags {word} every morning.",
    "Lean coaches watched {word} during the gemba walk.",
    "Warehouse staff log {word} at handover.",
  ],
  "law-ethics": [
    "Compliance circulated guidance on {word}.",
    "Counsel flagged {word} in the draft agreement.",
    "The ethics committee discussed {word} openly.",
    "Audit asked whether {word} was documented.",
    "The board pack includes a note on {word}.",
    "Training refreshed rules about {word}.",
  ],
  analytics: [
    "The BI team added {word} to the executive view.",
    "Analysts validated {word} before publishing.",
    "The experiment readout featured {word}.",
    "Data stewards defined {word} in the glossary.",
    "Product ops monitors {word} each sprint.",
    "The warehouse job refreshes {word} nightly.",
  ],
  international: [
    "The trade desk explained {word} to the distributor.",
    "Customs brokers clarified {word} on the invoice.",
    "Regional leads compared {word} across markets.",
    "Treasury hedged after {word} moved sharply.",
    "The joint venture memo covers {word}.",
    "Export finance asked for proof of {word}.",
  ],
};

const EXAMPLE_AR = {
  finance: [
    "أشار أمين الصندوق إلى {ar} في حزمة السيولة الشهرية.",
    "قارن المحلّلون {ar} على مدى الأربعة أرباع الأخيرة.",
    "طلبت لجنة القروض تفاصيل عن {ar} قبل الموافقة.",
    "تفترض توقعاتنا استقرار {ar} حتى نهاية السنة.",
    "استفسر المستثمرون عن أثر {ar} على سياسة التوزيعات.",
    "أبرز المدير المالي {ar} خلال مكالمة الأرباح.",
  ],
  marketing: [
    "قاس فريق العلامة {ar} بعد إعادة الإطلاق.",
    "أظهرت اختبارات أ/ب أن {ar} رفع التحويلات.",
    "ركز موجز الوكالة على تحسين {ar}.",
    "ربطت نتائج الحملة {ar} بزيادة العملاء المؤهلين.",
    "طلب شركاء التجزئة توضيح {ar}.",
    "حدّثنا قسم دليل العمل الخاص بـ{ar}.",
  ],
  economics: [
    "استخدمت الإحاطة {ar} لشرح ضغط الأسعار.",
    "ناقش صانعو السياسات {ar} في القمة.",
    "نمذج الطلاب {ar} ببيانات التجارة للعام الماضي.",
    "ربط التقرير {ar} بتباطؤ التوظيف في الخدمات.",
    "ربط المحلّلون {ar} بتحرك العملة.",
    "يبدأ فصل التوقعات بـ{ar}.",
  ],
  entrepreneurship: [
    "راجع المؤسسون {ar} قبل اجتماع التمويل الأولي.",
    "ضغط المرشدون على الفريق لإثبات {ar}.",
    "يتتبع نموذج الحاضنة {ar} أسبوعيًا.",
    "قال المستشارون إن {ar} يجب أن يتحسن قبل الجولة أ.",
    "جذبت شريحة العرض الخاصة بـ{ar} معظم الأسئلة.",
    "ساعد المستخدمون الأوائل على التحقق من {ar}.",
  ],
  communication: [
    "يُرجى ذكر {ar} بوضوح في الفقرة الافتتاحية.",
    "لخّص الميسّر {ar} قبل التصويت.",
    "دوّن الحاضرون {ar} في المحضر.",
    "ينبغي أن يعرّف بريد العميل {ar} مرة واحدة.",
    "غطى التدريب {ar} للمكالمات بين الثقافات.",
    "ذكّر الرئيس الجميع بـ{ar}.",
  ],
  operations: [
    "نشر مدير المصنع {ar} على لوحة الوردية.",
    "أعاد المشترون التفاوض بعد تراجع {ar} الشهر الماضي.",
    "ربطت الجودة {ar} بشحنتين متأخرتين.",
    "يُظهر تقرير نظام تخطيط الموارد {ar} كل صباح.",
    "راقب مدربو اللين {ar} أثناء جولة الجيمبا.",
    "يسجّل مستودع {ar} عند التسليم.",
  ],
  "law-ethics": [
    "وزّع الامتثال إرشادات حول {ar}.",
    "أشار المستشار إلى {ar} في مسودة الاتفاق.",
    "ناقشت لجنة الأخلاق {ar} علنًا.",
    "سأل التدقيق عما إذا كان {ar} موثقًا.",
    "يتضمن حزم المجلس ملاحظة عن {ar}.",
    "جدّد التدريب قواعد {ar}.",
  ],
  analytics: [
    "أضاف فريق ذكاء الأعمال {ar} إلى عرض الإدارة.",
    "تحقق المحلّلون من {ar} قبل النشر.",
    "تضم قراءة التجربة {ar}.",
    "عرّف أمناء البيانات {ar} في المعجم.",
    "يراقب تشغيل المنتج {ar} كل سبرنت.",
    "يحدّث مهمة المستودع {ar} ليلًا.",
  ],
  international: [
    "شرح مكتب التجارة {ar} للموزّع.",
    "وضح وسطاء الجمارك {ar} على الفاتورة.",
    "قارن قادة المناطق {ar} بين الأسواق.",
    "تحوّطت الخزينة بعد تحرك {ar} بشدة.",
    "يغطي مذكرة المشروع المشترك {ar}.",
    "طلب تمويل التصدير إثبات {ar}.",
  ],
};

function mkExampleEn(word, category) {
  const list = EXAMPLE_EN[category] || EXAMPLE_EN.finance;
  const tpl = list[hashStr(word) % list.length];
  return tpl.replace(/\{word\}/g, word);
}

function mkExampleAr(word, ar, category) {
  const shortAr = ar.split("/")[0].trim();
  const list = EXAMPLE_AR[category] || EXAMPLE_AR.finance;
  const tpl = list[hashStr(word + "ar") % list.length];
  return tpl.replace(/\{ar\}/g, shortAr);
}

function mkSynonyms(word) {
  const w = norm(word);
  if (w.includes("rate")) return ["ratio", "metric"];
  if (w.includes("strategy")) return ["approach", "plan"];
  if (w.includes("analysis")) return ["study", "review"];
  if (w.includes(" ")) {
    const parts = w.split(" ");
    return [parts.slice(0, -1).join(" "), parts[parts.length - 1]];
  }
  return ["concept", "business term"];
}

function serializeEntry(entry) {
  const esc = (s) => String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  const arr = (a) => `[${a.map((x) => `"${esc(x)}"`).join(",")}]`;
  return `    e("${esc(entry.word)}","${esc(entry.pos)}","${entry.difficulty}","${esc(entry.translationAr)}","${esc(entry.definitionEn)}","${esc(entry.explanationAr)}","${esc(entry.exampleEn)}","${esc(entry.exampleAr)}",${arr(entry.synonyms)},${arr(entry.related)},${entry.phonetic ? `"${esc(entry.phonetic)}"` : "null"})`;
}

function uniqueByWord(list) {
  const seen = new Set();
  const out = [];
  for (const item of list) {
    const k = norm(item.word);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(item);
  }
  return out;
}

function buildCategory(category, targetMin = 72, targetMax = 80) {
  const target = 74;
  const buckets = [];
  const used = new Set([...SKIP, ...CURATED_EXISTING]);

  for (const seed of CATEGORY_SEEDS[category] || []) {
    const key = norm(seed);
    if (used.has(key)) continue;
    buckets.push(makeEntry(seed, DEFINITIONS[key] || {}, category));
    used.add(key);
  }

  for (const item of vocabs.batch39 || []) {
    if (buckets.length >= target) break;
    if (!item?.word) continue;
    const key = norm(item.word);
    if (used.has(key)) continue;
    if (pickCategory(item.word, item.english, item.arabic) !== category) continue;
    buckets.push(makeEntry(item.word, item, category));
    used.add(key);
  }

  const inv = JSON.parse(fs.readFileSync(path.join(__dirname, "inventory.json"), "utf8"));
  for (const item of inv.items || []) {
    if (buckets.length >= target) break;
    const key = norm(item.word);
    if (used.has(key)) continue;
    if (pickCategory(item.word, item.english, item.arabic) !== category) continue;
    buckets.push(
      makeEntry(item.word, { ...item, arabic: item.arabic, english: item.english, level: item.level, exampleAr: item.arabic_example }, category)
    );
    used.add(key);
  }

  const uniq = uniqueByWord(buckets);
  if (uniq.length < targetMin) {
    throw new Error(`Category ${category} only has ${uniq.length} entries (need at least ${targetMin})`);
  }
  return uniq.slice(0, targetMax);
}

const REST_CATEGORIES = [
  "finance",
  "marketing",
  "economics",
  "entrepreneurship",
  "communication",
  "operations",
  "law-ethics",
  "analytics",
  "international",
];

const banks = {};
let total = 0;
for (const cat of REST_CATEGORIES) {
  banks[cat] = buildCategory(cat);
  total += banks[cat].length;
  console.log(cat, banks[cat].length);
}

const lawEthicsKey = "law-ethics";
const chunks = [];
chunks.push(`/**\n * Curated business vocabulary — remaining category banks.\n * Definitions, explanations, and examples are original teaching text.\n */\n`);
chunks.push(`import { e } from "./e-helper.mjs";\n`);
for (const cat of REST_CATEGORIES) {
  const varName = cat === lawEthicsKey ? "lawEthics" : cat;
  chunks.push(`\nconst ${varName} = [\n${banks[cat].map(serializeEntry).join(",\n")}\n];\n`);
}
chunks.push(`
export const REST_BANKS = {
  finance,
  marketing,
  economics,
  entrepreneurship,
  communication,
  operations,
  "law-ethics": lawEthics,
  analytics,
  international,
};
`);
fs.writeFileSync(path.join(__dirname, "curated-rest.mjs"), chunks.join(""), "utf8");
console.log("TOTAL REST", total);

// category-hints
const inv = JSON.parse(fs.readFileSync(path.join(__dirname, "inventory.json"), "utf8"));
const hints = {};
const manual = {
  startup: "entrepreneurship",
  scalability: "entrepreneurship",
  mvp: "entrepreneurship",
  churn: "marketing",
  retention: "marketing",
  revenue: "finance",
  profit: "finance",
  gdp: "economics",
  inflation: "economics",
  entrepreneur: "entrepreneurship",
  company: "fundamentals",
  firm: "fundamentals",
  asset: "accounting",
  liability: "accounting",
  depreciation: "accounting",
  equity: "finance",
  "accounts payable": "accounting",
  "accounts receivable": "accounting",
  management: "management",
  negotiation: "communication",
  allocate: "economics",
  audit: "accounting",
  benchmark: "analytics",
  cargo: "international",
  capitalism: "economics",
  compromise: "communication",
  contractor: "law-ethics",
  deficit: "economics",
  discrimination: "law-ethics",
  dispute: "law-ethics",
  diversity: "management",
  enterprise: "fundamentals",
  entity: "law-ethics",
  exceed: "finance",
  forecast: "finance",
  gross: "accounting",
  investor: "finance",
  maximize: "economics",
  net: "accounting",
  nonprofit: "law-ethics",
  portfolio: "finance",
  profitable: "finance",
  proposition: "marketing",
  provision: "law-ethics",
  regulatory: "law-ethics",
  reliability: "operations",
  rental: "finance",
  segment: "marketing",
  "short-term": "finance",
  speculate: "finance",
  strategy: "management",
  tactic: "management",
  terminate: "law-ethics",
  venture: "entrepreneurship",
  workforce: "management",
  workplace: "management",
  warrant: "finance",
  founder: "entrepreneurship",
  finance: "finance",
  merger: "finance",
  acquisition: "finance",
  stakeholder: "management",
  shareholder: "finance",
  dividend: "finance",
  invoice: "accounting",
  payroll: "finance",
  overhead: "fundamentals",
  margin: "finance",
  leverage: "finance",
  liquidity: "finance",
  collateral: "finance",
  amortization: "accounting",
  currency: "international",
  supply: "economics",
  demand: "economics",
  market: "marketing",
  investment: "finance",
  brand: "marketing",
  consumer: "fundamentals",
  competitor: "fundamentals",
  outsourcing: "operations",
  franchise: "fundamentals",
  monopoly: "economics",
  oligopoly: "economics",
  tariff: "international",
  export: "international",
  import: "international",
  subsidiary: "fundamentals",
  compliance: "law-ethics",
  governance: "law-ethics",
  fiduciary: "law-ethics",
  procurement: "operations",
  logistics: "operations",
  inventory: "operations",
  kpi: "analytics",
  forecasting: "analytics",
  bond: "finance",
  stock: "finance",
  share: "finance",
  "interest rate": "finance",
  "cash flow": "finance",
  "working capital": "finance",
};

for (const [k, v] of Object.entries(manual)) hints[k] = v;

for (const item of inv.items || []) {
  const key = norm(item.word);
  if (hints[key]) continue;
  hints[key] = pickCategory(item.word, item.english, item.arabic);
}

for (const item of vocabs.batch39 || []) {
  const key = norm(item.word);
  if (!hints[key]) hints[key] = pickCategory(item.word, item.english, item.arabic);
}

// Ensure ~180 mappings minimum with common business lemmas
const extraWords = [
  ["a/b testing", "analytics"],
  ["aarrr framework", "marketing"],
  ["accessibility", "analytics"],
  ["account management", "communication"],
  ["accountability", "management"],
  ["activation", "entrepreneurship"],
  ["activation rate", "analytics"],
  ["alignment", "management"],
  ["analytics", "analytics"],
  ["analytics dashboard", "analytics"],
  ["angel investor", "entrepreneurship"],
  ["annual recurring revenue", "finance"],
  ["api", "analytics"],
  ["authority", "marketing"],
  ["automation", "analytics"],
  ["awareness", "marketing"],
  ["balance sheet", "accounting"],
  ["batna", "communication"],
  ["blue ocean strategy", "marketing"],
  ["board of directors", "management"],
  ["book value", "finance"],
  ["bootstrapping", "entrepreneurship"],
  ["brand loyalty", "marketing"],
  ["brand positioning", "marketing"],
  ["break-even point", "finance"],
  ["budget", "finance"],
  ["burn rate", "entrepreneurship"],
  ["business continuity", "operations"],
  ["business development", "entrepreneurship"],
  ["business model", "fundamentals"],
  ["cac", "marketing"],
  ["capital expenditure", "finance"],
  ["cash burn", "entrepreneurship"],
  ["cash flow statement", "finance"],
  ["cash reserve", "finance"],
  ["closing", "marketing"],
  ["cold outreach", "marketing"],
  ["competitive advantage", "marketing"],
  ["content strategy", "marketing"],
  ["conversion rate", "marketing"],
  ["copywriting", "marketing"],
  ["cost structure", "entrepreneurship"],
  ["crm", "marketing"],
  ["cta", "marketing"],
  ["customer acquisition", "marketing"],
  ["customer journey", "analytics"],
  ["customer persona", "marketing"],
  ["data-driven", "analytics"],
  ["disruption", "entrepreneurship"],
  ["employee engagement", "management"],
  ["engagement", "marketing"],
  ["feature", "entrepreneurship"],
  ["feature prioritization", "entrepreneurship"],
  ["founder mindset", "entrepreneurship"],
  ["freemium", "entrepreneurship"],
  ["freelancing", "entrepreneurship"],
  ["funding", "entrepreneurship"],
  ["growth hacking", "marketing"],
  ["headline", "marketing"],
  ["high-performing team", "management"],
  ["integration", "analytics"],
  ["iteration", "entrepreneurship"],
  ["iteration cycle", "entrepreneurship"],
  ["landing page", "marketing"],
  ["lead", "marketing"],
  ["lean startup", "entrepreneurship"],
  ["limited liability company", "law-ethics"],
  ["ltv", "marketing"],
  ["market penetration", "marketing"],
  ["market share", "marketing"],
  ["market validation", "entrepreneurship"],
  ["marketing funnel", "marketing"],
  ["monetization", "marketing"],
  ["network effect", "entrepreneurship"],
  ["north star metric", "analytics"],
  ["onboarding", "entrepreneurship"],
  ["onboarding flow", "entrepreneurship"],
  ["operating expenses", "finance"],
  ["operating profit", "finance"],
  ["organic growth", "marketing"],
  ["paid ads", "marketing"],
  ["pain point", "entrepreneurship"],
  ["personal branding", "marketing"],
  ["pitch deck", "entrepreneurship"],
  ["pivot", "entrepreneurship"],
  ["pricing strategy", "marketing"],
  ["product-market fit", "entrepreneurship"],
  ["product strategy", "entrepreneurship"],
  ["profit margin", "finance"],
  ["prototype", "entrepreneurship"],
  ["qualified lead", "marketing"],
  ["remote work", "management"],
  ["retention cohort", "analytics"],
  ["retention rate", "analytics"],
  ["risk assessment", "law-ethics"],
  ["roadmap", "entrepreneurship"],
  ["runway", "entrepreneurship"],
  ["sales call", "marketing"],
  ["sales pipeline", "marketing"],
  ["saas", "entrepreneurship"],
  ["seo", "marketing"],
  ["social proof", "marketing"],
  ["sole proprietorship", "law-ethics"],
  ["solution-oriented", "entrepreneurship"],
  ["subscription model", "marketing"],
  ["succession planning", "management"],
  ["target audience", "marketing"],
  ["team dynamics", "management"],
  ["testimonial", "marketing"],
  ["traction", "entrepreneurship"],
  ["traffic", "marketing"],
  ["ui", "analytics"],
  ["upselling", "marketing"],
  ["user acquisition", "analytics"],
  ["user experience", "analytics"],
  ["user feedback", "entrepreneurship"],
  ["usability", "analytics"],
  ["ux", "analytics"],
  ["valuation", "finance"],
  ["vendor", "operations"],
  ["venture capital", "entrepreneurship"],
  ["viral growth", "marketing"],
  ["virality", "marketing"],
  ["workflow", "operations"],
  ["cross-selling", "marketing"],
  ["case study", "marketing"],
  ["churn rate", "analytics"],
  ["engagement rate", "analytics"],
  ["gross revenue", "finance"],
  ["net profit", "finance"],
  ["networking", "communication"],
  ["public company", "fundamentals"],
  ["private company", "fundamentals"],
  ["human resources", "management"],
  ["swot analysis", "management"],
  ["value chain", "fundamentals"],
  ["joint venture", "fundamentals"],
  ["takeover", "fundamentals"],
  ["restructuring", "fundamentals"],
  ["downsizing", "fundamentals"],
  ["spin-off", "fundamentals"],
  ["conglomerate", "fundamentals"],
  ["wholesale", "fundamentals"],
  ["retail", "fundamentals"],
  ["merchandise", "fundamentals"],
  ["stakeholder", "management"],
  ["shareholder", "finance"],
  ["dividend", "finance"],
  ["balance sheet", "accounting"],
  ["income statement", "accounting"],
  ["cash flow statement", "finance"],
  ["internal control", "accounting"],
  ["double-entry bookkeeping", "accounting"],
  ["financial statement", "accounting"],
  ["gross profit", "accounting"],
  ["net income", "accounting"],
  ["current asset", "accounting"],
  ["fixed asset", "accounting"],
  ["retained earnings", "accounting"],
  ["accrual accounting", "accounting"],
  ["trial balance", "accounting"],
  ["general ledger", "accounting"],
  ["journal entry", "accounting"],
  ["bank reconciliation", "accounting"],
  ["external auditor", "accounting"],
  ["value-added tax", "accounting"],
  ["withholding tax", "accounting"],
  ["contingent liability", "accounting"],
  ["fair value", "accounting"],
  ["going concern", "accounting"],
  ["material misstatement", "accounting"],
  ["notes to the accounts", "accounting"],
  ["consistency principle", "accounting"],
  ["matching principle", "accounting"],
  ["accounting equation", "accounting"],
  ["owner's equity", "accounting"],
  ["share capital", "accounting"],
  ["cost of goods sold", "accounting"],
  ["petty cash", "accounting"],
  ["credit note", "accounting"],
  ["debit note", "accounting"],
  ["voucher", "accounting"],
  ["source document", "accounting"],
  ["prepaid expense", "accounting"],
  ["accrued expense", "accounting"],
  ["adjusting entry", "accounting"],
  ["closing entry", "accounting"],
  ["subsidiary ledger", "accounting"],
  ["control account", "accounting"],
  ["straight-line method", "accounting"],
  ["accumulated depreciation", "accounting"],
  ["write-off", "accounting"],
  ["impairment", "accounting"],
  ["prudence", "accounting"],
  ["controller", "accounting"],
  ["bookkeeping", "accounting"],
  ["accountant", "accounting"],
  ["unqualified opinion", "accounting"],
  ["fifo", "accounting"],
  ["lifo", "accounting"],
];

for (const [k, v] of extraWords) hints[norm(k)] = v;

const hintLines = Object.keys(hints)
  .sort()
  .slice(0, 220)
  .map((k) => `  "${k.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}": "${hints[k]}",`)
  .join("\n");

const hintsSrc = `/** Maps inventory / legacy headwords to business library category ids (lowercase keys). */\nexport const CATEGORY_HINTS = {\n${hintLines}\n};\n`;
fs.writeFileSync(path.join(__dirname, "category-hints.mjs"), hintsSrc, "utf8");
console.log("hints", Object.keys(hints).length);