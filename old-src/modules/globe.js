/**
 * EARTH widget: a true 3D wireframe. Meridians and parallels are sampled as
 * points on a unit sphere, rotated about the Y axis by a phase that advances
 * linearly with time, projected orthographically (drop Z), and only the
 * front-facing (z >= 0) runs are drawn. Constant phase advance means constant
 * rotation with no cusps.
 */

const SVG_NS = "http://www.w3.org/2000/svg";

/** Create an SVG element with the given attributes. */
function svgEl(tag, attrs = {}) {
    const el = document.createElementNS(SVG_NS, tag);
    for (const [key, value] of Object.entries(attrs)) {
        el.setAttribute(key, String(value));
    }
    return el;
}

const OPACITY = { meridian: 0.7, parallel: 0.5 };

function buildLines(meridians, parallels, perLine) {
    const lines = [];
    for (let m = 0; m < meridians; m++) {
        const lon = (m / meridians) * Math.PI * 2;
        const points = [];
        for (let i = 0; i <= perLine; i++) {
            points.push({ lat: -Math.PI / 2 + (i / perLine) * Math.PI, lon });
        }
        lines.push({ kind: "meridian", points });
    }
    // Parallels skip the poles. Sampled over the full circle; the seam is
    // rotated to the back of the sphere at draw time.
    for (let p = 1; p < parallels; p++) {
        const lat = -Math.PI / 2 + (p / parallels) * Math.PI;
        const points = [];
        for (let i = 0; i <= perLine; i++) {
            points.push({ lat, lon: (i / perLine) * Math.PI * 2 });
        }
        lines.push({ kind: "parallel", points });
    }
    return lines;
}

/** Rotate a lat/lon point about Y by the phase and return view-space x, y, z. */
function project({ lat, lon }, sinP, cosP) {
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
function backmostIndex(points, sinP, cosP) {
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
function pathData(line, radius, sinP, cosP) {
    const closed = line.kind === "parallel";
    const start = closed ? backmostIndex(line.points, sinP, cosP) : 0;
    const n = closed ? line.points.length - 1 : line.points.length;

    const segments = [];
    let current = [];
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

/**
 * Start the rotating globe inside `group` (an SVG <g>). Defaults to
 * #globe-meridians when no group is given. Returns a stop function.
 *
 * Options: radius (SVG units), meridians, parallels, pointsPerLine,
 * periodSeconds (seconds per full rotation).
 */
export function startGlobe(group = document.getElementById("globe-meridians"), opts = {}) {
    // Mirror the original's byId(): fail loudly if the HTML is missing the group.
    if (!group) throw new Error("missing element #globe-meridians");
    const radius = opts.radius ?? 48;
    const period = opts.periodSeconds ?? 24;
    const lines = buildLines(
        opts.meridians ?? 12,
        opts.parallels ?? 5,
        opts.pointsPerLine ?? 36,
    );

    const paths = lines.map((line) => {
        const path = svgEl("path", {
            fill: "none",
            stroke: "currentColor",
            "stroke-width": 0.5,
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            opacity: OPACITY[line.kind],
        });
        group.append(path);
        return path;
    });

    // A single dot on the equator so the eye can lock onto the rotation.
    const tracker = svgEl("circle", { r: 1.4, cy: 0, fill: "currentColor" });
    group.append(tracker);

    let frame = 0;
    function tick(now) {
        const phase = (now / 1000 / period) * Math.PI * 2;
        const sinP = Math.sin(phase);
        const cosP = Math.cos(phase);

        lines.forEach((line, i) => {
            paths[i].setAttribute("d", pathData(line, radius, sinP, cosP));
        });

        tracker.setAttribute("cx", (cosP * radius).toFixed(2));
        tracker.setAttribute("opacity", sinP >= 0 ? "1" : "0");

        frame = requestAnimationFrame(tick);
    }

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
}
