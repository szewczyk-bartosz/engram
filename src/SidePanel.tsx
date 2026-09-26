import { act, useState } from "react";

interface SidePanelProps {
  side: string;
}

export default function SidePanel({side}: SidePanelProps) {
    const [collapsed, setCollapsed] = useState(false);
    return <> 
    <button onClick={() => setCollapsed(false)} className={`sidepanel-reopen-button ${side} ${collapsed ? "" : "hidden"}`}>{side == "left" ? ">" : "<"}</button>
    <div className={`sidepanel ${side} ${collapsed ? "hidden" : ""}`}>
        <button className="sidepanel-close-button" onClick={() => setCollapsed(true)}>{side == "left" ? "<" : ">"}</button>
    </div>
    </>
}

/*
			<div id="left-reopen"><button id="left-open-button">&gt;</button></div>
			<div id="left-panel">
				<div class="sidebar-segment" id="left-panel-controls"><button id="left-close-button">&lt;</button></div>
				<div class="sidebar-segment" id="file-sync-segment"><button id="sync-button">Sync</button></div>
				<div class="sidebar-segment" id="file-selector">
					<input type="text" id="filter" placeholder="filter...">
					<div id="tree-controls">
						<button id="expand-all-button">[expand all]</button>
						<button id="collapse-all-button">[collapse all]</button>
					</div>
					<div id="file-tree"></div>
				</div>
			</div>
            */
