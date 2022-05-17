import * as BoardData from './BoardData';

test('BoardData.getLetterLoc returns expected value', () => {
    let board = BoardData.getBoardFromString("");
    const emptyBoard = [
        [
        { letter: " ", state: "wrong" },
        { letter: " ", state: "wrong" },
        { letter: " ", state: "wrong" },
        { letter: " ", state: "wrong" },
        { letter: " ", state: "wrong" },
       ],
        [
        { letter: " ", state: "wrong" },
        { letter: " ", state: "wrong" },
        { letter: " ", state: "wrong" },
        { letter: " ", state: "wrong" },
        { letter: " ", state: "wrong" },
       ],
        [
        { letter: " ", state: "wrong" },
        { letter: " ", state: "wrong" },
        { letter: " ", state: "wrong" },
        { letter: " ", state: "wrong" },
        { letter: " ", state: "wrong" },
       ],
        [
        { letter: " ", state: "wrong" },
        { letter: " ", state: "wrong" },
        { letter: " ", state: "wrong" },
        { letter: " ", state: "wrong" },
        { letter: " ", state: "wrong" },
       ],
        [
        { letter: " ", state: "wrong" },
        { letter: " ", state: "wrong" },
        { letter: " ", state: "wrong" },
        { letter: " ", state: "wrong" },
        { letter: " ", state: "wrong" },
       ],
        [
        { letter: " ", state: "wrong" },
        { letter: " ", state: "wrong" },
        { letter: " ", state: "wrong" },
        { letter: " ", state: "wrong" },
        { letter: " ", state: "wrong" },
       ],
        [
        { letter: " ", state: "wrong" },
        { letter: " ", state: "wrong" },
        { letter: " ", state: "wrong" },
        { letter: " ", state: "wrong" },
        { letter: " ", state: "wrong" },
       ],
        [
        { letter: " ", state: "wrong" },
        { letter: " ", state: "wrong" },
        { letter: " ", state: "wrong" },
        { letter: " ", state: "wrong" },
        { letter: " ", state: "wrong" },
       ],
    ]
    expect(board).toEqual(emptyBoard);
    let loc = BoardData.getLetterLoc(board);
    expect(loc).toEqual({ rowIndex: -1, letterIndex: BoardData.lettersPerWord - 1 })

    board = BoardData.getBoardFromString("a-b-c-d-e-_g-h-i-j=k-")
    loc = BoardData.getLetterLoc(board);
    expect(loc).toEqual({ rowIndex: 1, letterIndex: BoardData.lettersPerWord - 1 })

    board = BoardData.getBoardFromString("a-b-c-d-e-_g-h-i-j=k-_l= - - - -")
    loc = BoardData.getLetterLoc(board);
    expect(loc).toEqual({ rowIndex: 2, letterIndex: 0 })

    board = BoardData.getBoardFromString("a-b-c-d-e-_g-h-i-j=k-_l=m-n- - -")
    loc = BoardData.getLetterLoc(board);
    expect(loc).toEqual({ rowIndex: 2, letterIndex: 2 })
})

test('BoardData.getLetterString returns expected value', () => {
    let board = BoardData.getBoardStart();
    let loc = { rowIndex: 0, letterIndex: 0 };
    let letter = BoardData.getLetterAtLoc(board, loc);
    expect(letter.letter).toEqual(" ");
    expect(letter.state).toEqual("wrong");
    let letterStr = BoardData.getLetterString(letter);
    expect(letterStr).toEqual(" -");
    letter = { letter: "x", state: "wrong" };
    letterStr = BoardData.getLetterString(letter);
    expect(letterStr).toEqual("x-");
    letter.state = "correct";
    letterStr = BoardData.getLetterString(letter);
    expect(letterStr).toEqual("x=");
    letter.state = "wrongIndex";
    letterStr = BoardData.getLetterString(letter);
    expect(letterStr).toEqual("x/");

})

test('BoardData.getLetterInBoardString returns expected value', () => {
    let boardStr = "a-b-c-d-e-_g-h-i-j=k-_l/m=n-o-p-_q-r=s/t-u=_v/w-x=y/z-";
    let board = BoardData.getBoardFromString(boardStr);
    expect(board.length).toEqual(BoardData.maxRows);
    expect(board[0].length).toEqual(BoardData.lettersPerWord);
    let loc = { rowIndex: 0, letterIndex: 0 };
    let letter = BoardData.getLetterAtLoc(board, loc);
    expect(letter.letter).toEqual("a");
    expect(letter.state).toEqual("wrong");
    loc = { rowIndex: BoardData.maxRows - 1, letterIndex: BoardData.lettersPerWord - 1 };
    letter = BoardData.getLetterAtLoc(board, loc);
    expect(letter.letter).toEqual(" ");
    expect(letter.state).toEqual("wrong");
    loc = { rowIndex: 1, letterIndex: 3 };
    letter = BoardData.getLetterAtLoc(board, loc);
    expect(letter.letter).toEqual("j");
    expect(letter.state).toEqual("correct");
    loc = { rowIndex: 2, letterIndex: 0 };
    letter = BoardData.getLetterAtLoc(board, loc);
    expect(letter.letter).toEqual("l");
    expect(letter.state).toEqual("wrongIndex");
    expect(boardStr).toEqual(BoardData.getBoardString(board));
    letter = BoardData.getLetterInBoardString(boardStr, loc);
    expect(letter.state).toEqual("wrongIndex");
    expect(letter.letter).toEqual("l");
    loc = { rowIndex: BoardData.maxRows - 1, letterIndex: BoardData.lettersPerWord - 1 };
    letter = BoardData.getLetterInBoardString(boardStr, loc);
    expect(letter.letter).toEqual(" ");
    expect(letter.state).toEqual("wrong");

    loc = { rowIndex: 3, letterIndex: 2 };
    letter = BoardData.getLetterInBoardString(boardStr, loc);
    expect(letter.state).toEqual("wrongIndex");
    expect(letter.letter).toEqual("s");
    letter = { letter:"x", state:"correct" };
    board[loc.rowIndex][loc.letterIndex] = letter;
    boardStr = BoardData.getBoardString(board);
    expect(boardStr).toEqual("a-b-c-d-e-_g-h-i-j=k-_l/m=n-o-p-_q-r=x=t-u=_v/w-x=y/z-");
    expect(BoardData.getLetterInBoardString(boardStr, loc)).toEqual(letter);

})