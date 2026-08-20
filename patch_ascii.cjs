const fs = require('fs');
const file = 'src/components/AsciiPortrait.jsx';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
  "const handleMouseMove = (e) => {",
  `const isTouchDevice = () => ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    const handleMouseMove = (e) => {
      if (isTouchDevice()) return;`
);

fs.writeFileSync(file, code);

const flowFile = 'src/components/FlowFieldBackground.jsx';
let flowCode = fs.readFileSync(flowFile, 'utf8');

flowCode = flowCode.replace(
  "const onMouseMove = (e) => {",
  `const isTouchDevice = () => ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    const onMouseMove = (e) => {
      if (isTouchDevice()) return;`
);
fs.writeFileSync(flowFile, flowCode);
