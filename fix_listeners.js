const fs = require('fs');
const file = 'src/components/PartingText.jsx';
let code = fs.readFileSync(file, 'utf8');

// Fix the mouseleave event
code = code.replace("canvas.addEventListener('mouseleave', onMouseLeave);", "container.addEventListener('mouseleave', onMouseLeave);");
code = code.replace("canvas.removeEventListener('mouseleave', onMouseLeave);", "container.removeEventListener('mouseleave', onMouseLeave);");

fs.writeFileSync(file, code);
