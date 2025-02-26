/* eslint-disable no-underscore-dangle */
import isEqual from 'lodash.isequal';

// so we could use both immutable.js objects and regular objects

// typeof object.get === 'function ? immutable:array
export function _get(object, key) {
  return typeof object.get === 'function' ? object.get(key) : object[key];
}

export function _sort(object) {
  return typeof object.get === 'function' ? object.sortBy(
    (f) => f.get('start'),
  ) : object.sort((a, b) => a.start - b.start);
}

export function _length(object) {
  return typeof object.count === 'function' ? object.count() : object.length;
}

export function _pop(object) {
  return typeof object.get === 'function' ? object.slice(0, -1) : object.pop();
}
export function arraysEqual(array1, array2) {
  return (
    _length(array1) === _length(array2)
    && array1.every((element, index) => element === _get(array2, index))
  );
}

export function deepObjectCompare(obj1, obj2) {
  return isEqual(obj1, obj2);
}

export function keyBy(value, key) {
  const obj = {};

  value.forEach((element) => {
    obj[element[key]] = element;
  });

  return obj;
}

export function isTinyItem(item, startKey, endKey, timeRange, tinyItemSize) {
  let itemLength = 0;
  if (_get(item, startKey) !== undefined && _get(item, endKey) !== undefined) {
    itemLength = (_get(item, endKey) - _get(item, startKey)) || 0;
  }
  return (itemLength / timeRange) * 100 <= tinyItemSize;
}
export function noop() {}
