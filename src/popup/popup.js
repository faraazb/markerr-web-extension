import { h, render } from "preact";
import { useState, useEffect } from "preact/hooks";
import el from "../utils/element";

const popupRoot = el("div#popupRoot");
document.body.appendChild(popupRoot);

const Popup = () => {
    const [port, setPort] = useState(null);

    useEffect(() => {
        (async () => {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            console.log(tab);
            const port = await chrome.tabs.connect(tab.id);
            setPort(port);
        })();
    }, []);

    const initPanel = () => {
        console.log("initializing panel");
        if (port) {
            port.postMessage({ action: "INIT" });
        }
    }

    return (
        <div id="markerr-popup">
            <div>
                <button onClick={initPanel}>Annotate</button>
            </div>
        </div>
    )
}

render(<Popup />, popupRoot)