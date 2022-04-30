import React from "react";

const GameRow = ({ classes, rowIndex, items }) => {
    return (
        <div className={classes} id={rowIndex}>
            {items}
        </div>
    );
}
export default GameRow;