/**
 * Binary searches the array for the given key.
 * @param array The array to be searched
 * @param key The object whose properties reflect the value to be searched for
 * @param compareFn A compare function which returns -1 if the "a" is less than "b", 1 if "a" is greater than "b", or 0 if they are equal
 */
export function lowerBound<T>(
  array: T[],
  key: T,
  compareFn: (a: T, b: T) => number
): number | null {
  let low = 0,
    high = array.length - 1
  while (low < high) {
    const mid = ((low + high) / 2) >> 0
    if (compareFn(array[mid], key) < 0) {
      low = mid + 1
    } else {
      high = mid
    }
  }
  if (compareFn(array[low], key) != 0) {
    return null
  }
  return low
}
