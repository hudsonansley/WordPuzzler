import * as WordUtils from './src/utilities/WordUtils';
import { english3 } from './src/data/dictionaries/English'

// function readTextFile(file, path = "dictionaries/") {
// 	var fs = require('fs');
// 	return fs.readFileSync(`${path}${file}`, 'utf8');
// }

export const runChecks = (words: string[], mArgs:string[], verbose = false):string[] => {
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
			let params = mArgs.slice(0, wordFunc.length - 1);
			paramLists.push(params);
		} else {
			console.log("did not recognize "+funcName);
		}
	}
	return WordUtils.runFilterList(words, funcs, paramLists, verbose);
}

console.dir(WordUtils);

let name = "matches";
console.log(WordUtils[name]);
console.log(Object.keys(WordUtils));

const words = english3().filter(word => word.length > 2);
console.log(words.length);
// console.dir(words);

let args = process.argv.slice(2);
runChecks(words, args, true);


// for (let i = 0; i < functions.length(); i++) {

// }
