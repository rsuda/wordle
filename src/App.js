import React, { useState, useEffect } from 'react';
import './App.css';
import Board from './components/Board';
import Keyboard from './components/Keyboard';
import { WORDS, ANSWERS } from './data/words';
import removeLettersIcon from './icons/removeLetters.svg';
import revealFirstLetterIcon from './icons/revealFirstLetter.svg';
import revealLettersIcon from './icons/revealLetters.svg';
import giftIcon from './icons/gift-duotone.svg';
import infoIcon from './icons/info-bold.svg';

function App() {
  const [solution, setSolution] = useState('');
  const [guesses, setGuesses] = useState(Array(6).fill(''));
  const [currentGuess, setCurrentGuess] = useState('');
  const [currentRow, setCurrentRow] = useState(0);
  const [gameStatus, setGameStatus] = useState('playing');
  const [letterStates, setLetterStates] = useState({});
  const [lockedLetters, setLockedLetters] = useState(new Set());
  const [shake, setShake] = useState(false);
  const [remainingWords, setRemainingWords] = useState(0);
  const [showPowerUp, setShowPowerUp] = useState(false);
  const [powerUpUsed, setPowerUpUsed] = useState(false);
  const [powerUpAvailable, setPowerUpAvailable] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '' });
  const [lockedPosition, setLockedPosition] = useState(null);
  const [showWelcome, setShowWelcome] = useState(true);
  const [welcomePage, setWelcomePage] = useState(1);

  useEffect(() => {
    const randomAnswer = ANSWERS[Math.floor(Math.random() * ANSWERS.length)].toUpperCase();
    setSolution(randomAnswer);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (gameStatus !== 'playing' || showPowerUp) return;

      if (e.key === 'Enter') {
        handleSubmit();
      } else if (e.key === 'Backspace') {
        handleDelete();
      } else if (/^[a-zA-Z]$/.test(e.key)) {
        const upperKey = e.key.toUpperCase();
        if (!lockedLetters.has(upperKey)) {
          handleLetter(upperKey);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentGuess, currentRow, gameStatus, lockedLetters, showPowerUp]);

  useEffect(() => {
    setRemainingWords(calculateRemainingWords());
  }, [lockedLetters, letterStates, solution]);

  useEffect(() => {
    if (lockedPosition !== null && currentGuess.length === 0) {
      const guessArray = '     '.split('');
      guessArray[lockedPosition.position] = lockedPosition.letter;
      setCurrentGuess(guessArray.join(''));
    }
  }, [currentRow, lockedPosition]);

  const handleLetter = (letter) => {
    if (lockedLetters.has(letter)) {
      return;
    }
    
    if (currentGuess.length < 5) {
      if (lockedPosition !== null) {
        const guessArray = currentGuess.padEnd(5, ' ').split('');
        
        for (let i = 0; i < 5; i++) {
          if (i !== lockedPosition.position && guessArray[i] === ' ') {
            guessArray[i] = letter;
            setCurrentGuess(guessArray.join('').replace(/ /g, ''));
            return;
          }
        }
      } else {
        setCurrentGuess(currentGuess + letter);
      }
    }
  };

  const handleDelete = () => {
    if (lockedPosition !== null) {
      const guessArray = currentGuess.padEnd(5, ' ').split('');
      
      for (let i = 4; i >= 0; i--) {
        if (i !== lockedPosition.position && guessArray[i] !== ' ') {
          guessArray[i] = ' ';
          setCurrentGuess(guessArray.join('').replace(/ /g, ''));
          return;
        }
      }
    } else {
      setCurrentGuess(currentGuess.slice(0, -1));
    }
  };

  const handleSubmit = () => {
    let actualGuess = currentGuess;
    if (lockedPosition !== null) {
      const guessArray = currentGuess.padEnd(5, ' ').split('');
      guessArray[lockedPosition.position] = lockedPosition.letter;
      actualGuess = guessArray.join('').replace(/ /g, '');
    }

    if (actualGuess.length !== 5) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    if (!WORDS.includes(actualGuess.toLowerCase())) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    const newGuesses = [...guesses];
    newGuesses[currentRow] = actualGuess;
    setGuesses(newGuesses);

    updateLetterStates(actualGuess);

    if (actualGuess === solution) {
      setGameStatus('won');
      return;
    }

    if (currentRow === 5) {
      setGameStatus('lost');
      return;
    }

    if (currentRow === 2 && !powerUpUsed) {
      setPowerUpAvailable(true);
    }

    setCurrentRow(currentRow + 1);
    setCurrentGuess('');
  };

  const updateLetterStates = (guess) => {
    const newStates = { ...letterStates };
    const newLocked = new Set(lockedLetters);
    
    for (let i = 0; i < guess.length; i++) {
      const letter = guess[i];
      
      if (solution[i] === letter) {
        newStates[letter] = 'correct';
      } else if (solution.includes(letter) && newStates[letter] !== 'correct') {
        newStates[letter] = 'present';
      } else if (!solution.includes(letter)) {
        newStates[letter] = 'absent';
        newLocked.add(letter);
      }
    }
    
    setLetterStates(newStates);
    setLockedLetters(newLocked);
  };

  const calculateRemainingWords = () => {
    if (!solution) return ANSWERS.length;
    
    const possibleWords = ANSWERS.filter(word => {
      const upperWord = word.toUpperCase();
      
      for (let letter of lockedLetters) {
        if (upperWord.includes(letter)) {
          return false;
        }
      }
      
      return true;
    });
    
    return possibleWords.length;
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => {
      setToast({ show: false, message: '' });
    }, 3000);
  };

  const handlePowerUpClick = () => {
    if (powerUpAvailable && !powerUpUsed) {
      setShowPowerUp(true);
    }
  };

  const revealCorrectLetter = () => {
    const firstLetter = solution[0];
    
    const newStates = { ...letterStates };
    newStates[firstLetter] = 'correct';
    setLetterStates(newStates);
    
    setLockedPosition({ position: 0, letter: firstLetter });
    
    const guessArray = currentGuess.padEnd(5, ' ').split('');
    guessArray[0] = firstLetter;
    setCurrentGuess(guessArray.join('').replace(/ /g, ''));
    
    showToast(`First letter revealed and locked: ${firstLetter}`);
    
    setShowPowerUp(false);
    setPowerUpUsed(true);
    setPowerUpAvailable(false);
  };

  const openHelpModal = () => {
    setShowWelcome(true);
    setWelcomePage(1);
  };

  const closeWelcome = () => {
    setShowWelcome(false);
    setWelcomePage(1);
  };

  const revealTwoLetters = () => {
    const unrevealedLetters = [];
    for (let letter of solution) {
      if (!letterStates[letter]) {
        unrevealedLetters.push(letter);
      }
    }
    
    const uniqueUnrevealed = [...new Set(unrevealedLetters)];
    
    if (uniqueUnrevealed.length > 0) {
      const lettersToReveal = uniqueUnrevealed.slice(0, Math.min(2, uniqueUnrevealed.length));
      
      const newStates = { ...letterStates };
      lettersToReveal.forEach(letter => {
        newStates[letter] = 'present';
      });
      setLetterStates(newStates);
      
      showToast(`Letters in the word: ${lettersToReveal.join(', ')}`);
    }
    
    setShowPowerUp(false);
    setPowerUpUsed(true);
    setPowerUpAvailable(false);
  };

  const removeHalfWrongLetters = () => {
    const availableLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(letter => 
      !lockedLetters.has(letter) && !letterStates[letter]
    );
    
    const wrongLetters = availableLetters.filter(letter => !solution.includes(letter));
    
    const halfCount = Math.floor(wrongLetters.length / 2);
    const lettersToLock = wrongLetters.slice(0, halfCount);
    
    const newLocked = new Set(lockedLetters);
    const newStates = { ...letterStates };
    
    lettersToLock.forEach(letter => {
      newLocked.add(letter);
      newStates[letter] = 'absent';
    });
    
    setLockedLetters(newLocked);
    setLetterStates(newStates);
    
    showToast(`Removed ${lettersToLock.length} wrong letters from keyboard`);
    
    setShowPowerUp(false);
    setPowerUpUsed(true);
    setPowerUpAvailable(false);
  };

  const resetGame = () => {
    const randomAnswer = ANSWERS[Math.floor(Math.random() * ANSWERS.length)].toUpperCase();
    setSolution(randomAnswer);
    setGuesses(Array(6).fill(''));
    setCurrentGuess('');
    setCurrentRow(0);
    setGameStatus('playing');
    setLetterStates({});
    setLockedLetters(new Set());
    setShowPowerUp(false);
    setPowerUpUsed(false);
    setPowerUpAvailable(false);
    setLockedPosition(null);
  };

  const nextWelcomePage = () => {
    if (welcomePage < 3) {
      setWelcomePage(welcomePage + 1);
    } else {
      setShowWelcome(false);
    }
  };

  const prevWelcomePage = () => {
    if (welcomePage > 1) {
      setWelcomePage(welcomePage - 1);
    }
  };

  return (
    <div className="App">
     {showWelcome && (
  <div className="modal welcome-modal">
    <div className="modal-header">
      <span className="page-indicator">{welcomePage} / 3</span>
      <button onClick={closeWelcome} className="close-btn">×</button>
    </div>

    {welcomePage === 1 && (
      <div className="welcome-page">
        <h2>Welcome to Wordle+</h2>
        
        <div className="welcome-content">
          <div className="welcome-section">
            <h3>How to Play</h3>
            <p>Guess the 5-letter word in 6 tries. After each guess:</p>
            <ul>
              <li><span className="demo-tile correct"></span>Correct letter, correct position</li>
              <li><span className="demo-tile present"></span>Correct letter, wrong position</li>
              <li><span className="demo-tile absent"></span>Letter not in word</li>
            </ul>
          </div>
        </div>

        <div className="welcome-nav">
          <div></div>
          <button onClick={nextWelcomePage} className="nav-btn">
            Next
          </button>
        </div>
      </div>
    )}

    {welcomePage === 2 && (
      <div className="welcome-page">
        <h2>Unique Features</h2>
        
        <div className="welcome-content">
          <div className="welcome-section">
            <div className="feature-item">
              <h4>Letter Locking</h4>
              <p>Wrong letters disappear from the keyboard and can't be used again</p>
            </div>
            <div className="feature-item">
              <h4>Word Counter</h4>
              <p>See how many possible words remain based on available letters</p>
            </div>
            <div className="feature-item">
              <h4>Power-Up</h4>
              <p>Unlock a special boost on your 4th turn to help solve the puzzle</p>
            </div>
          </div>
        </div>

        <div className="welcome-nav">
          <button onClick={prevWelcomePage} className="nav-btn secondary">
            Back
          </button>
          <button onClick={nextWelcomePage} className="nav-btn">
            Next
          </button>
        </div>
      </div>
    )}

    {welcomePage === 3 && (
      <div className="welcome-page">
        <h2>Power-Ups</h2>
        
        <div className="welcome-content">
          <div className="welcome-section">
            <p className="powerup-intro">Choose one on your 4th turn:</p>
            <div className="powerup-preview">
              <div className="powerup-item">
                <img src={revealFirstLetterIcon} alt="Reveal" className="preview-icon" />
                <span>Reveal & lock the first letter</span>
              </div>
              <div className="powerup-item">
                <img src={revealLettersIcon} alt="Hint" className="preview-icon" />
                <span>Get 2 letters in the word</span>
              </div>
              <div className="powerup-item">
                <img src={removeLettersIcon} alt="Remove" className="preview-icon" />
                <span>Remove half of wrong letters</span>
              </div>
            </div>
          </div>
        </div>

        <div className="welcome-nav">
          <button onClick={prevWelcomePage} className="nav-btn secondary">
            Back
          </button>
          <button onClick={closeWelcome} className="nav-btn">
            Start Playing
          </button>
        </div>
      </div>
    )}
  </div>
)}

      {toast.show && (
        <div className="toast">
          {toast.message}
        </div>
      )}

      <header className="header">
        <h1>WORDLE+</h1>
        <button onClick={openHelpModal} className="help-btn">
          <img src={infoIcon} alt="Help" className="help-icon" />
        </button>
      </header>
      
      {process.env.NODE_ENV === 'development' && (
        <div className="debug-answer">
          <small>Answer (for testing): <strong>{solution}</strong></small>
        </div>
      )}
      
      <div className="game-container">
        {gameStatus === 'playing' && (
          <div className="word-counter">
            <span className="counter-label">Possible words remaining:</span>
            <span className="counter-number">{remainingWords}</span>
          </div>
        )}

        {gameStatus !== 'playing' && (
          <div className="game-over-message">
            {gameStatus === 'won' ? (
              <>
                <h2 className="win-message">You Won!</h2>
                <p className="result-text">You guessed it in {guesses.filter(g => g !== '').length} {guesses.filter(g => g !== '').length === 1 ? 'try' : 'tries'}!</p>
              </>
            ) : (
              <>
                <h2 className="lose-message">Game Over</h2>
                <p className="result-text">The word was: <strong>{solution}</strong></p>
              </>
            )}
            <button onClick={resetGame} className="play-again-btn">
              Play Again
            </button>
          </div>
        )}
        
        <Board 
          guesses={guesses}
          currentGuess={currentGuess}
          currentRow={currentRow}
          solution={solution}
          shake={shake}
          powerUpRow={3}
          powerUpUsed={powerUpUsed}
          powerUpAvailable={powerUpAvailable}
          onPowerUpClick={handlePowerUpClick}
          lockedPosition={lockedPosition}
          isWinner={gameStatus === 'won'}
        />
        
        <Keyboard 
          onKeyPress={handleLetter}
          onEnter={handleSubmit}
          onDelete={handleDelete}
          letterStates={letterStates}
          disabled={gameStatus !== 'playing' || showPowerUp}
          lockedLetters={lockedLetters}
        />
      </div>

      {showPowerUp && (
        <div className="modal powerup-modal">
          <img src={giftIcon} alt="Power-up" className="modal-gift-icon" />
          <h2>Power-Up Time!</h2>
          <p className="powerup-description">Choose one boost to help you:</p>
          
          <div className="powerup-options">
            <button className="powerup-btn" onClick={revealCorrectLetter}>
              <img src={revealFirstLetterIcon} alt="Reveal Letter" className="powerup-icon-img" />
              <span className="powerup-title">Reveal Letter</span>
              <span className="powerup-desc">Get one letter in the right spot</span>
            </button>
            
            <button className="powerup-btn" onClick={revealTwoLetters}>
              <img src={revealLettersIcon} alt="Hint Letters" className="powerup-icon-img" />
              <span className="powerup-title">Hint Letters</span>
              <span className="powerup-desc">Get 2 letters that are in the word</span>
            </button>
            
            <button className="powerup-btn" onClick={removeHalfWrongLetters}>
              <img src={removeLettersIcon} alt="Clear Keyboard" className="powerup-icon-img" />
              <span className="powerup-title">Clear Keyboard</span>
              <span className="powerup-desc">Remove half of wrong letters</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;