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

    board = BoardData.getBoardFromString("A-B-C-D-E-_G-H-I-J=K-")
    loc = BoardData.getLetterLoc(board);
    expect(loc).toEqual({ rowIndex: 1, letterIndex: BoardData.lettersPerWord - 1 })

    board = BoardData.getBoardFromString("A-B-C-D-E-_G-H-I-J=K-_L= - - - -")
    loc = BoardData.getLetterLoc(board);
    expect(loc).toEqual({ rowIndex: 2, letterIndex: 0 })

    board = BoardData.getBoardFromString("A-B-C-D-E-_G-H-I-J=K-_L=M-N- - -")
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
    letter = { letter: "X", state: "wrong" };
    letterStr = BoardData.getLetterString(letter);
    expect(letterStr).toEqual("X-");
    letter.state = "correct";
    letterStr = BoardData.getLetterString(letter);
    expect(letterStr).toEqual("X=");
    letter.state = "wrongIndex";
    letterStr = BoardData.getLetterString(letter);
    expect(letterStr).toEqual("X/");

})

test('BoardData.getLetterInBoardString returns expected value', () => {
    let boardStr = "A-B-C-D-E-_G-H-I-J=K-_L/M=N-O-P-_Q-R=S/T-U=_V/W-X=Y/Z-";
    let board = BoardData.getBoardFromString(boardStr);
    expect(board.length).toEqual(BoardData.maxRows);
    expect(board[0].length).toEqual(BoardData.lettersPerWord);
    let loc = { rowIndex: 0, letterIndex: 0 };
    let letter = BoardData.getLetterAtLoc(board, loc);
    expect(letter.letter).toEqual("A");
    expect(letter.state).toEqual("wrong");
    loc = { rowIndex: BoardData.maxRows - 1, letterIndex: BoardData.lettersPerWord - 1 };
    letter = BoardData.getLetterAtLoc(board, loc);
    expect(letter.letter).toEqual(" ");
    expect(letter.state).toEqual("wrong");
    loc = { rowIndex: 1, letterIndex: 3 };
    letter = BoardData.getLetterAtLoc(board, loc);
    expect(letter.letter).toEqual("J");
    expect(letter.state).toEqual("correct");
    loc = { rowIndex: 2, letterIndex: 0 };
    letter = BoardData.getLetterAtLoc(board, loc);
    expect(letter.letter).toEqual("L");
    expect(letter.state).toEqual("wrongIndex");
    expect(boardStr).toEqual(BoardData.getBoardString(board));
    letter = BoardData.getLetterInBoardString(boardStr, loc);
    expect(letter.state).toEqual("wrongIndex");
    expect(letter.letter).toEqual("L");
    loc = { rowIndex: BoardData.maxRows - 1, letterIndex: BoardData.lettersPerWord - 1 };
    letter = BoardData.getLetterInBoardString(boardStr, loc);
    expect(letter.letter).toEqual(" ");
    expect(letter.state).toEqual("wrong");

    loc = { rowIndex: 3, letterIndex: 2 };
    letter = BoardData.getLetterInBoardString(boardStr, loc);
    expect(letter.state).toEqual("wrongIndex");
    expect(letter.letter).toEqual("S");
    letter = { letter:"X", state:"correct" };
    board[loc.rowIndex][loc.letterIndex] = letter;
    boardStr = BoardData.getBoardString(board);
    expect(boardStr).toEqual("A-B-C-D-E-_G-H-I-J=K-_L/M=N-O-P-_Q-R=X=T-U=_V/W-X=Y/Z-");
    expect(BoardData.getLetterInBoardString(boardStr, loc)).toEqual(letter);

})