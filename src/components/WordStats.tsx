import React, { useState, useEffect }  from "react";
import { getWordleDisplayStats, filterWordlePicks, wordleDisplayStatsType } from '../utilities/WordUtils';
import * as ArrayUtils from "../utilities/ArrayUtils";

export type StatsState = "help" | "calculating" | "empty" | "normal";
type StatsType = "partitions" | "normal";

const initialSortOrder: ArrayUtils.sortOrderType[] = [{index: 2, decending: true}, {index: 3, decending: true}, {index: 4, decending: false}, {index: 0, decending: true}, {index: 1, decending: true}, {index: 5, decending: true}];
let sortOrder:ArrayUtils.sortOrderType[] = initialSortOrder.slice(); 
let wordCount = 0;
let statsType:StatsType = "normal";
let lastTargetWord = "";

export const WordStats = ({words, wordStatsState}) => {
    const [ wordleDisplayStats, setWordleDisplayStats ] = useState<wordleDisplayStatsType[]>([]);
    const [ primaryIndex, setPimaryIndex ] = useState(2);
    const [ targetWord, setTargetWord ] = useState("");
    // const [ sortOrder, setSortOrder ] = useState<ArrayUtils.sortOrderType[]>(initialSortOrder)

    useEffect (() => {
        const updateStats = () => {
            const newWordleDisplayStats = getWordleDisplayStats(words, sortOrder, targetWord);
            if (targetWord === "") {
                statsType = "normal";
                changeSortOrder(primaryIndex, targetWord);
                ArrayUtils.sortArrayOfArrays(newWordleDisplayStats, sortOrder);
            } else {
                statsType = "partitions";
                changeSortOrder(1, targetWord);
                ArrayUtils.sortArrayOfArrays(newWordleDisplayStats, sortOrder);
                let lastWordClues = "eeeee"; //always sorted to top
                let sameCluesCount = 0;
                const lastIndex = newWordleDisplayStats.length - 1;
                for (let i = 0; i <= lastIndex; i++) {
                    const item = newWordleDisplayStats[i];
                    if (item[1] !== lastWordClues) {
                        let j = sameCluesCount;
                        while (j > 0) {
                            newWordleDisplayStats[i - j][5] = sameCluesCount;
                            j--;
                        }
                        sameCluesCount = 1;
                    } else {
                        sameCluesCount++;
                    }
                    lastWordClues = item[1];
                }
                let j = sameCluesCount;
                while (j > 0) {
                    newWordleDisplayStats[lastIndex + 1 - j][5] = sameCluesCount;
                    j--;
                }
                changeSortOrder(5, targetWord);
                ArrayUtils.sortArrayOfArrays(newWordleDisplayStats, sortOrder);
            }
            setWordleDisplayStats(newWordleDisplayStats);
        }
    
            if (!words || words.length === 0 || wordStatsState !== "normal") { 
            setWordleDisplayStats([]);
        }
        wordCount = words ? filterWordlePicks(words).length : 0;
        updateStats();
    }, [words, wordStatsState, primaryIndex, targetWord]);

    const changeSortOrder = (primaryIndex, targetWord) => {
        let newSortOrder;
        if (lastTargetWord !== "" && targetWord === "") {
            newSortOrder = initialSortOrder.slice();
        } else {
            newSortOrder = sortOrder.slice();
        }
        lastTargetWord = targetWord;
        let i;
        for (i=0; i < newSortOrder.length; i++) {
            if (newSortOrder[i].index === primaryIndex) {
                break;
            }
        }
        const [item] = newSortOrder.splice(i, 1);
        newSortOrder.unshift(item);
        sortOrder = newSortOrder;
    }

    switch (wordStatsState) {
        case "normal":
            if (statsType === "partitions") {
                return (
                    <div className="stats" id="statsTable">
                    <table className="statTable">
                        <thead>
                        <tr>
                            <th>
                                {targetWord}
                            </th>
                            <th>
                                <button onClick={() => {setPimaryIndex(0);setTargetWord("")}} >
                                    words<br/>({wordCount})
                                </button>
                            </th>
                            <th>
                                <button onClick={() => {setPimaryIndex(2);setTargetWord("")}} >
                                    average<br/>group size
                                </button>
                            </th>
                            <th>
                                <button onClick={() => {setPimaryIndex(3);setTargetWord("")}} >
                                    max<br/>group size
                                </button>
                            </th>
                            <th>
                                <button onClick={() => {setPimaryIndex(4);setTargetWord("")}} >
                                    letter<br/>scores
                                </button>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {wordleDisplayStats.map( (wordInfo, i, stats) => {
                            if (i > 0) {
                                if (wordInfo[1] === stats[i-1][1]) {
                                    wordInfo[6] = stats[i-1][6];
                                } else {
                                    wordInfo[6] = 1 - stats[i-1][6];
                                }
                            }
                            return (
                                <tr className={wordInfo[4] > 0 ? "possible" : "impossible"} key={wordInfo[0]} >
                                    <td 
                                        key="clues"
                                        className={wordInfo[6] > 0 ? "altGroupBg" : "groupBg"}
                                    >
                                        {`${wordInfo[1]}${wordInfo[5]}`}
                                    </td>
                                    <td key="word">
                                        <button onClick={() => {setTargetWord(wordInfo[0])}} >
                                            {wordInfo[0]}
                                        </button>
                                    </td>
                                    <td key="avgGrpSize">{wordInfo[2].toFixed(3)}</td>
                                    <td key="maxGrpSize">{wordInfo[3].toFixed(3)}</td>
                                    <td key="placementScore">{Math.round(1000 * wordInfo[4])}</td>
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
                    <div className="stats" id="statsTable">
                    <table className="statTable">
                        <thead>
                        <tr>
                            <th>
                                <button onClick={() => {setPimaryIndex(0);setTargetWord("")}} >
                                    words<br/>({wordCount})
                                </button>
                            </th>
                            <th>
                                <button onClick={() => {setPimaryIndex(2);setTargetWord("")}} >
                                    average<br/>group size
                                </button>
                            </th>
                            <th>
                                <button onClick={() => {setPimaryIndex(3);setTargetWord("")}} >
                                    max<br/>group size
                                </button>
                            </th>
                            <th>
                                <button onClick={() => {setPimaryIndex(4);setTargetWord("")}} >
                                    letter<br/>scores
                                </button>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {wordleDisplayStats.map( wordInfo => {
                            return (
                                <tr className={wordInfo[4] > 0 ? "possible" : "impossible"} key={wordInfo[0]} >
                                    <td key="word">
                                        <button onClick={() => {setTargetWord(wordInfo[0])}} >
                                            {wordInfo[0]}
                                        </button>
                                    </td>
                                    <td key="avgGrpSize">{wordInfo[2].toFixed(3)}</td>
                                    <td key="maxGrpSize">{wordInfo[3].toFixed(3)}</td>
                                    <td key="placementScore">{Math.round(1000 * wordInfo[4])}</td>
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
