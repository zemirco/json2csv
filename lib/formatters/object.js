const defaulStringFormatter = require('./string');

function objectFormatter(opts = { stringFormatter: defaulStringFormatter() }) {
  return (value) => {
    if (value === null) return '';

    value = JSON.stringify(value);

    if (value === undefined) return '';

    if (value[0] === '"') value = value.replace(/^"(.+)"$/,'$1');

    // Formatter for array
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.replace(/","/g,"','").replace(/^\["/,"['").replace(/"\]$/,"']");
    }

    return opts.stringFormatter(value);
  }
}

module.exports = objectFormatter;
