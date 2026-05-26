/**
 * MATH & UTILITY FUNCTIONS
 */

function getDist(p1, p2) {
    return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

function isOpenHand(hand) {
    if (!hand) return false;
    const d8 = getDist(hand[0], hand[8]), d5 = getDist(hand[0], hand[5]);
    const d12 = getDist(hand[0], hand[12]), d9 = getDist(hand[0], hand[9]);
    const d16 = getDist(hand[0], hand[16]), d13 = getDist(hand[0], hand[13]);
    const d20 = getDist(hand[0], hand[20]), d17 = getDist(hand[0], hand[17]);
    return d8 > d5 && d12 > d9 && d16 > d13 && d20 > d17;
}

// Convert normalized landmark to specific canvas scale (Note: canvas is horizontally flipped)
function mapToCanvas(point) {
    return { x: point.x * width, y: point.y * height };
}

/**
 * 3D Perspective Projection with volumetric depth details
 */
function project(p, size, rx, ry, rz) {
    let x = p[0], y = p[1], z = p[2];
    
    // Rotate X
    let cy = y * Math.cos(rx) - z * Math.sin(rx);
    let cz = y * Math.sin(rx) + z * Math.cos(rx);
    y = cy; z = cz;
    
    // Rotate Y
    let cx = x * Math.cos(ry) + z * Math.sin(ry);
    cz = -x * Math.sin(ry) + z * Math.cos(ry);
    x = cx; z = cz;
    
    // Rotate Z
    cx = x * Math.cos(rz) - y * Math.sin(rz);
    cy = x * Math.sin(rz) + y * Math.cos(rz);
    x = cx; y = cy;
    
    // Perspective Divide (Add depth volume)
    let fov = 4; // Virtual camera distance
    let scale = fov / (fov + z);
    if (scale < 0) scale = 0; // Behind camera
    
    // Volumetric Depth
    let alpha = Math.min(1, Math.max(0.1, scale)); 
    let blur = Math.min(50, Math.max(10, 30 + (1 - scale) * 20));
    
    return {
        x: x * size * scale, 
        y: y * size * scale, 
        z: z * size, 
        scale: scale, 
        alpha: alpha, 
        blur: blur
    };
}
