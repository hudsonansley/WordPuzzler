import * as ArrayUtils from "./ArrayUtils";
import * as WordleDict from "../data/dictionaries/Wordle";
import { publish } from "./Events";
import { lettersPerWord } from "../data/BoardData";

// import { urlToBuffer } from "../utilities/FileUtils"

let gVerbose = false;

export interface StringMap {
  [key: string]: string;
}
export interface StringToBooleanMap {
  [key: string]: boolean;
}
export interface NumberToBooleanMap {
  [key: number]: boolean;
}
export interface StringToNumberMap {
  [key: string]: number;
}
export interface NumberToNumberMap {
  [key: number]: number;
}
export interface StringToArrayMap {
  [key: string]: string[];
}
export interface StringToStringToArrayMap {
  [key: string]: StringToArrayMap;
}
export interface StringToStringToNumberMap {
  [key: string]: StringToNumberMap;
}
export interface PartitionWordStat {
  numberOfGroups: number;
  largestGroup: number;
}
export type partionStats = [number, PartitionWordStat];

export const setVerbose = (verbose: boolean): void => {
  gVerbose = verbose;
};

export const makeIndexLookupMap = (words: string[]): StringToNumberMap => {
  const results: StringToNumberMap = {};
  words.forEach((word, index) => {
    results[word] = index;
  });
  return results;
};

/**
 * @param  {string[]} words
 * @returns string
 * Filters the words in given array to those that have no duplicate letters
 */
export const unique = (words: string[]): string[] => {
  const results: string[] = [];
  words.forEach((word) => {
    const letters = word.split("");
    const uniq = [...new Set(letters)];
    if (letters.length === uniq.length) {
      results.push(word);
    }
  });
  return results;
};
/**
 * @param  {string[]} words
 * @param  {string} regex
 * @returns string[]
 * Filters for words that match the given regex string
 */
export const matches = (words: string[], regex: string): string[] => {
  const results: string[] = [];
  const re = new RegExp(regex);
  words.forEach((word) => {
    if (re.exec(word)) {
      results.push(word);
    }
  });
  return results;
};

export type WordFilterFunc = (words: string[], ...args: string[]) => string[];
/**
 * @param  {string[]} words list to be filtered
 * @param  {WordFilterFunc[]} funcs list of filtering functions
 * @param  {string[][]} paramLists list of parameter lists to pass to the functions
 * @returns {string[]} filters the given word list through the given list of functions, one after the other
 */
export const runFilterList = (
  words: string[],
  funcs: WordFilterFunc[],
  paramLists: string[][]
): string[] => {
  let results = words.slice();
  let n = funcs.length;
  if (n !== paramLists.length) {
    console.error("list of funcs and paramLists have differnt lengths");
    return results;
  }
  for (let i = 0; i < n; i++) {
    results = funcs[i](results, ...paramLists[i]);
    if (gVerbose) {
      console.log(
        `${funcs[i].name} ${paramLists[i].join(" ")} returned ${results.length}`
      );
    }
    if (!results || results.length === 0) {
      return [];
    }
  }
  return results;
};

/**
 * @param  {Uint16Array} words
 * @param  {ArrayUtils.SortOrderArrayType[]} sortOrder
 * @returns the combined letter frequency for each word
 */
export const wordleFreqStats = (words: Uint16Array): NumberToNumberMap => {
  let letters = new Uint8Array(WORD_LEN);
  const letterFreq: NumberToNumberMap = {};
  let letterCount = 0;
  words.forEach((wordIndex) => {
    const word = wordleAllNums[wordIndex];
    setArrayFromWordInt(letters, word);
    letters.forEach((letter, i) => {
      ArrayUtils.numKeyCountIncrement(letterFreq, letter);
      letterCount++;
    });
  });
  const percentageByLetter: NumberToNumberMap = {};
  for (const letter in letterFreq) {
    let freq = letterFreq[letter] / letterCount;
    percentageByLetter[letter] = freq;
  }
  // now get the percentages per word
  const wordPercentages: NumberToNumberMap = {};
  words.forEach((wordIndex) => {
    let wordPercent = 0;
    const word = wordleAllNums[wordIndex];
    setArrayFromWordInt(letters, word);
    letters.forEach((letter) => {
      wordPercent += percentageByLetter[letter] ?? 0;
    });
    wordPercentages[wordIndex] = wordPercent;
  });
  return wordPercentages;
};
/**
 * @param  {string[]} words
 * @param  {string} letter_count a string consisting of a letter and a count delimited by "_"
 * @returns {string[]} words filtered for words that have at least count of letter, e.g.:
 *  letter_count === "e_3" will return only those words with 3 or more "e"s
 */
export const withAtLeastLetterCount = (
  words: string[],
  letter_count: string
): string[] => {
  const compFunc = (a: number, b: number) => a >= b;
  return withLetterCount(words, letter_count, compFunc);
};
/**
 * @param  {string[]} words
 * @param  {string} letter_count a string consisting of a letter and a count delimited by "_"
 * @returns {string[]} words filtered for words that have at most count of letter, e.g.:
 *  letter_count === "e_3" will return only those words with 3 or fewer "e"s
 */
export const withAtMostLetterCount = (
  words: string[],
  letter_count: string
): string[] => {
  const compFunc = (a: number, b: number) => a <= b;
  return withLetterCount(words, letter_count, compFunc);
};
/**
 * @param  {string[]} words
 * @param  {string} letter_count a string consisting of a letter and a count delimited by "_"
 * @returns {string[]} words filtered for words that have at most count of letter, e.g.:
 *  letter_count === "e_3" will return only those words with exactly 3 "e"s
 */
export const withExactLetterCount = (
  words: string[],
  letter_count: string
): string[] => {
  const compFunc = (a: number, b: number) => a === b;
  return withLetterCount(words, letter_count, compFunc);
};
/**
 * @param  {string[]} words
 * @param  {string} letter_count
 * @param  {(a:number,b:number)=>boolean} compFunc
 * @returns {string[]} words filterd based on letter count and the comparison function passed in
 *
 */
export const withLetterCount = (
  words: string[],
  letter_count: string,
  compFunc: (a: number, b: number) => boolean
): string[] => {
  const let_count = letter_count.split("_");
  if (let_count.length !== 2) {
    console.error(
      "second param of withLetterCount should be of the form <letter>_<count>"
    );
    return [];
  }
  const letter = let_count[0];
  const count = parseInt(let_count[1]);
  const result = words.filter((word) => {
    const letters = word.split("");
    let letterCount = 0;
    let index;
    do {
      index = letters.indexOf(letter);
      if (index >= 0) {
        letterCount++;
        letters.splice(index, 1);
      }
    } while (index >= 0);
    return compFunc(letterCount, count);
  });
  return result;
};
/**
 * @param  {string} clue
 * @returns {[string[], string[]]} - an array of the letters and array of modifiers, cleaned up. Both empty if
 *  errors are found
 */
const _getLetterAndModArrays = (clue: string): [string[], string[]] => {
  const chars = clue.toLowerCase().split("");
  if (chars.length !== 2 * lettersPerWord) {
    console.error(`wrong clue length ${chars.length}`);
    return [[], []];
  }
  const letters: string[] = new Array(lettersPerWord);
  const mods: string[] = new Array(lettersPerWord);
  let badMod = -1;
  chars.forEach((char, i) => {
    if (i % 2 === 0) {
      letters[i >> 1] = char;
    } else {
      if (char === "?") char = "/";
      mods[i >> 1] = char;
      if (char !== "=" && char !== "/" && char !== "-") {
        badMod = i;
      }
    }
  });
  if (badMod >= 0) {
    console.error(`place indicator not recognize: ${chars[badMod]}`);
    return [[], []];
  } else {
    return [letters, mods];
  }
};

interface LetterInfo {
  notHere: string[][];
  somewhere: string[];
  notSomewhere: string[];
  correct: string[];
  atLeast: StringToNumberMap;
  atMost: StringToNumberMap;
}

const _updateLetterInfo = (
  info: LetterInfo,
  atLeastLettersForClue: StringToNumberMap,
  letter: string,
  mod: string,
  i: number
) => {
  if (mod === "=") {
    info.correct[i] = letter;
    ArrayUtils.removeFromArray(info.notHere[i], letter);
    ArrayUtils.keyCountIncrement(atLeastLettersForClue, letter);
  } else if (mod === "-") {
    if (info.somewhere.includes(letter)) {
      ArrayUtils.addNoRepeatsArrays(info.notHere, letter, i);
    } else {
      for (let j = 0; j < lettersPerWord; j++) {
        if (info.correct[j] !== letter) {
          ArrayUtils.addNoRepeatsArrays(info.notHere, letter, j);
        }
      }
    }
    ArrayUtils.addNoRepeats(info.notSomewhere, letter);
  } else if (mod === "/") {
    ArrayUtils.addNoRepeatsArrays(info.notHere, letter, i);
    ArrayUtils.keyCountIncrement(atLeastLettersForClue, letter);
  }
};

const _getCluesInfo = (clues): LetterInfo | undefined => {
  const info: LetterInfo = {
    notHere: [],
    somewhere: [],
    notSomewhere: [],
    correct: [],
    atLeast: {},
    atMost: {},
  };
  const rows = clues.toLowerCase().split("_");
  for (const clue of rows) {
    const atLeastLettersForClue: StringToNumberMap = {};
    const [letters, mods] = _getLetterAndModArrays(clue);
    if (letters.length === 0) {
      return;
    }
    letters.forEach((letter, i) => {
      const mod = mods[i];
      if (mod === "/") {
        ArrayUtils.addNoRepeats(info.somewhere, letter);
      }
    });
    letters.forEach((letter, letIndex) => {
      const mod = mods[letIndex];
      _updateLetterInfo(info, atLeastLettersForClue, letter, mod, letIndex);
    });
    for (const letter in atLeastLettersForClue) {
      const clueCount = atLeastLettersForClue[letter];
      const count = info.atLeast[letter] ?? 0;
      if (clueCount >= count) {
        info.atLeast[letter] = clueCount;
        if (info.notSomewhere.indexOf(letter) >= 0) {
          info.atMost[letter] = clueCount;
        }
      }
    }
  }
  return info;
};
/**
 * @param  {string[]} words
 * @param  {string} clues
 * @returns {string[]} filters words based on the wordle clues string given
 * clues is a "_" delimited list of letter/wordle state character pairs where
 *  "-" means the letter is wrong (gray)
 *  "/" or "?" means the letter is in the word but not in that location (yellow)
 *  "=" means the letter is correct
 * e.g.: "r-a-i-s/e=_s/l-e/p-t/" means first word raise had s somewhere and e in the right place,
 *  second word slept had s e and t somewhere (but not in the right place)
 */
export const wordle = (words: string[], clues: string): string[] => {
  if (clues === "") {
    return words;
  }
  const letterInfo = _getCluesInfo(clues);
  if (!letterInfo) {
    return [];
  }
  const wFuncs: WordFilterFunc[] = [];
  const wParamLists: string[][] = [];
  let regex = "^";
  for (let i = 0; i < lettersPerWord; i++) {
    const correctLet = letterInfo.correct[i];
    if (typeof correctLet === "string" && correctLet.length > 0) {
      regex += correctLet;
    } else {
      const letters = letterInfo.notHere[i];
      regex += "[";
      for (const letter of letters) {
        regex += "^" + letter;
      }
      regex += "]";
    }
  }
  regex += "$";
  wFuncs.push(matches);
  wParamLists.push([regex]);
  letterInfo.somewhere.forEach((letter) => {
    if (letter) {
      wFuncs.push(matches);
      wParamLists.push([letter]);
    }
  });
  Object.entries(letterInfo.atLeast).forEach((letterCount) => {
    if (letterCount[1] > 1) {
      wFuncs.push(withAtLeastLetterCount);
      wParamLists.push([letterCount.join("_")]);
    }
  });
  Object.entries(letterInfo.atMost).forEach((letterCount) => {
    if (letterCount[1] > 0) {
      wFuncs.push(withAtMostLetterCount);
      wParamLists.push([letterCount.join("_")]);
    }
  });
  return runFilterList(words, wFuncs, wParamLists);
};

const setArrayFromWordInt = (ary: Uint8Array, word: number): void => {
  let i = WORD_LEN;
  while (i--) {
    ary[i] = word & 0x1f;
    word = word >>> 5;
  }
};

const clueNumToString = ["e", "p", "n"];
/**
 * @param  {string} word
 * @param  {string} pick
 * @returns {string} a string representing the letter scores that would
 *  be returned by Wordle for the given word if the given pick was the
 *  correct answer. "e" if in the correct place, "p" if somewhere but wrond place
 *  and "n" if letter not in the answer
 */
export const getWordleClues = (word: string, pick: string): string => {
  setWordLets(WordleDict.wordToNum(word));
  getWordleCluesFast(WordleDict.wordToNum(pick));
  return clues.reduce((acc, clueNum) => acc + clueNumToString[clueNum], "");
};

const setWordLets = (word: number): void => {
  let i = WORD_LEN;
  while (i--) {
    wordLets[i] = word & 0x1f;
    word = word >>> 5;
  }
};

const WORD_LEN = 5;
const wordLets = new Uint8Array(WORD_LEN);
const pickLets = new Uint8Array(WORD_LEN);
const clues = new Uint8Array(WORD_LEN);
export const WORDLE_ALL_CORRECT = 0;
export const WORDLE_CORRECT = 0b00;
export const WORDLE_WRONG_POSITION = 0b01;
export const WORDLE_WRONG = 0b10;
const MAX_CLUES_VALUE = 0b1010101010;
const CLUES_COUNTS_LEN = MAX_CLUES_VALUE + 1;
let cluesShift = 0;
/**
 * @param  {number} pick
 * @returns number the clue value for wordlets and pick.
 *  *** ASSUMES *** wordlets has been set (for efficiency)
 */
function getWordleCluesFast(pick: number): number {
  let i = WORD_LEN;
  while (i--) {
    pickLets[i] = pick & 0x1f;
    pick = pick >>> 5;
    clues[i] = WORDLE_WRONG;
  }
  for (i = 0; i < WORD_LEN; i++) {
    if (wordLets[i] === pickLets[i]) {
      clues[i] = WORDLE_CORRECT;
      pickLets[i] = 0; // so we don't refind this letter for WORDLE_WRONG_POSITION_
    }
  }
  for (i = 0; i < WORD_LEN; i++) {
    if (clues[i] !== WORDLE_CORRECT) {
      const pickLetIndex = pickLets.indexOf(wordLets[i]);
      if (pickLetIndex >= 0) {
        clues[i] = WORDLE_WRONG_POSITION;
        pickLets[pickLetIndex] = 0;
      }
    }
  }
  let result = 0;
  i = WORD_LEN;
  while (i--) {
    result |= clues[i] << (i << 1);
  }
  return result;
}

let cluesLookUpTableBuffer: ArrayBuffer;
let groupSizesByCluesBuffer: ArrayBuffer;
let wordFlags: Uint8Array[];
let wordFlagIndex = 0;
const wordToIndexLUTable: StringToNumberMap = {};
export let cluesLookUpTable: Uint16Array[];
export let groupSizesByClues: Uint16Array[];
export let groupCounts: Uint16Array;
export let groupMaxSizes: Uint16Array;

export const getIndexFromWord = (word: string): number => {
  return wordToIndexLUTable[word] ?? -1;
};

export let wordCount = 0;
export let picksCount = 0;
export let wordleAllNums: Uint32Array;
export let wordlePicksNums: Uint32Array;
export let wordlePicks: string[];
export let wordleAll: string[];

let wordsPerInitChunk: number;
let wordsProcessed: number;
export const wordleIndexPartitionsInitialized = (): boolean => {
  return wordCount > 0 && wordsProcessed === wordCount;
};

// for tests
export const initWordleIndexPartitions = (
  type: WordleDict.wordSet = "quordle"
): void => {
  let progress = 0;
  while (progress < 1) {
    progress = initWordleIndexPartitionsProg(type);
  }
};

export const initDataLists = (type: WordleDict.wordSet = "quordle"): void => {
  wordleAllNums = WordleDict.wordleAllNums[type];
  wordlePicksNums = WordleDict.wordlePicksNums[type];
  picksCount = wordlePicksNums.length;
  wordCount = wordleAllNums.length;
  wordlePicks = WordleDict.getWordlePicks(type);
  wordleAll = WordleDict.getWordleAll(type);
  wordsProcessed = 0;
  wordsPerInitChunk = Math.ceil(wordCount / 600);

  switch (type) {
    case "quordle":
      cluesShift = 2;
      break;
    case "wordle":
    default:
      cluesShift = 0;
  }
  const clueCountsLen = CLUES_COUNTS_LEN << cluesShift;

  wordFlags = [new Uint8Array(picksCount), new Uint8Array(picksCount)];
  wordFlags[wordFlagIndex].fill(1);
  cluesLookUpTableBuffer = new ArrayBuffer(wordCount * picksCount * 2);
  groupSizesByCluesBuffer = new ArrayBuffer(wordCount * clueCountsLen * 2);
  cluesLookUpTable = new Array(wordCount);
  groupSizesByClues = new Array(wordCount);
  for (let i = 0; i < wordCount; i++) {
    wordToIndexLUTable[WordleDict.numToWord(wordleAllNums[i])] = i;
    cluesLookUpTable[i] = new Uint16Array(
      cluesLookUpTableBuffer,
      i * picksCount * 2,
      picksCount
    );
    groupSizesByClues[i] = new Uint16Array(
      groupSizesByCluesBuffer,
      i * clueCountsLen * 2,
      clueCountsLen
    );
  }
  groupCounts = new Uint16Array(wordCount);
  groupMaxSizes = new Uint16Array(wordCount);
};

export let currentWordSetType: WordleDict.wordSet;
export const initWordleIndexPartitionsProg = (
  type: WordleDict.wordSet = "quordle"
): number => {
  let progress = 0;
  if (currentWordSetType !== type) {
    wordCount = 0;
    wordsProcessed = 0;
    currentWordSetType = type;
  }
  if (!wordleIndexPartitionsInitialized()) {
    if (wordCount === 0) {
      initDataLists(type);
    }
    let cluesLUT: Uint16Array;
    let groupSizeByClues: Uint16Array;
    const n = Math.min(wordCount, wordsProcessed + wordsPerInitChunk);
    let i: number;
    for (i = wordsProcessed; i < n; i++) {
      let maxGroupSize = 0;
      let groupCount = 0;
      cluesLUT = cluesLookUpTable[i];
      groupSizeByClues = groupSizesByClues[i];
      setWordLets(wordleAllNums[i]);
      for (let pickIndex = 0; pickIndex < picksCount; pickIndex++) {
        const clues = getWordleCluesFast(wordlePicksNums[pickIndex]);
        cluesLUT[pickIndex] = clues;
        const groupSize = ++groupSizeByClues[clues << cluesShift];
        if (groupSize === 1) {
          groupCount++;
        }
      }
      for (let pickIndex = 0; pickIndex < picksCount; pickIndex++) {
        const clues = cluesLUT[pickIndex];
        const groupSize = groupSizeByClues[clues << cluesShift];
        if (maxGroupSize < groupSize) {
          maxGroupSize = groupSize;
        }
      }
      groupCounts[i] = groupCount;
      groupMaxSizes[i] = maxGroupSize;
    }
    wordsProcessed = i;
    progress = wordsProcessed / wordCount;
  } else {
    progress = 1;
  }
  publish("initProgressUpdated", { progress });
  return progress;
};

// take an array of arrays of words, using index for groupSizdeByClues
export const filterWordleIndexPartitions = (
  wordIndexLists: Uint16Array[]
): void => {
  const wordsCount = groupCounts.length;
  const picksCount = cluesLookUpTable[0].length;
  const prevWordFlags = wordFlags[wordFlagIndex];
  wordFlagIndex = 1 - wordFlagIndex;
  const curWordFlags = wordFlags[wordFlagIndex];
  curWordFlags.fill(0);
  const numWordIndexLists = wordIndexLists.length;
  for (let i = 0; i < numWordIndexLists; i++) {
    const wordIndices = wordIndexLists[i];
    for (const wordIndex of wordIndices) {
      curWordFlags[wordIndex] = i + 1;
    }
  }
  let groupCount: number;
  let cluesLUT: Uint16Array;
  let groupSizeByClues: Uint16Array;
  let clues: number;
  let curClues: number;
  let prevClues: number;
  let curWordFlag: number;
  let prevWordFlag: number;
  let curGroupSize: number;
  let prevGroupSize: number;
  for (let i = 0; i < wordsCount; i++) {
    groupCount = groupCounts[i];
    cluesLUT = cluesLookUpTable[i];
    groupSizeByClues = groupSizesByClues[i];
    for (let pickIndex = 0; pickIndex < picksCount; pickIndex++) {
      curWordFlag = curWordFlags[pickIndex];
      prevWordFlag = prevWordFlags[pickIndex];
      if (curWordFlag !== prevWordFlag) {
        clues = cluesLUT[pickIndex] << cluesShift;
        if (curWordFlag > 0) {
          curClues = clues | (curWordFlag - 1);
          curGroupSize = ++groupSizeByClues[curClues];
          if (curGroupSize === 1) {
            groupCount++;
          }
        }
        if (prevWordFlag > 0) {
          prevClues = clues | (prevWordFlag - 1);
          prevGroupSize = --groupSizeByClues[prevClues];
          if (prevGroupSize === 0) {
            groupCount--;
          }
        }
      }
    }
    let maxGroupSize = 0;
    for (let pickIndex = 0; pickIndex < picksCount; pickIndex++) {
      clues = cluesLUT[pickIndex] << cluesShift;
      for (let i = 0; i < numWordIndexLists; i++) {
        const groupSize = groupSizeByClues[clues | i];
        if (maxGroupSize < groupSize) {
          maxGroupSize = groupSize;
        }
      }
    }
    groupCounts[i] = groupCount;
    groupMaxSizes[i] = maxGroupSize;
  }
};

const getStatsFromIndexPartitionFast = (
  includeDecoys: boolean
): partionStats[] => {
  const n = includeDecoys ? wordCount : picksCount;
  const result: partionStats[] = Array(n);
  for (let i = 0; i < n; i++) {
    result[i] = [
      i,
      {
        numberOfGroups: groupCounts[i],
        largestGroup: groupMaxSizes[i],
      },
    ];
  }
  result.sort((a: partionStats, b: partionStats) => {
    const numberOfGroupsCmp = b[1].numberOfGroups - a[1].numberOfGroups;
    return numberOfGroupsCmp === 0
      ? a[1].largestGroup - b[1].largestGroup
      : numberOfGroupsCmp;
  });
  return result;
};

const getWordIndices = (words: string[]): Uint16Array => {
  const n = words.length;
  const result = new Uint16Array(n);
  for (let i = 0; i < n; i++) {
    result[i] = wordToIndexLUTable[words[i]];
  }
  return result;
};

// array of arrays of wordIndices, boardgroup is array of strings of same length for board group (can be multiple)
const getDisplayStatsRaw = (
  wordIndexLists: Uint16Array[],
  boardGroups: string[],
  collectNonAnswers: boolean
): [
  wordleDisplayStatsType[],
  wordleDisplayStatsType[],
  wordleDisplayStatsType[]
] => {
  filterWordleIndexPartitions(wordIndexLists);
  const partStats = getStatsFromIndexPartitionFast(collectNonAnswers);
  const result: wordleDisplayStatsType[] = [];
  const nonAnswerPicks: wordleDisplayStatsType[] = [];
  const nonAnswerNotPicks: wordleDisplayStatsType[] = [];
  const wordsLU: NumberToNumberMap = {};
  let wordsIndex = 0;
  const boardGroupLU = [];
  for (let i = 0; i < wordIndexLists.length; i++) {
    const wordIndices = wordIndexLists[i];
    const n = wordIndices.length;
    for (let index = 0; index < n; index++) {
      wordsLU[wordIndices[index]] = wordsIndex;
      boardGroupLU[wordsIndex] = boardGroups[i];
      wordsIndex++;
    }
  }
  let wordsLeft = wordsIndex;
  let i = 0;
  while (i < partStats.length && wordsLeft > 0) {
    const partStat = partStats[i];
    const wordIndex = partStat[0];
    const wordIndicesIndex = wordsLU[wordIndex] ?? -1;
    const item: wordleDisplayStatsType = {
      word: "",
      wordIndex,
      clues: 0,
      avgGroupSize: 0,
      numberOfGroups: partStat[1].numberOfGroups,
      maxGroupSize: partStat[1].largestGroup,
      cluesGroupCount: 0,
      cluesGroupDivider: 0,
      boardGroup: wordIndicesIndex < 0 ? "" : boardGroupLU[wordIndicesIndex],
    };
    if (wordIndicesIndex >= 0) {
      result.push(item);
      wordsLeft--;
    } else if (collectNonAnswers) {
      item.boardGroup = "";
      if (wordIndex < picksCount) {
        nonAnswerPicks.push(item);
      } else {
        nonAnswerNotPicks.push(item);
      }
    }
    i++;
  }
  return [result, nonAnswerPicks, nonAnswerNotPicks];
};

export type WordSetInfoType = {
  wordSets: string[][];
  wordSetIndex: number;
  boardStates: string[];
  combinedBoardIndexStrings: string[] | null;
  wordCount: number;
};
export type wordleDisplayStatsType = {
  word: string;
  wordIndex: number;
  clues: number;
  avgGroupSize: number;
  numberOfGroups: number;
  maxGroupSize: number;
  cluesGroupCount: number;
  cluesGroupDivider: number;
  boardGroup: string;
};
export type wordleDisplayStatsKeys = keyof wordleDisplayStatsType;
/**
 * @param  {WordSetInfoType} wordInfo
 * @param  {ArrayUtils.SortOrderObjType[]} sortOrder
 * @param  {string} targetWord
 * @param  {number} maxNonAnswerWords
 * @returns {wordleDisplayStatsType[]} the stats massaged into a format
 *  useful for display in the word data table
 */
export const getWordleDisplayStats = (
  wordInfo: WordSetInfoType,
  sortOrder: ArrayUtils.SortOrderObjType[],
  targetWord: string = "",
  userWordChoices: number[] = [],
  maxNonAnswerWords: number = 50
): wordleDisplayStatsType[] => {
  if (!wordleIndexPartitionsInitialized()) {
    console.error("getWordleDisplayStats called before partitions resolved");
    return [];
  }
  let result: wordleDisplayStatsType[] = [];
  let nonAnswerPicks: wordleDisplayStatsType[] = [];
  let nonAnswerNotPicks: wordleDisplayStatsType[] = [];

  const targetWordIndex = wordToIndexLUTable[targetWord] ?? -1;
  if (wordInfo.combinedBoardIndexStrings) {
    const wordIndexLists = wordInfo.wordSets.map((words) =>
      getWordIndices(words)
    );
    [result, nonAnswerPicks, nonAnswerNotPicks] = getDisplayStatsRaw(
      wordIndexLists,
      wordInfo.combinedBoardIndexStrings,
      targetWordIndex < 0
    );
  } else {
    const wordIndices = getWordIndices(
      wordInfo.wordSets[wordInfo.wordSetIndex]
    );
    [result, nonAnswerPicks, nonAnswerNotPicks] = getDisplayStatsRaw(
      [wordIndices],
      [(wordInfo.wordSetIndex + 1).toString()],
      true
    );
  }
  if (targetWordIndex < 0) {
    const wordChoices = userWordChoices.slice();
    if (wordChoices.length > 0) {
      const checkWordChoice = (
        index: number,
        itemList: wordleDisplayStatsType[]
      ) => {
        const item = itemList[index];
        const userChoiceIndex = wordChoices.indexOf(item.wordIndex);
        if (userChoiceIndex >= 0) {
          wordChoices.splice(userChoiceIndex, 1);
          result.push(item);
          itemList[index] = null;
        }
      };
      let i = 0;
      let n = nonAnswerPicks.length;
      while (i < n && wordChoices.length > 0) {
        checkWordChoice(i, nonAnswerPicks);
        i++;
      }
      i = 0;
      n = nonAnswerNotPicks.length;
      while (i < n && wordChoices.length > 0) {
        checkWordChoice(i, nonAnswerNotPicks);
        i++;
      }
    }
    const choicesCount = result.length;
    const dummyBadChoice: wordleDisplayStatsType = {
      word: "dummyBadWord",
      wordIndex: -1,
      clues: 0,
      avgGroupSize: 10000,
      numberOfGroups: 1,
      maxGroupSize: 10000,
      cluesGroupCount: 0,
      cluesGroupDivider: 0,
      boardGroup: "",
    };
    nonAnswerPicks.push(dummyBadChoice);
    nonAnswerNotPicks.push(dummyBadChoice);
    // only add non-answer words if better scores than answer words
    const bestAnswerNumberOfGroups = result[0]?.numberOfGroups ?? 100;
    const bestAnswerMaxGroupSize = result[0]?.maxGroupSize ?? 0;
    let n = Math.min(wordInfo.wordCount, maxNonAnswerWords);
    while (
      n > 0 &&
      (nonAnswerPicks.length > 1 || nonAnswerNotPicks.length > 1)
    ) {
      n--;
      while (!nonAnswerPicks[0]) {
        nonAnswerPicks.shift();
      }
      while (!nonAnswerNotPicks[0]) {
        nonAnswerNotPicks.shift();
      }
      const betterNumberOfGroups =
        nonAnswerPicks[0].numberOfGroups > bestAnswerNumberOfGroups ||
        nonAnswerNotPicks[0].numberOfGroups > bestAnswerNumberOfGroups;
      const betterMaxGroupSize =
        nonAnswerPicks[0].maxGroupSize < bestAnswerMaxGroupSize ||
        nonAnswerNotPicks[0].maxGroupSize < bestAnswerMaxGroupSize;
      if (betterNumberOfGroups || betterMaxGroupSize) {
        if (betterNumberOfGroups) {
          if (
            nonAnswerNotPicks[0].numberOfGroups >
            nonAnswerPicks[0].numberOfGroups
          ) {
            result.push(nonAnswerNotPicks.shift());
          } else {
            result.push(nonAnswerPicks.shift());
          }
        } else if (
          nonAnswerNotPicks[0].maxGroupSize < nonAnswerPicks[0].maxGroupSize
        ) {
          result.push(nonAnswerNotPicks.shift());
        } else {
          result.push(nonAnswerPicks.shift());
        }
      } else {
        n = 0; // don't add any more non-answer words
      }
    }
    if (!wordInfo.combinedBoardIndexStrings && choicesCount < 16) {
      const decoys = WordleDict.wordleDecoysNums[currentWordSetType];
      const decoyWords = Array.from(decoys, (wordNum) =>
        WordleDict.numToWord(wordNum)
      );
      const answerNotPickWords = wordle(
        decoyWords,
        wordInfo.boardStates[wordInfo.wordSetIndex]
      );
      if (answerNotPickWords.length > 0) {
        let wordInResult = {};
        result.forEach((item) => {
          wordInResult[item.wordIndex] = 1;
        });
        answerNotPickWords.forEach((word) => {
          const wordIndex = getIndexFromWord(word);
          if (!wordInResult[wordIndex]) {
            const item: wordleDisplayStatsType = {
              word,
              wordIndex,
              clues: 0,
              avgGroupSize: 0,
              numberOfGroups: 0,
              maxGroupSize: Infinity,
              cluesGroupCount: 0,
              cluesGroupDivider: 0,
              boardGroup: "0",
            };
            result.push(item);
          }
        });
      }
    }
  } else {
    const n = result.length;
    for (let i = 0; i < n; i++) {
      const item = result[i];
      item.clues = cluesLookUpTable[targetWordIndex][item.wordIndex];
    }
    sortOrder = ArrayUtils.updatePrimaryIndex(
      sortOrder,
      "boardGroup"
    ) as ArrayUtils.SortOrderObjType[];
    sortOrder = ArrayUtils.updatePrimaryIndex(
      sortOrder,
      "clues"
    ) as ArrayUtils.SortOrderObjType[];
    ArrayUtils.sortArrayOfStringToAnyMaps(result, sortOrder);
    let lastWordClues = "";
    let sameCluesCount = 0;
    for (let i = 0; i < n; i++) {
      const item = result[i];
      const wordClues = `${item.clues}_${item.boardGroup}`;
      if (wordClues !== lastWordClues) {
        let j = sameCluesCount;
        while (j > 0) {
          result[i - j].cluesGroupCount = sameCluesCount;
          j--;
        }
        sameCluesCount = 1;
      } else {
        sameCluesCount++;
      }
      lastWordClues = wordClues;
    }
    let j = sameCluesCount;
    while (j > 0) {
      result[n - j].cluesGroupCount = sameCluesCount;
      j--;
    }
    sortOrder = ArrayUtils.updatePrimaryIndex(
      sortOrder,
      "clues"
    ) as ArrayUtils.SortOrderObjType[];
    sortOrder = ArrayUtils.updatePrimaryIndex(
      sortOrder,
      "cluesGroupCount"
    ) as ArrayUtils.SortOrderObjType[];
    sortOrder = ArrayUtils.updatePrimaryIndex(
      sortOrder,
      "boardGroup"
    ) as ArrayUtils.SortOrderObjType[];
  }
  const resultCount = result.length;
  for (let i = 0; i < resultCount; i++) {
    const item = result[i];
    item.word = WordleDict.numToWord(wordleAllNums[item.wordIndex]);
    item.avgGroupSize = wordInfo.wordCount / item.numberOfGroups;
  }
  ArrayUtils.sortArrayOfStringToAnyMaps(result, sortOrder);
  return result;
};
