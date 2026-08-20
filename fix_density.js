const fs = require('fs');
let code = fs.readFileSync('src/components/AsciiPortrait.jsx', 'utf8');

// The original loop is:
// const step = width <= 400 ? 3 : 5;
// for (let y = step; y < height - step; y += step) { ...

// We will change it to:
// const baseStep = width <= 400 ? 2 : 3;
// for (let y = baseStep; y < height - baseStep; y += baseStep) { ...

code = code.replace(/const step = width <= 400 \? 3 : 5;/g, 'const baseStep = width <= 400 ? 2 : 3;');
code = code.replace(/for \(let y = step; y < height - step; y \+= step\) {/g, 'for (let y = baseStep; y < height - baseStep; y += baseStep) {');
code = code.replace(/for \(let x = step; x < width - step; x \+= step\) {/g, 'for (let x = baseStep; x < width - baseStep; x += baseStep) {');

// Inside the loop:
// We have `const edgeMag = Math.sqrt(gx*gx + gy*gy);`
const densityLogic = `
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
`;
code = code.replace(/const edgeMag = Math\.sqrt\(gx\*gx \+ gy\*gy\);/g, densityLogic);

// Add fontSize to particle push
code = code.replace(/delay: Math\.random\(\) \* 1500/g, 'delay: Math.random() * 1500,\n                fontSize');

// In render loop, we have:
// ctx.font = '10px monospace';
// We need to set it per particle. So remove the global ctx.font and put it in the loop.
code = code.replace(/ctx\.font = '10px monospace';/g, '');
code = code.replace(/ctx\.globalAlpha = p\.alpha;\n\s+ctx\.fillText\(p\.char, p\.x, p\.y\);/g, 'ctx.globalAlpha = p.alpha;\n              ctx.font = p.fontSize + "px monospace";\n              ctx.fillText(p.char, p.x, p.y);');

fs.writeFileSync('src/components/AsciiPortrait.jsx', code);
