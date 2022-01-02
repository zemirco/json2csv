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
      .reduce((acc, prop) => ({ ...acc, [prop]: obj[prop] }), {});
  }

  return Object.keys(obj)
    .reduce((acc, prop) => ({
      ...acc,
      [prop]: prop !== key ? obj[prop] : unsetProp(obj[key], restPath),
    }), {});
}

module.exports = {
  getProp,
  setProp,
  unsetProp,
};