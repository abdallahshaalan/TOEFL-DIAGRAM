import React, { useState, useEffect } from "react";
import vocab from "../data/studyVocabularies";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Building2,
  Cpu,
  FlaskConical,
  GraduationCap,
  Heart,
  HeartPulse,
  Landmark,
  Layers,
  Leaf,
  Palette,
  ScrollText,
  Volume2,
} from "lucide-react";

// ── Design tokens ─────────────────────────────────────────────────────────────
const t = {
  blue50:   "#EFF6FF",
  blue100:  "#DBEAFE",
  blue200:  "#BFDBFE",
  blue400:  "#60A5FA",
  blue600:  "#2563EB",
  blue800:  "#1D4ED8",
  blue900:  "#111111",
  gray50:   "#FAFAFA",
  gray100:  "#F4F4F5",
  gray200:  "#E4E4E7",
  gray400:  "#A1A1AA",
  gray600:  "#52525B",
  gray900:  "#111111",
  white:    "#ffffff",
  red50:    "#FEE2E2",
  red400:   "#EF4444",
  red800:   "#991B1B",
  teal50:   "#EFF6FF",
  teal400:  "#2563EB",
  teal800:  "#1D4ED8",
  fontDisplay: "Georgia, Cambria, serif",
  fontBody:    "inherit",
};

// ── Topic icon map (Lucide) ───────────────────────────────────────────────────
const TOPIC_ICONS = {
  Environment: Leaf,
  Technology:  Cpu,
  Education:   GraduationCap,
  Health:      HeartPulse,
  Science:     FlaskConical,
  History:     ScrollText,
  Society:     Building2,
  Economy:     Landmark,
  Art:         Palette,
  Default:     BookOpen,
};
const topicIcon = (name) => TOPIC_ICONS[name] || TOPIC_ICONS.Default;

// ── VocabCard ─────────────────────────────────────────────────────────────────
function TopicVocabCard({ item, isLoved, onToggleLove, onSpeak }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#F8FAFC" : "#fff",
        border: `1px solid ${hovered ? t.blue200 : t.gray200}`,
        borderRadius: 16,
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s",
        boxShadow: hovered ? "0 4px 20px rgba(37,99,235,0.08)" : "none",
      }}
    >
      {/* Top row */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{
          fontFamily: t.fontDisplay,
          fontSize: 18,
          color: t.blue900,
          letterSpacing: "-0.3px",
          fontWeight: 400,
        }}>
          {item.word}
        </span>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => onToggleLove(item)}
            style={{
              background: isLoved ? t.red50 : t.gray100,
              border: "none",
              borderRadius: 8,
              width: 30, height: 30,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              color: isLoved ? t.red400 : t.gray400,
              fontSize: 14,
              transition: "all 0.2s",
            }}
            title={isLoved ? "Remove" : "Save"}
            aria-label={isLoved ? "Remove" : "Save"}
          >
            <Heart
              size={14}
              strokeWidth={1.75}
              fill={isLoved ? "currentColor" : "none"}
              aria-hidden
            />
          </button>
          <button
            onClick={() => onSpeak(item.word)}
            style={{
              background: t.blue50,
              border: "none",
              borderRadius: 8,
              width: 30, height: 30,
              display: "flex", alignItems: "center", justifyContent: "center",
              cursor: "pointer",
              color: t.blue800,
              fontSize: 13,
            }}
            title="Pronounce"
            aria-label="Pronounce"
          >
            <Volume2 size={14} strokeWidth={1.75} aria-hidden />
          </button>
        </div>
      </div>

      {/* Arabic */}
      <p style={{
        fontFamily: t.fontBody,
        fontSize: 15,
        color: t.gray900,
        direction: "rtl",
        textAlign: "right",
        margin: 0,
        lineHeight: 1.5,
        fontWeight: 500,
      }}>{item.arabic}</p>

      {/* English */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderTop: `1px solid ${t.gray100}`,
        paddingTop: 8,
      }}>
        <p style={{ fontFamily: t.fontBody, fontSize: 13, color: t.gray600, margin: 0, flex: 1, lineHeight: 1.5 }}>
          {item.english}
        </p>
        <button
          onClick={() => onSpeak(item.english)}
          style={{ background: "transparent", border: "none", cursor: "pointer", color: t.gray400, fontSize: 13, padding: "4px", marginLeft: 6 }}
          title="Pronounce definition"
        >▶</button>
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function VocabTopics() {
  const [activeTopic, setActiveTopic] = useState("All");
  const [lovedVocabs, setLovedVocabs] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const topics = Object.keys(vocab);

  const allDisplayed =
    activeTopic === "All"
      ? Object.values(vocab).flat()
      : vocab[activeTopic] || [];

  const displayedWords = searchQuery
    ? allDisplayed.filter(
        (w) =>
          w.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (w.english && w.english.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (w.arabic && w.arabic.includes(searchQuery))
      )
    : allDisplayed;

  useEffect(() => {
    let cancelled = false;
    import("@/lib/toolStorage").then(({ loadToolState }) => {
      loadToolState("lovedVocabs2", []).then((saved) => {
        if (!cancelled && Array.isArray(saved)) setLovedVocabs(saved);
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    import("@/lib/toolStorage").then(({ saveToolState }) => {
      saveToolState("lovedVocabs2", lovedVocabs);
    });
  }, [lovedVocabs]);

  const toggleLove = (wordObj) => {
    const alreadyLoved = lovedVocabs.find((w) => w.word === wordObj.word);
    setLovedVocabs(
      alreadyLoved
        ? lovedVocabs.filter((w) => w.word !== wordObj.word)
        : [...lovedVocabs, wordObj]
    );
  };

  const speakWord = (word) => {
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    speechSynthesis.speak(utterance);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: t.fontBody, background: t.gray50, minHeight: "100vh" }}>
      <Helmet>
        <title>TOEFL Vocabulary — Topics</title>
        <meta name="description" content="TOEFL vocabulary organized by academic topics" />
        <link href="https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600&family=DM+Serif+Display:ital@0;1&display=swap" rel="stylesheet" />
      </Helmet>

      {/* ── NAV ── */}
      <nav style={{
        background: t.white,
        borderBottom: `1px solid ${t.gray200}`,
        padding: "0 2rem",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36,
            background: t.blue600,
            borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: t.white,
            fontFamily: t.fontDisplay,
            fontSize: 16, fontWeight: 700,
          }}>T</div>
          <span style={{ fontFamily: t.fontDisplay, fontSize: 20, color: t.blue900, letterSpacing: "-0.3px" }}>
            Topic Vocabulary
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link to="/" style={{
            padding: "7px 16px",
            background: t.blue50,
            color: t.blue800,
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 500,
            textDecoration: "none",
            fontFamily: t.fontBody,
          }}>← Home</Link>
          <button
            onClick={() => setShowCart(!showCart)}
            style={{
              padding: "7px 16px",
              background: lovedVocabs.length > 0 ? t.red50 : t.gray100,
              color: lovedVocabs.length > 0 ? t.red400 : t.gray600,
              border: "none",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: t.fontBody,
              display: "flex", alignItems: "center", gap: 6,
            }}
          >♥ Saved ({lovedVocabs.length})</button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <header style={{
        background: t.white,
        borderBottom: `1px solid ${t.gray200}`,
        padding: "48px 2rem 40px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: `radial-gradient(ellipse 80% 50% at 50% 0%, ${t.teal50} 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          background: t.teal50, color: t.teal800,
          border: `1px solid #9FE1CB`,
          borderRadius: 100, padding: "5px 14px",
          fontSize: 12, fontWeight: 500,
          marginBottom: 16, position: "relative",
        }}>
          <span style={{ width: 6, height: 6, background: t.teal400, borderRadius: "50%", display: "inline-block" }} />
          Academic Topics
        </div>
        <h1 style={{
          fontFamily: t.fontDisplay,
          fontSize: "clamp(30px, 5vw, 50px)",
          color: t.blue900,
          letterSpacing: "-1.2px",
          lineHeight: 1.1,
          margin: "0 0 12px",
          position: "relative",
        }}>
          Words by <em style={{ fontStyle: "italic", color: t.teal400 }}>Topic</em>
        </h1>
        <p style={{
          fontSize: 15,
          color: t.gray400,
          maxWidth: 440,
          margin: "0 auto 32px",
          lineHeight: 1.6,
          fontWeight: 300,
          position: "relative",
        }}>
          Browse vocabulary organized by academic topic — perfect for targeted TOEFL preparation.
        </p>

        {/* Stats */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 32, position: "relative" }}>
          {[
            { num: Object.values(vocab).flat().length + "+", label: "Total words" },
            { num: topics.length, label: "Topics" },
            { num: lovedVocabs.length, label: "Saved" },
          ].map((s, i) => (
            <React.Fragment key={i}>
              {i > 0 && <div style={{ width: 1, height: 36, background: t.gray200 }} />}
              <div style={{ textAlign: "center" }}>
                <span style={{ fontFamily: t.fontDisplay, fontSize: 26, color: t.blue900, display: "block", letterSpacing: "-0.5px" }}>{s.num}</span>
                <span style={{ fontSize: 12, color: t.gray400 }}>{s.label}</span>
              </div>
            </React.Fragment>
          ))}
        </div>
      </header>

      {/* ── CONTROLS ── */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 2rem 0" }}>
        {/* Search */}
        <div style={{ position: "relative", marginBottom: 20 }}>
          <span style={{
            position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)",
            color: t.gray400, pointerEvents: "none", display: "flex",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search words or meanings…"
            value={searchQuery || ""}
            onChange={(e) => setSearchQuery(e.target.value || false)}
            style={{
              width: "100%",
              padding: "11px 16px 11px 42px",
              border: `1px solid ${t.gray200}`,
              borderRadius: 12,
              fontSize: 14,
              background: t.white,
              color: t.gray900,
              fontFamily: t.fontBody,
              outline: "none",
              boxSizing: "border-box",
            }}
            onFocus={(e) => { e.target.style.borderColor = t.blue400; e.target.style.boxShadow = "0 0 0 3px rgba(55,138,221,0.1)"; }}
            onBlur={(e)  => { e.target.style.borderColor = t.gray200;  e.target.style.boxShadow = "none"; }}
          />
        </div>

        {/* Topic cards grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
          gap: 8,
          marginBottom: 28,
        }}>
          {/* All button */}
          <button
            onClick={() => setActiveTopic("All")}
            style={{
              background: activeTopic === "All" ? t.blue600 : t.white,
              color: activeTopic === "All" ? t.white : t.gray600,
              border: `1px solid ${activeTopic === "All" ? t.blue600 : t.gray200}`,
              borderRadius: 12,
              padding: "10px 12px",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: t.fontBody,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              transition: "all 0.2s",
            }}
          >
            <Layers size={18} strokeWidth={1.75} aria-hidden />
            All Topics
          </button>

          {topics.map((topic) => {
            const TopicIcon = topicIcon(topic);
            return (
              <button
                key={topic}
                onClick={() => setActiveTopic(topic)}
                style={{
                  background: activeTopic === topic ? t.blue600 : t.white,
                  color: activeTopic === topic ? t.white : t.gray600,
                  border: `1px solid ${activeTopic === topic ? t.blue600 : t.gray200}`,
                  borderRadius: 12,
                  padding: "10px 12px",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: t.fontBody,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  transition: "background 0.2s, border-color 0.2s, color 0.2s",
                }}
              >
                <TopicIcon size={18} strokeWidth={1.75} aria-hidden />
                {topic}
              </button>
            );
          })}
        </div>

        {/* Result count */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "1.2px", color: t.teal400, margin: 0 }}>
            {activeTopic === "All" ? "All topics" : activeTopic}
          </p>
          <span style={{ fontSize: 12, color: t.gray400 }}>{displayedWords.length} words</span>
        </div>
      </div>

      {/* ── VOCAB GRID ── */}
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "0 2rem 60px" }}>
        {displayedWords.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: t.gray400, fontSize: 15 }}>
            No words found
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 12,
          }}>
            {displayedWords.map((item, index) => (
              <TopicVocabCard
                key={index}
                item={item}
                isLoved={lovedVocabs.some((w) => w.word === item.word)}
                onToggleLove={toggleLove}
                onSpeak={speakWord}
              />
            ))}
          </div>
        )}
      </main>

      {/* ── SAVED PANEL ── */}
      {showCart && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 200,
          display: "flex",
          pointerEvents: "none",
        }}>
          <div
            onClick={() => setShowCart(false)}
            style={{
              position: "absolute", inset: 0,
              background: "rgba(4,44,83,0.2)",
              pointerEvents: "auto",
            }}
          />
          <div style={{
            position: "absolute", right: 0, top: 0, bottom: 0,
            width: 340,
            background: t.white,
            borderLeft: `1px solid ${t.gray200}`,
            display: "flex",
            flexDirection: "column",
            pointerEvents: "auto",
            overflow: "hidden",
          }}>
            <div style={{
              padding: "20px 20px 16px",
              borderBottom: `1px solid ${t.gray100}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}>
              <div>
                <p style={{ fontFamily: t.fontDisplay, fontSize: 18, color: t.blue900, margin: 0 }}>Saved words</p>
                <p style={{ fontSize: 12, color: t.gray400, margin: "2px 0 0" }}>{lovedVocabs.length} saved</p>
              </div>
              <button
                onClick={() => setShowCart(false)}
                style={{ background: t.gray100, border: "none", borderRadius: 8, width: 32, height: 32, cursor: "pointer", fontSize: 14, color: t.gray600 }}
              >✕</button>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
              {lovedVocabs.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px 0", color: t.gray400, fontSize: 14 }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>♡</div>
                  No saved words yet
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {lovedVocabs.map((word, i) => (
                    <div key={i} style={{
                      background: t.gray50,
                      border: `1px solid ${t.gray200}`,
                      borderRadius: 10,
                      padding: "10px 12px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 8,
                    }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontWeight: 600, fontSize: 14, color: t.blue900, margin: 0 }}>{word.word}</p>
                        <p style={{ fontSize: 12, color: t.gray400, margin: "2px 0 0", direction: "rtl", textAlign: "right" }}>{word.arabic}</p>
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button
                          onClick={() => speakWord(word.word)}
                          style={{ background: t.blue50, border: "none", borderRadius: 6, width: 26, height: 26, cursor: "pointer", color: t.blue800, fontSize: 11 }}
                        >▶</button>
                        <button
                          onClick={() => toggleLove(word)}
                          style={{ background: t.red50, border: "none", borderRadius: 6, width: 26, height: 26, cursor: "pointer", color: t.red400, fontSize: 11 }}
                        >✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer style={{
        background: t.white,
        borderTop: `1px solid ${t.gray200}`,
        padding: "24px 2rem",
        textAlign: "center",
      }}>
        <p style={{ fontSize: 13, color: t.gray400, margin: 0 }}>
          © 2025 <strong style={{ color: t.blue800 }}>TOEFL Companion</strong> · Built by Abood &amp; Jamal 💙
        </p>
      </footer>
    </div>
  );
}
