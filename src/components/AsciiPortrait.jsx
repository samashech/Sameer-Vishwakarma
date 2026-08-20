import { useEffect, useRef } from 'react';

const DENSITY = " `.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@";

const AsciiPortrait = ({ width = 400, height = 400 }) => {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const requestRef = useRef();
  const mouseRef = useRef({ x: -1000, y: -1000, radius: 80 });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    let isCancelled = false;

    const loadImageAndSample = () => {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      
      const processImage = () => {
        if (isCancelled) return;
        
        const imgAspect = img.width / img.height;
        const canvasAspect = width / height;
        let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
        
        if (imgAspect > canvasAspect) {
          drawHeight = height;
          drawWidth = height * imgAspect;
          offsetX = (width - drawWidth) / 2;
        } else {
          drawWidth = width;
          drawHeight = width / imgAspect;
          offsetY = (height - drawHeight) / 2;
        }

        const offscreen = document.createElement('canvas');
        offscreen.width = width;
        offscreen.height = height;
        const octx = offscreen.getContext('2d', { willReadFrequently: true });
        
        // Draw image directly (don't fill white bg so alpha channel stays intact for mask)
        octx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
        
        const imageData = octx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        const particles = [];
        const step = width <= 400 ? 3 : 5; // Reduced from 5 to 3 to double particle count
        
        // 1. Convert to grayscale (perceptual luminance) and find min/max for normalization
        const luminance = new Float32Array(width * height);
        let minLum = 1.0;
        let maxLum = 0.0;
        
        for (let y = 0; y < height; y++) {
          for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            const r = data[index];
            const g = data[index+1];
            const b = data[index+2];
            const a = data[index+3];
            
            if (a > 128) {
              const lum = (0.299*r + 0.587*g + 0.114*b) / 255;
              luminance[y * width + x] = lum;
              if (lum < minLum) minLum = lum;
              if (lum > maxLum) maxLum = lum;
            } else {
              luminance[y * width + x] = 1.0; // Background as white
            }
          }
        }

        // Add a slight margin to min/max to avoid extreme clipping
        if (maxLum === minLum) maxLum = minLum + 0.01;
        const lumRange = maxLum - minLum;
        
        const DENSITY_CHARS = DENSITY;

        for (let y = step; y < height - step; y += step) {
          for (let x = step; x < width - step; x += step) {
            const index = (y * width + x) * 4;
            const a = data[index+3];
            
            if (a > 128) {
              const rawLum = luminance[y * width + x];
              
              // Normalize to subject's actual tonal range (fixes overexposure)
              let normLum = (rawLum - minLum) / lumRange;
              normLum = Math.max(0, Math.min(1, normLum));
              
              // 2. Edge Detection (Sobel)
              const tl = luminance[(y-1)*width + (x-1)];
              const tc = luminance[(y-1)*width + x];
              const tr = luminance[(y-1)*width + (x+1)];
              const ml = luminance[y*width + (x-1)];
              const mr = luminance[y*width + (x+1)];
              const bl = luminance[(y+1)*width + (x-1)];
              const bc = luminance[(y+1)*width + x];
              const br = luminance[(y+1)*width + (x+1)];

              const gx = -tl + tr - 2*ml + 2*mr - bl + br;
              const gy = -tl - 2*tc - tr + bl + 2*bc + br;
              const edgeMag = Math.sqrt(gx*gx + gy*gy);
              
              // 3. Non-linear mapping (gamma curve)
              let adjustedLum = Math.pow(normLum, 0.6);
              
              // 4. Edge-aware density boost
              const edgeBoost = Math.min(edgeMag * 1.5, 0.5); 
              adjustedLum = adjustedLum - edgeBoost;
              
              // Hair vs Skin separation:
              if (adjustedLum < 0.3) {
                adjustedLum -= 0.1; // Make hair even darker
              }

              // Invert so dark pixels get denser characters, and clamp
              const invBrightness = Math.max(0, Math.min(1, 1.0 - adjustedLum));
              
              const charIndex = Math.floor(invBrightness * (DENSITY_CHARS.length - 1));
              const char = DENSITY_CHARS[charIndex] || '@';
              
              particles.push({
                x: x + (Math.random() - 0.5) * 400,
                y: y + (Math.random() - 0.5) * 400,
                baseX: x,
                baseY: y,
                char,
                alpha: 0,
                targetAlpha: a / 255,
                delay: Math.random() * 1500
              });
            }
          }
        }
        
        particlesRef.current = particles;
        const startTime = Date.now();
        startRenderLoop(startTime);
      };

      img.onload = processImage;
      img.onerror = () => {
         // If processed image not found (still processing), fallback to original
         if (img.src.includes('god_processed.png')) {
             console.log("Processed image not found, falling back to original.");
             img.src = '/assets/god.jpeg';
         } else {
             console.error("Failed to load image for AsciiPortrait");
         }
      };
      
      // Start by trying to load the processed image
      img.src = '/assets/god_processed.png';
    };
    
    const startRenderLoop = (startTime) => {
        const render = () => {
          ctx.clearRect(0, 0, width, height);
          ctx.fillStyle = 'rgba(100, 255, 218, 1)'; // var(--green-bright)
          ctx.font = '10px monospace';
          
          const now = Date.now();
          const elapsed = now - startTime;

          particlesRef.current.forEach(p => {
            // Assembly animation
            if (elapsed > p.delay) {
              p.alpha += (p.targetAlpha - p.alpha) * 0.05;
              
              // Spring force towards base position
              const dx = p.baseX - p.x;
              const dy = p.baseY - p.y;
              p.x += dx * 0.05;
              p.y += dy * 0.05;
              
              // Mouse interaction
              const mx = mouseRef.current.x;
              const my = mouseRef.current.y;
              const dist = Math.hypot(p.x - mx, p.y - my);
              
              if (dist < mouseRef.current.radius) {
                const force = (mouseRef.current.radius - dist) / mouseRef.current.radius;
                const angle = Math.atan2(p.y - my, p.x - mx);
                p.x += Math.cos(angle) * force * 5;
                p.y += Math.sin(angle) * force * 5;
              }

              // Breathing drift
              p.y += Math.sin(now * 0.002 + p.baseX * 0.01) * 0.2;

              ctx.globalAlpha = p.alpha;
              ctx.fillText(p.char, p.x, p.y);
            }
          });
          
          ctx.globalAlpha = 1.0;
          requestRef.current = requestAnimationFrame(render);
        };

        requestRef.current = requestAnimationFrame(render);
    }
    
    loadImageAndSample();

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        radius: 80
      };
    };

    const handleMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000, radius: 80 };
    };

    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      isCancelled = true;
      cancelAnimationFrame(requestRef.current);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [width, height]);

  return (
    <canvas 
      ref={canvasRef} 
      width={width} 
      height={height}
      style={{ display: 'block', maxWidth: '100%', height: 'auto' }}
    />
  );
};

export default AsciiPortrait;
