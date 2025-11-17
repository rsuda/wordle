import React from 'react';
import './Modal.css';

function Modal({ isOpen, gameStatus, solution, guesses, onPlayAgain }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>{gameStatus === 'won' ? '🎉 You Won!' : '😔 Game Over'}</h2>
        <p className="solution">The word was: <strong>{solution}</strong></p>
        <p className="guesses">You guessed it in {guesses.length} {guesses.length === 1 ? 'try' : 'tries'}!</p>
        <button onClick={onPlayAgain} className="play-again-btn">
          Play Again
        </button>
      </div>
    </div>
  );
}

export default Modal;