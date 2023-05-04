import React, { useState, useMemo, useEffect, useRef }  from "react";
import { getWordleDisplayStats, wordleDisplayStatsType, wordleDisplayStatsKeys, WordSetInfoType, getIndexFromWord, WORDLE_CORRECT, WORDLE_WRONG_POSITION } from '../utilities/WordleUtils';
import * as ArrayUtils from "../utilities/ArrayUtils";
import { lettersPerWord } from "../data/BoardData";
import { getBoardColorClass } from "../utilities/Styles";
import { publish, subscribe, unsubscribe } from "../utilities/Events";

type StatsSortOrder = {index: wordleDisplayStatsKeys, decending: boolean};
type StatsOrderInfo = {
    primaryIndex: wordleDisplayStatsKeys, 
    targetWord:string,
    userWordChoices: number[],
};
const initialSortOrder: StatsSortOrder[] = [
    {index: "avgGroupSize", decending: true}, 
    {index: "maxGroupSize", decending: true}, 
    {index: "word", decending: true}, 
    {index: "clues", decending: true}, 
    {index: "cluesGroupCount", decending: true},
    {index: "boardGroup", decending: true},
];

export const WordStats = ({statsInfo}:{statsInfo: WordSetInfoType}) => {
    const [ statsOrderInfo, setStatsOrderInfo] = useState<StatsOrderInfo>({primaryIndex: "avgGroupSize", targetWord: "", userWordChoices: []});
    const targetWordRef = useRef("");
    const wordSetsRef = useRef(null);
    const sortOrder = useRef(initialSortOrder);
    const combinedBoardIndexStringsRef = useRef(statsInfo.combinedBoardIndexStrings);

    useEffect(() => {
        const handleAddTargetWordToBoard = (_:CustomEvent) => {
            let word = statsOrderInfo.targetWord;
            let final = (wordleDisplayStats.length === 1);
            if (word.length === 0) {
                word = wordleDisplayStats[0].word;
            }
            if (word.length > 0) {
                publish("addWordToBoard", {word, final});
            }
        }
        const handleSetTargetWord = (event:CustomEvent) => {
            const word = event.detail?.word ?? "";
            const wordIndex = getIndexFromWord(word);
            if (wordIndex >= 0) {
                const userWordChoices = statsOrderInfo.userWordChoices.slice();
                let targetWord = statsOrderInfo.targetWord;
                let update = false;
                if (userWordChoices.indexOf(wordIndex) < 0) {
                    userWordChoices.push(wordIndex);
                    update = true;
                }
                if (targetWord !== "") {
                    targetWord = word;
                    update = true;
                }
                if (update) {
                    setStatsOrderInfo({...statsOrderInfo, targetWord, userWordChoices});
                }
            }
        }
    
        subscribe("setTargetWord", handleSetTargetWord);
        subscribe("addTargetWordToBoard", handleAddTargetWordToBoard);
        return () => {
          unsubscribe("setTargetWord", handleSetTargetWord);
          unsubscribe("addTargetWordToBoard", handleAddTargetWordToBoard);
        }
    });

    const hasPartitions = () => {
        return statsOrderInfo.targetWord !== "";
    }

    const addWordToBoard = (word:string, final:boolean = false) => {
        publish("addWordToBoard", {word, final});
    }

    const wordleDisplayStats:wordleDisplayStatsType[] = useMemo<wordleDisplayStatsType[]>(() => {
            let resetSortOrder = (targetWordRef.current === statsOrderInfo.targetWord);
            if (wordSetsRef.current !== statsInfo.wordSets[statsInfo.wordSetIndex] ||
                combinedBoardIndexStringsRef.current !== statsInfo.combinedBoardIndexStrings) {
                statsOrderInfo.targetWord = ""; 
                resetSortOrder = true;
            }
            combinedBoardIndexStringsRef.current = statsInfo.combinedBoardIndexStrings;
            targetWordRef.current = statsOrderInfo.targetWord;
            wordSetsRef.current = statsInfo.wordSets[statsInfo.wordSetIndex];
            const newSortOrder = resetSortOrder ?
                sortOrder.current.slice() : initialSortOrder.slice();
            sortOrder.current = ArrayUtils.updatePrimaryIndex(newSortOrder, statsOrderInfo.primaryIndex) as StatsSortOrder[];
            const result = getWordleDisplayStats(statsInfo, sortOrder.current, statsOrderInfo.targetWord, statsOrderInfo.userWordChoices);
            return result;
        },
        [statsInfo, statsOrderInfo]
    )

    const onTapListWord = (word:string) => {
        if (wordleDisplayStats.length === 1 && wordleDisplayStats[0].word === word) {
            addWordToBoard(word, true);
        } else {
            setStatsOrderInfo({...statsOrderInfo, primaryIndex:"avgGroupSize", targetWord: word});
        }
    }

    const getRowClassName = (wordStats:wordleDisplayStatsType):string => {
        let boardNum = parseInt(wordStats.boardGroup.split(",")[0]) - 1;
        if (isNaN(boardNum)) {boardNum = statsInfo.wordSets.length}
        return getBoardColorClass(boardNum, wordStats.cluesGroupDivider > 0, "group", "alt");
    }

    const getBoardNumberDisplay = (wordStats:wordleDisplayStatsType):string => {
        return wordStats.boardGroup;
    }

    const getAvgGrpSizeDisplay = (n:number):string => {
        return isFinite(n) ? n.toFixed(3) : "-";
    }

    const getMaxGrpSizeDisplay = (n:number):string => {
        return isFinite(n) ? n.toString() : "-";
    }

    if (hasPartitions()) {
        return (
            <div id="stats-table">
            <table className="stat-table">
                <thead>
                <tr>
                    <th key="clues">
                        <div className="clues-column">
                            <button onClick={() => {addWordToBoard(statsOrderInfo.targetWord, false)}} >
                                {statsOrderInfo.targetWord.toUpperCase()}
                            </button>
                        </div>
                    </th>
                    <th key="word">
                        <button onClick={() => {setStatsOrderInfo({...statsOrderInfo, primaryIndex:"word", targetWord: ""})}} >
                            words<br/>({statsInfo.wordCount})
                        </button>
                    </th>
                    <th key="avgGroupSize">
                        <button onClick={() => {setStatsOrderInfo({...statsOrderInfo, primaryIndex:"avgGroupSize", targetWord: ""})}} >
                            average<br/>group<br/>size
                        </button>
                    </th>
                    <th key="maxGroupSize">
                        <button onClick={() => {setStatsOrderInfo({...statsOrderInfo, primaryIndex:"maxGroupSize", targetWord: ""})}} >
                            max<br/>group<br/>size
                        </button>
                    </th>
                    {statsInfo.combinedBoardIndexStrings && (
                    <th key="boardGroup">
                        <button onClick={() => {setStatsOrderInfo({...statsOrderInfo, primaryIndex:"boardGroup", targetWord: ""})}} >
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
                                className={"clues-container"}
                            >
                                {(Math.abs(wordInfo.cluesGroupDivider) > 1) && 
                                    ArrayUtils.numberToArray(wordInfo.clues, 2, lettersPerWord).map((clue, i) => (
                                        <div 
                                            key = {`key_${clue}_${i}`}
                                            className={`clue-box clue-box--${clue===WORDLE_CORRECT ? 'correct' : clue===WORDLE_WRONG_POSITION ? 'wrongIndex' : 'wrong'}`} 
                                        />
                                    ))
                                }
                            </td>
                            <td key="word">
                                <button onClick={() => {onTapListWord(wordInfo.word)}} >
                                    {wordInfo.word.toUpperCase()}
                                </button>
                            </td>
                            <td key="avgGroupSize">{getAvgGrpSizeDisplay(wordInfo.avgGroupSize)}</td>
                            <td key="maxGroupSize">{getMaxGrpSizeDisplay(wordInfo.maxGroupSize)}</td>
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
            <div id="stats-table">
            <table className="stat-table">
                <thead>
                <tr>
                    <th key="word">
                        <button onClick={() => {setStatsOrderInfo({...statsOrderInfo, primaryIndex:"word", targetWord: ""})}} >
                            words<br/>({statsInfo.wordCount})
                        </button>
                    </th>
                    <th key="avgGroupSize">
                        <button onClick={() => {setStatsOrderInfo({...statsOrderInfo, primaryIndex:"avgGroupSize", targetWord: ""})}} >
                            average<br/>group<br/>size
                        </button>
                    </th>
                    <th key="maxGroupSize">
                        <button onClick={() => {setStatsOrderInfo({...statsOrderInfo, primaryIndex:"maxGroupSize", targetWord: ""})}} >
                            max<br/>group<br/>size
                        </button>
                    </th>
                    {statsInfo.combinedBoardIndexStrings && (
                    <th key="boardGroup">
                        <button onClick={() => {setStatsOrderInfo({...statsOrderInfo, primaryIndex:"boardGroup", targetWord: ""})}} >
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
                            <td key="avgGroupSize">{getAvgGrpSizeDisplay(wordInfo.avgGroupSize)}</td>
                            <td key="maxGroupSize">{getMaxGrpSizeDisplay(wordInfo.maxGroupSize)}</td>
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
