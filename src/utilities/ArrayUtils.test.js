import * as ArrayUtils from './ArrayUtils';


test('Array.sortedArraysIntersection properly returns array intersection', () => {
    let a1 = [];
    let a2 = [];
    let expected = [];
    let result = ArrayUtils.sortedArraysIntersection(a1, a2);
    expect(result).toEqual(expected);
    expect(result === a1).toBeFalsy;
    expect(result === a2).toBeFalsy;
    a1 = [1,2,3,4];
    a2 = [];
    result = ArrayUtils.sortedArraysIntersection(a1, a2);
    expected = [];
    expect(result).toEqual(expected);
    a1 = [1,2,3,4];
    a2 = [2,4,5,6,8];
    result = ArrayUtils.sortedArraysIntersection(a1, a2);
    expected = [2,4];
    expect(result).toEqual(expected);
    a2 = [1,2,3,4];
    a1 = [2,4,5,6,8];
    result = ArrayUtils.sortedArraysIntersection(a1, a2);
    expected = [2,4];
    expect(result).toEqual(expected);
    a1 = ["a", "b", "c", "d"];
    a2 = ["b", "d", "e", "f", "g"];
    result = ArrayUtils.sortedArraysIntersection(a1, a2);
    expected = ["b", "d"];
    expect(result).toEqual(expected);
    a1 = ["b", "d", "e", "f", "g"];
    a2 = ["b", "d", "e", "f", "g"];
    result = ArrayUtils.sortedArraysIntersection(a1, a2);
    expected = ["b", "d", "e", "f", "g"];
    expect(result).toEqual(expected);
    expect(result === a1).toBeFalsy;
    expect(result === a2).toBeFalsy;
})

test('Array convert to from Int16Array', () => {
    let int16Array = new Int16Array( [-1, -2, 1,2,3, -2, 4,5, -2, 6, -1, -2, 7, 8, -2, 9, -2, 10, 11, -1, -2, 12, 13]);
    let array = ArrayUtils.Int16ArrayToNestedArrayOfNumber(int16Array);
    let expected = [[[ 1,2,3], [4,5], [6]], [[7, 8], [9], [10, 11]], [[12, 13]]];
    expect(array).toEqual(expected);
    array = ArrayUtils.nestedArrayOfNumberToInt16Array(expected);
    expect(array).toEqual(int16Array);
})
