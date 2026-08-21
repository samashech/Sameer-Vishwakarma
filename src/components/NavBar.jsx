import { useState, useEffect } from 'react';
import { Menu, X, Mail } from 'lucide-react';
import { GithubIcon, InstagramIcon } from './Icons';
import './NavBar.css';

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const navLinks = [
    { name: '/ about', href: '#about' },
    { name: '/ experience', href: '#experience' },
    { name: '/ projects', href: '#projects' },
    { name: '/ art', href: '#art' }
  ];

  return (
    <header className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="nav-container">
        <div className="logo">
          <a href="#">Samashech</a>
        </div>

        <div className="desktop-nav">
          <ul className="nav-links">
            {navLinks.map((link, i) => (
              <li key={i} style={{ animationDelay: `${i * 100}ms` }}>
                <a href={link.href}>{link.name}</a>
              </li>
            ))}
          </ul>
          <div className="social-links">
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
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 998 }}
        />
      )}
      {/* Mobile Menu */}

      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        <ul className="mobile-nav-links">
          {navLinks.map((link, i) => (
            <li key={i}>
              <a href={link.href} onClick={toggleMenu}>{link.name}</a>
            </li>
          ))}
        </ul>
        <div className="mobile-social-links">
          <a href="mailto:sameervishwakarmaa12@gmail.com"><Mail size={24} /></a>
          <a href="https://github.com/samashech"><GithubIcon size={24} /></a>
          <a href="https://www.instagram.com/samashech?igsh=MW81bXhvN3BsYjJxMQ=="><InstagramIcon size={24} /></a>
        </div>
      </div>
    </header>
  );
};

export default NavBar;
