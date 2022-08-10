import React, { useState, useMemo, useContext, useRef }  from "react";
import { getWordleDisplayStats, filterWordlePicks, wordleDisplayStatsType, wordleDisplayStatsKeys } from '../utilities/WordUtils';
import { AppContext } from "../App";
import * as ArrayUtils from "../utilities/ArrayUtils";

export type StatsState = "help" | "calculating" | "empty" | "normal";

type StatsSortOrder = {index: wordleDisplayStatsKeys, decending: boolean};
type StatsOrderInfo = {primaryIndex: wordleDisplayStatsKeys, targetWord:string};
const initialSortOrder: StatsSortOrder[] = [
    {index: "avgGroupSize", decending: true}, 
    {index: "maxGroupSize", decending: true}, 
    {index: "letterFrequency", decending: false}, 
    {index: "word", decending: true}, 
    {index: "clues", decending: true}, 
    {index: "cluesGroupCount", decending: true}];

export const WordStats = ({words, wordStatsState}) => {
    const { addRowToBoard } = useContext(AppContext);
    const [ statsOrderInfo, setStatsOrderInfo] = useState<StatsOrderInfo>({primaryIndex: "avgGroupSize", targetWord: ""});
    const targetWordRef = useRef("");
    const wordsRef = useRef(null);
    const sortOrder = useRef(initialSortOrder);

    const hasPartitions = () => {
        return statsOrderInfo.targetWord !== "";
    }

    const wordleDisplayStats:wordleDisplayStatsType[] = useMemo<wordleDisplayStatsType[]>(() => {
            let resetSortOrder = (targetWordRef.current === statsOrderInfo.targetWord);
            if (wordsRef.current !== words) {
                statsOrderInfo.targetWord = ""; 
                //intentionally not triggering state update
                resetSortOrder = true;
            }
            targetWordRef.current = statsOrderInfo.targetWord;
            wordsRef.current = words;
            const newSortOrder = resetSortOrder ?
                sortOrder.current.slice() : initialSortOrder.slice();
            sortOrder.current = ArrayUtils.updatePrimaryIndex(newSortOrder, statsOrderInfo.primaryIndex) as StatsSortOrder[];
            return getWordleDisplayStats(words, sortOrder.current, statsOrderInfo.targetWord);
        },
        [words, statsOrderInfo]
    )
    const wordCount = useMemo(() => filterWordlePicks(words).length, [words]);

    const addWordToBoard = (word:string) => {
        const letters = word.split("");
        const clue = (words?.length === 1 && words[0] === word) ? "=" : "-";
        let boardRow = "";
        letters.forEach(letter => {
            boardRow += letter + clue;
        })
        addRowToBoard(boardRow);
    }

    switch (wordStatsState) {
        case "normal":
            if (hasPartitions()) {
                return (
                    <div className="stats" id="statsTable">
                    <table className="statTable">
                        <thead>
                        <tr>
                            <th key="clues">
                                <div className="cluesColumn">
                                    <button onClick={() => {addWordToBoard(statsOrderInfo.targetWord);}} >
                                        {statsOrderInfo.targetWord}
                                    </button>
                                </div>
                            </th>
                            <th key="word">
                                <button onClick={() => {setStatsOrderInfo({primaryIndex:"word", targetWord: ""})}} >
                                   words<br/>({wordCount})
                                </button>
                            </th>
                            <th key="avgGroupSize">
                                <button onClick={() => {setStatsOrderInfo({primaryIndex:"avgGroupSize", targetWord: ""})}} >
                                    average<br/>group size
                                </button>
                            </th>
                            <th key="maxGroupSize">
                                <button onClick={() => {setStatsOrderInfo({primaryIndex:"maxGroupSize", targetWord: ""})}} >
                                    max<br/>group size
                                </button>
                            </th>
                            <th key="letterFrequency">
                                <button onClick={() => {setStatsOrderInfo({primaryIndex:"letterFrequency", targetWord: ""})}} >
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
                                <tr className={`${wordInfo["cluesGroupDivider"] > 0 ? "altGroupBg" : "groupBg"}`} key={wordInfo["word"]} >
                                    <td 
                                        key="clues"
                                        className={`cluesContainer`}
                                    >
                                        {(Math.abs(wordInfo["cluesGroupDivider"]) > 1) && 
                                            wordInfo["clues"].split("").map(letter => (
                                                <div className={`clueBox clueBox--${letter==='e' ? 'correct' : letter==='p' ? 'wrongIndex' : 'wrong'}`} />
                                            ))
                                        }
                                    </td>
                                    <td key="word">
                                        <button onClick={() => {setStatsOrderInfo({primaryIndex:"avgGroupSize", targetWord: wordInfo["word"]})}} >
                                            {wordInfo["word"]}
                                        </button>
                                    </td>
                                    <td key="avgGroupSize">{wordInfo["avgGroupSize"].toFixed(3)}</td>
                                    <td key="maxGroupSize">{wordInfo["maxGroupSize"].toFixed(3)}</td>
                                    <td key="letterFrequency">{Math.round(1000 * wordInfo["letterFrequency"])}</td>
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
                            <th key="word">
                                <button onClick={() => {setStatsOrderInfo({primaryIndex:"word", targetWord: ""})}} >
                                    words<br/>({wordCount})
                                </button>
                            </th>
                            <th key="avgGroupSize">
                                <button onClick={() => {setStatsOrderInfo({primaryIndex:"avgGroupSize", targetWord: ""})}} >
                                    average<br/>group size
                                </button>
                            </th>
                            <th key="maxGroupSize">
                                <button onClick={() => {setStatsOrderInfo({primaryIndex:"maxGroupSize", targetWord: ""})}} >
                                    max<br/>group size
                                </button>
                            </th>
                            <th key="letterFrequency">
                                <button onClick={() => {setStatsOrderInfo({primaryIndex:"letterFrequency", targetWord: ""})}} >
                                    letter<br/>scores
                                </button>
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        {wordleDisplayStats.map( wordInfo => {
                            return (
                                <tr className={wordInfo["letterFrequency"] > 0 ? "possibleWordBg" : "impossibleWordBg"} key={wordInfo["word"]} >
                                    <td key="word">
                                        <button onClick={() => {setStatsOrderInfo({primaryIndex:"avgGroupSize", targetWord: wordInfo["word"]})}} >
                                            {wordInfo["word"]}
                                        </button>
                                    </td>
                                    <td key="avgGroupSize">{wordInfo["avgGroupSize"].toFixed(3)}</td>
                                    <td key="maxGroupSize">{wordInfo["maxGroupSize"].toFixed(3)}</td>
                                    <td key="letterFrequency">{Math.round(1000 * wordInfo["letterFrequency"])}</td>
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
                    based on the clues that would be shown if the word in each row 
                    was the answer and the selected word were entered.
                    <p/> 
                    Clicking the selected word group breakdown header enters that word 
                    on the board.
                    <p/>
                    You can use "1" to "4" to switch between four boards with the same words but 
                    different target words, for use with a variation like Quordle.
                    <p/>
                    "0" combines all the boards words together to help with Quordle.
                </div>
            )
    }
}

export default WordStats;
