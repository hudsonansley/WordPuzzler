import * as WordleDict from './Wordle'
import { numToWord, wordToNum } from './Wordle'

test('Wordle.wordleAll has wordle some picks and decoys and not other words', () => {
    const wordleAll = Array.from(WordleDict.wordleAllNums).map(numToWord);
    const wordlePicks = Array.from(WordleDict.wordlePicksNums).map(numToWord);
    const wordleDecoys = Array.from(WordleDict.wordleDecoysNums).map(numToWord);

    expect(wordleDecoys).toContain("orate");
    expect(wordlePicks).not.toContain("orate");
    expect(wordleAll.length).toEqual(wordleDecoys.length + wordlePicks.length);
    expect(wordleAll).toContain("orate");
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
test('Wordle.wordleAllNums wordlePicksNums wordleDecoysNums have the same words as string lists', () => {
    const wordleAll = WordleDict.wordleAll;
    const wordlePicks = WordleDict.wordlePicks;
    const wordlePicksWords = Array.from(WordleDict.wordlePicksNums).map(numToWord);
    const wordleAllWords = Array.from(WordleDict.wordleAllNums).map(numToWord);
    wordleAll.sort();
    wordleAllWords.sort();
    expect(wordlePicks.length).toEqual(wordlePicksWords.length);
    expect(wordlePicks[0]).toEqual(numToWord(WordleDict.wordlePicksNums[0]));
    expect(wordlePicks).toEqual(wordlePicksWords);
    expect(wordleAll.length).toEqual(wordleAllWords.length);
    expect(wordleAll).toEqual(wordleAllWords);

});
test.skip('Wordle.wordleAll has all wordle picks and decoys exactly both combined', () => {
    // only unskip if want to check updated dictionaries,
    // these take a few minutes to run
    expect(wordleAll).toEqual(
        expect.arrayContaining(wordlePicks),
    );
    expect(wordleAll).toEqual(
        expect.arrayContaining(wordleDecoys),
    );
    expect(wordlePicks).toEqual(
        expect.not.arrayContaining(wordleDecoys),
    );
    expect(wordleDecoys).toEqual(
        expect.not.arrayContaining(wordlePicks),
    );    
});

test('wordToNum and numToWord work properly', () => {
    let word = "aaaaa";
    let expected = 0b100001000010000100001;
    expect(wordToNum(word)).toEqual(expected);
    let wordNum = 0b100001000010000100001;
    expect(numToWord(wordNum)).toEqual(word);
    wordNum = 0b100001000010000100010;
    expect(numToWord(wordNum)).toEqual("aaaab");  
});

test.skip('Wordle write out the number version of a words list', () => {
    const wordNums = wordsToNums(WordleDict.wordleDecoys);
    require('fs').writeFile(
  
      './wordDecoyNums.txt',
  
      JSON.stringify(wordNums),
  
      function (err) {
          if (err) {
              console.error('Crap happens');
          }
      }
  )
});
  