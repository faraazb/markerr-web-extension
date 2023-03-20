import { useState } from "preact/hooks";
import Draggable from "react-draggable";
import { useStore } from "../../store";
import {
    CursorPointer,
    DragHandle,
    RectangleTool,
    Spline,
} from "../../utils/icons";

const tools = [
    { id: 1, Icon: <CursorPointer /> },
    { id: 2, Icon: <RectangleTool height={"24px"} /> },
    { id: 3, Icon: <Spline /> },
];

const Tools = () => {
    const [selectedTool, setSelectedTool] = useStore.selectedTool();

    return (
        <Draggable handle="#markerr-drag-handle">
            <div id="markerr-tools" className={"markerr-panel"}>
                <div id="markerr-drag-handle" className="drag-handle">
                    <span className="panel-drag-handle">
                        <DragHandle transform={"rotate(90)"} />
                    </span>
                </div>
                {tools.map(({ id, Icon }) => {
                    return (
                        <button
                            key={`markerr-tool-${id}`}
                            className={`tool-button${
                                id === selectedTool
                                    ? " " + "tool-button--selected"
                                    : ""
                            }`}
                            onClick={() => setSelectedTool(id)}
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
