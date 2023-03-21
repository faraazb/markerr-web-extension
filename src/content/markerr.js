import { initApp } from "../app";

console.log("Content script loaded");


let isMarkerrActive = false;

function init() {
    return new Promise((resolve, reject) => {
        if (isMarkerrActive) {
            resolve({ ok: true });
            return;
        }
        try {
            isMarkerrActive = true;
            initApp();
            resolve({ ok: true });
        } catch (err) {
            reject({ ok: false, error: err.message });
        }
    })
}


// chrome.runtime.onConnect.addListener((port) => {
//     port.onMessage.addListener((message) => {
//         const { action, payload } = message;
//         if (action in handlers) {
//             handlers[action](payload).then((v) => port.postMessage(v));
//         }
//     });
// })

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const { action, payload } = message;
    if (action in handlers) {
        handlers[action](payload).then((v) => sendResponse(v));
    }
    return true;
});

const handlers = {
    "INIT": init
}

