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
export const rotate = <T>(array: T[], n: number): T[] => {
  const len = array.length;
  n = n % len;
  if (n < 0) {
    n += len;
  }
  array.unshift(...array.splice(n, len));
  return array;
};
/**
 * @param  {T[]} array
 * @param  {T} item
 * Removes item from array if it exists
 * array is modified in place
 */
export const removeFromArray = <T>(array: T[], item: T): void => {
  if (array) {
    const index = array.indexOf(item);
    if (index >= 0) {
      array.splice(index, 1);
    }
  }
};
/**
 * @param  {T[][]} arrays
 * @param  {T} item
 * @param  {number} i
 * @returns void
 * Adds an item to the array at the given index in the given array of arrays
 *  if the item does not already exist there. If no array exists at the given
 *  index, then it creates a new array at that index with the given item
 */
export const addNoRepeatsArrays = <T>(
  arrays: T[][],
  item: T,
  i: number
): void => {
  if (arrays[i]) {
    addNoRepeats(arrays[i], item);
  } else {
    arrays[i] = [item];
  }
};
/**
 * @param  {T[]} array
 * @param  {T} item
 * @returns boolean - true if item was added
 * Adds given item to the given array if the item does not already exist in the array
 */
export const addNoRepeats = <T>(array: T[], item: T): boolean => {
  if (array && array.indexOf(item) < 0) {
    array.push(item);
    return true;
  }
  return false;
};
/**
 * @param  {{[key:string]:number}} keys
 * @param  {string} key
 * @returns void
 * Keeps track of the number each key passed in by
 *  modifying the given map, adding a key with a 1 or incrementing if already exists
 */
export const keyCountIncrement = (
  keys: { [key: string]: number },
  key: string
): void => {
  if (keys[key]) {
    keys[key] += 1;
  } else {
    keys[key] = 1;
  }
};
/**
 * @param  {{[key:number]:number}} keys
 * @param  {number} key
 * @returns void
 * Keeps track of the number each key passed in by
 *  modifying the given map, adding a key with value 1 or incrementing if key already exists
 */
export const numKeyCountIncrement = (
  keys: { [key: number]: number },
  key: number
): void => {
  if (keys[key]) {
    keys[key] += 1;
  } else {
    keys[key] = 1;
  }
};

export type SortOrderIndexType = number | string;
export type SortOrderType = { index: SortOrderIndexType; decending: boolean };
export type SortOrderArrayType = { index: number; decending: boolean };
/**
 * @param  {SortOrderType[]} sortOrder
 * @param  {SortOrderIndexType} primaryIndex
 * @returns SortOrderType[]
 */
export const updatePrimaryIndex = (
  sortOrder: SortOrderType[],
  primaryIndex: SortOrderIndexType
): SortOrderType[] => {
  const result = sortOrder.slice();
  const i = result.findIndex((item) => item.index === primaryIndex);
  if (i < 0) {
    console.error(
      `primary index ${primaryIndex} is not in the sortOrder array provided`
    );
    return result;
  }
  const [item] = result.splice(i, 1);
  result.unshift(item);
  return result;
};

/**
 * @param  {[][]} array
 * @param  {SortOrderArrayType[]} sortOrder
 */
export const sortArrayOfArrays = (
  array: any[][],
  sortOrder: SortOrderArrayType[]
) => {
  array.sort((a: any[], b: any[]) => {
    let result = 0;
    let index = 0;
    while (result === 0 && index < sortOrder.length) {
      const sortIndex = sortOrder[index].index;
      const orderMod = sortOrder[index].decending ? -1 : 1;
      result =
        orderMod *
        (a[sortIndex] > b[sortIndex]
          ? -1
          : a[sortIndex] < b[sortIndex]
          ? 1
          : 0);
      index++;
    }
    return result;
  });
};

export interface StringToAnyMap {
  [key: string]: any;
}
export type SortOrderObjType = { index: string; decending: boolean };
/**
 * @param  {[][]} array
 * @param  {SortOrderObjType[]} sortOrder
 */
export const sortArrayOfStringToAnyMaps = (
  array: StringToAnyMap[],
  sortOrder: SortOrderObjType[]
) => {
  const cmpFunc = (a: StringToAnyMap, b: StringToAnyMap) => {
    let result = 0;
    let i = 0;
    const n = sortOrder.length;
    while (result === 0 && i < n) {
      const { index, decending } = sortOrder[i];
      const ai = a[index];
      const bi = b[index];
      result =
        ai === bi ? 0 : ai > bi ? (decending ? 1 : -1) : decending ? -1 : 1;
      i++;
    }
    return result;
  };
  array.sort(cmpFunc);
};

export const getMinIndices = <T>(
  arrays: T[][],
  indices: number[],
  cmp: (a: T, b: T) => number
): number[] => {
  let n = arrays.length;
  let minIndex = 0;
  let result = arrays[0].length > indices[0] ? [0] : [];
  for (let i = 1; i < n; i++) {
    const a0 = arrays[minIndex];
    const a1 = arrays[i];
    const i0 = indices[minIndex];
    const i1 = indices[i];
    if (i0 < a0.length && i1 < a1.length) {
      const cmpVal = cmp(a0[i0], a1[i1]);
      if (cmpVal < 0) {
        minIndex = i;
        result = [i];
      } else if (cmpVal === 0) {
        result.push(i);
      }
    } else if (i1 < a1.length) {
      result = [i];
      minIndex = i;
    }
  }
  return result;
};
/**
 * @param  {number} value
 * @param  {number=4} bitsPerValue
 * @param  {number} length
 * @returns {number[]} returns an array of values splitting the given
 *  value into bit groups.
 * NOTE: this only works properly for 32 bit values or less
 */
export const numberToArray = (
  value: number,
  bitsPerValue: number = 4,
  length: number = 1
): number[] => {
  const result: number[] = Array(length);
  const bitsMask = (1 << bitsPerValue) - 1;
  let i = length;
  while (i--) {
    result[length - i - 1] = value & bitsMask;
    value = value >>> bitsPerValue;
  }
  return result;
};

/**
 * @param  {T[]} a1
 * @param  {T[]} a2
 * a1 and a2 must both be sorted in the same decending direction
 *  and contain the same type of items
 * takes O(n) time. This is significantly faster than the
 *  one below that allows setting the direction of the sort
 */
export const sortedArraysIntersectionDecending = <T>(a1: T[], a2: T[]) => {
  let i = 0,
    j = 0;
  const result: T[] = [];
  while (i < a1.length && j < a2.length) {
    if (a1[i] === a2[j]) {
      result.push(a1[i]);
      i++;
      j++;
    } else if (a1[i] < a2[j]) {
      i++;
    } else {
      j++;
    }
  }
  return result;
};

/**
 * @param  {boolean} ascending true if arrays sorted ascending
 * @param  {T[]} a1
 * ...
 * all arrays must be sorted in the given direction
 *  and contain the same type of items
 * returns the intersection of all given arrays
 * takes O(n) time
 */
export const sortedArraysIntersection = <T>(ascending, ...arrays: T[][]) => {
  const cmp = (a: T, b: T) => {
    return (ascending ? 1 : -1) * (a === b ? 0 : a < b ? 1 : -1);
  };
  const result: T[] = [];
  const n = arrays.length;
  if (n === 0) return result;
  if (n === 1) return arrays[0].slice();
  const indices = new Array(n).fill(0);
  const lengths = [];
  for (let i = 0; i < n; i++) {
    lengths.push(arrays[i].length);
  }
  const isNotDone = () => {
    let result = true;
    for (let i = 0; i < n; i++) {
      result = result && indices[i] < lengths[i];
    }
    return result;
  };
  while (isNotDone()) {
    const minIndices = getMinIndices(arrays, indices, cmp);
    const numEqual = minIndices.length;
    if (numEqual === n) {
      result.push(arrays[minIndices[0]][indices[minIndices[0]]]);
    }
    for (let i = 0; i < numEqual; i++) {
      indices[minIndices[i]] += 1;
    }
  }
  return result;
};

/**
 * @param  {boolean} ascending true if arrays sorted ascending
 * @param  {T[]} a1
 * ...
 * all arrays must be sorted in the given direction
 *  and contain the same type of items
 * combines all arrays without duplicates
 * takes O(n) time
 */
export const sortedArraysUnion = <T>(ascending, ...arrays: T[][]) => {
  const cmp = (a: T, b: T) => {
    return (ascending ? 1 : -1) * (a === b ? 0 : a < b ? 1 : -1);
  };
  const result: T[] = [];
  const n = arrays.length;
  if (n === 0) return result;
  if (n === 1) return arrays[0].slice();
  const indices = new Array(n).fill(0);
  let maxLength = 0;
  for (let i = 0; i < n; i++) {
    const len = arrays[i].length;
    if (maxLength < len) {
      maxLength = len;
    }
  }
  let notDone = true;
  while (notDone) {
    const minIndices = getMinIndices(arrays, indices, cmp);
    notDone = minIndices.length > 0;
    if (notDone) {
      result.push(arrays[minIndices[0]][indices[minIndices[0]]]);
      for (let i = 0; i < minIndices.length; i++) {
        indices[minIndices[i]] += 1;
      }
    }
  }
  return result;
};

export const nestedArrayOfNumberToInt16Array = (
  array: number[][][]
): Int16Array => {
  let requiredSize = 0;
  array.forEach((wordSet) => {
    requiredSize += wordSet.length + 1;
    wordSet.forEach((group) => {
      requiredSize += group.length;
    });
  });
  const result = new Int16Array(requiredSize);
  let i = 0;
  array.forEach((wordSet) => {
    result[i] = -1;
    i++;
    wordSet.forEach((group) => {
      result[i] = -2;
      i++;
      group.forEach((item) => {
        result[i] = item;
        i++;
      });
    });
  });
  return result;
};

export const Int16ArrayToNestedArrayOfNumber = (
  array: Int16Array
): number[][][] => {
  const result: number[][][] = [];
  let j: number,
    i: number = -1;
  array.forEach((item) => {
    if (item < 0) {
      if (item === -1) {
        j = -1;
        result.push([]);
        i++;
      } else if (item === -2) {
        result[i].push([]);
        j++;
      }
    } else {
      result[i][j].push(item);
    }
  });
  return result;
};
/**
 * @param  {T[]} a an array of type T
 * @returns {T[][]} returns an array of all the permutations of the given array
 * based on Heap's method http://homepage.math.uiowa.edu/~goodman/22m150.dir/2007/Permutation%20Generation%20Methods.pdf
 * from this SO post https://stackoverflow.com/questions/9960908/permutations-in-javascript
 */
export const permutations = <T>(a: T[]): T[][] => {
  const n = a.length;
  let perm = a.slice();
  const result = [perm];
  const swaps = new Array(n).fill(0);
  let i = 1;
  let k: number;
  let temp: T;

  while (i < n) {
    if (swaps[i] < i) {
      perm = perm.slice();
      k = i % 2 ? swaps[i] : 0;
      temp = perm[i];
      perm[i] = perm[k];
      perm[k] = temp;
      swaps[i]++;
      i = 1;
      result.push(perm);
    } else {
      swaps[i] = 0;
      i++;
    }
  }
  return result;
};
