import React from "react";
import Key from "./Key";
import { publish } from "../utilities/Events";
import useEventListener from "@use-it/event-listener";

const keyLabels = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L", "delete"],
  ["Z", "X", "C", "V", "B", "N", "M", "<", ">"],
  ["change letter color", "enter"],
];

const Keyboard = ({ hidden }) => {
  const transformKey = (key: string): string => {
    let result = key.toUpperCase();
    if (result === "?" || result === "/") {
      result = "?";
    } else if (result === "<" || result === ",") {
      result = "<";
    } else if (result === ">" || result === ".") {
      result = ">";
    } else if (
      result !== "ENTER" &&
      result !== "BACKSPACE" &&
      result !== " " &&
      (result.length !== 1 ||
        ((result < "0" || result > "4") && (result < "A" || result > "Z")))
    ) {
      result = "";
    }
    return result;
  };
  const handleKeyboard = (event) => {
    if (event.metaKey || event.altKey || event.ctrlKey) {
      return;
    }
    const key = transformKey(event.key);
    if (key.length > 0) {
      event.preventDefault();
      publish("keyTapped", { key });
    }
  };

  useEventListener("keydown", handleKeyboard);

  return (
    <div className="keyboard" onKeyDown={handleKeyboard}>
      {keyLabels.map((keyRow, i) => {
        return (
          <div className={`line${hidden ? " hidden" : ""}`} key={`line${i}`}>
            {keyRow.map((keyLabel) => {
              return (
                <Key
                  keyLabel={keyLabel}
                  key={`_${keyLabel.split(" ").join("")}`}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

export default Keyboard;
