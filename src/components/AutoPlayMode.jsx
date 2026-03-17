import { useState, useEffect, useRef } from 'react';
import { mockFlashcards } from '../data/flashcards';
import Flashcard from './Flashcard';
import './FlashcardsMode.css'; // Reuse some layout styles
import './AutoPlayMode.css';

export default function AutoPlayMode({ category }) {
    const [cards, setCards] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [speed, setSpeed] = useState('normal'); // 'slow' | 'normal'

    const timerRef = useRef(null);

    // Timing configuration (ms)
    const timings = {
        normal: { flipDelay: 2500, nextDelay: 6000 },
        slow: { flipDelay: 4000, nextDelay: 9000 }
    };

    useEffect(() => {
        let filtered = mockFlashcards;
        if (category !== 'All words') {
            filtered = mockFlashcards.filter(c => c.category === category);
        }
        setCards(filtered);
        setCurrentIndex(0);
        setIsPlaying(false);

        return () => clearInterval(timerRef.current);
    }, [category]);

    // Handle advancing to the next card
    const handleNext = () => {
        setCurrentIndex((prev) => {
            // If at end, loop back or stop (we'll loop for auto play)
            return prev < cards.length - 1 ? prev + 1 : 0;
        });
    };

    useEffect(() => {
        if (isPlaying && cards.length > 0) {
            const currentTimings = timings[speed];

            // Auto advance to next card after full cycle
            timerRef.current = setInterval(() => {
                handleNext();
            }, currentTimings.nextDelay);

            return () => clearInterval(timerRef.current);
        }
    }, [isPlaying, currentIndex, speed, cards.length]);

    const togglePlay = () => setIsPlaying(!isPlaying);
    const toggleSpeed = () => setSpeed(speed === 'normal' ? 'slow' : 'normal');
    const nextCard = () => { setIsPlaying(false); handleNext(); };
    const prevCard = () => {
        setIsPlaying(false);
        if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
    };

    if (cards.length === 0) return <div>Loading...</div>;

    // Key prop forces a re-mount, but we want the same component to flip itself.
    // Actually, for AutoPlay, the card flipper needs to open automatically.
    // We pass `autoPlay={isPlaying}` and a unique key combining index + playing state isn't good.
    // But wait, our Flashcard component uses generic React state. Let's create an `AutoFlippingCard` or 
    // we can use a generic auto key `flipSignal` but wait. Let's just pass `triggerAutoFlip` as a prop.

    return (
        <div className="mode-container anim-pop">
            <header className="mode-header">
                <h2 className="mode-title">Auto Play: {category}</h2>
                <div className="progress-indicator">
                    Card {currentIndex + 1} of {cards.length}
                </div>
            </header>

            <div className="flashcard-wrapper">
                {/* We use a key so the card fully resets when index changes */}
                <AutoFlippingCard
                    key={currentIndex}
                    card={cards[currentIndex]}
                    isPlaying={isPlaying}
                    speed={speed}
                    timings={timings[speed]}
                />
            </div>

            <div className="autoplay-controls">
                <div className="speed-toggle">
                    <button className={`btn-speed ${speed === 'slow' ? 'active' : ''}`} onClick={() => { setSpeed('slow'); setIsPlaying(true); }}>🐢 Slow</button>
                    <button className={`btn-speed ${speed === 'normal' ? 'active' : ''}`} onClick={() => { setSpeed('normal'); setIsPlaying(true); }}>🐇 Normal</button>
                </div>

                <div className="playback-controls">
                    <button className="btn-icon" onClick={prevCard} disabled={currentIndex === 0}>◀</button>
                    <button className={`btn-3d ${isPlaying ? 'btn-accent' : 'btn-primary'} play-pause-btn`} onClick={togglePlay}>
                        {isPlaying ? '⏸ Pause' : '▶ Play'}
                    </button>
                    <button className="btn-icon" onClick={nextCard}>▶</button>
                </div>
            </div>
        </div>
    );
}

// Wrapper for the Flashcard that handles auto-flipping
function AutoFlippingCard({ card, isPlaying, speed, timings }) {
    const [localFlipped, setLocalFlipped] = useState(false);
    const speechRate = speed === 'slow' ? 0.7 : 1.0;

    useEffect(() => {
        let timeout;
        if (isPlaying && !localFlipped) {
            timeout = setTimeout(() => {
                setLocalFlipped(true);
            }, timings.flipDelay);
        }
        return () => clearTimeout(timeout);
    }, [isPlaying, localFlipped, timings.flipDelay]);

    return (
        <Flashcard
            key={`fc-${card.id}-${localFlipped}`} // Trick to force card update if needed, but actually we need the internal state of Flashcard.
            // Wait, Flashcard has its own internal state, so we either lift it or bypass it.
            // Easiest is to force flip via props or render a specialized card. To keep things DRY, let's implement a prop `isFlippedExternal` in Flashcard if it exists, or just pass `autoPlay={true}` and let Flashcard handle speech.
            // I'll actually modify Flashcard to accept `forceFlip`. But for now, let's just use `autoPlay` as a prop and pass `speechRate`.
            card={card}
            autoPlay={isPlaying && localFlipped}
            speed={speechRate}
        />
    );
}
