import { useState, useEffect } from 'react';
import { Activity, Thermometer } from 'lucide-react';
import './LiveIoTWidget.css';

const LiveIoTWidget = () => {
  const [reading, setReading] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [timeAgo, setTimeAgo] = useState('just now');
  const [isOffline, setIsOffline] = useState(false);

  // MOCK DATA STREAM - Replace this effect with your Supabase/Firebase listener
  useEffect(() => {
    const fetchMockReading = () => {
      // Simulate a temp reading between 22.0C and 25.0C
      const temp = (22 + Math.random() * 3).toFixed(1);
      setReading(`${temp}°C`);
      setLastUpdated(Date.now());
      setIsOffline(false);
    };

    // Initial fetch
    fetchMockReading();

    // Push a reading every 45 seconds (mocking a sensor)
    const interval = setInterval(fetchMockReading, 45000);
    return () => clearInterval(interval);
  }, []);

  // Timer to update the "X seconds ago" relative timestamp
  useEffect(() => {
    const updateTimeAgo = () => {
      const seconds = Math.floor((Date.now() - lastUpdated) / 1000);
      
      if (seconds > 120) {
        setIsOffline(true);
        setTimeAgo('offline');
      } else if (seconds > 60) {
        setTimeAgo(`${Math.floor(seconds / 60)}m ago`);
      } else {
        setTimeAgo(`${seconds}s ago`);
      }
    };

    const timer = setInterval(updateTimeAgo, 1000);
    return () => clearInterval(timer);
  }, [lastUpdated]);

  return (
    <div className={`live-iot-widget ${isOffline ? 'offline' : 'online'}`}>
      <div className="iot-indicator">
        <Activity size={12} className={isOffline ? 'pulse-stopped' : 'pulse-active'} />
      </div>
      <div className="iot-content">
        <span className="iot-label">
          <Thermometer size={12} style={{ marginRight: '4px' }}/>
          RAIoT Lab Temp:
        </span>
        {isOffline ? (
          <span className="iot-value offline-text">lab offline right now</span>
        ) : (
          <>
            <span className="iot-value">{reading}</span>
            <span className="iot-time">({timeAgo})</span>
          </>
        )}
      </div>
    </div>
  );
};

export default LiveIoTWidget;
