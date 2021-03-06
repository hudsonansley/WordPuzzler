import React, { useState, useEffect }  from "react";
import { getWordleDisplayStats, filterWordlePicks, wordleDisplayStatsType } from '../utilities/WordUtils';
import * as ArrayUtils from "../utilities/ArrayUtils";

const sortOrder: ArrayUtils.sortOrderType[] = [{index: 1, decending: true}, {index: 2, decending: true}, {index: 3, decending: false}, {index: 0, decending: true}];
export type StatsState = "help" | "calculating" | "empty" | "normal";
type StatsType = "partitions" | "normal";

export const WordStats = ({words, wordStatsState}) => {
    const [ wordleDisplayStats, setWordleDisplayStats ] = useState<wordleDisplayStatsType[]>([]);
    const [ statsType, setStatsType] = useState<StatsType>("normal");
    const wordCount = words ? filterWordlePicks(words).length : 0;

    useEffect (() => {
        if (words && wordStatsState === "normal") { 
            setWordleDisplayStats(getWordleDisplayStats(words, sortOrder));
        } else {
            setWordleDisplayStats([]);
        }
    }, [words, wordStatsState]);

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
        setStatsType("normal");
    }
    
    switch (wordStatsState) {
        case "normal":
            if (statsType === "partitions") {
                return (<></>)
            } else {
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
            }
        case "calculating":
            return (
                <div className='stats collumn'>
                  calculating initial wordle groups...
                </div>
            )
        case "empty":
            return (
                <div className="stats help">
                    The list resulting from the entries has zero words.
                    There likely is a contradiction that needs to be corrected.
                </div>
            )
        case "help":
            return (
                <div className="stats help">
                    Set the word(s) based on your wordle game and hit enter.
                    <p/>
                    Toggle the letter placement color to match your wordle entries with the space bar for the last letter entered, or by tapping a letter.
                    <p/>
                    A list of the possible words will be shown here, 
                    sorted by their group score
                    (the number of words remaining devided by the number of groups)
                    <p/>
                    Rows in red are not in the list of possible answers, those 
                    in green are.
                    <p/>
                    You can use "1" to "4" to switch between four boards with the same words but 
                    different target words, for use with a variation like Quordle.
                </div>
            )
    }
}

export default WordStats;
