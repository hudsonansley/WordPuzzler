import React, { useState, useEffect }  from "react";
import { getWordleDisplayStats } from '../utilities/WordUtils';
import * as ArrayUtils from "../utilities/ArrayUtils";

const sortOrder: ArrayUtils.sortOrderType[] = [{index: 1, decending: true}, {index: 2, decending: true}, {index: 3, decending: false}, {index: 0, decending: true}];

const WordStats = ({words}) => {
    const [ wordleDisplayStats, setWordleDisplayStats ] = useState([]);
    const wordCount = words?.length;

    useEffect (() => {
        if (words) { 
            setWordleDisplayStats(getWordleDisplayStats(words, sortOrder));
        } else {
            setWordleDisplayStats([]);
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
        const newWordleDisplayStats = wordleDisplayStats.slice();
        ArrayUtils.sortArrayOfArrays(newWordleDisplayStats, sortOrder);
        setWordleDisplayStats(newWordleDisplayStats);
    }
    
    if (words) {
        if (wordleDisplayStats.length > 0) {
            return (
                    <div className="stats" id="statsTable">
                    <table className="statTable">
                        <thead>
                        <tr>
                            <th>
                                <button onClick={() => {changeSortOrder(0)}} >
                                    words<br/>({wordCount})
                                </button>
                            </th>
                            <th>
                                <button onClick={() => {changeSortOrder(1)}} >
                                    average<br/>group size
                                </button>
                            </th>
                            <th>
                                <button onClick={() => {changeSortOrder(2)}} >
                                    max<br/>group size
                                </button>
                            </th>
                            <th>
                                <button onClick={() => {changeSortOrder(3)}} >
                                    letter<br/>scores
                                </button>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {wordleDisplayStats.map( wordInfo => {
                            return (
                                <tr className={wordInfo[3] > 0 ? "possible" : "impossible"} key={wordInfo[0]} >
                                    <td key="word">{wordInfo[0]}</td>
                                    <td key="avgGrpSize">{wordInfo[1].toFixed(3)}</td>
                                    <td key="maxGrpSize">{wordInfo[2].toFixed(3)}</td>
                                    <td key="placementScore">{Math.round(1000 * wordInfo[3])}</td>
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
                        The list resulting from the entries has zero words.
                        There likely is a contradiction that needs to be corrected.
                    </div>
                )
            }
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
