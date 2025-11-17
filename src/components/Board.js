import React from 'react';
import Row from './Row';
import './Board.css';
import giftIcon from '../icons/gift-duotone.svg';

function Board({ guesses, currentGuess, currentRow, solution, shake, powerUpRow, powerUpUsed, powerUpAvailable, onPowerUpClick, lockedPosition, isWinner }) {
  // Find the winning row index
  let winningRowIndex = -1;
  if (isWinner) {
    winningRowIndex = guesses.findIndex(guess => guess.toUpperCase() === solution.toUpperCase());
  }

  return (
    <div className="board">
      {guesses.map((guess, i) => (
        <div key={i} className="row-container">
          {i === powerUpRow && !powerUpUsed && (
            <div 
              className={`powerup-indicator ${powerUpAvailable ? 'wiggle clickable' : ''}`}
              onClick={powerUpAvailable ? onPowerUpClick : undefined}
            >
              <img src={giftIcon} alt="Power-up" className="powerup-badge-svg" />
            </div>
          )}
          <Row
            guess={i === currentRow ? currentGuess : guess}
            solution={solution}
            isSubmitted={i < currentRow}
            shake={shake && i === currentRow}
            lockedPosition={lockedPosition}
            isCurrentRow={i === currentRow}
            rowIndex={i}
            isWinningRow={isWinner && i === winningRowIndex}
          />
        </div>
      ))}
    </div>
  );
}

export default Board;