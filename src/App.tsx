import './App.css';

import React, { useState, createContext } from 'react';
import * as BoardData from "./data/BoardData"
import Board from "./components/Board";
import Keyboard from "./components/Keyboard";
import WordStats from "./components/WordStats";
import * as WordleDict from './data/dictionaries/Wordle'
import * as WordUtils from './utilities/WordUtils';

export const AppContext = createContext(undefined);
const initBoardStr = "";
const storedBoardStates = [initBoardStr, initBoardStr, initBoardStr, initBoardStr];
let currentBoardIndex = 0;
const initBoard = BoardData.getBoardFromString(storedBoardStates[currentBoardIndex]);
const initLetterLoc = BoardData.getLetterLoc(initBoard);

//TODO: make storage button background respond to tap, indicate button currently selected 
// with background color
//TODO? make storage buttons reflect clues
//TODO? add partitioning information to stats
//TODO? allow stats to sort when clicked on column top

const App = () => {
  const [boardStr, setBoardStr] = useState(initBoardStr);
  const [curLetterLoc, setCurLetterLoc] = useState(initLetterLoc);
  const [words, setWords] = useState(null);

  const onShowHelp = () => {
    setWords(null);
  }

  const onEnter = () => {
    if (curLetterLoc.letterIndex !== (BoardData.lettersPerWord - 1)) {
      alert("Fill in full word to calculate words remaining")
      return;
    }
    let curWord = "";
    const board = BoardData.getBoardFromString(storedBoardStates[currentBoardIndex]);
    board[curLetterLoc.rowIndex].forEach(letter => { curWord += letter.letter.toLowerCase() });

    const wordsAll = WordleDict.wordleAll();
    if (wordsAll.indexOf(curWord) < 0) {
      alert(`Note: "${curWord}" is not in our dictionary`);
    }

    // get stats and update stats panel
    // WordUtils.setVerbose(true);
    const wordsLeft = WordUtils.wordle(wordsAll, storedBoardStates[currentBoardIndex]);
    setWords(wordsLeft);
  }

  const onDelete = () => {
    if (curLetterLoc.rowIndex < 0) return;

    for (let index = 0; index < storedBoardStates.length; index++) {
      const blankLetter = BoardData.getBlankLetter();
      const storedBoard = storedBoardStates[index];
      storedBoardStates[index] = BoardData.setLetterInBoardString(storedBoard, curLetterLoc, blankLetter);
    }
    const newBoard = BoardData.getBoardFromString(storedBoardStates[currentBoardIndex]);
    setBoardStr(storedBoardStates[currentBoardIndex]);
    setCurLetterLoc(BoardData.getLetterLoc(newBoard));
  }

  const onSelectLetter = (key: string) => {
    const loc = BoardData.incrementLetterLoc(curLetterLoc);
    if (loc.rowIndex >= BoardData.maxRows) return;
    key = key.toUpperCase();

    const letter: BoardData.LetterType = BoardData.getBlankLetter();
    letter.letter = key;
    for (let index = 0; index < storedBoardStates.length; index++) {
      const storedBoard = storedBoardStates[index];
      storedBoardStates[index] = BoardData.setLetterInBoardString(storedBoard, loc, letter);
    }
    const newBoard = BoardData.getBoardFromString(storedBoardStates[currentBoardIndex]);
    setBoardStr(storedBoardStates[currentBoardIndex]);
    setCurLetterLoc(BoardData.getLetterLoc(newBoard));
  }

  const onRotateLetterState = (letterLoc) => {
    const newBoard = BoardData.getBoardFromString(storedBoardStates[currentBoardIndex]);
    const letter = newBoard[letterLoc.rowIndex][letterLoc.letterIndex];
    if (BoardData.letterIsBlank(letter)) return;
    newBoard[letterLoc.rowIndex][letterLoc.letterIndex].state = BoardData.rotateLetterState(letter.state);
    const newBoardStr = BoardData.getBoardString(newBoard);
    storedBoardStates[currentBoardIndex] = newBoardStr;
    setBoardStr(newBoardStr);
  }

  const switchToBoard = (boardIndex) => {
    currentBoardIndex = boardIndex;
    const newBoardStr = storedBoardStates[currentBoardIndex];
    setBoardStr(newBoardStr);
    const newBoard = BoardData.getBoardFromString(newBoardStr);
    setCurLetterLoc(BoardData.getLetterLoc(newBoard));
    onShowHelp();
  }

  return (
    <div className="App">
      <nav>
        <div>
          <button id="help-button" onClick={onShowHelp} tabIndex={-1} >
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
              <path fill="#ffffff" d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"></path>
            </svg>
          </button>
        </div>
        <h1>Wordle Helper</h1>
        <div>
          <div className="grid gap-0 grid-cols-2">
              <div className="rounded-lg bg-gray-500 box-border px-3 border-2">
                <button id="memory0" onClick={() => switchToBoard(0)} tabIndex={-1}>0</button>
              </div>
              <div className="rounded-lg bg-gray-500 box-border px-3 border-2">
                <button id="memory1" onClick={() => switchToBoard(1)} tabIndex={-1}>1</button>
              </div>
              <div className="rounded-lg bg-gray-500 box-border px-3 border-2">
                <button id="memory2" onClick={() => switchToBoard(2)} tabIndex={-1}>2</button>
              </div>
              <div className="rounded-lg bg-gray-500 box-border px-3 border-2">
                <button id="memory3" onClick={() => switchToBoard(3)} tabIndex={-1}>3</button>
              </div>
          </div>
        </div>
      </nav>
      <AppContext.Provider
        value={{
          boardStr,
          setBoardStr,
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
