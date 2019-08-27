module.exports = {
  fields: [{
    label: 'Value1',
    value: (row, field) => {
      if(field.label !== 'Value1' && field.default !== 'default value') {
        throw new Error(`Expected ${JSON.stringify(field)} to equals ${JSON.stringify({ label: 'Value1', default: 'default value' })}.`);
      }
      return row.value1.toLocaleString();
    }
  }]
};