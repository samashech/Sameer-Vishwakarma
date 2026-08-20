import { useState, useEffect, useRef } from 'react';
import { Gamepad2, Info, RotateCcw } from 'lucide-react';
import './GameMode.css';

const GameMode = () => {
  const [isActive, setIsActive] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [gameState, setGameState] = useState('playing'); // playing, won, lost
  const [collectibles, setCollectibles] = useState(0);
  
  const canvasRef = useRef(null);
  const requestRef = useRef();
  
  // Game state refs to avoid dependency issues in animation frame
  const player = useRef({
    x: 50, y: 100, vx: 0, vy: 0,
    width: 20, height: 20,
    isGrounded: false,
    speed: 300,        // px per second
    jumpForce: -400,   // px per second
    gravity: 1200,     // px per second^2
    friction: 0.85,    // applied to vx
    
    // Jump vars
    isJumping: false,
    jumpHoldDuration: 0,
    maxJumpHold: 200, // ms
    liftForce: -800,  // px per second^2
    
    // Timers
    coyoteTimer: 0,
    maxCoyoteTime: 100,
    jumpBufferTimer: 0,
    maxJumpBuffer: 100,
    
    // Juice
    scaleX: 1,
    scaleY: 1,
    squashTimer: 0
  });
  
  const keys = useRef({ ArrowLeft: false, ArrowRight: false, ArrowUp: false, ArrowDown: false, Space: false, a: false, d: false, w: false, s: false });
  const scrollOffset = useRef(0);
  const domPlatforms = useRef([]);
  const textElementsRef = useRef([]);
  const generatedPlatforms = useRef([]);
  const items = useRef([]);
  const lastTime = useRef(0);
  
  // Shake / FX state
  const screenShake = useRef(0);
  const deathTime = useRef(0);
  
  const toggleGame = () => {
    setIsActive(prev => {
      const next = !prev;
      if (next) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "unset";
      }
      return next;
    });
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.style.overflow = "unset";
      cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const isJumpKey = (e) => ['ArrowUp', 'KeyW', 'Space'].includes(e.code) || ['w', 'ArrowUp', ' '].includes(e.key);
  const isMovementKey = (e) => ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyA', 'KeyD', 'KeyW', 'KeyS', 'Space'].includes(e.code) || ['a', 'd', 'w', 's', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key);

  // Input & Environment Setup
  useEffect(() => {
    if (!isActive) return;

    setGameState('playing');
    setCollectibles(0);
    player.current = { ...player.current, x: 50, y: window.scrollY + 100, vx: 0, vy: 0, isGrounded: false };
    
    const targetSelectors = 'h1, h2, h3, h4, h5, h6, p, li, .section-title, .intro-heading, .job-title, .company-name, .card-title, .footer-credit, .project-card h3';
    textElementsRef.current = Array.from(document.querySelectorAll(targetSelectors));
    
    const staticRects = textElementsRef.current.map(el => {
      const rect = el.getBoundingClientRect();
      return {
        x: rect.left,
        y: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height
      };
    }).filter(r => r.width >= 60 && r.height <= 100);

    const checkOverlap = (rect, list) => {
      for (const other of list) {
        if (rect.x < other.x + other.width &&
            rect.x + rect.width > other.x &&
            rect.y < other.y + other.height &&
            rect.y + rect.height > other.y) {
          return true;
        }
      }
      return false;
    };

    const currentScroll = window.scrollY;
    const docHeight = Math.max(document.body.scrollHeight, window.innerHeight);
    const numCollectibles = 5;
    // Distribute collectibles from just below player down to the bottom
    const availableHeight = docHeight - currentScroll - window.innerHeight * 0.3;
    const bandHeight = Math.max(availableHeight / numCollectibles, 200); // ensure at least 200px band
    const newGenPlatforms = [];
    const newItems = [];
    
    const jumpDistX = 180;
    const jumpDistY = 140;
    
    let prevPoint = { x: 50, y: currentScroll + 200 };

    for (let i = 0; i < numCollectibles; i++) {
      const startY = currentScroll + window.innerHeight * 0.3 + i * bandHeight;
      const targetY = startY + Math.random() * (bandHeight * 0.6);
      const targetX = 100 + Math.random() * (window.innerWidth - 200);

      const item = {
        x: targetX,
        y: targetY - 20,
        width: 15,
        height: 15,
        collected: false,
        popScale: 0
      };
      
      let ledge = {
        x: targetX - 40,
        y: targetY,
        width: 100,
        height: 10,
        alpha: 0
      };
      
      let attempts = 0;
      while (checkOverlap(ledge, staticRects) && attempts < 10) {
         ledge.y += 20;
         item.y += 20;
         attempts++;
      }
      newItems.push(item);
      newGenPlatforms.push(ledge);

      let curr = { ...prevPoint };
      let chainAttempts = 0;
      
      while ((curr.y < ledge.y - jumpDistY || Math.abs(curr.x - ledge.x) > jumpDistX) && chainAttempts < 50) {
        let nextY = curr.y + Math.random() * jumpDistY;
        if (nextY > ledge.y) nextY = ledge.y - Math.random() * 50;

        let dirX = Math.sign(ledge.x - curr.x);
        if (dirX === 0) dirX = Math.random() > 0.5 ? 1 : -1;
        let nextX = curr.x + dirX * (Math.random() * jumpDistX);
        
        if (Math.abs(curr.y - ledge.y) < 50) {
           nextY = curr.y + (Math.random() * 40 - 20); 
        }

        let plat = {
          x: nextX - 40,
          y: nextY,
          width: 80,
          height: 10,
          alpha: 0
        };

        let overlapAttempts = 0;
        while (checkOverlap(plat, staticRects) && overlapAttempts < 10) {
          plat.x += 20;
          if (plat.x + plat.width > window.innerWidth) plat.x -= 40;
          overlapAttempts++;
        }
        
        newGenPlatforms.push(plat);
        curr = { x: plat.x + plat.width/2, y: plat.y };
        chainAttempts++;
      }
      
      prevPoint = { x: ledge.x + ledge.width/2, y: ledge.y };
    }

    generatedPlatforms.current = newGenPlatforms;
    items.current = newItems;

    const handleKeyDown = (e) => {
      if (isMovementKey(e)) {
        e.preventDefault(); // Unconditionally stop page scroll
      }
      
      if (keys.current.hasOwnProperty(e.key)) keys.current[e.key] = true;
      if (e.code === 'Space') keys.current.Space = true;
      
      if (isJumpKey(e)) {
        player.current.jumpBufferTimer = player.current.maxJumpBuffer;
        
        if (gameState !== 'playing' && performance.now() - deathTime.current > 500) {
          resetGame();
        }
      }
    };
    
    const handleKeyUp = (e) => {
      if (isMovementKey(e)) e.preventDefault();

      if (keys.current.hasOwnProperty(e.key)) keys.current[e.key] = false;
      if (e.code === 'Space') keys.current.Space = false;

      // Variable jump height cut-off
      if (isJumpKey(e)) {
        player.current.isJumping = false;
        if (player.current.vy < 0) {
          player.current.vy *= 0.4;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp, { passive: false });
    
    let resizeTimer;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const targetSelectors = 'h1, h2, h3, h4, h5, h6, p, li, .section-title, .intro-heading, .job-title, .company-name, .card-title, .footer-credit, .project-card h3';
        textElementsRef.current = Array.from(document.querySelectorAll(targetSelectors));
      }, 100);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(requestRef.current);
    };
  }, [isActive, gameState]);

  const resetGame = () => {
    setGameState('playing');
    setCollectibles(0);
    screenShake.current = 0;
    player.current = { ...player.current, x: 50, y: window.scrollY + 100, vx: 0, vy: 0, scaleX: 1, scaleY: 1, coyoteTimer: 0 };
    items.current.forEach(item => {
      item.collected = false;
      item.popScale = 0;
    });
  };

  // Game Loop
  useEffect(() => {
    if (!isActive || gameState !== 'playing') return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    lastTime.current = performance.now();
    
    const update = (time) => {
      const dt = Math.min((time - lastTime.current) / 1000, 0.1); // cap dt at 100ms
      const dtMs = dt * 1000;
      lastTime.current = time;

      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      scrollOffset.current = window.scrollY;

      // Recalculate live DOM platforms based on scroll
      if (textElementsRef.current) {
        domPlatforms.current = textElementsRef.current.map(el => {
          const rect = el.getBoundingClientRect();
          if (rect.width >= 60 && rect.height <= 100) {
            return {
              x: rect.left,
              y: rect.top + scrollOffset.current, // doc space
              width: rect.width,
              height: 10
            };
          }
          return null;
        }).filter(Boolean);
      }

      // Progressive reveal for generated platforms
      generatedPlatforms.current.forEach(plat => {
        // Fade in if within viewport + margin
        if (plat.y < scrollOffset.current + window.innerHeight + 100) {
          plat.alpha += (1 - plat.alpha) * 5 * dt;
        }
      });

      const p = player.current;
      const jumpKeyHeld = keys.current.ArrowUp || keys.current.w || keys.current.Space;

      // Timers
      if (p.coyoteTimer > 0) p.coyoteTimer -= dtMs;
      if (p.jumpBufferTimer > 0) p.jumpBufferTimer -= dtMs;
      if (p.squashTimer > 0) {
        p.squashTimer -= dtMs;
        // Interpolate scale back to 1
        p.scaleX += (1 - p.scaleX) * 10 * dt;
        p.scaleY += (1 - p.scaleY) * 10 * dt;
      } else {
        p.scaleX = 1; p.scaleY = 1;
      }
      
      if (screenShake.current > 0) {
        screenShake.current -= dtMs;
      }

      // Horizontal movement
      let moveDir = 0;
      if (keys.current.ArrowLeft || keys.current.a) moveDir -= 1;
      if (keys.current.ArrowRight || keys.current.d) moveDir += 1;
      
      // Apply acceleration instead of direct velocity setting for smoother feel
      p.vx += moveDir * p.speed * 10 * dt;
      p.vx *= p.friction; // Friction handles deceleration
      
      // Clamp vx
      if (Math.abs(p.vx) < 1) p.vx = 0;
      
      p.x += p.vx * dt;

      // Screen boundaries (horizontal wrap)
      if (p.x > window.innerWidth) p.x = -p.width;
      if (p.x < -p.width) p.x = window.innerWidth;

      // Jumping Logic
      if (p.jumpBufferTimer > 0 && p.coyoteTimer > 0) {
        p.vy = p.jumpForce;
        p.isGrounded = false;
        p.coyoteTimer = 0;
        p.jumpBufferTimer = 0;
        p.isJumping = true;
        p.jumpHoldDuration = 0;
        
        // Stretch on jump
        p.scaleX = 0.7;
        p.scaleY = 1.3;
        p.squashTimer = 150;
      }

      // Variable jump height / lift
      if (p.isJumping && jumpKeyHeld && p.vy < 0) {
        p.jumpHoldDuration += dtMs;
        if (p.jumpHoldDuration < p.maxJumpHold) {
          p.vy += p.liftForce * dt;
        } else {
          p.isJumping = false;
        }
      }

      // Gravity
      p.vy += p.gravity * dt;
      
      // Terminal velocity
      if (p.vy > 1000) p.vy = 1000;

      // Store previous state for swept collision check
      const prevY = p.y;
      p.y += p.vy * dt;

      // Collision Detection
      let wasGrounded = p.isGrounded;
      p.isGrounded = false;
      const allPlatforms = [...domPlatforms.current, ...generatedPlatforms.current];
      
      for (let plat of allPlatforms) {
        // Only check collision if falling down
        if (p.vy > 0) {
          // Swept collision: check if bottom crosses platform top this frame
          if (
            prevY + p.height <= plat.y + 5 && // was above (with slight margin)
            p.y + p.height >= plat.y &&       // is below or touching
            p.x + p.width > plat.x &&         // within x bounds
            p.x < plat.x + plat.width
          ) {
            p.y = plat.y - p.height;
            p.vy = 0;
            p.isGrounded = true;
            p.coyoteTimer = p.maxCoyoteTime;
            
            if (!wasGrounded) {
              // Landing juice
              p.scaleX = 1.4;
              p.scaleY = 0.6;
              p.squashTimer = 150;
            }
          }
        }
      }

      if (!p.isGrounded && wasGrounded) {
        // Just fell off edge
        p.coyoteTimer = p.maxCoyoteTime;
      } else if (p.isGrounded) {
        p.coyoteTimer = p.maxCoyoteTime;
      }

      // Check item collection
      let newCollected = 0;
      items.current.forEach(item => {
        if (!item.collected) {
          item.popScale += (1 - item.popScale) * 10 * dt;
          
          if (
            p.x < item.x + item.width &&
            p.x + p.width > item.x &&
            p.y < item.y + item.height &&
            p.y + p.height > item.y
          ) {
            item.collected = true;
            // Juice: screen shake on collect
            screenShake.current = 100;
          }
        }
        if (item.collected) newCollected++;
      });
      
      if (newCollected > collectibles) {
        setCollectibles(newCollected);
        if (newCollected >= 5) {
          setGameState('won');
        }
      }

      // Check lose condition
      if (p.y > scrollOffset.current + window.innerHeight + 200) {
        deathTime.current = performance.now();
        screenShake.current = 300;
        setGameState('lost');
        
        // Draw last frame before exit
        draw(ctx, canvas.width, canvas.height, p);
        return; // Stop update loop
      }

      draw(ctx, canvas.width, canvas.height, p);
      requestRef.current = requestAnimationFrame(update);
    };

    const draw = (ctx, w, h, p) => {
      ctx.clearRect(0, 0, w, h);

      ctx.save();
      
      // Screen shake
      if (screenShake.current > 0) {
        const amt = screenShake.current > 150 ? 10 : 3; // stronger shake on death
        const sx = (Math.random() - 0.5) * amt;
        const sy = (Math.random() - 0.5) * amt;
        ctx.translate(sx, sy);
      }
      
      ctx.translate(0, -scrollOffset.current);

      // Draw generated platforms
      generatedPlatforms.current.forEach(plat => {
        ctx.fillStyle = `rgba(100, 255, 218, ${plat.alpha * 0.3})`;
        ctx.fillRect(plat.x, plat.y, plat.width, plat.height);
      });

      // Draw items
      items.current.forEach(item => {
        if (!item.collected) {
          ctx.fillStyle = '#ffd166';
          const pulse = Math.sin(performance.now() / 200) * 2;
          const cx = item.x + item.width/2;
          const cy = item.y + item.height/2;
          const w = (item.width + pulse) * item.popScale;
          const h = (item.height + pulse) * item.popScale;
          ctx.fillRect(cx - w/2, cy - h/2, w, h);
        }
      });

      // Draw Player (with squash and stretch)
      ctx.fillStyle = '#64ffda';
      const bob = p.isGrounded && Math.abs(p.vx) < 5 ? Math.sin(performance.now() / 150) * 2 : 0;
      
      const cx = p.x + p.width/2;
      const cy = p.y + p.height + bob;
      
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(p.scaleX, p.scaleY);
      
      ctx.fillRect(-p.width/2, -p.height, p.width, p.height);
      
      // Eyes
      ctx.fillStyle = '#0a192f';
      const lookDir = p.vx > 10 ? 4 : p.vx < -10 ? -4 : 0;
      ctx.fillRect(-p.width/2 + 4 + lookDir, -p.height + 4, 4, 4);
      ctx.fillRect(-p.width/2 + 12 + lookDir, -p.height + 4, 4, 4);
      
      ctx.restore(); // end player scale transform

      ctx.restore(); // end global/shake transform
    };

    requestRef.current = requestAnimationFrame(update);
    return () => cancelAnimationFrame(requestRef.current);
  }, [isActive, gameState, collectibles]);

  return (
    <>
      <div className="game-toggle-container">
        <button 
          className="game-toggle-btn"
          onClick={toggleGame}
          title={isActive ? "Exit Game Mode" : "Play Game Mode"}
        >
          <Gamepad2 size={20} />
          {isActive ? 'EXIT GAME' : 'PLAY'}
        </button>
        {isActive && (
          <div 
            className="game-info-icon"
            onMouseEnter={() => setShowInfo(true)}
            onMouseLeave={() => setShowInfo(false)}
          >
            <Info size={16} />
            {showInfo && (
              <div className="game-info-tooltip">
                <p>Controls: Arrows / WASD to move.</p>
                <p>Space to jump. Hold to jump higher.</p>
                <p>Jump on page elements! Collect 5 yellow blocks to win.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {isActive && (
        <div className="game-overlay">
          <div className="game-hud">
            Items: {collectibles} / 5
          </div>
          <canvas ref={canvasRef} className="game-canvas" />
          
          {gameState !== 'playing' && (
            <div className="game-modal fade-in">
              <h2>{gameState === 'won' ? 'all brain cells recovered' : 'you fell'}</h2>
              <p style={{ color: 'var(--slate)', marginBottom: '20px', fontFamily: 'monospace' }}>
                {gameState === 'won' 
                  ? 'you successfully collected everything!' 
                  : 'watch your step next time.'}
              </p>
              <button className="btn" onClick={resetGame}>
                <RotateCcw size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />
                {gameState === 'won' ? 'play again' : 'try again'}
              </button>
              <p style={{ color: 'var(--slate)', marginTop: '15px', fontSize: '12px', fontFamily: 'monospace' }}>
                (press Space to restart)
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default GameMode;
