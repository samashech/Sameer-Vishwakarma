const fs = require('fs');
const file = 'src/pages/Home.jsx';
let code = fs.readFileSync(file, 'utf8');

const target = '<div className="project-image" style={{ backgroundImage: `url(${project.image})` }}></div>';
const replacement = '<div className="project-image"><img src={project.image} alt={project.title} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} /></div>';

code = code.replace(target, replacement);
fs.writeFileSync(file, code);
