const fs = require('fs');
const file = 'src/components/GameMode.jsx';
let code = fs.readFileSync(file, 'utf8');

// Add states
code = code.replace(
  "const [collectibles, setCollectibles] = useState(0);",
  "const [collectibles, setCollectibles] = useState(0);\n  const [isMobileScreen, setIsMobileScreen] = useState(false);\n  const [isTouchDevice, setIsTouchDevice] = useState(false);"
);

// Add useEffect for screen size & touch
const useEffectSnippet = `  useEffect(() => {
    setIsMobileScreen(window.innerWidth < 360);
    setIsTouchDevice('ontouchstart' in window || navigator.maxTouchPoints > 0);
    
    const handleResize = () => setIsMobileScreen(window.innerWidth < 360);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
`;
code = code.replace(
  "const [collectibles, setCollectibles] = useState(0);\n  const [isMobileScreen, setIsMobileScreen] = useState(false);\n  const [isTouchDevice, setIsTouchDevice] = useState(false);",
  "const [collectibles, setCollectibles] = useState(0);\n  const [isMobileScreen, setIsMobileScreen] = useState(false);\n  const [isTouchDevice, setIsTouchDevice] = useState(false);\n\n" + useEffectSnippet
);

// Render "Screen too small" or standard toggle
const renderReplacement = `  if (isMobileScreen) {
    return (
      <div className="game-toggle-container">
        <span className="game-too-small">Screen too small for game</span>
      </div>
    );
  }

  return (`;
code = code.replace("  return (\n    <>", renderReplacement + "\n    <>");

// Add Touch Controls UI
const touchControlsSnippet = `
      {isTouchDevice && isActive && gameState === 'playing' && (
        <div className="touch-controls">
          <div className="dpad">
            <button className="touch-btn" onPointerDown={(e) => { e.preventDefault(); keys.current.ArrowLeft = true; }} onPointerUp={(e) => { e.preventDefault(); keys.current.ArrowLeft = false; }} onPointerCancel={(e) => { keys.current.ArrowLeft = false; }}>←</button>
            <button className="touch-btn" onPointerDown={(e) => { e.preventDefault(); keys.current.ArrowRight = true; }} onPointerUp={(e) => { e.preventDefault(); keys.current.ArrowRight = false; }} onPointerCancel={(e) => { keys.current.ArrowRight = false; }}>→</button>
          </div>
          <div className="action-buttons">
            <button className="touch-btn jump" onPointerDown={(e) => { e.preventDefault(); keys.current.Space = true; player.current.jumpBufferTimer = player.current.maxJumpBuffer; }} onPointerUp={(e) => { e.preventDefault(); keys.current.Space = false; player.current.isJumping = false; if (player.current.vy < 0) player.current.vy *= 0.4; }} onPointerCancel={(e) => { keys.current.Space = false; }}>JUMP</button>
          </div>
        </div>
      )}
`;

code = code.replace(
  "{gameState !== 'playing' && (",
  touchControlsSnippet + "\n          {gameState !== 'playing' && ("
);

fs.writeFileSync(file, code);
