import { useState, useEffect } from 'react';
import { Users } from 'lucide-react';
import './LiveVisitors.css';

const MOCK_VISITORS = [
  { id: '1', x: 20, y: 15, color: '#FF6B6B' },
  { id: '2', x: 75, y: 30, color: '#4ECDC4' },
  { id: '3', x: 45, y: 80, color: '#FFE66D' }
];

const LiveVisitors = () => {
  const [visitors, setVisitors] = useState(MOCK_VISITORS);
  const [isConnected, setIsConnected] = useState(true); // Fakes connection state

  // MOCK REALTIME CURSORS - Replace with Supabase Presence
  useEffect(() => {
    // Simulating moving cursors around occasionally
    const interval = setInterval(() => {
      setVisitors(prev => prev.map(v => ({
        ...v,
        x: Math.min(100, Math.max(0, v.x + (Math.random() - 0.5) * 10)),
        y: Math.min(100, Math.max(0, v.y + (Math.random() - 0.5) * 10))
      })));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (!isConnected) return null;

  return (
    <>
      <div className="live-visitors-pill">
        <Users size={12} className="live-visitors-icon" />
        <span>{visitors.length} people exploring right now</span>
      </div>

      {/* Renders the fake cursors across the viewport */}
      <div className="live-cursors-overlay">
        {visitors.map(visitor => (
          <div 
            key={visitor.id} 
            className="remote-cursor"
            style={{ 
              left: `${visitor.x}vw`, 
              top: `${visitor.y}vh`,
              backgroundColor: visitor.color 
            }}
          />
        ))}
      </div>
    </>
  );
};

export default LiveVisitors;
