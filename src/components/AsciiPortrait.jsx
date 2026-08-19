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
        const step = width <= 400 ? 5 : 8; // Higher density for 400px
        
        for (let y = 0; y < height; y += step) {
          for (let x = 0; x < width; x += step) {
            const index = (y * width + x) * 4;
            const r = data[index];
            const g = data[index+1];
            const b = data[index+2];
            const a = data[index+3];
            
            // Only process pixels with high alpha (mask out background)
            if (a > 128) {
              // Calculate perceived brightness
              let brightness = (0.299*r + 0.587*g + 0.114*b) / 255;
              
              // Apply gamma/contrast curve to push midtones apart
              // Formula: b = b^gamma. Gamma < 1 lightens midtones, > 1 darkens
              const gamma = 0.8;
              brightness = Math.pow(brightness, gamma);
              
              // Invert so dark pixels get denser characters
              const invBrightness = 1.0 - brightness;
              
              const charIndex = Math.floor(invBrightness * (DENSITY.length - 1));
              const char = DENSITY[charIndex] || '@';
              
              particles.push({
                x: x + (Math.random() - 0.5) * 400, // Start randomized
                y: y + (Math.random() - 0.5) * 400,
                baseX: x,
                baseY: y,
                char,
                alpha: 0,
                targetAlpha: a / 255, // Opacity derived from alpha mask
                delay: Math.random() * 1500 // Delay for assembly
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
