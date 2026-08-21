import React, { useRef, useEffect } from 'react';

export function FlowFieldBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const prefersReducedMotion = typeof window !== 'undefined' 
        ? window.matchMedia('(prefers-reduced-motion: reduce)') 
        : { matches: false };
        
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Parameters matching the exact math from the reference site
    const gridSize = 14;
    const maxDash = 13;
    const minDash = 2;
    const lineWidth = 1.4;
    const ringFrequency = 46; 
    
    let strokeColor = getComputedStyle(document.documentElement).getPropertyValue('--cream-muted').trim();
    if (!strokeColor) strokeColor = 'rgba(245, 239, 224, 0.4)'; 

    let width = 0;
    let height = 0;
    
    let cols = 0;
    let rows = 0;
    let xs = new Float32Array(0);
    let ys = new Float32Array(0);
    let resting = new Float32Array(0);
    
    let mouseX = -1000;
    let mouseY = -1000;
    let currentVelocity = 0; 
    let isHovering = false;
    let hoverStartTime = 0;
    let lastHoverEventTime = 0;

    const initGrid = () => {
      const rect = canvas.getBoundingClientRect();
      const n = Math.round(rect.width);
      const i = Math.round(rect.height);
      if (!n || !i) return;
      
      width = n;
      height = i;
      
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      
      cols = Math.ceil(width / gridSize) + 1;
      rows = Math.ceil(height / gridSize) + 1;
      xs = new Float32Array(cols);
      ys = new Float32Array(rows);
      resting = new Float32Array(cols * rows);
      
      const offsetX = (width - (cols - 1) * gridSize) / 2;
      const offsetY = (height - (rows - 1) * gridSize) / 2;
      
      for(let c = 0; c < cols; c++) xs[c] = offsetX + c * gridSize;
      for(let r = 0; r < rows; r++) ys[r] = offsetY + r * gridSize;
      
      // Center of the rings (offset towards bottom left on their site)
      const cx = width * 0.16;
      const cy = height * 0.78;
      const falloff = Math.max(width, height) * 1.8;
      
      for(let c = 0; c < cols; c++) {
        const dx = xs[c] - cx;
        const colOffset = c * rows;
        for(let r = 0; r < rows; r++) {
          const dy = ys[r] - cy;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          // Concentric rings formula, attenuated by distance
          resting[colOffset + r] = 0.06 + 0.78 * (0.5 + 0.5 * Math.sin(dist / ringFrequency)) * Math.exp(-dist / falloff);
        }
      }
    };

    const getDashLength = (val) => {
      if (val <= 0.04) return 0;
      const len = val > 1 ? maxDash : val * maxDash;
      return len < minDash ? 0 : len;
    };

    let animationFrameId;
    
    const render = (time) => {
      if (width === 0 || height === 0) return;
      
      lastHoverEventTime ||= time;
      hoverStartTime ||= time;
      
      const dt = Math.min(64, time - lastHoverEventTime);
      lastHoverEventTime = time;
      
      // Force stop ripple if hovered in place without moving for too long (prevents endless jitter)
      if (isHovering && (time - hoverStartTime > 1200)) {
        isHovering = false; 
      }
      
      const targetVel = isHovering ? 1 : 0;
      currentVelocity = prefersReducedMotion.matches ? targetVel : currentVelocity + (targetVel - currentVelocity) * (1 - Math.exp(-dt / 130));
      
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = strokeColor;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'butt'; // Crucial for crisp dashes
      ctx.beginPath();
      
      const phase = prefersReducedMotion.matches ? 0 : (time - hoverStartTime) / 240;
      const rippleStrength = currentVelocity > 0.002 ? 0.55 * currentVelocity : 0;
      
      const effectRadius = 600;
      const rippleWavelength = 34;
      
      for(let c = 0; c < cols; c++) {
        const posX = xs[c];
        const dx = posX - mouseX;
        
        const inXBounds = rippleStrength > 0 && dx > -effectRadius && dx < effectRadius;
        const colOffset = c * rows;
        
        for(let r = 0; r < rows; r++) {
          const posY = ys[r];
          let val = resting[colOffset + r];
          
          if (inXBounds) {
            const dy = posY - mouseY;
            if (dy > -effectRadius && dy < effectRadius) {
              const distSq = dx * dx + dy * dy;
              if (distSq < effectRadius * effectRadius) {
                const dist = Math.sqrt(distSq);
                const falloff = 1 - dist / effectRadius;
                // Add the expanding ripple wave
                val += rippleStrength * falloff * falloff * Math.sin(dist / rippleWavelength - phase);
              }
            }
          }
          
          const dashLen = getDashLength(val);
          if (!dashLen) continue;
          
          const halfLen = dashLen / 2;
          // Align precisely to pixel grid to avoid subpixel blurring
          const yAligned = Math.round(posY) + 0.5;
          ctx.moveTo(posX - halfLen, yAligned);
          ctx.lineTo(posX + halfLen, yAligned);
        }
      }
      
      ctx.stroke();
      
      if (!isHovering && currentVelocity <= 0.004) {
        animationFrameId = 0;
        lastHoverEventTime = 0;
        currentVelocity = 0;
      } else {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const triggerRender = () => {
      if (!animationFrameId) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    const onPointerMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      isHovering = true;
      hoverStartTime = performance.now();
      triggerRender();
    };

    const onPointerLeave = () => {
      isHovering = false;
      triggerRender();
    };

    let resizeTimer;
    const onResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        initGrid();
        if (!animationFrameId) {
            render(performance.now());
        }
      }, 100);
    };

    initGrid();
    render(performance.now());

    // Bind to window so it tracks movement across the whole screen seamlessly
    window.addEventListener('resize', onResize);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerdown', onPointerMove);
    window.addEventListener('pointerup', onPointerLeave);
    window.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('pointercancel', onPointerLeave);

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerMove);
      window.removeEventListener('pointerup', onPointerLeave);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('pointercancel', onPointerLeave);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
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
