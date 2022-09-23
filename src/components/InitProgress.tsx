import React from "react";

const InitProgress = ({ progress }) => {
    const boxCount = 5;
    const boxes = [];
    for (let i = 0; i < boxCount; i++) {
        boxes.push(
            <div 
                className={`letter letter--${i / boxCount <= progress ? 'correct' : 'wrong' }`} 
            />
        )
    }
    return (
        <>
        <div className="progress-container">
            <div className="progress">
                initializing...
            </div>
        </div>
        <div className="progress-container">
            <div className="progress">
                <div className="gameRow gameRow--active">
                    {boxes}
                </div>
            </div>
        </div>
        </>
    );
}
export default InitProgress;