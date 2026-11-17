/** Writes rest-seeds.mjs — category word lists + curated definitions. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import vocabs from "../../../src/data/vocabs.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const CATEGORY_SEEDS = {
  finance: [
    "bond", "stock exchange", "treasury bill", "mutual fund", "exchange-traded fund", "coupon payment",
    "bond maturity", "principal amount", "credit rating", "sovereign bond", "corporate bond", "municipal bond",
    "yield curve", "benchmark rate", "base rate", "refinancing", "syndicated loan", "term loan",
    "revolving credit", "loan covenant", "mezzanine debt", "convertible bond", "preferred shares",
    "common shares", "initial public offering", "secondary offering", "market capitalization", "price-to-earnings ratio",
    "earnings per share", "book-to-market ratio", "dividend yield", "share buyback", "stock split",
    "bear market", "bull market", "portfolio diversification", "asset allocation", "hedge fund",
    "private equity fund", "capital gains", "cost of capital", "weighted average cost of capital",
    "internal rate of return", "net present value", "payback period", "capital budgeting", "debt service",
    "interest coverage ratio", "debt-to-capital ratio", "free cash flow", "enterprise value", "financial leverage",
    "credit spread", "duration risk", "floating rate", "fixed rate loan", "factoring", "equipment lease",
    "sale and leaseback", "green finance", "Islamic finance", "sukuk", "venture debt", "bridge loan",
    "letter of credit", "bank guarantee", "custodian bank", "clearing house", "custody fee", "management fee",
    "performance fee", "carried interest", "capital call", "distribution waterfall", "limited partner",
    "general partner", "fund prospectus", "credit default swap",
  ],
  marketing: [
    "market segmentation", "targeting strategy", "brand equity", "value proposition", "go-to-market plan",
    "marketing mix", "promotional campaign", "public relations", "trade promotion", "consumer promotion",
    "point of sale display", "merchandising plan", "channel strategy", "distribution strategy", "pricing elasticity",
    "penetration pricing", "skimming pricing", "psychological pricing", "bundle pricing", "dynamic pricing",
    "customer lifetime value", "net promoter score", "brand awareness metric", "share of voice", "impression",
    "click-through rate", "return on ad spend", "media planning", "creative brief", "ad copy",
    "market research survey", "focus group study", "product sampling", "sponsorship deal", "event marketing",
    "experiential marketing", "guerrilla marketing", "influencer partnership", "affiliate program", "referral incentive",
    "remarketing campaign", "retargeting pixel", "account-based marketing", "lead nurturing", "sales funnel stage",
    "marketing automation flow", "customer persona map", "buyer journey", "touchpoint analysis", "omnichannel retail",
    "customer experience design", "loyalty rewards program", "cross-selling offer", "product launch event",
    "corporate storytelling", "visual identity system", "tagline development", "unique selling proposition",
    "competitive benchmarking", "perceptual mapping", "brand extension decision", "co-branding agreement",
    "product placement deal", "B2B marketing", "content calendar", "editorial calendar", "email drip sequence",
    "search engine marketing", "display advertising", "programmatic advertising", "native advertising",
    "marketing qualified lead", "sales qualified lead", "brand ambassador", "customer advocacy", "sentiment tracking",
  ],
  economics: [
    "microeconomics", "macroeconomics", "law of demand", "law of supply", "price elasticity of demand",
    "price elasticity of supply", "market equilibrium", "consumer surplus", "producer surplus", "marginal utility",
    "marginal cost", "marginal revenue", "opportunity cost", "production possibilities frontier", "comparative advantage",
    "absolute advantage", "trade barrier", "import quota", "export subsidy", "negative externality",
    "positive externality", "public good", "common resource", "natural monopoly", "perfect competition",
    "monopolistic competition", "market failure", "fiscal policy", "monetary policy", "central bank rate",
    "open market operation", "quantitative easing", "fiscal deficit", "public debt ratio", "budget surplus",
    "aggregate demand", "aggregate supply", "business cycle phase", "economic recession", "economic expansion",
    "unemployment rate", "labor force participation", "productivity growth rate", "purchasing power", "consumer price index",
    "producer price index", "deflation risk", "stagflation", "nominal interest rate", "real interest rate",
    "exchange rate regime", "balance of payments", "current account balance", "capital account flow", "trade surplus",
    "trade deficit", "purchasing power parity", "real gross domestic product", "per capita income", "gini coefficient",
    "economic development", "human capital theory", "economies of scale", "diseconomies of scale", "sunk cost",
    "variable cost curve", "price ceiling policy", "price floor policy", "cartel behavior", "game theory model",
    "moral hazard problem", "adverse selection", "information asymmetry", "fiscal multiplier", "crowding out effect",
    "Phillips curve", "supply-side policy", "austerity measure", "stimulus package", "protectionist tariff",
    "free trade area", "customs union", "economic integration",
  ],
  entrepreneurship: [
    "business plan outline", "founding team", "co-founder agreement", "startup incubator", "business accelerator",
    "seed funding round", "series A round", "product-market validation", "lean canvas model", "business model canvas",
    "pivot strategy", "bootstrapped growth", "cash runway", "pre-money valuation", "post-money valuation",
    "capitalization table", "investment term sheet", "due diligence review", "equity crowdfunding", "convertible note",
    "early adopter segment", "mentor network", "proof of concept", "minimum feature set", "go-to-market experiment",
    "franchise opportunity", "scale-up phase", "exit strategy", "acquisition target", "licensing deal",
    "intellectual property strategy", "patent application", "trade secret policy", "non-disclosure agreement",
    "sweat equity", "vesting schedule", "cliff vesting", "advisory board seat", "pitch competition",
    "demo day event", "regulatory sandbox", "social enterprise model", "impact venture", "intrapreneurship program",
    "marketplace business model", "network effects", "first-mover advantage", "freemium model", "subscription revenue",
    "unit economics", "customer development", "growth loop", "beachhead market", "total addressable market",
    "serviceable obtainable market", "problem validation", "value hypothesis", "growth hypothesis", "experimentation mindset",
    "iteration speed", "customer discovery interview", "user interview guide", "problem-solution fit", "founder-market fit",
    "secondary share sale", "down round financing", "up round financing", "anti-dilution clause", "liquidation preference",
    "drag-along right", "tag-along right", "safe agreement", "bridge financing", "angel syndicate", "venture scout",
    "corporate venture arm", "startup studio", "side project validation", "revenue milestone",
  ],
  communication: [
    "business correspondence", "internal memo", "executive summary", "briefing document", "press release draft",
    "media kit", "tone of voice guide", "active listening skill", "feedback session", "upward communication",
    "downward communication", "lateral communication", "informal grapevine", "meeting minutes template", "action item list",
    "conference call etiquette", "video conference protocol", "presentation structure", "elevator pitch script",
    "negotiation preparation", "persuasive argument", "professional rapport", "empathetic response", "message clarity",
    "business courtesy", "cross-cultural communication", "high-context culture", "low-context culture", "nonverbal signal",
    "professional body language", "business etiquette rule", "email etiquette standard", "subject line clarity",
    "call to action phrase", "persuasive business writing", "technical report writing", "business proposal", "RFP response",
    "stakeholder update", "crisis communication plan", "change communication plan", "internal newsletter", "town hall meeting",
    "facilitation skill", "discussion moderation", "paraphrasing technique", "meeting summary", "clarifying question",
    "open-ended question", "closed-ended question", "assertive communication", "conflict de-escalation", "workplace mediation",
    "apology statement", "thank-you note", "follow-up message", "out-of-office reply", "escalation path",
    "delegation request", "performance discussion", "constructive feedback", "recognition message", "meeting facilitation",
    "timekeeping rule", "quorum requirement", "consensus decision", "diplomatic wording", "hedging expression",
    "formality register", "professional salutation", "complimentary close", "attachment reference", "copy etiquette",
    "blind copy discretion", "professional voicemail", "introduction email", "networking follow-up", "status update email",
    "stand-up meeting format", "asynchronous update", "synchronous workshop", "documentation standard",
  ],
  operations: [
    "supply chain design", "inbound logistics", "outbound logistics", "procurement process", "warehouse management",
    "distribution planning", "order fulfillment", "last-mile delivery", "freight forwarding", "customs documentation",
    "Incoterms rule", "bill of lading", "reorder point", "safety stock level", "economic order quantity",
    "ABC inventory classification", "just-in-time production", "kanban system", "lean manufacturing", "Six Sigma project",
    "total quality management", "kaizen event", "process bottleneck", "throughput rate", "capacity utilization",
    "cycle time reduction", "manufacturing lead time", "takt time", "standard work instruction", "work order system",
    "bill of materials", "master production schedule", "material requirements planning", "enterprise resource planning",
    "quality control inspection", "quality assurance audit", "defect rate", "root cause analysis", "preventive maintenance",
    "overall equipment effectiveness", "facility layout design", "assembly line balancing", "batch production run",
    "reverse logistics process", "returns management", "third-party logistics", "cross-docking operation", "consolidation center",
    "pick and pack process", "warehouse management system", "transportation management system", "supplier scorecard",
    "vendor-managed inventory", "contract manufacturing", "make-or-buy analysis", "business process outsourcing",
    "nearshoring decision", "reshoring initiative", "demand forecasting model", "sales and operations planning", "capacity planning",
    "maintenance schedule", "spare parts planning", "ISO quality certification", "good manufacturing practice", "hazard analysis plan",
    "workplace ergonomics", "visual management board", "5S workplace method", "waste elimination", "value stream mapping",
    "mistake-proofing device", "andon alert system", "pull production system", "push production system", "service level target",
    "overall process efficiency", "mean time between failures", "planned downtime", "unplanned downtime", "route optimization",
  ],
  "law-ethics": [
    "contract formation", "breach of contract", "force majeure clause", "indemnification clause", "limitation of liability",
    "arbitration agreement", "choice of law", "jurisdiction clause", "trademark protection", "copyright license",
    "patent licensing", "unfair competition law", "antitrust regulation", "price collusion", "insider trading rule",
    "securities disclosure", "fiduciary obligation", "duty of care", "duty of loyalty", "corporate governance code",
    "whistleblower policy", "data protection law", "privacy notice", "consent management", "anti-bribery law",
    "anti-money laundering", "know your customer rule", "economic sanctions compliance", "export control license",
    "employment agreement", "wrongful dismissal", "non-compete covenant", "confidentiality obligation", "workplace harassment policy",
    "anti-discrimination law", "equal employment opportunity", "occupational safety rule", "product liability claim", "strict liability rule",
    "negligence standard", "regulatory filing", "business license", "environmental compliance", "sustainability reporting",
    "code of ethics", "conflict of interest policy", "gift and hospitality policy", "lobbying disclosure", "fair trading law",
    "consumer protection law", "product warranty", "class action lawsuit", "settlement negotiation", "subpoena request",
    "statute of limitations", "civil tort", "business defamation", "piercing the corporate veil", "director liability",
    "officer liability", "shareholder agreement", "corporate bylaws", "articles of incorporation", "registered agent",
    "annual general meeting", "proxy voting", "minority shareholder right", "corporate transparency", "greenwashing risk",
    "speak-up culture", "ethics hotline", "tone at the top", "due diligence investigation", "regulatory enforcement",
    "compliance training", "internal investigation", "corporate social responsibility", "fair labor standard", "supply chain due diligence",
    "modern slavery act compliance", "data breach notification", "intellectual property audit", "trade secret protection",
    "merger clearance", "competition authority review",
  ],
  analytics: [
    "business intelligence platform", "data warehouse", "data lake", "extract transform load", "data pipeline",
    "data governance framework", "master data management", "metadata catalog", "descriptive analytics", "diagnostic analytics",
    "predictive analytics", "prescriptive analytics", "data visualization", "executive dashboard", "KPI definition",
    "dimensional modeling", "star schema", "online analytical processing", "SQL reporting", "regression model",
    "correlation analysis", "statistical hypothesis test", "cohort analysis", "funnel analytics", "customer segmentation model",
    "RFM analysis", "time series forecast", "moving average", "seasonal adjustment", "anomaly detection",
    "data quality rule", "data cleansing job", "data lineage tracking", "role-based access", "self-service reporting",
    "embedded analytics", "real-time metrics", "big data platform", "cloud data warehouse", "supervised learning model",
    "classification algorithm", "recommendation system", "natural language processing", "sentiment score", "text analytics",
    "web traffic analytics", "event tracking plan", "attribution model", "marketing mix model", "pricing analytics",
    "inventory optimization model", "demand sensing", "scenario analysis", "Monte Carlo simulation", "sensitivity table",
    "break-even sensitivity", "benchmark dashboard", "balanced scorecard", "OKR tracking", "data-driven culture",
    "analytics maturity model", "chief data officer", "data steward role", "analytics engineer", "feature store",
    "model deployment pipeline", "model drift monitoring", "experimentation platform", "statistical significance test",
    "confidence interval", "sample size calculation", "survey analytics", "customer effort score", "operational dashboard",
    "drill-down analysis", "data storytelling", "metric taxonomy", "semantic layer", "data mesh architecture",
    "observability stack", "streaming analytics", "edge analytics", "privacy-preserving analytics", "dashboard governance",
  ],
  international: [
    "economic globalization", "multinational enterprise", "transnational strategy", "multidomestic strategy", "global standardization",
    "international licensing", "master franchise", "foreign direct investment", "export documentation", "import clearance",
    "preferential trade agreement", "World Trade Organization", "regional trade bloc", "foreign exchange market", "currency hedge",
    "translation exposure", "transaction exposure", "economic exposure", "political risk insurance", "country risk rating",
    "emerging market entry", "frontier market", "market entry mode", "greenfield investment", "brownfield acquisition",
    "expatriate assignment", "localization strategy", "glocalization approach", "cultural distance index", "international market adaptation",
    "global sourcing strategy", "offshore outsourcing", "transfer pricing policy", "tax treaty benefit", "double taxation relief",
    "customs duty rate", "free trade zone", "bonded warehouse", "documentary credit", "documentary collection",
    "open account trade", "export credit agency", "FOB shipping term", "CIF shipping term", "cross-border payment",
    "correspondent banking", "SWIFT transfer", "profit repatriation", "joint venture abroad", "sanctions screening",
    "anti-dumping duty", "countervailing duty", "safeguard tariff", "balance of trade", "export processing zone",
    "global mobility program", "work permit process", "business travel visa", "intercultural training", "time zone coordination",
    "global virtual team", "international contract law", "international arbitration", "extraterritorial regulation", "BEPS initiative",
    "OECD guideline", "global supply chain ethics", "fair trade certification", "carbon border adjustment", "geopolitical risk assessment",
    "correspondent bank due diligence", "foreign subsidiary governance", "trade compliance program", "export control screening",
    "foreign exchange forward", "currency swap", "international logistics hub", "global distribution network", "customs brokerage fee",
    "landed cost calculation", "import duty refund", "rules of origin certificate", "international payroll", "global tax compliance",
  ],
};

const alias = new Map();
for (const items of vocabs.batch39 || []) {
  alias.set(items.word.toLowerCase().trim(), items);
}
const inv = JSON.parse(fs.readFileSync(path.join(__dirname, "inventory.json"), "utf8"));
for (const items of inv.items || []) {
  const k = items.word.toLowerCase().trim();
  if (!alias.has(k)) alias.set(k, items);
}

const PHRASE_DEF = {
  bond: "A bond is a debt security in which an investor lends money to an issuer for a set period at a stated return.",
  "stock exchange": "A stock exchange is a regulated marketplace where securities such as shares and bonds are traded.",
  "treasury bill": "A treasury bill is a short-term government debt instrument sold at a discount and redeemed at face value.",
  "mutual fund": "A mutual fund pools money from many investors to buy a diversified portfolio managed by professionals.",
  "exchange-traded fund": "An exchange-traded fund is a fund that trades on an exchange like a stock while tracking an index or basket.",
  microeconomics: "Microeconomics studies how households and firms choose and how prices form in individual markets.",
  macroeconomics: "Macroeconomics studies economy-wide outcomes such as output, employment, prices, and trade.",
  "supply chain design": "Supply chain design decides how sourcing, production, and delivery connect to serve customers at target cost and speed.",
  "business intelligence platform": "A business intelligence platform collects and models data so managers can monitor trends and performance.",
  "contract formation": "Contract formation is the process of creating a binding agreement through offer, acceptance, and consideration.",
  "economic globalization": "Economic globalization is the growing integration of national economies through trade, investment, and capital flows.",
};

const PHRASE_AR = {
  bond: "سند",
  "stock exchange": "بورصة الأوراق المالية",
  "treasury bill": "سند خزانة",
  "mutual fund": "صندوق استثمار مشترك",
  "exchange-traded fund": "صندوق متداول في البورصة",
  "coupon payment": "دفع قسيمة الفائدة",
  "bond maturity": "استحقاق السند",
  "principal amount": "مبلغ أصل الدين",
  "credit rating": "تصنيف ائتماني",
  "sovereign bond": "سند حكومي",
  "corporate bond": "سند شركة",
  "municipal bond": "سند بلدي",
  "yield curve": "منحنى العائد",
  "benchmark rate": "سعر المعيار",
  "base rate": "السعر الأساسي",
  refinancing: "إعادة تمويل",
  "syndicated loan": "قرض مشترك",
  "term loan": "قرض آجل",
  "revolving credit": "تسهيل ائتماني دوار",
  "loan covenant": "عهد قرض",
  "mezzanine debt": "دين ميزانين",
  "convertible bond": "سند قابل للتحويل",
  "preferred shares": "أسهم مفضلة",
  "common shares": "أسهم عادية",
  "initial public offering": "الطرح العام الأولي",
  "secondary offering": "طرح ثانوي",
  "market capitalization": "القيمة السوقية",
  "price-to-earnings ratio": "مكرر الربحية",
  "earnings per share": "ربحية السهم",
  "book-to-market ratio": "نسبة القيمة الدفترية إلى السوقية",
  "dividend yield": "عائد التوزيع",
  "share buyback": "إعادة شراء الأسهم",
  "stock split": "تجزئة السهم",
  "bear market": "سوق هابط",
  "bull market": "سوق صاعد",
  microeconomics: "الاقتصاد الجزئي",
  macroeconomics: "الاقتصاد الكلي",
  "supply chain design": "تصميم سلسلة التوريد",
  "business intelligence platform": "منصة ذكاء الأعمال",
  "contract formation": "انعقاد العقد",
  "economic globalization": "العولمة الاقتصادية",
};

const LEX = {
  bond: "سند", stock: "سهم", exchange: "بورصة", treasury: "خزانة", bill: "كمبيالة", mutual: "مشترك",
  fund: "صندوق", traded: "متداول", etf: "صندوق متداول", coupon: "قسيمة", payment: "دفع", maturity: "استحقاق",
  principal: "أصل", amount: "مبلغ", credit: "ائتمان", rating: "تصنيف", sovereign: "سيادي", corporate: "شركات",
  municipal: "بلدي", yield: "عائد", curve: "منحنى", benchmark: "معيار", base: "أساسي", rate: "معدل",
  refinancing: "إعادة تمويل", syndicated: "مشترك", loan: "قرض", term: "آجل", revolving: "دوار", covenant: "عهد",
  mezzanine: "ميزانين", debt: "دين", convertible: "قابل للتحويل", preferred: "مفضلة", common: "عادية",
  shares: "أسهم", share: "سهم", initial: "أولي", public: "عام", offering: "طرح", secondary: "ثانوي",
  market: "سوق", capitalization: "قيمة سوقية", price: "سعر", earnings: "أرباح", per: "لكل", book: "دفتري",
  dividend: "توزيع", buyback: "إعادة شراء", split: "تجزئة", bear: "هابط", bull: "صاعد", portfolio: "محفظة",
  diversification: "تنويع", asset: "أصل", allocation: "توزيع", hedge: "تحوط", private: "خاص", equity: "ملكية",
  capital: "رأس مال", gains: "مكاسب", cost: "تكلفة", weighted: "مرجح", average: "متوسط", internal: "داخلي",
  return: "عائد", net: "صافي", present: "حالي", value: "قيمة", payback: "استرداد", period: "فترة", budgeting: "ميزانية رأسمالية",
  service: "خدمة", interest: "فائدة", coverage: "تغطية", free: "حر", cash: "نقد", flow: "تدفق", enterprise: "مؤسسة",
  financial: "مالي", leverage: "رافعة", spread: "فارق", duration: "مدة", risk: "مخاطر", floating: "متغير",
  fixed: "ثابت", factoring: "تحصيل ذمم", equipment: "معدات", lease: "إيجار", sale: "بيع", leaseback: "إعادة إيجار",
  green: "أخضر", finance: "تمويل", islamic: "إسلامي", sukuk: "صكوك", venture: "مغامر", bridge: "جسر",
  letter: "خطاب", guarantee: "ضمان", custodian: "أمين حفظ", bank: "بنك", clearing: "مقاصة", house: "بيت",
  custody: "حفظ", fee: "رسوم", management: "إدارة", performance: "أداء", carried: "حمل", partner: "شريك",
  limited: "محدود", general: "عام", prospectus: "نشرة", default: "تعثر", swap: "مبادلة", analysis: "تحليل",
  strategy: "استراتيجية", plan: "خطة", policy: "سياسة", model: "نموذج", process: "عملية", system: "نظام",
  customer: "عميل", brand: "علامة", campaign: "حملة", segment: "شريحة", targeting: "استهداف", channel: "قناة",
  supply: "توريد", chain: "سلسلة", logistics: "لوجستيات", warehouse: "مستودع", inventory: "مخزون", quality: "جودة",
  production: "إنتاج", delivery: "تسليم", contract: "عقد", agreement: "اتفاق", clause: "بند", law: "قانون",
  compliance: "امتثال", ethics: "أخلاقيات", data: "بيانات", analytics: "تحليلات", dashboard: "لوحة", forecast: "توقع",
  global: "عالمي", international: "دولي", export: "تصدير", import: "استيراد", foreign: "أجنبي", currency: "عملة",
  customs: "جمارك", trade: "تجارة", cross: "عبر", border: "حدود", tax: "ضريبة", regulatory: "تنظيمي",
};

function titleCase(s) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

function toArabicPhrase(word) {
  const key = word.toLowerCase().trim();
  if (PHRASE_AR[key]) return PHRASE_AR[key];
  const tokens = key.split(/[\s-/]+/);
  const mapped = tokens.map((t) => LEX[t] || null);
  if (mapped.every(Boolean)) return mapped.join(" ");
  if (mapped.some(Boolean)) {
    return mapped.map((m, i) => m || tokens[i]).join(" ");
  }
  return titleCase(word);
}

function articleFor(word) {
  return /^[aeiou]/i.test(word) ? "An" : "A";
}

function looksLikeDefinition(text) {
  const t = String(text || "").trim();
  if (!t) return false;
  return /\b(is|are|means|refers|stands for|describes)\b/i.test(t) && t.length > 35;
}

function mkDef(word, cat) {
  const w = word.toLowerCase();
  if (/\bratio\b/.test(w)) return `The ${word} is a ratio used to compare two related figures in ${cat} decisions.`;
  if (/\brate\b|\bindex\b|\bscore\b|\bmetric\b/.test(w))
    return `The ${word} is an indicator used to track performance or risk in ${cat}.`;
  if (/\bmodel\b|\bframework\b|\bmethod\b|\bsystem\b/.test(w))
    return `${articleFor(word)} ${word} is a structured method that organizes how teams work in ${cat}.`;
  if (/\bpolicy\b|\bcompliance\b|\bregulation\b|\blaw\b|\bagreement\b|\bclause\b/.test(w))
    return `The ${word} sets rules or duties that guide lawful and ethical business conduct.`;
  if (/\bstrategy\b|\bplan\b/.test(w)) return `${articleFor(word)} ${word} outlines choices and priorities for achieving business goals.`;
  if (/\bmarket\b|\bcustomer\b|\bbrand\b|\bcampaign\b|\bpricing\b/.test(w))
    return `${articleFor(word)} ${word} helps a firm reach buyers, present value, and win profitable demand.`;
  if (w === "bond") return PHRASE_DEF.bond;
  if (/\bloan\b|\bfund\b|\bstock\b|\bdividend\b|\bcapital\b|\bcash\b/.test(w))
    return `${articleFor(word)} ${word} concerns funding, returns, or liquidity in corporate finance.`;
  if (/\bsupply\b|\blogistics\b|\bwarehouse\b|\bproduction\b|\bquality\b|\bdelivery\b/.test(w))
    return `The ${word} shapes how inputs are transformed and delivered to customers on time and at target cost.`;
  if (/\bdata\b|\banalytics\b|\bdashboard\b|\bforecast\b|\bexperiment\b/.test(w))
    return `${articleFor(word)} ${word} uses data to measure performance, test ideas, or support forecasts.`;
  if (/\bglobal\b|\binternational\b|\bexport\b|\bimport\b|\bforeign\b|\bcurrency\b|\bcustoms\b/.test(w))
    return `The ${word} applies when firms operate, trade, or invest across national borders.`;
  if (/\bmemo\b|\bemail\b|\bmeeting\b|\bnegotiation\b|\bpresentation\b/.test(w))
    return `The ${word} supports clear professional communication inside and outside the organization.`;
  return `${articleFor(word)} ${word} is a standard ${cat.replace("-", " ")} term used in study and workplace practice.`;
}

const DEFINITIONS = {};
for (const [cat, words] of Object.entries(CATEGORY_SEEDS)) {
  for (const word of words) {
    const key = word.toLowerCase().trim();
    const hit = alias.get(key);
    DEFINITIONS[key] = {
      ar: hit?.arabic?.trim() || toArabicPhrase(word),
      en:
        PHRASE_DEF[key] ||
        (looksLikeDefinition(hit?.english) ? hit.english.trim().replace(/\.$/, "") + "." : mkDef(word, cat)),
      level: hit?.level || "B2",
    };
  }
}

const out = `/** Auto-generated category seeds and definitions for REST banks. */\nexport const CATEGORY_SEEDS = ${JSON.stringify(CATEGORY_SEEDS, null, 2)};\n\nexport const DEFINITIONS = ${JSON.stringify(DEFINITIONS, null, 2)};\n`;
fs.writeFileSync(path.join(__dirname, "rest-seeds.mjs"), out, "utf8");
console.log("seeds written", Object.values(CATEGORY_SEEDS).reduce((a, w) => a + w.length, 0));