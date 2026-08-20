import re

with open('src/components/AsciiPortrait.jsx', 'r') as f:
    code = f.read()

# We need to replace the logic from `const centerX = width / 2;` down to `const char = DENSITY_CHARS...`
# To be safe, let's use a regex to match the whole block and replace it.

old_block_pattern = re.compile(r"const centerX = width / 2;.*?const char = DENSITY_CHARS\[charIndex\] \|\| '@';", re.DOTALL)

new_block = """const centerX = width / 2;
              const centerY = height * 0.4;
              const distToCenter = Math.hypot(x - centerX, y - centerY);
              const maxDist = Math.hypot(width/2, height/2);
              const centerWeight = Math.max(0, 1 - (distToCenter / (maxDist * 0.6))); 
              
              // Hair part denser: if pixel is dark, force high detailLevel
              const isDark = normLum < 0.35;
              const darkBoost = isDark ? 0.4 : 0;
              
              const detailLevel = edgeMag + centerWeight * 0.15 + darkBoost;
              
              let localStep;
              let fontSize;
              if (detailLevel > 0.3) {
                 localStep = baseStep;
                 fontSize = baseStep * 2.5;
              } else if (detailLevel > 0.12) {
                 localStep = baseStep * 2;
                 fontSize = baseStep * 3.5;
              } else {
                 localStep = baseStep * 3;
                 fontSize = baseStep * 5;
              }

              if (x % localStep !== 0 || y % localStep !== 0) continue;

              // "Imagine my face is brighter, fairer": gamma curve to brighten skin midtones
              let adjustedLum = Math.pow(normLum, 0.4);
              
              // "Make the facial features of the ASCII art": force edges to be very dark so they get dense characters
              const edgeBoost = Math.min(edgeMag * 2.5, 0.8); 
              adjustedLum -= edgeBoost;
              
              // Hair vs Skin separation:
              if (adjustedLum < 0.35) {
                adjustedLum -= 0.2; // Make hair/dark features even darker
              }

              // Invert so dark pixels (hair, facial features) get denser characters, fair skin gets sparse characters
              const invBrightness = Math.max(0, Math.min(1, 1.0 - adjustedLum));
              
              const charIndex = Math.floor(invBrightness * (DENSITY_CHARS.length - 1));
              const char = DENSITY_CHARS[charIndex] || '@';"""

code = old_block_pattern.sub(new_block, code)

with open('src/components/AsciiPortrait.jsx', 'w') as f:
    f.write(code)

