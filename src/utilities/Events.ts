type EventName =
  | "keyTapped"
  | "addWordToBoard"
  | "setTargetWord"
  | "rotateLetterState"
  | "initProgressUpdated"
  | "addTargetWordToBoard";

const subscribe = (eventName: EventName, listener) => {
  document.addEventListener(eventName, listener);
};

const unsubscribe = (eventName: EventName, listener) => {
  document.removeEventListener(eventName, listener);
};

const publish = (eventName: EventName, data: object = null) => {
  const event = new CustomEvent(eventName, { detail: data });
  document.dispatchEvent(event);
};

export { publish, subscribe, unsubscribe, EventName };
