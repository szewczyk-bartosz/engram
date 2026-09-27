import { useEffect, useState } from "react";
import { useActivityLog } from "./Main";

const MAX_ROWS = 20;

export function trackedFetch(url: string, log: (msg: string) => void, options?: RequestInit ){
    return fetch(url, options).then(response => {
        log(`${response.ok ? "✓" : "✗"} ${options?.method ?? "GET"} ${url} ${response.status}`);
        return response;
    });
}

interface LogRow {
  id: number;
  ts: string;
  msg: string;
}


export default function ActivityLog() {
  const { rows } = useActivityLog();

  useEffect(() => {
  }, [rows]);

  return (
    <div className="sidebar-segment" id="widget-activity-log">
      <div className="widget-header">
        <span className="widget-label">STATUS</span>
      </div>
      <div id="activity-log">
        {rows.slice(-MAX_ROWS).map((row) => (
          <div className="log-row" key={row.id}>
            <span className="log-ts">{row.time}</span>
            <span className="log-msg">{row.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
