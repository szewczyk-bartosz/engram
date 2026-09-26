import { useState } from "react";
import TopBar from "./TopBar";
import {views, ViewTypes} from "./Views";


export default function App() {
  const [activeView, setActiveView] = useState<ViewTypes>("notes");
  let View = views[activeView];
      

  return (
    <>
      <TopBar />
      <View />
      <div></div>
    </>
  );
}
