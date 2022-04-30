import React, { useContext } from "react";
import { AppContext } from "../App";

const Key = ({ keyName, keyLabel = "", sizeIndex = "0" }) => {
    const { onRotateLetterState, curLetterLoc, onSelectLetter, onDelete, onEnter } = 
        useContext(AppContext);
    if (keyLabel === "") {
        keyLabel = keyName;
    }

    const selectLetter = () => {
        if (keyName === "ENTER") {
            onEnter();
        } else if (keyName === "DELETE") {
            onDelete();
        } else if (keyName === " ") {
            onRotateLetterState(curLetterLoc);
        } else {
            onSelectLetter(keyName);
        }
    };
    const sizes = ["", " big", " spacebar"];
    return (
        <div
            className={`key${sizes[parseInt(sizeIndex)]}`}
            key={`_${keyName}`}
            onClick={selectLetter}
        >
            {keyLabel}
        </div>
    );
}

export default Key;
