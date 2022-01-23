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

  // This will never be hit in the current code because unwind does the check before calling unsetProp
  /* istanbul ignore next */
  if (typeof obj[key] !== 'object') {
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

/**
   * Function to manually make a given object inherit all the properties and methods
   * from another object.
   *
   * @param {Buffer} chunk Incoming data
   * @param {String} encoding Encoding of the incoming data. Defaults to 'utf8'
   * @param {Function} done Called when the proceesing of the supplied chunk is done
   */
function fakeInherit(inheritingObj, parentObj) {
  let current = parentObj.prototype;
  do {
    Object.getOwnPropertyNames(current)
    .filter((prop) => ![
        'constructor',
        '__proto__',
        '__defineGetter__',
        '__defineSetter__',
        '__lookupGetter__',
        '__lookupSetter__',
        'isPrototypeOf',
        'hasOwnProperty',
        'propertyIsEnumerable',
        'valueOf',
        'toString',
        'toLocaleString'
      ].includes(prop)
    )
    .forEach(prop => {
      if (!inheritingObj[prop]) {
        Object.defineProperty(inheritingObj, prop, Object.getOwnPropertyDescriptor(current, prop));
      }
    });
    // Bring back if we ever need to extend object with Symbol properties
    // Object.getOwnPropertySymbols(current).forEach(prop => {
    //   if (!inheritingObj[prop]) {
    //     Object.defineProperty(inheritingObj, prop, Object.getOwnPropertyDescriptor(current, prop));
    //   }
    // });
    current = Object.getPrototypeOf(current);
  } while (current != null);
}

module.exports = {
  getProp,
  setProp,
  unsetProp,
  fakeInherit,
};