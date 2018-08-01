'use strict';

const fs = require('fs');
const path = require('path');
const child_process = require('child_process');

const cli = 'node "' + path.join(process.cwd(), './bin/json2csv.js" ');

const resultsPath = path.join(process.cwd(), './test/fixtures/results');
const getFixturePath = fixture => '"' + path.join(process.cwd(), './test/fixtures', fixture) + '"';

function readFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath.slice(1, filePath.length -1), 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }

      resolve(data);
    });
  });
}

module.exports = (testRunner, jsonFixtures, csvFixtures) => {
  testRunner.addBefore(() => new Promise((resolve, reject) => 
    fs.mkdir(resultsPath, (err) => {
      if (err && err.code !== 'EEXIST') {
        reject(err);
      }

      resolve();
    })));

  testRunner.addAfter(() => {
    const deleteFolderRecursive = (folderPath) => {
      if (fs.existsSync(folderPath)) {
        fs.readdirSync(folderPath).forEach((file) => {
          const curPath = path.join(folderPath, file);
          if (fs.lstatSync(curPath).isDirectory()) { // recurse
            deleteFolderRecursive(curPath);
          } else { // delete file
            fs.unlinkSync(curPath);
          }
        });
        fs.rmdirSync(folderPath);
      }
    };

    deleteFolderRecursive(resultsPath);
  });

  testRunner.add('should handle ndjson', (t) => {
    const opts = ' --fields carModel,price,color,transmission --ndjson';

    child_process.exec(cli + '-i ' + getFixturePath('/json/ndjson.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.ndjson);
      t.end();
    });
  });

  testRunner.add('should error on invalid ndjson input path without streaming', (t) => {
    const opts = ' --fields carModel,price,color,transmission --ndjson --no-streaming';

    child_process.exec(cli + '-i ' + getFixturePath('/json2/ndjsonInvalid.json') + opts, (err, stdout, stderr) => {   
      t.ok(stderr.indexOf('Invalid input file.') !== -1);
      t.end();
    });
  });

  testRunner.add('should error on invalid ndjson input data', (t) => {
    const opts = ' --fields carModel,price,color,transmission --ndjson';

    child_process.exec(cli + '-i ' + getFixturePath('/json/ndjsonInvalid.json') + opts, (err, stdout, stderr) => {   
      t.ok(stderr.indexOf('Invalid JSON') !== -1);
      t.end();
    });
  });

  testRunner.add('should handle ndjson without streaming', (t) => {
    const opts = ' --fields carModel,price,color,transmission --ndjson --no-streaming';

    child_process.exec(cli + '-i ' + getFixturePath('/json/ndjson.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.ndjson + '\n'); // console.log append the new line
      t.end();
    });
  });

  testRunner.add('should error on invalid input file path', (t) => {
    child_process.exec(cli + '-i ' + getFixturePath('/json2/default.json'), (err, stdout, stderr) => {
      t.ok(stderr.indexOf('Invalid input file.') !== -1);
      t.end();
    });
  });

  testRunner.add('should error on invalid input file path without streaming', (t) => {
    const opts = ' --no-streaming';

    child_process.exec(cli + '-i ' + getFixturePath('/json2/default.json') + opts, (err, stdout, stderr) => {
      t.ok(stderr.indexOf('Invalid input file.') !== -1);
      t.end();
    });
  });

  // testRunner.add('should error if input data is not an object', (t) => {
  //   const input = new Readable();
  //   input._read = () => {};
  //   input.push(JSON.stringify('not an object'));
  //   input.push(null);
  //   try {
  //     const parser = new Json2csvParser();
  //     parser.parse(input);

  //       t.notOk(true);
  //   } catch(error) {
  //       t.equal(error.message, 'Data should not be empty or the "fields" option should be included');
  //   }
  //     t.end();
  // });

  // testRunner.add('should handle empty object', (t) => {
  //   const input = new Readable();
  //   input._read = () => {};
  //   input.push(JSON.stringify({}));
  //   input.push(null);
  //   const opts = {
  //     fields: ['carModel', 'price', 'color']
  //   };

  //   const parser = new Json2csvParser(opts);
  //   child_process.exec(cli + '-i input', (err, stdout, stderr) => {
  //     const csv = stdout;
  //     t.equal(csv, '"carModel","price","color"');
  //     t.end();
  // });

  testRunner.add('should handle deep JSON objects', (t) => {
    child_process.exec(cli + '-i ' + getFixturePath('/json/deepJSON.json'), (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.deepJSON);
      t.end();
    });
  });

  testRunner.add('should handle deep JSON objects without streaming', (t) => {
    const opts = ' --no-streaming';

    child_process.exec(cli + '-i ' + getFixturePath('/json/deepJSON.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.deepJSON + '\n'); // console.log append the new line
      t.end();
    });
  });

  // testRunner.add('should parse json to csv and infer the fields automatically ', (t) => {
  //   child_process.exec(cli + '-i ' + getFixturePath('/json/default.json') + opts, (err, stdout, stderr) => {
  //     const csv = stdout;
  //     t.ok(typeof csv === 'string');
  //     t.equal(csv, csvFixtures.default);
  //     t.end();
  //   });
  // });

  testRunner.add('should error on invalid fields config file path', (t) => {
    const opts = ' --fields-config ' + getFixturePath('/fields2/fieldNames.json');

    child_process.exec(cli + '-i ' + getFixturePath('/json/default.json') + opts, (err, stdout, stderr) => {
      t.ok(stderr.indexOf('Invalid fields config file.') !== -1);
      t.end();
    });
  });

  testRunner.add('should parse json to csv using custom fields', (t) => {
    const opts = ' --fields carModel,price,color,transmission';

    child_process.exec(cli + '-i ' + getFixturePath('/json/default.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.default);
      t.end();
    });
  });

  testRunner.add('should output only selected fields', (t) => {
    const opts = ' --fields carModel,price';

    child_process.exec(cli + '-i ' + getFixturePath('/json/default.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.selected);
      t.end();
    });
  });

  testRunner.add('should output keep fields order', (t) => {
    const opts = ' --fields price,carModel';

    child_process.exec(cli + '-i ' + getFixturePath('/json/default.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.reversed);
      t.end();
    });
  });

  testRunner.add('should output empty value for non-existing fields', (t) => {
    const opts = ' --fields "first not exist field",carModel,price,"not exist field",color';

    child_process.exec(cli + '-i ' + getFixturePath('/json/default.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.withNotExistField);
      t.end();
    });
  });

  testRunner.add('should name columns as specified in \'fields\' property', (t) => {
    const opts = ' --fields-config ' + getFixturePath('/fields/fieldNames.json');

    child_process.exec(cli + '-i ' + getFixturePath('/json/default.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.fieldNames);
      t.end();
    });
  });

  testRunner.add('should support nested properties selectors', (t) => {
    const opts = ' --fields-config ' + getFixturePath('/fields/nested.json');

    child_process.exec(cli + '-i ' + getFixturePath('/json/nested.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.nested);
      t.end();
    });
  });

  testRunner.add('field.value function should stringify results by default', (t) => {
    const opts = ' --fields-config ' + getFixturePath('/fields/functionStringifyByDefault.js');

    child_process.exec(cli + '-i ' + getFixturePath('/json/functionStringifyByDefault.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.functionStringifyByDefault);
      t.end();
    });
  });

  testRunner.add('field.value function should not stringify if stringify is selected to false', (t) => {
    const opts = ' --fields-config ' + getFixturePath('/fields/functionNoStringify.js');

    child_process.exec(cli + '-i ' + getFixturePath('/json/functionNoStringify.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.functionNoStringify);
      t.end();
    });
  });

  testRunner.add('should process different combinations in fields option', (t) => {
    const opts = ' --fields-config ' + getFixturePath('/fields/fancyfields.js')
      + ' --default-value NULL';

    child_process.exec(cli + '-i ' + getFixturePath('/json/fancyfields.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.fancyfields);
      t.end();
    });
  });

  // Preprocessing

  testRunner.add('should support unwinding an object into multiple rows', (t) => {
    const opts = ' --unwind colors';

    child_process.exec(cli + '-i ' + getFixturePath('/json/unwind.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.unwind);
      t.end();
    });
  });

  testRunner.add('should support multi-level unwind', (t) => {
    const opts = ' --fields carModel,price,items.name,items.color,items.items.position,items.items.color'
      + ' --unwind items,items.items';

    child_process.exec(cli + '-i ' + getFixturePath('/json/unwind2.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.unwind2);
      t.end();
    });
  });

  testRunner.add('hould unwind and blank out repeated data', (t) => {
    const opts = ' --fields carModel,price,items.name,items.color,items.items.position,items.items.color'
      + ' --unwind items,items.items --unwind-blank';

    child_process.exec(cli + '-i ' + getFixturePath('/json/unwind2.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.unwind2Blank);
      t.end();
    });
  });

  testRunner.add('should support flattening deep JSON', (t) => {
    const opts = ' --flatten';

    child_process.exec(cli + '-i ' + getFixturePath('/json/deepJSON.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.flattenedDeepJSON);
      t.end();
    });
  });

  testRunner.add('should support custom flatten separator', (t) => {
    const opts = ' --flatten --flatten-separator __';

    child_process.exec(cli + '-i ' + getFixturePath('/json/deepJSON.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.flattenedCustomSeparatorDeepJSON);
      t.end();
    });
  });

  testRunner.add('should unwind and flatten an object in the right order', (t) => {
    const opts = ' --unwind items --flatten';

    child_process.exec(cli + '-i ' + getFixturePath('/json/unwindAndFlatten.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.unwindAndFlatten);
      t.end();
    });
  });

  // Default value

  testRunner.add('should output the default value as set in \'defaultValue\'', (t) => {
    const opts = ' --fields carModel,price --default-value ""';

    child_process.exec(cli + '-i ' + getFixturePath('/json/defaultValueEmpty.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.defaultValueEmpty);
      t.end();
    });
  });

  testRunner.add('should override \'options.defaultValue\' with \'field.defaultValue\'', (t) => {
    const opts = ' --fields-config ' + getFixturePath('/fields/overriddenDefaultValue.json')
      + ' --default-value ""';

    child_process.exec(cli + '-i ' + getFixturePath('/json/overriddenDefaultValue.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.overriddenDefaultValue);
      t.end();
    });
  });

  testRunner.add('should use \'options.defaultValue\' when no \'field.defaultValue\'', (t) => {
    const opts = ' --fields-config ' + getFixturePath('/fields/overriddenDefaultValue2.js')
      + ' --default-value ""';

    child_process.exec(cli + '-i ' + getFixturePath('/json/overriddenDefaultValue.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.overriddenDefaultValue);
      t.end();
    });
  });

  // Quote

  testRunner.add('should use a custom quote when \'quote\' property is present', (t) => {
    const opts = ' --fields carModel,price --quote "\'"';

    child_process.exec(cli + '-i ' + getFixturePath('/json/default.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.withSimpleQuotes);
      t.end();
    });
  });

  testRunner.add('should be able to don\'t output quotes when setting \'quote\' to empty string', (t) => {
    const opts = ' --fields carModel,price --quote ""';

    child_process.exec(cli + '-i ' + getFixturePath('/json/default.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.withoutQuotes);
      t.end();
    });
  });

  testRunner.add('should escape quotes when setting \'quote\' property is present', (t) => {
    const opts = ' --fields carModel,color --quote "\'"';

    child_process.exec(cli + '-i ' + getFixturePath('/json/escapeCustomQuotes.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
        t.equal(csv, csvFixtures.escapeCustomQuotes);
        t.end();
      });
  });

  // Double Quote

  testRunner.add('should escape quotes with double quotes', (t) => {
    child_process.exec(cli + '-i ' + getFixturePath('/json/quotes.json'), (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.quotes);
      t.end();
    });
  });

  testRunner.add('should not escape quotes with double quotes, when there is a backslah in the end', (t) => {
    child_process.exec(cli + '-i ' + getFixturePath('/json/backslashAtEnd.json'), (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.backslashAtEnd);
      t.end();
    });
  });

  testRunner.add('should not escape quotes with double quotes, when there is a backslah in the end, and its not the last column', (t) => {
    child_process.exec(cli + '-i ' + getFixturePath('/json/backslashAtEndInMiddleColumn.json'), (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.backslashAtEndInMiddleColumn);
      t.end();
    });
  });

  testRunner.add('should escape quotes with value in \'doubleQuote\'', (t) => {
    const opts = ' --fields "a string" --double-quote "*"';

    child_process.exec(cli + '-i ' + getFixturePath('/json/doubleQuotes.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.doubleQuotes);
      t.end();
    });
  });

  // Delimiter

  testRunner.add('should use a custom delimiter when \'delimiter\' property is defined', (t) => {
    const opts = ' --fields carModel,price,color --delimiter "\t"';

    child_process.exec(cli + '-i ' + getFixturePath('/json/default.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.tsv);
      t.end();
    });
  });

  testRunner.add('should remove last delimiter |@|', (t) => {
    const opts = ' --delimiter "|@|"';

    child_process.exec(cli + '-i ' + getFixturePath('/json/delimiter.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.delimiter);
      t.end();
    });
  });

  // EOL

  testRunner.add('should use a custom eol character when \'eol\' property is present', (t) => {
    const opts = ' --fields carModel,price,color --eol "\r\n"';

    child_process.exec(cli + '-i ' + getFixturePath('/json/default.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.eol);
      t.end();
    });
  });

  // Excell

  testRunner.add('should format strings to force excel to view the values as strings', (t) => {
    const opts = ' --fields carModel,price,color --excel-strings';

    child_process.exec(cli + '-i ' + getFixturePath('/json/default.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.excelStrings);
      t.end();
    });
  });

  // Escaping and preserving values

  testRunner.add('should parse JSON values with trailing backslashes', (t) => {
    const opts = ' --fields carModel,price,color';

    child_process.exec(cli + '-i ' + getFixturePath('/json/trailingBackslash.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.trailingBackslash);
      t.end();
    });
  });

  testRunner.add('should escape " when preceeded by \\', (t) => {
    child_process.exec(cli + '-i ' + getFixturePath('/json/escapeDoubleBackslashedDoubleQuote.json'), (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.escapeDoubleBackslashedDoubleQuote);
      t.end();
    });
  });

  testRunner.add('should preserve new lines in values', (t) => {
    const opts = ' --eol "\r\n"';

    child_process.exec(cli + '-i ' + getFixturePath('/json/escapeEOL.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, [
      '"a string"',
      '"with a \ndescription\\n and\na new line"',
      '"with a \r\ndescription and\r\nanother new line"'
    ].join('\r\n'));
      t.end();
    });
  });

  testRunner.add('should preserve tabs in values', (t) => {
    child_process.exec(cli + '-i ' + getFixturePath('/json/escapeTab.json'), (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.escapeTab);
      t.end();
    });
  });

  // Header

  testRunner.add('should parse json to csv without column title', (t) => {
    const opts = ' --fields carModel,price,color,transmission --no-header';

    child_process.exec(cli + '-i ' + getFixturePath('/json/default.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.withoutHeader);
      t.end();
    });
  });

  // Include empty rows

  testRunner.add('should not include empty rows when options.includeEmptyRows is not specified', (t) => {
    child_process.exec(cli + '-i ' + getFixturePath('/json/emptyRow.json'), (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.emptyRowNotIncluded);
      t.end();
    });
  });

  testRunner.add('should include empty rows when options.includeEmptyRows is true', (t) => {
    const opts = ' --include-empty-rows';

    child_process.exec(cli + '-i ' + getFixturePath('/json/emptyRow.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.emptyRow);
      t.end();
    });
  });

  testRunner.add('should include empty rows when options.includeEmptyRows is true, with default values', (t) => {
    const opts = ' --fields-config ' + getFixturePath('/fields/emptyRowDefaultValues.json')
      + ' --default-value NULL'
      + ' --include-empty-rows';

    child_process.exec(cli + '-i ' + getFixturePath('/json/emptyRow.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.emptyRowDefaultValues);
      t.end();
    });
  });

  // testRunner.add('should parse data:[null] to csv with only column title, despite options.includeEmptyRows', (t) => {
  //   const input = new Readable();
  //   input._read = () => {};
  //   input.push(JSON.stringify([null]));
  //   input.push(null);
  //   const opts = {
  //     fields: ['carModel', 'price', 'color'],
  //     includeEmptyRows: true,
  //   };

  //   child_process.exec(cli + '-i input', (err, stdout, stderr) => {
  //     const csv = stdout;
  //     t.equal(csv, '"carModel","price","color"');
  //     t.end();
  //   });
  // });

  // BOM

  testRunner.add('should add BOM character', (t) => {
    const opts = ' --fields carModel,price,color,transmission --with-bom';

    child_process.exec(cli + '-i ' + getFixturePath('/json/specialCharacters.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
    // Compare csv length to check if the BOM character is present
      t.equal(csv[0], '\ufeff');
      t.equal(csv.length, csvFixtures.default.length + 1);
      t.equal(csv.length, csvFixtures.withBOM.length);
      t.end();
    });
  });

  // Get input from stdin

  testRunner.add('should get input from stdin and process as stream', (t) => {
    const test = child_process.exec(cli, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.defaultStream);
      t.end();
    });

    test.stdin.write(JSON.stringify(jsonFixtures.default));
    test.stdin.end();
  });

  testRunner.add('should error if stdin data is not valid', (t) => {
    const test = child_process.exec(cli, (err, stdout, stderr) => {
      t.ok(stderr.indexOf('Invalid data received from stdin') !== -1);
      t.end();
    });

    test.stdin.write('{ "b": 1,');
    test.stdin.end();
  });

  testRunner.add('should get input from stdin with -s flag', (t) => {
    const test = child_process.exec(cli + '-s', (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.default + '\n'); // console.log append the new line
      t.end();
    });

    test.stdin.write(JSON.stringify(jsonFixtures.default));
    test.stdin.end();
  });

  testRunner.add('should error if stdin data is not valid with -s flag', (t) => {
    const test = child_process.exec(cli + '-s', (err, stdout, stderr) => {
      t.ok(stderr.indexOf('Invalid data received from stdin') !== -1);
      t.end();
    });

    test.stdin.write('{ "b": 1,');
    test.stdin.end();
  });

  // testRunner.add('should error if stdin fails', (t) => {
  //   const test = child_process.exec(cli, (err, stdout, stderr) => {
  //     t.ok(stderr.indexOf('Could not read from stdin') !== -1);
  //     t.end();
  //   });

  //   // TODO Figure out how to make the stdin to error
  //   test.stdin._read = test.stdin._write = () => {};
  //   test.stdin.on('error', () => {});
  //   test.stdin.destroy(new Error('Test error'));
  // });

  // Put output to file

  testRunner.add('should output to file', (t) => {
    const outputPath = getFixturePath('/results/default.csv');
    const opts = ' -o ' + outputPath
      + ' --fields carModel,price,color,transmission';

    child_process.exec(cli + '-i ' + getFixturePath('/json/default.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr);
      readFile(outputPath)
        .then((csv) => {
          t.equal(csv, csvFixtures.default);
          t.end();
        })
        .catch(err => {
          t.notOk(err);
          t.end();
        });
    });
  });


  testRunner.add('should output to file without streaming', (t) => {
    const outputPath = getFixturePath('/results/default.csv');
    const opts = ' -o ' + outputPath
      + ' --fields carModel,price,color,transmission'
      + ' --no-streaming';

    child_process.exec(cli + '-i ' + getFixturePath('/json/default.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr);
      readFile(outputPath)
        .then((csv) => {
          t.equal(csv, csvFixtures.default);
          t.end();
        })
        .catch(err => {
          t.notOk(err);
          t.end();
        });
    });
  });

  testRunner.add('should error on invalid output file path', (t) => {
    const outputPath = getFixturePath('/results2/default.csv');
    const opts = ' -o ' + outputPath
      + ' --fields carModel,price,color,transmission';

    child_process.exec(cli + '-i ' + getFixturePath('/json/default.json') + opts, (err, stdout, stderr) => {
      t.ok(stderr.indexOf('Invalid output file.') !== -1);
      t.end();
    });
  });

  testRunner.add('should error on invalid output file path without streaming', (t) => {
    const outputPath = getFixturePath('/results2/default.csv');
    const opts = ' -o ' + outputPath
      + ' --fields carModel,price,color,transmission --no-streaming';

    child_process.exec(cli + '-i ' + getFixturePath('/json/default.json') + opts, (err, stdout, stderr) => {
      t.ok(stderr.indexOf('Invalid output file.') !== -1);
      t.end();
    });
  });

  // Pretty print

  testRunner.add('should print pretty table', (t) => {
    const opts = ' --pretty';

    child_process.exec(cli + '-i ' + getFixturePath('/json/default.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.prettyprint);
      t.end();
    });
  });

  testRunner.add('should print pretty table without header', (t) => {
    const opts = ' --no-header --pretty';

    child_process.exec(cli + '-i ' + getFixturePath('/json/default.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.prettyprintWithoutHeader);
      t.end();
    });
  });

  testRunner.add('should print pretty table without streaming', (t) => {
    const opts = ' --fields carModel,price,color'
      + ' --no-streaming --pretty ';

    child_process.exec(cli + '-i ' + getFixturePath('/json/default.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.prettyprint);
      t.end();
    });
  });

  testRunner.add('should print pretty table without streaming and without header', (t) => {
    const opts = ' --fields carModel,price,color'
      + ' --no-streaming --no-header --pretty ';

    child_process.exec(cli + '-i ' + getFixturePath('/json/default.json') + opts, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.prettyprintWithoutHeader);
      t.end();
    });
  });
};

