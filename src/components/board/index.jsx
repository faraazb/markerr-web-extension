import { useEffect, useRef } from "preact/hooks";
import Konva from "konva";
import "theroomjs/dist/theroom.min.js";
import { getStore, tools, useStore } from "../../store";
import el from "../../utils/element";
import { render } from "preact";
import Combobox, { LabelCombobox } from "../combobox";
import Rectangle from "../../canvas/rectangle";

let toolId = null;

function isFixedOrSticky(node) {
    while (node && node.nodeName.toLowerCase() !== "body") {
        let position = window
            .getComputedStyle(node)
            .getPropertyValue("position")
            .toLowerCase();
        if (position === "fixed" || position === "sticky") {
            return { result: false, node };
        }
        node = node.parentNode;
    }
    return { result: true, node };
}

const Board = () => {
    const [labels, setLabels] = useStore.labels();
    const [selectedTool] = useStore.selectedTool();
    const [nodes, setNodes] = useStore.nodes();
    const canvasContainer = useRef();

    useEffect(() => {
        console.log("Board rendered");
        const [drawRectangle] = initCanvas(nodes, setNodes);
        if (theRoom) {
            theRoom.configure({
                inspector: "#markerr-inspector",
                excludes: ["#markerr-tools-container *"],
                blockRedirection: true,
                click: function (element, event) {
                    // console.log(event)
                    event.preventDefault();
                    event.stopPropagation();
                    const { result, node } = isFixedOrSticky(element);
                    console.log("picked element fixed or sticky", result, node);
                    // console.log(result, node);
                    // if (result === false) {
                    //     node.style.position = "static";
                    // }
                    const { x, y, top, left, width, height } =
                        element.getBoundingClientRect();
                    drawRectangle({
                        x: x + window.scrollX,
                        y: y + window.scrollY,
                        width,
                        height,
                        element,
                        adjustOnScroll: !result,
                    });
                },
                // hook: function (event) {
                //     event.preventDefault();
                //     if (event.target instanceof HTMLButtonElement) {
                //         console.log(event.target);
                //         console.log("is button");
                //         return false;
                //     }
                // },
            });
        }
    }, []);

    useEffect(() => {
        console.log("Tool changed");
        toolId = selectedTool;
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
        // canvasContainer.current.focus();
    }, [selectedTool]);

    return (
        <>
            <div ref={canvasContainer} id="markerr-canvas-container"></div>
        </>
    );
};

const initCanvas = () => {
    // const [labels, setLabels] = getStore.labels();
    // const [toolId] = getStore.selectedTool();
    const [tool, setTool] = getStore.selectedTool();
    const scrollAdjustNodes = [];

    const markerrAppContainer = document.getElementById(
        "markerr-app-container"
    );

    const body = document.body;
    const html = document.documentElement;
    let height = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight
    );
    let width = Math.max(
        body.scrollWidth,
        body.offsetWidth,
        html.clientWidth,
        html.scrollWidth,
        html.offsetWidth
    );

    // let width = document.documentElement.scrollWidth;
    // let height = document.documentElement.scrollHeight;

    let selectedShapes = [];

    // Set up the canvas and shapes
    let stage = new Konva.Stage({
        container: "markerr-canvas-container",
        width: width,
        height: height,
    });
    let layer = new Konva.Layer({ draggable: false });
    // let secondaryLayer = new Konva.Layer({ draggable: false });
    // secondaryLayer.size({
    //     height: 100,
    //     width: 100,
    // });
    // console.log(secondaryLayer.height());

    stage.add(layer);
    // stage.add(secondaryLayer);
    stage.draw();

    let transformer = new Konva.Transformer({ ignoreStroke: true });
    layer.add(transformer);

    const stageContainer = stage.container();
    stageContainer.tabIndex = 1;

    document.addEventListener("scroll", (event) => {
        scrollAdjustNodes.forEach((node) => {
            const { x, y, top, left } = node.element.getBoundingClientRect();
            const { height } =
                node.markerrNodeLabelContainer.getBoundingClientRect();
            // console.log(y + window.scrollY);
            node.position({ x: x, y: y + window.scrollY });
            node.markerrNodeLabelContainer.style.top = `${top - height - 5}px`;
            // maybe apply the position related propeties of the
            // parent node that was sticky or fixed
            node.markerrNodeLabelContainer.style.position = "fixed";

            if (node.markerrSelectSimilarButton) {
            }
        });
    });

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
                shape.markerrNodeLabelContainer.remove();
                if (shape.node) {
                    shape.node.dataset.markerr = "deleted";
                }
                if (shape.markerrSelectSimilarButton) {
                    shape.markerrSelectSimilarButton.remove();
                }
                shape.destroy();
            });
            selectShapes([]);
        } else if (e.key === "v") {
            setTool(1);
        } else if (e.key === "r") {
            setTool(2);
        } else if (e.key === "p") {
            setTool(3);
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
        element,
        focusLabel = true,
        adjustOnScroll = false,
        ...rest
    }) {
        console.log("Drawing");
        const newRect = new Konva.Rect({
            name: "rect",
            x: x,
            y: y,
            width: width,
            height: height,
            stroke: "red",
            strokeWidth: 4,
            listening: true,
            draggable: true,
            strokeScaleEnabled: false,
            rest,
        });

        newRect.markerrId = crypto.randomUUID();
        newRect.markerrLabel = "";

        const labelContainer = el(`div#${newRect.markerrId}`, {
            style: `position: absolute; 
                top: ${y + height + 5}px; 
                left: ${x}px; 
                z-index: 9999999;`,
        });
        newRect.markerrNodeLabelContainer = labelContainer;
        markerrAppContainer.appendChild(labelContainer);

        render(
            <LabelCombobox
                setLabelTitle={(title) => (newRect.markerrLabel = title)}
            />,
            labelContainer
        );

        const { y: labelY, height: labelHeight } =
            labelContainer.getBoundingClientRect();

        labelContainer.style.top = `${y - labelHeight - 5}px`;

        if (element) {
            newRect.element = element;
            element.dataset.markerr = true;
            const selectSimilarButton = el(
                "button.markerr-select-by-class-button",
                // labelY + labelHeight + window.scrollY + 2
                {
                    style: `display: none;
                        position: absolute;
                        top: ${y + height + 5}px;
                        left: ${x}px; z-index: 9999999;`,
                    onclick: () => selectElementsByClassName(element.className),
                },
                "Annotate similar"
            );

            newRect.markerrSelectSimilarButton = selectSimilarButton;

            markerrAppContainer.appendChild(selectSimilarButton);

            if (adjustOnScroll) {
                scrollAdjustNodes.push(newRect);
            }
        }

        let hideSimilarTimeout;
        newRect.on("mouseover", (event) => {
            clearTimeout(hideSimilarTimeout);
            const { markerrSelectSimilarButton: selectSimilarButton } = newRect;
            if (selectSimilarButton) {
                selectSimilarButton.style.display = "block";
            }
            if (newRect.markerrLabel === "") {
                labelContainer.style.display = "block";
                labelContainer.placeholder = "Add a label";
            }
        });

        newRect.on("mouseleave", (event) => {
            const { markerrSelectSimilarButton: selectSimilarButton } = newRect;

            clearTimeout(hideSimilarTimeout);
            hideSimilarTimeout = setTimeout(() => {
                if (selectSimilarButton) {
                    selectSimilarButton.style.display = "none";
                }
                if (newRect.markerrLabel === "") {
                    labelContainer.style.display = "none";
                }
            }, 1500);
        });

        newRect.on("transform", (event) => {
            // newRect.y() + (newRect.height() * newRect.scaleY()) + 5
            labelContainer.style.top = `${newRect.y() - labelHeight - 5}px`;
            labelContainer.style.left = `${newRect.x()}px`;

            // disable select similar button when el annotation is moved
            if (newRect.markerrSelectSimilarButton) {
                newRect.markerrSelectSimilarButton.remove();
                newRect.markerrSelectSimilarButton = undefined;
            }

            if (newRect.element) {
                newRect.element.dataset.markerr = "moved";
            }
        });

        newRect.on("dragmove", (event) => {
            // const { x, y } = newRect.getAbsolutePosition();
            labelContainer.style.top = `${newRect.y() - labelHeight - 5}px`;
            labelContainer.style.left = `${newRect.x()}px`;

            // disable select similar button when el annotation is moved
            if (newRect.markerrSelectSimilarButton) {
                newRect.markerrSelectSimilarButton.remove();
                newRect.markerrSelectSimilarButton = undefined;
            }

            if (newRect.element) {
                newRect.element.dataset.markerr = "moved";
            }
        });

        // if (adjustOnScroll) {
        //     secondaryLayer.add(newRect);
        // } else {
        //     layer.add(newRect);
        // }
        layer.add(newRect);
        stage.draw();

        // const labelInput = document.querySelector(`#${newRect.markerrId} input`);
        // if (labelInput && labelInput instanceof HTMLInputElement) {
        //     if (focusLabel) {
        //         labelInput.focus();
        //     } else {
        //         labelInput.style.display = "none";
        //     }
        // }
    }

    // drag from and to positions
    let x1, y1, x2, y2;

    stage.on("mousedown touchstart", (e) => {
        // do nothing if we mousedown on any shape
        if (e.target !== stage) {
            return;
        }
        e.evt.preventDefault();

        if (toolId === 1) {
            mode = "selecting";
            x1 = stage.getPointerPosition().x;
            y1 = stage.getPointerPosition().y;
            x2 = stage.getPointerPosition().x;
            y2 = stage.getPointerPosition().y;

            selectionRectangle.visible(true);
            selectionRectangle.width(0);
            selectionRectangle.height(0);
            return;
        } else if (mode !== "drawing") {
            mode = "drawing";
            if (toolId === 2) {
                startDrag({ x: e.evt.layerX, y: e.evt.layerY });
                return;
            }
        }
    });

    stage.on("mousemove touchmove", (e) => {
        if (mode === "drawing") {
            if (toolId === 2) {
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
        stageContainer.focus();
        if (mode === "drawing") {
            mode = "";
            if (toolId === 2) {
                draftRectangle.visible(false);
                if (
                    draftRectangle.height() < 10 &&
                    draftRectangle.width() < 10
                ) {
                    return;
                }
                drawRectangle({
                    x: draftRectangle.x(),
                    y: draftRectangle.y(),
                    width: draftRectangle.width(),
                    height: draftRectangle.height(),
                });
                draftRectangle.height(0);
                draftRectangle.width(0);
                return;
            }
            return;
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
            // stageContainer.focus();
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

    return [drawRectangle];
};

export default Board;
