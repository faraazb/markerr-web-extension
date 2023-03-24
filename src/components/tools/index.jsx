import Draggable from "react-draggable";
import { useStore } from "../../store";
import {
    CursorPointer,
    DragHandle,
    RectangleTool,
    Screenshot,
    Spline,
} from "../../utils/icons";

const tools = [
    { id: 1, Icon: <CursorPointer /> },
    { id: 2, Icon: <RectangleTool height={"24px"} /> },
    { id: 3, Icon: <Spline /> },
    { id: 4, Icon: <Screenshot />, onClick: takeFullPageScreenshot },
];

async function captureTab() {
    const imgDataUrl = await chrome.tabs.captureVisibleTab({ format: "png" });
    return imgDataUrl;
}

// function* Scroll() {
//     let top =
//         document.documentElement.scrollTop ||
//         window.scrollY ||
//         window.pageYOffset ||
//         document.scrollingElement.scrollTop;
//     let wIH = 10;
//     let pH = 100;

//     let cH =
    
// }

function takeFullPageScreenshot() {

    // hide Markerr UI elements, keep the canvas (#markerr-app-container)
    let markerrElements = ["markerr-tools-container", "markerr-inspector"];

    markerrElements.forEach((elementId) => {
        const element = document.getElementById(elementId);
        if (element) {
            element.style.display = "none";
        }
    });
}

const Tools = () => {
    const [selectedTool, setSelectedTool] = useStore.selectedTool();

    return (
        <Draggable handle="#markerr-drag-handle">
            <div id="markerr-tools" className={"markerr-panel"} tabIndex={-1}>
                <div id="markerr-drag-handle" className="drag-handle">
                    <span className="panel-drag-handle">
                        <DragHandle transform={"rotate(90)"} />
                    </span>
                </div>
                {tools.map(({ id, Icon, onClick }) => {
                    return (
                        <button
                            tabIndex={-1}
                            key={`markerr-tool-${id}`}
                            className={`tool-button${
                                id === selectedTool
                                    ? " " + "tool-button--selected"
                                    : ""
                            }`}
                            onClick={onClick || (() => {
                                document.activeElement.blur();
                                setSelectedTool(id)
                            })}
                        >
                            <span className="tool-button__icon">{Icon}</span>
                        </button>
                    );
                })}
            </div>
        </Draggable>
    );
};

export default Tools;
