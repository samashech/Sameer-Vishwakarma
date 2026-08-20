import React, { useState, useEffect, useRef, useMemo } from 'react';
import { prepare, layout } from '@chenglou/pretext';

// Helper to generate some massive content
const generateContent = () => {
  const blocks = [];
  for (let i = 0; i < 500; i++) {
    if (i % 10 === 0) {
      blocks.push({ id: i, type: 'heading', text: `Section ${i / 10 + 1}: The Architecture` });
    } else if (i % 7 === 0) {
      blocks.push({ id: i, type: 'image', url: '/assets/god.jpeg', originalWidth: 800, originalHeight: 600 });
    } else {
      blocks.push({ id: i, type: 'paragraph', text: `This is a long paragraph detailing step ${i}. It needs to be significantly long so that pretext actually wraps it across multiple lines depending on the container width. The virtualization engine will calculate exactly how tall this block needs to be without ever rendering it to the DOM first, preventing expensive reflows.` });
    }
  }
  return blocks;
};

const DUMMY_DATA = generateContent();
const VIRTUALIZATION_THRESHOLD = 50; // Only virtualize if more than 50 blocks

const fontSettings = {
  heading: { font: 'bold 24px sans-serif', lineHeight: 32 },
  paragraph: { font: 'normal 16px sans-serif', lineHeight: 24 }
};

const ProjectLog = ({ blocks = DUMMY_DATA }) => {
  const containerRef = useRef(null);
  
  const [containerWidth, setContainerWidth] = useState(0);
  const [scrollTop, setScrollTop] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  
  // 1. Prepare text once
  const preparedBlocksRef = useRef([]);
  
  useEffect(() => {
    let supported = typeof prepare === 'function';
    if (!supported) {
      setIsSupported(false);
      return;
    }
    
    try {
      preparedBlocksRef.current = blocks.map(block => {
        if (block.type === 'heading' || block.type === 'paragraph') {
          const config = fontSettings[block.type];
          return {
            ...block,
            prepared: prepare(block.text, config.font)
          };
        }
        return block; // images don't need text prep
      });
    } catch(e) {
      setIsSupported(false);
    }
  }, [blocks]);

  // 2. Resize observer to get container width
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.contentRect.width > 0) {
          setContainerWidth(entry.contentRect.width);
        }
      }
    });
    
    observer.observe(container);
    return () => observer.disconnect();
  }, []);
  
  // 3. Scroll listener
  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setScrollTop(window.scrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    // Initial call
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 4. Compute layout and cumulative offsets when width changes
  const layoutData = useMemo(() => {
    if (!isSupported || containerWidth === 0 || blocks.length < VIRTUALIZATION_THRESHOLD || !preparedBlocksRef.current.length) {
      return null;
    }
    
    let currentOffset = 0;
    const offsets = [];
    const heights = [];
    
    for (let i = 0; i < preparedBlocksRef.current.length; i++) {
      const block = preparedBlocksRef.current[i];
      let height = 0;
      const margin = 20; // assumed margin bottom
      
      if (block.type === 'image') {
        // preserve aspect ratio based on container width
        const ratio = block.originalHeight / block.originalWidth;
        height = containerWidth * ratio;
      } else {
        const config = fontSettings[block.type];
        try {
          const layoutResult = layout(block.prepared, containerWidth, config.lineHeight);
          height = (layoutResult && layoutResult.height) ? layoutResult.height : config.lineHeight;
        } catch(e) {
          height = config.lineHeight;
        }
      }
      
      const totalHeight = height + margin;
      offsets.push(currentOffset);
      heights.push(totalHeight);
      currentOffset += totalHeight;
    }
    
    return { offsets, heights, totalHeight: currentOffset };
  }, [containerWidth, blocks, isSupported]);

  // If not virtualizing, just render normal
  if (!layoutData) {
    return (
      <div className="project-log" ref={containerRef} style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
        {blocks.map(b => (
          <div key={b.id} style={{ marginBottom: '20px' }}>
            {b.type === 'heading' && <h2 style={{font: fontSettings.heading.font, lineHeight: '32px'}}>{b.text}</h2>}
            {b.type === 'paragraph' && <p style={{font: fontSettings.paragraph.font, lineHeight: '24px'}}>{b.text}</p>}
            {b.type === 'image' && <img src={b.url} style={{ width: '100%', display: 'block' }} alt="" />}
          </div>
        ))}
      </div>
    );
  }

  // 5. Virtualization logic
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
  // Over-render by 1 viewport height in both directions
  const renderTop = scrollTop - viewportHeight;
  const renderBottom = scrollTop + viewportHeight * 2;
  
  // Binary search to find start index could be used, but a simple loop is fast enough for <10k items
  let startIndex = 0;
  for (let i = 0; i < layoutData.offsets.length; i++) {
    if (layoutData.offsets[i] + layoutData.heights[i] >= renderTop) {
      startIndex = i;
      break;
    }
  }
  
  let endIndex = layoutData.offsets.length - 1;
  for (let i = startIndex; i < layoutData.offsets.length; i++) {
    if (layoutData.offsets[i] > renderBottom) {
      endIndex = i;
      break;
    }
  }

  return (
    <div className="project-log" ref={containerRef} style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {blocks.map((b, i) => {
        const isVisible = i >= startIndex && i <= endIndex;
        const totalHeight = layoutData.heights[i];
        
        if (!isVisible) {
          // Spacer div for out-of-bounds blocks (preserves scroll position)
          return <div key={b.id} style={{ height: totalHeight }} data-type="spacer" />;
        }
        
        // Full render for active blocks
        return (
          <div key={b.id} style={{ height: totalHeight - 20, marginBottom: '20px' }}>
            {b.type === 'heading' && <h2 style={{font: fontSettings.heading.font, lineHeight: '32px', margin: 0}}>{b.text}</h2>}
            {b.type === 'paragraph' && <p style={{font: fontSettings.paragraph.font, lineHeight: '24px', margin: 0}}>{b.text}</p>}
            {b.type === 'image' && <img src={b.url} style={{ width: '100%', height: '100%', display: 'block', objectFit: 'cover' }} alt="" />}
          </div>
        );
      })}
    </div>
  );
};

export default ProjectLog;
