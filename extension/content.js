

const server = "http://127.0.0.1:5000/receive";
let startX, startY; 
let selectionBox = null;
let iterations = 0;

function onMouseDown(e) {
    startX = e.clientX;
    startY = e.clientY;
    console.log("mouseDown");
    selectionBox = document.createElement('div');
    document.body.style.userSelect = "none";

    selectionBox.style.position = "fixed";
    selectionBox.style.border = "2px dashed red";
    selectionBox.style.background = "rgba(255, 0, 0, 0.2)";
    selectionBox.style.zIndex = "999999";
    selectionBox.style.pointerEvents = "none";
    selectionBox.style.display = "none";

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
    
}

function onMouseMove(e) {
    const x = Math.min(e.clientX, startX);
    const y = Math.min(e.clientY, startY);
    const w = Math.abs(e.clientX - startX);
    const h = Math.abs(e.clientY - startY);

    selectionBox.style.left = `${x}px`;
    selectionBox.style.top = `${y}px`;
    selectionBox.style.width = `${w}px`;
    selectionBox.style.height = `${h}px`;
}

async function onMouseUp(e) {
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
    console.log("mouseUp")
    document.body.style.userSelect = "";
    const x = Math.min(e.clientX, startX);
    const y = Math.min(e.clientY, startY);
    const width = Math.abs(e.clientX - startX);
    const height = Math.abs(e.clientY - startY);

    selectionBox.remove();

    if (width !== 0 && height !== 0) {
        chrome.runtime.sendMessage({
            action: "areaSelected",
        }, (response) => {
            console.log("Screenshot Received.");
            const img = new Image();
            img.onload = async () => {
                const canvas = document.createElement("canvas");
                const scale = window.devicePixelRatio;
                const cropX = x * scale, cropY = y * scale, cropW = width * scale, cropH = height * scale;   
                const ctx = canvas.getContext("2d");
    
                canvas.width = cropW;
                canvas.height = cropH; 
    
                ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
                const base64 = canvas.toDataURL("image/png").split(',')[1];
                iterations++;
                fetch(server, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        image: base64,
                        iterations: iterations
                    })
                })
                .then(res => res.json())
                .then(data => {
                    console.log("Server response:", data);
                    chrome.runtime.sendMessage({ action: "showNotification", message:data["message"] });
                })
            }
            img.src = response.dataUrl;
        });
    }
}

document.addEventListener("mousedown", onMouseDown);