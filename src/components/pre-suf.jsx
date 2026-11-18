import React, { useState, useEffect } from "react";
import { prefixes, suffixes } from "../data/prefixesAndSuffixes";
import { Helmet } from "react-helmet-async";
import { Heart, Search, Volume2 } from "lucide-react";

const styles = `
  .legacy-tool-root, .legacy-tool-root * { box-sizing: border-box; }
  .legacy-tool-root { font-family: inherit; background: #fafafa; color: #111; }

  .hub-header { background: #fff; border-bottom: 1px solid #e4e4e7; padding: 28px 24px 24px; }
  .hub-header h1 { color: #111; font-size: 1.35rem; font-weight: 700; letter-spacing: -.02em; margin-bottom: 6px; }
  .hub-header p { color: #71717a; font-size: 14px; margin-bottom: 20px; }

  .stats-row { display: flex; gap: 10px; margin-bottom: 18px; flex-wrap: wrap; }
  .stat-pill { background: #eff6ff; border: 1px solid #e4e4e7; border-radius: 10px; padding: 6px 14px; color: #111; font-size: 13px; font-weight: 500; }
  .stat-pill span { font-weight: 700; color: #2563eb; }

  .search-wrap { position: relative; margin-bottom: 16px; }
  .search-input { width: 100%; padding: 12px 16px; border-radius: 12px; border: 1px solid #e4e4e7; font-size: 14px; background: #fff; color: #111; outline: none; }
  .search-input:focus { border-color: #2563eb; box-shadow: 0 0 0 2px rgba(37,99,235,.2); }

  .filter-bar { display: flex; gap: 8px; flex-wrap: wrap; }
  .filter-btn { padding: 8px 16px; border-radius: 10px; border: 1px solid #e4e4e7; background: #fff; color: #52525b; font-size: 13px; font-weight: 500; cursor: pointer; transition: background .15s, border-color .15s, color .15s; min-height: 40px; }
  .filter-btn.active, .filter-btn:hover { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }

  .hub-main { padding: 24px; max-width: 1200px; margin: 0 auto; }
  .section-title { font-size: 1.05rem; font-weight: 700; color: #111; margin-bottom: 18px; display: flex; align-items: center; gap: 8px; }
  .count-badge { background: #eff6ff; color: #2563eb; border-radius: 10px; padding: 2px 10px; font-size: 12px; font-weight: 700; }

  .vocab-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }

  .vocab-card { background: #fff; border-radius: 14px; border: 1px solid #e4e4e7; box-shadow: 0 4px 10px rgba(0,0,0,.04); transition: border-color .15s, box-shadow .15s, background .15s; position: relative; overflow: hidden; }
  .vocab-card:hover { box-shadow: 0 6px 16px rgba(37,99,235,.08); border-color: #bfdbfe; background: #fafafa; }
  .vocab-card.loved { border-color: #2563eb; }
  .card-accent { position: absolute; top: 0; left: 0; width: 3px; height: 100%; background: #2563eb; }

  .card-top { padding: 16px 18px 12px 20px; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #f4f4f5; }
  .word-badge { font-size: 18px; font-weight: 700; color: #111; letter-spacing: -.02em; }
  .type-tag { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .8px; padding: 3px 9px; border-radius: 8px; background: #eff6ff; color: #2563eb; margin-top: 5px; display: inline-block; }
  .card-icons { display: flex; gap: 8px; align-items: center; margin-top: 4px; }
  .icon-btn { width: 36px; height: 36px; border-radius: 50%; border: 1px solid #e4e4e7; background: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: background .15s, border-color .15s; color: #52525b; }
  .icon-btn:hover { background: #eff6ff; border-color: #bfdbfe; color: #2563eb; }
  .icon-btn.heart.active { background: #fee2e2; border-color: #fca5a5; color: #ef4444; }

  .card-body { padding: 14px 18px 16px 20px; }
  .card-field { margin-bottom: 8px; font-size: 13px; color: #3f3f46; line-height: 1.5; }
  .field-label { font-weight: 700; color: #2563eb; margin-right: 5px; }
  .example-row { display: flex; align-items: center; gap: 8px; margin-top: 10px; background: #eff6ff; border-radius: 8px; padding: 8px 10px; }
  .example-text { font-size: 13px; color: #2563eb; font-style: italic; flex: 1; font-weight: 500; }
  .arabic-ex { font-size: 13px; color: #3f3f46; margin-top: 8px; line-height: 1.5; direction: rtl; text-align: right; font-weight: 500; background: #fafafa; border-radius: 8px; padding: 6px 10px; }

  .no-results { text-align: center; padding: 60px 20px; color: #a1a1aa; }

  .fav-fab { position: fixed; bottom: 28px; right: 24px; background: #2563eb; color: #fff; border: none; border-radius: 14px; padding: 12px 20px; font-size: 14px; font-weight: 700; cursor: pointer; box-shadow: 0 8px 24px rgba(37,99,235,.28); display: flex; align-items: center; gap: 8px; z-index: 100; transition: background .15s; min-height: 44px; }
  .fav-fab:hover { background: #1d4ed8; }
  .fav-count { background: rgba(255,255,255,.25); border-radius: 10px; padding: 1px 9px; font-size: 12px; }

  .panel-overlay { position: fixed; inset: 0; background: rgba(17,17,17,.2); backdrop-filter: blur(4px); z-index: 200; opacity: 0; pointer-events: none; transition: opacity .25s; }
  .panel-overlay.show { opacity: 1; pointer-events: auto; }
  .fav-panel { position: fixed; right: 0; top: 0; height: 100%; width: 340px; background: #fff; box-shadow: -8px 0 32px rgba(0,0,0,.12); z-index: 201; transform: translateX(100%); transition: transform .3s ease; display: flex; flex-direction: column; }
  .fav-panel.show { transform: translateX(0); }
  .panel-header { background: #fff; border-bottom: 1px solid #e4e4e7; padding: 24px 20px 20px; color: #111; position: relative; }
  .panel-header h3 { font-size: 17px; font-weight: 700; margin-bottom: 4px; }
  .panel-close { position: absolute; top: 16px; right: 16px; width: 32px; height: 32px; border-radius: 50%; background: #f4f4f5; border: none; color: #52525b; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; }
  .panel-body { flex: 1; overflow-y: auto; padding: 16px; background: #fafafa; }
  .panel-empty { text-align: center; padding: 40px 20px; color: #a1a1aa; font-size: 14px; }
  .fav-item { display: flex; align-items: center; gap: 12px; padding: 12px; border-radius: 10px; border: 1px solid #e4e4e7; margin-bottom: 8px; background: #fff; transition: border-color .15s, background .15s; }
  .fav-item:hover { border-color: #bfdbfe; background: #eff6ff; }
  .fav-word { font-weight: 700; color: #111; font-size: 14px; }
  .fav-root { font-size: 12px; color: #71717a; }
  .fav-mic { width: 32px; height: 32px; border-radius: 50%; background: #eff6ff; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: background .15s; flex-shrink: 0; color: #2563eb; }
  .fav-mic:hover { background: #dbeafe; }
  .fav-remove { width: 28px; height: 28px; border-radius: 50%; background: #fee2e2; border: none; cursor: pointer; font-size: 11px; color: #ef4444; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
  .fav-remove:hover { background: #fecaca; }

  .hub-footer { background: #fff; border-top: 1px solid #e4e4e7; text-align: center; padding: 20px; color: #71717a; font-size: 13px; margin-top: 20px; }
  .hub-footer .brand { color: #2563eb; font-weight: 700; }
`;

export default function PrefixesAndSuffixes() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [lovedItems, setLovedItems] = useState([]);
  const [showPanel, setShowPanel] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const allItems = [...prefixes, ...suffixes];

  useEffect(() => {
    let cancelled = false;
    import("@/lib/toolStorage").then(({ loadToolState }) => {
      loadToolState("lovedAffixes_v2", []).then((saved) => {
        if (!cancelled && Array.isArray(saved)) setLovedItems(saved);
      });
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    import("@/lib/toolStorage").then(({ saveToolState }) => {
      saveToolState("lovedAffixes_v2", lovedItems);
    });
  }, [lovedItems]);

  useEffect(() => {
    const existing = document.getElementById("hub-styles");
    if (!existing) {
      const style = document.createElement("style");
      style.id = "hub-styles";
      style.innerHTML = styles;
      document.head.appendChild(style);
    } else {
      existing.innerHTML = styles;
    }
  }, []);

  const filteredItems = allItems
    .filter((item) => {
      if (activeCategory === "Prefixes") return item.type === "Prefix";
      if (activeCategory === "Suffixes") return item.type === "Suffix";
      return true;
    })
    .filter((item) => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        item.word.toLowerCase().includes(q) ||
        item.root.toLowerCase().includes(q) ||
        item.rootMeaning.toLowerCase().includes(q) ||
        item.example.toLowerCase().includes(q)
      );
    });

  const toggleLove = (item) => {
    const exists = lovedItems.find((w) => w.word === item.word);
    if (exists) {
      setLovedItems(lovedItems.filter((w) => w.word !== item.word));
    } else {
      setLovedItems([...lovedItems, item]);
    }
  };

  const isLoved = (word) => lovedItems.some((w) => w.word === word);

  const speakWord = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 0.85;
    speechSynthesis.cancel();
    speechSynthesis.speak(utterance);
  };

  const categories = ["Prefixes", "Suffixes"];

  return (
    <>
      <Helmet>
        <title>ABOOD | Pre-Suf</title>
        <meta name="description" content="TOEFL Prefixes & Suffixes Hub" />
      </Helmet>

      {/* Header */}
      <div className="hub-header">
        <h1>TOEFL Prefixes &amp; Suffixes Hub</h1>
        <p>Understand how prefixes and suffixes build meaning — master TOEFL word formation!</p>

        <div className="stats-row">
          <div className="stat-pill"><span>{allItems.length}</span> Total</div>
          <div className="stat-pill"><span>{prefixes.length}</span> Prefixes</div>
          <div className="stat-pill"><span>{suffixes.length}</span> Suffixes</div>
          <div className="stat-pill"><span>{lovedItems.length}</span> Loved</div>
        </div>

        <div className="search-wrap">
          <input
            className="search-input"
            type="text"
            placeholder="Search by word, root, or meaning…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search affixes"
          />
        </div>

        <div className="filter-bar">
          <button
            className={`filter-btn${activeCategory === "All" ? " active" : ""}`}
            onClick={() => setActiveCategory("All")}
          >
            Show All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              className={`filter-btn${activeCategory === cat ? " active" : ""}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Main */}
      <div className="hub-main">
        <div className="section-title">
          {activeCategory === "All" ? "All Prefixes & Suffixes" : activeCategory}
          <span className="count-badge">{filteredItems.length} items</span>
        </div>

        {filteredItems.length === 0 ? (
          <div className="no-results">
            <Search size={36} strokeWidth={1.5} style={{ marginBottom: 12, opacity: 0.45 }} aria-hidden />
            <div style={{ fontSize: 16, fontWeight: 600, color: "#374151", marginBottom: 6 }}>No results found</div>
            <div>Try a different search term</div>
          </div>
        ) : (
          <div className="vocab-grid">
            {filteredItems.map((item, index) => {
              const loved = isLoved(item.word);
              return (
                <div key={index} className={`vocab-card${loved ? " loved" : ""}`}>
                  <div className="card-accent" />
                  <div className="card-top">
                    <div>
                      <div className="word-badge">{item.word}</div>
                      <div className="type-tag">{item.type}</div>
                    </div>
                    <div className="card-icons">
                      <button
                        className={`icon-btn heart${loved ? " active" : ""}`}
                        onClick={() => toggleLove(item)}
                        title={loved ? "Remove from favorites" : "Add to favorites"}
                        aria-label={loved ? "Remove from favorites" : "Add to favorites"}
                      >
                        <Heart size={14} strokeWidth={1.75} fill={loved ? "currentColor" : "none"} aria-hidden />
                      </button>
                      <button
                        className="icon-btn"
                        onClick={() => speakWord(item.example)}
                        title="Listen to example"
                        aria-label="Listen to example"
                      >
                        <Volume2 size={14} strokeWidth={1.75} aria-hidden />
                      </button>
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="card-field">
                      <span className="field-label">Arabic name:</span>
                      {item.affixNameArabic}
                    </div>
                    <div className="card-field">
                      <span className="field-label">Root:</span>
                      {item.root} — <em>{item.rootMeaning}</em>
                    </div>
                    <div className="example-row">
                      <div className="example-text">{item.example}</div>
                      <button
                        className="icon-btn"
                        style={{ flexShrink: 0 }}
                        onClick={() => speakWord(item.example)}
                        aria-label="Listen to example"
                      >
                        <Volume2 size={14} strokeWidth={1.75} aria-hidden />
                      </button>
                    </div>
                    <div className="arabic-ex" dir="rtl">{item.arabicExample}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* FAB */}
      <button className="fav-fab" onClick={() => setShowPanel(true)} aria-label="Open loved words">
        <Heart size={14} strokeWidth={1.75} fill="currentColor" aria-hidden style={{ marginInlineEnd: 6 }} />
        My Loved <span className="fav-count">{lovedItems.length}</span>
      </button>

      {/* Overlay */}
      <div
        className={`panel-overlay${showPanel ? " show" : ""}`}
        onClick={() => setShowPanel(false)}
      />

      {/* Favorites Panel */}
      <div className={`fav-panel${showPanel ? " show" : ""}`}>
        <div className="panel-header">
          <h3>Loved Words</h3>
          <p style={{ fontSize: 12, opacity: 0.75, marginTop: 2 }}>Your personal vocabulary vault</p>
          <button className="panel-close" onClick={() => setShowPanel(false)} aria-label="Close">✕</button>
        </div>
        <div className="panel-body">
          {lovedItems.length === 0 ? (
            <div className="panel-empty">
              <Heart size={28} strokeWidth={1.5} style={{ opacity: 0.5, marginBottom: 8 }} aria-hidden />
              <br />No favorites yet!<br />
              <span style={{ fontSize: 12 }}>Tap the heart on any card</span>
            </div>
          ) : (
            lovedItems.map((item, i) => (
              <div key={i} className="fav-item">
                <div style={{ flex: 1 }}>
                  <div className="fav-word">{item.word}</div>
                  <div className="fav-root">{item.root} — {item.rootMeaning}</div>
                </div>
                <button className="fav-mic" onClick={() => speakWord(item.word)} aria-label="Pronounce">
                  <Volume2 size={14} strokeWidth={1.75} aria-hidden />
                </button>
                <button className="fav-remove" onClick={() => toggleLove(item)} aria-label="Remove">✕</button>
              </div>
            ))
          )}
        </div>
      </div>

      <footer className="hub-footer">
        <p>© 2025 <span className="brand">ABOOD | JAMAL</span> — Master TOEFL Word Formation!</p>
      </footer>
    </>
  );
}