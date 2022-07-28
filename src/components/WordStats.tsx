import React, { useState, useEffect }  from "react";
import { getWordleDisplayStats, filterWordlePicks, wordleDisplayStatsType, wordleDisplayStatsKeys } from '../utilities/WordUtils';
import * as ArrayUtils from "../utilities/ArrayUtils";

export type StatsState = "help" | "calculating" | "empty" | "normal";
type StatsType = "partitions" | "normal";

type statsSortOrder = {index: wordleDisplayStatsKeys, decending: boolean};
const initialSortOrder: statsSortOrder[] = [
    {index: "avgGroupSize", decending: true}, 
    {index: "maxGroupSize", decending: true}, 
    {index: "letterFrequency", decending: false}, 
    {index: "word", decending: true}, 
    {index: "clues", decending: true}, 
    {index: "cluesGroupCount", decending: true}];
let sortOrder:statsSortOrder[] = initialSortOrder.slice(); 
let wordCount = 0;
let statsType:StatsType = "normal";
let lastTargetWord = "";

export const WordStats = ({words, wordStatsState}) => {
    const [ wordleDisplayStats, setWordleDisplayStats ] = useState<wordleDisplayStatsType[]>([]);
    const [ primaryIndex, setPimaryIndex ] = useState<wordleDisplayStatsKeys>("avgGroupSize");
    const [ targetWord, setTargetWord ] = useState("");
    // const [ sortOrder, setSortOrder ] = useState<ArrayUtils.sortOrderType[]>(initialSortOrder)

    useEffect (() => {
        const updateStats = () => {
            const newWordleDisplayStats:wordleDisplayStatsType[] = getWordleDisplayStats(words, sortOrder, targetWord);
            if (targetWord === "") {
                statsType = "normal";
                changeSortOrder(primaryIndex, targetWord);
                ArrayUtils.sortArrayOfStringToAnyMaps(newWordleDisplayStats, sortOrder);
            } else {
                statsType = "partitions";
                changeSortOrder("clues", targetWord);
                ArrayUtils.sortArrayOfStringToAnyMaps(newWordleDisplayStats, sortOrder);
                let lastWordClues = "eeeee"; //always sorted to top
                let sameCluesCount = 0;
                const lastIndex = newWordleDisplayStats.length - 1;
                for (let i = 0; i <= lastIndex; i++) {
                    const item = newWordleDisplayStats[i];
                    if (item["clues"] !== lastWordClues) {
                        let j = sameCluesCount;
                        while (j > 0) {
                            newWordleDisplayStats[i - j]["cluesGroupCount"] = sameCluesCount;
                            j--;
                        }
                        sameCluesCount = 1;
                    } else {
                        sameCluesCount++;
                    }
                    lastWordClues = item["clues"];
                }
                let j = sameCluesCount;
                while (j > 0) {
                    newWordleDisplayStats[lastIndex + 1 - j]["cluesGroupCount"] = sameCluesCount;
                    j--;
                }
                changeSortOrder("cluesGroupCount", targetWord);
                ArrayUtils.sortArrayOfStringToAnyMaps(newWordleDisplayStats, sortOrder);
            }
            setWordleDisplayStats(newWordleDisplayStats);
        }
    
            if (!words || words.length === 0 || wordStatsState !== "normal") { 
            setWordleDisplayStats([]);
        }
        wordCount = words ? filterWordlePicks(words).length : 0;
        updateStats();
    }, [words, wordStatsState, primaryIndex, targetWord]);

    const changeSortOrder = (primaryIndex:wordleDisplayStatsKeys, targetWord:string) => {
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
                                <button onClick={() => {setPimaryIndex("word");setTargetWord("")}} >
                                    words<br/>({wordCount})
                                </button>
                            </th>
                            <th>
                                <button onClick={() => {setPimaryIndex("avgGroupSize");setTargetWord("")}} >
                                    average<br/>group size
                                </button>
                            </th>
                            <th>
                                <button onClick={() => {setPimaryIndex("maxGroupSize");setTargetWord("")}} >
                                    max<br/>group size
                                </button>
                            </th>
                            <th>
                                <button onClick={() => {setPimaryIndex("letterFrequency");setTargetWord("")}} >
                                    letter<br/>scores
                                </button>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {wordleDisplayStats.map( (wordInfo, i, stats) => {
                            if (i > 0) {
                                if (wordInfo["clues"] === stats[i-1]["clues"]) {
                                    wordInfo["cluesGroupDivider"] = Math.sign(stats[i-1]["cluesGroupDivider"]);
                                } else {
                                    wordInfo["cluesGroupDivider"] = - 2 * Math.sign(stats[i-1]["cluesGroupDivider"]);
                                }
                            } else {
                                wordInfo["cluesGroupDivider"] = 2;
                            }
                            return (
                                <tr className={wordInfo["letterFrequency"] > 0 ? "possible" : "impossible"} key={wordInfo["word"]} >
                                    <td 
                                        key="clues"
                                        className={wordInfo["cluesGroupDivider"] > 0 ? "altGroupBg" : "groupBg"}
                                    >
                                        {(Math.abs(wordInfo["cluesGroupDivider"]) > 1) && wordInfo["clues"]}
                                    </td>
                                    <td key="word">
                                        <button onClick={() => {setTargetWord(wordInfo["word"])}} >
                                            {wordInfo["word"]}
                                        </button>
                                    </td>
                                    <td key="avgGrpSize">{wordInfo["avgGroupSize"].toFixed(3)}</td>
                                    <td key="maxGrpSize">{wordInfo["maxGroupSize"].toFixed(3)}</td>
                                    <td key="placementScore">{Math.round(1000 * wordInfo["letterFrequency"])}</td>
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
                                <button onClick={() => {setPimaryIndex("word");setTargetWord("")}} >
                                    words<br/>({wordCount})
                                </button>
                            </th>
                            <th>
                                <button onClick={() => {setPimaryIndex("avgGroupSize");setTargetWord("")}} >
                                    average<br/>group size
                                </button>
                            </th>
                            <th>
                                <button onClick={() => {setPimaryIndex("maxGroupSize");setTargetWord("")}} >
                                    max<br/>group size
                                </button>
                            </th>
                            <th>
                                <button onClick={() => {setPimaryIndex("letterFrequency");setTargetWord("")}} >
                                    letter<br/>scores
                                </button>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {wordleDisplayStats.map( wordInfo => {
                            return (
                                <tr className={wordInfo["letterFrequency"] > 0 ? "possible" : "impossible"} key={wordInfo["word"]} >
                                    <td key="word">
                                        <button onClick={() => {setTargetWord(wordInfo["word"])}} >
                                            {wordInfo["word"]}
                                        </button>
                                    </td>
                                    <td key="avgGrpSize">{wordInfo["avgGroupSize"].toFixed(3)}</td>
                                    <td key="maxGrpSize">{wordInfo["maxGroupSize"].toFixed(3)}</td>
                                    <td key="placementScore">{Math.round(1000 * wordInfo["letterFrequency"])}</td>
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
                    Set the word(s) based on your wordle game and tap enter.
                    <p/>
                    Toggle the letter placement color to match your wordle entries with the space bar for the last letter entered, or by tapping a letter.
                    <p/>
                    A list of words will be shown here, 
                    sorted by their group score
                    (the number of words remaining devided by the number of groups)
                    <p/>
                    Rows in red are not in the list of possible answers, those 
                    in green are. 
                    You can sort by the column by tapping on that column header.
                    <p/>
                    You can see the group breakdown for a word by tapping on it.
                    A new column headed by the selected word will show the groups 
                    based on the clues that would be shown if the word in that row 
                    was the answer.
                    <p/>
                    You can use "1" to "4" to switch between four boards with the same words but 
                    different target words, for use with a variation like Quordle.
                </div>
            )
    }
}

export default WordStats;
