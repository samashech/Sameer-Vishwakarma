import LiveIoTWidget from './LiveIoTWidget';

const Footer = () => {
  return (
    <footer style={{
      textAlign: 'center',
      padding: '20px',
      color: 'var(--slate)',
      fontFamily: 'Menlo, Consolas, Monaco, monospace',
      fontSize: '12px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px'
    }}>
      <p>Built and designed by Sameer Vishwakarma. All rights reserved.</p>
      <LiveIoTWidget />
    </footer>
  );
};

export default Footer;
