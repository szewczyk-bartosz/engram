import { act, useState, useEffect } from "react";
import {views, ViewTypes} from "./Views";
import SidePanel from "./SidePanel"
import FileTree from "./FileTree"
import DocFile from "./DocPanel"
import DocPanel from "./DocPanel";
import Clock from "./Clock";
import Globe from "./Globe";
import Waveform from "./Waveform";
import ActivityLog from "./ActivityLog";

export default function Notes() {
  const [activePath, setActivePath] = useState<string | null>(null);

  return <div className="noteAppView">
    <SidePanel side="left">
    <FileTree setActivePath={setActivePath}/>
    </SidePanel>
    <DocPanel activePath={activePath}/>
    <SidePanel side="right" collapsedAtInit={true}>
    <div id="right-panel-body">
      <Clock />
      <Globe />
      <Waveform />
      <ActivityLog />
    </div>
    </SidePanel>
  </div>
}
