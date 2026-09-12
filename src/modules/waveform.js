/**
 * SIGNAL widget: a row of bars riding a travelling sine wave plus noise.
 *
 * Options:
 *   bars       - number of bars to render (default 32)
 *   intervalMs - redraw interval in milliseconds (default 90)
 *
 * Returns a function that stops the animation.
 */
export function startWaveform(container = document.getElementById("waveform"), opts = {}) {
    // Mirror globe.js: fail loudly if the HTML is missing the container.
    if (!container) throw new Error("missing element #waveform");
    const count = opts.bars ?? 32;

    container.replaceChildren();
    const bars = [];
    for (let i = 0; i < count; i++) {
        const bar = document.createElement("div");
        bar.className = "bar";
        bar.style.height = "4px";
        container.append(bar);
        bars.push(bar);
    }

    function tick() {
        const t = Date.now() / 200;
        bars.forEach((bar, i) => {
            const h = 6 + Math.abs(Math.sin(t + i * 0.4)) * 22 + Math.random() * 4;
            bar.style.height = `${h}px`;
        });
    }

    const timer = setInterval(tick, opts.intervalMs ?? 90);
    return () => clearInterval(timer);
}
