import React, { useContext } from "react";
import { AppContext } from "../App";
import Letter from "./Letter";
import GameRow from "./GameRow";
import { maxRows, lettersPerWord } from "../data/BoardData";

const Board = () => {
  const { curLetterLoc } = useContext(AppContext);
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
    const classes = `game-row game-row--${(i <= curRow) ? 'active' : ''}`;
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