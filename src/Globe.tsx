import { useEffect, useRef } from "react";

/**
 * EARTH widget: a true 3D wireframe. Meridians and parallels are sampled as
 * points on a unit sphere, rotated about the Y axis by a phase that advances
 * linearly with time, projected orthographically (drop Z), and only the
 * front-facing (z >= 0) runs are drawn. Constant phase advance means constant
 * rotation with no cusps. Ported from old-src/modules/globe.js.
 */

const RADIUS = 48;
const PERIOD_SECONDS = 24;
const MERIDIANS = 12;
const PARALLELS = 5;
const POINTS_PER_LINE = 36;

const OPACITY: Record<"meridian" | "parallel", number> = {
  meridian: 0.7,
  parallel: 0.5,
};

interface LatLon {
  lat: number;
  lon: number;
}

interface Line {
  kind: "meridian" | "parallel";
  points: LatLon[];
}

function buildLines(meridians: number, parallels: number, perLine: number): Line[] {
  const lines: Line[] = [];
  for (let m = 0; m < meridians; m++) {
    const lon = (m / meridians) * Math.PI * 2;
    const points: LatLon[] = [];
    for (let i = 0; i <= perLine; i++) {
      points.push({ lat: -Math.PI / 2 + (i / perLine) * Math.PI, lon });
    }
    lines.push({ kind: "meridian", points });
  }
  // Parallels skip the poles. Sampled over the full circle; the seam is
  // rotated to the back of the sphere at draw time.
  for (let p = 1; p < parallels; p++) {
    const lat = -Math.PI / 2 + (p / parallels) * Math.PI;
    const points: LatLon[] = [];
    for (let i = 0; i <= perLine; i++) {
      points.push({ lat, lon: (i / perLine) * Math.PI * 2 });
    }
    lines.push({ kind: "parallel", points });
  }
  return lines;
}

/** Rotate a lat/lon point about Y by the phase and return view-space x, y, z. */
function project({ lat, lon }: LatLon, sinP: number, cosP: number) {
  const cl = Math.cos(lat);
  const x0 = cl * Math.cos(lon);
  const z0 = cl * Math.sin(lon);
  return {
    x: x0 * cosP - z0 * sinP,
    y: Math.sin(lat),
    z: x0 * sinP + z0 * cosP,
  };
}

/**
 * For a closed loop, the index of the most back-facing sample. Starting the
 * walk there keeps the seam hidden so the visible arc is never split in two.
 */
function backmostIndex(points: LatLon[], sinP: number, cosP: number) {
  let best = 0;
  let minZ = Infinity;
  for (let i = 0; i < points.length - 1; i++) {
    const { z } = project(points[i], sinP, cosP);
    if (z < minZ) {
      minZ = z;
      best = i;
    }
  }
  return best;
}

/** SVG path data for the front-facing runs of one line at the given phase. */
function pathData(line: Line, radius: number, sinP: number, cosP: number) {
  const closed = line.kind === "parallel";
  const start = closed ? backmostIndex(line.points, sinP, cosP) : 0;
  const n = closed ? line.points.length - 1 : line.points.length;

  const segments: string[][] = [];
  let current: string[] = [];
  for (let k = 0; k < n; k++) {
    const point = line.points[(start + k) % n];
    const { x, y, z } = project(point, sinP, cosP);
    if (z >= 0) {
      current.push(`${(x * radius).toFixed(2)},${(-y * radius).toFixed(2)}`);
    } else if (current.length > 0) {
      if (current.length > 1) segments.push(current);
      current = [];
    }
  }
  if (current.length > 1) segments.push(current);

  return segments.map((seg) => `M${seg[0]} L${seg.slice(1).join(" L")}`).join(" ");
}

const LINES = buildLines(MERIDIANS, PARALLELS, POINTS_PER_LINE);

export default function Globe() {
  const pathsRef = useRef<(SVGPathElement | null)[]>([]);
  const trackerRef = useRef<SVGCircleElement | null>(null);

  useEffect(() => {
    let frame = 0;

    function tick(now: number) {
      const phase = (now / 1000 / PERIOD_SECONDS) * Math.PI * 2;
      const sinP = Math.sin(phase);
      const cosP = Math.cos(phase);

      LINES.forEach((line, i) => {
        pathsRef.current[i]?.setAttribute("d", pathData(line, RADIUS, sinP, cosP));
      });

      const tracker = trackerRef.current;
      if (tracker) {
        tracker.setAttribute("cx", (cosP * RADIUS).toFixed(2));
        tracker.setAttribute("opacity", sinP >= 0 ? "1" : "0");
      }

      frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div className="sidebar-segment" id="widget-globe">
      <div className="widget-header">
        <span className="widget-label">GLOBE</span>
      </div>
      <svg id="globe-svg" viewBox="-50 -50 100 100">
        <defs>
          <clipPath id="globe-clip">
            <circle r={RADIUS} cx="0" cy="0" />
          </clipPath>
        </defs>
        <circle
          r={RADIUS}
          cx="0"
          cy="0"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.6"
          opacity="0.85"
        />
        <g clipPath="url(#globe-clip)">
          <g id="globe-meridians">
            {LINES.map((line, i) => (
              <path
                key={i}
                fill="none"
                stroke="currentColor"
                strokeWidth={0.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity={OPACITY[line.kind]}
                ref={(el) => {
                  pathsRef.current[i] = el;
                }}
              />
            ))}
            <circle r={1.4} cy="0" fill="currentColor" ref={trackerRef} />
          </g>
        </g>
        <line x1="-52" y1="0" x2="-50" y2="0" stroke="currentColor" strokeWidth="0.6" />
        <line x1="50" y1="0" x2="52" y2="0" stroke="currentColor" strokeWidth="0.6" />
        <line x1="0" y1="-52" x2="0" y2="-50" stroke="currentColor" strokeWidth="0.6" />
        <line x1="0" y1="50" x2="0" y2="52" stroke="currentColor" strokeWidth="0.6" />
      </svg>
    </div>
  );
}
