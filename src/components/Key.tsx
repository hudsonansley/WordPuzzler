import React, { useContext } from "react";
import { AppContext } from "../App";

interface parameters {
    keyLabel: string,
    key?: string,
}

const Key = ({ keyLabel }:parameters) => {
    const { onRotateLetterState, curLetterLoc, onSelectLetter, onDelete, onEnter } = 
        useContext(AppContext);

    const selectLetter = () => {
        if (keyLabel === "ENTER") {
            onEnter();
        } else if (keyLabel === "DELETE") {
            onDelete();
        } else if (keyLabel.length ===  1) {
            onSelectLetter(keyLabel);
        } else { // spacebar
            onRotateLetterState(curLetterLoc);
        }
    };
    const size = keyLabel.length === 1 ? "" : keyLabel.length < 8 ? "big" : "spacebar";

    return (
        <div
            className={`key ${size}`}
            onClick={selectLetter}
        >
            {keyLabel}
        </div>
    );
}

export default Key;
