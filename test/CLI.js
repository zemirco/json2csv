'use strict';

const { promisify } = require('util');
const { readFile, mkdir, exists, readdir, lstat, unlink, rmdir } = require('fs');
const { join: joinPath } = require('path');
const { exec } = require('child_process');

const readFileAsync = promisify(readFile);
const mkdirAsync = promisify(mkdir);
const existsAsync = promisify(exists);
const readdirAsync = promisify(readdir);
const lstatAsync = promisify(lstat);
const unlinkAsync = promisify(unlink);
const rmdirAsync = promisify(rmdir);

const cli = `node "${joinPath(process.cwd(), './bin/json2csv.js')}"`;

const resultsPath = './test/fixtures/results';
const getFixturePath = fixture => joinPath('./test/fixtures', fixture);

module.exports = (testRunner, jsonFixtures, csvFixtures) => {
  testRunner.addBefore(async () => {
    try {
      await mkdirAsync(resultsPath);
    } catch(err) {
      if (err.code !== 'EEXIST') throw err;
    }
  });

  testRunner.addAfter(async () => {
    const deleteFolderRecursive = async (folderPath) => {
      if (!(await existsAsync(folderPath))) return;
      const files = await readdirAsync(folderPath);
      await Promise.all(files
        .map(file => joinPath(folderPath, file))
        .map(async (filePath) => {
          if ((await lstatAsync(filePath)).isDirectory()) { // recurse
            await deleteFolderRecursive(filePath);
          } else { // delete file
            await unlinkAsync(filePath);
          }
        })
      );
      await rmdirAsync(folderPath);
    };

    deleteFolderRecursive(resultsPath);
  });

  testRunner.add('should handle ndjson', (t) => {
    const opts = '--fields carModel,price,color,transmission --ndjson';

    exec(`${cli} -i "${getFixturePath('/json/ndjson.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.ndjson);
      t.end();
    });
  });

  testRunner.add('should error on invalid ndjson input path without streaming', (t) => {
    const opts = '--fields carModel,price,color,transmission --ndjson --no-streaming';

    exec(`${cli} -i "${getFixturePath('/json2/ndjsonInvalid.json')}" ${opts}`, (err, stdout, stderr) => {   
      t.ok(stderr.includes('Invalid input file.'));
      t.end();
    });
  });

  testRunner.add('should error on invalid ndjson input data', (t) => {
    const opts = '--fields carModel,price,color,transmission --ndjson';

    exec(`${cli} -i "${getFixturePath('/json/ndjsonInvalid.json')}" ${opts}`, (err, stdout, stderr) => {   
      t.ok(stderr.includes('Invalid JSON'));
      t.end();
    });
  });

  testRunner.add('should handle ndjson without streaming', (t) => {
    const opts = '--fields carModel,price,color,transmission --ndjson --no-streaming';

    exec(`${cli} -i "${getFixturePath('/json/ndjson.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.ndjson + '\n'); // console.log append the new line
      t.end();
    });
  });

  testRunner.add('should error on invalid input file path', (t) => {
    exec(`${cli} -i "${getFixturePath('/json2/default.json')}"`, (err, stdout, stderr) => {
      t.ok(stderr.includes('Invalid input file.'));
      t.end();
    });
  });

  testRunner.add('should error on invalid input file path without streaming', (t) => {
    const opts = '--no-streaming';

    exec(`${cli} -i "${getFixturePath('/json2/default.json')}" ${opts}`, (err, stdout, stderr) => {
      t.ok(stderr.includes('Invalid input file.'));
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

  //       t.fail('Exception expected');
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
  //   exec(`${cli} -i ${input}`, (err, stdout, stderr) => {
  //     const csv = stdout;
  //     t.equal(csv, '"carModel","price","color"');
  //     t.end();
  // });

  testRunner.add('should handle deep JSON objects', (t) => {
    exec(`${cli} -i "${getFixturePath('/json/deepJSON.json')}"`, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.deepJSON);
      t.end();
    });
  });

  testRunner.add('should handle deep JSON objects without streaming', (t) => {
    const opts = '--no-streaming';

    exec(`${cli} -i "${getFixturePath('/json/deepJSON.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.deepJSON + '\n'); // console.log append the new line
      t.end();
    });
  });

  // testRunner.add('should parse json to csv and infer the fields automatically ', (t) => {
  //   exec(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`, (err, stdout, stderr) => {
  //     const csv = stdout;
  //     t.ok(typeof csv === 'string');
  //     t.equal(csv, csvFixtures.default);
  //     t.end();
  //   });
  // });

  testRunner.add('should error on invalid fields config file path', (t) => {
    const opts = `--config "${getFixturePath('/fields2/fieldNames.json')}"`;

    exec(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`, (err, stdout, stderr) => {
      t.ok(stderr.indexOf('Invalid config file.') !== -1);
      t.end();
    });
  });

  testRunner.add('should parse json to csv using custom fields', (t) => {
    const opts = '--fields carModel,price,color,transmission';

    exec(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.default);
      t.end();
    });
  });

  testRunner.add('should output only selected fields', (t) => {
    const opts = '--fields carModel,price';

    exec(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.selected);
      t.end();
    });
  });

  testRunner.add('should output fields in the order provided', (t) => {
    const opts = '--fields price,carModel';

    exec(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.reversed);
      t.end();
    });
  });

  testRunner.add('should output empty value for non-existing fields', (t) => {
    const opts = '--fields "first not exist field",carModel,price,"not exist field",color';

    exec(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.withNotExistField);
      t.end();
    });
  });

  testRunner.add('should name columns as specified in \'fields\' property', (t) => {
    const opts = `--config "${getFixturePath('/fields/fieldNames.json')}"`;

    exec(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.fieldNames);
      t.end();
    });
  });

  testRunner.add('should support nested properties selectors', (t) => {
    const opts = `--config "${getFixturePath('/fields/nested.json')}"`;

    exec(`${cli} -i "${getFixturePath('/json/nested.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.nested);
      t.end();
    });
  });

  testRunner.add('field.value function should receive a valid field object', (t) => {
    const opts = `--config "${getFixturePath('/fields/functionWithCheck.js')}"`;

    exec(`${cli} -i "${getFixturePath('/json/functionStringifyByDefault.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.functionStringifyByDefault);
      t.end();
    });
  });

  testRunner.add('field.value function should stringify results by default', (t) => {
    const opts = `--config "${getFixturePath('/fields/functionStringifyByDefault.js')}"`;

    exec(`${cli} -i "${getFixturePath('/json/functionStringifyByDefault.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.functionStringifyByDefault);
      t.end();
    });
  });

  testRunner.add('should process different combinations in fields option', (t) => {
    const opts = `--config "${getFixturePath('/fields/fancyfields.js')}" --default-value NULL`;

    exec(`${cli} -i "${getFixturePath('/json/fancyfields.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.fancyfields);
      t.end();
    });
  });

  // Default value

  testRunner.add('should output the default value as set in \'defaultValue\'', (t) => {
    const opts = '--fields carModel,price --default-value ""';

    exec(`${cli} -i "${getFixturePath('/json/defaultValueEmpty.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.defaultValueEmpty);
      t.end();
    });
  });

  testRunner.add('should override \'options.defaultValue\' with \'field.defaultValue\'', (t) => {
    const opts = `--config "${getFixturePath('/fields/overriddenDefaultValue.json')}" --default-value ""`;

    exec(`${cli} -i "${getFixturePath('/json/overriddenDefaultValue.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.overriddenDefaultValue);
      t.end();
    });
  });

  testRunner.add('should use \'options.defaultValue\' when no \'field.defaultValue\'', (t) => {
    const opts = `--config "${getFixturePath('/fields/overriddenDefaultValue2.js')}" --default-value ""`;

    exec(`${cli} -i "${getFixturePath('/json/overriddenDefaultValue.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.overriddenDefaultValue);
      t.end();
    });
  });

  // Quote

  testRunner.add('should use a custom quote when \'quote\' property is present', (t) => {
    const opts = '--fields carModel,price --quote "\'"';

    exec(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.withSimpleQuotes);
      t.end();
    });
  });

  testRunner.add('should be able to don\'t output quotes when setting \'quote\' to empty string', (t) => {
    const opts = '--fields carModel,price --quote ""';

    exec(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.withoutQuotes);
      t.end();
    });
  });

  testRunner.add('should escape quotes when setting \'quote\' property is present', (t) => {
    const opts = '--fields carModel,color --quote "\'"';

    exec(`${cli} -i "${getFixturePath('/json/escapeCustomQuotes.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
        t.equal(csv, csvFixtures.escapeCustomQuotes);
        t.end();
      });
  });

  testRunner.add('should not escape \'"\' when setting \'quote\' set to something else', (t) => {
    const opts = '--quote "\'"';

    exec(`${cli} -i "${getFixturePath('/json/escapedQuotes.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
        t.equal(csv, csvFixtures.escapedQuotesUnescaped);
        t.end();
      });
  });

  // Escaped Quote

  testRunner.add('should escape quotes with double quotes', (t) => {
    exec(`${cli} -i "${getFixturePath('/json/quotes.json')}"`, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.quotes);
      t.end();
    });
  });

  testRunner.add('should not escape quotes with double quotes, when there is a backslash in the end', (t) => {
    exec(`${cli} -i "${getFixturePath('/json/backslashAtEnd.json')}"`, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.backslashAtEnd);
      t.end();
    });
  });

  testRunner.add('should not escape quotes with double quotes, when there is a backslash in the end, and its not the last column', (t) => {
    exec(`${cli} -i "${getFixturePath('/json/backslashAtEndInMiddleColumn.json')}"`, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.backslashAtEndInMiddleColumn);
      t.end();
    });
  });

  testRunner.add('should escape quotes with value in \'escapedQuote\'', (t) => {
    const opts = '--fields "a string" --escaped-quote "*"';

    exec(`${cli} -i "${getFixturePath('/json/escapedQuotes.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.escapedQuotes);
      t.end();
    });
  });

  // Delimiter

  testRunner.add('should use a custom delimiter when \'delimiter\' property is defined', (t) => {
    const opts = '--fields carModel,price,color --delimiter "\t"';

    exec(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.tsv);
      t.end();
    });
  });

  testRunner.add('should remove last delimiter |@|', (t) => {
    const opts = '--delimiter "|@|"';

    exec(`${cli} -i "${getFixturePath('/json/delimiter.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.delimiter);
      t.end();
    });
  });

  // EOL

  testRunner.add('should use a custom eol character when \'eol\' property is present', (t) => {
    const opts = '--fields carModel,price,color --eol "\r\n"';

    exec(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.eol);
      t.end();
    });
  });

  // Excell

  testRunner.add('should format strings to force excel to view the values as strings', (t) => {
    const opts = '--fields carModel,price,color --excel-strings';

    exec(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.excelStrings);
      t.end();
    });
  });

  // Escaping and preserving values

  testRunner.add('should parse JSON values with trailing backslashes', (t) => {
    const opts = '--fields carModel,price,color';

    exec(`${cli} -i "${getFixturePath('/json/trailingBackslash.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.trailingBackslash);
      t.end();
    });
  });

  testRunner.add('should escape " when preceeded by \\', (t) => {
    exec(`${cli} -i "${getFixturePath('/json/escapeDoubleBackslashedEscapedQuote.json')}"`, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.escapeDoubleBackslashedEscapedQuote);
      t.end();
    });
  });

  testRunner.add('should preserve new lines in values', (t) => {
    const opts = '--eol "\r\n"';

    exec(`${cli} -i "${getFixturePath('/json/escapeEOL.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, [
      '"a string"',
      '"with a \u2028description\\n and\na new line"',
      '"with a \u2029\u2028description and\r\nanother new line"'
    ].join('\r\n'));
      t.end();
    });
  });

  testRunner.add('should preserve tabs in values', (t) => {
    exec(`${cli} -i "${getFixturePath('/json/escapeTab.json')}"`, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.escapeTab);
      t.end();
    });
  });

  // Header

  testRunner.add('should parse json to csv without column title', (t) => {
    const opts = '--fields carModel,price,color,transmission --no-header';

    exec(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.withoutHeader);
      t.end();
    });
  });

  // Include empty rows

  testRunner.add('should not include empty rows when options.includeEmptyRows is not specified', (t) => {
    exec(`${cli} -i "${getFixturePath('/json/emptyRow.json')}"`, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.emptyRowNotIncluded);
      t.end();
    });
  });

  testRunner.add('should include empty rows when options.includeEmptyRows is true', (t) => {
    const opts = '--include-empty-rows';

    exec(`${cli} -i "${getFixturePath('/json/emptyRow.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.emptyRow);
      t.end();
    });
  });

  testRunner.add('should include empty rows when options.includeEmptyRows is true, with default values', (t) => {
    const opts = `--config "${getFixturePath('/fields/emptyRowDefaultValues.json')}" --default-value NULL --include-empty-rows`;

    exec(`${cli} -i "${getFixturePath('/json/emptyRow.json')}" ${opts}`, (err, stdout, stderr) => {
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

  //   exec(cli + '-i input', (err, stdout, stderr) => {
  //     const csv = stdout;
  //     t.equal(csv, '"carModel","price","color"');
  //     t.end();
  //   });
  // });

  // BOM

  testRunner.add('should add BOM character', (t) => {
    const opts = '--fields carModel,price,color,transmission --with-bom';

    exec(`${cli} -i "${getFixturePath('/json/specialCharacters.json')}" ${opts}`, (err, stdout, stderr) => {
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
    const test = exec(cli, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.defaultStream);
      t.end();
    });

    test.stdin.write(JSON.stringify(jsonFixtures.default));
    test.stdin.end();
  });

  testRunner.add('should error if stdin data is not valid', (t) => {
    const test = exec(cli, (err, stdout, stderr) => {
      t.ok(stderr.includes('Invalid data received from stdin'));
      t.end();
    });

    test.stdin.write('{ "b": 1,');
    test.stdin.end();
  });

  testRunner.add('should get input from stdin with -s flag', (t) => {
    const test = exec(`${cli} -s`, (err, stdout, stderr) => {
      t.notOk(stderr); 
      const csv = stdout;
      t.equal(csv, csvFixtures.default + '\n'); // console.log append the new line
      t.end();
    });

    test.stdin.write(JSON.stringify(jsonFixtures.default));
    test.stdin.end();
  });

  testRunner.add('should error if stdin data is not valid with -s flag', (t) => {
    const test = exec(`${cli} -s`, (err, stdout, stderr) => {
      t.ok(stderr.includes('Invalid data received from stdin'));
      t.end();
    });

    test.stdin.write('{ "b": 1,');
    test.stdin.end();
  });

  // testRunner.add('should error if stdin fails', (t) => {
  //   const test = exec(cli, (err, stdout, stderr) => {
  //     t.ok(stderr.includes('Could not read from stdin'));
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
    const opts = `-o "${outputPath}" --fields carModel,price,color,transmission`;

    exec(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`, async (err, stdout, stderr) => {
      t.notOk(stderr);
      try {
       const csv = await readFileAsync(outputPath, 'utf-8');
       t.equal(csv, csvFixtures.default);
      } catch (err) {
        t.fail(err);
      }
      t.end();
    });
  });


  testRunner.add('should output to file without streaming', (t) => {
    const outputPath = getFixturePath('/results/default.csv');
    const opts = `-o ${outputPath} --fields carModel,price,color,transmission --no-streaming`;

    exec(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`, async (err, stdout, stderr) => {
      t.notOk(stderr);
      try {
       const csv = await readFileAsync(outputPath, 'utf-8');
       t.equal(csv, csvFixtures.default);
      } catch (err) {
        t.fail(err);
      }
      t.end();
    });
  });

  testRunner.add('should error on invalid output file path', (t) => {
    const outputPath = getFixturePath('/results2/default.csv');
    const opts = `-o "${outputPath}" --fields carModel,price,color,transmission`;

    exec(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`, (err, stdout, stderr) => {
      t.ok(stderr.includes('Invalid output file.'));
      t.end();
    });
  });

  testRunner.add('should error on invalid output file path without streaming', (t) => {
    const outputPath = getFixturePath('/results2/default.csv');
    const opts = `-o "${outputPath}" --fields carModel,price,color,transmission --no-streaming`;

    exec(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`, (err, stdout, stderr) => {
      t.ok(stderr.includes('Invalid output file.'));
      t.end();
    });
  });

  // Pretty print

  testRunner.add('should print pretty table', (t) => {
    const opts = '--pretty';

    exec(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.prettyprint);
      t.end();
    });
  });

  testRunner.add('should print pretty table without header', (t) => {
    const opts = '--no-header --pretty';

    exec(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.prettyprintWithoutHeader);
      t.end();
    });
  });

  testRunner.add('should print pretty table without streaming', (t) => {
    const opts = '--fields carModel,price,color --no-streaming --pretty ';

    exec(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.prettyprint);
      t.end();
    });
  });

  testRunner.add('should print pretty table without streaming and without header', (t) => {
    const opts = '--fields carModel,price,color --no-streaming --no-header --pretty ';

    exec(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.prettyprintWithoutHeader);
      t.end();
    });
  });

  testRunner.add('should print pretty table without rows', (t) => {
    const opts = '--fields fieldA,fieldB,fieldC --pretty';

    exec(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.prettyprintWithoutRows);
      t.end();
    });
  });

  // Preprocessing

  testRunner.add('should unwind all unwindable fields using the unwind transform', (t) => {
    const opts = '--fields carModel,price,extras.items.name,extras.items.color,extras.items.items.position,extras.items.items.color'
      + ' --unwind';

    exec(`${cli} -i "${getFixturePath('/json/unwind2.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.unwind2);
      t.end();
    });
  });

  testRunner.add('should support unwinding specific fields using the unwind transform', (t) => {
    const opts = '--unwind colors';

    exec(`${cli} -i "${getFixturePath('/json/unwind.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.unwind);
      t.end();
    });
  });

  testRunner.add('should support multi-level unwind using the unwind transform', (t) => {
    const opts = '--fields carModel,price,extras.items.name,extras.items.color,extras.items.items.position,extras.items.items.color'
      + ' --unwind extras.items,extras.items.items';

    exec(`${cli} -i "${getFixturePath('/json/unwind2.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.unwind2);
      t.end();
    });
  });

  testRunner.add('hould unwind and blank out repeated data', (t) => {
    const opts = '--fields carModel,price,extras.items.name,extras.items.color,extras.items.items.position,extras.items.items.color'
      + ' --unwind extras.items,extras.items.items --unwind-blank';

    exec(`${cli} -i "${getFixturePath('/json/unwind2.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.unwind2Blank);
      t.end();
    });
  });

  testRunner.add('should support flattening deep JSON using the flatten transform', (t) => {
    const opts = '--flatten-objects';

    exec(`${cli} -i "${getFixturePath('/json/deepJSON.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.flattenedDeepJSON);
      t.end();
    });
  });

  testRunner.add('should support flattening JSON with nested arrays using the flatten transform', (t) => {
    const opts = '--flatten-objects --flatten-arrays';

    exec(`${cli} -i "${getFixturePath('/json/flattenArrays.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.flattenedArrays);
      t.end();
    });
  });

  testRunner.add('should support custom flatten separator using the flatten transform', (t) => {
    const opts = '--flatten-objects --flatten-separator __';

    exec(`${cli} -i "${getFixturePath('/json/deepJSON.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.flattenedCustomSeparatorDeepJSON);
      t.end();
    });
  });

  testRunner.add('should support multiple transforms and honor the order in which they are declared', (t) => {
    const opts = '--unwind items --flatten-objects';

    exec(`${cli} -i "${getFixturePath('/json/unwindAndFlatten.json')}" ${opts}`, (err, stdout, stderr) => {
      t.notOk(stderr);
      const csv = stdout;
      t.equal(csv, csvFixtures.unwindAndFlatten);
      t.end();
    });
  });
};
