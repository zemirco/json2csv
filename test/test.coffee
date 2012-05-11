should = require 'should'
json2csv = require '.././lib/json2csv'

describe 'parse', ->
  
  fromMongo = [
    { "carModel" : "Audi",      "price" : 10000,  "color" : "blue" }
    { "carModel" : "BMW",       "price" : 15000,  "color" : "red" }
    { "carModel" : "Mercedes",  "price" : 20000,  "color" : "yellow" }
    { "carModel" : "Porsche",   "price" : 30000,  "color" : "green" }
  ]

  result = 'carModel,price,color\r\n"Audi",10000,"blue"\r\n"BMW",15000,"red"\r\n"Mercedes",20000,"yellow"\r\n"Porsche",30000,"green"'
    
  it 'should parse csv from json', ->
    result.should.equal json2csv.parse
      data: fromMongo
      fields: ['carModel', 'price', 'color']
      
  it 'should throw an error if field is not a key in the json data', () ->
    json2csv.parse({data: fromMongo, fields: ['carModel', 'location', 'color']}).should.throw()
          
  result_selected = 'carModel,price\r\n"Audi",10000\r\n"BMW",15000\r\n"Mercedes",20000\r\n"Porsche",30000'
      
  it 'should output only selected fields', ->
    result_selected.should.equal json2csv.parse
      data: fromMongo
      fields: ['carModel', 'price']
      
  result_reversed = 'price,carModel\r\n10000,"Audi"\r\n15000,"BMW"\r\n20000,"Mercedes"\r\n30000,"Porsche"'
      
  it 'should output reversed order', ->
    result_reversed.should.equal json2csv.parse
      data: fromMongo
      fields: ['price', 'carModel']
    
  it 'result should be a string', ->
    json2csv.parse({data: fromMongo, fields: ['carModel', 'price', 'color']}).should.be.a('string')