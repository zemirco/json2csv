const defaulStringFormatter = require('./string');

function stringExcel(opts = { stringFormatter: defaulStringFormatter() }) {
  return (value) => `"="${opts.stringFormatter(value)}""`;
}

module.exports = stringExcel;
