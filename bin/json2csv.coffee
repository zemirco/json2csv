#!/usr/bin/env coffee
"use strict"

fs = require "fs"
json2csv = require "../lib/json2csv"

filename = process.argv[2]
data = require filename
fields = process.argv.slice 3

console.log data
console.log fields

if not fields.length
  fields = Object.keys data[0]

csv = json2csv.parse
  data: data
  fields: fields

console.log csv
