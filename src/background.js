
chrome.contextMenus.create({
    id: "markerr-cm-1",
    title: "Annotate with Simple Markerr"
});

chrome.contextMenus.onClicked.addListener(
    async (_info, tab) => {
        // const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        const response = await chrome.tabs.sendMessage(tab.id, { action: "INIT" });
    }
)