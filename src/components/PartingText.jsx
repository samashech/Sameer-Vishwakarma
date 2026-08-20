import React, { useRef, useEffect, useState } from 'react';
import { prepareWithSegments, layoutNextLineRange, materializeLineRange } from '@chenglou/pretext';

export function PartingText({ className, text }) {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const textRef = useRef(null);
  
  const hasSegmenter = typeof Intl !== 'undefined' && 'Segmenter' in Intl;
  const prefersReducedMotion = typeof window !== 'undefined' ? window.matchMedia('(prefers-reduced-motion: reduce)').matches : false;

  useEffect(() => {
    if (!hasSegmenter) return; // ignores prefersReducedMotion for now

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const textNode = textRef.current;
    if (!canvas || !container || !textNode) return;

    const ctx = canvas.getContext('2d');
    
    const computedStyle = window.getComputedStyle(textNode);
    const resolvedFont = `${computedStyle.fontWeight} ${computedStyle.fontSize} ${computedStyle.fontFamily}`;
    const resolvedLineHeightPx = parseFloat(computedStyle.lineHeight) || parseInt(computedStyle.fontSize) * 1.5;
    const resolvedColor = computedStyle.color;

    let prepared;
    try {
      prepared = prepareWithSegments(text, resolvedFont);
    } catch (e) {
      console.error(e);
      return;
    }

    let width = container.clientWidth;
    const dpr = window.devicePixelRatio || 1;
    let height = container.clientHeight;
    
    let defaultLines = [];

    const updateCanvasSize = () => {
      width = container.clientWidth;
      let lineCount = 0;
      let cursor = { segmentIndex: 0, graphemeIndex: 0 };
      defaultLines = [];
      
      while (true) {
        const lineRange = layoutNextLineRange(prepared, cursor, width);
        if (!lineRange) break;
        defaultLines.push(lineRange);
        lineCount++;
        cursor = lineRange.end;
      }
      // Add a bit of extra height just in case the reflow adds lines
      height = (lineCount + 2) * resolvedLineHeightPx; 
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      
      ctx.scale(dpr, dpr);
      ctx.font = resolvedFont;
      ctx.fillStyle = resolvedColor;
      ctx.textBaseline = 'top';
    };

    updateCanvasSize();

    const resizeObserver = new ResizeObserver(() => {
      updateCanvasSize();
    });
    resizeObserver.observe(container);

    let mouseX = -1000;
    let mouseY = -1000;
    let targetMouseX = -1000;
    let targetMouseY = -1000;
    const obstacleRadius = 80;

    const onMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      targetMouseX = e.clientX - rect.left;
      targetMouseY = e.clientY - rect.top;
    };
    
    const onMouseLeave = () => {
      targetMouseX = -1000;
      targetMouseY = -1000;
    };

    window.addEventListener('mousemove', onMouseMove);

    let animationFrameId;
    let isAnimating = false; console.log("Animation stopped");

    const startAnimation = () => {
      if (!isAnimating) {
        isAnimating = true;
        
        const loop = () => {
          mouseX += (targetMouseX - mouseX) * 0.15;
          mouseY += (targetMouseY - mouseY) * 0.15;

          ctx.clearRect(0, 0, width, height);

          let cursor = { segmentIndex: 0, graphemeIndex: 0 };
          let currentY = 0;
          let useCache = true;

          for (let i = 0; i < defaultLines.length; i++) {
            const lineCenterY = currentY + resolvedLineHeightPx / 2;
            const dy = lineCenterY - mouseY;
            
            if (useCache && Math.abs(dy) < obstacleRadius && mouseX > -100) {
               useCache = false;
            }

            if (useCache) {
               const cachedLine = materializeLineRange(prepared, defaultLines[i]);
               ctx.fillText(cachedLine.text, 0, currentY);
               cursor = defaultLines[i].end;
               currentY += resolvedLineHeightPx;
            } else {
               break; 
            }
          }

          while (true) {
            const lineCenterY = currentY + resolvedLineHeightPx / 2;
            const dy = lineCenterY - mouseY;
            
            if (Math.abs(dy) < obstacleRadius && mouseX > -100) {
              const intersectionWidth = Math.sqrt(obstacleRadius * obstacleRadius - dy * dy);
              const padding = 15;
              const leftBound = mouseX - intersectionWidth - padding;
              const rightBound = mouseX + intersectionWidth + padding;

              const leftWidth = leftBound;
              const rightWidth = width - rightBound;

              let advanced = false;

              if (leftWidth > 30) {
                 const leftRange = layoutNextLineRange(prepared, cursor, leftWidth);
                 if (leftRange) {
                    const leftLine = materializeLineRange(prepared, leftRange);
                    ctx.fillText(leftLine.text, 0, currentY);
                    cursor = leftRange.end;
                    advanced = true;
                 }
              }

              if (rightWidth > 30) {
                 const rightRange = layoutNextLineRange(prepared, cursor, rightWidth);
                 if (rightRange) {
                    const rightLine = materializeLineRange(prepared, rightRange);
                    ctx.fillText(rightLine.text, rightBound, currentY);
                    cursor = rightRange.end;
                    advanced = true;
                 }
              }

              if (!advanced) {
                  const emergencyRange = layoutNextLineRange(prepared, cursor, 0);
                  if (emergencyRange) {
                     cursor = emergencyRange.end;
                  } else {
                     break; 
                  }
              }
            } else {
               const lineRange = layoutNextLineRange(prepared, cursor, width);
               if (!lineRange) break;
               const layoutLine = materializeLineRange(prepared, lineRange);
               ctx.fillText(layoutLine.text, 0, currentY);
               cursor = lineRange.end;
            }

            currentY += resolvedLineHeightPx;
            if (currentY > height + 2000) break;
          }

          if (Math.abs(mouseX - targetMouseX) > 0.5 || Math.abs(mouseY - targetMouseY) > 0.5) {
            animationFrameId = requestAnimationFrame(loop);
          } else {
            isAnimating = false; console.log("Animation stopped");
            mouseX = targetMouseX;
            mouseY = targetMouseY;
            // Draw one final frame perfectly snapped
            // Actually, wait, it's safer to just do nothing here. The last frame drawn is close enough.
          }
        };
        animationFrameId = requestAnimationFrame(loop);
      }
    };

    const mouseListener = (e) => {
      onMouseMove(e);
      startAnimation();
    };

    window.addEventListener('mousemove', mouseListener);
    container.addEventListener('mouseleave', onMouseLeave);
    startAnimation();

    return () => {
      window.removeEventListener('mousemove', mouseListener);
      container.removeEventListener('mouseleave', onMouseLeave);
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
    };

  }, [text, hasSegmenter, prefersReducedMotion]);

  if (!hasSegmenter) {
    return <p className={className}>{text}</p>;
  }

  // The hidden text sets the natural height. The canvas overflows slightly if text reflow adds lines.
  // We use userSelect: text on the invisible text so it's selectable.
  return (
    <div ref={containerRef} className={className} style={{ position: 'relative' }}>
      <p ref={textRef} style={{ opacity: 0, userSelect: 'text' }}>{text}</p>
      <canvas ref={canvasRef} style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }} />
    </div>
  );
}
