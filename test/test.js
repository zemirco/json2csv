var should = require('should'),
    json2csv = require('.././lib/json2csv'),
    fs = require('fs'),
    async = require('async');

var _in = require('./fixtures/in'),
    _in_quotes = require('./fixtures/in-quotes'),
    _out = '',
    _out_quotes = '',
    _out_selected = '',
    _out_reversed = '',
    _out_tsv = '',
    _out_fieldNames = '';

describe('json2csv', function() {
  
  before(function(done) {
    async.parallel([
        function(callback){
          fs.readFile('test/fixtures/out.csv', function(err, data) {
            if (err) callback(err);
            _out = data.toString();
            callback(null);
          });
        },
        function(callback){
          fs.readFile('test/fixtures/out-quotes.csv', function(err, data) {
            if (err) callback(err);
            _out_quotes = data.toString();
            callback(null);
          });
        },
        function(callback){
          fs.readFile('test/fixtures/out-selected.csv', function(err, data) {
            if (err) callback(err);
            _out_selected = data.toString();
            callback(null);
          });
        },
        function(callback){
          fs.readFile('test/fixtures/out-reversed.csv', function(err, data) {
            if (err) callback(err);
            _out_reversed = data.toString();
            callback(null);
          });
        },
        function(callback){
          fs.readFile('test/fixtures/out.tsv', function(err, data) {
            if (err) callback(err);
            _out_tsv = data.toString();
            callback(null);
          });
        },
        function(callback){
          fs.readFile('test/fixtures/out-fieldNames.csv', function(err, data){
            if (err) callback(err);
            _out_fieldNames = data.toString();
            callback(null);
          });
        }
      ],
      function(err, results) {
        if (err) console.log(err);
        done();
      }
    );
  });
  
  it('should parse json to csv', function(done) {
    json2csv({data: _in, fields: ['carModel', 'price', 'color']}, function(csv) {
      csv.should.equal(_out);
      done();
    })
  });
  
  it('should throw an error if field is not a key in the json data', function(done) {
    (function() {json2csv({
      data: _in, 
      fields: ['carModel', 'location', 'color']});
    }).should.throwError('Cannot find location as a json key');
    done();
  });
  
  it('should output only selected fields', function(done) {
    json2csv({data: _in, fields: ['carModel', 'price']}, function(csv) {
      csv.should.equal(_out_selected);
      done();
    })
  });
        
  it('should output reversed order', function(done) {
    json2csv({data: _in, fields: ['price', 'carModel']}, function(csv) {
      csv.should.equal(_out_reversed);
      done();
    })
  });
  
  it('should output a string', function(done) {
    json2csv({data: _in, fields: ['carModel', 'price', 'color']}, function(csv) {
      csv.should.be.a('string');
      done();
    })
  });
    
  it('should escape quotes with double quotes', function(done) {
    json2csv({data: _in_quotes, fields: ['a string']}, function(csv) {
      csv.should.equal(_out_quotes);
      done();
    })
  });

  it('should use a custom delimiter when \'del\' property is present', function(done) {
    json2csv({data: _in, fields: ['carModel', 'price', 'color'], del:'\t'}, function(csv) {
      csv.should.equal(_out_tsv);
      done();
    })
  })
  
  it('should name columns as specified in \'fieldNames\' property', function(done) {
    json2csv({data: _in, fields: ['carModel', 'price'], fieldNames: ['Car Model', 'Price USD']}, function(csv) {
      csv.should.equal(_out_fieldNames);
      done();
    })
  })
    
});
