import * as ArrayUtils from './ArrayUtils';
import { wordlePicksList } from '../data/dictionaries/Wordle'

export interface StringMap {[key: string]: string; }

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
		let rev = word.split('').rotate(1).reverse().join('')
		if (word == rev) {
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
		let rev = word.split('').rotate(-1).reverse().join('')
		if (word == rev) {
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
				let rot = letters.rotate(1).join('');
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
	console.log('piglatins');
	console.dir(results);
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
 * @param  {string[]} words
 * @returns StringMap
 * Finds and returns all the palendroms (words that form another word when letters are reversed)
 *  in the given array and returns a map with a word as the key and the reverse as the value
 */
export const palendroms = (words: string[]):StringMap => {
	const wordLU = makeLookupMap(words);
	const results = {};
	words.forEach( word => {
		let rev = word.split('').reverse().join('')
		if (!results.hasOwnProperty(word) && wordLU[rev]) {
			results[word] = rev
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
	console.log(`words with unique letters of '${words.length}'`);
	const results:string[] = [];
	words.forEach( word => {
		const letters = word.split('');
		const uniq = [...new Set(letters)];
		if (letters.length == uniq.length) {
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
	console.log(`words matching '${regex}'`);
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

export const runFilterList = (words:string[], funcs:WordFilterFunc[], paramLists:string[][], verbose: Boolean = false):string[] => {
	let results = words.slice();
	let n = funcs.length;
	if (n != paramLists.length) {
		console.error("list of funcs and paramLists have differnt lengths");
		return results;
	}
	for (let i =0; i<n; i++) {
		results = funcs[i](results, ...paramLists[i]);
		if (verbose) {
			console.log(`${funcs[i].name} returned`)
			console.dir(results);
			console.log(results.length);
		}
		if (!results || results.length === 0) {
			return [];
		}
	}
	return results;
}

export const stats = (words: string[], numWordStr: string) => {
	let numWords = parseInt(numWordStr);
	if (isNaN(numWords)) {
		numWords = 10;
	}
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
	console.log(letterFreq);
	console.log(percentages);
	// now get the percentages per word
	const wordPercentages = [];
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
		wordPercentages.push([wordPercent, word, placement.reduce( (a, b) => a + b), placement.join(",")]);
	})
	wordPercentages.sort((a, b) => a[0] < b[0] ? 1 : a[0] > b[0] ? -1 : a[2] < b[2] ? 1 : a[2] > b[2] ? -1 : 0);
	let n = Math.min(words.length, numWords);
	for (let i = 0; i < n; i++) {
		console.log(wordPercentages[i]);
	}
	return words; //for chaining
}

export const withAtLeastLetterCount = (words, letter_count) => {
	const let_count = letter_count.split("_");
	if (let_count.length != 2) {
		console.error("second param of withAtLeastLetterCount should be of the form <letter>_<count>");
		return
	}
	console.log(`checking for at least ${let_count[1]} '${let_count[0]}'s`);
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
	// console.log(result);
	return result;
}

export const wordle = (words, clues) => {
	console.log(`words matching wordle clues '${clues}'`);
	const notLetters = [];
	const somewhereLetters = [];
	const correctLetters = [];
	const atLeastLetters = {};
	const rows = clues.split("_");
	let n = 0;
	let error = false;
	for (const clue of rows) {
		const atLeastLettersForClue = {};
		const letters = clue.split("");
		if (n > 0 && n != letters.length) {
			console.error(`clue length incorrect: '${clue}'`);
			error = true;
			break;
		}
		n = letters.length;
		for (i=0; i < n; i += 2) {
			const letIndex = i/2;
			const letter = letters[i];
			const mod = letters[i+1];
			if (mod == "=") {
				correctLetters[letIndex] = letter;
				ArrayUtils.removeFromArray(notLetters[letIndex], letter);
				ArrayUtils.keyCountIncrement(atLeastLettersForClue, letter);
			} else if (mod == "-") {
				if (somewhereLetters.indexOf(letter) === -1 || correctLetters.indexOf(letter) >= 0) {
					for (let j=0; j < n/2; j++) {
						if (correctLetters[j] != letter) {
							ArrayUtils.addNoRepeatsArrays(notLetters, letter, j);
						}
					}
				} else {
					ArrayUtils.addNoRepeatsArrays(notLetters, letter, letIndex);
				}
			} else if (mod == "?" || mod == "/") {
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
	const wordLen = notLetters.length;
	var regex = "^";
	for (i=0; i < wordLen; i++) {
		const correctLet = correctLetters[i];
		if (typeof correctLet == "string" && correctLet.length > 0) {
			regex += correctLet;
		} else {
			const letters = notLetters[i];
			regex += "[";
			letters.forEach( letter => {
				regex += "^" + letter;
			})
			regex += "]";
		}
	}
	regex += "$";
	wFuncs.push(matches);
	wParamLists.push([regex]);
	var i = 0;
	somewhereLetters.forEach( letter => {
		if (letter) {
			wFuncs.push(matches);
			wParamLists.push([letter]);
		}
		i++;
	})
	Object.entries(atLeastLetters).forEach( (letterCount) => {
		if (letterCount[1] > 1) {
			wFuncs.push(withAtLeastLetterCount);
			wParamLists.push([letterCount.join("_")]);
		}
	})
	if (wordLen == 5) {
		wFuncs.push(wordlePicks);
		wParamLists.push([]);
	}
	wFuncs.push(stats);
	wParamLists.push(["20"]);
	wFuncs.push(unique);
	wParamLists.push([]);
	return runFilterList(words, wFuncs, wParamLists);
}

export const wordlePicks = (words) => {
	console.log( `wordle picks from ${words.length}`);
	const results = [];
	words.forEach (word => {
		if (wordlePicksList().indexOf(word) >= 0) {
			results.push(word);
		}
	})
	return results;
}
