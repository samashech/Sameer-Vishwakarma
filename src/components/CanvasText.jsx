import React, { useEffect, useRef, useState } from 'react';
import { prepareWithSegments, layoutWithLines } from '@chenglou/pretext';

const CanvasText = ({ 
  text, 
  className, 
  font = 'inherit', 
  color = 'var(--light-slate)',
  lineHeight,
  delay = 0,
  align = 'left' 
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isSupported, setIsSupported] = useState(true);
  const preparedRef = useRef(null);
  const lastFontRef = useRef('');

  const getResolvedStyles = () => {
    if (!containerRef.current) {
      return {
        resolvedFont: font && font !== 'inherit' ? font : 'normal 16px sans-serif',
        resolvedLineHeight: lineHeight || 24,
        resolvedColor: color
      };
    }
    const cs = window.getComputedStyle(containerRef.current);
    let resolvedFont = font;
    let resolvedLineHeight = lineHeight;

    if (!font || font === 'inherit') {
      const weight = cs.fontWeight || 'normal';
      const size = cs.fontSize || '16px';
      const family = cs.fontFamily || 'sans-serif';
      resolvedFont = `${weight} ${size} ${family}`;
    }

    if (!resolvedLineHeight) {
      resolvedLineHeight = parseFloat(cs.lineHeight) || (parseFloat(cs.fontSize) * 1.5) || 24;
    }

    let fillStyle = color;
    if (color && color.startsWith('var(')) {
      const varName = color.slice(4, -1);
      fillStyle = cs.getPropertyValue(varName).trim() || 
                  getComputedStyle(document.body).getPropertyValue(varName).trim() || 
                  color;
    }

    return { resolvedFont, resolvedLineHeight, resolvedColor: fillStyle };
  };

  useEffect(() => {
    // Check support
    let supported = typeof prepareWithSegments === 'function' && typeof Intl !== 'undefined' && !!Intl.Segmenter;
    if (!supported) {
      setIsSupported(false);
      return;
    }

    const { resolvedFont, resolvedLineHeight, resolvedColor } = getResolvedStyles();
    try {
      preparedRef.current = prepareWithSegments(text, resolvedFont);
      lastFontRef.current = resolvedFont;
    } catch (e) {
      setIsSupported(false);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    let animationFrame;
    const startTime = Date.now();

    const render = () => {
      const container = containerRef.current;
      if (!container) return;
      
      const width = container.clientWidth;
      if (width === 0) {
        animationFrame = requestAnimationFrame(render);
        return;
      }

      const styles = getResolvedStyles();
      if (styles.resolvedFont !== lastFontRef.current) {
        try {
          preparedRef.current = prepareWithSegments(text, styles.resolvedFont);
          lastFontRef.current = styles.resolvedFont;
        } catch (e) {}
      }

      if (!preparedRef.current) return;

      // 1. layoutWithLines
      const layoutResult = layoutWithLines(preparedRef.current, width, styles.resolvedLineHeight);
      const lines = Array.isArray(layoutResult) ? layoutResult : (layoutResult.lines || []);
      const totalHeight = layoutResult.height || (lines.length * styles.resolvedLineHeight);

      const dpr = Math.min(window.devicePixelRatio || 1, 3);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(totalHeight * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${totalHeight}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, totalHeight);
      ctx.font = styles.resolvedFont;
      ctx.fillStyle = styles.resolvedColor;
      ctx.textBaseline = 'top';

      const computedTextAlign = getComputedStyle(container).textAlign;
      const isCentered = align === 'center' || computedTextAlign === 'center';
      
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
          let x = 0;
          if (isCentered) {
            const metrics = ctx.measureText(lineText);
            x = Math.max(0, (width - metrics.width) / 2);
          }
          ctx.fillText(lineText, x, index * styles.resolvedLineHeight + yOffset);
        }
      });

      if (!allDone) {
        animationFrame = requestAnimationFrame(render);
      }
    };

    render();

    const observer = new ResizeObserver(() => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      render();
    });
    
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      observer.disconnect();
      cancelAnimationFrame(animationFrame);
    };
  }, [text, font, lineHeight, color, delay, align]);

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
