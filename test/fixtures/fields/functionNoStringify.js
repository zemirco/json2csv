module.exports = {
  fields: [{
    label: 'Value1',
    value: row => row.value1.toLocaleString(),
    stringify: false
  }]
};