import { views, ViewTypes } from "./Views";
import { act, useState, useEffect, useRef } from "react";

interface TopBarProps {
  activeView: ViewTypes;
  setActiveView: (view: ViewTypes) => void;
}

export default function TopBar({ activeView, setActiveView }: TopBarProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [selectedTheme, setTheme] = useState<string>(localStorage.getItem("theme") ?? "")
  const [selectedMono, setMono] = useState<string>(localStorage.getItem("font-mono") ?? "'JetBrains Mono', monospace")
  const [selectedSerif, setSerif] = useState<string>(localStorage.getItem("font-serif") ?? "'Lora', Georgia, serif")
  useEffect(() => {
    document.documentElement.style.setProperty("--serif", selectedSerif);
    document.documentElement.style.setProperty("--mono", selectedMono);
    document.documentElement.dataset.theme = selectedTheme;
    localStorage.setItem("theme", selectedTheme);
    localStorage.setItem("font-serif", selectedSerif);
    localStorage.setItem("font-mono", selectedMono);
  }, [selectedTheme, selectedMono, selectedSerif]);
  
  return (
    <div id="top-bar">
      <div id="top-bar-left">
        {Object.keys(views).map((element) => (
          <button
            key={element}
            className={`top-bar-button ${element == activeView ? " active-top-button" : ""}`}
            onClick={() => setActiveView(element as ViewTypes)}
          >
            {element}
          </button>
        ))}
      </div>
      <div id="top-bar-right">
        <button onClick={() => dialogRef.current?.showModal()}>⚙</button>
        
      <dialog id="settings" ref={dialogRef}>
        <div id="settings-header">
          <span>SETTINGS</span>
          <button id="settings-close" onClick= {() => dialogRef.current?.close()}>✕</button>
        </div>
        <div id="settings-body">
          <div className="settings-row">
            <label>THEME</label>
            <select id="theme-select" value={selectedTheme} onChange={(e) => setTheme(e.target.value)}>
              <option value="green">GREEN</option>
              <option value="amber">AMBER</option>
              <option value="red">RED</option>
              <option value="cyan">CYAN</option>
              <option value="mono">MONO</option>
              <option value="calm">CALM</option>
            </select>
          </div>
          <div className="settings-row">
            <label>READING FONT</label>
            <select id="serif-select" value={selectedSerif} onChange={(e) => setSerif(e.target.value)}>
              <option value="'Literata', 'Source Serif 4', Georgia, serif">LITERATA</option>
              <option value="'Source Serif 4', Georgia, serif">SOURCE SERIF 4</option>
              <option value="'Bitter', Georgia, serif">BITTER</option>
              <option value="'Recursive', 'IBM Plex Sans', system-ui, sans-serif">RECURSIVE</option>
              <option value="'IBM Plex Sans', system-ui, sans-serif">IBM PLEX SANS</option>
              <option value="'Atkinson Hyperlegible Next', system-ui, sans-serif">ATKINSON HYPERLEGIBLE</option>
              <option value="'Lora', Georgia, serif">LORA</option>
              <option value="'IBM Plex Serif', Georgia, serif">IBM PLEX SERIF</option>
              <option value="Georgia, serif">GEORGIA</option>
            </select>
          </div>
          <div className="settings-row">
            <label>MONO FONT</label>
            <select id="mono-select" value={selectedMono} onChange={(e) => setMono(e.target.value)}>
              <option value="'JetBrains Mono', monospace">JETBRAINS MONO</option>
              <option value="'Fira Code', monospace">FIRA CODE</option>
              <option value="ui-monospace, monospace">SYSTEM MONO</option>
            </select>
          </div>
        </div>
      </dialog>
        ENGRAM MOTHERFUCKER
      </div>
    </div>
  );
}
