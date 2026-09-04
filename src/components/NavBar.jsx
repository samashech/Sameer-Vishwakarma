import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, Mail, Eye, EyeOff, Terminal, Gamepad2 } from 'lucide-react';
import { GithubIcon, InstagramIcon } from './Icons';
import { useReducedMotion } from '../hooks/useReducedMotion';
import './NavBar.css';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { isReducedMotion, toggleReducedMotion } = useReducedMotion();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const navLinks = [
    { name: '/ home', href: '/' },
    { name: '/ about', href: '/#about' },
    { name: '/ experience', href: '/#experience' },
    { name: '/ projects', href: '/#projects' },
    { name: '/ art', href: '/#art' }
  ];

  const handleNavClick = (e, href) => {
    e.preventDefault();
    setIsOpen(false);
    
    const navigateTo = () => {
      if (href.startsWith('/#')) {
        if (location.pathname !== '/') {
          navigate('/');
          setTimeout(() => {
            const el = document.getElementById(href.substring(2));
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        } else {
          const el = document.getElementById(href.substring(2));
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        navigate(href);
      }
    };

    if (!document.startViewTransition || isReducedMotion) {
      navigateTo();
    } else {
      document.startViewTransition(() => {
        navigateTo();
      });
    }
  };

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <div className="logo">
          <a href="/" onClick={(e) => handleNavClick(e, '/')}>Samashech</a>
        </div>

        <div className="desktop-nav">
          <ul className="nav-links">
            {navLinks.map((link, i) => (
              <li key={i} style={{ animationDelay: `${i * 100}ms` }}>
                <a href={link.href} onClick={(e) => handleNavClick(e, link.href)}>{link.name}</a>
              </li>
            ))}
          </ul>
          <div className="social-links">
            <button 
              onClick={toggleReducedMotion} 
              aria-label="Toggle Reduced Motion"
              className="motion-toggle-btn"
              style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
            >
              {isReducedMotion ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            <a href="mailto:sameervishwakarmaa12@gmail.com" aria-label="Email"><Mail size={20} /></a>
            <a href="https://github.com/samashech" target="_blank" rel="noreferrer" aria-label="GitHub"><GithubIcon size={20} /></a>
            <a href="https://www.instagram.com/samashech?igsh=MW81bXhvN3BsYjJxMQ==" target="_blank" rel="noreferrer" aria-label="Instagram"><InstagramIcon size={20} /></a>
          </div>
        </div>

        <button className="mobile-menu-btn" onClick={toggleMenu} aria-label="Menu">
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="mobile-overlay" 
          onClick={toggleMenu} 
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu */}
      <div className={`mobile-menu ${isOpen ? 'open' : ''}`} aria-hidden={!isOpen}>
        <ul className="mobile-nav-links">
          {navLinks.map((link, i) => (
            <li key={i}>
              <a href={link.href} onClick={(e) => handleNavClick(e, link.href)}>{link.name}</a>
            </li>
          ))}
        </ul>

        <div className="mobile-utilities">
          <button 
            onClick={toggleReducedMotion} 
            aria-label="Toggle Reduced Motion"
            className="mobile-utility-btn"
          >
            {isReducedMotion ? <EyeOff size={18} /> : <Eye size={18} />}
            <span>{isReducedMotion ? 'Motion: Off' : 'Motion: On'}</span>
          </button>

          <button 
            className="mobile-utility-btn"
            onClick={() => {
              setIsOpen(false);
              window.dispatchEvent(new CustomEvent('toggle-terminal'));
            }}
            aria-label="Open Terminal"
          >
            <Terminal size={18} />
            <span>Terminal CLI</span>
          </button>

          <button 
            className="mobile-utility-btn"
            onClick={() => {
              setIsOpen(false);
              window.dispatchEvent(new CustomEvent('toggle-game-mode'));
            }}
            aria-label="Toggle Game Mode"
          >
            <Gamepad2 size={18} />
            <span>Play Game</span>
          </button>
        </div>

        <div className="mobile-social-links">
          <a href="mailto:sameervishwakarmaa12@gmail.com" aria-label="Email"><Mail size={24} /></a>
          <a href="https://github.com/samashech" target="_blank" rel="noreferrer" aria-label="GitHub"><GithubIcon size={24} /></a>
          <a href="https://www.instagram.com/samashech?igsh=MW81bXhvN3BsYjJxMQ==" target="_blank" rel="noreferrer" aria-label="Instagram"><InstagramIcon size={24} /></a>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
