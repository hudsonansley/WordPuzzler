import React from "react";
import { VERSION } from "../version";

export type InfoType =
  | "help"
  | "completed"
  | "empty"
  | "needsAdjustment"
  | "stats";

export const Information = ({ infoType }: { infoType: InfoType }) => {
  switch (infoType) {
    case "empty":
      return (
        <div className="info">
          The list resulting from the entries has zero words. There likely is a
          contradiction that needs to be corrected.
        </div>
      );
    case "completed":
      return <div className="info">This board has been completed.</div>;
    case "needsAdjustment":
      return (
        <div className="info">
          The letters have changed since these board stats were shown. Make any
          needed changes to the letter states (colors) and use "ENTER" to see
          the results.
        </div>
      );
    case "help":
      return (
        <div className="info">
          <p>Set the word(s) based on your wordle game and tap enter.</p>
          <p>
            Toggle the letter placement color to match your wordle entries by
            tapping a letter, or with the space bar for the last letter entered.
          </p>
          <p>
            A list of words will be shown here, sorted by their group score (the
            number of words remaining devided by the number of groups) and
            maximum group size.
          </p>
          <p>
            Rows in red are not in the list of possible answers, those in other
            colors are. Rows with a black background are words not in the known
            'picks' list, but may have been added.
          </p>
          <p>
            Tap on a column header to sort by that column. Tap on a word in a
            row to see the group breakdown for that word. A new column headed by
            that target word will show the groups based on the clues that would
            be shown if the word in each row was the answer and the target word
            were entered.
          </p>
          <p>
            Tap the selected word group breakdown header to enter that word on
            the board.
          </p>
          <p>
            You can use "1" to "4" to switch between four boards with the same
            words but different target words, for use with a variation like
            Quordle.
          </p>
          <p>
            "0" combines all the boards words together to help with Quordle. The
            row colors correspond to the boards the words came from.
          </p>
          <p>
            "&lt;" will add the target word to the board if the clue column is
            showing.
          </p>
          <p>
            "&gt;" will set the clues column target word to the last word on the
            board (experimental).
          </p>
          <div className="version">Version: {VERSION}</div>
        </div>
      );
    case "stats":
      return (
        <div className="info">Should not get here, should be showing stats</div>
      );
  }
};

export default Information;
