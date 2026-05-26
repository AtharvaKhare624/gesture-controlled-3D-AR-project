/**
 * INITIALIZATION & CONTROLLERS
 */

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    bgCanvas.width = width;
    bgCanvas.height = height;
    mainCanvas.width = width;
    mainCanvas.height = height;
    
    maxColumns = Math.floor(width / fontSize);
    matrixColumns = new Array(maxColumns).fill(1).map(() => Math.random() * height/fontSize);
    if (!selectedShape) {
        currentShapeX = targetShapeX = width / 2;
        currentShapeY = targetShapeY = height / 2;
    }
}
window.addEventListener('resize', resize);
resize();

// UI Shape Switcher
document.querySelectorAll('.shape-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        if (e.target.classList.contains('active')) {
            e.target.classList.remove('active');
            selectedShape = null;
            return;
        }
        document.querySelectorAll('.shape-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        selectedShape = e.target.getAttribute('data-shape');
    });
});

let renderLoopStarted = false;

// Start button triggers AudioContext and hides overlay
document.getElementById('startBtn').addEventListener('click', () => {
    document.getElementById('startOverlay').classList.add('hidden');
    document.getElementById('hud').classList.remove('hidden');
    document.getElementById('shapeSelector').classList.remove('hidden');
    initAudio();
    initMediaPipe();
});

/**
 * MEDIAPIPE INITIALIZATION
 */
function initMediaPipe() {
    const hands = new Hands({locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
    }});

    hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1, 
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7
    });

    hands.onResults((results) => {
        if (!audioCtx) return; // Wait for initialization

        // Update global state for render loop to read from
        uiHands.innerText = results.multiHandLandmarks ? results.multiHandLandmarks.length : 0;
        
        // Calculate velocity (rudimentary)
        if (currentHands.length > 0 && results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
            let vSum = 0;
            // check distance difference on index finger of hand 0 
            const oldP = currentHands[0][8];
            const newP = results.multiHandLandmarks[0][8];
            if (oldP && newP) {
                vSum += getDist(oldP, newP);
                handVelocities = vSum; 
            }
        } else {
            handVelocities = 0;
        }

        currentHands = results.multiHandLandmarks || [];
        updateHum(currentHands);
    });

    const camera = new Camera(videoElement, {
        onFrame: async () => {
            await hands.send({image: videoElement});
        },
        width: 1280,
        height: 720,
        facingMode: 'user'
    });
    
    console.log("Camera starting...");
    camera.start()
        .then(() => {
            if (!renderLoopStarted) {
                renderLoopStarted = true;
                requestAnimationFrame(renderLoop);
            }
        })
        .catch(err => {
            console.error("Camera start failed: ", err);
            alert("Camera initialization failed. Please check permissions.");
        });
}
