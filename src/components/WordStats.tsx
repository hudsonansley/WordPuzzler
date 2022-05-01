import React, { ReactFragment, useContext}  from "react";
import { AppContext } from "../App";
import { stats, wordPercentagesType } from '../utilities/WordUtils';

const WordStats = ():JSX.Element => {
    const { words, curLetterLoc } = useContext(AppContext);
    const wordCount = words?.length;
    
    if (curLetterLoc.rowIndex >= 0 && words !== null) {
        let _, wordPercentages:wordPercentagesType;    
        [_, _, wordPercentages] = stats(words);
        
        return (
            <div className="stats" id="statsTable">
            <table className="statTable">
                <thead>
                <tr><th>words<br/>({wordCount})</th><th>letter<br/>scores</th><th>place<br/>scores</th></tr>
                </thead>
                <tbody>
                {wordPercentages.map( wordInfo => {
                    return (
                        <tr key={wordInfo[1]}>
                            <td key="word">{wordInfo[1]}</td>
                            <td key="score">{wordInfo[0].toFixed(4)}</td>
                            <td key="placement">{(wordInfo[2] / wordCount).toFixed(4)}</td>
                        </tr>
                        )
                    })
                }
                </tbody>
            </table>
            </div>
        )
    } else {
        return (
            <div className="stats help">
                Set the word(s) based on your wordle game and hit enter.
                <p/>
                Toggle the letter placement color to match your wordle entries with the space bar for the last letter entered, or by tapping a letter.
                <p/>
                A list of the possible words will be shown here, 
                sorted by their letter score 
                (max of 1.0, based on the frequency of each unique letter of the word in the current word list) 
                and breaks ties with the letter placement 
                (max of 5.0. based on how many of the current word list share the same letter location)
            </div>
        )
    }
}

export default WordStats;
