# Convert json to csv

Converts json into csv with column titles and proper line endings. Can be used as a module and from the command line.

[![Build Status](https://travis-ci.org/zeMirco/json2csv.png)](https://travis-ci.org/zeMirco/json2csv)

## How to use

Notice!

With version 1.0.0 the API of json2csv was changed. Before `json2csv.parse()` returned the csv. From
v1.0.0 on `json2csv()` returns a callback function with the csv as a parameter to follow node.js coding styles.

Before

```javascript
var csv = json2csv.parse({      
  data: [{"car": "Audi", "color": "blue"}, {"car": "Porsche", "color": "silver"}],
  fields: ['car', 'color']
});
console.log(csv);
```
    
Usage for v1.0.0 and after is shown in the examples.

Install

```bash
$ npm install json2csv
```

Include the module and run

```javascript
var json2csv = require('json2csv');
    
json2csv({data: someJSONData, fields: ['field1', 'field2', 'field3']}, function(csv) {
  console.log(csv);
});
```

## Features

- Uses proper line endings on various operating systems
- Handles double quotes
- Allows custom column selection
- Reads column selection from file
- Pretty writing to stdout
    
## Use as a module

### Example 1

```javascript
var json2csv = require('json2csv');

var json = [
  {
    "car": "Audi",
    "price": 40000,
    "color": "blue"
  }, {
    "car": "BMW",
    "price": 35000,
    "color": "black"
  }, {
    "car": "Porsche",
    "price": 60000,
    "color": "green"
  }
];

json2csv({data: json, fields: ['car', 'price', 'color']}, function(csv) {
  fs.writeFile('file.csv', csv, function(err) {
    if (err) throw err;
    console.log('file saved');
  });
});
```
 
The content of the "file.csv" should be

```
car, price, color
"Audi", 40000, "blue"
"BMW", 35000, "black"
"Porsche", 60000, "green"
```

### Example 2
    
Similarly to [mongoexport](http://www.mongodb.org/display/DOCS/mongoexport) you can choose which fields to export

```javascript
json2csv({data: json, fields: ['car', 'color']}, function(csv) {
  console.log(csv);
});
```

Results in

```
car, color
"Audi", "blue"
"BMW", "black"
"Porsche", "green"
```

### Example 3

Using a custom delimiter to create tsv files. We add it as the value of the del property on the parameters:

```javascript
json2csv({data: json, fields: ['car', 'color'], del: '\t'}, function(csv) {
  console.log(csv);
});
```
    
Will output:

```
carModel  price color
"Audi"  10000 "blue"
"BMW" 15000 "red"
"Mercedes"  20000 "yellow"
"Porsche" 30000 "green"
```

If no delimiter is specified, the default ',' is used


## Command Line Interface

`json2csv` can also be called from the command line

```bash
Usage: json2csv [options]

Options:

  -h, --help              output usage information
  -V, --version           output the version number
  -i, --input <input>     Path and name of the incoming json file.
  -o, --output [output]   Path and name of the resulting csv file. Defaults to console.
  -f, --fields <fields>   Specify the fields to convert.
  -l, --fieldList [list]  Specify a file with a list of fields to include. One field per line.
  -d, --delimiter <delim> Specify a delimiter other than the default comma to use.
  -p, --pretty            Use only when printing to console. Logs output in pretty tables.
```
      
An input file `-i` and fields `-f` are required. If no output `-o` is specified the result is logged to the console.
Use `-p` to show the result in a beautiful table inside the console.
      
### CLI examples

#### Input file and specify fields

```bash
$ json2csv -i input.json -f carModel,price,color
```

```
carModel,price,color
"Audi",10000,"blue"
"BMW",15000,"red"
"Mercedes",20000,"yellow"
"Porsche",30000,"green"
```
    
#### Input file, specify fields and use pretty logging
    
```bash
$ json2csv -i input.json -f carModel,price,color -p
```
    
![Screenshot](https://s3.amazonaws.com/zeMirco/github/json2csv/json2csv-pretty.png)

#### Input file, specify fields and write to file

```bash
$ json2csv -i input.json -f carModel,price,color -o out.csv
```
    
Content of `out.csv` is

```
carModel,price,color
"Audi",10000,"blue"
"BMW",15000,"red"
"Mercedes",20000,"yellow"
"Porsche",30000,"green"
```
    
#### Input file, use field list and write to file

The file `fieldList` contains

```
carModel
price
color
```
    
Use the following command with the `-l` flag
 
```bash
$ json2csv -i input.json -l fieldList -o out.csv
```
    
Content of `out.csv` is

```
carModel,price,color
"Audi",10000,"blue"
"BMW",15000,"red"
"Mercedes",20000,"yellow"
"Porsche",30000,"green"
```

## Testing

Requires mocha, should and async.

Run

```bash
$ make test
```

or

```bash
$ npm test
```
    
## ToDo

- write a second module making use of streams (wait for final streaming api)
    
## License

Copyright (C) 2012 [Mirco Zeiss](mailto: mirco.zeiss@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.