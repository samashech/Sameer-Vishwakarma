import { Routes, Route } from 'react-router-dom';
import NavBar from './components/NavBar';
import SidebarNav from './components/SidebarNav';
import Footer from './components/Footer';
import Home from './pages/Home';
import GameMode from './components/GameMode';
import './App.css';

function App() {
  return (
    <div className="app-container">
      <NavBar />
      <SidebarNav />
      <GameMode />
      
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
