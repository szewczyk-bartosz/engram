export interface PanelButtons {
  toggleLeft: HTMLElement;
  toggleRight: HTMLElement;
  reopenLeft: HTMLElement;
  reopenRight: HTMLElement;
}

/**
 * Left/right pane collapse. State lives in data-left-closed / data-right-closed
 * on the app root; styles.css reads the literal strings "true" and "false".
 */
export function initPanels(app: HTMLElement, buttons: PanelButtons): void {
  const flip = (key: "leftClosed" | "rightClosed") => {
    app.dataset[key] = app.dataset[key] === "true" ? "false" : "true";
  };
  buttons.toggleLeft.addEventListener("click", () => flip("leftClosed"));
  buttons.toggleRight.addEventListener("click", () => flip("rightClosed"));
  buttons.reopenLeft.addEventListener("click", () => (app.dataset.leftClosed = "false"));
  buttons.reopenRight.addEventListener("click", () => (app.dataset.rightClosed = "false"));
}
