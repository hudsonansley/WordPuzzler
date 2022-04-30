import React, { useContext }  from "react";
import { AppContext } from "../App";

const Letter = ({ rowIndex, letterIndex }) => {
    const { board, onRotateLetterState } = useContext(AppContext);
    const letter = board[rowIndex][letterIndex];

    const rotateLetterState = () => {
        onRotateLetterState({rowIndex:rowIndex, letterIndex:letterIndex});
    }

    return (
        <div className={`letter ${letter.state}`} 
            id={letterIndex}
            onClick={rotateLetterState}
        >
            {letter.letter}
        </div>
    );
}

export default Letter;