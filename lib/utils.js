'use strict';

const { Readable } = require('stream');

function getProp(obj, path, defaultValue) {
  return obj[path] === undefined ? defaultValue : obj[path];
}

function setProp(obj, path, value) {
  const pathArray = Array.isArray(path) ? path : path.split('.');
  const key = pathArray[0];
  const newValue = pathArray.length > 1 ? setProp(obj[key] || {}, pathArray.slice(1), value) : value;
  return Object.assign({}, obj, { [key]: newValue });
}

class ArrayAsStream extends Readable {
  constructor(src) {
    super({ objectMode: true });
    this.src = src[Symbol.iterator]();
  }

  _read() {
    const { value, done } = this.src.next();
    if (done) {
      this.push(null);
      return;
    }
    this.push(value);
  }
}

module.exports = {
  getProp,
  setProp,
  ArrayAsStream
};