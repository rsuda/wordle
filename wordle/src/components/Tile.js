import React from 'react';
import './Tile.css';

function Tile({ letter, state }) {
  return (
    <div className={`tile ${letter ? 'filled' : ''} ${state}`}>
      {letter}
    </div>
  );
}

export default Tile;