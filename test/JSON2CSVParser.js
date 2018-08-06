'use strict';

const json2csv = require('../lib/json2csv');
const Json2csvParser = json2csv.Parser;

module.exports = (testRunner, jsonFixtures, csvFixtures) => {
  testRunner.add('should not modify the opts passed using parse method', (t) => {
    const opts = {};
    const csv = json2csv.parse(jsonFixtures.default);

    t.ok(typeof csv === 'string');
    t.equal(csv, csvFixtures.default);
    t.deepEqual(opts, {});
    t.end();
  });

  testRunner.add('should parse json to csv and infer the fields automatically using parse method', (t) => {
    const csv = json2csv.parse(jsonFixtures.default);

    t.ok(typeof csv === 'string');
    t.equal(csv, csvFixtures.default);
    t.end();
  });

  testRunner.add('should not modify the opts passed', (t) => {
    const opts = {};
    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);

    t.ok(typeof csv === 'string');
    t.equal(csv, csvFixtures.default);
    t.deepEqual(opts, {});
    t.end();
  });

  testRunner.add('should error if input data is not an object', (t) => {
    const input = 'not an object';
    try {
      const parser = new Json2csvParser();
      parser.parse(input);

      t.notOk(true);
    } catch(error) {
      t.equal(error.message, 'Data should not be empty or the "fields" option should be included');
    }
    t.end();
  });

  testRunner.add('should handle empty object', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color']
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.emptyObject);

    t.equal(csv, csvFixtures.emptyObject);
    t.end();
  });

  testRunner.add('should handle empty array', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color']
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.emptyArray);

    t.equal(csv, csvFixtures.emptyObject);
    t.end();
  });

  testRunner.add('should hanlde array with nulls', (t) => {
    const input = [null];
    const opts = {
      fields: ['carModel', 'price', 'color']
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(input);

    t.equal(csv, csvFixtures.emptyObject);
    t.end();
  });

  testRunner.add('should handle date in input', (t) => {
    const parser = new Json2csvParser();
    const csv = parser.parse(jsonFixtures.date);

    t.equal(csv, csvFixtures.date);
    t.end();
  });

  testRunner.add('should handle functions in input', (t) => {
    const parser = new Json2csvParser();
    const csv = parser.parse(jsonFixtures.functionField);

    t.equal(csv, csvFixtures.functionField);
    t.end();
  });

  testRunner.add('should handle deep JSON objects', (t) => {
    const parser = new Json2csvParser();
    const csv = parser.parse(jsonFixtures.deepJSON);

    t.equal(csv, csvFixtures.deepJSON);
    t.end();
  });

  testRunner.add('should parse json to csv and infer the fields automatically ', (t) => {
    const parser = new Json2csvParser();
    const csv = parser.parse(jsonFixtures.default);

    t.ok(typeof csv === 'string');
    t.equal(csv, csvFixtures.default);
    t.end();
  });

  testRunner.add('should parse json to csv using custom fields', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color', 'transmission']
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);

    t.equal(csv, csvFixtures.default);
    t.end();
  });

  testRunner.add('should output only selected fields', (t) => {
    const opts = {
      fields: ['carModel', 'price']
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);

    t.equal(csv, csvFixtures.selected);
    t.end();
  });

  testRunner.add('should output keep fields order', (t) => {
    const opts = {
      fields: ['price', 'carModel']
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);

    t.equal(csv, csvFixtures.reversed);
    t.end();
  });

  testRunner.add('should output empty value for non-existing fields', (t) => {
    const opts = {
      fields: ['first not exist field', 'carModel', 'price', 'not exist field', 'color']
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);

    t.equal(csv, csvFixtures.withNotExistField);
    t.end();
  });

  testRunner.add('should name columns as specified in \'fields\' property', (t) => {
    const opts = {
      fields: [{
        label: 'Car Model',
        value: 'carModel'
      },{
        label: 'Price USD',
        value: 'price'
      }]
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);
    
    t.equal(csv, csvFixtures.fieldNames);
    t.end();
  });

  testRunner.add('should support nested properties selectors', (t) => {
    const opts = {
      fields: [{
        label: 'Make',
        value: 'car.make'
      },{
        label: 'Model',
        value: 'car.model'
      },{
        label: 'Price',
        value: 'price'
      },{
        label: 'Color',
        value: 'color'
      },{
        label: 'Year',
        value: 'car.ye.ar'
      }]
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.nested);

    t.equal(csv, csvFixtures.nested);
    t.end();
  });

  testRunner.add('field.value function should stringify results by default', (t) => {
    const opts = {
      fields: [{
        label: 'Value1',
        value: row => row.value1.toLocaleString()
      }]
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.functionStringifyByDefault);
    
    t.equal(csv, csvFixtures.functionStringifyByDefault);
    t.end();
  });

  testRunner.add('field.value function should not stringify if stringify is selected to false', (t) => {
    const opts = {
      fields: [{
        label: 'Value1',
        value: row => row.value1.toLocaleString(),
        stringify: false
      }]
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.functionNoStringify);

    t.equal(csv, csvFixtures.functionNoStringify);
    t.end();
  });

  testRunner.add('should process different combinations in fields option', (t) => {
    const opts = {
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
      }],
      defaultValue: 'NULL'
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.fancyfields);

    t.equal(csv, csvFixtures.fancyfields);
    t.end();
  });

  // Preprocessing

  testRunner.add('should support unwinding an object into multiple rows', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'colors'],
      unwind: 'colors'
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.unwind);

    t.equal(csv, csvFixtures.unwind);
    t.end();
  });

  testRunner.add('should support multi-level unwind', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'items.name', 'items.color', 'items.items.position', 'items.items.color'],
      unwind: ['items', 'items.items']
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.unwind2);

    t.equal(csv, csvFixtures.unwind2);
    t.end();
  });

  testRunner.add('should unwind and blank out repeated data', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'items.name', 'items.color', 'items.items.position', 'items.items.color'],
      unwind: ['items', 'items.items'],
      unwindBlank: true
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.unwind2);

    t.equal(csv, csvFixtures.unwind2Blank);
    t.end();
  });


  testRunner.add('should support flattening deep JSON', (t) => {
    const opts = {
      flatten: true
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.deepJSON);

    t.equal(csv, csvFixtures.flattenedDeepJSON);
    t.end();
  });

  testRunner.add('should support flattening JSON with toJSON', (t) => {
    const opts = {
      flatten: true
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.flattenToJSON);

    t.equal(csv, csvFixtures.flattenToJSON);
    t.end();
  });

  testRunner.add('should support custom flatten separator', (t) => {
    const opts = {
      flatten: true,
      flattenSeparator: '__',
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.deepJSON);

    t.equal(csv, csvFixtures.flattenedCustomSeparatorDeepJSON);
    t.end();
  });

  testRunner.add('should unwind and flatten an object in the right order', (t) => {
    const opts = {
      unwind: ['items'],
      flatten: true
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.unwindAndFlatten);

    t.equal(csv, csvFixtures.unwindAndFlatten);
    t.end();
  });

  // Default value

  testRunner.add('should output the default value as set in \'defaultValue\'', (t) => {
    const opts = {
      fields: ['carModel', 'price'],
      defaultValue: ''
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.defaultValueEmpty);

    t.equal(csv, csvFixtures.defaultValueEmpty);
    t.end();
  });

  testRunner.add('should override \'options.defaultValue\' with \'field.defaultValue\'', (t) => {
    const opts = {
      fields: [
        { value: 'carModel' },
        { value: 'price', default: 1 },
        { value: 'color' }
      ],
      defaultValue: ''
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.overriddenDefaultValue);

    t.equal(csv, csvFixtures.overriddenDefaultValue);
    t.end();
  });

  testRunner.add('should use \'options.defaultValue\' when no \'field.defaultValue\'', (t) => {
    const opts = {
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
      ],
      defaultValue: ''
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.overriddenDefaultValue);

    t.equal(csv, csvFixtures.overriddenDefaultValue);
    t.end();
  });

  // Quote

  testRunner.add('should use a custom quote when \'quote\' property is present', (t) => {
    const opts = {
      fields: ['carModel', 'price'],
      quote: '\''
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);

    t.equal(csv, csvFixtures.withSimpleQuotes);
    t.end();
  });

  testRunner.add('should be able to don\'t output quotes when setting \'quote\' to empty string', (t) => {
    const opts = {
      fields: ['carModel', 'price'],
      quote: ''
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);

    t.equal(csv, csvFixtures.withoutQuotes);
    t.end();
  });

  testRunner.add('should escape quotes when setting \'quote\' property is present', (t) => {
    const opts = {
      fields: ['carModel', 'color'],
      quote: '\''
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.escapeCustomQuotes);

    t.equal(csv, csvFixtures.escapeCustomQuotes);
    t.end();
  });

  // Double Quote

  testRunner.add('should escape quotes with double quotes', (t) => {
    const parser = new Json2csvParser();
    const csv = parser.parse(jsonFixtures.quotes);

    t.equal(csv, csvFixtures.quotes);
    t.end();
  });

  testRunner.add('should not escape quotes with double quotes, when there is a backslah in the end', (t) => {
    const parser = new Json2csvParser();
    const csv = parser.parse(jsonFixtures.backslashAtEnd);

    t.equal(csv, csvFixtures.backslashAtEnd);
    t.end();
  });

  testRunner.add('should not escape quotes with double quotes, when there is a backslah in the end, and its not the last column', (t) => {
    const parser = new Json2csvParser();
    const csv = parser.parse(jsonFixtures.backslashAtEndInMiddleColumn);

    t.equal(csv, csvFixtures.backslashAtEndInMiddleColumn);
    t.end();
  });

  testRunner.add('should escape quotes with value in \'doubleQuote\'', (t) => {
    const opts = {
      fields: ['a string'],
      doubleQuote: '*'
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.doubleQuotes);

    t.equal(csv, csvFixtures.doubleQuotes);
    t.end();
  });

  testRunner.add('should escape quotes before new line with value in \'doubleQuote\'', (t) => {
    const opts = {
      fields: ['a string']
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.backslashBeforeNewLine);

    t.equal(csv, csvFixtures.backslashBeforeNewLine);
    t.end();
  });

  // Delimiter

  testRunner.add('should use a custom delimiter when \'delimiter\' property is defined', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color'],
      delimiter: '\t'
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);

    t.equal(csv, csvFixtures.tsv);
    t.end();
  });

  testRunner.add('should remove last delimiter |@|', (t) => {
    const opts = { delimiter: '|@|' };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.delimiter);

    t.equal(csv, csvFixtures.delimiter);
    t.end();
  });

  // EOL

  testRunner.add('should use a custom eol character when \'eol\' property is present', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color'],
      eol: '\r\n'
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);

    t.equal(csv, csvFixtures.eol);
    t.end();
  });

  // Excell

  testRunner.add('should format strings to force excel to view the values as strings', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color'],
      excelStrings:true
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);

    t.equal(csv, csvFixtures.excelStrings);
    t.end();
  });

  // Escaping and preserving values

  testRunner.add('should parse JSON values with trailing backslashes', (t) => {
    const opts = {
      fields: ['carModel', 'price', 'color']
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.trailingBackslash);

    t.equal(csv, csvFixtures.trailingBackslash);
    t.end();
  });

  testRunner.add('should escape " when preceeded by \\', (t) => {
    const parser = new Json2csvParser();
    const csv = parser.parse(jsonFixtures.escapeDoubleBackslashedDoubleQuote);

    t.equal(csv, csvFixtures.escapeDoubleBackslashedDoubleQuote);
    t.end();
  });

  testRunner.add('should preserve new lines in values', (t) => {
    const opts = {
      eol: '\r\n'
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.escapeEOL);

    t.equal(csv, [
      '"a string"',
      '"with a \ndescription\\n and\na new line"',
      '"with a \r\ndescription and\r\nanother new line"'
    ].join('\r\n'));
    t.end();
  });

  testRunner.add('should preserve tabs in values', (t) => {
    const parser = new Json2csvParser();
    const csv = parser.parse(jsonFixtures.escapeTab);

    t.equal(csv, csvFixtures.escapeTab);
    t.end();
  });

  // Header

  testRunner.add('should parse json to csv without column title', (t) => {
    const opts = {
      header: false,
      fields: ['carModel', 'price', 'color', 'transmission']
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.default);

    t.equal(csv, csvFixtures.withoutHeader);
    t.end();
  });

  // Include empty rows

  testRunner.add('should not include empty rows when options.includeEmptyRows is not specified', (t) => {
    const parser = new Json2csvParser();
    const csv = parser.parse(jsonFixtures.emptyRow);

    t.equal(csv, csvFixtures.emptyRowNotIncluded);
    t.end();
  });

  testRunner.add('should include empty rows when options.includeEmptyRows is true', (t) => {
    const opts = {
      includeEmptyRows: true
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.emptyRow);

    t.equal(csv, csvFixtures.emptyRow);
    t.end();
  });

  testRunner.add('should not include empty rows when options.includeEmptyRows is false', (t) => {
    const opts = {
      includeEmptyRows: false,
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.emptyRow);

    t.equal(csv, csvFixtures.emptyRowNotIncluded);
    t.end();
  });

  testRunner.add('should include empty rows when options.includeEmptyRows is true, with default values', (t) => {
    const opts = {
      fields: [
        {
          value: 'carModel'
        },
        {
          value: 'price',
          default: 1
        },
        {
          value: 'color'
        }
      ],
      defaultValue: 'NULL',
      includeEmptyRows: true,
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.emptyRow);

    t.equal(csv, csvFixtures.emptyRowDefaultValues);
    t.end();
  });

  testRunner.add('should parse data:[null] to csv with only column title, despite options.includeEmptyRows', (t) => {
    const input = [null];
    const opts = {
      fields: ['carModel', 'price', 'color'],
      includeEmptyRows: true,
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(input);

    t.equal(csv, csvFixtures.emptyObject);
    t.end();
  });

  // BOM

  testRunner.add('should add BOM character', (t) => {
    const opts = {
      withBOM: true,
      fields: ['carModel', 'price', 'color', 'transmission']
    };

    const parser = new Json2csvParser(opts);
    const csv = parser.parse(jsonFixtures.specialCharacters);

    // Compare csv length to check if the BOM character is present
    t.equal(csv[0], '\ufeff');
    t.equal(csv.length, csvFixtures.default.length + 1);
    t.equal(csv.length, csvFixtures.withBOM.length);
    t.end();
  });
};
