import { useState, useEffect } from 'react';

// Global singleton to track motion preference so we don't need a context provider
let isReducedMotionGlobal = false;
const listeners = new Set();

const updateGlobalMotion = (value) => {
  isReducedMotionGlobal = value;
  if (value) {
    document.documentElement.setAttribute('data-reduced-motion', 'true');
  } else {
    document.documentElement.removeAttribute('data-reduced-motion');
  }
  listeners.forEach(listener => listener(value));
};

export const initReducedMotion = () => {
  if (typeof window !== 'undefined') {
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const saved = localStorage.getItem('reduced-motion');
    const initialValue = saved !== null ? saved === 'true' : prefersReduced;
    updateGlobalMotion(initialValue);
  }
};

export const useReducedMotion = () => {
  const [isReducedMotion, setIsReducedMotion] = useState(isReducedMotionGlobal);

  useEffect(() => {
    listeners.add(setIsReducedMotion);
    setIsReducedMotion(isReducedMotionGlobal);
    return () => listeners.delete(setIsReducedMotion);
  }, []);

  const toggleReducedMotion = () => {
    const newValue = !isReducedMotion;
    localStorage.setItem('reduced-motion', String(newValue));
    updateGlobalMotion(newValue);
  };

  return { isReducedMotion, toggleReducedMotion };
};
