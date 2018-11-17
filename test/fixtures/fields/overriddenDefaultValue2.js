module.exports = {
  fields: [
    {
      value: 'carModel'
    },
    {
      label: 'price',
      value: row => row.price,
      default: 1
    },
    {
      label: 'color',
      value: row => row.color
    }
  ]
};