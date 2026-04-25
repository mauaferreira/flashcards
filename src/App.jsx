import { useState } from 'react';
import { mockFlashcards, getCategories } from './data/flashcards';
import FlashcardsMode from './components/FlashcardsMode';
import AutoPlayMode from './components/AutoPlayMode';
import QuizMode from './components/QuizMode';
import SpellingMode from './components/SpellingMode';

function App() {
  const [currentView, setCurrentView] = useState('home'); // home, flashcards, autoplay, quiz, spelling
  const [selectedCategory, setSelectedCategory] = useState('Todas as palavras');

  const handleStartMode = (mode) => {
    setCurrentView(mode);
  };

  return (
    <div className="container">
      {currentView === 'home' && (
        <Home
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          onStart={handleStartMode}
        />
      )}
      {currentView !== 'home' && (
        <button
          className="btn-3d btn-secondary"
          onClick={() => setCurrentView('home')}
          style={{ alignSelf: 'flex-start', marginBottom: '20px', padding: '10px 20px', fontSize: '1rem' }}
        >
          ← Voltar ao Início
        </button>
      )}

      {currentView === 'flashcards' && <FlashcardsMode category={selectedCategory} />}
      {currentView === 'autoplay' && <AutoPlayMode category={selectedCategory} />}
      {currentView === 'quiz' && <QuizMode category={selectedCategory} />}
      {currentView === 'spelling' && <SpellingMode category={selectedCategory} />}
    </div>
  );
}

function Home({ selectedCategory, setSelectedCategory, onStart }) {
  const categories = getCategories();

  return (
    <div className="home-screen text-center anim-pop" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '40px' }}>
      <header>
        <h1 style={{ fontSize: '3rem', color: 'var(--color-primary)', marginBottom: '12px' }}>Flashcards em Inglês</h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--color-text-muted)' }}>Toque no card, aprenda a palavra e ouça a pronúncia!</p>
      </header>

      <div className="category-selector" style={{ display: 'flex', flexDirection: 'column', gap: '16px', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--color-secondary)' }}>Escolha uma Categoria</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center', maxWidth: '600px' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`btn-3d ${cat === selectedCategory ? 'btn-primary' : ''}`}
              style={{
                backgroundColor: cat !== selectedCategory ? 'var(--color-surface)' : '',
                color: cat !== selectedCategory ? 'var(--color-text-dark)' : '',
                boxShadow: cat !== selectedCategory ? '0 4px 0 0 #dfe6e9, 0 4px 10px rgba(0,0,0,0.05)' : ''
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="modes" style={{ display: 'flex', gap: '20px', marginTop: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn-3d btn-primary" onClick={() => onStart('flashcards')} style={{ fontSize: '1.5rem' }}>
          🃏 Cartões
        </button>
        <button className="btn-3d btn-accent" onClick={() => onStart('autoplay')} style={{ fontSize: '1.5rem' }}>
          ▶️ Tocar Auto
        </button>
        <button className="btn-3d btn-secondary" onClick={() => onStart('quiz')} style={{ fontSize: '1.5rem' }}>
          ❓ Quiz
        </button>
        <button className="btn-3d" onClick={() => onStart('spelling')} style={{ fontSize: '1.5rem', backgroundColor: '#e84393', color: 'white' }}>
          🔡 Escrever
        </button>
      </div>
    </div>
  );
}

export default App;
