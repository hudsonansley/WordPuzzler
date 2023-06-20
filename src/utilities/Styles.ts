// will hold style related code, using css classes for now

const NUMBER_OF_BOARDS = 4;

export const getBoardColorClass = (
  boardGroup: number,
  alt: boolean,
  typeString: string = "button",
  altString: string = "selected"
): string => {
  const items = [];
  if (boardGroup < NUMBER_OF_BOARDS) {
    if (alt) {
      items.push(altString);
    }
    items.push(typeString);
    if (boardGroup >= 0) {
      items.push(boardGroup.toString());
    }
  } else {
    items.push("impossible", "word");
  }
  items.push("bg");
  return items.join("-");
};
