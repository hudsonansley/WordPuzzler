import React, { useCallback, useEffect, useContext } from "react";
import Key from "./Key";
import { AppContext } from "../App";

const keyLabels = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M", "DELETE"],
  ["Change Letter Color", "ENTER"]
];

const Keyboard = ({hidden}) => {

  const {
    curLetterLoc,
    onSelectLetter,
    onEnter,
    onDelete,
    onRotateLetterState,
    switchToBoard,
    onShowHelp,
  } = useContext(AppContext);

  const handleKeyboard = useCallback(
    (event) => {
      const key = event.key.toUpperCase();
      if (key === "ENTER") {
        event.preventDefault();
        onEnter();
      } else if (key === "BACKSPACE") {
        onDelete();
      } else if (event.keyCode === 32) {
        event.preventDefault();
        onRotateLetterState(curLetterLoc);
      } else if (key === "?" || key === "/") {
        onShowHelp();
      } else if (key >= "0" && key <= "4") {
        switchToBoard(parseInt(key) - 1);
      } else {
        keyLabels.forEach(keyRow => {
          if (keyRow.indexOf(key) >= 0) {
            onSelectLetter(key);
          }
        });
      }
    },
    [curLetterLoc, onDelete, onEnter, onRotateLetterState, onSelectLetter, switchToBoard, onShowHelp]
  );
  useEffect(() => {
    document.addEventListener("keydown", handleKeyboard);
    return () => {
      document.removeEventListener("keydown", handleKeyboard);
    };
  }, [handleKeyboard]);

  return (
    <div className="keyboard" onKeyDown={handleKeyboard}>
      {keyLabels.map((keyRow, i) => {
        return (
        <div className={`line${hidden ? " hidden": ""}`} key={`line${i}`}>
          {keyRow.map((keyLabel) => {
            return <Key keyLabel={keyLabel} key={`_${keyLabel.split(" ").join("")}`}/>;
          })}
        </div>
        )
      })}
    </div>
  );
}

export default Keyboard;