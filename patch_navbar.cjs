const fs = require('fs');
const file = 'src/components/NavBar.jsx';
let code = fs.readFileSync(file, 'utf8');

const overlayCode = `
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="mobile-overlay" 
          onClick={toggleMenu} 
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 998 }}
        />
      )}
      {/* Mobile Menu */}
`;

code = code.replace(
  "{/* Mobile Menu */}",
  overlayCode
);

fs.writeFileSync(file, code);
