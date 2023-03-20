import { initApp } from "../app";

console.log("Content script loaded");




function init() {
    return new Promise((resolve, reject) => {
        initApp();
        resolve({ ok: true });
    })
}


const popupPort = chrome.runtime.connect({ name: "content-popup" });

chrome.runtime.onConnect.addListener((port) => {
    port.onMessage.addListener((message) => {
        const { action, payload } = message;
        if (action in handlers) {
            handlers[action](payload).then((v) => popupPort.postMessage(v));
        }
    });
})

const handlers = {
    "INIT": init
}

