import React, { useState, useMemo, useContext, useRef }  from "react";
import { getWordleDisplayStats, wordleDisplayStatsType, wordleDisplayStatsKeys, WordInfoType } from '../utilities/WordleUtils';
import { AppContext } from "../App";
import * as ArrayUtils from "../utilities/ArrayUtils";
import { WORDLE_CORRECT, WORDLE_WRONG_POSITION } from "../utilities/WordleUtils";
import { lettersPerWord } from "../data/BoardData";

export type StatsState = "help" | "calculating" | "completed" | "empty" | "normal";
export type StatsInfoType = WordInfoType & {wordStatsState: StatsState};

type StatsSortOrder = {index: wordleDisplayStatsKeys, decending: boolean};
type StatsOrderInfo = {primaryIndex: wordleDisplayStatsKeys, targetWord:string};
const initialSortOrder: StatsSortOrder[] = [
    {index: "avgGroupSize", decending: true}, 
    {index: "maxGroupSize", decending: true}, 
    {index: "letterFrequency", decending: false}, 
    {index: "word", decending: true}, 
    {index: "clues", decending: true}, 
    {index: "cluesGroupCount", decending: true},
    {index: "boardGroup", decending: true},
];

export const WordStats = ({statsInfo}:{statsInfo: StatsInfoType}) => {
    const { addWordToBoard } = useContext(AppContext);
    const [ statsOrderInfo, setStatsOrderInfo] = useState<StatsOrderInfo>({primaryIndex: "avgGroupSize", targetWord: ""});
    const targetWordRef = useRef("");
    const wordsRef = useRef(null);
    const sortOrder = useRef(initialSortOrder);
    const combinedBoardModeRef = useRef(statsInfo.combinedBoardMode);

    const hasPartitions = () => {
        return statsOrderInfo.targetWord !== "";
    }

    const wordleDisplayStats:wordleDisplayStatsType[] = useMemo<wordleDisplayStatsType[]>(() => {
            let resetSortOrder = (targetWordRef.current === statsOrderInfo.targetWord);
            if (wordsRef.current !== statsInfo.words[statsInfo.wordSetIndex] ||
                combinedBoardModeRef.current !== statsInfo.combinedBoardMode) {
                statsOrderInfo.targetWord = ""; 
                resetSortOrder = true;
            }
            combinedBoardModeRef.current = statsInfo.combinedBoardMode;
            targetWordRef.current = statsOrderInfo.targetWord;
            wordsRef.current = statsInfo.words[statsInfo.wordSetIndex];
            const newSortOrder = resetSortOrder ?
                sortOrder.current.slice() : initialSortOrder.slice();
            sortOrder.current = ArrayUtils.updatePrimaryIndex(newSortOrder, statsOrderInfo.primaryIndex) as StatsSortOrder[];
            const result = getWordleDisplayStats(statsInfo, sortOrder.current, statsOrderInfo.targetWord);
            return result;
        },
        [statsInfo, statsOrderInfo]
    )

    const onTapListWord = (word:string) => {
        if (wordleDisplayStats.length === 1 && wordleDisplayStats[0].word === word) {
            addWordToBoard(word, true);
        } else {
            setStatsOrderInfo({primaryIndex:"avgGroupSize", targetWord: word});
        }
    }

    const getRowClassName = (wordStats:wordleDisplayStatsType):string => {
        let boardType = (wordStats.boardGroup < 0) ? "" : wordStats.boardGroup.toString();
        const result = (wordStats.cluesGroupDivider > 0 ? "altGroup" : "group") + boardType + "Bg";
        return result;
    }

    switch (statsInfo.wordStatsState) {
        case "normal":
            if (hasPartitions()) {
                return (
                    <div id="statsTable">
                    <table className="statTable">
                        <thead>
                        <tr>
                            <th key="clues">
                                <div className="cluesColumn">
                                    <button onClick={() => {addWordToBoard(statsOrderInfo.targetWord, false)}} >
                                        {statsOrderInfo.targetWord.toUpperCase()}
                                    </button>
                                </div>
                            </th>
                            <th key="word">
                                <button onClick={() => {setStatsOrderInfo({primaryIndex:"word", targetWord: ""})}} >
                                   words<br/>({statsInfo.wordCount})
                                </button>
                            </th>
                            <th key="avgGroupSize">
                                <button onClick={() => {setStatsOrderInfo({primaryIndex:"avgGroupSize", targetWord: ""})}} >
                                    average<br/>group<br/>size
                                </button>
                            </th>
                            <th key="maxGroupSize">
                                <button onClick={() => {setStatsOrderInfo({primaryIndex:"maxGroupSize", targetWord: ""})}} >
                                    max<br/>group<br/>size
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
                                <tr className={getRowClassName(wordInfo)} key={wordInfo["word"]} >
                                    <td 
                                        key="clues"
                                        className={`cluesContainer`}
                                    >
                                        {(Math.abs(wordInfo["cluesGroupDivider"]) > 1) && 
                                            ArrayUtils.numberToArray(wordInfo["clues"], 2, lettersPerWord).map((clue, i) => (
                                                <div 
                                                    key = {`key_${clue}_${i}`}
                                                    className={`clueBox clueBox--${clue===WORDLE_CORRECT ? 'correct' : clue===WORDLE_WRONG_POSITION ? 'wrongIndex' : 'wrong'}`} 
                                                />
                                            ))
                                        }
                                    </td>
                                    <td key="word">
                                        <button onClick={() => {onTapListWord(wordInfo["word"])}} >
                                            {wordInfo["word"].toUpperCase()}
                                        </button>
                                    </td>
                                    <td key="avgGroupSize">{wordInfo["avgGroupSize"].toFixed(3)}</td>
                                    <td key="maxGroupSize">{wordInfo["maxGroupSize"]}</td>
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
                    <div id="statsTable">
                    <table className="statTable">
                        <thead>
                        <tr>
                            <th key="word">
                                <button onClick={() => {setStatsOrderInfo({primaryIndex:"word", targetWord: ""})}} >
                                    words<br/>({statsInfo.wordCount})
                                </button>
                            </th>
                            <th key="avgGroupSize">
                                <button onClick={() => {setStatsOrderInfo({primaryIndex:"avgGroupSize", targetWord: ""})}} >
                                    average<br/>group<br/>size
                                </button>
                            </th>
                            <th key="maxGroupSize">
                                <button onClick={() => {setStatsOrderInfo({primaryIndex:"maxGroupSize", targetWord: ""})}} >
                                    max<br/>group<br/>size
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
                                        <button onClick={() => {onTapListWord(wordInfo["word"])}} >
                                            {wordInfo["word"].toUpperCase()}
                                        </button>
                                    </td>
                                    <td key="avgGroupSize">{wordInfo["avgGroupSize"].toFixed(3)}</td>
                                    <td key="maxGroupSize">{wordInfo["maxGroupSize"]}</td>
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
                <div className='help'>
                  calculating wordle groups...
                </div>
            )
        case "empty":
            return (
                <div className="help">
                    The list resulting from the entries has zero words.
                    There likely is a contradiction that needs to be corrected.
                </div>
            )
        case "completed":
            return (
                <div className="help">
                    This board has been completed.
                </div>
            )
        case "help":
            return (
                <div className="help">
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
