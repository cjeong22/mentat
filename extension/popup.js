document.getElementById("go").addEventListener("click", () => {
    // Send a message to the background to inject the content script
    chrome.runtime.sendMessage({ action: "startAreaSelection" });
    window.close();
});