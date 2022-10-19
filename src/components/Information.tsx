import React from "react";

export type InfoType = "help" | "completed" | "empty" | "stats";

export const Information = ({infoType}:{infoType:InfoType}) => {
    switch (infoType) {
        case "empty":
            return (
                <div className="info">
                    The list resulting from the entries has zero words.
                    There likely is a contradiction that needs to be corrected.
                </div>
            )
        case "completed":
            return (
                <div className="info">
                    This board has been completed.
                </div>
            )
        case "help":
            return (
                <div className="info">
                    Set the word(s) based on your wordle game and tap enter.
                    <p/>
                    Toggle the letter placement color to match your wordle entries with the space bar for the last letter entered, or by tapping a letter.
                    <p/>
                    A list of words will be shown here, 
                    sorted by their group score
                    (the number of words remaining devided by the number of groups)
                    <p/>
                    Rows in red are not in the list of possible answers, those 
                    in green are. 
                    You can sort by the column by tapping on that column header.
                    <p/>
                    You can see the group breakdown for a word by tapping on it.
                    A new column headed by the selected word will show the groups 
                    based on the clues that would be shown if the word in each row 
                    was the answer and the selected word were entered.
                    <p/> 
                    Clicking the selected word group breakdown header enters that word 
                    on the board.
                    <p/>
                    You can use "1" to "4" to switch between four boards with the same words but 
                    different target words, for use with a variation like Quordle.
                    <p/>
                    "0" combines all the boards words together to help with Quordle.
                </div>
            )
            case "stats":
                return (
                    <div className="info">
                        Shoul not get here, should be showing stats
                    </div>
                )            
    }


}

export default Information;
