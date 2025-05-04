chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "startAreaSelection") {
        console.log("background: starting area selection.")
        chrome.tabs.query({active: true, currentWindow: true}, ([tab]) => {
            chrome.scripting.executeScript({
                target: {tabId: tab.id},
                files: ["content.js"]
            });
        });
    }
    if (message.action === "areaSelected") {
        console.log("background: selected the area.");
        console.log(message.rect);
        chrome.tabs.captureVisibleTab(null, { format: "png" }, (dataUrl) => {
            sendResponse({dataUrl});
        });
        return true;
    }
    if (message.action === "showNotification") {
        chrome.notifications.create({
            type: "basic",
            iconUrl: "Plus_symbol.png",
            title: "Hint: ", 
            message: message.message
        }), (notificationId) => {
            if (chrome.runtime.lastError) {
              console.error("Notification error:", chrome.runtime.lastError.message);
            } else {
              console.log("Notification shown:", notificationId);
            }
        }
        console.log("Notification created");
    }
})
