import React, { useState, useMemo, useContext, useRef }  from "react";
import { getWordleDisplayStats, wordleDisplayStatsType, wordleDisplayStatsKeys, WordSetInfoType } from '../utilities/WordleUtils';
import { AppContext } from "../App";
import * as ArrayUtils from "../utilities/ArrayUtils";
import { WORDLE_CORRECT, WORDLE_WRONG_POSITION } from "../utilities/WordleUtils";
import { lettersPerWord } from "../data/BoardData";

type StatsSortOrder = {index: wordleDisplayStatsKeys, decending: boolean};
type StatsOrderInfo = {primaryIndex: wordleDisplayStatsKeys, targetWord:string};
const initialSortOrder: StatsSortOrder[] = [
    {index: "avgGroupSize", decending: true}, 
    {index: "maxGroupSize", decending: true}, 
    {index: "word", decending: true}, 
    {index: "clues", decending: true}, 
    {index: "cluesGroupCount", decending: true},
    {index: "boardGroup", decending: true},
];

export const WordStats = ({statsInfo}:{statsInfo: WordSetInfoType}) => {
    const { addWordToBoard, getBoardColorClass } = useContext(AppContext);
    const [ statsOrderInfo, setStatsOrderInfo] = useState<StatsOrderInfo>({primaryIndex: "avgGroupSize", targetWord: ""});
    const targetWordRef = useRef("");
    const wordsRef = useRef(null);
    const sortOrder = useRef(initialSortOrder);
    const combinedBoardIndexStringsRef = useRef(statsInfo.combinedBoardIndexStrings);

    const hasPartitions = () => {
        return statsOrderInfo.targetWord !== "";
    }

    const wordleDisplayStats:wordleDisplayStatsType[] = useMemo<wordleDisplayStatsType[]>(() => {
            let resetSortOrder = (targetWordRef.current === statsOrderInfo.targetWord);
            if (wordsRef.current !== statsInfo.words[statsInfo.wordSetIndex] ||
                combinedBoardIndexStringsRef.current !== statsInfo.combinedBoardIndexStrings) {
                statsOrderInfo.targetWord = ""; 
                resetSortOrder = true;
            }
            combinedBoardIndexStringsRef.current = statsInfo.combinedBoardIndexStrings;
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
        let boardNum = parseInt(wordStats.boardGroup.split(",")[0]) - 1;
        if (isNaN(boardNum)) {boardNum = statsInfo.words.length}
        return getBoardColorClass(boardNum, wordStats.cluesGroupDivider > 0, "group", "alt");
    }

    const getBoardNumberDisplay = (wordStats:wordleDisplayStatsType):string => {
        return wordStats.boardGroup;
    }

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
                    {statsInfo.combinedBoardIndexStrings && (
                    <th key="boardGroup">
                        <button onClick={() => {setStatsOrderInfo({primaryIndex:"boardGroup", targetWord: ""})}} >
                            grp<br/>num
                        </button>
                    </th>
                    )}
                </tr>
                </thead>
                <tbody>
                {wordleDisplayStats.map( (wordInfo, i, stats) => {
                    if (i > 0) {
                        if (wordInfo.clues === stats[i-1].clues && wordInfo.boardGroup === stats[i-1].boardGroup) {
                            wordInfo.cluesGroupDivider = Math.sign(stats[i-1].cluesGroupDivider);
                        } else {
                            wordInfo.cluesGroupDivider = - 2 * Math.sign(stats[i-1].cluesGroupDivider);
                        }
                    } else {
                        wordInfo.cluesGroupDivider = 2;
                    }
                    return (
                        <tr className={getRowClassName(wordInfo)} key={wordInfo.word} >
                            <td 
                                key="clues"
                                className={`cluesContainer`}
                            >
                                {(Math.abs(wordInfo.cluesGroupDivider) > 1) && 
                                    ArrayUtils.numberToArray(wordInfo.clues, 2, lettersPerWord).map((clue, i) => (
                                        <div 
                                            key = {`key_${clue}_${i}`}
                                            className={`clueBox clueBox--${clue===WORDLE_CORRECT ? 'correct' : clue===WORDLE_WRONG_POSITION ? 'wrongIndex' : 'wrong'}`} 
                                        />
                                    ))
                                }
                            </td>
                            <td key="word">
                                <button onClick={() => {onTapListWord(wordInfo.word)}} >
                                    {wordInfo.word.toUpperCase()}
                                </button>
                            </td>
                            <td key="avgGroupSize">{wordInfo.avgGroupSize.toFixed(3)}</td>
                            <td key="maxGroupSize">{wordInfo.maxGroupSize}</td>
                            {statsInfo.combinedBoardIndexStrings && (
                            <td key="boardGroup">{getBoardNumberDisplay(wordInfo)}</td>
                            )}
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
                    {statsInfo.combinedBoardIndexStrings && (
                    <th key="boardGroup">
                        <button onClick={() => {setStatsOrderInfo({primaryIndex:"boardGroup", targetWord: ""})}} >
                            grp<br/>num
                        </button>
                    </th>
                    )}
                </tr>
                </thead>
                <tbody>
                {wordleDisplayStats.map( wordInfo => {
                    return (
                        <tr className={getRowClassName(wordInfo)} key={wordInfo.word} >
                            <td key="word">
                                <button onClick={() => {onTapListWord(wordInfo.word)}} >
                                    {wordInfo.word.toUpperCase()}
                                </button>
                            </td>
                            <td key="avgGroupSize">{wordInfo.avgGroupSize.toFixed(3)}</td>
                            <td key="maxGroupSize">{wordInfo.maxGroupSize}</td>
                            {statsInfo.combinedBoardIndexStrings && (
                            <td key="boardGroup">{getBoardNumberDisplay(wordInfo)}</td>
                            )}
                        </tr>
                        )
                    })
                }
                </tbody>
            </table>
            </div>
        )
    }
}

export default WordStats;
