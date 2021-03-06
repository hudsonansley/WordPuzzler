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
const blankLetter = " ";

export const getBlankLetter = (): LetterType => {
    return { letter: blankLetter, state: "wrong" };
}
export const rotateLetterState = (letterState: LetterState): LetterState => {
    return letterStates[(letterStates.indexOf(letterState) + 1) % letterStates.length];
}

export const getBoardStart = (): BoardDataType => {
    return getBoardFromString("");
};

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
    const stateChar = (letter.state === "correct") ? "=" :
    (letter.state === "wrongIndex") ? "/" : "-";
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

export const getLetterStateFromString = (stateChar:String):LetterState => {
    return (stateChar === "-") ? "wrong" :
        (stateChar === "=") ? "correct" : "wrongIndex";
}

export const getLetterFromString = (letterString:string): LetterType => {
    const letter = letterString.charAt(0);
    const state:LetterState = getLetterStateFromString(letterString.charAt(1));
    return { letter, state };
}

/**
 * @param  {string} cluesString string representing wordle board, expected to be well formed
 * @returns BoardDataType
 */
export const getBoardFromString = (cluesString: string): BoardDataType => {
    let result: BoardDataType = [];
    let clueArray = cluesString.split("_");
    for (const clueString of clueArray) {
        const row: LetterType[] = [];
        const chars = clueString.split("");
        for (let index = 0; index < chars.length; index += 2) {
            const state:LetterState = getLetterStateFromString(chars[index + 1]);
            row.push({ letter: chars[index], state: state });
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

export const getCharIndexFromLoc = (loc: LetterLocType):number => {
    return (2 * lettersPerWord + 1) * loc.rowIndex + 2 * loc.letterIndex;
}

export const getLetterInBoardString = (boardString:string, loc:LetterLocType):LetterType => {
    const charIndex = getCharIndexFromLoc(loc);
    if (charIndex < boardString.length - 1) {
        return getLetterFromString(boardString.substring(charIndex, charIndex + 2));
    } else {
        return getBlankLetter();
    }
}

export const setLetterInBoardString = (boardString:string, letterLoc:LetterLocType, letter:LetterType):string => {
    const charIndex = 2 * letterLoc.letterIndex;
    const rows = boardString.split("_");
    let lastRow = rows.pop();
    while (lastRow.length < 2 * lettersPerWord) {
        lastRow += " -";
    }
    rows.push(lastRow);
    while (rows.length <= letterLoc.rowIndex) {
        rows.push(" - - - - -");
    }
    rows[letterLoc.rowIndex] = rows[letterLoc.rowIndex].substring(0, charIndex)
        + getLetterString(letter) 
        + rows[letterLoc.rowIndex].substring(charIndex + 2);
    return rows.join("_");
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

export const copyBoard = (board:BoardDataType):BoardDataType => {
    return getBoardFromString(getBoardString(board));
}