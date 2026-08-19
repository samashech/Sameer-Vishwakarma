import { useState, useEffect } from 'react';
import './SidebarNav.css';

const SidebarNav = () => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const links = [
    { name: '/ home', href: '#' },
    { name: '/ about', href: '#about' },
    { name: '/ experience', href: '#experience' },
    { name: '/ projects', href: '#projects' }
  ];

  if (!mounted) return null;

  return (
    <nav className="sidebar-nav">
      <ul>
        {links.map((link, i) => (
          <li 
            key={i} 
            className="fade-in-nav" 
            style={{ animationDelay: `${i * 150 + 500}ms` }}
          >
            <a href={link.href}>{link.name}</a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default SidebarNav;
