.PHONY: lib dist

lib:
	rm -rf lib
	mkdir lib
	npm run babel
	mv lib/src/* lib/
	rm -r lib/src
	@echo "✓ Built lib"

dist:
	rm -rf dist
	mkdir dist
	make lib
	npm run browserify
	npm run uglify
	@echo "✓ Built dist"
