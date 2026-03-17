import { useState, useEffect } from 'react';
import { mockFlashcards } from '../data/flashcards';
import { speechService } from '../services/speechService';
import './QuizMode.css';

// Utility to get random items from an array
const getRandomItems = (arr, count) => {
    const shuffled = [...arr].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

export default function QuizMode({ category }) {
    const [cards, setCards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [options, setOptions] = useState([]);
    const [score, setScore] = useState({ correct: 0, incorrect: 0 });
    const [feedback, setFeedback] = useState(null); // 'correct' | 'incorrect'
    const [selectedOption, setSelectedOption] = useState(null);

    useEffect(() => {
        let filtered = mockFlashcards;
        if (category !== 'All words') {
            filtered = mockFlashcards.filter(c => c.category === category);
        }
        const shuffledCards = [...filtered].sort(() => 0.5 - Math.random());
        setCards(shuffledCards);
        setCurrentIndex(0);
        setScore({ correct: 0, incorrect: 0 });
    }, [category]);

    // Generate options when current card changes
    useEffect(() => {
        if (cards.length > 0 && currentIndex < cards.length) {
            const currentCard = cards[currentIndex];

            // Get 3 random WRONG options from the whole deck
            const otherCards = mockFlashcards.filter(c => c.id !== currentCard.id);
            const wrongOptions = getRandomItems(otherCards, 3);

            const allOptions = [currentCard, ...wrongOptions].sort(() => 0.5 - Math.random());
            setOptions(allOptions);
            setFeedback(null);
            setSelectedOption(null);
        }
    }, [currentIndex, cards]);

    const handleOptionClick = (option) => {
        if (feedback) return; // Prevent clicking multiple times

        const currentCard = cards[currentIndex];
        setSelectedOption(option);

        if (option.id === currentCard.id) {
            // Correct!
            setFeedback('correct');
            setScore(s => ({ ...s, correct: s.correct + 1 }));
            speechService.speak("Correct! " + currentCard.pronunciationText);

            // Auto advance
            setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
            }, 2000);

        } else {
            // Incorrect :(
            setFeedback('incorrect');
            setScore(s => ({ ...s, incorrect: s.incorrect + 1 }));
            speechService.speak("Oops! " + option.pronunciationText + "., It's a " + currentCard.pronunciationText);

            // Also auto-advance after showing correct answer
            setTimeout(() => {
                setCurrentIndex(prev => prev + 1);
            }, 3500);
        }
    };

    const restartQuiz = () => {
        const shuffledCards = [...cards].sort(() => 0.5 - Math.random());
        setCards(shuffledCards);
        setCurrentIndex(0);
        setScore({ correct: 0, incorrect: 0 });
    }

    if (cards.length === 0) return <div>Loading...</div>;

    if (currentIndex >= cards.length) {
        return (
            <div className="quiz-container anim-pop text-center">
                <h2 style={{ fontSize: '3rem', color: 'var(--color-primary)' }}>Quiz Complete! 🎉</h2>
                <div className="score-board final-score">
                    <div className="score correct">✅ {score.correct} Correct</div>
                    <div className="score incorrect">❌ {score.incorrect} Incorrect</div>
                </div>
                <br />
                <button className="btn-3d btn-secondary" onClick={restartQuiz}>Try Again</button>
            </div>
        );
    }

    const currentCard = cards[currentIndex];

    return (
        <div className="quiz-container anim-pop">
            <header className="quiz-header">
                <div className="score-board">
                    <span className="score correct">✅ {score.correct}</span>
                    <span className="score incorrect">❌ {score.incorrect}</span>
                </div>
                <div className="progress-indicator">
                    Question {currentIndex + 1} of {cards.length}
                </div>
            </header>

            <div className="quiz-image-container">
                {/* Placeholder for the image */}
                <span style={{ fontSize: '100px' }} role="img" aria-label="Guess the word">
                    {currentCard.emoji}
                </span>
            </div>

            <div className="quiz-options">
                {options.map((option, idx) => {
                    let btnClass = 'btn-quiz-option';
                    if (feedback && option.id === currentCard.id) {
                        btnClass += ' option-correct'; // Always highlight correct answer when feedback is shown
                    } else if (feedback === 'incorrect' && selectedOption?.id === option.id) {
                        btnClass += ' option-incorrect'; // Highlight the wrong answer chosen
                    }

                    return (
                        <button
                            key={option.id + '-' + idx}
                            className={`btn-3d ${btnClass}`}
                            onClick={() => handleOptionClick(option)}
                            disabled={feedback !== null}
                        >
                            {option.word}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
