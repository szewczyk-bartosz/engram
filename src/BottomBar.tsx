import { views, ViewTypes } from "./Views";

interface BottomBarProps {
  activeView: ViewTypes;
  setActiveView: (view: ViewTypes) => void;
}

export default function BottomBar({
  activeView,
  setActiveView,
}: BottomBarProps) {
  return (
    <div id="bottom-bar">
      <div id="bottom-bar-left">
        <span className="status-item">ENGRAM v1.0</span>
        <span className="status-item">UTF-8</span>
      </div>
      <div id="bottom-bar-right">
        <span className="status-item">
          <span className="blink">●</span>READY
        </span>
      </div>
    </div>
  );
}
