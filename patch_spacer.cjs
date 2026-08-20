const fs = require('fs');
let content = fs.readFileSync('src/pages/ProjectLog.jsx', 'utf8');

const replacement = `
  return (
    <div className="project-log" ref={containerRef} style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      {blocks.map((b, i) => {
        const isVisible = i >= startIndex && i <= endIndex;
        const totalHeight = layoutData.heights[i];
        
        if (!isVisible) {
          // Spacer div for out-of-bounds blocks
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
`;

content = content.replace(/return \(\n\s*<div className="project-log" ref=\{containerRef\} style=\{\{ position: 'relative'.*?\}\);\n\};\n/s, replacement);
fs.writeFileSync('src/pages/ProjectLog.jsx', content);
