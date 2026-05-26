/**
 * EFFECTS & PHYSICS ENGINE
 */

function createParticles(pos, color, count = 3) {
    for (let i=0; i<count; i++) {
        particles.push({
            x: pos.x,
            y: pos.y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 1.0,
            color: color,
            size: Math.random() * 3 + 1
        });
    }
}

function createShockwave(pos, color) {
    ripples.push({
        x: pos.x,
        y: pos.y,
        radius: 0,
        maxRadius: 150 + Math.random() * 100,
        life: 1.0,
        color: color
    });
}

function updatePhysics() {
    // Particles
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;     // Fade out
        
        if (selectedShape === 'planet' || selectedShape === 'atom') {
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
        
        if (p.life <= 0) {
            particles.splice(i, 1);
        } else {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life;
            ctx.fill();
        }
    }
    
    // Ripples / Shockwaves
    for (let i = ripples.length - 1; i >= 0; i--) {
        let r = ripples[i];
        r.radius += (r.maxRadius - r.radius) * 0.1; // Ease out
        r.life -= 0.03;
        
        if (r.life <= 0) {
            ripples.splice(i, 1);
        } else {
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
            ctx.strokeStyle = r.color;
            ctx.lineWidth = 4 * r.life;
            ctx.globalAlpha = r.life;
            ctx.stroke();
        }
    }
    ctx.globalAlpha = 1.0; // Reset
}
