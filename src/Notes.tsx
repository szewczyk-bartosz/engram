import { act, useState, useEffect } from "react";
import {views, ViewTypes} from "./Views";
import SidePanel from "./SidePanel" 
import FileTree from "./FileTree"
import DocFile from "./DocPanel"
import DocPanel from "./DocPanel";

export default function Notes() {
  const [activePath, setActivePath] = useState<string | null>(null);

  return <div className="noteAppView">
    <SidePanel side="left">
    <FileTree setActivePath={setActivePath}/>
    </SidePanel>
    <DocPanel activePath={activePath}/>
    <SidePanel side="right" />
  </div>
}
