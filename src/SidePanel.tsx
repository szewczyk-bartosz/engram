import { act, useState } from "react";

interface SidePanelProps {
  side: string;
  extraClassNames?: string
}

export default function SidePanel({side, extraClassNames}: SidePanelProps) {
    const [collapsed, setCollapsed] = useState(false);
    return <> 
    <button onClick={() => setCollapsed(false)} className={`sidepanel-reopen-button ${extraClassNames ?? ""} ${side} ${collapsed ? "" : "hidden"}`}>{side == "left" ? ">" : "<"}</button>
    <div className={`sidepanel ${side} ${collapsed ? "hidden" : ""}`}>
        <button className="sidepanel-close-button" onClick={() => setCollapsed(true)}>{side == "left" ? "<" : ">"}</button>
    </div>
    </>
}
