import './App.css';

import React, { useState, createContext, useEffect } from 'react';

import * as BoardData from "./data/BoardData"
import Board from "./components/Board";
import Keyboard from "./components/Keyboard";
import InitProgress from "./components/InitProgress";
import { WordStats } from "./components/WordStats";
import Information, { InfoType } from './components/Information';
import * as WordleDict from './data/dictionaries/Wordle'
import * as WordleUtils from './utilities/WordleUtils';

//TODO: add column for partitions view that gives which board(s) the word 
// belongs to. Could just be shown on top of group b/c groups don't overlap
// unless the clues are the same

export const AppContext = createContext(undefined);
const initStatsInfo:WordleUtils.WordSetInfoType = {
  words: [[],[],[],[]],
  wordSetIndex: 0,
  combinedBoardMode: false,
  wordCount: 0,
};
const initBoardStr = "";
const storedBoardStates = [initBoardStr, initBoardStr, initBoardStr, initBoardStr];
const storedBoardLetterStateDirty = [false, false, false, false];
const storedBoardLettersDirty = [false, false, false, false];
const storedBoardCompleted = [false, false, false, false];
const initBoard = BoardData.getBoardFromString(storedBoardStates[initStatsInfo.wordSetIndex]);
const initLetterLoc = BoardData.getLetterLoc(initBoard);

const App = ({initWordSetType}: {initWordSetType:WordleDict.wordSet}) => {
  const [boardStr, setBoardStr] = useState(initBoardStr);
  const [curLetterLoc, setCurLetterLoc] = useState(initLetterLoc);
  const [initProgress, setInitProgress] = useState<number>(0);
  const [wordSetType, setWordSetType] = useState<WordleDict.wordSet>(initWordSetType);
  const [statsInfo, setStatsInfo] = useState<WordleUtils.WordSetInfoType>(initStatsInfo);
  const [infoType, setInfoType] = useState<InfoType>("help");

  useEffect(() => {
    setInitProgress(WordleUtils.initWordleIndexPartitionsProg(wordSetType));
  }, [initProgress, wordSetType]);    

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
          + ((index === statsInfo.wordSetIndex) ? boardRowStr : otherBoardStrs);
        storedBoardLetterStateDirty[index] = false;
        storedBoardLettersDirty[index] = true;
      }
    }
    const newBoard = BoardData.getBoardFromString(storedBoardStates[statsInfo.wordSetIndex]);
    setBoardStr(storedBoardStates[statsInfo.wordSetIndex]);
    setCurLetterLoc(BoardData.getLetterLoc(newBoard));
    if (BoardData.boardIsComplete(newBoard)) {
      storedBoardCompleted[statsInfo.wordSetIndex] = true;
    }
  }

  const addWordToBoard = (word:string, final: boolean) => {
    const boardWords = storedBoardStates.reduce((acc, boardStr) => acc.concat(BoardData.getBoardWords(boardStr)), []);
    if (boardWords.indexOf(word) < 0) {
        const letters = word.split("");
        const clue = final ? "=" : "-";
        const boardRow = letters.reduce((acc, letter) => acc += letter + clue, "");
        addRowToBoard(boardRow);
    }
  }

  const updateStatsInfo = () => {
    statsInfo.wordCount = statsInfo.combinedBoardMode ?
        statsInfo.words.reduce((acc, list) => acc + list.length, 0) :
        statsInfo.words[statsInfo.wordSetIndex].length;
    if (statsInfo.wordCount > 0) {
      setInfoType("stats");
      setStatsInfo({...statsInfo});
      storedBoardLetterStateDirty[statsInfo.wordSetIndex] = false;
      storedBoardLettersDirty[statsInfo.wordSetIndex] = false;
    } else {
      setInfoType(storedBoardCompleted[statsInfo.wordSetIndex] ? "completed" : "empty");
    }
  }

  const onShowHelp = () => {
    setInfoType("help");
  }

  const onEnter = () => {
    statsInfo.combinedBoardMode = false;
    if (storedBoardCompleted[statsInfo.wordSetIndex]) {
      statsInfo.words[statsInfo.wordSetIndex] = [];
      updateStatsInfo();
      return;
    }
    if (curLetterLoc.letterIndex !== (BoardData.lettersPerWord - 1)) {
      alert("Fill in full word to calculate words remaining")
      return;
    }

    if (curLetterLoc.rowIndex >= 0) {
      let curWord = "";
      const board = BoardData.getBoardFromString(storedBoardStates[statsInfo.wordSetIndex]);
      board[curLetterLoc.rowIndex].forEach(letter => { curWord += letter.letter.toLowerCase() });
  
      if (WordleUtils.getIndexFromWord(curWord) < 0) {
        alert(`Note: "${curWord}" is not in our dictionary`);
      }
    }

    const newWords = WordleUtils.wordle(WordleUtils.wordlePicks, storedBoardStates[statsInfo.wordSetIndex]);
    statsInfo.words[statsInfo.wordSetIndex] = newWords;
    updateStatsInfo();      
  }

  const onDelete = () => {
    if (curLetterLoc.rowIndex < 0) return;
    if (storedBoardCompleted[statsInfo.wordSetIndex]) {
      alert("switching board to not complete, please re-delete if desired.");
      const newBoard = BoardData.getBoardFromString(extendCurBoardStrToLongest());
      const newBoardStr = BoardData.getBoardString(newBoard);
      storedBoardStates[statsInfo.wordSetIndex] = newBoardStr;
      setBoardStr(newBoardStr);
      setCurLetterLoc(BoardData.getLetterLoc(newBoard));
      storedBoardCompleted[statsInfo.wordSetIndex] = false;
      return;
    }

    for (let index = 0; index < storedBoardStates.length; index++) {
      if (!storedBoardCompleted[index]) {
        const blankLetter = BoardData.getBlankLetter();
        const storedBoard = storedBoardStates[index];
        storedBoardStates[index] = BoardData.setLetterInBoardString(storedBoard, curLetterLoc, blankLetter);
        storedBoardLetterStateDirty[index] = false;
        storedBoardLettersDirty[index] = true;
      }
    }
    if (!storedBoardCompleted[statsInfo.wordSetIndex]) {
      const newBoard = BoardData.getBoardFromString(storedBoardStates[statsInfo.wordSetIndex]);
      setBoardStr(storedBoardStates[statsInfo.wordSetIndex]);
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
        storedBoardLetterStateDirty[index] = false;
        storedBoardLettersDirty[index] = true;
      }
    }
    const newBoard = BoardData.getBoardFromString(storedBoardStates[statsInfo.wordSetIndex]);
    if (!storedBoardCompleted[statsInfo.wordSetIndex]) {
      setBoardStr(storedBoardStates[statsInfo.wordSetIndex]);
      setCurLetterLoc(BoardData.getLetterLoc(newBoard));
    }
  }

  const extendCurBoardStrToLongest = ():string => {
    let newBoardStr = storedBoardStates[statsInfo.wordSetIndex];
    if (storedBoardCompleted[statsInfo.wordSetIndex]) {
      storedBoardCompleted[statsInfo.wordSetIndex] = false;
      // if completed state is changed, need to sync up with the
      //  uncompleted boards
      const longestBoardString = storedBoardStates.reduce((a, b) => a.length > b.length ? a : b);
      const extension = longestBoardString.slice(newBoardStr.length).replace(/[=/]/g, '-');
      newBoardStr += extension;
      storedBoardLetterStateDirty[statsInfo.wordSetIndex] = false;
      storedBoardLettersDirty[statsInfo.wordSetIndex] = true;
    }
    return newBoardStr;
  }

  const onRotateLetterState = (letterLoc:BoardData.LetterLocType) => {
    if (statsInfo.combinedBoardMode) {
      alert(`Switching back to board ${statsInfo.wordSetIndex + 1}`)
      switchToBoard (statsInfo.wordSetIndex);
      return;
    }
    let newBoardStr = extendCurBoardStrToLongest();
    const newBoard = BoardData.getBoardFromString(newBoardStr);
    const letter = newBoard[letterLoc.rowIndex][letterLoc.letterIndex];
    if (BoardData.letterIsBlank(letter)) return;
    newBoard[letterLoc.rowIndex][letterLoc.letterIndex].state = BoardData.rotateLetterState(letter.state);
    newBoardStr = BoardData.getBoardString(newBoard);
    storedBoardStates[statsInfo.wordSetIndex] = newBoardStr;
    setBoardStr(newBoardStr);
    setCurLetterLoc(BoardData.getLetterLoc(newBoard));
    if (BoardData.boardIsComplete(newBoard)) {
      storedBoardCompleted[statsInfo.wordSetIndex] = true;
    } else {
      storedBoardLetterStateDirty[statsInfo.wordSetIndex] = true;
    }
  }

  const calcCombinedWords = () => {
    const numBoards = storedBoardStates.length;
    const tempBoardStates = storedBoardStates.slice();
    for (let index = 0; index < numBoards; index++) {
      const boardStr = tempBoardStates[index];
      let otherIndex = tempBoardStates.length - 1;
      while (otherIndex > index) {
        if (boardStr === tempBoardStates[otherIndex]) {
          tempBoardStates[otherIndex] = "";
        }
        otherIndex--;
      }
      if (storedBoardCompleted[index] || tempBoardStates[index] === "") {
        statsInfo.words[index] = [];
      } else {
        statsInfo.words[index] = WordleUtils.wordle(WordleUtils.wordlePicks, boardStr);
      }
    };
    updateStatsInfo();
  }

  const switchToBoard = (boardIndex:number) => {
    if (initProgress === 1 && ((wordSetType === "quordle") || boardIndex === 0)) {
      if (boardIndex < 0) {
        statsInfo.combinedBoardMode = true;
        calcCombinedWords();
      } else {
        statsInfo.combinedBoardMode = false;
        statsInfo.wordSetIndex = boardIndex;
        const newBoardStr = storedBoardStates[statsInfo.wordSetIndex];
        setBoardStr(newBoardStr);
        const newBoard = BoardData.getBoardFromString(newBoardStr);
        const newLetterLoc = BoardData.getLetterLoc(newBoard);
        setCurLetterLoc(newLetterLoc);
        if (storedBoardCompleted[statsInfo.wordSetIndex]) {
          setInfoType("completed");
        } else if (newLetterLoc.letterIndex === initLetterLoc.letterIndex && newLetterLoc.rowIndex === initLetterLoc.rowIndex) {
          onShowHelp();
        } else if (storedBoardLetterStateDirty[statsInfo.wordSetIndex] ||
          !storedBoardLettersDirty[statsInfo.wordSetIndex]) {
          statsInfo.words[statsInfo.wordSetIndex] = WordleUtils.wordle(WordleUtils.wordlePicks, newBoardStr);
          updateStatsInfo();
        } else {
          setInfoType("needsAdjustment");
        }
      }
    }
  }

  const onReset = () => {
    for (let i = 0; i < storedBoardStates.length; i++) {
      storedBoardStates[i] = initBoardStr;
      storedBoardLetterStateDirty[i] = false;
      storedBoardLettersDirty[i] = false;
      storedBoardCompleted[i] = false;
    }
    switchToBoard(0);
  }

  const switchToWordSet = (type: WordleDict.wordSet) => {
    setInitProgress(0);
    setWordSetType(type);
    onReset();
  }

  const getBoardColorClass = (boardGroup:number, alt:boolean):string => {
    return `${alt ? "altGroup" : "group"}${boardGroup}Bg`;
  }

  const wordSetButton = (type: WordleDict.wordSet) => {
    let bgClassName:string = getBoardColorClass(0, type === WordleUtils.currentWordSetType);
    return (
      <button 
        onClick={() => switchToWordSet(type)} 
        tabIndex={-1}>
        <div className={`${bgClassName} word-set-button`}>{type === "quordle" ? "Q" : "W"}</div>
      </button>
    )
  }

  const memoryButton = (index:number) => {
    let bgClassName:string;
    if (index < 0) {
      bgClassName = (statsInfo.combinedBoardMode) ? "bg-qmem-button-selected" : "bg-qmem-button-deselected";
    } else {
      bgClassName = getBoardColorClass(index, !statsInfo.combinedBoardMode && index === statsInfo.wordSetIndex);
    }
    return (
      <button 
        id={`memory${index}`} 
        onClick={() => switchToBoard(index)} 
        tabIndex={-1}>
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
          <div className="word-set-button-container">
          <div className="one-by-two-buttons">
            {wordSetButton("wordle")}
            {wordSetButton("quordle")}
          </div>
          </div>
        </div>
        <div className="navSpacer" />
        <h1>{`${wordSetType[0].toUpperCase()}${wordSetType.slice(1)}`}&nbsp;Helper</h1>
        <div className={`memory-button-container${(wordSetType === "quordle") ? "" : " hidden"}`}>
          <div className="quordle-button-container">
            {memoryButton(-1)}
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
          addWordToBoard,
          storedBoardStates,
          combinedBoardMode: statsInfo.combinedBoardMode,
          boardStr,
          setBoardStr,
          curLetterLoc,
          getBoardColorClass,
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
            <div className='game column'>
              {initProgress < 1 ? 
              (<InitProgress progress={initProgress} />)
              :
              (<Board />)
              }
              <Keyboard hidden={initProgress < 1}/>
            </div>
          <div className='stats column'>
              {infoType === "stats" ?
              (<WordStats statsInfo={statsInfo} />)
              :
              (<Information infoType={infoType} />)
              }
              
            </div>
          </div>  
      </div>
      </AppContext.Provider>
    </div>
  );
}

export default App;
