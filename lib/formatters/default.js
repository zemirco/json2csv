function defaultFormatter(value) {
  if (value === null || value === undefined) return '';

  return `${value}`;
}

module.exports = defaultFormatter;
