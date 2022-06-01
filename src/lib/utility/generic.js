/* eslint-disable no-underscore-dangle */
import isEqual from 'lodash.isequal';

// so we could use both immutable.js objects and regular objects

// typeof object.get === 'function ? immutable:array
export function _get(object, key) {
  return typeof object.get === 'function' ? object.get(key) : object[key];
}

// TODO: Make sure support is added for immutable.js
export function _sort(object) {
  // return typeof object.get === 'function' ? object._sort(object.s) : object.
  return object.sort((a, b) => a.start - b.start);
}

export function _length(object) {
  return typeof object.count === 'function' ? object.count() : object.length;
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

export function noop() {}
