import { act, useState } from "react";


interface SidePanelProps {
  side: string,
  extraClassNames?: string,
  children?: React.ReactNode,
  collapsedAtInit?: boolean
}

export default function SidePanel({side, extraClassNames, children, collapsedAtInit=false}: SidePanelProps) {
    const [collapsed, setCollapsed] = useState(collapsedAtInit);
    return <> 
    <button onClick={() => setCollapsed(false)} className={`sidepanel-reopen-button ${extraClassNames ?? ""} ${side} ${collapsed ? "" : "hidden"}`}>{side == "left" ? ">" : "<"}</button>
    <div className={`sidepanel ${side} ${collapsed ? "hidden" : ""}`}>
      
       <div className={`sidepanel-controls ${side}`}>
        <button className="sidepanel-close-button" onClick={() => setCollapsed(true)}>{side == "left" ? "<" : ">"}</button>

       </div> 
        {children ?? ""}
    </div>
    </>
}
