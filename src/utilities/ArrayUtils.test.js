import * as ArrayUtils from './ArrayUtils';
import * as WordUtils from './WordUtils';
import * as WordleDict from '../data/dictionaries/Wordle';

test('ArrayUtils.sortArrayOfStringToAnyMaps works properly', () => {
    let array = [];
    let sortOrder = [];
    let expected = [];
    ArrayUtils.sortArrayOfStringToAnyMaps(array, sortOrder);
    expect(array).toEqual(expected);
    array = [
        {a:1, b:"2", c: 2},
        {a:2, b:"2", c: 3},
        {a:3, b:"3", c: 3},
        {a:4, b:"3", c: 4},
        {a:5, b:"3", c: 4},
        {a:6, b:"4", c: 3},
        {a:7, b:"4", c: 3},
    ];
    sortOrder = [
        {index:"a", decending:true},
        {index:"b", decending:true},
        {index:"c", decending:true},
    ];
    expected = array.slice();
    ArrayUtils.sortArrayOfStringToAnyMaps(array, sortOrder);
    expect(array).toEqual(expected);
    sortOrder = [
        {index:"c", decending:true},
        {index:"b", decending:true},
        {index:"a", decending:true},
    ];
    expected = [
        {a:1, b:"2", c: 2},
        {a:2, b:"2", c: 3},
        {a:3, b:"3", c: 3},
        {a:6, b:"4", c: 3},
        {a:7, b:"4", c: 3},
        {a:4, b:"3", c: 4},
        {a:5, b:"3", c: 4},
    ];
    ArrayUtils.sortArrayOfStringToAnyMaps(array, sortOrder);
    expect(array).toEqual(expected);
    sortOrder = [
        {index:"b", decending:true},
        {index:"c", decending:true},
        {index:"a", decending:true},
    ];
    expected = [
        {a:1, b:"2", c: 2},
        {a:2, b:"2", c: 3},
        {a:3, b:"3", c: 3},
        {a:4, b:"3", c: 4},
        {a:5, b:"3", c: 4},
        {a:6, b:"4", c: 3},
        {a:7, b:"4", c: 3},
    ];
    ArrayUtils.sortArrayOfStringToAnyMaps(array, sortOrder);
    expect(array).toEqual(expected);
})

test.skip('ArrayUtils.sortArrayOfStringToAnyMaps test performance', () => {
    const initialSortOrder = [
        {index: "avgGroupSize", decending: true}, 
        {index: "maxGroupSize", decending: true}, 
        {index: "letterFrequency", decending: false}, 
        {index: "word", decending: true}, 
        {index: "clues", decending: true}, 
        {index: "cluesGroupCount", decending: true}];
    const sortOrder = initialSortOrder.slice();
    const t0 = new Date().getTime();
    WordUtils.calcWordleMaxIndexPartitions();
    const t1 = new Date().getTime();
    const stats = WordUtils.getWordleDisplayStats(WordleDict.wordleAll, sortOrder, "trace");
    const t2 = new Date().getTime();
    sortOrder.reverse();
    ArrayUtils.sortArrayOfStringToAnyMaps(stats, sortOrder);
    const t3 = new Date().getTime();
    ArrayUtils.sortArrayOfStringToAnyMaps(stats, initialSortOrder);
    const t4 = new Date().getTime();
    ArrayUtils.sortArrayOfStringToAnyMaps(stats, sortOrder);
    const t5 = new Date().getTime();
    console.log("stats.length ",stats.length);
    console.log("initWordleIndexPartitions ", (t1 - t0) / 1000 );
    console.log("getWordleDisplayStats ", (t2 - t1) / 1000 );
    console.log("sortArrayOfStringToAnyMaps rev ", (t3 - t2) / 1000 );
    console.log("sortArrayOfStringToAnyMaps init ", (t4 - t3) / 1000 );
    console.log("sortArrayOfStringToAnyMaps rev2 ", (t5 - t4) / 1000 );
})

test('ArrayUtils.getMinIndices works properly', () => {
    let ascending = true;
    const cmp = (a, b) => {
		return (ascending ? 1 : -1) * (
			(a === b) ? 0 : 
			(a < b) ? 1 : -1);
	}
    let arrays = [[1,2,3,4], [2,4,5,6,8]];
    let indices = [0, 0];
    let expected = [0];
    let result = ArrayUtils.getMinIndices(arrays, indices, cmp);
    indices = [1, 0];
    expected = [0, 1];
    result = ArrayUtils.getMinIndices(arrays, indices, cmp);
    expect(result).toEqual(expected);
    indices = [2, 1];
    expected = [0];
    result = ArrayUtils.getMinIndices(arrays, indices, cmp);
    expect(result).toEqual(expected);
    indices = [3, 1];
    expected = [0, 1];
    result = ArrayUtils.getMinIndices(arrays, indices, cmp);
    expect(result).toEqual(expected);
    indices = [4, 2];
    expected = [1];
    result = ArrayUtils.getMinIndices(arrays, indices, cmp);
    expect(result).toEqual(expected);
    indices = [4, 3];
    expected = [1];
    result = ArrayUtils.getMinIndices(arrays, indices, cmp);
    expect(result).toEqual(expected);
    indices = [4, 4];
    expected = [1];
    result = ArrayUtils.getMinIndices(arrays, indices, cmp);
    expect(result).toEqual(expected);
    indices = [4, 5];
    expected = [];
    result = ArrayUtils.getMinIndices(arrays, indices, cmp);
    expect(result).toEqual(expected);

    arrays = [[1,2,3,4], []];
    indices = [0, 0];
    expected = [0];
    result = ArrayUtils.getMinIndices(arrays, indices, cmp);
    expect(result).toEqual(expected);

    arrays = [[1,2,3,4], [2,4,5,6,8], []];
    indices = [0, 0, 0];
    expected = [0];
    result = ArrayUtils.getMinIndices(arrays, indices, cmp);
    expect(result).toEqual(expected);
    indices = [1, 0, 0];
    expected = [0, 1];
    result = ArrayUtils.getMinIndices(arrays, indices, cmp);
    expect(result).toEqual(expected);
    indices = [2, 1, 0];
    expected = [0];
    result = ArrayUtils.getMinIndices(arrays, indices, cmp);
    expect(result).toEqual(expected);
    indices = [3, 1, 0];
    expected = [0, 1];
    result = ArrayUtils.getMinIndices(arrays, indices, cmp);
    expect(result).toEqual(expected);
    indices = [4, 2, 0];
    expected = [1];
    result = ArrayUtils.getMinIndices(arrays, indices, cmp);
    expect(result).toEqual(expected);
    indices = [4, 3, 0];
    expected = [1];
    result = ArrayUtils.getMinIndices(arrays, indices, cmp);
    expect(result).toEqual(expected);
    indices = [4, 4, 0];
    expected = [1];
    result = ArrayUtils.getMinIndices(arrays, indices, cmp);
    expect(result).toEqual(expected);
    indices = [4, 5, 0];
    expected = [];
    result = ArrayUtils.getMinIndices(arrays, indices, cmp);
    expect(result).toEqual(expected);

    arrays = [[], [1,2,3,4], [2,4,5,6,8], []];
    indices = [0, 0, 0, 0];
    expected = [1];
    result = ArrayUtils.getMinIndices(arrays, indices, cmp);
    expect(result).toEqual(expected);
    indices = [0, 1, 0, 0];
    expected = [1, 2];
    result = ArrayUtils.getMinIndices(arrays, indices, cmp);
    expect(result).toEqual(expected);
    indices = [0, 2, 1, 0];
    expected = [1];
    result = ArrayUtils.getMinIndices(arrays, indices, cmp);
    expect(result).toEqual(expected);
    indices = [0, 3, 1, 0];
    expected = [1, 2];
    result = ArrayUtils.getMinIndices(arrays, indices, cmp);
    expect(result).toEqual(expected);
    indices = [0, 4, 2, 0];
    expected = [2];
    result = ArrayUtils.getMinIndices(arrays, indices, cmp);
    expect(result).toEqual(expected);
    indices = [0, 4, 3, 0];
    expected = [2];
    result = ArrayUtils.getMinIndices(arrays, indices, cmp);
    expect(result).toEqual(expected);
    indices = [0, 4, 4, 0];
    expected = [2];
    result = ArrayUtils.getMinIndices(arrays, indices, cmp);
    expect(result).toEqual(expected);
    indices = [0, 4, 5, 0];
    expected = [];
    result = ArrayUtils.getMinIndices(arrays, indices, cmp);
    expect(result).toEqual(expected);
});

test('ArrayUtils.sortedArraysIntersection properly returns array intersection', () => {
    let a1 = [];
    let a2 = [];
    let a3 = [];
    let expected = [];
    let result = ArrayUtils.sortedArraysIntersection(true, a1, a2, a3);
    expect(result).toEqual(expected);
    expect(result === a1).toBeFalsy;
    expect(result === a2).toBeFalsy;
    a1 = [1,2,3,4];
    a2 = [];
    result = ArrayUtils.sortedArraysIntersection(true, a1, a2);
    expected = [];
    expect(result).toEqual(expected);
    a1 = [1,2,3,4];
    a2 = [2,4,5,6,8];
    result = ArrayUtils.sortedArraysIntersection(true, a1, a2);
    expected = [2,4];
    a1 = [1,2,3,4];
    a2 = [2,4,5,6,8];
    a3 = [];
    result = ArrayUtils.sortedArraysIntersection(true, a1, a2, a3);
    expected = [];
    expect(result).toEqual(expected);
    a2 = [1,2,3,4];
    a1 = [2,4,5,6,8];
    result = ArrayUtils.sortedArraysIntersection(true, a1, a2);
    expected = [2,4];
    expect(result).toEqual(expected);
    a2 = [4,3,2,1];
    a1 = [8,6,5,4,2];
    result = ArrayUtils.sortedArraysIntersection(false, a1, a2);
    expected = [4,2];
    expect(result).toEqual(expected);
    a1 = ["a", "b", "c", "d"];
    a2 = ["b", "d", "e", "f", "g"];
    result = ArrayUtils.sortedArraysIntersection(true, a1, a2);
    expected = ["b", "d"];
    expect(result).toEqual(expected);
    a1 = ["b", "d", "e", "f", "g"];
    a2 = ["b", "d", "e", "f", "g"];
    result = ArrayUtils.sortedArraysIntersection(true, a1, a2);
    expected = ["b", "d", "e", "f", "g"];
    expect(result).toEqual(expected);
    expect(result === a1).toBeFalsy;
    expect(result === a2).toBeFalsy;
})

test('ArrayUtils.sortedArraysUnion properly returns array union', () => {
    let a1 = [];
    let a2 = [];
    let a3 = [];
    let expected = [];
    let result = ArrayUtils.sortedArraysIntersection(true, a1, a2, a3);
    expect(result).toEqual(expected);
    expect(result === a1).toBeFalsy;
    expect(result === a2).toBeFalsy;
    a1 = [1,2,3,4];
    a2 = [];
    result = ArrayUtils.sortedArraysUnion(true, a1, a2);
    expected = [1,2,3,4];
    expect(result).toEqual(expected);
    a1 = [1,2,3,4];
    a2 = [2,4,5,6,8];
    a3 = [];
    result = ArrayUtils.sortedArraysUnion(true, a1, a2, a3);
    expected = [1,2,3,4,5,6,8];
    expect(result).toEqual(expected);
    a2 = [1,2,3,4];
    a1 = [2,4,5,6,8];
    result = ArrayUtils.sortedArraysUnion(true, a1, a2);
    expected = [1,2,3,4,5,6,8];
    expect(result).toEqual(expected);
    a2 = [4,3,2,1];
    a1 = [8,6,5,4,2];
    result = ArrayUtils.sortedArraysUnion(false, a1, a2);
    expected = [8,6,5,4,3,2,1];
    expect(result).toEqual(expected);
    a1 = ["a", "b", "c", "d"];
    a2 = ["b", "d", "e", "f", "g"];
    result = ArrayUtils.sortedArraysUnion(true, a1, a2);
    expected = ["a", "b", "c", "d", "e", "f", "g"];
    expect(result).toEqual(expected);
    a1 = ["b", "d", "e", "f", "g"];
    a2 = ["b", "d", "e", "f", "g"];
    result = ArrayUtils.sortedArraysUnion(true, a1, a2);
    expected = ["b", "d", "e", "f", "g"];
    expect(result).toEqual(expected);
    expect(result === a1).toBeFalsy;
    expect(result === a2).toBeFalsy;
    a1 = [1,2,3,4];
    a2 = [2,4,5,6,8];
    a3 = [0,10,11];
    result = ArrayUtils.sortedArraysUnion(true, a1, a2);
    expected = [0,1,2,3,4,5,6,8,10,11];
})

test('sortArrayOfStringToAnyMaps works as expected', () => {
    let a, sortOrder, result, expected;
    a = [
        {"a": 1, "b": 2, "c": "9", "d": false},
        {"a": 2, "b": 3, "c": "8", "d": false},
        {"a": 3, "b": 2, "c": "7", "d": false},
        {"a": 4, "b": 3, "c": "6", "d": true},
        {"a": 5, "b": 2, "c": "5", "d": true},
        {"a": 6, "b": 3, "c": "4", "d": true},
        {"a": 7, "b": 2, "c": "3", "d": false},
        {"a": 8, "b": 3, "c": "2", "d": false},
    ];
    sortOrder = [
        {index:"b", decending: true},
        {index:"d", decending: false},
        {index:"a", decending: false},
        {index:"c", decending: false},
    ];
    result = a.slice();
    ArrayUtils.sortArrayOfStringToAnyMaps(result, sortOrder);
    expected = [
        {"a": 5, "b": 2, "c": "5", "d": true},
        {"a": 7, "b": 2, "c": "3", "d": false},
        {"a": 3, "b": 2, "c": "7", "d": false},
        {"a": 1, "b": 2, "c": "9", "d": false},
        {"a": 6, "b": 3, "c": "4", "d": true},
        {"a": 4, "b": 3, "c": "6", "d": true},
        {"a": 8, "b": 3, "c": "2", "d": false},
        {"a": 2, "b": 3, "c": "8", "d": false},
    ];
    expect(result).toEqual(expected);
})

test('Array convert to from Int16Array', () => {
    let int16Array = new Int16Array( [-1, -2, 1,2,3, -2, 4,5, -2, 6, -1, -2, 7, 8, -2, 9, -2, 10, 11, -1, -2, 12, 13]);
    let array = ArrayUtils.Int16ArrayToNestedArrayOfNumber(int16Array);
    let expected = [[[ 1,2,3], [4,5], [6]], [[7, 8], [9], [10, 11]], [[12, 13]]];
    expect(array).toEqual(expected);
    array = ArrayUtils.nestedArrayOfNumberToInt16Array(expected);
    expect(array).toEqual(int16Array);
})

test('numberToArray works as expected', () => {
    let num = 0x01020304
    let expected = [4,3,2,1];
    let result = ArrayUtils.numberToArray(num, 8);
    expected = [4,6,8,8];
    result = ArrayUtils.numberToArray(num, 7);
    expect(result).toEqual(expected);
    expected = [4,12,32,0,1];
    result = ArrayUtils.numberToArray(num, 6);
    expect(result).toEqual(expected);
    expected = [4,24,0,4,16];
    result = ArrayUtils.numberToArray(num, 5);
    expect(result).toEqual(expected);
    expected = [4,0,3,0,2,0,1];
    result = ArrayUtils.numberToArray(num);
    expect(result).toEqual(expected);
    expected = [4,0,4,1,0,4,0,0,1];
    result = ArrayUtils.numberToArray(num, 3);
    expect(result).toEqual(expected);
    expected = [0,1,0,0,3,0,0,0,2,0,0,0,1];
    result = ArrayUtils.numberToArray(num, 2);
    expect(result).toEqual(expected);
    expected = [0,0,1,0,0,0,0,0,1,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,1];
    result = ArrayUtils.numberToArray(num, 1);
    expect(result).toEqual(expected);
    expected = [4,3,2,1,0];
    result = ArrayUtils.numberToArray(num, 8, 5);
    expect(result).toEqual(expected);
    num = 0
    expected = [];
    result = ArrayUtils.numberToArray(num, 8);
    expect(result).toEqual(expected);
    num = 0xffffffff
    expected = [0xff,0xff,0xff,0xff];
    result = ArrayUtils.numberToArray(num, 8);
    expect(result).toEqual(expected);
    num = 0xffffffff
    expected = [0xf,0xf,0xf,0xf,0xf,0xf,0xf,0xf];
    result = ArrayUtils.numberToArray(num, 4);
    expect(result).toEqual(expected);
})
