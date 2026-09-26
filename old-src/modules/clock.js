export function startClock() {
    const time = document.getElementById("clock-time");
    const date = document.getElementById("clock-date");
    const uptime = document.getElementById("clock-uptime");
    const startedAt = Date.now();

    function tick() {
        const now = new Date();
        time.textContent = now.toLocaleTimeString("en-GB");
        date.textContent = now.toLocaleDateString("en-GB", {
            weekday: "short",
            day: "2-digit",
            month: "short",
            year: "numeric"
        }).toUpperCase();

        const elapsed = Date.now() - startedAt;
        const s = Math.floor(elapsed / 1000);
        const h = Math.floor(s / 3600);
        const m = Math.floor((s % 3600) / 60);
        const sec = s % 60;
        uptime.textContent = `UPTIME ${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
    }

    tick();
    setInterval(tick, 1000);
}
