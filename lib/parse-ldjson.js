
function parseLdJson(input) {
  return input
    .split('\n')
    .map(function (line) {
      return line.trim();
    })
    .filter(function (line) {
      return line !== '';
    })
    .map(function (line) {
      return JSON.parse(line);
    });
}

module.exports = parseLdJson;
