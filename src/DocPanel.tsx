import { useState, useEffect, useRef } from "react";
import { trackedFetch } from "./ActivityLog";
import { useActivityLog } from "./ActivityLogContext";

interface BottomBarProps {
  activePath: string | null;
}

export default function DocPanel({ activePath }: BottomBarProps) {
  const [currentDoc, setDoc] = useState("");
  const {activityLogFunc} = useActivityLog();
  useEffect(() => {
    if (activePath) {
      trackedFetch("/api/files/" + activePath, activityLogFunc)
        .then((r) => r.text())
        .then((html) => setDoc(html));
    }
  }, [activePath]);

  const docRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const doc = docRef.current;
    if (!doc) return;
    let cancelled = false;

    const codeBlocks = doc.querySelectorAll("code");
    if (codeBlocks.length > 0) {
      import("prismjs")
        .then(async ({ default: Prism }) => {
          await import("prismjs/components/prism-python");
          if (cancelled) return;
          codeBlocks.forEach((element) => Prism.highlightElement(element));
        });
    }

    const mathBlocks = doc.querySelectorAll<HTMLElement>(".math-block");
    if (mathBlocks.length > 0) {
      Promise.all([import("katex"), import("katex/dist/katex.css")])
        .then(([{ default: katex }]) => {
          if (cancelled) return;
          mathBlocks.forEach((el) => {
            katex.render(el.dataset.latex ?? "", el, {
              displayMode: true,
              throwOnError: false,
            });
          });
        });
    }

    return () => {
      cancelled = true;
    };
  }, [currentDoc]);

  return (
    <div id="doc-frame" className="engram-doc">
      <div
        className="engram-doc"
        id="engram-doc"
        ref={docRef}
        data-doc-name={activePath?.split("/").at(-1) ?? ""}
        dangerouslySetInnerHTML={{ __html: currentDoc ?? "" }}
      />
    </div>
  );
}
