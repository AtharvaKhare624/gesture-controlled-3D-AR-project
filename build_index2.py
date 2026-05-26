import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace(
    '<button class="shape-btn" data-shape="cone">Cone</button>',
    '<button class="shape-btn" data-shape="cone">Cone</button>\n        <button class="shape-btn" data-shape="planet">Planet</button>'
)

var_decl = """// Shape Config
let selectedShape = null;
let currentShapeX = window.innerWidth / 2;
let currentShapeY = window.innerHeight / 2;
let targetShapeX = window.innerWidth / 2;
let targetShapeY = window.innerHeight / 2;
let isPrecisionPinching = false;
let startPinchMid = {x:0, y:0};
let startPinchDist = 1;
let startPinchAngle = 0;
let startShapeCenter = {x:0, y:0};
let startShapeSize = 100;
let startShapeRotation = 0;
let currentShapeSize = 100;
let targetShapeSize = 100;
let currentShapeRotation = 0;
let targetShapeRotation = 0;"""

content = re.sub(r'// Shape Config.*?let targetShapeRotation = 0;', var_decl, content, flags=re.DOTALL)

resize_update = """    maxColumns = Math.floor(width / fontSize);
    matrixColumns = new Array(maxColumns).fill(1).map(() => Math.random() * height/fontSize);
    if (!selectedShape) {
        currentShapeX = targetShapeX = width / 2;
        currentShapeY = targetShapeY = height / 2;
    }"""
content = content.replace(
    '    matrixColumns = new Array(maxColumns).fill(1).map(() => Math.random() * height/fontSize);',
    resize_update
)

planet_shape_code = """    } else if (shape === 'planet') {
        let grad = ctx.createRadialGradient(0, 0, size * 0.1, 0, 0, size);
        let coreColor = themes[currentTheme](time, 0, 1);
        let edgeColor = themes[currentTheme](time + 1, 1, 1);
        grad.addColorStop(0, coreColor);
        grad.addColorStop(0.5, 'transparent');
        grad.addColorStop(1, edgeColor);
        
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        
        ctx.beginPath();
        ctx.ellipse(0, 0, size * 1.8, size * 0.4, 0, 0, Math.PI * 2);
        ctx.strokeStyle = edgeColor;
        ctx.lineWidth = 3;
        ctx.stroke();
    }
    ctx.restore();"""
content = content.replace('    }\n    ctx.restore();', planet_shape_code)

physics_replace = """        p.life -= 0.02;     // Fade out
        
        if (selectedShape === 'planet') {
            let dx = currentShapeX - p.x;
            let dy = currentShapeY - p.y;
            let dist = Math.hypot(dx, dy);
            if (dist > 0) {
                p.vx += (dx / dist) * 0.5;
                p.vy += (dy / dist) * 0.5;
            }
        } else {
            p.vy += 0.1;        // Gravity
        }
        
        if (p.life <= 0) {"""
content = content.replace(
    '        p.life -= 0.02;     // Fade out\n        p.vy += 0.1;        // Gravity\n        \n        if (p.life <= 0) {',
    physics_replace
)

render_shape_logic = """    // 3. Render Selected Shape in Middle & Handle Zoom/Rotation
    if (selectedShape) {
        let gestureA = false;
        let gestureB = false;

        if (currentHands.length >= 2) {
            const h1 = currentHands[0];
            const h2 = currentHands[1];
            
            const thumb1 = h1[4];
            const index1 = h1[8];
            const isPinching1 = getDist(thumb1, index1) < 0.05;
            
            const thumb2 = h2[4];
            const index2 = h2[8];
            const isPinching2 = getDist(thumb2, index2) < 0.05;
            
            const spread1 = getDist(h1[8], h1[20]);
            const spread2 = getDist(h2[8], h2[20]);
            const isOpenHand1 = spread1 > 0.15 && !isPinching1;
            const isOpenHand2 = spread2 > 0.15 && !isPinching2;

            if (isPinching1 && isPinching2) {
                gestureB = true;
                
                const p1 = mapToCanvas({x: (thumb1.x + index1.x)/2, y: (thumb1.y + index1.y)/2});
                const p2 = mapToCanvas({x: (thumb2.x + index2.x)/2, y: (thumb2.y + index2.y)/2});
                
                let currPinchMid = {x: (p1.x + p2.x)/2, y: (p1.y + p2.y)/2};
                let currPinchDist = getDist(p1, p2);
                let currPinchAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

                if (!isPrecisionPinching) {
                    isPrecisionPinching = true;
                    startPinchMid = currPinchMid;
                    startPinchDist = currPinchDist || 1;
                    startPinchAngle = currPinchAngle;
                    startShapeCenter = {x: currentShapeX, y: currentShapeY};
                    startShapeSize = currentShapeSize;
                    startShapeRotation = currentShapeRotation;
                } else {
                    let scale = currPinchDist / startPinchDist;
                    targetShapeSize = startShapeSize * scale;
                    
                    let angleDiff = currPinchAngle - startPinchAngle;
                    targetShapeRotation = startShapeRotation + angleDiff;
                    
                    let dx = startShapeCenter.x - startPinchMid.x;
                    let dy = startShapeCenter.y - startPinchMid.y;
                    
                    let rotDx = dx * Math.cos(angleDiff) - dy * Math.sin(angleDiff);
                    let rotDy = dx * Math.sin(angleDiff) + dy * Math.cos(angleDiff);
                    
                    rotDx *= scale;
                    rotDy *= scale;
                    
                    targetShapeX = currPinchMid.x + rotDx;
                    targetShapeY = currPinchMid.y + rotDy;
                }
            } else if (isOpenHand1 && isOpenHand2) {
                gestureA = true;
                const p1 = mapToCanvas(h1[0]);
                const p2 = mapToCanvas(h2[0]);
                const dist = getDist(p1, p2);
                targetShapeSize = Math.max(50, dist * 0.4); 
                targetShapeRotation = Math.atan2(p2.y - p1.y, p2.x - p1.x);
            }
        }
        
        if (!gestureB) {
            isPrecisionPinching = false;
        }
        
        if (!gestureA && !gestureB) {
            // Keep current location/size unless hands are lost completely
            if (currentHands.length === 0) {
                targetShapeSize = 100;
                targetShapeX = width / 2;
                targetShapeY = height / 2;
                targetShapeRotation = 0;
            }
        }

        // Smoothly interpolate size
        currentShapeSize += (targetShapeSize - currentShapeSize) * 0.1;
        
        // Smoothly interpolate position
        currentShapeX += (targetShapeX - currentShapeX) * 0.1;
        currentShapeY += (targetShapeY - currentShapeY) * 0.1;

        // Smoothly interpolate rotation, handling wrapping across PI/-PI
        let rotDiff = targetShapeRotation - currentShapeRotation;
        while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
        while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;
        currentShapeRotation += rotDiff * 0.1;

        ctx.globalCompositeOperation = 'screen';
        drawWireframeShape(ctx, selectedShape, currentShapeX, currentShapeY, currentShapeSize, time, currentShapeRotation);
    }

    ctx.globalCompositeOperation = 'source-over'; // Restore
}"""

content = re.sub(
    r'    // 3\. Render Selected Shape in Middle & Handle Zoom/Rotation.*?    ctx\.globalCompositeOperation = \'source-over\'; // Restore\n}', 
    render_shape_logic, 
    content, 
    flags=re.DOTALL
)

with open('index2.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Successfully created index2.html")
