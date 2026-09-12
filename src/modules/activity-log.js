export function startActivityLog() {
    const container = document.getElementById("activity-log");
    const maxRows = 8;

    const messages = [
        "Database indexed...",
        "Loaded themes...",
        "Parser success...",
        "Renderer success...",
        "Theme applied...",
        "Globe animation loaded...",
        "Checksum OK · 0xJP2137",
    ];

    function randomMessage() {
        return messages[Math.floor(Math.random() * messages.length)];
    }

    function push() {
        const row = document.createElement("div");
        row.className = "log-row";

        const ts = document.createElement("span");
        ts.className = "log-ts";
        ts.textContent = new Date().toLocaleTimeString("en-GB");

        const msg = document.createElement("span");
        msg.className = "log-msg";
        msg.textContent = randomMessage();

        row.appendChild(ts);
        row.appendChild(msg);
        container.prepend(row);

        while (container.children.length > maxRows) {
            container.lastElementChild.remove();
        }
    }

    for (let i = 0; i < 5; i++) push();
    setInterval(push, 4200);
}
