import React, { useContext, useState, useEffect }  from "react";
import { AppContext } from "../App";
import { wordleFreqStats } from '../utilities/WordUtils';
import * as ArrayUtils from "../utilities/ArrayUtils";

const WordStats = ({words}) => {
    const sortOrder: ArrayUtils.sortOrderType[] = [{index: 0, decending: false}, {index: 2, decending: false}, {index: 1, decending: true}];
    // const { curLetterLoc } = useContext(AppContext);
    const [ wordPercentages, setWordPercentages] = useState([]);
    const wordCount = words?.length;

    useEffect (() => {
        if (words) { 
            setWordPercentages(wordleFreqStats(words, sortOrder)[2]);
        } else {
            setWordPercentages([]);
        }
    }, [words]);

    const changeSortOrder = (primaryIndex) => {
        let i;
        for (i=0; i < sortOrder.length; i++) {
            if (sortOrder[i].index === primaryIndex) {
                break;
            }
        }
        const [item] = sortOrder.splice(i, 1);
        sortOrder.unshift(item);
        const newWordPercentages = wordPercentages.slice();
        ArrayUtils.sortArrayOfArrays(newWordPercentages, sortOrder);
        setWordPercentages(newWordPercentages);
    }
    
    if (wordPercentages.length > 0) {
        return (
            <div className="stats" id="statsTable">
            <table className="statTable">
                <thead>
                <tr>
                    <th>
                        <button onClick={() => {changeSortOrder(1)}} >
                            words<br/>({wordCount})
                        </button>
                    </th>
                    <th>
                        <button onClick={() => {changeSortOrder(0)}} >
                            letter<br/>scores
                        </button>
                    </th>
                    <th>
                        <button onClick={() => {changeSortOrder(2)}} >
                            place<br/>scores
                        </button>
                    </th>
                </tr>
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
                <p/>
                You can use "0" to "3" to switch between four boards with the same words but 
                different target words, for use with a variation like Quordle.
            </div>
        )
    }
}

export default WordStats;
