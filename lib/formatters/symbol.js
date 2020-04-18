const defaulStringFormatter = require('./string');

function symbolFormatter(opts = { stringFormatter: defaulStringFormatter() }) {
  return (value) => opts.stringFormatter((value.toString().slice(7,-1)));
}

module.exports = symbolFormatter;
