function parseLdJson(input) {
  return input
    .split('\n')
    .map(line => line.trim())
    .filter(line => line !== '')
    .map(line=> JSON.parse(line));
}

module.exports = parseLdJson;
