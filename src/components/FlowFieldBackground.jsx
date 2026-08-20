import React, { useRef, useEffect } from 'react';

// A simple 2D noise implementation (Simplex-like)
const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;

function dot(g, x, y) {
  return g[0] * x + g[1] * y;
}

class SimplexNoise {
  constructor() {
    this.p = new Uint8Array(256);
    for (let i = 0; i < 256; i++) {
      this.p[i] = Math.floor(Math.random() * 256);
    }
    this.perm = new Uint8Array(512);
    this.permMod12 = new Uint8Array(512);
    for (let i = 0; i < 512; i++) {
      this.perm[i] = this.p[i & 255];
      this.permMod12[i] = (this.perm[i] % 12);
    }
    this.grad3 = new Float32Array([
      1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0,
      1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1,
      0, 1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1
    ]);
  }
  
  noise2D(xin, yin) {
    let n0, n1, n2;
    const s = (xin + yin) * F2;
    const i = Math.floor(xin + s);
    const j = Math.floor(yin + s);
    const t = (i + j) * G2;
    const X0 = i - t;
    const Y0 = j - t;
    const x0 = xin - X0;
    const y0 = yin - Y0;

    let i1, j1;
    if (x0 > y0) { i1 = 1; j1 = 0; }
    else { i1 = 0; j1 = 1; }

    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    const x2 = x0 - 1.0 + 2.0 * G2;
    const y2 = y0 - 1.0 + 2.0 * G2;

    const ii = i & 255;
    const jj = j & 255;
    
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 < 0) n0 = 0.0;
    else {
      t0 *= t0;
      const gi0 = this.permMod12[ii + this.perm[jj]] * 3;
      n0 = t0 * t0 * (this.grad3[gi0] * x0 + this.grad3[gi0 + 1] * y0);
    }

    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 < 0) n1 = 0.0;
    else {
      t1 *= t1;
      const gi1 = this.permMod12[ii + i1 + this.perm[jj + j1]] * 3;
      n1 = t1 * t1 * (this.grad3[gi1] * x1 + this.grad3[gi1 + 1] * y1);
    }

    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 < 0) n2 = 0.0;
    else {
      t2 *= t2;
      const gi2 = this.permMod12[ii + 1 + this.perm[jj + 1]] * 3;
      n2 = t2 * t2 * (this.grad3[gi2] * x2 + this.grad3[gi2 + 1] * y2);
    }

    return 70.0 * (n0 + n1 + n2);
  }
}

export function FlowFieldBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;
    
    const noise = new SimplexNoise();
    
    let dashes = [];
    const gridSize = 25; // Spacing between dashes
    const dashLength = 8;
    
    const initGrid = () => {
      // Use canvas's own styled dimensions, not the parent's full width
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      
      ctx.scale(dpr, dpr);
      
      dashes = [];
      // create grid
      const cols = Math.ceil(width / gridSize) + 1;
      const rows = Math.ceil(height / gridSize) + 1;
      
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const posX = x * gridSize;
          const posY = y * gridSize;
          // compute a base angle offset using noise (static for the dash base)
          // We also use this to determine density (skip some dashes)
          const densityNoise = noise.noise2D(x * 0.1, y * 0.1);
          if (densityNoise > 0.4) continue; // Sparsity variation
          
          dashes.push({
            x: posX,
            y: posY,
            baseAngle: 0, // will be driven by noise field in render
            gridX: x,
            gridY: y
          });
        }
      }
    };
    
    let debounceTimer;
    const resizeObserver = new ResizeObserver(() => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        initGrid();
      }, 100);
    });
    
     
      resizeObserver.observe(document.body);
      initGrid();
    
    let mouseX = -1000;
    let mouseY = -1000;
    let targetMouseX = -1000;
    let targetMouseY = -1000;
    
    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
    };
    
    const onMouseLeave = () => {
      targetMouseX = -1000;
      targetMouseY = -1000;
    };
    
    window.addEventListener('mousemove', onMouseMove);
     
      document.addEventListener('mouseleave', onMouseLeave);
    
    // Read the CSS variable for the stroke color once
    let computedColor = getComputedStyle(document.documentElement).getPropertyValue('--cream-muted').trim();
    if (!computedColor) {
      computedColor = 'rgba(245, 239, 224, 0.15)'; // fallback
    }

    let animationFrameId;
    let time = 0;
    const effectRadius = 150;
    
    const render = () => {
      if (!prefersReducedMotion) {
        time += 0.002; // Idle drift
        
        // Mouse interpolation
        mouseX += (targetMouseX - mouseX) * 0.15;
        mouseY += (targetMouseY - mouseY) * 0.15;
      }
      
      ctx.clearRect(0, 0, width, height);
      
      ctx.strokeStyle = computedColor;
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      
      for (let i = 0; i < dashes.length; i++) {
        const d = dashes[i];
        
        // Base noise angle
        const angleNoise = noise.noise2D(d.gridX * 0.05 + time, d.gridY * 0.05 + time);
        // Base diagonal flow (e.g. Math.PI/4) + noise perturbation
        let angle = -Math.PI / 6 + angleNoise * 0.5;
        
        let dx = 0;
        let dy = 0;
        
        if (!prefersReducedMotion && mouseX > -500) {
          const distX = d.x - mouseX;
          const distY = d.y - mouseY;
          const dist = Math.sqrt(distX * distX + distY * distY);
          
          if (dist < effectRadius) {
            // Perturb angle and position
            const influence = 1 - (dist / effectRadius); // 0 to 1
            // Smooth step interpolation for influence
            const smoothInfluence = influence * influence * (3 - 2 * influence);
            
            // Push away from cursor
            const pushFactor = 15 * smoothInfluence;
            const dirAngle = Math.atan2(distY, distX);
            dx = Math.cos(dirAngle) * pushFactor;
            dy = Math.sin(dirAngle) * pushFactor;
            
            // Warp angle
            angle += smoothInfluence * (Math.PI / 2);
          }
        }
        
        const finalX = d.x + dx;
        const finalY = d.y + dy;
        
        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        
        const hx = (dashLength / 2) * cosA;
        const hy = (dashLength / 2) * sinA;
        
        ctx.moveTo(finalX - hx, finalY - hy);
        ctx.lineTo(finalX + hx, finalY + hy);
      }
      
      ctx.stroke();
      
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
       
        document.removeEventListener('mouseleave', onMouseLeave);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{ 
        position: 'fixed', 
        top: 0, 
        right: 0, 
        width: '45vw', 
        height: '100vh', 
        pointerEvents: 'none',
        zIndex: -1
      }} 
    />
  );
}
