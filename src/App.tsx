import './App.css';

import React, { useState, createContext } from 'react';

import * as BoardData from "./data/BoardData"
import Board from "./components/Board";
import Keyboard from "./components/Keyboard";
import { WordStats, StatsState } from "./components/WordStats";
import * as WordleDict from './data/dictionaries/Wordle'
import * as WordUtils from './utilities/WordUtils';

export const AppContext = createContext(undefined);
const initBoardStr = "";
const storedBoardStates = [initBoardStr, initBoardStr, initBoardStr, initBoardStr];
const storedBoardDirty = [false, false, false, false];
let currentBoardIndex = 0;
const initBoard = BoardData.getBoardFromString(storedBoardStates[currentBoardIndex]);
const initLetterLoc = BoardData.getLetterLoc(initBoard);

const App = () => {
  const [boardStr, setBoardStr] = useState(initBoardStr);
  const [curLetterLoc, setCurLetterLoc] = useState(initLetterLoc);
  const [words, setWords] = useState<string[]>([]);
  const [wordStatsState, setWordStatsState] = useState<StatsState>("help");

  const setWordsAndStatsState = (newWords) => {
    setWords(newWords);
    setWordStatsState(newWords.length > 0 ? "normal" : "empty");
  }

  const onShowHelp = () => {
    setWordStatsState("help");
  }

  const onEnter = () => {
    const wordsAll = WordleDict.wordleAll;
    if (storedBoardStates[currentBoardIndex] === "") {
      setWordStatsState("calculating");
      setTimeout(() => {
        WordUtils.calcWordleMaxIndexPartitions();
        setWordsAndStatsState(WordleDict.wordlePicks);
      }, 1);
      return;
    }
    if (curLetterLoc.letterIndex !== (BoardData.lettersPerWord - 1)) {
      alert("Fill in full word to calculate words remaining")
      return;
    }
    storedBoardDirty[currentBoardIndex] = false;

    let curWord = "";
    const board = BoardData.getBoardFromString(storedBoardStates[currentBoardIndex]);
    board[curLetterLoc.rowIndex].forEach(letter => { curWord += letter.letter.toLowerCase() });

    if (wordsAll.indexOf(curWord) < 0) {
      alert(`Note: "${curWord}" is not in our dictionary`);
    }

    if (WordUtils.wordlePicksIndexPartitions) {
      const newWords = WordUtils.wordle(wordsAll, storedBoardStates[currentBoardIndex]);
      setWordsAndStatsState(newWords);
  } else {
      setWordStatsState("calculating");
      setTimeout(() => {
        WordUtils.calcWordleIndexPartitions();
        const newWords = WordUtils.wordle(wordsAll, storedBoardStates[currentBoardIndex]);
        setWordsAndStatsState(newWords);
      }, 1)
    }
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
      storedBoardDirty[index] = true;
    }
    const newBoard = BoardData.getBoardFromString(storedBoardStates[currentBoardIndex]);
    setBoardStr(storedBoardStates[currentBoardIndex]);
    setCurLetterLoc(BoardData.getLetterLoc(newBoard));
  }

  const onRotateLetterState = (letterLoc:BoardData.LetterLocType) => {
    const newBoard = BoardData.getBoardFromString(storedBoardStates[currentBoardIndex]);
    const letter = newBoard[letterLoc.rowIndex][letterLoc.letterIndex];
    if (BoardData.letterIsBlank(letter)) return;
    newBoard[letterLoc.rowIndex][letterLoc.letterIndex].state = BoardData.rotateLetterState(letter.state);
    const newBoardStr = BoardData.getBoardString(newBoard);
    storedBoardStates[currentBoardIndex] = newBoardStr;
    setBoardStr(newBoardStr);
  }

  const switchToBoard = (boardIndex:number) => {
    currentBoardIndex = boardIndex;
    const newBoardStr = storedBoardStates[currentBoardIndex];
    setBoardStr(newBoardStr);
    const newBoard = BoardData.getBoardFromString(newBoardStr);
    setCurLetterLoc(BoardData.getLetterLoc(newBoard));
    if (storedBoardDirty[currentBoardIndex]) {
      storedBoardDirty[currentBoardIndex] = false;
      onShowHelp();
    } else {
      onEnter();
    }
  }

  const onReset = () => {
    for (let i = 0; i < storedBoardStates.length; i++) {
      storedBoardStates[i] = initBoardStr;
      storedBoardDirty[i] = true;
    }
    switchToBoard(0);
  }

  const memoryButton = (index:number) => {
    const bgClassName = (index === currentBoardIndex) ? "bg-gray-600" : "bg-gray-500";
    return (
      <button id={`memory${index}`} onClick={() => switchToBoard(index)} tabIndex={-1}>
        <div className={`${bgClassName} text-center rounded-lg box-border pl-2.5 pr-4 border-2`}>{index + 1}</div>
      </button>
    )
  }

  const navButtonStyle = {
    display:"flex",
    direction: "row",
    alighnItems: "center",
    padding: 4,
  }

  const resetButtonStyle = {
    fontWeight: "bold",
    fontSize: 24,
    padding: 8,
  }

  const helpButtonStyle = {
    paddingTop: 5,
  }

  return (
    <div className="App">
      <nav>
        <div style={navButtonStyle}>
          <button 
            style={helpButtonStyle}
            id="help-button" 
            onClick={onShowHelp} 
            tabIndex={-1} >
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
              <path fill="#ffffff" d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"></path>
            </svg>
          </button>
          <button 
            style={resetButtonStyle}
            id="reset-button" 
            onClick={onReset} 
            tabIndex={-1} 
          >
          &#x27F3;
          </button>
        </div>
        <h1>Wordle Helper</h1>
        <div>
          <div className="grid gap-0 px-4 grid-cols-2">
            {memoryButton(0)}
            {memoryButton(1)}
            {memoryButton(2)}
            {memoryButton(3)}
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
          switchToBoard,
          onShowHelp,
        }}
      >
        <div className='row'>
          <div className='game collumn'>
            <Board />
            <Keyboard />
          </div>
          <div className='stats collumn'>
            <WordStats words={words} wordStatsState={wordStatsState}/>
          </div>
        </div>
      </AppContext.Provider>
    </div>
  );
}

export default App;
