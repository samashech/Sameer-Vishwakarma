const fs = require('fs');
const file1 = 'src/components/AsciiPortrait.jsx';
let code1 = fs.readFileSync(file1, 'utf8');

// Change baseStep
code1 = code1.replace(
  "const baseStep = width <= 400 ? 2 : 3;",
  "const isMobile = window.innerWidth < 768;\n        const baseStep = isMobile ? 4 : 3;"
);

// Add Visibility API to AsciiPortrait
code1 = code1.replace(
  "requestRef.current = requestAnimationFrame(render);",
  "if (!document.hidden) requestRef.current = requestAnimationFrame(render);\n          else {\n            const checkVisibility = () => {\n              if (!document.hidden) {\n                document.removeEventListener('visibilitychange', checkVisibility);\n                requestRef.current = requestAnimationFrame(render);\n              }\n            };\n            document.addEventListener('visibilitychange', checkVisibility);\n          }"
);
// replace second occurrence
code1 = code1.replace(
  "requestRef.current = requestAnimationFrame(render);",
  "requestRef.current = requestAnimationFrame(render);" // doing it right
);
fs.writeFileSync(file1, code1);

const file2 = 'src/components/FlowFieldBackground.jsx';
let code2 = fs.readFileSync(file2, 'utf8');

code2 = code2.replace(
  "const gridSize = 25;",
  "const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;\n    const gridSize = isMobile ? 35 : 25;"
);

code2 = code2.replace(
  "animationFrameId = requestAnimationFrame(render);",
  "if (document.hidden) {\n        const checkVisibility = () => {\n          if (!document.hidden) {\n            document.removeEventListener('visibilitychange', checkVisibility);\n            animationFrameId = requestAnimationFrame(render);\n          }\n        };\n        document.addEventListener('visibilitychange', checkVisibility);\n      } else {\n        animationFrameId = requestAnimationFrame(render);\n      }"
);
fs.writeFileSync(file2, code2);
