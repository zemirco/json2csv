function toFixedDecimals(value, decimals) {
  return value.toFixed(decimals);
}

function replaceSeparator(value, separator) {
  return value.replace('.', separator);
}


function numberFormatter(opts = {}) {
  if (opts.separator) {
    if (opts.decimals) {
      return (value) => replaceSeparator(toFixedDecimals(value, opts.decimals), opts.separator);
    }

    return (value) => replaceSeparator(value.toString(), opts.separator);
  }

  if (opts.decimals) {
    return (value) => toFixedDecimals(value, opts.decimals);
  }

  return (value) => value.toString();
}

module.exports = numberFormatter;
