import { startClock } from "./modules/clock.js";
startClock();
import { startGlobe } from "./modules/globe.js";
startGlobe();
import { startWaveform } from "./modules/waveform.js";
startWaveform();
import { startActivityLog } from "./modules/activity-log.js";
startActivityLog();

const savedTheme = localStorage.getItem("theme");
if (savedTheme) document.documentElement.dataset.theme = savedTheme;

const savedSerif = localStorage.getItem("font-serif");
if (savedSerif) document.documentElement.style.setProperty("--serif", savedSerif);

const savedMono = localStorage.getItem("font-mono");
if (savedMono) document.documentElement.style.setProperty("--mono", savedMono);

function walk(node, parent, depth = 1) {
    const container = document.createElement("div");
    const label = document.createElement("div")
    label.textContent = (node["type"] === "folder" ? "▸ " : "  ") + node["name"];
    label.style.paddingLeft = `${14 + depth * 12}px`;
    container.className = "tree-node"
    container.dataset.type = node["type"];
    label.className = "tree-label"
    container.appendChild(label);
    parent.appendChild(container);
    if (node["type"] === "folder") {
        const children = document.createElement("div");
        children.className = "tree-children";
        container.appendChild(children);
        label.addEventListener("click", () => { children.dataset.collapsed = children.dataset.collapsed === "true" ? "false" : "true"; })
        node["children"].forEach(element => {
            walk(element, children, depth + 1);
        });
    } else if (node["type"] === "file") {
        label.addEventListener("click", async () => {
            const fetched = await fetch("./engrams/rendered/" + node["path"] + "?t=" + Date.now())
            const html = await fetched.text();
            document.getElementById("engram-doc").innerHTML = html;
            document.getElementById("doc-path").innerHTML = node["name"]
            document.getElementById("centre-panel").dataset.docName = node["name"].toUpperCase();
        })

    }
}

async function loadIndex() {
    const index = await fetch("./engrams/index.json?t=" + Date.now())
    const nodes = await index.json();
    console.log(nodes)
    document.getElementById("file-tree").innerHTML = "";
    nodes.forEach(element => {
        walk(element, document.getElementById("file-tree"));
    });
}

loadIndex()

const collapseAllButton = document.getElementById("collapse-all-button")
collapseAllButton.addEventListener("click", () => {
    document.querySelectorAll(".tree-children").forEach(element => {
        element.dataset.collapsed = "true";
    });
})

const expandAllButton = document.getElementById("expand-all-button")
expandAllButton.addEventListener("click", () => {
    document.querySelectorAll(".tree-children").forEach(element => {
        element.dataset.collapsed = "false";
    });
})

const syncButton = document.getElementById("sync-button")
syncButton.addEventListener("click", async () => {
    await fetch("/api/sync", { method: "POST" });
    loadIndex();
})

document.getElementById("filter").addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase().trim();

    if (query === "") {
        document.querySelectorAll(".tree-node").forEach(el => el.style.display = "");
        return;
    }

    // hide all files first
    document.querySelectorAll(".tree-node[data-type='file']").forEach(el => el.style.display = "none");
    // hide all folders
    document.querySelectorAll(".tree-node[data-type='folder']").forEach(el => el.style.display = "none");

    // show matching files and their ancestors
    document.querySelectorAll(".tree-node[data-type='file']").forEach(el => {
        const label = el.querySelector(".tree-label");
        if (label.textContent.toLowerCase().includes(query)) {
            el.style.display = "";
            let parent = el.parentElement;
            while (parent && parent.id !== "file-tree") {
                parent.style.display = "";
                parent = parent.parentElement;
            }
        }
    });
});


document.getElementById("left-close-button").addEventListener("click", () => {
    document.getElementById("app").dataset.leftClosed = "true";
})

document.getElementById("left-open-button").addEventListener("click", () => {
    document.getElementById("app").dataset.leftClosed = "false";
})



document.getElementById("right-close-button").addEventListener("click", () => {
    document.getElementById("app").dataset.rightClosed = "true";
    console.log("closing")
})

document.getElementById("right-open-button").addEventListener("click", () => {
    document.getElementById("app").dataset.rightClosed = "false";
})

document.getElementById("settings-button").addEventListener("click", () => {
    document.getElementById("settings").showModal();
});

document.getElementById("settings-close").addEventListener("click", () => {
    document.getElementById("settings").close();
});

document.getElementById("theme-select").addEventListener("change", (e) => {
    document.documentElement.dataset.theme = e.target.value;
    localStorage.setItem("theme", e.target.value);
});

document.getElementById("font-serif-select").addEventListener("change", (e) => {
    document.documentElement.style.setProperty("--serif", e.target.value);
    localStorage.setItem("font-serif", e.target.value);
});

document.getElementById("font-mono-select").addEventListener("change", (e) => {
    document.documentElement.style.setProperty("--mono", e.target.value);
    localStorage.setItem("font-mono", e.target.value);
});


const bootLines = [
    "engram v0.1 loaded...",
    "mounting filesystem...",
    "scanning directories...",
    "renderer ready...",
    "theme set...",
    "watcher attached",
    "launching...",
];

let delay = 0;
bootLines.forEach(line => {
    delay += 140;
    setTimeout(() => {
        document.getElementById("boot-lines").textContent += "> " + line + "\n";
    }, delay);
});

setTimeout(() => {
    document.getElementById("boot-overlay").style.display = "none";
}, delay + 600);
