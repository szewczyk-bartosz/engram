import { useEffect, useState } from "react";

function formatUptime(startedAt: number) {
  const elapsed = Date.now() - startedAt;
  const s = Math.floor(elapsed / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `UPTIME ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
}

export default function Clock() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [uptime, setUptime] = useState("");

  useEffect(() => {
    const startedAt = Date.now();

    function tick() {
      const now = new Date();
      setTime(now.toLocaleTimeString("en-GB"));
      setDate(
        now
          .toLocaleDateString("en-GB", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
          .toUpperCase(),
      );
      setUptime(formatUptime(startedAt));
    }

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="sidebar-segment" id="widget-clock">
      <div className="widget-header">
        <span className="widget-label">CHRONO</span>
      </div>
      <div id="clock-time">{time}</div>
      <div id="clock-date">{date}</div>
      <div id="clock-uptime">{uptime}</div>
    </div>
  );
}
