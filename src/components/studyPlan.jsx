import React, { useState, useEffect } from "react";
import { Helmet } from "react-helmet-async";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const styles = `
  .legacy-tool-root, .legacy-tool-root * { box-sizing: border-box; }
  .legacy-tool-root { font-family: inherit; background: #fafafa; color: #111111; }

  .sp-header { background: #fff; border-bottom: 1px solid #e4e4e7; padding: 28px 24px 24px; }
  .sp-header h1 { color: #111; font-size: 1.25rem; font-weight: 700; margin-bottom: 6px; letter-spacing: -0.02em; }
  .sp-header p { color: #71717a; font-size: 13px; margin-bottom: 20px; }

  .sp-overview { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 20px; }
  .sp-ov-card { background: #eff6ff; border: 1px solid #e4e4e7; border-radius: 12px; padding: 12px 18px; color: #111; min-width: 120px; }
  .sp-ov-num { font-size: 24px; font-weight: 700; line-height: 1; color: #2563eb; }
  .sp-ov-label { font-size: 11px; color: #71717a; margin-top: 3px; font-weight: 500; }

  .sp-controls { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
  .sp-ctrl-group { display: flex; align-items: center; gap: 8px; min-width: 160px; }
  .sp-ctrl-label { color: #71717a; font-size: 12px; font-weight: 600; }
  .sp-btn { padding: 8px 16px; border-radius: 10px; border: 1px solid #e4e4e7; font-size: 13px; font-weight: 600; cursor: pointer; transition: background .15s, border-color .15s, color .15s; min-height: 40px; background: #fff; color: #111; }
  .sp-btn-primary { background: #2563eb; color: #fff; border-color: #2563eb; }
  .sp-btn-primary:hover { background: #1d4ed8; border-color: #1d4ed8; }
  .sp-btn-success { background: #fff; color: #15803d; border-color: #bbf7d0; }
  .sp-btn-success:hover { background: #f0fdf4; }
  .sp-btn-ghost { background: #fff; border-color: #e4e4e7; color: #52525b; }
  .sp-btn-ghost:hover { background: #f4f4f5; }

  .sp-layout { display: flex; min-height: calc(100vh - 260px); }

  .sp-sidebar { width: 200px; flex-shrink: 0; background: #fff; border-right: 1px solid #e4e4e7; padding: 16px 12px; overflow-y: auto; }
  .sp-sidebar-title { font-size: 11px; font-weight: 700; color: #a1a1aa; text-transform: uppercase; letter-spacing: .8px; margin-bottom: 12px; padding: 0 4px; }
  .sp-week-item { border-radius: 10px; padding: 10px 12px; cursor: pointer; margin-bottom: 6px; transition: background .15s, border-color .15s; border: 1px solid transparent; }
  .sp-week-item:hover { background: #f4f4f5; border-color: #e4e4e7; }
  .sp-week-item.active { background: #eff6ff; border-color: #bfdbfe; }
  .sp-week-num { font-weight: 700; font-size: 13px; color: #2563eb; }
  .sp-week-bar { width: 100%; height: 4px; background: #f4f4f5; border-radius: 3px; margin-top: 6px; overflow: hidden; }
  .sp-week-fill { height: 100%; background: #2563eb; border-radius: 3px; transition: width .4s; }
  .sp-week-frac { font-size: 11px; color: #a1a1aa; margin-top: 3px; }

  .sp-content { flex: 1; padding: 20px 24px; overflow-y: auto; background: #fafafa; }
  .sp-content-title { font-size: 18px; font-weight: 700; color: #111; letter-spacing: -0.02em; }
  .sp-content-sub { font-size: 13px; color: #71717a; margin-top: 2px; margin-bottom: 20px; }

  .sp-chips { display: flex; gap: 7px; margin-bottom: 20px; flex-wrap: wrap; }
  .sp-chip { padding: 6px 14px; border-radius: 10px; border: 1px solid #e4e4e7; background: #fff; color: #52525b; font-size: 12px; font-weight: 600; cursor: pointer; transition: background .15s, border-color .15s, color .15s; }
  .sp-chip.active, .sp-chip:hover { background: #eff6ff; color: #2563eb; border-color: #bfdbfe; }

  .sp-days-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 14px; }

  .sp-day-card { background: #fff; border-radius: 14px; border: 1px solid #e4e4e7; box-shadow: 0 4px 10px rgba(0,0,0,.04); transition: border-color .15s, box-shadow .15s; overflow: hidden; }
  .sp-day-card:hover { box-shadow: 0 6px 16px rgba(37,99,235,.08); border-color: #bfdbfe; }
  .sp-day-card.done { background: #f0fdf4; border-color: #bbf7d0; }
  .sp-day-card.done .sp-day-title { color: #15803d; }
  .sp-top-bar { height: 3px; width: 100%; background: #2563eb; }
  .sp-day-head { padding: 14px 16px 10px; display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
  .sp-day-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .7px; color: #a1a1aa; margin-bottom: 3px; }
  .sp-day-title { font-size: 13px; font-weight: 700; color: #111; line-height: 1.3; }
  .sp-day-id { font-size: 10px; color: #d4d4d8; margin-top: 3px; font-family: ui-monospace, monospace; }
  .sp-done-btn { flex-shrink: 0; width: 32px; height: 32px; border-radius: 50%; border: 1.5px solid #e4e4e7; background: #fafafa; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 14px; transition: background .15s, border-color .15s; }
  .sp-done-btn:hover { border-color: #bfdbfe; background: #eff6ff; }
  .sp-day-card.done .sp-done-btn { background: #dcfce7; border-color: #86efac; color: #15803d; }
  .sp-tasks { padding: 0 16px 14px; }
  .sp-task { display: flex; align-items: flex-start; gap: 7px; padding: 5px 0; border-bottom: 1px solid #f4f4f5; font-size: 12px; color: #3f3f46; line-height: 1.4; }
  .sp-task:last-child { border-bottom: none; }
  .sp-task-dot { width: 6px; height: 6px; border-radius: 50%; background: #2563eb; flex-shrink: 0; margin-top: 5px; }
  .sp-day-card.done .sp-task-dot { background: #15803d; }

  .sp-empty { text-align: center; padding: 60px 20px; color: #a1a1aa; }

  .sp-footer { background: #fff; border-top: 1px solid #e4e4e7; text-align: center; padding: 18px; color: #71717a; font-size: 13px; }
  .sp-footer .brand { color: #2563eb; font-weight: 700; }

  @media (max-width: 700px) {
    .sp-layout { flex-direction: column; }
    .sp-sidebar { width: 100%; display: flex; gap: 8px; overflow-x: auto; padding: 12px; border-right: none; border-bottom: 1px solid #e4e4e7; }
    .sp-week-item { min-width: 100px; flex-shrink: 0; }
  }
`;

const TOPICS = [
  {
    label: "Grammar & Core Vocabulary",
    color: "#2563eb",
    tasks: ["30 min: Grammar review", "20 min: Learn 12 academic words", "20 min: Quick reading passage"],
  },
  {
    label: "Reading: Main Idea & Details",
    color: "#2563eb",
    tasks: ["1 full academic reading passage", "Identify main idea + key details", "10 min error review"],
  },
  {
    label: "Listening: Lectures & Talks",
    color: "#2563eb",
    tasks: ["1 lecture + summarize notes", "Practice active note-taking", "10 comprehension questions"],
  },
  {
    label: "Speaking: Independent Tasks",
    color: "#2563eb",
    tasks: ["4 recorded responses (45 sec each)", "Template: intro → 2 supports → conclusion", "Listen back and timestamp weak spots"],
  },
  {
    label: "Writing: Integrated Task",
    color: "#2563eb",
    tasks: ["Integrated writing (read + listen + write 20 min)", "Independent essay (30 min)", "Revise structure and transitions"],
  },
  {
    label: "Full Timed Section Practice",
    color: "#2563eb",
    tasks: ["Full timed section (choose one skill)", "Review every mistake carefully", "10 min vocabulary review"],
  },
  {
    label: "Review & Rest Day",
    color: "#71717a",
    tasks: ["Review error log from the week", "Light practice on weakest skill", "Active recall + rest"],
  },
];

function generatePlan() {
  const today = new Date();
  return Array.from({ length: 8 }, (_, w) => ({
    weekNumber: w + 1,
    days: Array.from({ length: 7 }, (_, d) => {
      const t = TOPICS[d % TOPICS.length];
      const date = new Date(today);
      date.setDate(today.getDate() + w * 7 + d);
      return {
        id: `w${w + 1}d${d + 1}`,
        week: w + 1,
        dayOfWeek: date.toLocaleDateString("en-US", { weekday: "short" }),
        dateString: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        title: t.label,
        color: t.color,
        tasks: t.tasks,
        completed: false,
      };
    }),
  }));
}

export default function StudyPlan() {
  const [plan, setPlan] = useState(() => {
    try {
      const raw = localStorage.getItem("toeflPlan_v3");
      if (raw) return JSON.parse(raw);
    } catch (e) {}
    return generatePlan();
  });

  const [selectedWeek, setSelectedWeek] = useState(1);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    if (!document.getElementById("sp-styles")) {
      const style = document.createElement("style");
      style.id = "sp-styles";
      style.innerHTML = styles;
      document.head.appendChild(style);
    } else {
      document.getElementById("sp-styles").innerHTML = styles;
    }
  }, []);

  useEffect(() => {
    try { localStorage.setItem("toeflPlan_v3", JSON.stringify(plan)); } catch (e) {}
  }, [plan]);

  const allDays = plan.flatMap((w) => w.days);
  const doneDays = allDays.filter((d) => d.completed).length;
  const totalDays = allDays.length;
  const pct = Math.round((doneDays / totalDays) * 100);

  const computeStreak = () => {
    let streak = 0;
    for (let i = allDays.length - 1; i >= 0; i--) {
      if (allDays[i].completed) streak++;
      else break;
    }
    return streak;
  };

  const currentWeek = plan.find((w) => w.weekNumber === selectedWeek) || plan[0];

  const filteredDays = currentWeek.days.filter((d) => {
    if (filter === "done") return d.completed;
    if (filter === "pending") return !d.completed;
    return true;
  });

  const toggleDay = (id) => {
    setPlan(plan.map((w) => ({
      ...w,
      days: w.days.map((d) => d.id === id ? { ...d, completed: !d.completed } : d),
    })));
  };

  const markWeekDone = () => {
    setPlan(plan.map((w) =>
      w.weekNumber === selectedWeek
        ? { ...w, days: w.days.map((d) => ({ ...d, completed: true })) }
        : w
    ));
  };

  const resetAll = () => {
    if (window.confirm("Reset all progress?")) setPlan(generatePlan());
  };

  const exportJSON = () => {
    const a = document.createElement("a");
    a.href = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(plan, null, 2));
    a.download = `toefl-plan-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  return (
    <>
      <Helmet>
        <title>ABOOD | Study Plan</title>
        <meta name="description" content="TOEFL 8-Week Study Plan" />
      </Helmet>

      <div className="sp-header">
        <h1>TOEFL 8-Week Study Plan</h1>
        <p>Personalized daily plan with progress tracking — starting from today</p>

        <div className="sp-overview">
          <div className="sp-ov-card"><div className="sp-ov-num">{doneDays}</div><div className="sp-ov-label">Days Done</div></div>
          <div className="sp-ov-card"><div className="sp-ov-num">{pct}%</div><div className="sp-ov-label">Progress</div></div>
          <div className="sp-ov-card"><div className="sp-ov-num">{computeStreak()}</div><div className="sp-ov-label">Day Streak</div></div>
          <div className="sp-ov-card"><div className="sp-ov-num">{totalDays - doneDays}</div><div className="sp-ov-label">Days Left</div></div>
        </div>

        <div className="sp-controls">
          <div className="sp-ctrl-group">
            <span className="sp-ctrl-label">Week:</span>
            <Select
              value={String(selectedWeek)}
              onValueChange={(v) => setSelectedWeek(Number(v))}
            >
              <SelectTrigger className="h-10 w-[140px] bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {plan.map((w) => (
                  <SelectItem key={w.weekNumber} value={String(w.weekNumber)}>
                    Week {w.weekNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <button type="button" className="sp-btn sp-btn-primary" onClick={markWeekDone}>Mark Week Done</button>
          <button type="button" className="sp-btn sp-btn-success" onClick={exportJSON}>Export JSON</button>
          <button type="button" className="sp-btn sp-btn-ghost" onClick={resetAll}>Reset</button>
        </div>
      </div>

      <div className="sp-layout">
        <div className="sp-sidebar">
          <div className="sp-sidebar-title">8 Weeks</div>
          {plan.map((w) => {
            const done = w.days.filter((d) => d.completed).length;
            const p = Math.round((done / w.days.length) * 100);
            return (
              <div
                key={w.weekNumber}
                className={`sp-week-item${w.weekNumber === selectedWeek ? " active" : ""}`}
                onClick={() => setSelectedWeek(w.weekNumber)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") setSelectedWeek(w.weekNumber);
                }}
              >
                <div className="sp-week-num">Week {w.weekNumber}</div>
                <div className="sp-week-bar"><div className="sp-week-fill" style={{ width: `${p}%` }} /></div>
                <div className="sp-week-frac">{done}/{w.days.length} days</div>
              </div>
            );
          })}
        </div>

        <div className="sp-content">
          <div className="sp-content-title">Week {currentWeek.weekNumber} — Daily Plan</div>
          <div className="sp-content-sub">
            {currentWeek.days.filter((d) => d.completed).length} of {currentWeek.days.length} days completed
          </div>

          <div className="sp-chips">
            {[
              { key: "all", label: "All Days" },
              { key: "pending", label: "Pending" },
              { key: "done", label: "Completed" },
            ].map(({ key, label }) => (
              <div
                key={key}
                className={`sp-chip${filter === key ? " active" : ""}`}
                onClick={() => setFilter(key)}
                role="button"
                tabIndex={0}
              >
                {label}
              </div>
            ))}
          </div>

          {filteredDays.length === 0 ? (
            <div className="sp-empty">
              <div style={{ fontSize: 16, fontWeight: 700, color: "#3f3f46", marginBottom: 6 }}>All caught up!</div>
              <div>No days match this filter</div>
            </div>
          ) : (
            <div className="sp-days-grid">
              {filteredDays.map((d) => (
                <div key={d.id} className={`sp-day-card${d.completed ? " done" : ""}`}>
                  <div className="sp-top-bar" style={{ background: d.color }} />
                  <div className="sp-day-head">
                    <div style={{ flex: 1 }}>
                      <div className="sp-day-label">{d.dayOfWeek} · {d.dateString}</div>
                      <div className="sp-day-title">{d.title}</div>
                      <div className="sp-day-id">{d.id}</div>
                    </div>
                    <button
                      type="button"
                      className="sp-done-btn"
                      onClick={() => toggleDay(d.id)}
                      title={d.completed ? "Mark incomplete" : "Mark complete"}
                      aria-label={d.completed ? "Mark incomplete" : "Mark complete"}
                    >
                      {d.completed ? "✓" : "○"}
                    </button>
                  </div>
                  <div className="sp-tasks">
                    {d.tasks.map((task, i) => (
                      <div key={i} className="sp-task">
                        <div className="sp-task-dot" />
                        <span>{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <footer className="sp-footer">
        <p>© 2025 <span className="brand">ABOOD | JAMAL TOEFL TEST</span> — Automatically generated. Good luck!</p>
      </footer>
    </>
  );
}
