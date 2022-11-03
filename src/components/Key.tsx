import React from "react";
import { publish } from "../utilities/Events";

interface parameters {
    keyLabel: string,
    key?: string,
}

const Key = ({ keyLabel }:parameters) => {
    const selectLetter = () => {
        let key = keyLabel.toUpperCase();
        if (key.length > 1 && key !== "ENTER" && key !== "DELETE") {
            key = ' ';
        }
        publish('keyTapped', {key});
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
