'use strict';

const { mkdir, rm, readFile } = require('fs').promises;
const { join: joinPath } = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

const cli = `node "${joinPath(process.cwd(), './bin/json2csv.js')}"`;

const resultsPath = './test/fixtures/results';
const getFixturePath = fixture => joinPath('./test/fixtures', fixture);

module.exports = (testRunner, jsonFixtures, csvFixtures) => {
  testRunner.addBefore(async () => {
    try {
      await mkdir(resultsPath);
    } catch(err) {
      if (err.code !== 'EEXIST') throw err;
    }
  });

  testRunner.addAfter(async () => {
    rm(resultsPath, { recursive: true });
  });

  testRunner.add('should handle ndjson', async (t) => {
    const opts = '--fields carModel,price,color,manual --ndjson';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/ndjson.json')}" ${opts}`);

    t.equal(csv, csvFixtures.ndjson);
  });

  testRunner.add('should error on invalid ndjson input path without streaming', async (t) => {
    const opts = '--fields carModel,price,color,manual --ndjson --no-streaming';
    
    try {
      await execAsync(`${cli} -i "${getFixturePath('/json2/ndjsonInvalid.json')}" ${opts}`);

      t.fail('Exception expected.');  
    } catch (err) {
      t.ok(err.message.includes('Invalid input file.'));
    }
  });

  testRunner.add('should error on invalid ndjson input data', async (t) => {
    const opts = '--fields carModel,price,color,manual --ndjson';

    try {
      await execAsync(`${cli} -i "${getFixturePath('/json/ndjsonInvalid.json')}" ${opts}`);

      t.fail('Exception expected.');  
    } catch (err) {
      t.ok(err.message.includes('Unexpected SEPARATOR ("\\n") in state COMMA'));
    }
  });

  testRunner.add('should handle ndjson without streaming', async (t) => {
    const opts = '--fields carModel,price,color,manual --ndjson --no-streaming';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/ndjson.json')}" ${opts}`);

    t.equal(csv, csvFixtures.ndjson + '\n'); // console.log append the new line
  });

  testRunner.add('should error on invalid input file path', async (t) => {
    try {
      await execAsync(`${cli} -i "${getFixturePath('/json2/default.json')}"`);

      t.fail('Exception expected.');  
    } catch (err) {
      t.ok(err.message.includes('Invalid input file.'));
    }
  });

  testRunner.add('should error on invalid input file path without streaming', async (t) => {
    const opts = '--no-streaming';

    try {
      await execAsync(`${cli} -i "${getFixturePath('/json2/default.json')}" ${opts}`);

      t.fail('Exception expected.');  
    } catch (err) {
      t.ok(err.message.includes('Invalid input file.'));
    }
  });

  testRunner.add('should error if input data is not an object', async (t) => {
    try {
      await execAsync(`${cli} -i "${getFixturePath('/json2/notAnObject.json')}"`);

      t.fail('Exception expected.');  
    } catch (err) {
      t.ok(err.message.includes('Invalid input file.'));
    }
  });

  testRunner.add('should handle empty object', async (t) => {
    const opts = '--fields carModel,price,color';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/emptyObject.json')}" ${opts}`);

    t.equal(csv, csvFixtures.emptyObject);
  });

  testRunner.add('should handle deep JSON objects', async (t) => {
    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/deepJSON.json')}"`);

    t.equal(csv, csvFixtures.deepJSON);
  });

  testRunner.add('should handle deep JSON objects without streaming', async (t) => {
    const opts = '--no-streaming';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/deepJSON.json')}" ${opts}`);

    t.equal(csv, csvFixtures.deepJSON + '\n'); // console.log append the new line
  });

  testRunner.add('should parse json to csv and infer the fields automatically ', async (t) => {
    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/default.json')}"`);

    t.equal(csv, csvFixtures.defaultStream);
  });

  testRunner.add('should error on invalid fields config file path', async (t) => {
    const opts = `--config "${getFixturePath('/fields2/fieldNames.json')}"`;

    try {
      await execAsync(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`);

      t.fail('Exception expected.');  
    } catch (err) {
      t.ok(err.message.includes('Invalid config file.'));
    }
  });

  testRunner.add('should parse json to csv using custom fields', async (t) => {
    const opts = '--fields carModel,price,color,manual';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`);
  
    t.equal(csv, csvFixtures.default);
  });

  testRunner.add('should output only selected fields', async (t) => {
    const opts = '--fields carModel,price';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`);
  
    t.equal(csv, csvFixtures.selected);
  });

  testRunner.add('should output fields in the order provided', async (t) => {
    const opts = '--fields price,carModel';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`);

    t.equal(csv, csvFixtures.reversed);
  });

  testRunner.add('should output empty value for non-existing fields', async (t) => {
    const opts = '--fields "first not exist field",carModel,price,"not exist field",color';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`);

    t.equal(csv, csvFixtures.withNotExistField);
  });

  testRunner.add('should name columns as specified in \'fields\' property', async (t) => {
    const opts = `--config "${getFixturePath('/fields/fieldNames.json')}"`;

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`);

    t.equal(csv, csvFixtures.fieldNames);
  });

  testRunner.add('should support nested properties selectors', async (t) => {
    const opts = `--config "${getFixturePath('/fields/nested.json')}"`;

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/nested.json')}" ${opts}`);

    t.equal(csv, csvFixtures.nested);
  });

  testRunner.add('field.value function should receive a valid field object', async (t) => {
    const opts = `--config "${getFixturePath('/fields/functionWithCheck.js')}"`;

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/functionStringifyByDefault.json')}" ${opts}`);

    t.equal(csv, csvFixtures.functionStringifyByDefault);
  });

  testRunner.add('field.value function should stringify results by default', async (t) => {
    const opts = `--config "${getFixturePath('/fields/functionStringifyByDefault.js')}"`;

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/functionStringifyByDefault.json')}" ${opts}`);

    t.equal(csv, csvFixtures.functionStringifyByDefault);
  });

  testRunner.add('should process different combinations in fields option', async (t) => {
    const opts = `--config "${getFixturePath('/fields/fancyfields.js')}" --default-value NULL`;

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/fancyfields.json')}" ${opts}`);

    t.equal(csv, csvFixtures.fancyfields);
  });

  // Default value

  testRunner.add('should output the default value as set in \'defaultValue\'', async (t) => {
    const opts = '--fields carModel,price --default-value ""';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/defaultValueEmpty.json')}" ${opts}`);

    t.equal(csv, csvFixtures.defaultValueEmpty);
  });

  testRunner.add('should override \'options.defaultValue\' with \'field.defaultValue\'', async (t) => {
    const opts = `--config "${getFixturePath('/fields/overriddenDefaultValue.json')}" --default-value ""`;

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/overriddenDefaultValue.json')}" ${opts}`);

    t.equal(csv, csvFixtures.overriddenDefaultValue);
  });

  testRunner.add('should use \'options.defaultValue\' when no \'field.defaultValue\'', async (t) => {
    const opts = `--config "${getFixturePath('/fields/overriddenDefaultValue2.js')}" --default-value ""`;

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/overriddenDefaultValue.json')}" ${opts}`);

    t.equal(csv, csvFixtures.overriddenDefaultValue);
  });

  // Delimiter

  testRunner.add('should use a custom delimiter when \'delimiter\' property is defined', async (t) => {
    const opts = '--fields carModel,price,color --delimiter "\t"';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`);

    t.equal(csv, csvFixtures.tsv);
  });

  testRunner.add('should remove last delimiter |@|', async (t) => {
    const opts = '--delimiter "|@|"';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/delimiter.json')}" ${opts}`);

    t.equal(csv, csvFixtures.delimiter);
  });

  // EOL

  testRunner.add('should use a custom eol character when \'eol\' property is present', async (t) => {
    const opts = '--fields carModel,price,color --eol "\r\n"';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`);
 
    t.equal(csv, csvFixtures.eol);
  });

  // Header

  testRunner.add('should parse json to csv without column title', async (t) => {
    const opts = '--fields carModel,price,color,manual --no-header';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`);

    t.equal(csv, csvFixtures.withoutHeader);
  });

  // Include empty rows

  testRunner.add('should not include empty rows when options.includeEmptyRows is not specified', async (t) => {
    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/emptyRow.json')}"`);

    t.equal(csv, csvFixtures.emptyRowNotIncluded);
  });

  testRunner.add('should include empty rows when options.includeEmptyRows is true', async (t) => {
    const opts = '--include-empty-rows';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/emptyRow.json')}" ${opts}`);

    t.equal(csv, csvFixtures.emptyRow);
  });

  testRunner.add('should include empty rows when options.includeEmptyRows is true, with default values', async (t) => {
    const opts = `--config "${getFixturePath('/fields/emptyRowDefaultValues.json')}" --default-value NULL --include-empty-rows`;

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/emptyRow.json')}" ${opts}`);

    t.equal(csv, csvFixtures.emptyRowDefaultValues);
  });

  testRunner.add('should parse data:[null] to csv with only column title, despite options.includeEmptyRows', async (t) => {
    const opts = '--fields carModel,price,color --include-empty-rows';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/arrayWithNull.json')}" ${opts}`);

    t.equal(csv, csvFixtures.emptyObject);
  });

  // BOM

  testRunner.add('should add BOM character', async (t) => {
    const opts = '--fields carModel,price,color,manual --with-bom';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/specialCharacters.json')}" ${opts}`);

    // Compare csv length to check if the BOM character is present
    t.equal(csv[0], '\ufeff');
    t.equal(csv.length, csvFixtures.default.length + 1);
    t.equal(csv.length, csvFixtures.withBOM.length);
  });

  // Get input from stdin

  testRunner.add('should get input from stdin and process as stream', async (t) => {
    const execution = execAsync(cli);

    execution.child.stdin.write(JSON.stringify(jsonFixtures.default()));
    execution.child.stdin.end();

    const { stdout: csv } = await execution;
    
    t.equal(csv, csvFixtures.defaultStream);
  });

  testRunner.add('should error if stdin data is not valid', async (t) => {
    const execution = execAsync(cli);

    execution.child.stdin.write('{ "b": 1,');
    execution.child.stdin.end();

    try {
      await execution;

      t.fail('Exception expected.');  
    } catch (err) {
      t.ok(err.message.includes('Error: Parser ended in mid-parsing (state: KEY). Either not all the data was received or the data was invalid.'));
    }
  });

  testRunner.add('should get input from stdin with -s flag', async (t) => {
    const execution = execAsync(`${cli} -s`);

    execution.child.stdin.write(JSON.stringify(jsonFixtures.default()));
    execution.child.stdin.end();

    const { stdout: csv } = await execution;
    
    t.equal(csv, csvFixtures.default + '\n'); // console.log append the new line
  });

  testRunner.add('should error if stdin data is not valid with -s flag', async (t) => {
    const execution = execAsync(`${cli} -s`);

    execution.child.stdin.write('{ "b": 1,');
    execution.child.stdin.end();

    try {
      await execution;

      t.fail('Exception expected.');  
    } catch (err) {
      t.ok(err.message.includes('Invalid data received from stdin'));
    }
  });

  testRunner.add('should error if stdin fails', async (t) => {
    const execution = execAsync(cli);

    // TODO Figure out how to make the stdin to error
    execution.child.stdin._read = execution.child.stdin._write = () => {};
    execution.child.stdin.on('error', () => {});
    execution.child.stdin.destroy(new Error('Test error'));

    try {
      await execution;

      t.fail('Exception expected.');  
    } catch (err) {
      // TODO error message seems wrong
      t.ok(err.message.includes('Data should not be empty or the "fields" option should be included'));
    }
  });

  // Put output to file

  testRunner.add('should output to file', async (t) => {
    const outputPath = getFixturePath('/results/default.csv');
    const opts = `-o "${outputPath}" --fields carModel,price,color,manual`;

    await execAsync(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`);

    const csv = await readFile(outputPath, 'utf-8');
    t.equal(csv, csvFixtures.default);
  });

  testRunner.add('should output to file without streaming', async (t) => {
    const outputPath = getFixturePath('/results/default.csv');
    const opts = `-o ${outputPath} --fields carModel,price,color,manual --no-streaming`;

    await execAsync(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`);

    const csv = await readFile(outputPath, 'utf-8');
    t.equal(csv, csvFixtures.default);
  });

  testRunner.add('should error on invalid output file path', async (t) => {
    const outputPath = getFixturePath('/results2/default.csv');
    const opts = `-o "${outputPath}" --fields carModel,price,color,manual`;

    try{
      await execAsync(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`);
    } catch (err) {
      t.ok(err.message.includes('Invalid output file.'));
    }
  });

  testRunner.add('should error on invalid output file path without streaming', async (t) => {
    const outputPath = getFixturePath('/results2/default.csv');
    const opts = `-o "${outputPath}" --fields carModel,price,color,manual --no-streaming`;

    try {
      await execAsync(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`);
    } catch (err) {
      t.ok(err.message.includes('Invalid output file.'));
    }
  });

  // Pretty print

  testRunner.add('should print pretty table', async (t) => {
    const opts = '--pretty';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`);

    t.equal(csv, csvFixtures.prettyprint);
  });

  testRunner.add('should print pretty table without header', async (t) => {
    const opts = '--no-header --pretty';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`);

    t.equal(csv, csvFixtures.prettyprintWithoutHeader);
  });

  testRunner.add('should print pretty table without streaming', async (t) => {
    const opts = '--fields carModel,price,color --no-streaming --pretty ';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`);

    t.equal(csv, csvFixtures.prettyprint);
  });

  testRunner.add('should print pretty table without streaming and without header', async (t) => {
    const opts = '--fields carModel,price,color --no-streaming --no-header --pretty ';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`);

    t.equal(csv, csvFixtures.prettyprintWithoutHeader);
  });

  testRunner.add('should print pretty table without rows', async (t) => {
    const opts = '--fields fieldA,fieldB,fieldC --pretty';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`);

    t.equal(csv, csvFixtures.prettyprintWithoutRows);
  });

  // Preprocessing

  testRunner.add('should unwind all unwindable fields using the unwind transform', async (t) => {
    const opts = '--fields carModel,price,extras.items.name,extras.items.color,extras.items.items.position,extras.items.items.color'
      + ' --unwind';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/unwind2.json')}" ${opts}`);

    t.equal(csv, csvFixtures.unwind2);
  });

  testRunner.add('should support unwinding specific fields using the unwind transform', async (t) => {
    const opts = '--unwind colors';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/unwind.json')}" ${opts}`);

    t.equal(csv, csvFixtures.unwind);
  });

  testRunner.add('should support multi-level unwind using the unwind transform', async (t) => {
    const opts = '--fields carModel,price,extras.items.name,extras.items.color,extras.items.items.position,extras.items.items.color'
      + ' --unwind extras.items,extras.items.items';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/unwind2.json')}" ${opts}`);

    t.equal(csv, csvFixtures.unwind2);
  });

  testRunner.add('hould unwind and blank out repeated data', async (t) => {
    const opts = '--fields carModel,price,extras.items.name,extras.items.color,extras.items.items.position,extras.items.items.color'
      + ' --unwind extras.items,extras.items.items --unwind-blank';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/unwind2.json')}" ${opts}`);

    t.equal(csv, csvFixtures.unwind2Blank);
  });

  testRunner.add('should support flattening deep JSON using the flatten transform', async (t) => {
    const opts = '--flatten-objects';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/deepJSON.json')}" ${opts}`);

    t.equal(csv, csvFixtures.flattenedDeepJSON);
  });

  testRunner.add('should support flattening JSON with nested arrays using the flatten transform', async (t) => {
    const opts = '--flatten-objects --flatten-arrays';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/flattenArrays.json')}" ${opts}`);
 
    t.equal(csv, csvFixtures.flattenedArrays);
  });

  testRunner.add('should support custom flatten separator using the flatten transform', async (t) => {
    const opts = '--flatten-objects --flatten-separator __';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/deepJSON.json')}" ${opts}`);
 
    t.equal(csv, csvFixtures.flattenedCustomSeparatorDeepJSON);
  });

  testRunner.add('should support multiple transforms and honor the order in which they are declared', async (t) => {
    const opts = '--unwind items --flatten-objects';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/unwindAndFlatten.json')}" ${opts}`);
 
    t.equal(csv, csvFixtures.unwindAndFlatten);
  });


  testRunner.add('should unwind complex objects using the unwind transform', async (t) => {
    const opts = '--fields carModel,price,extras.items.name,extras.items.items.position,extras.items.items.color,extras.items.color'
      + ' --unwind extras.items,extras.items.items --flatten-objects --flatten-arrays';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/unwindComplexObject.json')}" ${opts}`);
 
    t.equal(csv, csvFixtures.unwindComplexObject);
  });

  // Formatters

  // String Quote

  testRunner.add('should use a custom quote when \'quote\' property is present', async (t) => {
    const opts = '--fields carModel,price --quote "\'"';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`);
 
    t.equal(csv, csvFixtures.withSimpleQuotes);
  });

  testRunner.add('should be able to don\'t output quotes when setting \'quote\' to empty string', async (t) => {
    const opts = '--fields carModel,price --quote ""';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`);
 
    t.equal(csv, csvFixtures.withoutQuotes);
  });

  testRunner.add('should escape quotes when setting \'quote\' property is present', async (t) => {
    const opts = '--fields carModel,color --quote "\'"';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/escapeCustomQuotes.json')}" ${opts}`);
    t.equal(csv, csvFixtures.escapeCustomQuotes);
  });

  testRunner.add('should not escape \'"\' when setting \'quote\' set to something else', async (t) => {
    const opts = '--quote "\'"';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/escapedQuotes.json')}" ${opts}`);
        t.equal(csv, csvFixtures.escapedQuotesUnescaped);
  });

  // String Escaped Quote

  testRunner.add('should escape quotes with double quotes', async (t) => {
    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/quotes.json')}"`);
 
    t.equal(csv, csvFixtures.quotes);
  });

  testRunner.add('should not escape quotes with double quotes, when there is a backslash in the end', async (t) => {
    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/backslashAtEnd.json')}"`);
 
    t.equal(csv, csvFixtures.backslashAtEnd);
  });

  testRunner.add('should not escape quotes with double quotes, when there is a backslash in the end, and its not the last column', async (t) => {
    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/backslashAtEndInMiddleColumn.json')}"`);
 
    t.equal(csv, csvFixtures.backslashAtEndInMiddleColumn);
  });

  testRunner.add('should escape quotes with value in \'escapedQuote\'', async (t) => {
    const opts = '--fields "a string" --escaped-quote "*"';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/escapedQuotes.json')}" ${opts}`);
 
    t.equal(csv, csvFixtures.escapedQuotes);
  });

  // String Excel

  testRunner.add('should format strings to force excel to view the values as strings', async (t) => {
    const opts = '--fields carModel,price,color --excel-strings';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/default.json')}" ${opts}`);
 
    t.equal(csv, csvFixtures.excelStrings);
  });

  testRunner.add('should format strings to force excel to view the values as strings with escaped quotes', async (t) => {
    const opts = '--excel-strings';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/quotes.json')}" ${opts}`);
 
    t.equal(csv, csvFixtures.excelStringsWithEscapedQuoted);
  });

  // String Escaping and preserving values

  testRunner.add('should parse JSON values with trailing backslashes', async (t) => {
    const opts = '--fields carModel,price,color';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/trailingBackslash.json')}" ${opts}`);
 
    t.equal(csv, csvFixtures.trailingBackslash);
  });

  testRunner.add('should escape " when preceeded by \\', async (t) => {
    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/escapeDoubleBackslashedEscapedQuote.json')}"`);
 
    t.equal(csv, csvFixtures.escapeDoubleBackslashedEscapedQuote);
  });

  testRunner.add('should preserve new lines in values', async (t) => {
    const opts = '--eol "\r\n"';

    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/escapeEOL.json')}" ${opts}`);
 
    t.equal(csv, [
      '"a string"',
      '"with a \u2028description\\n and\na new line"',
      '"with a \u2029\u2028description and\r\nanother new line"'
    ].join('\r\n'));
  });

  testRunner.add('should preserve tabs in values', async (t) => {
    const { stdout: csv } = await execAsync(`${cli} -i "${getFixturePath('/json/escapeTab.json')}"`);
 
    t.equal(csv, csvFixtures.escapeTab);
  });
};
