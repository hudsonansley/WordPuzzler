import * as ArrayUtils from './ArrayUtils';
import * as WordleDict from '../data/dictionaries/Wordle'

let gVerbose = false;
export let wordlePicksPartitions: StringToStringToArrayMap;

export interface StringMap {[key: string]: string; }
export interface StringToNumberMap {[key: string]: number; }
export interface StringToArrayMap {[key: string]: string[]; }
export interface StringToStringToArrayMap {[key: string]: StringToArrayMap; }
export interface StringToStringToNumberMap {[key: string]: StringToNumberMap; }
export interface partitionWordStat {
	numberOfGroups : number,
	averageGroupSize : number,
	largestGroup : number,
}
export type partionStats = [string, partitionWordStat];

export const setVerbose = (verbose:boolean):void => {
	gVerbose = verbose;
}

const makeLookupMap = (words:string[]):{[key: string]: boolean} => {
	const results = {};
	words.forEach( word => {
		results[word] = true;
	})
	return results;
}

/**
 * @param  {string[]} words
 * @returns string[]
 * for each word in words, rotates the letters forward by one, putting the
 *  last letter in the front, then reverses the letters
 * E.g.: abcdef => edcbaf
 */
export const prePals = (words: string[]): string[] => {
	const results = [];
	words.forEach( word => {
		let rev = ArrayUtils.rotate(word.split(''), 1).reverse().join('')
		if (word === rev) {
			results.push(word)
		}
		results.sort((w1, w2) => {return w2.length - w1.length})
	})
	return results
}
/**
 * @param  {string[]} words
 * @returns string[]
 * for each word in words, rotates the letters backward by one, putting the
 *  first letter at the end, then reverses the letters
 * E.g.: abcdef => afedcb
 */
export const postPals = (words: string[]): string[] => {
	const results = [];
	words.forEach( word => {
		let rev = ArrayUtils.rotate(word.split(''), -1).reverse().join('')
		if (word === rev) {
			results.push(word)
		}
		results.sort((w1, w2) => {return w2.length - w1.length})
	})
	return results
}
/**
 * @param  {string[]} words
 * @returns {[key: string]: string[] }
 * Finds words that can be rotated and still be in the word list
 * Returns a map of words with rotograms and their list of rotograms
 */
export const rotagrams = (words: string[]):{[key: string]: string[] } => {
	const wordLU = makeLookupMap(words);
	const usedWords = {};
	const results = {};
	words.forEach( word => {
		if (!usedWords[word]) {
			let len = word.length;
			let letters = word.split('')
			for (var i = 0; i < len -1; i++) {
				let rot = ArrayUtils.rotate(letters, 1).join('');
				if (wordLU[rot]) {
					if (!results[word]) {
						results[word] = []
					 }
					usedWords[rot] = true
					results[word].push(rot)
				}
			}
		}
	})
	return results
}

/**
 * @param  {string[]} words
 * @returns string[]
 * applies pig latin rules to all words in given array
 * Returns list with the words converted to piglatin
 */
export const piglatins = (words: string[]):string[] => {
	const results = words.map(piglatin);
	return results;
}

/**
 * @param  {string} word
 * @returns string
 * returns a string based on the given word, modifying it using pig latin rules
 */
const piglatin = (word:string):string => {
	const isVowel = (letter) => {
		return ["a", "e", "i", "o", "u"].indexOf(letter) >= 0;
	}
	const letters = word.split("");
	if (isVowel(letters[0])) {
		letters.push("w", "a", "y");
	} else if (!isVowel(letters[1])) {
		letters.push(letters.shift(), letters.shift(), "a", "y");
	} else { // first letter is consonant, second is vowel
		letters.push(letters.shift(), "a", "y");
	}
	return letters.join("");
}
/**
 * @param  {} str
 * @returns boolean
 * returns true if the input string is a palendrom
 */
export const isPalendrom = (str):boolean => {
	let result = true;
	const letters = str.split("");
	const n = letters.length;
	for (let i=0; i<(n/2); i++) {
		if (letters[i] !== letters[n-i-1]) {
			result = false;
		} 
	}
	return result;
}
/**
 * @param  {string[]} words
 * @returns string[] - a list of words that are palendroms
 */
export const filterPalendroms = (words: string[]):string[] => {
	return words.filter(isPalendrom);
}

/**
 * @param  {string[]} words
 * @returns StringMap
 * Finds and returns all the palendroms (words that form another word when letters are reversed)
 *  in the given array and returns a map with a word as the key and the reverse as the value
 */
export const palendroms = (words: string[]):StringMap => {
	const wordLU = makeLookupMap(words);
	const results = {};
	const skipRev = {};
	words.forEach( word => {
		let rev = word.split('').reverse().join('')
		if (!results.hasOwnProperty(word) && !results.hasOwnProperty(rev) && wordLU[rev]) {
			results[word] = rev;
			skipRev[rev] = true;
		}
	})
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

export type wordPercentagesType = [number, string, number, number[]][];
export const wordleFreqStats = (words: string[], sortOrder:ArrayUtils.sortOrderType[] = [{index: 0, decending: false}, {index: 2, decending: true}, {index: 1, decending: false}]):[StringToNumberMap, [number, string][], wordPercentagesType] => {
	if (!words) { words = []};
	let letters;
	let lettersUnique;
	const placements = [];
	const letterFreq = {};
	let letterCount = 0;
	words.forEach( word => {
		letters = word.split("");
		lettersUnique = [...new Set(word.split(""))];
		lettersUnique.forEach( letter => {
			ArrayUtils.keyCountIncrement(letterFreq, letter);
			letterCount++;
		})
		letters.forEach( (letter, i) => {
			if (!placements[i]) {placements[i] = {}};
			ArrayUtils.keyCountIncrement(placements[i], letter);
		})
	})
	const percentages = [];
	const percentageByLetter = {};
	for (const letter in letterFreq) {
		let freq = letterFreq[letter] / letterCount;
		percentages.push([100 * freq, letter]);
		percentageByLetter[letter] = freq;
	}
	percentages.sort((a, b) => a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : 0);
	// now get the percentages per word
	const wordPercentages:wordPercentagesType = [];
	words.forEach( (word) => {
		let wordPercent = 0;
		letters = word.split("");
		lettersUnique = [...new Set(letters)];
		lettersUnique.forEach( letter => {
			wordPercent += percentageByLetter[letter];
		})
		let placement = [];
		letters.forEach( (letter, i) => {
			placement[i] = placements[i]?.[letter] ?? 0;
		})
		wordPercentages.push([wordPercent, word, placement.reduce( (a, b) => a + b), placement]);
	})
	ArrayUtils.sortArrayOfArrays(wordPercentages, sortOrder);
	return [letterFreq, percentages, wordPercentages];
}
/**
 * @param  {string[]} words
 * @param  {string} letter_count a string consisting of a letter and a count delimited by "_"
 * @returns {string[]} words filtered for words that have at least count of letter, e.g.:
 *  letter_count === "e_3" will return only those words with 3 or more "e"s
 */
export const withAtLeastLetterCount = (words:string[], letter_count:string):string[] => {
	const let_count = letter_count.split("_");
	if (let_count.length !== 2) {
		console.error("second param of withAtLeastLetterCount should be of the form <letter>_<count>");
		return
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
		return letterCount >= count;
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
 *  second work slept had s e and t somewhere (but not in the right place) 
 */
export const wordle = (words:string[], clues:string):string[] => {
	const notLetters = [];
	const somewhereLetters = [];
	const correctLetters = [];
	const atLeastLetters = {};
	const rows = clues.toLowerCase().split("_");
	let n = 0;
	let wordLen = 0;
	let error = false;
	for (const clue of rows) {
		const atLeastLettersForClue = {};
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
			if (count < clueCount) {
				atLeastLetters[letter] = clueCount;
			}
		}
	}
	if (error) { return};
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
	if (wordLen === 5) {
		wFuncs.push(wordlePicks);
		wParamLists.push([]);
	}
	return runFilterList(words, wFuncs, wParamLists);
}

export const getWordleClues = (word:string, pick:string):string => {
	const wordLets = word.split("");
	const pickLets = pick.split("");
	let n = wordLets.length;
	if (n !== pickLets.length) {
		return "";
	}
	const clues = [];
	for (let i = 0; i < n; i++) {
		clues[i] = "n";
	}
	for (let i = 0; i < n; i++) {
		if (wordLets[i] === pickLets[i]) {
			clues[i] = "e";
			pickLets[i] = ""; // so we don't refind this letter for wrong place
		} 
	}
	for (let i = 0; i < n; i++) {
		const pickLetIndex = pickLets.indexOf(wordLets[i]);
		if (pickLetIndex >= 0 && clues[i] !== "e") {
			clues[i] = "p";
			pickLets[pickLetIndex] = "";
		}
	}
	return clues.join("");
}

export const getWordlePartitions = (words:string[], picks:string[]):StringToStringToArrayMap => {
	const result:StringToStringToArrayMap = {};
	for (let word of words) {
		result[word] = {};
		for (let pick of picks) {
			const clues = getWordleClues(word, pick);
			if (result[word][clues]) {
				result[word][clues].push(pick);
			} else {
				result[word][clues] = [pick];
			}
		}
	}
	return result;
}

export function initWordlePartitions() {
	if (!wordlePicksPartitions) {
		const picks = WordleDict.wordlePicks();
		wordlePicksPartitions = getWordlePartitions(picks, picks);
	}
}

export function getWordlePicksPartitions(words: string[] = null): StringToStringToArrayMap {
	initWordlePartitions();
	return filterWordlePicksPartitions(words, wordlePicksPartitions);
}

export const filterWordlePicksPartitions = (words:string[], wpp:StringToStringToArrayMap):StringToStringToArrayMap => {
	let result:StringToStringToArrayMap = {};
	if (!wpp) {
		console.error("no base word partion passed in");
		return result;
	}
	if (words) {
		const wordsLU = makeLookupMap(words);
		for(const word in wpp) {
			const wordPartition = {};
			for(const clues in wpp[word]) {
				const newPartition = wpp[word][clues].filter(word => wordsLU[word]);
				if (newPartition.length > 0) {
					wordPartition[clues] = newPartition;
				}
			}
			if (Object.keys(wordPartition).length > 0) {
				result[word] = wordPartition;
			}
		}
		return result;
	} else {
		return wpp;
	}
}

export const getStatsFromPartition = (wpp:StringToStringToArrayMap):partionStats[] => {
	const result:partionStats[] = [];
	for (const word in wpp) {
		let wordCount = 0;
		let partitionCount = 0;
		let largestGroup = 0;
		for(const clues in wpp[word]) {
			partitionCount++;
			const groupCount = wpp[word][clues].length;
			wordCount += groupCount;
			if (largestGroup < groupCount) {
				largestGroup = groupCount;
			}
		}
		result.push( [word, {
				numberOfGroups : partitionCount,
				averageGroupSize : wordCount / partitionCount,
				largestGroup : largestGroup,
			}]);
	}
	result.sort((a:partionStats, b:partionStats) => {
		const numberOfGroupsCmp = b[1].numberOfGroups - a[1].numberOfGroups;
		return numberOfGroupsCmp === 0 ? a[1].largestGroup - b[1].largestGroup : numberOfGroupsCmp
	})
	return result;
}

type wordleDisplayStatsType = [string, number, number, number];
export const getWordleDisplayStats = (words:string[], sortOrder:ArrayUtils.sortOrderType[], maxNonPickWords:number = 50):wordleDisplayStatsType[] => {
	if (!wordlePicksPartitions) {
		console.error("getWordleDisplayStats before partitions resolved");
		return [];
	}
	const partitions = filterWordlePicksPartitions(words, wordlePicksPartitions);
	const partStats = getStatsFromPartition(partitions);
	const freqStats = {};
	wordleFreqStats(words)[2].forEach(stat => {
		freqStats[stat[1]] = stat[0];
	});
	const result:wordleDisplayStatsType[] = [];
	const wordCount = words.length;
	for (let i = 0; i < partStats.length; i++) {
		const partStat = partStats[i];
		const word = partStat[0];
		const freqStat:number = freqStats[word] ?? 0;
		if (freqStat > 0) {
			result.push([word, partStat[1].averageGroupSize, partStat[1].largestGroup, freqStat]);
		}
	}
	if (result[0] && result[0][1] - 1 > 0.000001) {
		let n = Math.min(wordCount, maxNonPickWords);
		let i = 0;
		while (n > 0) {
			const partStat = partStats[i];
			const word = partStat[0];
			const freqStat:number = freqStats[word] ?? 0;
			if (freqStat === 0) {
				n--;
				result.push([word, partStat[1].averageGroupSize, partStat[1].largestGroup, freqStat]);
			}
			i++;
		}
	}
	ArrayUtils.sortArrayOfArrays(result, sortOrder);
	return result;
}

/**
 * @param  {string[]} words
 * @returns {string[]} 
 * filters the given words for those in the wordle picks list
 */
export const wordlePicks = (words:string[]):string[] => {
	const wordlePicks = WordleDict.wordlePicks();
	return words.filter(word => wordlePicks.indexOf(word) >= 0);
}
