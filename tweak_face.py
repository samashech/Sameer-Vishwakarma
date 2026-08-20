import re

with open('src/components/AsciiPortrait.jsx', 'r') as f:
    code = f.read()

# We need to replace the logic from `const centerX = width / 2;` down to `const char = DENSITY_CHARS...`

old_block_pattern = re.compile(r"const centerX = width / 2;.*?const char = DENSITY_CHARS\[charIndex\] \|\| '@';", re.DOTALL)

new_block = """const centerX = width / 2;
              const centerY = height * 0.4;
              const distToCenter = Math.hypot(x - centerX, y - centerY);
              const maxDist = Math.hypot(width/2, height/2);
              const centerWeight = Math.max(0, 1 - (distToCenter / (maxDist * 0.6))); 
              
              // Hair and pupils part denser: if pixel is dark, force high detailLevel
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

              // Gamma curve to brighten skin midtones but preserve highlights (whites of eyes)
              let adjustedLum = Math.pow(normLum, 0.55);
              
              // Subtle edges to prevent heavy nostrils
              const edgeBoost = Math.min(edgeMag * 1.0, 0.25); 
              adjustedLum -= edgeBoost;
              
              // Pupil definition and hair darkness (extreme contrast for darkest areas)
              if (normLum < 0.2) {
                adjustedLum -= 0.5; // Pupils/deep hair get heavy characters (@, #)
              } else if (normLum < 0.45) {
                adjustedLum -= 0.1; // Mid-shadows (nostrils, creases) stay subtle
              }

              // Invert so dark pixels get denser characters
              const invBrightness = Math.max(0, Math.min(1, 1.0 - adjustedLum));
              
              const charIndex = Math.floor(invBrightness * (DENSITY_CHARS.length - 1));
              const char = DENSITY_CHARS[charIndex] || '@';"""

code = old_block_pattern.sub(new_block, code)

with open('src/components/AsciiPortrait.jsx', 'w') as f:
    f.write(code)

