import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  BookOpen,
  Clock,
  Headphones,
  MessageCircle,
  Mic,
  PenLine,
  Target,
} from "lucide-react";

const styles = `
  .legacy-tool-root, .legacy-tool-root * { box-sizing: border-box; }
  .legacy-tool-root { font-family: inherit; background: #fafafa; color: #111; }

  .tg-hero { background: #fff; border-bottom: 1px solid #e4e4e7; padding: 36px 28px 28px; text-align: center; }
  .tg-hero-badge { display: inline-flex; align-items: center; gap: 6px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 20px; padding: 5px 16px; color: #2563eb; font-size: 12px; font-weight: 600; letter-spacing: .5px; text-transform: uppercase; margin-bottom: 18px; }
  .tg-hero h1 { color: #111; font-size: 1.75rem; font-weight: 700; letter-spacing: -.03em; margin-bottom: 10px; }
  .tg-hero h1 span { color: #2563eb; }
  .tg-hero p { color: #71717a; font-size: 15px; margin-bottom: 28px; max-width: 600px; margin-left: auto; margin-right: auto; }
  .tg-search-wrap { max-width: 480px; margin: 0 auto; }
  .tg-search { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid #e4e4e7; font-size: 14px; background: #fff; color: #111; outline: none; }
  .tg-search:focus { border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37,99,235,.2); }

  .tg-main { max-width: 1200px; margin: 0 auto; padding: 32px 24px; }
  .tg-heading { font-size: 1.15rem; font-weight: 700; color: #111; margin-bottom: 6px; letter-spacing: -.02em; }
  .tg-subheading { font-size: 14px; color: #71717a; margin-bottom: 24px; }

  .tg-estimator { background: #fff; border-radius: 14px; border: 1px solid #e4e4e7; padding: 24px; margin-bottom: 40px; box-shadow: 0 4px 10px rgba(0,0,0,.04); }
  .tg-estim-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 20px; margin-top: 20px; }
  .tg-estim-item label { font-size: 12px; font-weight: 700; color: #2563eb; display: block; margin-bottom: 6px; }
  .tg-estim-item input[type=range] { width: 100%; accent-color: #2563eb; }
  .tg-estim-val { font-size: 20px; font-weight: 700; color: #111; margin-top: 4px; }
  .tg-estim-total { background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 14px; padding: 20px 24px; color: #111; display: flex; align-items: center; justify-content: space-between; margin-top: 20px; flex-wrap: wrap; gap: 12px; }
  .tg-total-label { font-size: 14px; color: #71717a; }
  .tg-total-score { font-size: 32px; font-weight: 800; color: #2563eb; }
  .tg-band { font-size: 13px; background: #fff; border: 1px solid #e4e4e7; border-radius: 8px; padding: 4px 12px; font-weight: 600; color: #2563eb; }

  .tg-sections-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 18px; margin-bottom: 40px; }
  .tg-section-card { background: #fff; border-radius: 14px; border: 1px solid #e4e4e7; box-shadow: 0 4px 10px rgba(0,0,0,.04); transition: border-color .15s, box-shadow .15s, background .15s; overflow: hidden; }
  .tg-section-card:hover { box-shadow: 0 6px 16px rgba(37,99,235,.08); border-color: #bfdbfe; background: #fafafa; }
  .tg-color-bar { height: 3px; width: 100%; background: #2563eb; }
  .tg-card-inner { padding: 20px 18px 16px; }
  .tg-card-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; margin-bottom: 14px; background: #eff6ff; color: #2563eb; }
  .tg-meta { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 14px; }
  .tg-meta-pill { background: #eff6ff; color: #2563eb; border-radius: 8px; padding: 3px 10px; font-size: 11px; font-weight: 700; }
  .tg-card-title { font-size: 16px; font-weight: 700; color: #111; margin-bottom: 8px; }
  .tg-card-desc { font-size: 13px; color: #52525b; line-height: 1.6; margin-bottom: 16px; }

  .tg-bars { margin-bottom: 16px; }
  .tg-bar-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .tg-bar-label { font-size: 11px; font-weight: 600; color: #52525b; width: 80px; flex-shrink: 0; }
  .tg-bar-track { flex: 1; background: #f4f4f5; border-radius: 6px; height: 8px; overflow: hidden; }
  .tg-bar-fill { height: 100%; border-radius: 6px; background: #2563eb; transition: width .4s ease; }
  .tg-bar-num { font-size: 11px; font-weight: 700; color: #2563eb; width: 28px; text-align: right; flex-shrink: 0; }

  .tg-toggle-btn { width: 100%; padding: 9px; border-radius: 10px; border: 1px solid #e4e4e7; background: #fff; color: #2563eb; font-size: 13px; font-weight: 600; cursor: pointer; transition: background .15s, border-color .15s; text-align: center; }
  .tg-toggle-btn:hover, .tg-toggle-btn.open { background: #eff6ff; border-color: #bfdbfe; }

  .tg-q-list { margin-top: 12px; }
  .tg-q-item { border-radius: 10px; border: 1px solid #e4e4e7; margin-bottom: 8px; overflow: hidden; background: #fafafa; }
  .tg-q-header { padding: 10px 14px; cursor: pointer; display: flex; justify-content: space-between; align-items: center; font-size: 13px; font-weight: 600; color: #3f3f46; transition: background .15s; }
  .tg-q-header:hover { background: #eff6ff; }
  .tg-q-explain { padding: 0 14px; overflow: hidden; max-height: 0; transition: max-height .2s ease, padding .2s; }
  .tg-q-explain.open { max-height: 120px; padding: 0 14px 10px; }
  .tg-q-explain p { font-size: 12px; color: #52525b; line-height: 1.6; background: #eff6ff; border-radius: 8px; padding: 8px 10px; margin-top: 4px; }
  .tg-tips { margin-top: 14px; background: #eff6ff; border-left: 3px solid #2563eb; border-radius: 0 10px 10px 0; padding: 10px 13px; font-size: 12px; color: #2563eb; font-weight: 500; }
  .tg-tips-label { font-weight: 700; color: #1d4ed8; margin-right: 5px; }

  .tg-motiv-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; margin-bottom: 40px; }
  .tg-motiv-card { background: #fff; border-radius: 14px; border: 1px solid #e4e4e7; padding: 22px 20px; transition: border-color .15s, box-shadow .15s; position: relative; overflow: hidden; }
  .tg-motiv-card:hover { box-shadow: 0 6px 16px rgba(37,99,235,.08); border-color: #bfdbfe; }
  .tg-motiv-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 3px; background: #2563eb; }
  .tg-motiv-quote { font-size: 14px; color: #3f3f46; line-height: 1.65; margin-bottom: 12px; font-style: italic; }
  .tg-motiv-author { font-size: 11px; color: #2563eb; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; }

  .tg-advice-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; margin-bottom: 40px; }
  .tg-advice-card { background: #fff; border: 1px solid #e4e4e7; border-radius: 14px; padding: 22px 20px; color: #111; transition: border-color .15s, box-shadow .15s; cursor: default; }
  .tg-advice-card:hover { box-shadow: 0 6px 16px rgba(37,99,235,.08); border-color: #bfdbfe; }
  .tg-advice-icon { margin-bottom: 10px; color: #2563eb; width: 40px; height: 40px; border-radius: 10px; background: #eff6ff; display: grid; place-items: center; }
  .tg-advice-title { font-size: 14px; font-weight: 700; margin-bottom: 8px; color: #111; }
  .tg-advice-msg { font-size: 12px; color: #71717a; line-height: 1.6; }

  .tg-no-results { text-align: center; padding: 60px 20px; color: #a1a1aa; }

  .tg-footer { background: #fff; border-top: 1px solid #e4e4e7; text-align: center; padding: 20px; color: #71717a; font-size: 13px; }
  .tg-footer .brand { color: #2563eb; font-weight: 700; }
`;

const SECTIONS = [
  {
    id: "reading", icon: BookOpen, color: "#2563eb", bg: "#eff6ff",
    time: "35 min", questions: "20 questions", title: "Reading Section",
    desc: "2 academic passages (~700 words each). Tests comprehension, inference, vocabulary, and detail understanding.",
    types: [
      { name: "Vocabulary questions", exp: "Identify meanings of words or phrases in context." },
      { name: "Inference questions", exp: "Deduce information not directly stated but implied." },
      { name: "Main idea questions", exp: "Determine the central concept or purpose of the passage." },
      { name: "Reference & detail questions", exp: "Locate specific information and connect it to meaning." },
    ],
    tips: "Read for main ideas first, then scan for details. Skim the first paragraph quickly.",
    bars: [{ label: "Vocab", v: 25 }, { label: "Inference", v: 20 }, { label: "Main idea", v: 30 }, { label: "Detail", v: 25 }],
  },
  {
    id: "listening", icon: Headphones, color: "#2563eb", bg: "#eff6ff",
    time: "36 min", questions: "28–39 questions", title: "Listening Section",
    desc: "Lectures and conversations about academic topics. Tests main ideas, details, and implied meanings.",
    types: [
      { name: "Main idea & detail", exp: "Identify the central theme and supporting information in audio." },
      { name: "Function & attitude", exp: "Recognize tone, intent, and the speaker's attitude or purpose." },
      { name: "Inference questions", exp: "Understand implied meanings and logical conclusions." },
      { name: "Organization questions", exp: "Identify how the lecture or conversation is structured logically." },
    ],
    tips: "Take short notes and focus on transitions. Recognize tone and speaker attitude.",
    bars: [{ label: "Main idea", v: 28 }, { label: "Function", v: 22 }, { label: "Inference", v: 30 }, { label: "Org.", v: 20 }],
  },
  {
    id: "speaking", icon: Mic, color: "#2563eb", bg: "#eff6ff",
    time: "16 min", questions: "4 tasks", title: "Speaking Section",
    desc: "Express opinions and summarize reading/listening materials. Record answers in 45–60 seconds.",
    types: [
      { name: "Independent speaking task", exp: "Express personal opinions on a familiar topic within 45 seconds." },
      { name: "Integrated R+L task", exp: "Read a short passage, listen to a talk, and summarize both." },
      { name: "Integrated L+S task", exp: "Listen to a conversation or lecture and respond orally." },
      { name: "Campus situation task", exp: "Comment on student life or university situations in short dialogues." },
    ],
    tips: "Use template: intro → 2 supports → example → conclusion. Practice every day!",
    bars: [{ label: "Independent", v: 25 }, { label: "R+L integ.", v: 28 }, { label: "L+S integ.", v: 28 }, { label: "Campus", v: 19 }],
  },
  {
    id: "writing", icon: PenLine, color: "#2563eb", bg: "#eff6ff",
    time: "29 min", questions: "2 tasks", title: "Writing Section",
    desc: "Two essays: one summarizing reading/listening content, and one giving your personal opinion on a topic.",
    types: [
      { name: "Integrated writing (R+L+W)", exp: "Read and listen to materials, then summarize the relationship between them." },
      { name: "Independent essay task", exp: "Write an essay expressing your viewpoint on a familiar issue." },
    ],
    tips: "Plan before writing. Aim for clear structure, coherent paragraphs, and strong examples.",
    bars: [{ label: "Integrated", v: 50 }, { label: "Independent", v: 50 }],
  },
];

const MOTIVATIONS = [
  { quote: "Every section mastered brings you one step closer to your dream university.", author: "ETS Mentor" },
  { quote: "Your TOEFL score opens doors to over 11,000 universities worldwide!", author: "Global Education Board" },
  { quote: "Study with persistence. Real success comes from consistency, not intensity.", author: "Language Expert" },
  { quote: "The TOEFL is not just a test — it is a passport to global opportunity.", author: "Scholar Abroad" },
];

const ADVICES = [
  { icon: Target, title: "Focus on Skills, Not Tricks", msg: "Develop real academic English — reading, listening, writing. Skills outlast shortcuts every time." },
  { icon: Clock, title: "Time Management is Key", msg: "Practice with timers. Learn to read quickly, think clearly, and speak within the limit." },
  { icon: BookOpen, title: "Integrate Your Practice", msg: "Combine all four skills daily. TOEFL rewards the ability to connect reading, listening, and writing." },
  { icon: MessageCircle, title: "Speak Every Day", msg: "Don't memorize — communicate naturally. Record yourself, listen back, and refine." },
];

export default function TOEFLGuide() {
  const [query, setQuery] = useState("");
  const [openSection, setOpenSection] = useState(null);
  const [openQuestion, setOpenQuestion] = useState({});
  const [scores, setScores] = useState({ r: 22, l: 20, s: 18, w: 19 });

  useEffect(() => {
    const existing = document.getElementById("tg-styles");
    if (!existing) {
      const style = document.createElement("style");
      style.id = "tg-styles";
      style.innerHTML = styles;
      document.head.appendChild(style);
    } else {
      existing.innerHTML = styles;
    }
  }, []);

  const total = scores.r + scores.l + scores.s + scores.w;
  const band = total >= 100 ? "Advanced" : total >= 80 ? "Upper-Intermediate" : total >= 60 ? "Intermediate" : "Foundation";

  const toggleSection = (id) => {
    setOpenSection(openSection === id ? null : id);
    setOpenQuestion({});
  };

  const toggleQuestion = (sectionId, index) => {
    setOpenQuestion((prev) => ({
      ...prev,
      [sectionId]: prev[sectionId] === index ? null : index,
    }));
  };

  const filteredSections = SECTIONS.filter((s) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return s.title.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q);
  });

  return (
    <>
      <Helmet>
        <title>ABOOD | TOEFL Guide</title>
        <meta name="description" content="TOEFL Mastery Guide" />
      </Helmet>

      <div className="tg-hero">
        <div className="tg-hero-badge">Official TOEFL Overview</div>
        <h1>TOEFL <span>Mastery Hub</span></h1>
        <p>Get acquainted with every section in minutes — strategies, question types, and expert advice.</p>
        <div className="tg-search-wrap">
          <input
            className="tg-search"
            type="text"
            placeholder="Search sections, question types…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="tg-main">

        {/* Score Estimator */}
        <div className="tg-estimator">
          <div className="tg-heading" style={{ fontSize: 17 }}>Score Estimator</div>
          <div className="tg-subheading" style={{ marginBottom: 0 }}>Drag sliders to estimate your current TOEFL total score</div>
          <div className="tg-estim-grid">
            {[
              { key: "r", label: "Reading (0–30)" },
              { key: "l", label: "Listening (0–30)" },
              { key: "s", label: "Speaking (0–30)" },
              { key: "w", label: "Writing (0–30)" },
            ].map(({ key, label }) => (
              <div key={key} className="tg-estim-item">
                <label>{label}</label>
                <input
                  type="range" min="0" max="30"
                  value={scores[key]}
                  onChange={(e) => setScores((prev) => ({ ...prev, [key]: +e.target.value }))}
                />
                <div className="tg-estim-val">{scores[key]}</div>
              </div>
            ))}
          </div>
          <div className="tg-estim-total">
            <div>
              <div className="tg-total-label">Estimated Total Score</div>
              <div style={{ fontSize: 12, opacity: 0.7, marginTop: 2 }}>TOEFL iBT (0–120)</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div className="tg-total-score">{total}</div>
              <div className="tg-band">{band}</div>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="tg-heading">Section Breakdown</div>
        <div className="tg-subheading">Click any section to explore question types and expert tips</div>

        {filteredSections.length === 0 ? (
          <div className="tg-no-results">No sections found. Try a different search.</div>
        ) : (
          <div className="tg-sections-grid">
            {filteredSections.map((s) => {
              const SectionIcon = s.icon;
              return (
              <div key={s.id} className="tg-section-card">
                <div className="tg-color-bar" style={{ background: s.color }} />
                <div className="tg-card-inner">
                  <div className="tg-card-icon" style={{ background: s.bg }}>
                    <SectionIcon size={20} strokeWidth={1.75} aria-hidden />
                  </div>
                  <div className="tg-meta">
                    <span className="tg-meta-pill">{s.time}</span>
                    <span className="tg-meta-pill">{s.questions}</span>
                  </div>
                  <div className="tg-card-title">{s.title}</div>
                  <div className="tg-card-desc">{s.desc}</div>
                  <div className="tg-bars">
                    {s.bars.map((b) => (
                      <div key={b.label} className="tg-bar-row">
                        <span className="tg-bar-label">{b.label}</span>
                        <div className="tg-bar-track">
                          <div className="tg-bar-fill" style={{ width: `${b.v}%` }} />
                        </div>
                        <span className="tg-bar-num">{b.v}%</span>
                      </div>
                    ))}
                  </div>

                  <button
                    className={`tg-toggle-btn${openSection === s.id ? " open" : ""}`}
                    onClick={() => toggleSection(s.id)}
                  >
                    {openSection === s.id ? "Hide Question Types" : "Show Question Types"}
                  </button>

                  {openSection === s.id && (
                    <div className="tg-q-list">
                      {s.types.map((qt, i) => (
                        <div key={i} className="tg-q-item">
                          <div className="tg-q-header" onClick={() => toggleQuestion(s.id, i)}>
                            <span>{qt.name}</span>
                            <span>{openQuestion[s.id] === i ? "▲" : "▶"}</span>
                          </div>
                          <div className={`tg-q-explain${openQuestion[s.id] === i ? " open" : ""}`}>
                            <p>{qt.exp}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="tg-tips">
                    <span className="tg-tips-label">Tip:</span> {s.tips}
                  </div>
                </div>
              </div>
              );
            })}
          </div>
        )}

        {/* Motivation */}
        <div className="tg-heading">Motivation Corner</div>
        <div className="tg-subheading">Stay inspired throughout your TOEFL journey</div>
        <div className="tg-motiv-grid">
          {MOTIVATIONS.map((m, i) => (
            <div key={i} className="tg-motiv-card">
              <div className="tg-motiv-quote">"{m.quote}"</div>
              <div className="tg-motiv-author">— {m.author}</div>
            </div>
          ))}
        </div>

        {/* Advice */}
        <div className="tg-heading">Expert Advice</div>
        <div className="tg-subheading">Strategies from top TOEFL mentors</div>
        <div className="tg-advice-grid">
          {ADVICES.map((a, i) => {
            const AdviceIcon = a.icon;
            return (
              <div key={i} className="tg-advice-card">
                <div className="tg-advice-icon">
                  <AdviceIcon size={20} strokeWidth={1.75} aria-hidden />
                </div>
                <div className="tg-advice-title">{a.title}</div>
                <div className="tg-advice-msg">{a.msg}</div>
              </div>
            );
          })}
        </div>

      </div>

      <footer className="tg-footer">
        <p>© 2025 <span className="brand">ABOOD | JAMAL</span> — Consistency beats intensity. Study smart!</p>
      </footer>
    </>
  );
}