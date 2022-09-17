import './App.css';

import React, { useState, createContext, useEffect } from 'react';

import * as BoardData from "./data/BoardData"
import Board from "./components/Board";
import Keyboard from "./components/Keyboard";
import { WordStats, StatsState } from "./components/WordStats";
import * as WordleDict from './data/dictionaries/Wordle'
import * as WordUtils from './utilities/WordleUtils';

//TODO: add column for partitions view that gives which board(s) the word 
// belongs to. Could just be shown on top of group b/c groups don't overlap
// unless the clues are the same

export const AppContext = createContext(undefined);
const initBoardStr = "";
const storedBoardStates = [initBoardStr, initBoardStr, initBoardStr, initBoardStr];
const storedBoardDirty = [false, false, false, false];
const storedBoardCompleted = [false, false, false, false];
let currentBoardIndex = 0;
let combinedBoardMode = false;
const initBoard = BoardData.getBoardFromString(storedBoardStates[currentBoardIndex]);
const initLetterLoc = BoardData.getLetterLoc(initBoard);

const App = () => {
  const [boardStr, setBoardStr] = useState(initBoardStr);
  const [curLetterLoc, setCurLetterLoc] = useState(initLetterLoc);
  const [words, setWords] = useState<string[]>([]);
  const [wordStatsState, setWordStatsState] = useState<StatsState>("help");

  useEffect(() => {
    setTimeout(() => {
      WordUtils.initWordleIndexPartitions();
    }, 1);
  }, []);    

  const addRowToBoard = (boardRowStr:string) => {
    if (curLetterLoc.letterIndex !== (BoardData.lettersPerWord - 1)) {
      return;
    }
    boardRowStr = boardRowStr.toUpperCase();
    const otherBoardStrs = boardRowStr.replace(/=/g, '-');
    // const word = otherBoardStrs.replace(/-/g, '');
    // navigator.clipboard.writeText(word); // so user can paste into quordle/wordle
    //  Disabled because pasting does not work in wordle/quordle
    for (let index = 0; index < storedBoardStates.length; index++) {
      if (!storedBoardCompleted[index]) {
        const storedBoard = storedBoardStates[index];
        storedBoardStates[index] = (storedBoard.length === 0 ? '' : storedBoard + '_')
          + ((index === currentBoardIndex) ? boardRowStr : otherBoardStrs);
        storedBoardDirty[index] = true;
      }
    }
    const newBoard = BoardData.getBoardFromString(storedBoardStates[currentBoardIndex]);
    setBoardStr(storedBoardStates[currentBoardIndex]);
    setCurLetterLoc(BoardData.getLetterLoc(newBoard));
    if (BoardData.boardIsComplete(newBoard)) {
      storedBoardCompleted[currentBoardIndex] = true;
    }
  }

  const setWordsAndStatsState = (newWords) => {
    setWords(newWords);
    setWordStatsState(newWords.length > 0 ? "normal" : "empty");
  }

  const onShowHelp = () => {
    setWordStatsState("help");
  }

  const onEnter = () => {
    combinedBoardMode = false;
    if (storedBoardCompleted[currentBoardIndex]) {
      const newWords = WordUtils.wordle(WordleDict.wordlePicks, storedBoardStates[currentBoardIndex]);
      setWordsAndStatsState(newWords);
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

    if (WordleDict.wordleAll.indexOf(curWord) < 0) {
      alert(`Note: "${curWord}" is not in our dictionary`);
    }

    const newWords = WordUtils.wordle(WordleDict.wordlePicks, storedBoardStates[currentBoardIndex]);
    setWordsAndStatsState(newWords);      
  }

  const onDelete = () => {
    if (curLetterLoc.rowIndex < 0) return;
    if (storedBoardCompleted[currentBoardIndex]) {
      alert("switching board to not complete, please re-delete if desired.");
      const newBoard = BoardData.getBoardFromString(extendCurBoardStrToLongest());
      const newBoardStr = BoardData.getBoardString(newBoard);
      storedBoardStates[currentBoardIndex] = newBoardStr;
      setBoardStr(newBoardStr);
      setCurLetterLoc(BoardData.getLetterLoc(newBoard));
      return;
    }

    for (let index = 0; index < storedBoardStates.length; index++) {
      if (!storedBoardCompleted[index]) {
        const blankLetter = BoardData.getBlankLetter();
        const storedBoard = storedBoardStates[index];
        storedBoardStates[index] = BoardData.setLetterInBoardString(storedBoard, curLetterLoc, blankLetter);
      }
    }
    if (!storedBoardCompleted[currentBoardIndex]) {
      const newBoard = BoardData.getBoardFromString(storedBoardStates[currentBoardIndex]);
      setBoardStr(storedBoardStates[currentBoardIndex]);
      setCurLetterLoc(BoardData.getLetterLoc(newBoard));
    }
  }

  const onSelectLetter = (key: string) => {
    const loc = BoardData.incrementLetterLoc(curLetterLoc);
    if (loc.rowIndex >= BoardData.maxRows) return;
    key = key.toUpperCase();

    const letter: BoardData.LetterType = BoardData.getBlankLetter();
    letter.letter = key;
    for (let index = 0; index < storedBoardStates.length; index++) {
      if (!storedBoardCompleted[index]) {
        const storedBoard = storedBoardStates[index];
        storedBoardStates[index] = BoardData.setLetterInBoardString(storedBoard, loc, letter);
        storedBoardDirty[index] = true;
      }
    }
    if (!storedBoardCompleted[currentBoardIndex]) {
      const newBoard = BoardData.getBoardFromString(storedBoardStates[currentBoardIndex]);
      setBoardStr(storedBoardStates[currentBoardIndex]);
      setCurLetterLoc(BoardData.getLetterLoc(newBoard));
    }
  }

  const extendCurBoardStrToLongest = ():string => {
    let newBoardStr = storedBoardStates[currentBoardIndex];
    if (storedBoardCompleted[currentBoardIndex]) {
      storedBoardCompleted[currentBoardIndex] = false;
      // if completed state is changed, need to sync up with the
      //  uncompleted boards
      const longestBoardString = storedBoardStates.reduce((a, b) => a.length > b.length ? a : b);
      const extension = longestBoardString.slice(newBoardStr.length).replace(/[=/]/g, '-');
      newBoardStr += extension;
    }
    return newBoardStr;
  }

  const onRotateLetterState = (letterLoc:BoardData.LetterLocType) => {
    if (combinedBoardMode) {
      alert(`Switching back to board ${currentBoardIndex + 1}`)
      switchToBoard (currentBoardIndex);
      return;
    }
    let newBoardStr = extendCurBoardStrToLongest();
    const newBoard = BoardData.getBoardFromString(newBoardStr);
    const letter = newBoard[letterLoc.rowIndex][letterLoc.letterIndex];
    if (BoardData.letterIsBlank(letter)) return;
    newBoard[letterLoc.rowIndex][letterLoc.letterIndex].state = BoardData.rotateLetterState(letter.state);
    newBoardStr = BoardData.getBoardString(newBoard);
    storedBoardStates[currentBoardIndex] = newBoardStr;
    setBoardStr(newBoardStr);
    setCurLetterLoc(BoardData.getLetterLoc(newBoard));
  }

  const calcCombinedWords = () => {
    const newWords = [...new Set(storedBoardStates)]
      .filter((_, index) => !storedBoardCompleted[index])
      .reduce((acc, boardStr) => acc.concat(WordUtils.wordle(WordleDict.wordlePicks, boardStr)),[]);
    setWordsAndStatsState(newWords);
  }

  const switchToBoard = (boardIndex:number) => {
    if (boardIndex < 0) {
      combinedBoardMode = true;
      calcCombinedWords();
    } else {
      combinedBoardMode = false;
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
  }

  const onReset = () => {
    for (let i = 0; i < storedBoardStates.length; i++) {
      storedBoardStates[i] = initBoardStr;
      storedBoardDirty[i] = true;
      storedBoardCompleted[i] = false;
    }
    switchToBoard(0);
  }

  const showQuordleButton = ():boolean => {
    return (curLetterLoc.letterIndex === (BoardData.lettersPerWord - 1)) && WordUtils.wordleIndexPartitionsInitialized();
  }

  const memoryButton = (index:number) => {
    let bgClassName:string;
    if (index < 0) {
      bgClassName = (combinedBoardMode) ? "bg-qmem-button-selected" : "bg-qmem-button-deselected";
    } else {
      bgClassName = (!combinedBoardMode && index === currentBoardIndex) ? "bg-mem-button-selected" : "bg-mem-button-deselected";
    }
    return (
      <button id={`memory${index}`} onClick={() => switchToBoard(index)} tabIndex={-1}>
        <div className={`${bgClassName} memory-button`}>{index + 1}</div>
      </button>
    )
  }

  return (
    <div className="App">
      <nav>
        <div className='navButtons'>
          <button 
            id="help" 
            onClick={onShowHelp} 
            tabIndex={-1} >
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
              <path fill="#ffffff" d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"></path>
            </svg>
          </button>
          <button 
            id="reset" 
            onClick={onReset} 
            tabIndex={-1} >
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
              <path fill="#ffffff" d="M20.817 11.186a8.94 8.94 0 0 0-1.355-3.219 9.053 9.053 0 0 0-2.43-2.43 8.95 8.95 0 0 0-3.219-1.355 9.028 9.028 0 0 0-1.838-.18V2L8 5l3.975 3V6.002c.484-.002.968.044 1.435.14a6.961 6.961 0 0 1 2.502 1.053 7.005 7.005 0 0 1 1.892 1.892A6.967 6.967 0 0 1 19 13a7.032 7.032 0 0 1-.55 2.725 7.11 7.11 0 0 1-.644 1.188 7.2 7.2 0 0 1-.858 1.039 7.028 7.028 0 0 1-3.536 1.907 7.13 7.13 0 0 1-2.822 0 6.961 6.961 0 0 1-2.503-1.054 7.002 7.002 0 0 1-1.89-1.89A6.996 6.996 0 0 1 5 13H3a9.02 9.02 0 0 0 1.539 5.034 9.096 9.096 0 0 0 2.428 2.428A8.95 8.95 0 0 0 12 22a9.09 9.09 0 0 0 1.814-.183 9.014 9.014 0 0 0 3.218-1.355 8.886 8.886 0 0 0 1.331-1.099 9.228 9.228 0 0 0 1.1-1.332A8.952 8.952 0 0 0 21 13a9.09 9.09 0 0 0-.183-1.814z"/>
            </svg>
          </button>
        </div>
        <h1>Wordle Helper</h1>
        <div className="memory-button-container">
          <div className="quordle-button-container">
            {showQuordleButton() && memoryButton(-1)}
          </div>
          <div className="two-by-two-buttons">
            {memoryButton(0)}
            {memoryButton(1)}
            {memoryButton(2)}
            {memoryButton(3)}
          </div>
        </div>
      </nav>
      <AppContext.Provider
        value={{
          addRowToBoard,
          combinedBoardMode,
          storedBoardStates,
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
      <div className='content'>
        <div className='row'>
          <div className='game collumn'>
            <Board />
            <Keyboard />
          </div>
          <div className='stats collumn'>
            <WordStats words={words} wordStatsState={wordStatsState}/>
          </div>
        </div>
      </div>
      </AppContext.Provider>
    </div>
  );
}

export default App;
