import { useState, useEffect } from 'react';
import { mockFlashcards } from '../data/flashcards';
import { speechService } from '../services/speechService';
import './SpellingMode.css';

export default function SpellingMode({ category }) {
    const [cards, setCards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [scrambledLetters, setScrambledLetters] = useState([]);
    const [placedLetters, setPlacedLetters] = useState([]);
    const [feedback, setFeedback] = useState(null); // 'correct' | 'error'
    const [errorIndex, setErrorIndex] = useState(null);

    useEffect(() => {
        let filtered = mockFlashcards;
        if (category !== 'Todas as palavras') {
            filtered = mockFlashcards.filter(c => c.category === category);
        }
        const shuffledCards = [...filtered].sort(() => 0.5 - Math.random());
        setCards(shuffledCards);
        setCurrentIndex(0);
    }, [category]);

    useEffect(() => {
        if (cards.length > 0 && currentIndex < cards.length) {
            setupWord(cards[currentIndex]);
        }
    }, [currentIndex, cards]);

    const setupWord = (card) => {
        const wordChars = card.word.split('');
        const lettersOnly = wordChars.filter(char => /[a-zA-Z]/.test(char));
        const shuffled = lettersOnly.sort(() => 0.5 - Math.random()).map((char, id) => ({ id, char, used: false }));
        
        let initialPlaced = wordChars.map(char => {
            if (/[a-zA-Z]/.test(char)) {
                return { isLetter: true, char: '', target: char };
            } else {
                return { isLetter: false, char: char, target: char }; 
            }
        });

        setScrambledLetters(shuffled);
        setPlacedLetters(initialPlaced);
        setFeedback(null);
        speechService.speak(card.pronunciationText);
    };

    const handleLetterClick = (letterObj) => {
        if (letterObj.used || feedback === 'correct') return;

        const nextEmptyIndex = placedLetters.findIndex(p => p.isLetter && p.char === '');
        if (nextEmptyIndex === -1) return;

        const targetChar = placedLetters[nextEmptyIndex].target.toLowerCase();
        
        if (letterObj.char.toLowerCase() === targetChar) {
            const newPlaced = [...placedLetters];
            newPlaced[nextEmptyIndex].char = letterObj.char;
            setPlacedLetters(newPlaced);

            const newScrambled = scrambledLetters.map(l => l.id === letterObj.id ? { ...l, used: true } : l);
            setScrambledLetters(newScrambled);
            setFeedback(null);

            if (newPlaced.every(p => !p.isLetter || p.char !== '')) {
                setFeedback('correct');
                speechService.speak("Well done! " + cards[currentIndex].pronunciationText);
                setTimeout(() => {
                    setCurrentIndex(prev => prev + 1);
                }, 2500);
            }
        } else {
            setErrorIndex(letterObj.id);
            setTimeout(() => setErrorIndex(null), 500); 
        }
    };

    const restartQuiz = () => {
        const shuffledCards = [...cards].sort(() => 0.5 - Math.random());
        setCards(shuffledCards);
        setCurrentIndex(0);
    }

    if (cards.length === 0) return <div>Carregando...</div>;

    if (currentIndex >= cards.length) {
        return (
            <div className="spelling-container anim-pop text-center">
                <h2 style={{ fontSize: '3rem', color: 'var(--color-primary)' }}>Concluído! 🎉</h2>
                <br />
                <button className="btn-3d btn-secondary" onClick={restartQuiz}>Jogar Novamente</button>
            </div>
        );
    }

    const currentCard = cards[currentIndex];

    return (
        <div className="spelling-container anim-pop">
            <header className="spelling-header">
                   <div className="progress-indicator">
                    Palavra {currentIndex + 1} de {cards.length}
                </div>
            </header>

            <div className="spelling-image-container">
                <span style={{ fontSize: '100px' }} role="img" aria-label="Guess the word">
                    {currentCard.emoji}
                </span>
            </div>

            <div className="audio-controls">
                 <button className="btn-3d btn-accent play-audio-btn large-audio" onClick={() => speechService.speak(currentCard.pronunciationText)}>
                     <span className="icon">🔊</span> Ouvir A Palavra
                 </button>
            </div>

            <div className="word-slots">
                {placedLetters.map((slot, idx) => (
                    <div key={idx} className={`slot ${slot.isLetter ? 'letter-slot' : 'punctuation-slot'} ${slot.char ? 'filled' : ''}`}>
                        {slot.char || ''}
                    </div>
                ))}
            </div>

            <div className="scrambled-letters">
                {scrambledLetters.map(letterObj => (
                    <button
                        key={letterObj.id}
                        className={`btn-3d letter-btn ${letterObj.used ? 'used' : ''} ${errorIndex === letterObj.id ? 'shake-error' : ''}`}
                        onClick={() => handleLetterClick(letterObj)}
                    >
                        {letterObj.char}
                    </button>
                ))}
            </div>

            {feedback === 'correct' && (
                <div className="feedback-correct anim-pop">
                    ✨ Correto! ✨
                </div>
            )}
        </div>
    );
}
