# Wordle/Quordle Helper 

This project is designed to help solve [Wordle](https://www.nytimes.com/games/wordle/index.html) and [Quordle](https://www.quordle.com/#/) by providing a list of the possible answers given your current progress in the games and show the breakdown of groups given specific word choices. This is a work in progress.

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

# Wordle/Quordle Helper instructions
* Set the word(s) based on your wordle game and tap enter.
* Toggle the letter placement color to match your wordle entries by tapping a letter, or with the space bar for the last letter entered.
* A list of words will be shown here, sorted by their group score (the number of words remaining devided by the number of groups)
and maximum group size.
* Rows in red are not in the list of possible answers, those 
in other colors are. You can sort by the column by tapping on that column header.
* You can see the group breakdown for a word by tapping on it. A new column headed by that target word will show the groups based on the clues that would be shown if the word in each row was the answer and the target word were entered.
* Tapping the selected word group breakdown header enters that word on the board.
* You can use "1" to "4" to switch between four boards with the same words but different target words, for use with a variation like Quordle.
* "0" combines all the boards words together to help with Quordle. The row colors correspond to the boards the words came from.
* "&lt;" will add the target word to the board if the clue column is showing.
* "&gt;" will set the clues column target word to the last word on the board (experimantal).

## Setup

This has been tested with Node version 15.12 and 18.1, so should work with versions in that range

`> npm init`
to install the necessary node modules

`> npm start` 
to run the app in a local server page

`> npm test`
to run the unit tests


## Code notes
The calculation of wordle groups in an efficient manner is accomplished by precalculating the groups based on clues from all the possible word combinations. The word groups for Wordle and Quordle have diverged, so this calculation is performed when switching between the two modes.

This seemed like a natural use for [WebAssembly](https://webassembly.org/) to improve the initial calculation speed, but it turned out that the javascript jit compiler out performed the precompiled web assembly version. This exercise did lead to use of typed arrays in the JS for all of the base data, including the word lists (converted to Int32Arrays with five bits per letter, for up to six letter words) which I suspect allowed the JS jit compiler to better optimize that code. It also avoids constantly re-creating the base data arrays, avoiding unnecessary garbage collection.

The conic-gradient css function was useful for the quordle button backgrounds in the combined board mode.

### TODO
- [ ] don't recalculate stats just for sort or new target word
- [ ] show table header when item clicked immediately, then the rest of the table when calculation is finished
- [ ] improve responsive layout for small devices
- [ ] convert css to react native styles
- [ ] implement react native, submit to stores
- [ ] add word definitions
- [ ] improve look of table using flex layout, add lines between boad/clue groups and use one color per board
- [ ] add dark mode
- [ ] mark letters with red outline if the clue selection contradicts previous clue selections
- [ x ] show typing while initialization is happening
- [ ] show keyboard keys as disabled when not functional, e.g., the "<" key only works when a target word is set, or only one word remains
- [ ] add auto code formatter
