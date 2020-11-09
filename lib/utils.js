'use strict';

function getProp(obj, path, defaultValue) {
  return obj[path] === undefined ? defaultValue : obj[path];
}

function setProp(obj, path, value) {
  const pathArray = Array.isArray(path) ? path : path.split('.');
  const [key, ...restPath] = pathArray;
  const newValue = pathArray.length > 1 ? setProp(obj[key] || {}, restPath, value) : value;
  return { ...obj, [key]: newValue };
}

function unsetProp(obj, path) {
  const pathArray = Array.isArray(path) ? path : path.split('.');
  const [key, ...restPath] = pathArray;

  if (typeof obj[key] !== 'object') {
    return obj;
  }

  if (pathArray.length === 1) {
    delete obj[key];
    return obj;
  }

  return unsetProp(obj[key], restPath);
}

module.exports = {
  getProp,
  setProp,
  unsetProp,
};