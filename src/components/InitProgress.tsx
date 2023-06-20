import React from "react";
import Letter from "./Letter";

const InitProgress = ({ progress }) => {
  const boxCount = 5;
  const boxes = [];
  for (let i = 0; i < boxCount; i++) {
    const showProg = i / boxCount <= progress;
    boxes.push(
      <Letter
        rowIndex={0}
        letterIndex={i}
        key={`_box_${i}`}
        showProg={showProg}
      />
    );
  }
  return (
    <>
      <div className="game-row game-row--active">{boxes}</div>
      <div className="game-row">calculating word groups...</div>
    </>
  );
};
export default InitProgress;
