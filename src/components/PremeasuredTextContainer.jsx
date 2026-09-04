import React, { useState, useEffect, useRef } from 'react';
import { prepare, layout } from '@chenglou/pretext';

const PremeasuredTextContainer = ({
  text,
  font = 'inherit',
  lineHeight,
  className,
  children
}) => {
  const containerRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState(undefined);
  const preparedRef = useRef(null);
  const lastFontRef = useRef('');
  const [isSupported, setIsSupported] = useState(true);

  // Simulate async content loading to show the CLS fix
  const [contentLoaded, setContentLoaded] = useState(false);

  useEffect(() => {
    let supported = typeof prepare === 'function';
    if (!supported) {
      setIsSupported(false);
      setContentLoaded(true);
      return;
    }
    
    // Simulate network latency for lazy-loaded copy
    const timer = setTimeout(() => {
      setContentLoaded(true);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  const measureAndLayout = (width) => {
    if (!containerRef.current || width <= 0) return;
    const cs = window.getComputedStyle(containerRef.current);
    const resolvedFont = (!font || font === 'inherit')
      ? `${cs.fontWeight || 'normal'} ${cs.fontSize || '15px'} ${cs.fontFamily || 'sans-serif'}`
      : font;
    const resolvedLineHeight = lineHeight || parseFloat(cs.lineHeight) || (parseFloat(cs.fontSize) * 1.5) || 22;

    if (resolvedFont !== lastFontRef.current) {
      try {
        preparedRef.current = prepare(text, resolvedFont);
        lastFontRef.current = resolvedFont;
      } catch (e) {
        setIsSupported(false);
        setContentLoaded(true);
        return;
      }
    }

    if (preparedRef.current) {
      try {
        const layoutResult = layout(preparedRef.current, width, resolvedLineHeight);
        if (layoutResult && typeof layoutResult.height !== 'undefined') {
          setContainerHeight(layoutResult.height);
        } else if (typeof layoutResult === 'number') {
          setContainerHeight(layoutResult);
        } else if (layoutResult && layoutResult.lines) {
          setContainerHeight(layoutResult.lines.length * resolvedLineHeight);
        }
      } catch (e) {}
    }
  };

  useEffect(() => {
    if (!isSupported) return;
    const container = containerRef.current;
    if (!container) return;

    measureAndLayout(container.clientWidth);

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0) {
          measureAndLayout(width);
        }
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, [isSupported, text, font, lineHeight]);

  return (
    <div 
      ref={containerRef} 
      className={className} 
      style={isSupported && containerHeight !== undefined ? { 
        minHeight: `${containerHeight}px`, 
        height: contentLoaded ? 'auto' : `${containerHeight}px`, 
        overflow: contentLoaded ? 'visible' : 'hidden' 
      } : {}}
    >
      {contentLoaded ? children : (
        <div style={{ 
          width: '100%', 
          height: '100%', 
          backgroundColor: 'rgba(255,255,255,0.05)', 
          borderRadius: '4px',
          opacity: 0.5
        }} />
      )}
    </div>
  );
};

export default PremeasuredTextContainer;
