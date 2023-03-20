import { render } from "preact";
import Board from "./components/board";
import Tools from "./components/tools";
import el from "./utils/element";

const initApp = () => {
  const appContainer = el("div#markerr-app-container", {
    style: "top: 0;",
  });
  document.body.appendChild(appContainer);

  const toolsContainer = el("div#markerr-tools-container");
  document.body.appendChild(toolsContainer);

  const inspectorEl = el("div#markerr-inspector.markerr-inspector-element");
  document.body.appendChild(inspectorEl);

  render(<Board />, appContainer);
  render(<Tools />, toolsContainer);
};

export { initApp };
