import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import SidebarNav from './components/SidebarNav';
import Footer from './components/Footer';
import Home from './pages/Home';
import ArtGallery from './pages/ArtGallery';
import GameMode from './components/GameMode';
import { FlowFieldBackground } from './components/FlowFieldBackground';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <FlowFieldBackground />
      <NavBar />
      <SidebarNav />
      <GameMode />
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/art" element={<ArtGallery />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
  );
}

export default App;
