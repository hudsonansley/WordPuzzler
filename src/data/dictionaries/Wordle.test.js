import * as WordleDict from "./Wordle";
import { numToWord, wordToNum, wordsToNums } from "./Wordle";
import * as WordleUtils from "../../utilities/WordleUtils";

const wordSetType = "wordle";
beforeAll(() => {
  WordleUtils.initDataLists(wordSetType);
});

test("Wordle.wordleAll has wordle some picks and decoys and not other words", () => {
  const wordleAll = Array.from(WordleDict.wordleAllNums[wordSetType]).map(
    numToWord
  );
  const wordlePicks = Array.from(WordleDict.wordlePicksNums[wordSetType]).map(
    numToWord
  );
  const wordleDecoys = Array.from(WordleDict.wordleDecoysNums[wordSetType]).map(
    numToWord
  );

  expect(wordleAll.length).toEqual(wordleDecoys.length + wordlePicks.length);
  expect(wordlePicks[0]).toEqual("aback");
  expect(wordlePicks[wordlePicks.length - 1]).toEqual("zowie");
  expect(wordleDecoys[0]).toEqual("aahed");
  expect(wordleDecoys[wordleDecoys.length - 1]).toEqual("zymic");

  expect(wordleDecoys).toContain("zygon");
  expect(wordlePicks).not.toContain("zygon");
  expect(wordleAll).toContain("zygon");
  expect(wordleAll).toContain("irate");
  expect(wordlePicks).toContain("irate");
  expect(wordleDecoys).not.toContain("irate");
  expect(wordleAll).toContain("reads");
  expect(wordlePicks).not.toContain("reads");
  expect(wordleDecoys).toContain("reads");
  expect(wordleAll).toContain("crwth");
  expect(wordlePicks).not.toContain("crwth");
  expect(wordleDecoys).toContain("crwth");
  expect(wordleAll).not.toContain("yutes");
  expect(wordlePicks).not.toContain("yutes");
  expect(wordleDecoys).not.toContain("yutes");
});
test("Wordle.wordleAllNums wordlePicksNums wordleDecoysNums have the same words as string lists", () => {
  const wordleAll = WordleUtils.wordleAll;
  const wordlePicks = WordleUtils.wordlePicks;
  const wordlePicksWords = Array.from(
    WordleDict.wordlePicksNums[wordSetType]
  ).map(numToWord);
  const wordleAllWords = Array.from(WordleDict.wordleAllNums[wordSetType]).map(
    numToWord
  );
  wordleAll.sort();
  wordleAllWords.sort();
  expect(wordlePicks.length).toEqual(wordlePicksWords.length);
  expect(wordlePicks[0]).toEqual(
    numToWord(WordleDict.wordlePicksNums[wordSetType][0])
  );
  expect(wordlePicks).toEqual(wordlePicksWords);
  expect(wordleAll.length).toEqual(wordleAllWords.length);
  expect(wordleAll).toEqual(wordleAllWords);
});
test.skip("Wordle.wordleAll has all wordle picks and decoys exactly both combined", () => {
  // only unskip if want to check updated dictionaries,
  // these take a few minutes to run
  const wordleAll = Array.from(WordleDict.wordleAllNums[wordSetType]).map(
    numToWord
  );
  const wordlePicks = Array.from(WordleDict.wordlePicksNums[wordSetType]).map(
    numToWord
  );
  const wordleDecoys = Array.from(WordleDict.wordleDecoysNums[wordSetType]).map(
    numToWord
  );

  expect(wordleAll).toEqual(expect.arrayContaining(wordlePicks));
  expect(wordleAll).toEqual(expect.arrayContaining(wordleDecoys));
  expect(wordlePicks).toEqual(expect.not.arrayContaining(wordleDecoys));
  expect(wordleDecoys).toEqual(expect.not.arrayContaining(wordlePicks));
});

test("wordToNum and numToWord work properly", () => {
  let word = "aaaaa";
  let expected = 0b100001000010000100001;
  expect(wordToNum(word)).toEqual(expected);
  let wordNum = 0b100001000010000100001;
  expect(numToWord(wordNum)).toEqual(word);
  wordNum = 0b100001000010000100010;
  expect(numToWord(wordNum)).toEqual("aaaab");
});

test.skip("Wordle utility test to write out the number version of a words list", () => {
  // update the input and output filenames
  const path = require("path");
  const fs = require("fs");
  const input = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "wordle_decoys_230620.txt"
  );
  const output = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "wordDecoys20230620Nums.txt"
  );
  fs.readFile(input, (err, data) => {
    if (err) throw err;
    const words = data.toString().split("\n");
    const wordNums = wordsToNums(words);
    fs.writeFile(output, `[${wordNums.toString()}]`, (err) => {
      if (err) throw err;
    });
  });
});
