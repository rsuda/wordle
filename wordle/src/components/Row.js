import React from 'react';
import Tile from './Tile';
import './Row.css';

function Row({ guess, solution, isSubmitted, shake, lockedPosition, isCurrentRow, rowIndex, isWinningRow }) {
  const tiles = [];
  
  for (let i = 0; i < 5; i++) {
    const letter = guess[i] || '';
    let state = '';
    
    // If this is the winning row, all tiles should be green
    if (isWinningRow) {
      state = 'correct';
    }
    // Check if this position is locked AND we're on row 3 (4th turn) and it's the current row
    else if (lockedPosition && lockedPosition.position === i && isCurrentRow && rowIndex === 3) {
      state = 'correct';
    } 
    else if (isSubmitted && letter) {
      if (solution[i] === letter) {
        state = 'correct';
      } else if (solution.includes(letter)) {
        state = 'present';
      } else {
        state = 'absent';
      }
    }
    
    tiles.push(
      <Tile 
        key={i} 
        letter={letter} 
        state={state}
      />
    );
  }
  
  return (
    <div className={`row ${shake ? 'shake' : ''}`}>
      {tiles}
    </div>
  );
}

export default Row;