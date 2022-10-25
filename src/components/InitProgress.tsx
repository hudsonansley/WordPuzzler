import React from "react";

const InitProgress = ({ progress }) => {
    const boxCount = 5;
    const boxes = [];
    for (let i = 0; i < boxCount; i++) {
        boxes.push(
            <div key={`_box_${i}`}
                className={`letter letter--${i / boxCount <= progress ? 'correct' : 'wrong' }`} 
            />
        )
    }
    return (
        <>
        <div className="game-row game-row--active">
            {boxes}
        </div>
        <div className="game-row">
            calculating word groups...
        </div>
        </>
    );
}
export default InitProgress;