import React, { useContext } from "react";
import { AppContext } from "../App";
import Letter from "./Letter";
import GameRow from "./GameRow";

export const letterStates = [
  "wrong",
  "wrongIndex",
  "correct"
] as const;
export type LetterState = typeof letterStates[number];
export type LetterType = {letter: string, state: LetterState};
export const rotateLetterState = (letterState:LetterState):LetterState => {
  return letterStates[(letterStates.indexOf(letterState) + 1) % letterStates.length];
}

export const getBoardStart = (wordLength, maxRows) => {
  const result:LetterType[][] = [];
  for (let i=0; i<maxRows; i++) {
    const word:LetterType[] = []
    for (let j=0; j<wordLength; j++) {
      word.push({letter:"", state: "wrong"});
    }
    result.push(word);
  }
  return result;
};

const Board = () => {
  const { maxRows, lettersPerWord, curLetterLoc } = useContext(AppContext);
  const curRow = curLetterLoc.rowIndex + (curLetterLoc.letterIndex === lettersPerWord - 1 ? 1 : 0);
  const gameRows = [];
  for (let i = 0; i < maxRows; i++) {
    const items = [];
    for (let j = 0; j < lettersPerWord; j++) {
      const key = `_${i}_${j}`;
      items.push(
        (<Letter rowIndex={i} letterIndex={j} key={key}/>)
      );
    }
    const classes = `gameRow${(i <= curRow) ? ' active' : ''}`;
    // const key = `_${i}`;
    const row = React.createElement(GameRow, {classes, rowIndex:i, key: i, items});
    gameRows.push(row);
  }
      
  return (
    <div className="board" key="board">
      {gameRows}
    </div>
  );
}

export default Board;