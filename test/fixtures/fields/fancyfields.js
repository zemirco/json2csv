module.exports = {
  fields: [{
    label: 'PATH1',
    value: 'path1'
  }, {
    label: 'PATH1+PATH2',
    value: row => row.path1+row.path2
  }, {
    label: 'NEST1',
    value: 'bird.nest1'
  },
  'bird.nest2',
  {
    label: 'nonexistent',
    value: 'fake.path',
    default: 'col specific default value'
  }]
};