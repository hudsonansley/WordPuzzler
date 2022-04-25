
declare global {
    interface Array<T> {
        rotate(n: Number): T[];
    }
}
/**
 * @param  {number} n
 * Extends Array with "rotate" that shifts the array elements by n and 
 *  adds the overflow to the front of the array
 * Array is modified in place
 * E.g.: [1,2,3,4,5,6].rotate(2) => [3,4,5,6,7,1,2]
 */
Array.prototype.rotate = function(n: number ) {
	const len = this.length;
	n = n % len;
	if (n < 0) {
		n += len
	}
	this.unshift.apply( this, this.splice( n, len ) );
	return this;
}
/**
 * @param  {T[]} array 
 * @param  {T} item
 * Removes item from array if it exists
 * array is modified in place
 */
export const removeFromArray = <T>(array: T[], item: T):void => {
	if (array) {
		const index = array.indexOf(item);
		if (index >= 0) {
			array.splice(index, 1);
		}
	}
}
/**
 * @param  {T[][]} arrays
 * @param  {T} item
 * @param  {number} i
 * @returns void
 * Adds an item to the array at the given index in the given array of arrays
 *  if the item does not already exist there. If no array exists at the given 
 *  index, then it creates a new array at that index with the given item
 */
export const addNoRepeatsArrays = <T>(arrays: T[][], item: T, i: number):void => {
	if (arrays[i]) {
		addNoRepeats(arrays[i], item);
	} else {
		arrays[i] = [item];
	}
}
/**
 * @param  {T[]} array
 * @param  {T} item
 * @returns boolean - true if item was added
 * Adds given item to the given array if the item does not already exist in the array
 */
export const addNoRepeats = <T>(array: T[], item: T):boolean => {
	if (array) {
		if (array.indexOf(item) < 0) {
			array.push(item);
			return true;
		} else {
			return false;
		}
	}
}
/**
 * @param  {{[key:string]:number}} keys
 * @param  {string} key
 * @returns void
 * Keeps track of the number each key passed in by 
 *  modifying the given map, adding a key with a 1 or incrementing if already exists
 */
export const keyCountIncrement = (keys:{[key:string]: number}, key:string):void => {
	if (keys[key]) {
		keys[key] += 1;
	} else {
		keys[key] = 1;
	}
}

