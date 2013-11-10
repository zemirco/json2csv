test:
	./node_modules/.bin/mocha --reporter spec

format:
	node ./node_modules/js-beautify/js/bin/js-beautify.js lib/json2csv.js test/test.js package.json -r --config js-beautify.json 
	
.PHONY: test

