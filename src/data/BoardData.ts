export const lettersPerWord = 5;
export const maxRows = 8;

export const letterStates = [
    "wrong",
    "wrongIndex",
    "correct"
] as const;
export type LetterState = typeof letterStates[number];
export type LetterType = { letter: string, state: LetterState };
export type BoardDataType = LetterType[][];
export type LetterLocType = { rowIndex: number, letterIndex: number };
export const blankLetter = " ";

export const getBlankLetter = (): LetterType => {
    return { letter: blankLetter, state: "wrong" };
}
export const rotateLetterState = (letterState: LetterState): LetterState => {
    return letterStates[(letterStates.indexOf(letterState) + 1) % letterStates.length];
}

export const getBoardStart = (): BoardDataType => {
    return getBoardFromString("");
};

/**
 * @param  {BoardDataType} board
 * @returns LetterLocType
 *  returns the letter location {rowIndex, LetterIndex} for the next entry
 * based on the given board
 */
export const getLetterLoc = (board: BoardDataType): LetterLocType => {
    let rowIndex = board.length;
    let letterIndex = lettersPerWord;
    do {
        rowIndex -= 1;
    } while (rowIndex >= 0 && board[rowIndex][0].letter === blankLetter);

    do {
        letterIndex -= 1;
    } while (letterIndex > 0 && rowIndex >= 0 && board[rowIndex][letterIndex].letter === blankLetter);

    return { rowIndex: rowIndex, letterIndex: letterIndex };
}

export const getLetterString = (letter: LetterType):string => {
    let stateChar = "-";
    if (letter.state === "correct") {
        stateChar = "=";
    } else if (letter.state === "wrongIndex") {
        stateChar = "/";
    }
    return letter.letter.toUpperCase() + stateChar;
}

export const getBoardString = (board: BoardDataType) => {
    let rows: string[] = [];
    for (let word of board) {
        let row = "";
        word.forEach(letter => {
            row += getLetterString(letter);
        });
        if (row.length === 2 * lettersPerWord && word[0].letter !== blankLetter ) {
            rows.push(row);
        } else {
            break;
        }
    }
    return rows.join("_");
}

const getLetterStateFromString = (stateChar:string):LetterState => {
    if (stateChar === "/") {
        return "wrongIndex";
    } else {
        return (stateChar === "=") ? "correct" : "wrong";
    }
}

const getLetterFromString = (letterString:string): LetterType => {
    const letter = letterString.charAt(0);
    const state:LetterState = getLetterStateFromString(letterString.charAt(1));
    return { letter, state };
}

export const getWordFromBoardString = ( cluesString:string, rowIndex:number) => {
    const clueArray = cluesString.split("_");
    if (rowIndex < clueArray.length) {
        return clueArray[rowIndex].split("").reduce((acc, ch, i) => acc + (i % 2 || ch === " " ? "" : ch), "").toLowerCase();
    } else {
        return "";
    }
}

/**
 * @param  {string} cluesString string representing wordle board, expected to be well formed
 * @returns BoardDataType
 *  returns a board array based on the given string of letters and clues
 */
export const getBoardFromString = (cluesString: string): BoardDataType => {
    let result: BoardDataType = [];
    const clueArray = cluesString.split("_");
    for (const clueString of clueArray) {
        const row: LetterType[] = [];
        const chars = clueString.split("");
        for (let index = 0; index < chars.length; index += 2) {
            const state:LetterState = getLetterStateFromString(chars[index + 1]);
            row.push({ letter: chars[index], state });
        }
        if (row.length === lettersPerWord) {
            result.push(row);
        }
    }
    for (let index = result.length; index < maxRows; index++) {
        const row: LetterType[] = [];
        for (let letterIndex = 0; letterIndex < lettersPerWord; letterIndex++) {
            row.push(getBlankLetter())
        }
        result.push(row);
    }
    return result;
}
/**
 * @param  {LetterLocType} loc
 * @returns number
 *  returns the index of the character in a board string from the 
 * given letter loc
 */
export const getCharIndexFromLoc = (loc: LetterLocType):number => {
    return (2 * lettersPerWord + 1) * loc.rowIndex + 2 * loc.letterIndex;
}
/**
 * @param  {string} boardString
 * @param  {LetterLocType} loc
 * @returns LetterType
 *  returns a letter object of the letter at the given letter loc in the
 * given board string
 */
export const getLetterInBoardString = (boardString:string, loc:LetterLocType):LetterType => {
    const charIndex = getCharIndexFromLoc(loc);
    if (charIndex < boardString.length - 1) {
        return getLetterFromString(boardString.substring(charIndex, charIndex + 2));
    } else {
        return getBlankLetter();
    }
}
/**
 * @param  {string} boardString
 * @param  {LetterLocType} letterLoc
 * @param  {LetterType} letter
 * @returns string
 *  Sets the letter at the given letter location to the given letter
 * in the given board string and returns the resulting board string
 */
export const setLetterInBoardString = (boardString:string, letterLoc:LetterLocType, letter:LetterType):string => {
    const charIndex = 2 * letterLoc.letterIndex;
    const rows = boardString.split("_");
    let lastRow = rows.pop();
    const emptyLetterStr = getLetterString(getBlankLetter());
    let emptyRowStr = "";
    for (let i=0; i< lettersPerWord; i++) {
        emptyRowStr += emptyLetterStr;
    }
    while (lastRow.length < 2 * lettersPerWord) {
        lastRow += emptyLetterStr;
    }
    rows.push(lastRow);
    while (rows.length <= letterLoc.rowIndex) {
        rows.push(emptyRowStr);
    }
    rows[letterLoc.rowIndex] = rows[letterLoc.rowIndex].slice(0, charIndex)
        + getLetterString(letter) 
        + rows[letterLoc.rowIndex].slice(charIndex + 2);
    while (rows.length > 0 && (rows[rows.length-1] === emptyRowStr)) {
        rows.pop();
    }
    const result = rows.join("_");
    return result;
}

export const getLetterAtLoc = (board:BoardDataType, letterLoc:LetterLocType):LetterType => {
    return board[letterLoc.rowIndex][letterLoc.letterIndex];
}

export const letterIsBlank = (letter:LetterType):boolean => {
    return letter.letter === blankLetter;
}

export const letterAtLetterLocIsBlank = (board:BoardDataType, letterLoc:LetterLocType):boolean => {
    return letterIsBlank(getLetterAtLoc(board, letterLoc));
}

export const incrementLetterLoc = (letterLoc:LetterLocType):LetterLocType => {
    let letterIndex = letterLoc.letterIndex + 1;
    let rowIndex = letterLoc.rowIndex;
    if (letterIndex >= lettersPerWord) {
      letterIndex = 0;
      rowIndex += 1;
    }
    return {rowIndex, letterIndex};
}

export const decrementLetterLoc = (letterLoc:LetterLocType):LetterLocType => {
    let letterIndex = letterLoc.letterIndex - 1;
    let rowIndex = letterLoc.rowIndex;
    if (letterIndex < 0) {
      letterIndex = lettersPerWord - 1;
      rowIndex -= 1;
    }
    return {rowIndex, letterIndex};
}

export const copyBoard = (board:BoardDataType):BoardDataType => {
    return getBoardFromString(getBoardString(board));
}

export const boardIsComplete = (board:BoardDataType):boolean => {
    let loc = getLetterLoc(board);
    if (loc.letterIndex < 0 || loc.letterIndex !== (lettersPerWord - 1)) {
        return false;
    }
    let result = true;
    for (let i=0; i<lettersPerWord; i++) {
        result &&= (getLetterAtLoc(board, loc).state === "correct")
        loc = decrementLetterLoc(loc);
    }
    return result;
}
/**
 * @param  {string} boardStr
 * @returns string[]
 *  returns a list of the words in the given board string (without clue data) 
 */
export const getBoardWords = (boardStr:string):string[] => {
    return boardStr.split("_")
        .map(wordStr => wordStr.toLowerCase().replace(/[=/-]/g, ""))
        .filter(word => word !== "");
  }
