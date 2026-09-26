import { act, useState } from "react";
import TopBar from "./TopBar";
import BottomBar from "./BottomBar"
import {views, ViewTypes} from "./Views";
        

export default function App() {
  const [activeView, setActiveView] = useState<ViewTypes>("notes");
  let View = views[activeView];
      

  return (
    <>
      <TopBar activeView={activeView} setActiveView={setActiveView} />
      <View />
      <BottomBar activeView={activeView} setActiveView={setActiveView} />
    </>
  );
}
