# Convert json to csv

The module converts json into csv with column titles. It is the perfect partner for MongoDB and it works similar to [mongoexport](http://www.mongodb.org/display/DOCS/mongoexport) but in node.js. The code is written in [CoffeeScript](http://coffeescript.org/).

## How to use

Install

    npm install json2csv

Include the module and run

    json2csv = require('json2csv');
    json2csv.parse({data: someJSONData, fields: ['field1', 'field2', 'field3']});
    
## Example

### Example 1

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

    var csv = json2csv.parse({
      data: json,
      fields: ['car', 'price', 'color']
    });

    fs.writeFile('file.csv', csv, function(err) {
      if (err) throw err;
      console.log('file saved');
    });
      
The content of the "file.csv" should be

    car, price, color
    Audi, 40000, blue
    BMW, 35000, black
    Porsche, 60000, green
    
### Example 2
    
Similarly to [mongoexport](http://www.mongodb.org/display/DOCS/mongoexport) you can choose which fields to export

    var csv = json2csv.parse({      
      data: json
      fields: ['car', 'color']
    })
    
Should result in

    car, color
    Audi, blue
    BMW, black
    Porsche, green

## Testing

Requires mocha and should.

Run

    make test
or

    npm test
    
## License

Copyright (C) 2012 [Mirco Zeiss](mailto: mirco.zeiss@gmail.com)

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.