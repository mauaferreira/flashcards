import { useState, useEffect } from 'react';
import { mockFlashcards } from '../data/flashcards';
import Flashcard from './Flashcard';
import './FlashcardsMode.css';
import { speechService } from '../services/speechService';

export default function FlashcardsMode({ category }) {
    const [cards, setCards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        let filtered = mockFlashcards;
        if (category !== 'All words') {
            filtered = mockFlashcards.filter(c => c.category === category);
        }
        setCards(filtered);
        setCurrentIndex(0);
    }, [category]);

    const shuffleCards = () => {
        const shuffled = [...cards].sort(() => Math.random() - 0.5);
        setCards(shuffled);
        setCurrentIndex(0);
    };

    const nextCard = () => {
        if (currentIndex < cards.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    const prevCard = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const restart = () => {
        setCurrentIndex(0);
    };

    if (cards.length === 0) return <div>Loading...</div>;

    return (
        <div className="mode-container anim-pop">
            <header className="mode-header">
                <h2 className="mode-title">{category}</h2>
                <div className="progress-indicator">
                    Card {currentIndex + 1} of {cards.length}
                </div>
            </header>

            <div className="flashcard-wrapper">
                <Flashcard card={cards[currentIndex]} />
            </div>

            <div className="navigation-controls">
                <button
                    className="btn-icon"
                    onClick={prevCard}
                    disabled={currentIndex === 0}
                    aria-label="Previous card"
                >
                    ◀
                </button>

                <div className="center-controls">
                    <button className="btn-secondary-outline" onClick={shuffleCards}>
                        🔀 Shuffle
                    </button>
                    <button className="btn-secondary-outline" onClick={restart}>
                        🔄 Restart
                    </button>
                </div>

                <button
                    className="btn-icon"
                    onClick={nextCard}
                    disabled={currentIndex === cards.length - 1}
                    aria-label="Next card"
                >
                    ▶
                </button>
            </div>
        </div>
    );
}
