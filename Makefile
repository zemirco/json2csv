test:
	mocha --reporter spec --compilers coffee:coffee-script
	
.PHONY: test