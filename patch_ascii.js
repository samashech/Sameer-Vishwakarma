const fs = require('fs');
const file = 'src/components/AsciiPortrait.jsx';
let code = fs.readFileSync(file, 'utf8');

// Replace handleMouseMove to consider touch
code = code.replace(
  "const handleMouseMove = (e) => {",
  `const isTouchDevice = () => ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    const handleMouseMove = (e) => {
      if (isTouchDevice()) return;`
);

// Scale down on mobile
code = code.replace(
  "style={{ display: 'block', maxWidth: '100%', height: 'auto' }}",
  "style={{ display: 'block', maxWidth: '100%', height: 'auto', transform: typeof window !== 'undefined' && window.innerWidth < 768 ? 'scale(0.8)' : 'none', transformOrigin: 'center center' }}"
);
fs.writeFileSync(file, code);
