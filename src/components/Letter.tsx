import React, { useContext, useMemo }  from "react";
import { AppContext } from "../App";
import * as BoardData from "../data/BoardData";
import { publish } from "../utilities/Events";

interface parameters {
    rowIndex: number,
    letterIndex: number,
    showProg: boolean,
    key?: string,
}

const Letter = ({ rowIndex, letterIndex, showProg }:parameters) => {
    const { boardStr, 
        combinedBoardMode,
        storedBoardStates} = useContext(AppContext);

    const rotateLetterState = () => {
        publish("rotateLetterState", {rowIndex:rowIndex, letterIndex:letterIndex});
    }

    const [bgStyle, letterChar] = useMemo(() => {
        let bgStyle:React.CSSProperties;
        let letterChar:string;
        let letterState:string;
        const bgCssVals = { 
            "correct": getComputedStyle(document.documentElement).getPropertyValue('--bg-correct'),
            "wrongIndex": getComputedStyle(document.documentElement).getPropertyValue('--bg-wrong-index'),
            "wrong": getComputedStyle(document.documentElement).getPropertyValue('--bg-wrong'),
            "calc": getComputedStyle(document.documentElement).getPropertyValue('--bg-calc'),
        }
        if (combinedBoardMode) {
            const letters:BoardData.LetterType[] = storedBoardStates.map(brdStr => BoardData.getLetterInBoardString(brdStr, { rowIndex, letterIndex }));
            letterChar = (letters.find(letter => letter.letter !== BoardData.blankLetter) ?? letters[0]).letter;
            bgStyle = {
                background: `conic-gradient(rgb(${bgCssVals[letters[1].state]}) 90deg, rgb(${bgCssVals[letters[3].state]}) 90deg 180deg, rgb(${bgCssVals[letters[2].state]}) 180deg 270deg, rgb(${bgCssVals[letters[0].state]}) 270deg)`
            }
        } else {
            const letter:BoardData.LetterType = BoardData.getLetterInBoardString(boardStr, { rowIndex, letterIndex });
            letterChar = letter.letter;
            letterState = showProg ? "calc" : letter.state;
            bgStyle = {
                backgroundColor: `rgb(${bgCssVals[letterState]})`
            }
        }
        return [bgStyle, letterChar];
    }, [storedBoardStates, combinedBoardMode, boardStr, rowIndex, letterIndex, showProg])

    return (
        <div className='letter'
            style={bgStyle}
            onClick={rotateLetterState}
        >
            {letterChar}
        </div>
    );
}

export default Letter;