---
order: 2
---

## Transforms

json2csv supports transforms. A transform is a function that receives a data record and returns a transformed record.

#### Custom transforms

```js
function doNothing(item) {
  // apply transformations or create new object
  return transformedItem;
}
```

or using ES6

```js
const doNothing = (item) => {
  // apply transformations or create new object
  return transformedItem;
};
```

For example, let's add a line counter to our CSV, capitalize the car field and change the price to be in Ks (1000s).

```js
function addCounter() {
  let counter = 1;
  return (item) => ({
    counter: counter++,
    ...item,
    car: item.car.toUpperCase(),
    price: item.price / 1000,
  });
}
```

Then you can add `addCounter()` to the `transforms` array.
The reason to wrap the actual transform in a factory function is so the counter always starts with one and you can reuse it. But it's not strictly necessary.

#### Built-in Transforms

There is a number of built-in transform provider by the library.

```js
const {
  transforms: { unwind, flatten },
} = require('json2csv');
```

##### Unwind

The `unwind` transform deconstructs an array field from the input item to output a row for each element. It's similar to MongoDB's \$unwind aggregation.

The transform needs to be instantiated and takes an options object as arguments containing:

- `paths` - Array of Strings, list the paths to the fields to be unwound. It's mandatory and should not be empty.
- `blankOut` - Boolean, unwind using blank values instead of repeating data. Defaults to `false`.

```js
// Default
unwind({ paths: ['fieldToUnwind'] });

// Blanking out repeated data
unwind({ paths: ['fieldToUnwind'], blankOut: true });
```

##### Flatten

Flatten nested JavaScript objects into a single level object.

The transform needs to be instantiated and takes an options object as arguments containing:

- `objects` - Boolean, whether to flatten JSON objects or not. Defaults to `true`.
- `arrays`- Boolean, whether to flatten Arrays or not. Defaults to `false`.
- `separator` - String, separator to use between nested JSON keys when flattening a field. Defaults to `.`.

```js
// Default
flatten();

// Custom separator '__'
flatten({ separator: '_' });

// Flatten only arrays
flatten({ objects: false, arrays: true });
```
