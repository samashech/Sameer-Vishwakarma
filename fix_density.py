import re

with open('src/components/AsciiPortrait.jsx', 'r') as f:
    code = f.read()

code = code.replace("const step = width <= 400 ? 3 : 5;", "const baseStep = width <= 400 ? 2 : 3;")
code = code.replace("for (let y = step; y < height - step; y += step) {", "for (let y = baseStep; y < height - baseStep; y += baseStep) {")
code = code.replace("for (let x = step; x < width - step; x += step) {", "for (let x = baseStep; x < width - baseStep; x += baseStep) {")

densityLogic = """
              const edgeMag = Math.sqrt(gx*gx + gy*gy);
              
              const centerX = width / 2;
              const centerY = height * 0.4;
              const distToCenter = Math.hypot(x - centerX, y - centerY);
              const maxDist = Math.hypot(width/2, height/2);
              const centerWeight = Math.max(0, 1 - (distToCenter / (maxDist * 0.6))); 
              
              const detailLevel = edgeMag + centerWeight * 0.15;
              
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
"""
code = code.replace("const edgeMag = Math.sqrt(gx*gx + gy*gy);", densityLogic)

code = code.replace("delay: Math.random() * 1500", "delay: Math.random() * 1500,\n                fontSize")

code = code.replace("ctx.font = '10px monospace';", "")

code = code.replace("ctx.globalAlpha = p.alpha;\n              ctx.fillText(p.char, p.x, p.y);", "ctx.globalAlpha = p.alpha;\n              ctx.font = p.fontSize + 'px monospace';\n              ctx.fillText(p.char, p.x, p.y);")

with open('src/components/AsciiPortrait.jsx', 'w') as f:
    f.write(code)

