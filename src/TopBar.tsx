import { views, ViewTypes } from "./Views";

export default function TopBar() {
  return (
    <div id="top-bar">
      {Object.keys(views).map((element) => (
        <button className="top-bar-button">{element}</button>
      ))}
    </div>
  );
}
