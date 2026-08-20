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
        
        // Extended character ramp for smoother shading
        // The original was: " \`.-':_,^=;><+!rc*/z?sLTv)J7(|Fi{C}fI31tlu[neoZ5Yxjya]2ESwqkP6h9d4VpOGbUAKXHm8RD#$Bg0MNWQ%&@"
        // We'll use the same but it will map much better due to the non-linear curve.
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
              // Calculate Sobel magnitudes using surrounding pixels
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
              // We use gamma < 1 (e.g. 0.6) to stretch the midtones and dark areas
              // Since it's a bright/overexposed image, a gamma of 0.6 will darken the midtones 
              // making them map to more distinct characters.
              let adjustedLum = Math.pow(normLum, 0.6);
              
              // 4. Edge-aware density boost
              // Pixels on strong edges should be darker (denser characters)
              // We subtract a fraction of edgeMag from the adjusted luminance.
              const edgeBoost = Math.min(edgeMag * 1.5, 0.5); // Cap edge boost
              adjustedLum = adjustedLum - edgeBoost;
              
              // Hair vs Skin separation:
              // Dark areas (like hair) get an extra boost to ensure they stay crisp
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
