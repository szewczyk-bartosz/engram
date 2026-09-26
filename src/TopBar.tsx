import { views, ViewTypes } from "./Views";

interface TopBarProps {
  activeView: ViewTypes;
  setActiveView: (view: ViewTypes) => void;
}

export default function TopBar({ activeView, setActiveView }: TopBarProps) {
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
      <div id="top-bar-right">ENGRAM MOTHERFUCKER</div>
    </div>
  );
}
