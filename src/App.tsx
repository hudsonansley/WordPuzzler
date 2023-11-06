import React, { useState, createContext, useEffect, useMemo } from "react";

import "./App.css";
import * as BoardData from "./data/BoardData";
import Board from "./components/Board";
import Keyboard from "./components/Keyboard";
import InitProgress from "./components/InitProgress";
import { WordStats } from "./components/WordStats";
import Information, { InfoType } from "./components/Information";
import * as WordleDict from "./data/dictionaries/Wordle";
import * as WordleUtils from "./utilities/WordleUtils";
import { getBoardColorClass } from "./utilities/Styles";
import { subscribe, unsubscribe, publish } from "./utilities/Events";

export const AppContext = createContext(undefined);
const initBoardStr = "";
const storedBoardStates = [
  initBoardStr,
  initBoardStr,
  initBoardStr,
  initBoardStr,
];
const initStatsInfo: WordleUtils.WordSetInfoType = {
  wordSets: [[], [], [], []],
  wordSetIndex: 0,
  combinedBoardIndexStrings: null,
  boardStates: storedBoardStates,
  wordCount: 0,
};
const storedBoardLetterStateDirty = [false, false, false, false];
const storedBoardLettersDirty = [false, false, false, false];
const storedBoardCompleted = [false, false, false, false];
const initBoard = BoardData.getBoardFromString(
  storedBoardStates[initStatsInfo.wordSetIndex]
);
const initLetterLoc = BoardData.getLetterLoc(initBoard);
let pendingStatsUpdate = false;

const App = ({ initWordSetType }: { initWordSetType: WordleDict.wordSet }) => {
  const [boardStr, setBoardStr] = useState(initBoardStr);
  const [curLetterLoc, setCurLetterLoc] = useState(initLetterLoc);
  const [initProgress, setInitProgress] = useState<number>(0);
  const [wordSetType, setWordSetType] =
    useState<WordleDict.wordSet>(initWordSetType);
  const [statsInfo, setStatsInfo] =
    useState<WordleUtils.WordSetInfoType>(initStatsInfo);
  const [infoType, setInfoType] = useState<InfoType>("help");

  useEffect(() => {
    const handleInitProgressUpdated = (event: Event): void => {
      const prog: number = (event as CustomEvent).detail?.progress ?? 0;
      if (prog) {
        setInitProgress(prog);
        if (prog < 1) {
          setTimeout(() => {
            WordleUtils.initWordleIndexPartitionsProg(wordSetType);
          }, 1);
        } else {
          unsubscribe("initProgressUpdated", handleInitProgressUpdated);
          if (pendingStatsUpdate) {
            onEnter(true);
          }
        }
      }
    };
    subscribe("initProgressUpdated", handleInitProgressUpdated);
    WordleUtils.initWordleIndexPartitionsProg(wordSetType);
  }, []);

  useEffect(() => {
    const handleKeyTapped = (event) => {
      const key = event.detail?.key ?? "";
      if (key) {
        switch (key) {
          case "ENTER":
            onEnter();
            break;
          case "DELETE":
          case "BACKSPACE":
            onDelete();
            break;
          case " ":
            onRotateLetterState(curLetterLoc);
            break;
          case "?":
            onShowHelp();
            break;
          case "<":
            publish("addTargetWordToBoard");
            break;
          case ">":
            setTargetWord();
            break;
          case "0":
          case "1":
          case "2":
          case "3":
          case "4":
            switchToBoard(parseInt(key) - 1);
            break;
          default:
            onSelectLetter(key);
        }
      }
    };

    subscribe("keyTapped", handleKeyTapped);
    return () => {
      unsubscribe("keyTapped", handleKeyTapped);
    };
  });

  useEffect(() => {
    const handleAddWordToBoard = (event) => {
      const { word }: { word: string } = event.detail;
      addWordToBoard(word);
    };
    const handleRotateLetterState = (event) => {
      const letterLoc: BoardData.LetterLocType = event.detail;
      onRotateLetterState(letterLoc);
    };
    subscribe("addWordToBoard", handleAddWordToBoard);
    subscribe("rotateLetterState", handleRotateLetterState);
    return () => {
      unsubscribe("addWordToBoard", handleAddWordToBoard);
      unsubscribe("rotateLetterState", handleRotateLetterState);
    };
  });
  /**
   * @param  {string} boardRowStr string containing letters and clues
   *  given string is used to set the next row in the board with both
   * letters and clues specified
   */
  const addRowToBoard = (boardRowStr: string) => {
    if (curLetterLoc.letterIndex !== BoardData.lettersPerWord - 1) {
      return;
    }
    if (storedBoardCompleted[statsInfo.wordSetIndex]) {
      const firstNotCompletedIndex = storedBoardCompleted.findIndex(
        (completed) => !completed
      );
      statsInfo.wordSetIndex =
        firstNotCompletedIndex < 0 ? 0 : firstNotCompletedIndex;
    }
    boardRowStr = boardRowStr.toUpperCase();
    const otherBoardStrs = boardRowStr.replace(/=/g, "-");
    for (let index = 0; index < storedBoardStates.length; index++) {
      if (!storedBoardCompleted[index]) {
        const storedBoard = storedBoardStates[index];
        storedBoardStates[index] =
          (storedBoard.length === 0 ? "" : storedBoard + "_") +
          (index === statsInfo.wordSetIndex ? boardRowStr : otherBoardStrs);
        storedBoardLetterStateDirty[index] = false;
        storedBoardLettersDirty[index] = true;
      }
    }
    const newBoard = BoardData.getBoardFromString(
      storedBoardStates[statsInfo.wordSetIndex]
    );
    setBoardStr(storedBoardStates[statsInfo.wordSetIndex]);
    setCurLetterLoc(BoardData.getLetterLoc(newBoard));
    if (BoardData.boardIsComplete(newBoard)) {
      storedBoardCompleted[statsInfo.wordSetIndex] = true;
    }
  };

  /**
   * @param  {string} word the word to add to the board
   */
  const addWordToBoard = (word: string) => {
    const boardWords = storedBoardStates.reduce(
      (acc, boardStr) => acc.concat(BoardData.getBoardWords(boardStr)),
      []
    );
    if (boardWords.indexOf(word) < 0) {
      const letters = word.split("");
      const clue = statsInfo.wordCount === 1 ? "=" : "-";
      const boardRow = letters.reduce((acc, letter) => acc + letter + clue, "");
      addRowToBoard(boardRow);
    }
  };

  const setTargetWord = () => {
    const word = BoardData.getBoardWords(boardStr).pop();
    publish("setTargetWord", { word });
  };

  /**
   *  does some final calculations based on statsInfo data and
   * updates the state of both infoType and statsInfo
   */
  const updateStatsInfo = () => {
    statsInfo.wordCount = statsInfo.combinedBoardIndexStrings
      ? statsInfo.wordSets.reduce((acc, list) => acc + list.length, 0)
      : statsInfo.wordSets[statsInfo.wordSetIndex].length;
    if (storedBoardCompleted[statsInfo.wordSetIndex]) {
      setInfoType("completed");
    } else {
      setInfoType("stats");
      setStatsInfo({ ...statsInfo, boardStates: storedBoardStates });
      storedBoardLetterStateDirty[statsInfo.wordSetIndex] = false;
      storedBoardLettersDirty[statsInfo.wordSetIndex] = false;
    }
  };

  const onShowHelp = () => {
    setInfoType("help");
  };
  /**
   *  Sets statsInfo based on the current board state, forcing
   * the update of the stats data
   */
  const onEnter = (force = false) => {
    if (!force && initProgress < 1) {
      pendingStatsUpdate = true;
      return;
    }
    statsInfo.combinedBoardIndexStrings = null;
    if (storedBoardCompleted[statsInfo.wordSetIndex]) {
      statsInfo.wordSets[statsInfo.wordSetIndex] = [];
      updateStatsInfo();
      return;
    }
    if (curLetterLoc.letterIndex !== BoardData.lettersPerWord - 1) {
      alert("Fill in full word to calculate words remaining");
      return;
    }

    const newWords = WordleUtils.wordle(
      WordleUtils.wordlePicks,
      storedBoardStates[statsInfo.wordSetIndex]
    );
    statsInfo.wordSets[statsInfo.wordSetIndex] = newWords;
    updateStatsInfo();
  };

  /**
   *  removed the last letter on the board
   */
  const onDelete = () => {
    if (curLetterLoc.rowIndex < 0) return;
    if (storedBoardCompleted[statsInfo.wordSetIndex]) {
      alert("switching board to not complete, please re-delete if desired.");
      const newBoard = BoardData.getBoardFromString(
        extendCurBoardStrToLongest()
      );
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
        storedBoardStates[index] = BoardData.setLetterInBoardString(
          storedBoard,
          curLetterLoc,
          blankLetter
        );
        storedBoardLetterStateDirty[index] = false;
        storedBoardLettersDirty[index] = true;
      }
    }
    if (
      statsInfo.combinedBoardIndexStrings ||
      !storedBoardCompleted[statsInfo.wordSetIndex]
    ) {
      const newBoard = BoardData.getBoardFromString(
        storedBoardStates[statsInfo.wordSetIndex]
      );
      setBoardStr(storedBoardStates[statsInfo.wordSetIndex]);
      setCurLetterLoc(BoardData.getLetterLoc(newBoard));
    }
  };
  /**
   * @param  {string} key
   *  enters the given key character onto the board in the last
   * position
   */
  const onSelectLetter = (key: string) => {
    const loc = BoardData.incrementLetterLoc(curLetterLoc);
    if (loc.rowIndex >= BoardData.maxRows) return;
    key = key.toUpperCase();

    const letter: BoardData.LetterType = BoardData.getBlankLetter();
    letter.letter = key;
    for (let index = 0; index < storedBoardStates.length; index++) {
      if (!storedBoardCompleted[index]) {
        const storedBoard = storedBoardStates[index];
        storedBoardStates[index] = BoardData.setLetterInBoardString(
          storedBoard,
          loc,
          letter
        );
        storedBoardLetterStateDirty[index] = false;
        storedBoardLettersDirty[index] = true;
      }
    }
    if (
      statsInfo.combinedBoardIndexStrings ||
      !storedBoardCompleted[statsInfo.wordSetIndex]
    ) {
      const newBoard = BoardData.getBoardFromString(
        storedBoardStates[statsInfo.wordSetIndex]
      );
      setBoardStr(storedBoardStates[statsInfo.wordSetIndex]);
      const newLoc = BoardData.getLetterLoc(newBoard);
      setCurLetterLoc(newLoc);
    }
  };
  /**
   * @returns string
   *  finds the longest board string of all the boards and retuns it
   */
  const extendCurBoardStrToLongest = (): string => {
    let newBoardStr = storedBoardStates[statsInfo.wordSetIndex];
    if (storedBoardCompleted[statsInfo.wordSetIndex]) {
      storedBoardCompleted[statsInfo.wordSetIndex] = false;
      // if completed state is changed, need to sync up with the
      //  uncompleted boards
      const longestBoardString = storedBoardStates.reduce((a, b) =>
        a.length > b.length ? a : b
      );
      const extension = longestBoardString
        .slice(newBoardStr.length)
        .replace(/[=/]/g, "-");
      newBoardStr += extension;
      storedBoardLetterStateDirty[statsInfo.wordSetIndex] = false;
      storedBoardLettersDirty[statsInfo.wordSetIndex] = true;
    }
    return newBoardStr;
  };
  /**
   * @param  {BoardData.LetterLocType} letterLoc
   *  rotates letter clue at the given location between the three
   * possible states:
   *  wrong letter (gray)
   *  wrong placement (yellow)
   *  correct letter and placement (green)
   */
  const onRotateLetterState = (letterLoc: BoardData.LetterLocType) => {
    if (statsInfo.combinedBoardIndexStrings) {
      let boardIndex = 0;
      while (
        boardIndex < storedBoardCompleted.length &&
        storedBoardCompleted[boardIndex]
      ) {
        boardIndex++;
      }
      alert(`Switching to board ${boardIndex + 1}`);
      switchToBoard(boardIndex);
      return;
    }
    let newBoardStr = extendCurBoardStrToLongest();
    const newBoard = BoardData.getBoardFromString(newBoardStr);
    const letter = newBoard[letterLoc.rowIndex][letterLoc.letterIndex];
    if (BoardData.letterIsBlank(letter)) return;
    newBoard[letterLoc.rowIndex][letterLoc.letterIndex].state =
      BoardData.rotateLetterState(letter.state);
    newBoardStr = BoardData.getBoardString(newBoard);
    storedBoardStates[statsInfo.wordSetIndex] = newBoardStr;
    setBoardStr(newBoardStr);
    setCurLetterLoc(BoardData.getLetterLoc(newBoard));
    if (BoardData.boardIsComplete(newBoard)) {
      storedBoardCompleted[statsInfo.wordSetIndex] = true;
    } else {
      storedBoardLetterStateDirty[statsInfo.wordSetIndex] = true;
    }
  };
  /**
   *  Calcultes the word sets based on the stored board strings
   * and keeps track of which boards are duplicates
   */
  const calcCombinedWords = () => {
    if (initProgress < 1) {
      return;
    }
    const numBoards = storedBoardStates.length;
    let updateWordSetIndex = true;
    statsInfo.combinedBoardIndexStrings = Array(numBoards);
    let boardIndices: number[];
    const tempBoardStates = storedBoardStates.slice();
    for (let index = 0; index < numBoards; index++) {
      boardIndices = [index + 1];
      const boardStr = tempBoardStates[index];
      let otherIndex = tempBoardStates.length - 1;
      while (otherIndex > index) {
        if (boardStr === tempBoardStates[otherIndex]) {
          tempBoardStates[otherIndex] = "";
          boardIndices.push(otherIndex + 1);
        }
        otherIndex--;
      }
      boardIndices.sort((a, b) => a - b);
      statsInfo.combinedBoardIndexStrings[index] = boardIndices.join(",");
      if (storedBoardCompleted[index] || tempBoardStates[index] === "") {
        statsInfo.wordSets[index] = [];
      } else {
        statsInfo.wordSets[index] = WordleUtils.wordle(
          WordleUtils.wordlePicks,
          boardStr
        );
      }
      if (!storedBoardCompleted[index] && updateWordSetIndex) {
        statsInfo.wordSetIndex = index;
        updateWordSetIndex = false;
      }
    }
    updateStatsInfo();
  };
  /**
   * @param  {number} boardIndex
   *  sets the current board display to the given board index
   */
  const switchToBoard = (boardIndex: number) => {
    if (wordSetType === "quordle" || boardIndex === 0) {
      if (boardIndex < 0) {
        calcCombinedWords();
      } else {
        statsInfo.combinedBoardIndexStrings = null;
        statsInfo.wordSetIndex = boardIndex;
        const newBoardStr = storedBoardStates[statsInfo.wordSetIndex];
        setBoardStr(newBoardStr);
        const newBoard = BoardData.getBoardFromString(newBoardStr);
        const newLetterLoc = BoardData.getLetterLoc(newBoard);
        setCurLetterLoc(newLetterLoc);
        if (storedBoardCompleted[statsInfo.wordSetIndex]) {
          setInfoType("completed");
        } else if (
          newLetterLoc.letterIndex === initLetterLoc.letterIndex &&
          newLetterLoc.rowIndex === initLetterLoc.rowIndex
        ) {
          onShowHelp();
        } else if (
          initProgress === 1 &&
          (storedBoardLetterStateDirty[statsInfo.wordSetIndex] ||
            !storedBoardLettersDirty[statsInfo.wordSetIndex])
        ) {
          statsInfo.wordSets[statsInfo.wordSetIndex] = WordleUtils.wordle(
            WordleUtils.wordlePicks,
            newBoardStr
          );
          updateStatsInfo();
        } else {
          setInfoType("needsAdjustment");
        }
      }
    }
  };
  /**
   *  resets board data for a new game
   */
  const onReset = () => {
    for (let i = 0; i < storedBoardStates.length; i++) {
      storedBoardStates[i] = initBoardStr;
      storedBoardLetterStateDirty[i] = false;
      storedBoardLettersDirty[i] = false;
      storedBoardCompleted[i] = false;
    }
    switchToBoard(0);
  };

  /**
   * @param  {WordleDict.wordSet} type
   *  switches the words used based on the given type and
   * recalculates initial word groups
   */
  const switchToWordSet = (type: WordleDict.wordSet) => {
    if (window) {
      window.location.search = type === "quordle" ? "quordle" : "";
    } else {
      setInitProgress(0);
      setWordSetType(type);
      onReset();
    }
  };
  /**
   * @param  {WordleDict.wordSet} type
   *  renders a wordSetButton for the given type
   */
  const wordSetButton = (type: WordleDict.wordSet) => {
    let bgClassName: string = getBoardColorClass(
      -1,
      type === WordleUtils.currentWordSetType
    );
    return (
      <button onClick={() => switchToWordSet(type)} tabIndex={-1}>
        <div className={`${bgClassName} word-set-button`}>
          {type === "quordle" ? "Q" : "W"}
        </div>
      </button>
    );
  };
  /**
   * @param  {number} index
   *  renders a board memory button for the given index
   */
  const memoryButton = (index: number) => {
    let bgClassName: string;
    if (index < 0) {
      bgClassName = statsInfo.combinedBoardIndexStrings
        ? "bg-qmem-button-selected"
        : "bg-qmem-button-deselected";
    } else {
      bgClassName = getBoardColorClass(
        index,
        !statsInfo.combinedBoardIndexStrings && index === statsInfo.wordSetIndex
      );
    }
    return (
      <button
        id={`memory${index}`}
        onClick={() => switchToBoard(index)}
        tabIndex={-1}
      >
        <div className={`${bgClassName} memory-button`}>{index + 1}</div>
      </button>
    );
  };

  const getProviderProps = useMemo(() => {
    return {
      storedBoardStates,
      combinedBoardMode: !!statsInfo.combinedBoardIndexStrings,
      boardStr,
      curLetterLoc,
    };
  }, [statsInfo.combinedBoardIndexStrings, boardStr, curLetterLoc]);

  return (
    <div className="App">
      <nav>
        <div className="nav-buttons">
          <button id="help" onClick={onShowHelp} tabIndex={-1}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24"
              viewBox="0 0 24 24"
              width="24"
            >
              <path
                fill="#ffffff"
                d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z"
              ></path>
            </svg>
          </button>
          <button id="reset" onClick={onReset} tabIndex={-1}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              height="24"
              viewBox="0 0 24 24"
              width="24"
            >
              <path
                fill="#ffffff"
                d="M20.817 11.186a8.94 8.94 0 0 0-1.355-3.219 9.053 9.053 0 0 0-2.43-2.43 8.95 8.95 0 0 0-3.219-1.355 9.028 9.028 0 0 0-1.838-.18V2L8 5l3.975 3V6.002c.484-.002.968.044 1.435.14a6.961 6.961 0 0 1 2.502 1.053 7.005 7.005 0 0 1 1.892 1.892A6.967 6.967 0 0 1 19 13a7.032 7.032 0 0 1-.55 2.725 7.11 7.11 0 0 1-.644 1.188 7.2 7.2 0 0 1-.858 1.039 7.028 7.028 0 0 1-3.536 1.907 7.13 7.13 0 0 1-2.822 0 6.961 6.961 0 0 1-2.503-1.054 7.002 7.002 0 0 1-1.89-1.89A6.996 6.996 0 0 1 5 13H3a9.02 9.02 0 0 0 1.539 5.034 9.096 9.096 0 0 0 2.428 2.428A8.95 8.95 0 0 0 12 22a9.09 9.09 0 0 0 1.814-.183 9.014 9.014 0 0 0 3.218-1.355 8.886 8.886 0 0 0 1.331-1.099 9.228 9.228 0 0 0 1.1-1.332A8.952 8.952 0 0 0 21 13a9.09 9.09 0 0 0-.183-1.814z"
              />
            </svg>
          </button>
          <div className="word-set-button-container">
            <div className="one-by-two-buttons">
              {wordSetButton("wordle")}
              {wordSetButton("quordle")}
            </div>
          </div>
        </div>
        <h1>
          {`${wordSetType[0].toUpperCase()}${wordSetType.slice(1)}`} Helper
        </h1>
        <div
          className={`memory-button-container${
            wordSetType === "quordle" ? "" : " hidden"
          }`}
        >
          <div className="quordle-button-container">{memoryButton(-1)}</div>
          <div className="two-by-two-buttons">
            {memoryButton(0)}
            {memoryButton(1)}
            {memoryButton(2)}
            {memoryButton(3)}
          </div>
        </div>
      </nav>
      <AppContext.Provider value={getProviderProps}>
        <div className="content">
          <div className="row">
            <div className="game column">
              {initProgress < 1 ? (
                <InitProgress progress={initProgress} />
              ) : (
                <Board />
              )}
              <Keyboard hidden={false} />
            </div>
            <div className="stats column">
              {infoType === "stats" ? (
                <WordStats statsInfo={statsInfo} />
              ) : (
                <Information infoType={infoType} />
              )}
            </div>
          </div>
        </div>
      </AppContext.Provider>
    </div>
  );
};

export default App;
