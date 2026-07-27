import { useState } from 'react';
import LandingPage from './components/LandingPage';
import GameCanvas from './components/GameCanvas';

function App() {
  const [currentView, setCurrentView] = useState('landing'); // 'landing' | 'game'
  const [gameMode, setGameMode] = useState(null); // 'bot' | 'online'

  const handleEnter = () => {
    // Scroll to mode selector smoothly
    const modeSelector = document.querySelector('#mode-selector');
    if (modeSelector) {
      modeSelector.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleSelectMode = (mode) => {
    setGameMode(mode);
    setCurrentView('game');
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    setGameMode(null);
  };

  return (
    <>
      {currentView === 'landing' ? (
        <LandingPage onEnter={handleEnter} onSelectMode={handleSelectMode} />
      ) : (
        <GameCanvas mode={gameMode} onBack={handleBackToLanding} />
      )}
    </>
  );
}

export default App;

