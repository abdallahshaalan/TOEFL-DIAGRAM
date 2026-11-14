import React, { useEffect } from "react";
import { Helmet } from "react-helmet-async";

const CSS_ID = "toefl-topics-component-styles";
const CSS = `
.legacy-tool-root .toefl-root {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px;
  border-radius: 14px;
  background: #ffffff;
  border: 1px solid #e4e4e7;
  box-shadow: 0 4px 10px rgba(0,0,0,.04);
  font-family: inherit;
  color: #111;
}

.legacy-tool-root .toefl-header {
  text-align: center;
  padding-bottom: 16px;
  border-bottom: 1px solid #e4e4e7;
}

.legacy-tool-root .toefl-header h1 {
  margin: 0;
  font-size: 1.35rem;
  color: #111;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.legacy-tool-root .toefl-header p {
  color: #71717a;
  margin-top: 8px;
  font-size: 14px;
}

.legacy-tool-root .topic-grid {
  margin-top: 24px;
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
}

.legacy-tool-root .topic-card {
  padding: 18px;
  border-radius: 14px;
  border: 1px solid #e4e4e7;
  background: #fff;
  transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
}

.legacy-tool-root .topic-card:hover {
  box-shadow: 0 6px 16px rgba(37,99,235,0.08);
  border-color: #bfdbfe;
  background: #fafafa;
}

.legacy-tool-root .topic-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: #111;
  margin-bottom: 10px;
  letter-spacing: -0.01em;
}

.legacy-tool-root .topic-list {
  margin-left: 18px;
  color: #52525b;
  line-height: 1.6;
  font-size: 14px;
}

.legacy-tool-root .topic-badge {
  display: inline-block;
  margin-bottom: 10px;
  padding: 4px 10px;
  font-size: 12px;
  border-radius: 8px;
  font-weight: 600;
  background: #eff6ff;
  color: #2563eb;
}

.legacy-tool-root .footer {
  text-align: center;
  margin-top: 24px;
  color: #71717a;
  font-size: 13px;
}
`;

function ensureCSS() {
  if (typeof document === "undefined") return;
  const existing = document.getElementById(CSS_ID);
  if (!existing) {
    const tag = document.createElement("style");
    tag.id = CSS_ID;
    tag.innerHTML = CSS;
    document.head.appendChild(tag);
  } else {
    existing.innerHTML = CSS;
  }
}

export default function ToeflTopics() {
  useEffect(() => ensureCSS(), []);

  const topics = [
    {
      title: "Biology & Life Sciences",
      badge: "Very Frequent",
      details: [
        "Evolution & natural selection",
        "Animal behavior (migration, communication)",
        "Ecosystems & climate effects",
        "Cells, DNA, microorganisms",
        "Human anatomy",
        "Plant biology",
      ],
    },
    {
      title: "Earth Science & Environment",
      badge: "Super Common",
      details: [
        "Volcanoes & earthquakes",
        "Plate tectonics",
        "Climate change",
        "Glaciers, deserts, oceans",
        "Weather systems",
      ],
    },
    {
      title: "Physical Science",
      badge: "Frequent",
      details: [
        "Energy & motion",
        "Chemical reactions",
        "Astronomy & space",
        "Waves & light",
      ],
    },
    {
      title: "Social Sciences",
      badge: "Very Frequent",
      details: [
        "Psychology: Memory, learning, behavior",
        "Sociology & anthropology",
        "Economics: Supply & demand",
        "Cultural development",
      ],
    },
    {
      title: "History & Civilization",
      badge: "Common in Reading",
      details: [
        "Ancient civilizations",
        "American history",
        "Trade routes",
        "Technological inventions",
      ],
    },
    {
      title: "Arts & Humanities",
      badge: "Common in Listening",
      details: [
        "Architecture",
        "Art movements",
        "Music history",
        "Theater & literature",
        "Photography",
      ],
    },
  ];

  return (
    <div className="toefl-root">
      <Helmet>
        <title>ABOOD | Academic Topics</title>
        <meta name="description" content="The academic Topics For Toefl" />
      </Helmet>
      <header className="toefl-header">
        <h1>TOEFL — Most Common Academic Topics</h1>
        <p>
          All major academic categories that appear in TOEFL Reading, Listening,
          Speaking, and Writing.
        </p>
      </header>

      <div className="topic-grid">
        {topics.map((topic, i) => (
          <div key={i} className="topic-card">
            <div className="topic-badge">{topic.badge}</div>
            <h2 className="topic-title">{topic.title}</h2>
            <ul className="topic-list">
              {topic.details.map((d, index) => (
                <li key={index}>{d}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="footer">© 2025 ABOOD | TOEFL Topics Overview</div>
    </div>
  );
}
