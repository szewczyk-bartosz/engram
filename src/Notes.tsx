import { act, useState } from "react";
import {views, ViewTypes} from "./Views";
import SidePanel from "./SidePanel" 

export default function Notes() {
  const [activePath, setActivePath] = useState<string | null>(null);
  return <div className="noteAppView">
    <SidePanel side="left" />
    <div id="doc-frame" className="engram-doc"><div className="engram-doc" id="engram-doc">Example text goes here</div></div>
    <SidePanel side="right" />
  </div>
}
