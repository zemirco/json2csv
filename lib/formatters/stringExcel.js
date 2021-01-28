const quote = '"';
const escapedQuote = '""""';

function stringExcel(value) {
  return `"=""${value.replace(new RegExp(quote, 'g'), escapedQuote)}"""`;
}

module.exports = stringExcel;
