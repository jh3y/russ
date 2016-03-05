PHONY: help
WATCH = @./node_modules/.bin/watch

$npm = @./node_modules/.bin

help:
	@grep -E '^[a-zA-Z\._-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## sets up project
	npm install

build.native: ## uses coffee CLI compiler
	cat src/coffee/*/*.coffee src/coffee/*.coffee | coffee -c --stdio > public/js/bolt.js

build.scripts: ## build project scripts
	node tasks/scripts.js

watch.scripts: ## watch script files for changes and compile
	$(WATCH) "make build.scripts" src/coffee

watch.coffee: ## watches coffeescript files and compiles on change
	node ./tasks/watch -d src/coffee -e "make build.scripts" -n Coffee

watch.module: ## watches direct module
	node ./tasks/watch -d src/coffee -c scripts.js -n CoffeeScript

server.start: ## starts instance of browsersync
	node ./tasks/serve

watch: ## watches sources
	make watch.module

dev: ## start development
	make watch & make server.start

clean: ## remove built files
	rm -rf public
