/**
 * Performs the flattening of a data row recursively
 *
 * @param {String} separator Separator to be used as the flattened field name
 * @returns {Object => Object} Flattened object
 */
function flatten(separator = '.') {
  function step (obj, flatDataRow, currentPath) {
    Object.keys(obj).forEach((key) => {
      const newPath = currentPath ? `${currentPath}${separator}${key}` : key;
      const value = obj[key];

      if (typeof value !== 'object'
        || value === null
        || Array.isArray(value)
        || Object.prototype.toString.call(value.toJSON) === '[object Function]'
        || !Object.keys(value).length) {
        flatDataRow[newPath] = value;
        return;
      }

      step(value, flatDataRow, newPath);
    });

    return flatDataRow;
  }

  return dataRow => step(dataRow, {});
}

module.exports = flatten;
