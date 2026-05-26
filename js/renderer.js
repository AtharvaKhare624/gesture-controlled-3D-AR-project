/**
 * RENDER PIPELINE & WIREFRAME DRAWING
 */

function drawVolumetricSegments(ctx, segments) {
    // Pass 2 (Bloom): Thicker, translucent line with high shadowBlur
    ctx.lineWidth = 4;
    ctx.shadowColor = '#ffffff';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let seg of segments) {
        let avgAlpha = (seg.p1.alpha + seg.p2.alpha) / 2;
        let avgBlur = (seg.p1.blur + seg.p2.blur) / 2;
        ctx.strokeStyle = `rgba(255, 255, 255, ${avgAlpha * 0.4})`;
        ctx.shadowBlur = avgBlur;
        ctx.beginPath();
        ctx.moveTo(seg.p1.x, seg.p1.y);
        ctx.lineTo(seg.p2.x, seg.p2.y);
        ctx.stroke();
    }
    
    // Pass 1 (Core): Thin, solid pure white line
    ctx.lineWidth = 1;
    ctx.shadowBlur = 0;
    for (let seg of segments) {
        let avgAlpha = (seg.p1.alpha + seg.p2.alpha) / 2;
        ctx.strokeStyle = `rgba(255, 255, 255, ${avgAlpha})`;
        ctx.beginPath();
        ctx.moveTo(seg.p1.x, seg.p1.y);
        ctx.lineTo(seg.p2.x, seg.p2.y);
        ctx.stroke();
    }
}

function drawWireframeShape(ctx, shape, cx, cy, size, time, rotX=0, rotY=0, rotZ=0, stretchX=1, stretchY=1) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(stretchX, stretchY);
    
    let segments = [];

    if (shape === 'sphere') {
        let grad = ctx.createRadialGradient(0, 0, size * 0.2, 0, 0, size);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.5, 'rgba(255,255,255,0.2)');
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        for (let j=0; j<3; j++) {
            let pts = [];
            for (let i=0; i<=40; i++) {
                let a = i/40 * Math.PI * 2;
                if (j===0) pts.push([Math.cos(a), Math.sin(a), 0]);
                if (j===1) pts.push([Math.cos(a), 0, Math.sin(a)]);
                if (j===2) pts.push([0, Math.cos(a), Math.sin(a)]);
            }
            let projected = pts.map(v => project(v, size, rotX, rotY, rotZ));
            for(let i=0; i<projected.length-1; i++){
                segments.push({p1: projected[i], p2: projected[i+1]});
            }
        }
    } else if (shape === 'cube') {
        const CUBE = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
        const EDGES = [[0,1],[1,2],[2,3],[3,0], [4,5],[5,6],[6,7],[7,4], [0,4],[1,5],[2,6],[3,7]];
        // Default small rotation so it doesn't look like a square when facing dead-on
        let rX = rotX || 0.2; let rY = rotY || 0.3;
        let projected = CUBE.map(v => project(v, size*0.5, rX, rY, rotZ));
        EDGES.forEach(e => {
            segments.push({p1: projected[e[0]], p2: projected[e[1]]});
        });
    } else if (shape === 'cone') {
        const CONE = [[0,-1,0]];
        for(let i=0; i<12; i++) CONE.push([Math.cos(i/12*Math.PI*2), 1, Math.sin(i/12*Math.PI*2)]);
        let rX = rotX || 0.2; let rY = rotY || 0.3;
        let projected = CONE.map(v => project(v, size*0.7, rX, rY, rotZ));
        for(let i=1; i<=12; i++) {
            segments.push({p1: projected[0], p2: projected[i]});
            segments.push({p1: projected[i], p2: projected[(i%12)+1]});
        }
    } else if (shape === 'planet') {
        let atmosGrad = ctx.createRadialGradient(0, 0, size * 0.5, 0, 0, size * 2.0);
        atmosGrad.addColorStop(0, 'rgba(255,255,255,0.15)');
        atmosGrad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.arc(0, 0, size * 2.0, 0, Math.PI * 2);
        ctx.fillStyle = atmosGrad;
        ctx.fill();

        let grad = ctx.createRadialGradient(0, 0, size * 0.1, 0, 0, size);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.5, 'transparent');
        grad.addColorStop(1, '#ffffff');
        
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        
        let pts = [];
        for (let i=0; i<=40; i++) {
            let a = i/40 * Math.PI * 2;
            pts.push([Math.cos(a)*1.8, 0, Math.sin(a)*1.8]);
        }
        let projected = pts.map(v => project(v, size, rotX, rotY, rotZ));
        for(let i=0; i<projected.length-1; i++){
            segments.push({p1: projected[i], p2: projected[i+1]});
        }
    } else if (shape === 'atom') {
        let pulse = Math.sin(time * 3) * 0.5 + 0.5;
        let coreSize = size * 0.2 + pulse * size * 0.05;

        let coreGrad1 = ctx.createRadialGradient(0, 0, 0, 0, 0, coreSize);
        coreGrad1.addColorStop(0, '#ffffff');
        coreGrad1.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
        coreGrad1.addColorStop(1, 'transparent');

        let coreGrad2 = ctx.createRadialGradient(0, 0, 0, 0, 0, coreSize * 1.5);
        coreGrad2.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
        coreGrad2.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(0, 0, coreSize * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = coreGrad2;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(0, 0, coreSize, 0, Math.PI * 2);
        ctx.fillStyle = coreGrad1;
        ctx.fill();

        let ringConfigs = [
            { axis: 'x', speed: 0.5, eSpeed: 1.2 },
            { axis: 'y', speed: 0.6, eSpeed: 1.5 },
            { axis: 'diag', speed: 0.7, eSpeed: 1.0 }
        ];
        
        let electrons = [];

        ringConfigs.forEach((config) => {
            let pts = [];
            for (let i=0; i<=40; i++) {
                let a = i/40 * Math.PI * 2;
                let cx = Math.cos(a) * 2;
                let cy = Math.sin(a) * 2;
                let cz = 0;
                
                let tAngle = time * config.speed;
                if (config.axis === 'x') {
                    let y1 = cy * Math.cos(tAngle) - cz * Math.sin(tAngle);
                    let z1 = cy * Math.sin(tAngle) + cz * Math.cos(tAngle);
                    cy = y1; cz = z1;
                } else if (config.axis === 'y') {
                    let x1 = cx * Math.cos(tAngle) + cz * Math.sin(tAngle);
                    let z1 = -cx * Math.sin(tAngle) + cz * Math.cos(tAngle);
                    cx = x1; cz = z1;
                } else if (config.axis === 'diag') {
                    let x1 = cx * Math.cos(Math.PI/4) - cy * Math.sin(Math.PI/4);
                    let y1 = cx * Math.sin(Math.PI/4) + cy * Math.cos(Math.PI/4);
                    cx = x1; cy = y1;
                    let y2 = cy * Math.cos(tAngle) - cz * Math.sin(tAngle);
                    let z2 = cy * Math.sin(tAngle) + cz * Math.cos(tAngle);
                    cy = y2; cz = z2;
                }
                
                pts.push([cx, cy, cz]);
            }
            let projected = pts.map(v => project(v, size, rotX, rotY, rotZ));
            for(let i=0; i<projected.length-1; i++){
                segments.push({p1: projected[i], p2: projected[i+1]});
            }

            let eTime = time * config.eSpeed;
            let ecx = Math.cos(eTime) * 2;
            let ecy = Math.sin(eTime) * 2;
            let ecz = 0;
            
            let tAngle = time * config.speed;
            if (config.axis === 'x') {
                let y1 = ecy * Math.cos(tAngle) - ecz * Math.sin(tAngle);
                let z1 = ecy * Math.sin(tAngle) + ecz * Math.cos(tAngle);
                ecy = y1; ecz = z1;
            } else if (config.axis === 'y') {
                let x1 = ecx * Math.cos(tAngle) + ecz * Math.sin(tAngle);
                let z1 = -ecx * Math.sin(tAngle) + ecz * Math.cos(tAngle);
                ecx = x1; ecz = z1;
            } else if (config.axis === 'diag') {
                let x1 = ecx * Math.cos(Math.PI/4) - ecy * Math.sin(Math.PI/4);
                let y1 = ecx * Math.sin(Math.PI/4) + ecy * Math.cos(Math.PI/4);
                ecx = x1; ecy = y1;
                let y2 = ecy * Math.cos(tAngle) - ecz * Math.sin(tAngle);
                let z2 = ecy * Math.sin(tAngle) + ecz * Math.cos(tAngle);
                ecy = y2; ecz = z2;
            }
            
            let electronPt = project([ecx, ecy, ecz], size, rotX, rotY, rotZ);
            electrons.push(electronPt);
        });

        drawVolumetricSegments(ctx, segments);
        segments = []; 

        electrons.forEach(electronPt => {
            ctx.beginPath();
            ctx.arc(electronPt.x, electronPt.y, size*0.08 * electronPt.scale * 1.5, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${electronPt.alpha * 0.4})`;
            ctx.shadowBlur = electronPt.blur;
            ctx.shadowColor = '#ffffff';
            ctx.fill();

            ctx.beginPath();
            ctx.arc(electronPt.x, electronPt.y, size*0.08 * electronPt.scale, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${electronPt.alpha})`;
            ctx.shadowBlur = 0;
            ctx.fill();
        });
    }

    if (segments.length > 0) {
        drawVolumetricSegments(ctx, segments);
    }

    ctx.restore();
}

function drawBackground() {
    // Use destination-out to fade out the previous frame's drops, leaving a transparent trail
    bgCtx.globalCompositeOperation = 'destination-out';
    bgCtx.fillStyle = `rgba(0, 0, 0, ${0.15 + Math.min(handVelocities*10, 0.5)})`;
    bgCtx.fillRect(0, 0, width, height);
    bgCtx.globalCompositeOperation = 'source-over';

    // Matrix Rain Effect mapping to hand speed
    bgCtx.fillStyle = '#ffffff';
    bgCtx.font = fontSize + "px monospace";
    
    // Matrix speed boosts when hands move fast
    let speedMult = 1 + (handVelocities * 100);

    for (let i = 0; i < matrixColumns.length; i++) {
        // Only draw randomly to keep it sparse like stars/rain
        if (Math.random() > 0.95) {
            const char = String.fromCharCode(0x30A0 + Math.random() * 96);
            bgCtx.fillText(char, i * fontSize, matrixColumns[i] * fontSize);
        }
        
        matrixColumns[i] += Math.random() * speedMult;
        
        if (matrixColumns[i] * fontSize > height && Math.random() > 0.9) {
            matrixColumns[i] = 0;
        }
    }
}

/**
 * MAIN RENDER PIPELINE
 */
function renderLoop(timestamp) {
    requestAnimationFrame(renderLoop);
    
    let dt = (timestamp - lastTime) / 1000;
    lastTime = timestamp;
    time += dt;

    // Update FPS Counter
    framesThisSecond++;
    if (timestamp > lastFpsTime + 1000) {
        uiFps.innerText = framesThisSecond;
        framesThisSecond = 0;
        lastFpsTime = timestamp;
    }

    drawBackground();

    // The main canvas will clear fully each frame since we handle ghosting via bgCanvas 
    // BUT user requested trailing motion blur for fingertips.
    // Instead of clearRect, we fade the main canvas using destination-out to keep it transparent
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, width, height);

    // Enable Screen mode for additive light effects (like neon bloom)
    ctx.globalCompositeOperation = 'screen'; // Creates glowy overlapping effects

    // Render Physics layer
    updatePhysics();

    // Process Hand Logic if present
    if (currentHands.length > 0) {
        
        // 1. Draw Skeleton
        currentHands.forEach((hand, handIndex) => {
            const glowColor = '#ffffff';
            
            // Draw MediaPipe skeleton connectors using custom styles
            drawConnectors(ctx, hand, HAND_CONNECTIONS, {
                color: glowColor,
                lineWidth: 2
            });
            
            // Draw Landmarks with neon bloom
            ctx.shadowBlur = 15;
            ctx.shadowColor = glowColor;
            
            const isHandPinching = getDist(hand[4], hand[8]) < 0.05;

            // FINGER_TIPS loop maintained without drawing white centers or spawning particles
            FINGER_TIPS.forEach((tipIndex, idx) => {
                const pt = mapToCanvas(hand[tipIndex]);
                const tipCol = '#ffffff';
            });
            ctx.shadowBlur = 0; // Reset
        });

        // 2. Cross-Hand Interactions (Lightning & Gradients)
        if (currentHands.length >= 2 && !isPrecisionPinching) {
            const h1 = currentHands[0];
            const h2 = currentHands[1];

            // A. Connecting Lines
            FINGER_TIPS.forEach((tipIndex, idx) => {
                const pt1 = mapToCanvas(h1[tipIndex]);
                const pt2 = mapToCanvas(h2[tipIndex]);
                const dist = getDist(pt1, pt2);
                
                const col = '#ffffff';
                
                // Lightning electric arc when very close (but not touching)
                if (dist < 150 && Math.random() > 0.5) {
                    // Draw jagged lightning
                    ctx.beginPath();
                    ctx.moveTo(pt1.x, pt1.y);
                    // Midpoint jitter
                    const midX = (pt1.x + pt2.x)/2 + (Math.random() - 0.5) * 50;
                    const midY = (pt1.y + pt2.y)/2 + (Math.random() - 0.5) * 50;
                    ctx.lineTo(midX, midY);
                    ctx.lineTo(pt2.x, pt2.y);
                    
                    ctx.strokeStyle = '#ffffff';
                    ctx.shadowBlur = 20;
                    ctx.shadowColor = col;
                    ctx.lineWidth = 3;
                    ctx.stroke();
                }

                // Normal flowing gradient line
                ctx.beginPath();
                ctx.moveTo(pt1.x, pt1.y);
                ctx.lineTo(pt2.x, pt2.y);
                
                // Create gradient that shifts over time
                let grad = ctx.createLinearGradient(pt1.x, pt1.y, pt2.x, pt2.y);
                grad.addColorStop(0, '#ffffff');
                grad.addColorStop(0.5, 'rgba(255,255,255,0.5)');
                grad.addColorStop(1, '#ffffff');
                
                ctx.strokeStyle = grad;
                ctx.lineWidth = 4;
                ctx.shadowBlur = 10;
                ctx.shadowColor = col;
                ctx.stroke();
                ctx.shadowBlur = 0;
            });

            // B. Mandala drawing if 10 tips are perfectly detected
            // (Assuming if we have 2 hands, we draw lines connecting all tips in a star)
            if (h1 && h2) {
                // Combine all 10 tips
                let allTips = FINGER_TIPS.map(t => mapToCanvas(h1[t])).concat(
                              FINGER_TIPS.map(t => mapToCanvas(h2[t])) );
                
                ctx.save();
                // Find center point to draw Mandala
                let cx = allTips.reduce((sum, p) => sum + p.x, 0) / 10;
                let cy = allTips.reduce((sum, p) => sum + p.y, 0) / 10;
                
                ctx.translate(cx, cy);
                ctx.rotate(time * 0.5); // Slow rotation
                
                ctx.beginPath();
                for (let i=0; i<10; i++) {
                    const t1 = { x: allTips[i].x - cx, y: allTips[i].y - cy };
                    const t2 = { x: allTips[(i+3)%10].x - cx, y: allTips[(i+3)%10].y - cy };
                    ctx.moveTo(t1.x, t1.y);
                    ctx.lineTo(t2.x, t2.y);
                }
                ctx.strokeStyle = `rgba(255, 255, 255, 0.2)`;
                ctx.lineWidth = 1;
                ctx.stroke();
                ctx.restore();
            }
        }
        
        detectGestures();
    }
    
    // 3. Render Selected Shape in Middle & Handle Zoom/Rotation
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
            
            const isOpenHand1 = isOpenHand(h1) && !isPinching1;
            const isOpenHand2 = isOpenHand(h2) && !isPinching2;

            if (isPinching1 && isPinching2) {
                gestureB = true;
                
                const p1 = mapToCanvas({x: (thumb1.x + index1.x)/2, y: (thumb1.y + index1.y)/2});
                const p2 = mapToCanvas({x: (thumb2.x + index2.x)/2, y: (thumb2.y + index2.y)/2});
                
                let currPinchMid = {x: (p1.x + p2.x)/2, y: (p1.y + p2.y)/2};
                let currPinchDistX = Math.abs(p2.x - p1.x);
                let currPinchDistY = Math.abs(p2.y - p1.y);
                let currPinchAngle = Math.atan2(p2.y - p1.y, p2.x - p1.x);

                if (!isPrecisionPinching) {
                    isPrecisionPinching = true;
                    startPinchMid = currPinchMid;
                    startPinchDistX = currPinchDistX || 1;
                    startPinchDistY = currPinchDistY || 1;
                    startPinchAngle = currPinchAngle;
                    startShapeCenter = {x: currentShapeX, y: currentShapeY};
                    startShapeRotZ = currentShapeRotZ;
                    startStretchX = currentStretchX;
                    startStretchY = currentStretchY;
                } else {
                    // Pinch to stretch pixels specifically instead of uniform zoom
                    targetStretchX = startStretchX * (currPinchDistX / startPinchDistX);
                    targetStretchY = startStretchY * (currPinchDistY / startPinchDistY);
                    
                    let angleDiff = currPinchAngle - startPinchAngle;
                    targetShapeRotZ = startShapeRotZ + angleDiff;
                    
                    let dx = startShapeCenter.x - startPinchMid.x;
                    let dy = startShapeCenter.y - startPinchMid.y;
                    
                    let rotDx = dx * Math.cos(angleDiff) - dy * Math.sin(angleDiff);
                    let rotDy = dx * Math.sin(angleDiff) + dy * Math.cos(angleDiff);
                    
                    // Translate with anchor point
                    targetShapeX = currPinchMid.x + rotDx;
                    targetShapeY = currPinchMid.y + rotDy;
                }
            } else if (isOpenHand1 && isOpenHand2) {
                gestureA = true;
                const p1 = mapToCanvas(h1[0]);
                const p2 = mapToCanvas(h2[0]);
                const dist = getDist(p1, p2);
                targetShapeSize = Math.max(50, dist * 0.4); 
                
                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const dz = (h2[0].z - h1[0].z) * 1000; // depth change
                targetShapeRotZ = Math.atan2(dy, dx);
                targetShapeRotY = Math.atan2(dz, dx);
                targetShapeRotX = Math.atan2(dz, dy);
                
                targetStretchX = 1;
                targetStretchY = 1;
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
                targetShapeRotX = 0;
                targetShapeRotY = 0;
                targetShapeRotZ = 0;
                targetStretchX = 1;
                targetStretchY = 1;
            }
        }

        // Smoothly interpolate size
        currentShapeSize += (targetShapeSize - currentShapeSize) * 0.1;
        
        // Smoothly interpolate stretch
        currentStretchX += (targetStretchX - currentStretchX) * 0.1;
        currentStretchY += (targetStretchY - currentStretchY) * 0.1;

        // Smoothly interpolate position
        currentShapeX += (targetShapeX - currentShapeX) * 0.1;
        currentShapeY += (targetShapeY - currentShapeY) * 0.1;

        // Smoothly interpolate rotation X
        let rotDiffX = targetShapeRotX - currentShapeRotX;
        while (rotDiffX > Math.PI) rotDiffX -= Math.PI * 2;
        while (rotDiffX < -Math.PI) rotDiffX += Math.PI * 2;
        currentShapeRotX += rotDiffX * 0.1;

        // Smoothly interpolate rotation Y
        let rotDiffY = targetShapeRotY - currentShapeRotY;
        while (rotDiffY > Math.PI) rotDiffY -= Math.PI * 2;
        while (rotDiffY < -Math.PI) rotDiffY += Math.PI * 2;
        currentShapeRotY += rotDiffY * 0.1;

        // Smoothly interpolate rotation Z
        let rotDiffZ = targetShapeRotZ - currentShapeRotZ;
        while (rotDiffZ > Math.PI) rotDiffZ -= Math.PI * 2;
        while (rotDiffZ < -Math.PI) rotDiffZ += Math.PI * 2;
        currentShapeRotZ += rotDiffZ * 0.1;

        ctx.globalCompositeOperation = 'screen';
        drawWireframeShape(ctx, selectedShape, currentShapeX, currentShapeY, currentShapeSize, time, currentShapeRotX, currentShapeRotY, currentShapeRotZ, currentStretchX, currentStretchY);
    }

    ctx.globalCompositeOperation = 'source-over'; // Restore
}
