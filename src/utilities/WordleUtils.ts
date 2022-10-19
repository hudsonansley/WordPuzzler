import * as ArrayUtils from './ArrayUtils';
import * as WordleDict from '../data/dictionaries/Wordle';

// import { urlToBuffer } from "../utilities/FileUtils"

let gVerbose = false;

export interface StringMap {[key: string]: string; }
export interface StringToBooleanMap {[key: string]: boolean; }
export interface numberToBooleanMap {[key: number]: boolean; }
export interface StringToNumberMap {[key: string]: number; }
export interface NumberToNumberMap {[key: number]: number; }
export interface StringToArrayMap {[key: string]: string[]; }
export interface StringToStringToArrayMap {[key: string]: StringToArrayMap; }
export interface StringToStringToNumberMap {[key: string]: StringToNumberMap; }
export interface partitionWordStat {
	numberOfGroups : number,
	largestGroup : number,
}
export type partionStats = [number, partitionWordStat];

export const setVerbose = (verbose:boolean):void => {
	gVerbose = verbose;
}

const makeLookupNumMap = (words:Uint16Array):numberToBooleanMap => {
	const results: numberToBooleanMap = {};
	words.forEach( word => {
		results[word] = true;
	});
	return results;
}

export const makeIndexLookupMap = (words:string[]):StringToNumberMap => {
	const results: StringToNumberMap = {};
	words.forEach( (word, index) => {
		results[word] = index;
	});
	return results;
}

export const makeIndexUint16LookupMap = (items:Uint16Array):NumberToNumberMap => {
	const results: StringToNumberMap = {};
	items.forEach( (item, index) => {
		results[item] = index;
	});
	return results;
}
/**
 * @param  {string[]} words
 * @returns string
 * Filters the words in given array to those that have no duplicate letters
 */
export const unique = (words: string[]):string[] => {
	const results:string[] = [];
	words.forEach( word => {
		const letters = word.split('');
		const uniq = [...new Set(letters)];
		if (letters.length === uniq.length) {
			results.push(word);
		}
	})
	return results;
}
/**
 * @param  {string[]} words
 * @param  {string} regex
 * @returns string[]
 * Filters for words that match the given regex string
 */
export const matches = (words: string[], regex:string):string[] => {
	const results:string[] = [];
	const re = new RegExp(regex);
	words.forEach( word => {
		if (word.match(re)) {
			results.push(word);
		}
	})
	return results;
}

export type WordFilterFunc = (words: string[], ...args : string[]) => string[];
/**
 * @param  {string[]} words list to be filtered
 * @param  {WordFilterFunc[]} funcs list of filtering functions
 * @param  {string[][]} paramLists list of parameter lists to pass to the functions
 * @returns {string[]} filters the given word list through the given list of functions, one after the other
 */
export const runFilterList = (words:string[], funcs:WordFilterFunc[], paramLists:string[][]):string[] => {
	let results = words.slice();
	let n = funcs.length;
	if (n !== paramLists.length) {
		console.error("list of funcs and paramLists have differnt lengths");
		return results;
	}
	for (let i =0; i<n; i++) {
		results = funcs[i](results, ...paramLists[i]);
		if (gVerbose) {
			console.log(`${funcs[i].name} ${paramLists[i].join(' ')} returned ${results.length}`);
		}
		if (!results || results.length === 0) {
			return [];
		}
	}
	return results;
}

/**
 * @param  {Uint16Array} words
 * @param  {ArrayUtils.SortOrderArrayType[]} sortOrder
 * @returns the combined letter frequency for each word
 */
export const wordleFreqStats = (words: Uint16Array, sortOrder:ArrayUtils.SortOrderArrayType[] = [{index: 0, decending: false}, {index: 2, decending: true}, {index: 1, decending: false}]):NumberToNumberMap => {
	let letters = new Uint8Array(WORD_LEN);
	const letterFreq:NumberToNumberMap = {};
	let letterCount = 0;
	words.forEach( wordIndex => {
		const word = wordleAllNums[wordIndex];
		setArrayFromWordInt(letters, word);
		letters.forEach( (letter, i) => {
			ArrayUtils.numKeyCountIncrement(letterFreq, letter);
			letterCount++;
		})
	})
	const percentageByLetter:NumberToNumberMap = {};
	for (const letter in letterFreq) {
		let freq = letterFreq[letter] / letterCount;
		percentageByLetter[letter] = freq;
	}
	// now get the percentages per word
	const wordPercentages:NumberToNumberMap = {};
	words.forEach( (wordIndex) => {
		let wordPercent = 0;
		const word = wordleAllNums[wordIndex];
		setArrayFromWordInt(letters, word);
		letters.forEach( letter => {
			wordPercent += percentageByLetter[letter] ?? 0;
		})
		wordPercentages[wordIndex] = wordPercent;
	})
	return wordPercentages;
}
/**
 * @param  {string[]} words
 * @param  {string} letter_count a string consisting of a letter and a count delimited by "_"
 * @returns {string[]} words filtered for words that have at least count of letter, e.g.:
 *  letter_count === "e_3" will return only those words with 3 or more "e"s
 */
export const withAtLeastLetterCount = (words:string[], letter_count:string):string[] => {
	const compFunc = (a:number, b:number) => a >= b;
	return withLetterCount(words, letter_count, compFunc);
}
/**
 * @param  {string[]} words
 * @param  {string} letter_count a string consisting of a letter and a count delimited by "_"
 * @returns {string[]} words filtered for words that have at most count of letter, e.g.:
 *  letter_count === "e_3" will return only those words with 3 or fewer "e"s
 */
export const withAtMostLetterCount = (words:string[], letter_count:string):string[] => {
	const compFunc = (a:number, b:number) => a <= b;
	return withLetterCount(words, letter_count, compFunc);
}
/**
 * @param  {string[]} words
 * @param  {string} letter_count a string consisting of a letter and a count delimited by "_"
 * @returns {string[]} words filtered for words that have at most count of letter, e.g.:
 *  letter_count === "e_3" will return only those words with exactly 3 "e"s
 */
export const withExactLetterCount = (words:string[], letter_count:string):string[] => {
	const compFunc = (a:number, b:number) => a === b;
	return withLetterCount(words, letter_count, compFunc);
}
/**
 * @param  {string[]} words
 * @param  {string} letter_count
 * @param  {(a:number,b:number)=>boolean} compFunc
 * @returns {string[]} words filterd based on letter count and the comparison function passed in
 * 	
 */
export const withLetterCount = (words:string[], letter_count:string, compFunc:(a:number, b:number) => boolean):string[] => {
		const let_count = letter_count.split("_");
	if (let_count.length !== 2) {
		console.error("second param of withLetterCount should be of the form <letter>_<count>");
		return [];
	}
	const letter = let_count[0];
	const count = parseInt(let_count[1]);
	const result = words.filter( word => {
		const letters = word.split("");
		let letterCount = 0;
		let index;
		do {
			index = letters.indexOf(letter);
			if (index >= 0) {
				letterCount++;
				letters.splice(index, 1);
			}
		} while (index >= 0)
		return compFunc(letterCount, count);
	});
	return result;
}
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
export const wordle = (words:string[], clues:string):string[] => {
	if (clues === "") {
		return words;
	}
	const notLetters:string[][] = [];
	const somewhereLetters:string[] = [];
	const notSomewhereLetters:string[] = [];
	const correctLetters:string[] = [];
	const atLeastLetters:StringToNumberMap = {};
	const atMostLetters:StringToNumberMap = {};
	const rows = clues.toLowerCase().split("_");
	let n = 0;
	let wordLen = 0;
	let error = false;
	for (const clue of rows) {
		const atLeastLettersForClue:StringToNumberMap = {};
		const letters = clue.split("");
		if (n > 0 && n !== letters.length) {
			console.error(`clue length incorrect: '${clue}'`);
			error = true;
			break;
		} else {
			n = letters.length;
			wordLen = n / 2;
		}
		for (let i=0; i < n; i += 2) {
			const letIndex = i/2;
			const letter = letters[i];
			const mod = letters[i+1];
			if (mod === "=") {
				correctLetters[letIndex] = letter;
				ArrayUtils.removeFromArray(notLetters[letIndex], letter);
				ArrayUtils.keyCountIncrement(atLeastLettersForClue, letter);
			} else if (mod === "-") {
				if (somewhereLetters.indexOf(letter) === -1 || correctLetters.indexOf(letter) >= 0) {
					for (let j=0; j < wordLen; j++) {
						if (correctLetters[j] !== letter) {
							ArrayUtils.addNoRepeatsArrays(notLetters, letter, j);
						}
					}
				} else {
					ArrayUtils.addNoRepeatsArrays(notLetters, letter, letIndex);
				}
				ArrayUtils.addNoRepeats(notSomewhereLetters, letter);
			} else if (mod === "?" || mod === "/") {
				ArrayUtils.addNoRepeatsArrays(notLetters, letter, letIndex);
				ArrayUtils.addNoRepeats(somewhereLetters, letter);
				ArrayUtils.keyCountIncrement(atLeastLettersForClue, letter);
			} else {
				console.error(`place indicator not recognize: ${mod}`);
				error = true;
				break;
			}
		}
		if (error) {break};
		for (const letter in atLeastLettersForClue) {
			const clueCount = atLeastLettersForClue[letter];
			const count = atLeastLetters[letter] ?? 0;
			if (clueCount >= count) {
				atLeastLetters[letter] = clueCount;
				if (notSomewhereLetters.indexOf(letter) >= 0) {
					atMostLetters[letter] = clueCount;
				}
			}
		}
	}
	if (error) { return []};
	const wFuncs: WordFilterFunc[] = [];
	const wParamLists: string[][] = [];
	let regex = "^";
	for (let i=0; i < wordLen; i++) {
		const correctLet = correctLetters[i];
		if (typeof correctLet === "string" && correctLet.length > 0) {
			regex += correctLet;
		} else {
			const letters = notLetters[i];
			regex += "[";
			for (let j=0; j< letters.length; j++) {
				regex += "^" + letters[j];
			}
			regex += "]";
		}
	}
	regex += "$";
	wFuncs.push(matches);
	wParamLists.push([regex]);
	somewhereLetters.forEach( letter => {
		if (letter) {
			wFuncs.push(matches);
			wParamLists.push([letter]);
		}
	})
	Object.entries(atLeastLetters).forEach( (letterCount) => {
		if (letterCount[1] > 1) {
			wFuncs.push(withAtLeastLetterCount);
			wParamLists.push([letterCount.join("_")]);
		}
	})
	Object.entries(atMostLetters).forEach( (letterCount) => {
		if (letterCount[1] > 0) {
			wFuncs.push(withAtMostLetterCount);
			wParamLists.push([letterCount.join("_")]);
		}
	})
	return runFilterList(words, wFuncs, wParamLists);
}

const setArrayFromWordInt = (ary:Uint8Array, word:number):void => {
  let i = WORD_LEN;
  while (i--) {
    ary[i] = word & 0x1F;
    word = word >>> 5;
  }
}

const clueNumToString = ["e", "p", "n"];
/**
 * @param  {string} word
 * @param  {string} pick
 * @returns {string} a string representing the letter scores that would
 *  be returned by Wordle for the given word if the given pick was the
 *  correct answer. "e" if in the correct place, "p" if somewhere but wrond place
 *  and "n" if letter not in the answer
 */
 export const getWordleClues = (word:string, pick:string):string => {
	getWordleCluesFast(WordleDict.wordToNum(word), WordleDict.wordToNum(pick));
	return clues.reduce((acc, clueNum) => acc + clueNumToString[clueNum], "");
 }

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
export function getWordleCluesFast(word:number, pick:number):number {
	let i = WORD_LEN;
	while (i--) {
		wordLets[i] = word & 0x1F;
		pickLets[i] = pick & 0x1F;
	  	word = word >>> 5;
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

	// return (clues[4] << 8) | (clues[3] << 6) | (clues[2] << 4) | (clues[1] << 2) | clues[0];
}

let cluesLookUpTableBuffer:ArrayBuffer;
let groupSizesByCluesBuffer:ArrayBuffer;
let wordFlags:Uint8Array;
let wordIndicesBuffer:ArrayBuffer; // scratch array for converting strings to word indicies
const wordToIndexLUTable:StringToNumberMap = {};
export let cluesLookUpTable:Uint16Array[];
export let groupSizesByClues:Uint16Array[];
export let groupCounts:Uint16Array;
export let groupMaxSizes:Uint16Array;

export const getIndexFromWord = (word:string):number => {
	return wordToIndexLUTable[word] ?? -1; 
}

export let wordCount = 0;
export let picksCount = 0;
export let wordleAllNums:Uint32Array;
export let wordlePicksNums:Uint32Array;
export let wordlePicks:string[];
export let wordleAll:string[];

let wordsPerInitChunk:number;
let wordsProcessed:number;
export const wordleIndexPartitionsInitialized = ():boolean => {
	return wordCount > 0 && wordsProcessed === wordCount;
}

// for tests
export const initWordleIndexPartitions = (type:WordleDict.wordSet = "quordle"):void => {
	let prog = 0;
	while (prog < 1) {
		prog = initWordleIndexPartitionsProg(type);
	}
}

export const initDataLists = (type:WordleDict.wordSet = "quordle"):void => {
	wordleAllNums = WordleDict.wordleAllNums[type];
	wordlePicksNums =  WordleDict.wordlePicksNums[type]; 
	picksCount = wordlePicksNums.length;
	wordCount = wordleAllNums.length;
	wordlePicks = WordleDict.getWordlePicks(type);
	wordleAll = WordleDict.getWordleAll(type);
	wordsProcessed = 0;
	wordsPerInitChunk = Math.ceil(wordCount / 10);

	wordIndicesBuffer = new ArrayBuffer(wordCount * 2);
	wordFlags = new Uint8Array(picksCount);
	cluesLookUpTableBuffer = new ArrayBuffer(wordCount * picksCount * 2);
	groupSizesByCluesBuffer = new ArrayBuffer(wordCount * CLUES_COUNTS_LEN * 2);
	cluesLookUpTable = new Array(wordCount);
	groupSizesByClues = new Array(wordCount);
	for (let i = 0; i < wordCount; i++) {
		wordToIndexLUTable[WordleDict.numToWord(wordleAllNums[i])] = i;
		cluesLookUpTable[i] = new Uint16Array(cluesLookUpTableBuffer, i * picksCount * 2, picksCount);
		groupSizesByClues[i] = new Uint16Array(groupSizesByCluesBuffer, i * CLUES_COUNTS_LEN * 2, CLUES_COUNTS_LEN);
	}
	groupCounts = new Uint16Array(wordCount);
	groupMaxSizes = new Uint16Array(wordCount);
}

export let currentWordSetType:WordleDict.wordSet;
export const initWordleIndexPartitionsProg = (type:WordleDict.wordSet = "quordle"):number => {
	if (currentWordSetType !== type) {
		wordCount = 0;
		wordsProcessed = 0;
		currentWordSetType = type;
	}
	if (!wordleIndexPartitionsInitialized()) {
		if (wordCount === 0) {
			initDataLists(type);
		}
		const n = Math.min(wordCount, wordsProcessed + wordsPerInitChunk);
		let i:number;
		for (i = wordsProcessed; i < n; i++) {
			let maxGroupSize = 0;
			let groupCount = 0;
			for (let pickIndex = 0; pickIndex < picksCount; pickIndex++) {
				const clues = getWordleCluesFast(wordleAllNums[i], wordlePicksNums[pickIndex]);
				cluesLookUpTable[i][pickIndex] = clues;
				groupSizesByClues[i][clues]++;
				if (groupSizesByClues[i][clues] === 1) {
					groupCount++;
				}
			}
			for (let pickIndex = 0; pickIndex < picksCount; pickIndex++) {
				const clues = cluesLookUpTable[i][pickIndex];
				const groupSize = groupSizesByClues[i][clues];
				if (maxGroupSize < groupSize) {
					maxGroupSize = groupSize;
				}
			}
			groupCounts[i] = groupCount;
			groupMaxSizes[i] = maxGroupSize;
		}
		wordsProcessed = i;
		return wordsProcessed / wordCount;
	} else {
		return 1;
	}
}

export const filterWordleIndexPartitions = (words:Uint16Array):void => {
	const wordsCount = groupCounts.length;
	const picksCount = cluesLookUpTable[0].length;
	wordFlags.fill(0);
	for (let i = 0; i < words.length; i++) {
		wordFlags[words[i]] = 1;
	}
	let groupCount:number;
	let clues:number;
	for (let i = 0; i < wordsCount; i++) {
		groupCount = groupCounts[i];
		for (let pickIndex = 0; pickIndex < picksCount; pickIndex++) {
			clues = cluesLookUpTable[i][pickIndex];
			const wordFlag = wordFlags[pickIndex] > 0;
			const prevWordFlag = (clues & (1 << 15)) === 0;
			const wordAdded = wordFlag && !prevWordFlag;
			const wordRemoved = !wordFlag && prevWordFlag;
			clues &= ~(1 << 15); //clear the flag
			if (wordAdded || wordRemoved) {
				let groupSize = groupSizesByClues[i][clues];
				if (wordRemoved) {
					groupSize--;
					if (groupSize === 0) {
						groupCount--;
					}
				} else {
					groupSize++;
					if (groupSize === 1) {
						groupCount++;
					}
				}
				groupSizesByClues[i][clues] = groupSize;
			}
			cluesLookUpTable[i][pickIndex] = wordFlag ? clues: clues | (1 << 15) ;
		}
		let maxGroupSize = 0;
		for (let pickIndex = 0; pickIndex < picksCount; pickIndex++) {
			clues = cluesLookUpTable[i][pickIndex] & ~(1 << 15);
			const groupSize = groupSizesByClues[i][clues];
			if (maxGroupSize < groupSize) {
				maxGroupSize = groupSize;
			}
		}
		groupCounts[i] = groupCount;
		groupMaxSizes[i] = maxGroupSize;
	}
}

const getStatsFromIndexPartitionFast = (includeDecoys:boolean):partionStats[] => {
	const n = includeDecoys ? wordCount : picksCount;
	const result:partionStats[] = Array(n);
	for(let i = 0; i < n; i++) {
		result[i] = [i, {
			numberOfGroups : groupCounts[i],
			largestGroup : groupMaxSizes[i],
		}];
	}
	result.sort((a:partionStats, b:partionStats) => {
		const numberOfGroupsCmp = b[1].numberOfGroups - a[1].numberOfGroups;
		return numberOfGroupsCmp === 0 ? a[1].largestGroup - b[1].largestGroup : numberOfGroupsCmp
	})
	return result;
}

const getWordIndicies = (words:string[]):Uint16Array => {
	const n = words.length;
	const result = new Uint16Array(wordIndicesBuffer, 0, n);
	for (let i = 0; i < n; i++) {
		result[i] = wordToIndexLUTable[words[i]];
	}
	return result;
}

const getDisplayStatsRaw = (wordIndices:Uint16Array, boardGroup:number | Uint8Array, collectNonAnswers:boolean):[wordleDisplayStatsType[], wordleDisplayStatsType[], wordleDisplayStatsType[]] => {
	filterWordleIndexPartitions(wordIndices);
	const partStats = getStatsFromIndexPartitionFast(collectNonAnswers);
	const freqStats:NumberToNumberMap = wordleFreqStats(wordIndices);
	const result:wordleDisplayStatsType[] = [];
	const nonAnswerPicks:wordleDisplayStatsType[] = [];
	const nonAnswerNotPicks:wordleDisplayStatsType[] = [];
	const wordsLU = makeIndexUint16LookupMap(wordIndices);
	const boardGroupIsNumber = typeof boardGroup === "number";
	let i = 0;
	let wordsLeft = wordIndices.length;
	while (i < partStats.length && wordsLeft > 0) {
		const partStat = partStats[i];
		const wordIndex = partStat[0];
		const freqStat:number = freqStats[wordIndex] ?? 0;
		const wordIndicesIndex = wordsLU[wordIndex];
		const item:wordleDisplayStatsType = {
			word:"",
			wordIndex, 
			clues:0, 
			avgGroupSize:0,
			numberOfGroups:partStat[1].numberOfGroups, 
			maxGroupSize:partStat[1].largestGroup, 
			letterFrequency:freqStat,
			cluesGroupCount:0, 
			cluesGroupDivider:0,
			boardGroup: boardGroupIsNumber ? boardGroup : boardGroup[wordIndicesIndex],
		};
		if (typeof wordIndicesIndex === "number") {
			result.push(item);
			wordsLeft--;
		} else if (collectNonAnswers) {
			if (wordIndex < picksCount) {
				nonAnswerPicks.push(item);
			} else {
				nonAnswerNotPicks.push(item);
			}
		}
		i++;
	}
	return [result, nonAnswerPicks, nonAnswerNotPicks];
}
 
export type WordInfoType = {
    words: string[][],
    wordSetIndex: number,
    combinedBoardMode: boolean,
	wordCount: number,
};
export type wordleDisplayStatsType = {
	word:string, 
	wordIndex:number,
	clues:number, 
	avgGroupSize:number,
	numberOfGroups:number, 
	maxGroupSize:number, 
	letterFrequency:number, 
	cluesGroupCount:number, 
	cluesGroupDivider:number, 
	boardGroup:number
};
export type wordleDisplayStatsKeys = keyof wordleDisplayStatsType;
/**
 * @param  {WordInfoType[]} wordInfo
 * @param  {ArrayUtils.SortOrderObjType[]} sortOrder
 * @param  {string} targetWord
 * @param  {number} maxNonPickWords
 * @returns {wordleDisplayStatsType[]} the stats massaged into a format 
 *  useful for display in the word data table
 */
export const getWordleDisplayStats = (wordInfo:WordInfoType, sortOrder:ArrayUtils.SortOrderObjType[], targetWord: string = "", maxNonAnswerWords:number = 50):wordleDisplayStatsType[] => {
	if (wordInfo.wordCount === 0) {
		return [];
	}
	if (!wordleIndexPartitionsInitialized()) {
		console.error("getWordleDisplayStats called before partitions resolved");
		return [];
	}
	let result:wordleDisplayStatsType[] = [];
	let nonAnswerPicks:wordleDisplayStatsType[] = [];
	let nonAnswerNotPicks:wordleDisplayStatsType[] = [];

	const targetWordIndex = wordToIndexLUTable[targetWord] ?? -1;
	const boardWordIndicies:Uint16Array[] = [];
	if (wordInfo.combinedBoardMode) {
		const boardIndicies = new Uint8Array(wordInfo.wordCount);
		const totalWordIndicies = new Uint16Array(wordInfo.wordCount);
		let offset = 0;
		for (let i = 0; i < wordInfo.words.length; i++) {
			const wordIndices = getWordIndicies(wordInfo.words[i]);
			totalWordIndicies.set(wordIndices, offset);
			boardWordIndicies[i] = totalWordIndicies.subarray(offset, offset + wordIndices.length);
			boardIndicies.fill(i, offset, offset + wordIndices.length);
			offset += wordIndices.length;
		}
		[result, nonAnswerPicks, nonAnswerNotPicks] = getDisplayStatsRaw(totalWordIndicies, boardIndicies, targetWordIndex < 0);
	} else {
		const wordIndices = getWordIndicies(wordInfo.words[wordInfo.wordSetIndex]);
		[result, nonAnswerPicks, nonAnswerNotPicks] = getDisplayStatsRaw(wordIndices, wordInfo.wordSetIndex, true);
	}
	if (targetWordIndex < 0) {
		const dummyBadChoice:wordleDisplayStatsType = {word:"dummyBadWord", wordIndex:-1, clues:0, avgGroupSize:10000, numberOfGroups:1, maxGroupSize:10000, letterFrequency:0, cluesGroupCount:0, cluesGroupDivider:0, boardGroup: -1};
		nonAnswerPicks.push(dummyBadChoice);
		nonAnswerNotPicks.push(dummyBadChoice);
		// only add non-answer words if best possible average group size > 1
		if (result[0] && result[0]["maxGroupSize"] - 1 > 0.000001) {
			let n = Math.min(Math.floor(1.5 * wordInfo.wordCount), maxNonAnswerWords);
			while (n > 0 && (nonAnswerPicks.length + nonAnswerNotPicks.length > 2)) {
				n--;
				if (nonAnswerPicks[0]["maxGroupSize"] <= nonAnswerNotPicks[0]["maxGroupSize"]) {
					result.push(nonAnswerPicks.shift());
				} else {
					result.push(nonAnswerNotPicks.shift());
				}
			}
		}
	} else {
		const n = result.length;
		for (let i = 0; i < n; i++) {
			const item = result[i];
			item.clues = cluesLookUpTable[targetWordIndex][item.wordIndex] & ~(1 << 15);
		}	
		sortOrder = ArrayUtils.updatePrimaryIndex(sortOrder, "boardGroup") as ArrayUtils.SortOrderObjType[];
		sortOrder = ArrayUtils.updatePrimaryIndex(sortOrder, "clues") as ArrayUtils.SortOrderObjType[];
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
		sortOrder = ArrayUtils.updatePrimaryIndex(sortOrder, "clues") as ArrayUtils.SortOrderObjType[];
		sortOrder = ArrayUtils.updatePrimaryIndex(sortOrder, "cluesGroupCount") as ArrayUtils.SortOrderObjType[];
	}
	const resultCount = result.length;
	if (wordInfo.combinedBoardMode) {
		const boardGroupInfo:{groupCount:number, maxGroupSize:number}[] = Array(resultCount);
		for (let i = 0; i < resultCount; i++) {
			boardGroupInfo[i] = {groupCount:0, maxGroupSize: 0};
		}
		boardWordIndicies.forEach( wordIndices => {
			filterWordleIndexPartitions(wordIndices);
			for (let i = 0; i < resultCount; i++) {
				const wordIndex = result[i].wordIndex;
				if (boardGroupInfo[i].maxGroupSize < groupMaxSizes[wordIndex]) {
					boardGroupInfo[i].maxGroupSize = groupMaxSizes[wordIndex];
				}
				boardGroupInfo[i].groupCount += groupCounts[wordIndex];
			}
		})
		for (let i = 0; i < resultCount; i++) {
			const item = result[i];
			const {maxGroupSize, groupCount} = boardGroupInfo[i];
			if (maxGroupSize > 0) {
				item.maxGroupSize = maxGroupSize;
			}
			item.numberOfGroups = groupCount;
		}
	}
	for (let i = 0; i < resultCount; i++) {
		const item = result[i];
		item.word = WordleDict.numToWord(wordleAllNums[item.wordIndex]);
		item.avgGroupSize = wordInfo.wordCount / item.numberOfGroups;
	}
	console.log(`getWordleDisplayStats: ${resultCount}`);
	ArrayUtils.sortArrayOfStringToAnyMaps(result, sortOrder);
	return result;
}


