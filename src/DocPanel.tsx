import { views, ViewTypes } from "./Views";
import { act, useState, useEffect } from "react";

interface BottomBarProps {
  activePath: string | null;
}

export default function DocPanel({ activePath }: BottomBarProps) {
  const [currentDoc, setDoc] = useState("");
  useEffect(() => {
    if (activePath) {
      fetch("/api/files/" + activePath)
        .then((r) => r.text())
        .then((html) => setDoc(html));
    }
    console.log(activePath);
  }, [activePath]);

  return (
    <div id="doc-frame" className="engram-doc">
      <div
        className="engram-doc"
        id="engram-doc"
        dangerouslySetInnerHTML={{ __html: currentDoc ?? "" }}
      />
    </div>
  );
}
