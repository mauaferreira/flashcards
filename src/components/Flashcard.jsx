import { useState, useEffect } from 'react';
import { speechService } from '../services/speechService';
import './Flashcard.css';

export default function Flashcard({
    card,
    autoPlay = false,
    speed = 1.0,
    onFlip = null
}) {
    const [isFlipped, setIsFlipped] = useState(false);

    // Reset flip state if the card changes
    useEffect(() => {
        setIsFlipped(false);
    }, [card]);

    // Handle autoPlay specific logic if needed
    useEffect(() => {
        if (autoPlay && isFlipped) {
            speechService.speak(card.pronunciationText, speed);
        }
    }, [isFlipped, autoPlay, card, speed]);

    const handleFlip = () => {
        if (!isFlipped) {
            // First time flipping: speak the word
            speechService.speak(card.pronunciationText, speed);
            if (onFlip) onFlip();
        }
        setIsFlipped(!isFlipped);
    };

    const playAudio = (e) => {
        e.stopPropagation(); // Prevent flipping when clicking audio btn
        speechService.speak(card.pronunciationText, speed);
    };

    return (
        <div className={`flashcard-container ${isFlipped ? 'flipped' : ''}`} onClick={handleFlip}>
            <div className="flashcard-inner">
                {/* FRONT */}
                <div className="flashcard-front">
                    <div className="card-image-placeholder">
                        {/* Using emoji as fallback if image fails, but normally we'd do <img src={card.image} /> */}
                        <span style={{ fontSize: '120px' }} role="img" aria-label={card.word}>
                            {card.emoji}
                        </span>
                    </div>
                    <div className="card-hint">Tap to flip</div>
                </div>

                {/* BACK */}
                <div className="flashcard-back">
                    <div className="card-image-placeholder small-img">
                        <span style={{ fontSize: '60px' }} role="img" aria-label={card.word}>
                            {card.emoji}
                        </span>
                    </div>
                    <h2 className="card-word">{card.word}</h2>

                    <div className="card-controls">
                        <button className="btn-3d btn-primary play-audio-btn" onClick={playAudio}>
                            <span className="icon">🔊</span> Hear pronunciation
                        </button>
                        <button className="btn-3d btn-accent repeat-btn" onClick={playAudio}>
                            <span className="icon">🔄</span> Repeat
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
