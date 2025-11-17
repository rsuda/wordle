import React from 'react';
import './Keyboard.css';

const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'DELETE']
];

function Keyboard({ onKeyPress, onEnter, onDelete, letterStates, disabled, lockedLetters }) {
  const handleClick = (key) => {
    if (disabled) return;
    
    if (key === 'ENTER') {
      onEnter();
    } else if (key === 'DELETE') {
      onDelete();
    } else {
      // Check if letter is locked before allowing click
      if (!lockedLetters.has(key)) {
        onKeyPress(key);
      }
    }
  };

  return (
    <div className="keyboard">
      {KEYBOARD_ROWS.map((row, i) => (
        <div key={i} className="keyboard-row">
          {row.map((key) => {
            const state = letterStates[key] || '';
            const isSpecial = key === 'ENTER' || key === 'DELETE';
            const isLocked = lockedLetters.has(key);
            
            return (
              <button
                key={key}
                className={`key ${state} ${isSpecial ? 'special' : ''} ${isLocked ? 'locked' : ''}`}
                onClick={() => handleClick(key)}
                disabled={disabled || isLocked}
              >
                {key === 'DELETE' ? '⌫' : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}

export default Keyboard;