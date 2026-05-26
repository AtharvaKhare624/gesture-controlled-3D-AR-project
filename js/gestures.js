/**
 * GESTURE DETECTION ENGINE
 */

let lastPinchState = [false, false]; // Prevents rapid re-triggering

function detectGestures() {
    // Reset missing hands' pinch states to prevent getting stuck
    for (let i = currentHands.length; i < 2; i++) {
        lastPinchState[i] = false;
    }

    if (!currentHands.length) return;
    
    currentHands.forEach((hand, idx) => {
        // Pinch Detection: Thumb (4) and Index (8)
        const thumb = hand[4];
        const index = hand[8];
        const dist = getDist(thumb, index);
        
        const isPinching = dist < 0.05; // 5% of screen screen distance
        
        if (isPinching && !lastPinchState[idx]) {
            const midpoint = {
                x: (thumb.x + index.x) / 2, 
                y: (thumb.y + index.y) / 2
            };
            uiGesture.innerText = "PINCH !";
        }
        lastPinchState[idx] = isPinching;
    });

    // Spread Percentage roughly estimated by distance from Palm(0) to Index(8) and Pinky(20)
    if (currentHands[0]) {
        const spread = getDist(currentHands[0][8], currentHands[0][20]);
        // Normalizing spread so max is around 100%
        let spreadPct = Math.min(Math.round(spread * 300), 100);
        uiSpread.innerText = spreadPct + '%';
        if (!lastPinchState.includes(true)) {
            uiGesture.innerText = isOpenHand(currentHands[0]) ? "Open Hand" : "Fist";
        }
    }
}
