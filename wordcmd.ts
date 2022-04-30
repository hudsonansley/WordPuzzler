import * as WordUtils from './src/utilities/WordUtils';
import { english3 } from './src/data/dictionaries/English'

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
		const [letterFreq, percentages, wordPercentages] = WordUtils.stats(results);
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
