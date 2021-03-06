import * as WordUtils from './src/utilities/WordUtils';
import * as ArrayUtils from './src/utilities/ArrayUtils';
import { english3 } from './src/data/dictionaries/English'
import { wordlePicks, wordleDecoys } from './src/data/dictionaries/Wordle'
import fs from 'fs'

// function readTextFile(file, path = "dictionaries/") {
// 	var fs = require('fs');
// 	return fs.readFileSync(`${path}${file}`, 'utf8');
// }

export const runChecks = (words: string[], mArgs:string[]):string[] => {
	let results = words;
	let funcs: WordUtils.WordFilterFunc[] = [];
	let paramLists: string[][] = [];
	let lastWordCount;
	while (mArgs.length > 1) {
		lastWordCount = results.length;
		const funcName = mArgs.shift();
		const wordFunc = WordUtils[funcName];
		if (typeof wordFunc == "function") {
			funcs.push(wordFunc);
			let params = mArgs.splice(0, wordFunc.length - 1);
			paramLists.push(params);
		} else {
			console.log("did not recognize "+funcName);
		}
	}
	return WordUtils.runFilterList(words, funcs, paramLists);
}

/* generate the wordle partition json files

WordUtils.calcWordleMaxIndexPartitions();
// const pWords = WordUtils.wordle(wordlePicks, "t-r/a-c-e-_s-u-r/l-y-");
// const pWords0 = WordUtils.wordle(wordlePicks, "t-r/a-c-e-_s=l-a-i/n-");
// const pWords1 = WordUtils.wordle(wordlePicks, "t-r-a=c-e-_s-l-a=i-n-");
// const pWords2 = WordUtils.wordle(wordlePicks, "t-r-a-c-e=_s-l-a-i/n/");
// const pWords3 = WordUtils.wordle(wordlePicks, "t-r-a/c-e=_s-l/a/i-n-");
// const pWords = [...new Set([...pWords0, ...pWords1, ...pWords2, ...pWords3])]; //])]; //
// const picks = wordlePicks;
// const parts = WordUtils.getWordlePartitions(picks, pWords);
// const parts = WordUtils.getWordlePicksPartitions();
// const stats = WordUtils.getStatsFromPartition(parts);
const partsByIndex = WordUtils.wordlePicksIndexPartitions;
const int16Ary = ArrayUtils.nestedArrayOfNumberToInt16Array(partsByIndex);
fs.writeFileSync('partsByIndexMax.ba', int16Ary, 'binary');
*/

// /*
const verbose = true;
const numWords = 20; //TODO: set these with options
WordUtils.setVerbose(verbose);
const words = english3().filter(word => word.length > 2);
if (verbose) {
    console.log(words.length);
}

let args = process.argv.slice(2);
console.log(args);
let firstCmd = args[0];
const results = runChecks(words, args);
if (verbose) {
	if (firstCmd === "wordle") {
		const [letterFreq, percentages, wordPercentages] = WordUtils.wordleFreqStats(results);
		console.log(letterFreq);
		console.log(percentages);
		let n = Math.min(results.length, numWords);
		for (let i = 0; i < n; i++) {
			console.log(wordPercentages[i]);
		}
	} else {
		console.dir(results);
		console.log(results.length);
	}
	const uniqueWords = WordUtils.unique(results);
	console.dir(uniqueWords);
	console.log(uniqueWords.length);
}
// */
