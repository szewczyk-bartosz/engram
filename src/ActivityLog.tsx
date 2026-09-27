import { useEffect, useState } from "react";

const MESSAGES = [
  "Database indexed...",
  "Loaded themes...",
  "Parser success...",
  "Renderer success...",
  "Theme applied...",
  "Globe animation loaded...",
  "Checksum OK · 0xJP2137",
];

const MAX_ROWS = 6;

function randomMessage() {
  return MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
}

interface LogRow {
  id: number;
  ts: string;
  msg: string;
}

let nextId = 0;
function makeRow(): LogRow {
  return {
    id: nextId++,
    ts: new Date().toLocaleTimeString("en-GB"),
    msg: randomMessage(),
  };
}

export default function ActivityLog() {
  const [rows, setRows] = useState<LogRow[]>(() =>
    Array.from({ length: MAX_ROWS }, () => makeRow()).reverse(),
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setRows((prev) => [makeRow(), ...prev].slice(0, MAX_ROWS));
    }, 4200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="sidebar-segment" id="widget-activity-log">
      <div className="widget-header">
        <span className="widget-label">STATUS</span>
      </div>
      <div id="activity-log">
        {rows.map((row) => (
          <div className="log-row" key={row.id}>
            <span className="log-ts">{row.ts}</span>
            <span className="log-msg">{row.msg}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
