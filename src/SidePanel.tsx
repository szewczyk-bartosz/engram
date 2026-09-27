import { act, useState } from "react";


interface SidePanelProps {
  side: string;
  extraClassNames?: string
  children?: React.ReactNode;
}

export default function SidePanel({side, extraClassNames, children}: SidePanelProps) {
    const [collapsed, setCollapsed] = useState(false);
    return <> 
    <button onClick={() => setCollapsed(false)} className={`sidepanel-reopen-button ${extraClassNames ?? ""} ${side} ${collapsed ? "" : "hidden"}`}>{side == "left" ? ">" : "<"}</button>
    <div className={`sidepanel ${side} ${collapsed ? "hidden" : ""}`}>
        <button className="sidepanel-close-button" onClick={() => setCollapsed(true)}>{side == "left" ? "<" : ">"}</button>
        {children ?? ""}
    </div>
    </>
}
