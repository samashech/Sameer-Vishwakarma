import { useState, useEffect, useRef } from 'react';
import './TerminalEgg.css';

const TerminalEgg = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [history, setHistory] = useState([
    { type: 'system', content: 'SameerOS v1.0.0 (tty1)' },
    { type: 'system', content: 'Type "help" to see available commands.' }
  ]);
  const [input, setInput] = useState('');
  const [historyIndex, setHistoryIndex] = useState(-1);
  const inputRef = useRef(null);
  const terminalEndRef = useRef(null);
  
  const commands = useRef([]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle on backtick
      if (e.key === '`') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };
    const handleCustomToggle = () => {
      setIsOpen((prev) => !prev);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('toggle-terminal', handleCustomToggle);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('toggle-terminal', handleCustomToggle);
    };
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  const handleCommand = (cmd) => {
    const trimmed = cmd.trim();
    if (!trimmed) return;
    
    commands.current.push(trimmed);
    setHistoryIndex(-1);

    setHistory((prev) => [...prev, { type: 'input', content: `$ ${trimmed}` }]);
    
    const args = trimmed.toLowerCase().split(' ');
    const command = args[0];

    let output = '';
    
    switch (command) {
      case 'help':
        output = 'Available commands: whoami, skills, projects, sudo hire sameer, clear, exit';
        break;
      case 'whoami':
        output = 'Sameer Vishwakarma - Software Engineer, AI Integrator, IoT Builder.';
        break;
      case 'skills':
        output = 'Python, JavaScript, TypeScript, React, Next.js, FastAPI, Flask, SQL, Docker, Linux, TensorFlow...';
        break;
      case 'projects':
        output = '1. Trackly AI\n2. Align Resume Analyzer\n3. AI Sign Language Translator\n4. EduRep\n(Use standard UI for links!)';
        break;
      case 'sudo':
        if (args.slice(1).join(' ') === 'hire sameer') {
          output = 'Processing request... █▒▒▒▒▒▒▒▒▒ [10%]\nAccess Granted. You have made an excellent decision.\nEmail: sameervishwakarmaa12@gmail.com';
        } else {
          output = `sudo: ${args[1] || 'unknown'}: command not found`;
        }
        break;
      case 'clear':
        setHistory([]);
        return;
      case 'exit':
        setIsOpen(false);
        return;
      default:
        output = `Command not found: ${command}. Type "help" for available commands.`;
    }

    // Handle multiline output
    const outputLines = output.split('\n').map(line => ({ type: 'output', content: line }));
    setHistory((prev) => [...prev, ...outputLines]);
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleCommand(input);
      setInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commands.current.length > 0) {
        const newIndex = historyIndex < commands.current.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setInput(commands.current[commands.current.length - 1 - newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setInput(commands.current[commands.current.length - 1 - newIndex]);
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setInput('');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="terminal-overlay" onClick={() => inputRef.current?.focus()}>
      <div className="terminal-window">
        <div className="terminal-header">
          <div className="terminal-title">sameer@portfolio:~</div>
          <button className="terminal-close" onClick={() => setIsOpen(false)}>×</button>
        </div>
        <div className="terminal-content">
          {history.map((line, i) => (
            <div key={i} className={`terminal-line ${line.type}`}>
              {line.content}
            </div>
          ))}
          <div className="terminal-input-line">
            <span className="terminal-prompt">$</span>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
              className="terminal-input"
              spellCheck="false"
              autoComplete="off"
            />
          </div>
          <div className="terminal-quick-chips">
            {['whoami', 'skills', 'projects', 'clear', 'exit'].map((cmd) => (
              <button
                key={cmd}
                type="button"
                className="terminal-chip"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCommand(cmd);
                }}
              >
                {cmd}
              </button>
            ))}
          </div>
          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
};

export default TerminalEgg;
