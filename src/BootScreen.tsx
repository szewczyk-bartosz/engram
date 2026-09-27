import { act, useEffect, useState } from "react";
import TopBar from "./TopBar";
import BottomBar from "./BottomBar"
        

const ascii = `

				███████╗███╗   ██╗ ██████╗ ██████╗  █████╗ ███╗   ███╗
				██╔════╝████╗  ██║██╔════╝ ██╔══██╗██╔══██╗████╗ ████║
				█████╗  ██╔██╗ ██║██║  ███╗██████╔╝███████║██╔████╔██║
				██╔══╝  ██║╚██╗██║██║   ██║██╔══██╗██╔══██║██║╚██╔╝██║
				███████╗██║ ╚████║╚██████╔╝██║  ██║██║  ██║██║ ╚═╝ ██║
				╚══════╝╚═╝  ╚═══╝ ╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝     ╚═╝

`

export default function BootScreen() {
  const [lines, setActiveLines] = useState<string[]>([]);
  const [bootscreenOn, setBootscreen] = useState<boolean>(true);

  useEffect(() => {
    const bootLines = [
      "engram v0.1 loaded...",
      "mounting filesystem...",
      "scanning directories...",
      "renderer ready...",
      "theme set...",
      "watcher attached",
      "launching...",
    ];

    let delay = 0;
    bootLines.forEach((line) => {
      delay += 180;
      setTimeout(() => {
        setActiveLines(prev => [...prev, ("> " +line)])
      }, delay);
    });

    setTimeout(() => {
      setBootscreen(false)
    }, delay + 650);

  }, []);


      

  return (
    <>
		<div className={`boot ${bootscreenOn ? "" : "hidden"}`} id="boot-overlay">
			<pre className="ascii">{ascii}</pre>
			<div className="boot-lines" id="boot-lines">{lines.map((line) => <div key={line}>{line}</div>)}</div>
		</div>
    </>
  );
}
