import React from "react";
import { publish } from "../utilities/Events";

interface Parameters {
    keyLabel: string,
    key?: string,
}

const Key = ({ keyLabel }:Parameters) => {
    const selectLetter = () => {
        let key = keyLabel.toUpperCase();
        if (key.length > 1 && key !== "ENTER" && key !== "DELETE") {
            key = ' ';
        }
        publish('keyTapped', {key});
    };
    let size = "";
    if (keyLabel.length > 1) {
        size = keyLabel.length < 8 ? "big" : "spacebar";
    }

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
