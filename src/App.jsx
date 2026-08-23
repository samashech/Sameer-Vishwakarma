import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import SidebarNav from './components/SidebarNav';
import Footer from './components/Footer';
import Home from './pages/Home';
import './App.css';

const GameMode = lazy(() => import('./components/GameMode'));
const FlowFieldBackground = lazy(() => import('./components/FlowFieldBackground').then(module => ({ default: module.FlowFieldBackground })));
const TerminalEgg = lazy(() => import('./components/TerminalEgg'));
const LiveVisitors = lazy(() => import('./components/LiveVisitors'));

function App() {
  return (
    <div className="app-container">
      <Suspense fallback={null}>
        <FlowFieldBackground />
      </Suspense>
      <NavBar />
      <SidebarNav />
      <Suspense fallback={null}>
        <GameMode />
        <TerminalEgg />
        <LiveVisitors />
      </Suspense>
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
