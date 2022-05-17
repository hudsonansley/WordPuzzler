import React, { useContext }  from "react";
import { AppContext } from "../App";
import * as BoardData from "../data/BoardData"

const Letter = ({ rowIndex, letterIndex }) => {
    const { boardStr, onRotateLetterState } = useContext(AppContext);
    const letter = BoardData.getLetterInBoardString(boardStr, { rowIndex, letterIndex });

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