var should = require('should'),
    json2csv = require('.././lib/json2csv'),
    fs = require('fs'),
    async = require('async');

var _in = require('./fixtures/in'),
    _in_quotes = require('./fixtures/in-quotes'),
    _out = '',
    _out_quotes = '',
    _out_selected = '',
    _out_reversed = '';

describe('json2csv.parse', function() {
  
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
        }
      ],
      function(err, results) {
        if (err) console.log(err);
        done();
      }
    );
  });
  
  it('should parse json to csv', function(done) {
    _out.should.equal(json2csv.parse({
      data: _in,
      fields: ['carModel', 'price', 'color']
    }));
    done();
  });
  
  it('should throw an error if field is not a key in the json data', function(done) {
    (function() {
      json2csv.parse({data: _in, fields: ['carModel', 'location', 'color']});
    }).should.throwError();
    done();
  });
  
  it('should output only selected fields', function(done) {
    _out_selected.should.equal(json2csv.parse({
      data: _in,
      fields: ['carModel', 'price']
    }));
    done();
  });
        
  it('should output reversed order', function(done) {
    _out_reversed.should.equal(json2csv.parse({
      data: _in,
      fields: ['price', 'carModel']
    }));
    done();
  });
  
  it('should output a string', function(done) {
    json2csv.parse({data: _in, fields: ['carModel', 'price', 'color']}).should.be.a('string');
    done();
  });
    
  it('should escape quotes with double quotes', function(done) {
    (json2csv.parse({data: _in_quotes, fields: ['a string']}))
      .should
      .equal(_out_quotes);
    done();
  });
    
});
