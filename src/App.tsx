import { act, useState } from "react";
import TopBar from "./TopBar";
import BottomBar from "./BottomBar"
import {views, ViewTypes} from "./Views";
import BootScreen from "./BootScreen";
        

export default function App() {
  const [activeView, setActiveView] = useState<ViewTypes>("notes");
  let View = views[activeView];
      

  return (
    <>
      <BootScreen />
      <TopBar activeView={activeView} setActiveView={setActiveView} />
      <View />
      <BottomBar activeView={activeView} setActiveView={setActiveView} />
    </>
  );
}
