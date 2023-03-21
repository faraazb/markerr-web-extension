import { useEffect } from "preact/hooks";
import Konva from "konva";
import "theroomjs/dist/theroom.min.js";
import { tools, useStore } from "../../store";
import el from "../../utils/element";

let tool = null;

const Board = () => {
    const [selectedTool] = useStore.selectedTool();

    useEffect(() => {
        console.log("Board rendered");
        const drawRectangle = initCanvas();
        if (theRoom) {
            theRoom.configure({
                inspector: "#markerr-inspector",
                excludes: ["#markerr-tools-container *"],
                blockRedirection: true,
                click: function (element, event) {
                    event.preventDefault();
                    //   TODO Resolve inspect on tools panel
                    const { x, y, top, left, width, height } =
                        element.getBoundingClientRect();
                    drawRectangle({
                        x: x + window.scrollX,
                        y: y + window.scrollY,
                        width,
                        height,
                        node: element,
                    });
                },
            });
        }
    }, []);

    useEffect(() => {
        console.log("Tool changed");
        tool = selectedTool;
        const markerrAppContainer = document.getElementById(
            "markerr-app-container"
        );
        if (selectedTool === tools.ELEMENT_PICKER) {
            // disable pointer events on canvas container
            if (markerrAppContainer) {
                markerrAppContainer.style.pointerEvents = "none";
            }
            const markerrInspectorEl =
                document.getElementById("markerr-inspector");
            if (markerrInspectorEl) {
                markerrInspectorEl.style.display = "block";
            }
            theRoom.start();
            return;
        } else {
            theRoom.stop();
            // enable pointer events on canvas
            if (markerrAppContainer) {
                markerrAppContainer.style.pointerEvents = "auto";
            }
            const markerrInspectorEl =
                document.getElementById("markerr-inspector");
            if (markerrInspectorEl) {
                markerrInspectorEl.style.display = "none";
            }
        }
    }, [selectedTool]);

    return (
        <>
            <div id="markerr-canvas-container"></div>
        </>
    );
};

const initCanvas = () => {
    const markerrAppContainer = document.getElementById(
        "markerr-app-container"
    );

    let width = window.innerWidth;
    let height = window.innerHeight;

    width = document.documentElement.scrollWidth;
    height = document.documentElement.scrollHeight;

    let selectedShapes = [];

    // Set up the canvas and shapes
    let stage = new Konva.Stage({
        container: "markerr-canvas-container",
        width: width,
        height: height,
    });
    let layer = new Konva.Layer({ draggable: false });

    stage.add(layer);
    stage.draw();

    let transformer = new Konva.Transformer({ ignoreStroke: true });
    layer.add(transformer);

    const stageContainer = stage.container();
    stageContainer.tabIndex = 1;

    // draw a dotted rectangle preview
    let draftRectangle = new Konva.Rect({
        x: 0,
        y: 0,
        width: 0,
        height: 0,
        stroke: "red",
        dash: [2, 2],
    });
    draftRectangle.listening(false);
    layer.add(draftRectangle);

    // selection rectangle
    let selectionRectangle = new Konva.Rect({
        fill: "rgba(113, 52, 205, 0.1)",
        stroke: "rgba(113, 52, 205)",
        strokeWidth: 1,
        visible: false,
    });
    layer.add(selectionRectangle);

    // keyboard events - delete
    stageContainer.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" || e.key === "Delete") {
            e.preventDefault();
            selectedShapes.forEach((shape) => {
                shape.markerrLabel.remove();
                if (shape.node) {
                    shape.node.dataset.markerr = "deleted";
                }
                if (shape.markerrSelectSimilarButton) {
                    shape.markerrSelectSimilarButton.remove();
                }
                shape.destroy();
            });
            selectShapes([]);
        }
    });

    stage.draw();

    let dragStartPosition;
    let dragEndPosition;
    let mode = "";

    // these drag functions are probably tool specific
    function startDrag(position) {
        dragStartPosition = { x: position.x, y: position.y };
        dragEndPosition = { x: position.x, y: position.y };
    }

    function updateDrag(position) {
        dragEndPosition = { x: position.x, y: position.y };
        let rectPosition = reverse(dragStartPosition, dragEndPosition);
        draftRectangle.x(rectPosition.x1);
        draftRectangle.y(rectPosition.y1);
        draftRectangle.width(rectPosition.x2 - rectPosition.x1);
        draftRectangle.height(rectPosition.y2 - rectPosition.y1);
        draftRectangle.visible(true);

        stage.draw();
    }

    function selectElementsByClassName(className) {
        const elements = document.getElementsByClassName(className);
        if (elements.length > 0) {
            for (let element of elements) {
                if (element.dataset?.markerr !== "true") {
                    const { x, y, width, height } =
                        element.getBoundingClientRect();
                    const rectangle = drawRectangle({
                        x: x + window.scrollX,
                        y: y + window.scrollY,
                        width,
                        height,
                        node: element,
                        focusLabel: false,
                    });
                }
            }
        }
    }

    function drawRectangle({
        x,
        y,
        width,
        height,
        node,
        focusLabel = true,
        ...rest
    }) {
        const newRect = new Konva.Rect({
            name: "rect",
            x: x,
            y: y,
            width: width,
            height: height,
            stroke: "red",
            strokeWidth: 2,
            listening: true,
            draggable: true,
            strokeScaleEnabled: false,
            rest,
        });

        const label = el("input.markerr-annotation-label", {
            type: "text",
            style: `position: absolute; 
                top: ${y + height + 5}px; 
                left: ${x}px; 
                z-index: 9999999;`,
            placeholder: "label",
        });

        newRect.markerrLabel = label;
        markerrAppContainer.appendChild(label);

        if (node) {
            newRect.node = node;
            node.dataset.markerr = true;
            const { y: labelY, height: labelHeight } =
                label.getBoundingClientRect();
            const selectSimilarButton = el(
                "button.markerr-select-by-class-button",
                {
                    style: `display: none;
                        position: absolute;
                        top: ${labelY + labelHeight + window.scrollY + 2}px;
                        left: ${x}px; z-index: 9999999;`,
                    onclick: () => selectElementsByClassName(node.className),
                },
                "Annotate similar"
            );

            newRect.markerrSelectSimilarButton = selectSimilarButton;

            markerrAppContainer.appendChild(selectSimilarButton);
        }

        let hideSimilarTimeout;
        newRect.on("mouseover", (event) => {
            // clearTimeout(hideSimilarTimeout);
            const { markerrSelectSimilarButton: selectSimilarButton } = newRect;
            if (selectSimilarButton) {
                selectSimilarButton.style.display = "block";
            }
            if (label.value === "") {
                label.style.display = "block";
                label.placeholder = "label";
            }
        });

        newRect.on("mouseleave", (event) => {
            const { markerrSelectSimilarButton: selectSimilarButton } = newRect;

            clearTimeout(hideSimilarTimeout);
            hideSimilarTimeout = setTimeout(() => {
                if (selectSimilarButton) {
                    selectSimilarButton.style.display = "none";
                }
                if (label.value === "") {
                    label.style.display = "none";
                }
            }, 1500);
        });

        newRect.on("transform", (event) => {
            label.style.top = `${
                newRect.y() + newRect.height() * newRect.scaleY() + 5
            }px`;
            label.style.left = `${newRect.x()}px`;

            // disable select similar button when el annotation is moved
            if (newRect.markerrSelectSimilarButton) {
                newRect.markerrSelectSimilarButton.remove();
                newRect.markerrSelectSimilarButton = undefined;
            }

            if (newRect.node) {
                newRect.node.dataset.markerr = "moved";
            }
        });

        newRect.on("dragmove", (event) => {
            // const { x, y } = newRect.getAbsolutePosition();
            label.style.top = `${
                newRect.y() + newRect.height() * newRect.scaleY() + 5
            }px`;
            label.style.left = `${newRect.x()}px`;

            // disable select similar button when el annotation is moved
            if (newRect.markerrSelectSimilarButton) {
                newRect.markerrSelectSimilarButton.remove();
                newRect.markerrSelectSimilarButton = undefined;
            }

            if (newRect.node) {
                newRect.node.dataset.markerr = "moved";
            }
        });

        layer.add(newRect);
        stage.draw();
        if (focusLabel) {
            label.focus();
        } else {
            label.style.display = "none";
        }
    }

    // drag from and to positions
    let x1, y1, x2, y2;
    stage.on("mousedown touchstart", (e) => {
        // do nothing if we mousedown on any shape
        if (e.target !== stage) {
            return;
        }
        e.evt.preventDefault();

        if (mode !== "drawing") {
            mode = "drawing";
            if (tool === 2) {
                startDrag({ x: e.evt.layerX, y: e.evt.layerY });
                return;
            }
        }
        mode = "selecting";
        x1 = stage.getPointerPosition().x;
        y1 = stage.getPointerPosition().y;
        x2 = stage.getPointerPosition().x;
        y2 = stage.getPointerPosition().y;

        selectionRectangle.visible(true);
        selectionRectangle.width(0);
        selectionRectangle.height(0);
    });

    stage.on("mousemove touchmove", (e) => {
        if (mode === "drawing") {
            if (tool === 2) {
                updateDrag({ x: e.evt.layerX, y: e.evt.layerY });
                return;
            }
        }
        // do nothing if we didn't start selection
        if (!selectionRectangle.visible()) {
            return;
        }
        e.evt.preventDefault();

        // update drag to position
        x2 = stage.getPointerPosition().x;
        y2 = stage.getPointerPosition().y;

        selectionRectangle.setAttrs({
            x: Math.min(x1, x2),
            y: Math.min(y1, y2),
            width: Math.abs(x2 - x1),
            height: Math.abs(y2 - y1),
        });
    });

    stage.on("mouseup touchend", (e) => {
        if (mode === "drawing") {
            mode = "";
            if (tool === 2) {
                draftRectangle.visible(false);
                drawRectangle({
                    x: draftRectangle.x(),
                    y: draftRectangle.y(),
                    width: draftRectangle.width(),
                    height: draftRectangle.height(),
                });
                return;
            }
        }

        // do nothing if we didn't start selection
        if (!selectionRectangle.visible()) {
            return;
        }

        mode = "";
        e.evt.preventDefault();

        // update visibility in timeout, so we can check it in click event
        setTimeout(() => {
            selectionRectangle.visible(false);
        });

        let shapes = stage.find(".rect");
        let box = selectionRectangle.getClientRect();
        const nodes = shapes.filter((shape) =>
            Konva.Util.haveIntersection(box, shape.getClientRect())
        );
        selectShapes(nodes);

        // nothing selected, clicked on stage, remove focus from annotation label
        if (nodes.length === 0) {
            if (document.activeElement instanceof HTMLInputElement) {
                document.activeElement.blur();
            }
        }
    });

    // clicks should select/deselect shapes
    stage.on("click tap", function (e) {
        // if we are selecting with rect, do nothing
        if (selectionRectangle.visible()) {
            return;
        }

        // if click on empty area - remove all selections
        if (e.target === stage) {
            stageContainer.focus();
            selectShapes([]);
            return;
        }

        // Rectangle shape name mismatch
        if (!e.target.hasName("rect")) {
            return;
        }

        const metaPressed = e.evt.shiftKey || e.evt.ctrlKey || e.evt.metaKey;
        const isSelected = transformer.nodes().indexOf(e.target) >= 0;

        if (!metaPressed && !isSelected) {
            // select single shape
            selectShapes([e.target]);
        } else if (metaPressed && isSelected) {
            // remove selected node if meta key is pressed
            const nodes = transformer.nodes().slice();
            nodes.splice(nodes.indexOf(e.target), 1);
            selectShapes(nodes);
        } else if (metaPressed && !isSelected) {
            // add a node to selectedShapes
            const nodes = transformer.nodes().concat([e.target]);
            selectShapes(nodes);
        }
    });

    function selectShapes(shapes) {
        selectedShapes = shapes;
        transformer.nodes(shapes);
    }

    // reverse co-ords if user drags left / up
    function reverse({ x: x1, y: y1 }, { x: x2, y: y2 }) {
        let d;
        if (x1 > x2) {
            d = Math.abs(x1 - x2);
            x1 = x2;
            x2 = x1 + d;
        }
        if (y1 > y2) {
            d = Math.abs(y1 - y2);
            y1 = y2;
            y2 = y1 + d;
        }
        return { x1, y1, x2, y2 };
    }

    return drawRectangle;
};

export default Board;
