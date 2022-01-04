'use strict';

function getProp(obj, path, defaultValue) {
  return obj[path] === undefined ? defaultValue : obj[path];
}

function setProp(obj, path, value) {
  const pathArray = Array.isArray(path) ? path : path.split('.');
  const [key, ...restPath] = pathArray;
  return {
    ...obj,
    [key]: pathArray.length > 1 ? setProp(obj[key] || {}, restPath, value) : value
  };
}

function unsetProp(obj, path) {
  const pathArray = Array.isArray(path) ? path : path.split('.');
  const [key, ...restPath] = pathArray;

  if (typeof obj[key] !== 'object') {
    // This will never be hit in the current code because unwind does the check before calling unsetProp
    /* istanbul ignore next */
    return obj;
  }

  if (pathArray.length === 1) {
    return Object.keys(obj)
      .filter(prop => prop !== key)
      .reduce((acc, prop) => Object.assign(acc, { [prop]: obj[prop] }), {});
  }

  return Object.keys(obj)
    .reduce((acc, prop) => ({
      ...acc,
      [prop]: prop !== key ? obj[prop] : unsetProp(obj[key], restPath),
    }), {});
}

function flattenReducer(acc, arr) {
  try {
    // This is faster but susceptible to `RangeError: Maximum call stack size exceeded`
    acc.push(...arr);
    return acc;
  } catch (err) {
    // Fallback to a slower but safer option
    return acc.concat(arr);
  }
}

function fastJoin(arr, separator) {
  let isFirst = true;
  return arr.reduce((acc, elem) => {
    if (elem === null || elem === undefined) {
      elem = '';
    }

    if (isFirst) {
      isFirst = false;
      return `${elem}`;
    }

    return `${acc}${separator}${elem}`;
  }, '');
}

module.exports = {
  getProp,
  setProp,
  unsetProp,
  fastJoin,
  flattenReducer
};