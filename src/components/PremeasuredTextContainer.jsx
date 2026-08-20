import React, { useState, useEffect, useRef } from 'react';
import { prepare, layout } from '@chenglou/pretext';

const PremeasuredTextContainer = ({
  text,
  font = 'normal 16px Calibre, Inter, San Francisco, SF Pro Text, -apple-system, system-ui, sans-serif',
  lineHeight = 24,
  className,
  children
}) => {
  const containerRef = useRef(null);
  const [containerHeight, setContainerHeight] = useState(undefined);
  const preparedRef = useRef(null);
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

    try {
      preparedRef.current = prepare(text, font);
    } catch (e) {
      setIsSupported(false);
      setContentLoaded(true);
      return;
    }
    
    // Simulate network latency for lazy-loaded copy
    const timer = setTimeout(() => {
      setContentLoaded(true);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [text, font]);

  useEffect(() => {
    if (!isSupported || !preparedRef.current) return;
    
    const container = containerRef.current;
    if (!container) return;
    
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const width = entry.contentRect.width;
        if (width > 0 && preparedRef.current) {
          try {
             const layoutResult = layout(preparedRef.current, width, lineHeight);
             if (layoutResult && typeof layoutResult.height !== 'undefined') {
               setContainerHeight(layoutResult.height);
             } else if (typeof layoutResult === 'number') {
               // In case layout returns a number directly in older/newer pretext versions
               setContainerHeight(layoutResult);
             } else if (layoutResult && layoutResult.lines) {
               setContainerHeight(layoutResult.lines.length * lineHeight);
             }
          } catch(e) {}
        }
      }
    });
    
    observer.observe(container);
    return () => observer.disconnect();
  }, [isSupported, lineHeight, text]);

  return (
    <div 
      ref={containerRef} 
      className={className} 
      style={isSupported && containerHeight !== undefined ? { height: `${containerHeight}px`, overflow: 'hidden' } : {}}
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
