import React, { useCallback, useEffect, useContext } from "react";
import Key from "./Key";
import { AppContext } from "../App";

const keys = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["Z", "X", "C", "V", "B", "N", "M"],
  ["Change Letter Closeness Color"]
];

const Keyboard = () => {

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
      if (event.key === "Enter") {
        event.preventDefault();
        onEnter();
      } else if (event.key === "Backspace") {
        onDelete();
      } else if (event.keyCode === 32) {
        event.preventDefault();
        onRotateLetterState(curLetterLoc);
      } else if (event.key === "?" || event.key === "/") {
        onShowHelp();
      } else if (event.key >= "0" && event.key <= "4") {
        switchToBoard(parseInt(event.key) - 1);
      } else {
        keys.forEach(row => { row.forEach(key => {
          if (event.key.toLowerCase() === key.toLowerCase()) {
            onSelectLetter(key);
          }
        })});
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
      <div className="line" key="line0">
        {keys[0].map((key) => {
          return <Key keyName={key} key={`_${key}`}/>;
        })}
      </div>
      <div className="line" key="line1">
        {keys[1].map((key) => {
          return <Key keyName={key} key={`_${key}`}/>;
        })}
      </div>
      <div className="line" key="line2">
        <Key keyName={"ENTER"} sizeIndex="1" key="ENTER" />
        {keys[2].map((key) => {
          return <Key keyName={key} key={`_${key}`}/>;
        })}
        <Key keyName={"DELETE"} sizeIndex="1" key="DELETE" />
        </div>
      <div className="line" key="line3">
        <Key keyName=" " keyLabel={keys[3][0]} sizeIndex="2" key="CHANGE" />
      </div>
    </div>
  );
}

export default Keyboard;