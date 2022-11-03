import React, { useCallback, useEffect } from "react";
import Key from "./Key";
import { publish } from "../utilities/Events"

const keyLabels = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "delete"],
  ["Z", "X", "C", "V", "B", "N", "M", "<", ">"],
  ["Change Letter Color", "enter"]
];

const Keyboard = ({hidden}) => {

  const handleKeyboard = useCallback(
    (event) => {
      let key = '';
      let eventKey = event.key.toUpperCase();
      if (eventKey === 'ENTER' || eventKey === 'BACKSPACE') {
        event.preventDefault();
        key = eventKey;
      } else if (event.keyCode === 32) {
        event.preventDefault();
        key = ' ';
      } else if (eventKey === '?' || eventKey === '/') {
        key = '?';
      } else if (eventKey === '<' || eventKey === ',') {
        key = '<';
      } else if (eventKey === '>' || eventKey === '.') {
        key = '>';
      } else if (eventKey.length === 1 &&
          ((eventKey >= '0' && eventKey <= '4') ||
          (eventKey >= 'A' && eventKey <= 'Z'))) {
        key = eventKey;
      } else {
        event.preventDefault();
      }
      if (key.length > 0) {
        publish('keyTapped', {key});
      }      
  }, []);

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