import React, { useEffect, useRef, useState } from 'react';
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext';

const CanvasText = ({ 
  text, 
  className, 
  font = '16px monospace', 
  color = 'var(--light-slate)',
  lineHeight = 24,
  delay = 0 
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isSupported, setIsSupported] = useState(true);
  const preparedRef = useRef(null);

  useEffect(() => {
    // Check support
    let supported = typeof prepareWithSegments === 'function' && typeof Intl !== 'undefined' && !!Intl.Segmenter;
    if (!supported) {
      setIsSupported(false);
      return;
    }

    try {
      preparedRef.current = prepareWithSegments(text, font);
    } catch (e) {
      setIsSupported(false);
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    let animationFrame;
    const startTime = Date.now();

    const render = () => {
      const container = containerRef.current;
      if (!container || !preparedRef.current) return;
      
      const width = container.clientWidth;
      if (width === 0) {
        animationFrame = requestAnimationFrame(render);
        return;
      }

      // 1. layoutWithLines
      const layoutResult = layoutWithLines(preparedRef.current, width, lineHeight);
      const lines = Array.isArray(layoutResult) ? layoutResult : (layoutResult.lines || []);
      const totalHeight = layoutResult.height || (lines.length * lineHeight);

      canvas.width = width;
      canvas.height = totalHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.font = font;
      
      let fillStyle = color;
      if (color.startsWith('var(')) {
        const varName = color.slice(4, -1);
        fillStyle = getComputedStyle(document.body).getPropertyValue(varName).trim() || fillStyle;
      }
      ctx.fillStyle = fillStyle;
      ctx.textBaseline = 'top';
      
      const elapsed = Date.now() - startTime;
      let allDone = true;

      // 2. Draw each line with an optional slide/fade stagger
      lines.forEach((line, index) => {
        let lineText = typeof line === 'string' ? line : line.text;
        
        // Staggered reveal animation
        const lineDelay = delay + index * 100;
        let alpha = 0;
        let yOffset = 10;
        
        if (elapsed > lineDelay) {
          const progress = Math.min((elapsed - lineDelay) / 400, 1);
          alpha = progress;
          yOffset = 10 * (1 - Math.pow(progress, 3)); // easeOut cubic
          if (progress < 1) allDone = false;
        } else {
          allDone = false;
        }
        
        if (alpha > 0) {
          ctx.globalAlpha = alpha;
          ctx.fillText(lineText, 0, index * lineHeight + yOffset);
        }
      });

      if (!allDone) {
        animationFrame = requestAnimationFrame(render);
      }
    };

    render();

    const observer = new ResizeObserver(() => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      render(); // this will also restart the animation if needed, but we could just draw it statically
    });
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, [text, font, lineHeight, color, delay]);

  if (!isSupported) {
    return <span className={className}>{text}</span>;
  }

  return (
    <div ref={containerRef} className={className} style={{ position: 'relative' }}>
      {/* Visually hidden real text for accessibility */}
      <span style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }} aria-hidden="false">
        {text}
      </span>
      <canvas ref={canvasRef} style={{ display: 'block', width: '100%' }} aria-hidden="true" />
    </div>
  );
};

export default CanvasText;
