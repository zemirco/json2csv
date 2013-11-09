test:
	./node_modules/.bin/mocha --reporter spec

format:
	js-beautify lib/json2csv.js -r --config js-beautify.json 
	
.PHONY: test
