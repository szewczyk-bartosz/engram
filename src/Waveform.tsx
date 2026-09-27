import { useEffect, useRef } from "react";

const BAR_COUNT = 32;
const INTERVAL_MS = 90;

export default function Waveform() {
  const barsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    function tick() {
      const t = Date.now() / 200;
      barsRef.current.forEach((bar, i) => {
        if (!bar) return;
        const h = 6 + Math.abs(Math.sin(t + i * 0.4)) * 22 + Math.random() * 4;
        bar.style.height = `${h}px`;
      });
    }

    const timer = setInterval(tick, INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="sidebar-segment" id="widget-waveform">
      <div className="widget-header">
        <span className="widget-label">SIGNAL</span>
      </div>
      <div id="waveform">
        {Array.from({ length: BAR_COUNT }, (_, i) => (
          <div
            className="bar"
            key={i}
            style={{ height: "4px" }}
            ref={(el) => {
              barsRef.current[i] = el;
            }}
          />
        ))}
      </div>
    </div>
  );
}
