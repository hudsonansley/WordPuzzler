/**
 * @param  {T[]} array
 * @param  {number} n
 * @returns the array passed in (for chaining)
 * shifts the array elements by n and 
 *  adds the overflow to the front of the array
 * Array is modified in place
 * E.g.: const list = [1,2,3,4,5,6]; ArrayUtils.rotate(list, 2);
 * list now equals [3,4,5,6,7,1,2]
 */
export const rotate = <T>(array: T[], n:number):T[] => {
	const len = array.length;
	n = n % len;
	if (n < 0) {
		n += len
	}
	array.unshift( ...array.splice( n, len ) );
	return array;
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

export type sortOrderType = {index: number, decending: boolean};
/**
 * @param  {[][]} array
 * @param  {sortOrderType[]} sortOrder
 */
export const sortArrayOfArrays = (array, sortOrder) => {
	array.sort((a, b) => {
		let result = 0;
		let index = 0;
		while (result === 0 && index < sortOrder.length) {
			const sortIndex = sortOrder[index].index;
			const orderMod = sortOrder[index].decending ? -1 : 1;
			result = orderMod * (a[sortIndex] > b[sortIndex] ? -1 : a[sortIndex] < b[sortIndex] ? 1 : 0);
			index++;
		}
		return result;
	});
}

