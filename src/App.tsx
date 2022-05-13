import './App.css';

import React, { useState, createContext } from 'react';
import Board, { getBoardStart, LetterType, rotateLetterState } from "./components/Board";
import Keyboard from "./components/Keyboard";
import WordStats from "./components/WordStats";
import * as WordleDict from './data/dictionaries/Wordle'
import * as WordUtils from './utilities/WordUtils';

export const AppContext = createContext(undefined);
export const lettersPerWord = 5;
export const maxRows = 8;

const App = () => {
  const [board, setBoard] = useState(getBoardStart(lettersPerWord, maxRows));
  const [curLetterLoc, setCurLetterLoc] = useState({ rowIndex: -1, letterIndex: lettersPerWord - 1});
  const [words, setWords] = useState(null);

  const getClueStringFromBoard = (board:LetterType[][]) => {
    let clues: string[] = [];
    for( let word of board) {
      let clue = "";
      word.forEach( letter => {
        const stateChar = (letter.state === "correct") ? "=" : 
          (letter.state === "wrongIndex") ? "/" : "-";
        clue += letter.letter.toLowerCase() + stateChar;
      });
      if (clue.length === 2 * lettersPerWord) {
        clues.push(clue);
      } else {
        break;
      }
    }
    return clues.join("_");
  }

  const onShowHelp = () => {
    setWords(null);
  }

  const onEnter = () => {
    if (curLetterLoc.letterIndex !== (lettersPerWord - 1)) {
      alert("Fill in full word to calculate words remaining")
      return;
    }
    let curWord = "";
    board[curLetterLoc.rowIndex].forEach( letter => {curWord += letter.letter.toLowerCase()});

    const wordsAll = WordleDict.wordleAll();
    if (wordsAll.indexOf(curWord) < 0) {
      alert(`Note: "${curWord}" is not in our dictionary`);
    }

    // get stats and update stats panel
    // console.log(board);
    const wordleClueString = getClueStringFromBoard(board);
    // WordUtils.setVerbose(true);
    const wordsLeft = WordUtils.wordle(wordsAll, wordleClueString);
    // console.log(wordsLeft);
    setWords(wordsLeft);
  }

  const onDelete = () => {
    let letterIndex = curLetterLoc.letterIndex;
    let rowIndex = curLetterLoc.rowIndex;
    if (rowIndex < 0) return;

    const newBoard = [...board];
    const letter: LetterType = {letter: "", state: "wrong"};
    newBoard[rowIndex][letterIndex] = letter;
    setBoard(newBoard);
    if (letterIndex === 0) {
      rowIndex--;
      letterIndex = lettersPerWord;
    }
    letterIndex--;
    setCurLetterLoc({
      rowIndex: rowIndex, 
      letterIndex: letterIndex,
    });
  }

  const onSelectLetter = (key) => {
    let letterIndex = curLetterLoc.letterIndex + 1;
    let rowIndex = curLetterLoc.rowIndex;
    console.log(`onSelectLetter ${rowIndex}, ${letterIndex}`);
    if (letterIndex >= lettersPerWord) {
      letterIndex = 0;
      rowIndex += 1;
    }
    if (rowIndex >= maxRows) return;

    const newBoard = [...board];
    const letter: LetterType = {letter: key, state: "wrong"};
    newBoard[rowIndex][letterIndex] = letter;
    setBoard(newBoard);
    setCurLetterLoc({
      rowIndex: rowIndex,
      letterIndex: letterIndex,
    });
  }

  const onRotateLetterState = (letterLoc) => {
    const newBoard = [...board];
    const letter = newBoard[letterLoc.rowIndex][letterLoc.letterIndex];
    if (letter.letter.length === 0) return;
    newBoard[letterLoc.rowIndex][letterLoc.letterIndex].state = rotateLetterState(letter.state);
    setBoard(newBoard);
  }

  return (
    <div className="App">
      <nav>
        <div className="helpButton"> 
          <button id="help-button" onClick={onShowHelp} tabIndex={-1} >
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
              <path fill="#ffffff" d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"></path>
            </svg>
          </button>
        </div>
        <h1>Wordle Helper</h1>
      </nav>
      <AppContext.Provider
        value={{
          board,
          maxRows,
          lettersPerWord,
          setBoard,
          curLetterLoc,
          setCurLetterLoc,
          onSelectLetter,
          onDelete,
          onEnter,
          onRotateLetterState,
          onShowHelp,
          words,
          setWords,
        }}
      >
        <div className='row'>
          <div className='game collumn'>
            <Board />
            <Keyboard />
          </div>
          <div className='stats collumn'>
            <WordStats />
          </div>
        </div>
        </AppContext.Provider>
    </div>
  );
}

export default App;
